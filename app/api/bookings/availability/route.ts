import { requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const setup = requireDb('Booking availability');
  if (setup) return setup;
  await ensureMigrated();

  const sql = getDb();
  const [blocked, confirmed] = await Promise.all([
    sql<{ date: string }[]>`SELECT date::text FROM blocked_dates ORDER BY date`,
    sql<{ visit_date: string }[]>`SELECT visit_date::text FROM bookings WHERE status = 'confirmed' ORDER BY visit_date`,
  ]);

  const unavailableDates = Array.from(new Set([
    ...blocked.map((r) => r.date),
    ...confirmed.map((r) => r.visit_date),
  ]));

  return Response.json({ success: true, unavailableDates, blockedDates: blocked });
}
