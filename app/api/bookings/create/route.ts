import { bookingSchema, requireDb } from '@/lib/api-utils';
import { getCurrentUserId } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { minimumVisitDate } from '@/lib/booking-utils';
import { sendBookingReceivedEmails } from '@/lib/email';
import type { Booking } from '@/lib/booking-types';

async function generateBookingReference(sql: ReturnType<typeof getDb>): Promise<string> {
  const year = new Date().getFullYear();
  const [{ count }] = await sql<[{ count: number }]>`
    SELECT COUNT(*)::int AS count FROM bookings
    WHERE created_at >= ${`${year}-01-01T00:00:00.000Z`}
      AND created_at <  ${`${year + 1}-01-01T00:00:00.000Z`}
  `;
  return `NF-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`;
}

export async function POST(request: Request) {
  const setup = requireDb('Booking submissions');
  if (setup) return setup;

  const parsed = bookingSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.visit_date < minimumVisitDate()) {
    return Response.json({ success: false, message: 'Please choose a date at least 24 hours from today.' }, { status: 400 });
  }

  const sql = getDb();

  const [blocked] = await sql`SELECT id FROM blocked_dates WHERE date = ${parsed.data.visit_date}`;
  if (blocked) return Response.json({ success: false, message: 'That date is unavailable.' }, { status: 409 });

  const [confirmed] = await sql`SELECT id FROM bookings WHERE visit_date = ${parsed.data.visit_date} AND status = 'confirmed'`;
  if (confirmed) return Response.json({ success: false, message: 'That date already has a confirmed visit.' }, { status: 409 });

  const reference = await generateBookingReference(sql);
  const userId = await getCurrentUserId();
  const d = parsed.data;

  const [booking] = await sql<Booking[]>`
    INSERT INTO bookings (reference, user_id, full_name, phone_number, email, visit_date, visit_time, group_size, purpose, special_requests, status)
    VALUES (${reference}, ${userId ?? null}, ${d.full_name}, ${d.phone_number}, ${d.email}, ${d.visit_date}, ${d.visit_time}, ${d.group_size}, ${d.purpose}, ${d.special_requests ?? null}, 'pending')
    RETURNING *
  `;

  await sendBookingReceivedEmails(booking);
  return Response.json({ success: true, booking });
}
