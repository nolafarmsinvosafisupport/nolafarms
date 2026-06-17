import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Booking } from '@/lib/booking-types';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Booking details');
  if (setup) return setup;
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  const [booking] = await sql<Booking[]>`SELECT * FROM bookings WHERE id = ${params.id}`;
  if (!booking) return Response.json({ success: false, message: 'Booking not found.' }, { status: 404 });
  return Response.json({ success: true, booking });
}
