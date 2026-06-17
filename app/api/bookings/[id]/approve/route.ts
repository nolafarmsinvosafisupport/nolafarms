import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import { sendStatusEmail } from '@/lib/email';
import type { Booking } from '@/lib/booking-types';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Approve booking');
  if (setup) return setup;
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
  await sendStatusEmail(booking, 'approved');
  return Response.json({ success: true, booking });
}
