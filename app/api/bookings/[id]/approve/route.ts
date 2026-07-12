import { revalidateTag } from 'next/cache';
import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import { sendStatusEmail } from '@/lib/email';
import type { Booking } from '@/lib/booking-types';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Approve booking');
  if (setup) return setup;
  await ensureMigrated();
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  const now = new Date().toISOString();
  const [booking] = await sql<Booking[]>`
    UPDATE bookings SET status = 'confirmed', confirmed_at = ${now}, updated_at = ${now}
    WHERE id = ${params.id}
    RETURNING *
  `;
  if (!booking) return Response.json({ success: false, message: 'Booking not found.' }, { status: 404 });

  if (booking.user_id) {
    await sql`
      INSERT INTO notifications (user_id, booking_id, type, title, message, read)
      VALUES (${booking.user_id}, ${booking.id}, 'confirmed',
        ${'Booking Confirmed!'},
        ${`Great news! Your visit for ${booking.visit_date} (Ref: ${booking.reference}) has been confirmed. See you there!`},
        FALSE)
    `;
  }

  // Fire-and-forget: the booking is already confirmed in the DB. A Resend outage must
  // not throw a 500 back at the admin for an action that actually succeeded.
  sendStatusEmail(booking, 'approved').catch((err) => {
    console.error('Approval email failed (booking was still confirmed):', booking.reference, err);
  });

  // A confirmed booking blocks that date — bust the cached availability immediately.
  revalidateTag('availability');

  return Response.json({ success: true, booking });
}
