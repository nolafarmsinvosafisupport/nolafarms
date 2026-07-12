import { revalidateTag } from 'next/cache';
import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import { sendStatusEmail } from '@/lib/email';
import type { Booking } from '@/lib/booking-types';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Reject booking');
  if (setup) return setup;
  await ensureMigrated();
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const body = await request.json().catch(() => ({}));
  const note: string | null = typeof body.admin_note === 'string' ? body.admin_note || null : null;
  const now = new Date().toISOString();

  const sql = getDb();
  const [booking] = await sql<Booking[]>`
    UPDATE bookings SET status = 'rejected', admin_note = ${note}, rejected_at = ${now}, updated_at = ${now}
    WHERE id = ${params.id}
    RETURNING *
  `;
  if (!booking) return Response.json({ success: false, message: 'Booking not found.' }, { status: 404 });

  if (booking.user_id) {
    await sql`
      INSERT INTO notifications (user_id, booking_id, type, title, message, read)
      VALUES (${booking.user_id}, ${booking.id}, 'rejected',
        ${'Visit Request Update'},
        ${`Unfortunately we are unable to accommodate your visit for ${booking.visit_date} (Ref: ${booking.reference})${note ? '. Note: ' + note : ''}. Please try another date.`},
        FALSE)
    `;
  }

  // Fire-and-forget — the rejection is already persisted; an email failure must not
  // 500 the admin for an action that succeeded.
  sendStatusEmail(booking, 'rejected', note).catch((err) => {
    console.error('Rejection email failed (booking was still rejected):', booking.reference, err);
  });
  // Rejecting frees the date back up — bust the cached availability.
  revalidateTag('availability');

  return Response.json({ success: true, booking });
}
