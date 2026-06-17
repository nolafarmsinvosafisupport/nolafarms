import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Booking } from '@/lib/booking-types';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Complete booking');
  if (setup) return setup;
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  const now = new Date().toISOString();
  const [booking] = await sql<Booking[]>`
    UPDATE bookings SET status = 'completed', updated_at = ${now}
    WHERE id = ${params.id}
    RETURNING *
  `;
  if (!booking) return Response.json({ success: false, message: 'Booking not found.' }, { status: 404 });
  return Response.json({ success: true, booking });
}
