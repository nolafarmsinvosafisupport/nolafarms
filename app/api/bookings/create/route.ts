import { bookingSchema, requireDb, parseJsonBody, dbErrorResponse } from '@/lib/api-utils';
import { getCurrentUserId } from '@/lib/auth';
import { getDb, ensureMigrated, nextReferenceNumber } from '@/lib/db';
import { minimumVisitDate } from '@/lib/booking-utils';
import { sendBookingReceivedEmails } from '@/lib/email';
import { notifyAdmins } from '@/lib/admin-notify';
import { isRateLimited } from '@/lib/rate-limit';
import type { Booking } from '@/lib/booking-types';

async function generateBookingReference(sql: ReturnType<typeof getDb>): Promise<string> {
  const year = new Date().getFullYear();
  const seqNum = await nextReferenceNumber(sql, `bookings-${year}`);
  return `NF-${year}-${String(seqNum).padStart(4, '0')}`;
}

export async function POST(request: Request) {
  const setup = requireDb('Booking submissions');
  if (setup) return setup;
  await ensureMigrated();

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(`booking:${ip}`, 5, 10 * 60 * 1000)) {
    return Response.json({ success: false, message: 'Too many requests. Please try again in a few minutes.' }, { status: 429 });
  }

  const { data: rawBody, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = bookingSchema.safeParse(rawBody);
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.visit_date < minimumVisitDate()) {
    return Response.json({ success: false, message: 'Please choose a date at least 24 hours from today.' }, { status: 400 });
  }

  const sql = getDb();

  const [blocked] = await sql`SELECT id FROM blocked_dates WHERE date = ${parsed.data.visit_date}`;
  if (blocked) return Response.json({ success: false, message: 'That date is unavailable.' }, { status: 409 });

  const [confirmed] = await sql`SELECT id FROM bookings WHERE visit_date = ${parsed.data.visit_date} AND status = 'confirmed'`;
  if (confirmed) return Response.json({ success: false, message: 'That date already has a confirmed visit.' }, { status: 409 });

  const userId = await getCurrentUserId();
  const d = parsed.data;

  try {
    const reference = await generateBookingReference(sql);

    const [booking] = await sql<Booking[]>`
      INSERT INTO bookings (reference, user_id, full_name, phone_number, email, visit_date, visit_time, group_size, purpose, special_requests, status)
      VALUES (${reference}, ${userId ?? null}, ${d.full_name}, ${d.phone_number}, ${d.email}, ${d.visit_date}, ${d.visit_time}, ${d.group_size}, ${d.purpose}, ${d.special_requests ?? null}, 'pending')
      RETURNING *
    `;

    // Create a pre-read notification (user sees the confirmation page immediately)
    if (userId) {
      await sql`
        INSERT INTO notifications (user_id, booking_id, type, title, message, read)
        VALUES (${userId}, ${booking.id}, 'submitted',
          ${'Booking Request Submitted'},
          ${`Your visit request for ${booking.visit_date} (Ref: ${reference}) has been submitted and is awaiting confirmation.`},
          TRUE)
      `;
    }

    // Notify every admin — this was previously missing, so bookings never showed up as an
    // admin notification the way orders already did. Mirrors app/api/orders/route.ts.
    notifyAdmins(sql, {
      type: 'submitted',
      title: `New Booking ${reference}`,
      message: `Visit request from ${d.full_name} for ${booking.visit_date}. Phone: ${d.phone_number}`,
      bookingId: booking.id,
    }).catch(() => undefined);

    // Fire-and-forget: the booking is already committed above. If Resend is down or
    // rate-limited, the visitor must NOT be told their booking failed — otherwise they
    // re-submit and we get duplicates. Mirrors the pattern in app/api/orders/route.ts.
    sendBookingReceivedEmails(booking).catch((err) => {
      console.error('Booking email failed (booking was still saved):', booking.reference, err);
    });

    return Response.json({ success: true, booking });
  } catch (e) {
    return dbErrorResponse(e, 'Could not submit your booking. Please try again.');
  }
}
