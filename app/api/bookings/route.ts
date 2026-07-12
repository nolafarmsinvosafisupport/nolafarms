import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import { ADMIN_LIST_LIMIT } from '@/lib/admin-data';
import type { Booking } from '@/lib/booking-types';

export async function GET() {
  const setup = requireDb('Bookings');
  if (setup) return setup;
  const admin = await requireAdminResponse();
  if (admin) return admin;
  await ensureMigrated();

  const sql = getDb();
  // Hard-bounded — was previously an unbounded SELECT *.
  const bookings = await sql<Booking[]>`
    SELECT * FROM bookings ORDER BY created_at DESC LIMIT ${ADMIN_LIST_LIMIT}
  `;
  return Response.json({ success: true, bookings });
}
