import { revalidateTag } from 'next/cache';
import { requireDb, requireUserResponse } from '@/lib/api-utils';
import { isCurrentUserAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { canVisitorCancel } from '@/lib/booking-utils';
import { sendStatusEmail } from '@/lib/email';
import type { Booking } from '@/lib/booking-types';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Cancel booking');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  const [booking] = await sql<Booking[]>`SELECT * FROM bookings WHERE id = ${params.id}`;
  if (!booking) return Response.json({ success: false, message: 'Booking not found.' }, { status: 404 });

  const admin = await isCurrentUserAdmin();
  if (!admin && booking.user_id !== userId) {
    return Response.json({ success: false, message: 'You can only cancel your own bookings.' }, { status: 403 });
  }
  if (!admin && !canVisitorCancel(booking)) {
    return Response.json({ success: false, message: 'This booking can no longer be cancelled online.' }, { status: 409 });
  }

  const body = await request.json().catch(() => ({}));
  const note: string | null = typeof body.admin_note === 'string' ? body.admin_note || null : null;
  const now = new Date().toISOString();
  const cancelledBy = admin ? 'admin' : 'visitor';

  const [updated] = await sql<Booking[]>`
    UPDATE bookings
    SET status = 'cancelled', admin_note = ${note}, cancelled_at = ${now}, cancellation_by = ${cancelledBy}, updated_at = ${now}
    WHERE id = ${params.id}
    RETURNING *
  `;
  // Fire-and-forget — the cancellation is already persisted; an email failure must not
  // 500 the caller for an action that succeeded.
  sendStatusEmail(updated, 'cancelled', note).catch((err) => {
    console.error('Cancellation email failed (booking was still cancelled):', updated.reference, err);
  });
  // Cancelling frees the date back up — bust the cached availability.
  revalidateTag('availability');

  return Response.json({ success: true, booking: updated });
}
