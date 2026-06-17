import { requireDb, requireUserResponse } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Booking } from '@/lib/booking-types';

export async function GET() {
  const setup = requireDb('My bookings');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  const bookings = await sql<Booking[]>`
    SELECT * FROM bookings WHERE user_id = ${userId!} ORDER BY visit_date DESC
  `;
  return Response.json({ success: true, bookings });
}
