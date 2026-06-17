import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import { sendStatusEmail } from '@/lib/email';
import type { Booking } from '@/lib/booking-types';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Reject booking');
  if (setup) return setup;
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
  await sendStatusEmail(booking, 'rejected', note);
  return Response.json({ success: true, booking });
}
