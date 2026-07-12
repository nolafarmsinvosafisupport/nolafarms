import { unstable_cache } from 'next/cache';
import { requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';

export const dynamic = 'force-dynamic';

// This is the ONLY unauthenticated, database-hitting endpoint on the site — every
// visitor who opens the booking form calls it. Left uncached it was 2 queries per
// visitor against a pool of 10, which is what would exhaust the pool under a traffic
// spike. Cached for 60s (availability changes rarely) and invalidated immediately
// whenever a booking or blocked date changes, via revalidateTag('availability').
const getAvailability = unstable_cache(
  async () => {
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

    return { unavailableDates, blockedDates: blocked };
  },
  ['booking-availability'],
  { revalidate: 60, tags: ['availability'] },
);

export async function GET() {
  const setup = requireDb('Booking availability');
  if (setup) return setup;

  const { unavailableDates, blockedDates } = await getAvailability();

  return Response.json(
    { success: true, unavailableDates, blockedDates },
    {
      headers: {
        // Let Cloudflare hold it at the edge too, so most callers never reach the origin.
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    },
  );
}
