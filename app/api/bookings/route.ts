import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Booking } from '@/lib/booking-types';

export async function GET() {
  const setup = requireDb('Bookings');
  if (setup) return setup;
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  const bookings = await sql<Booking[]>`SELECT * FROM bookings ORDER BY created_at DESC`;
  return Response.json({ success: true, bookings });
}
