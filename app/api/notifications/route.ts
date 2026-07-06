import { requireDb, requireUserResponse } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import { isCurrentUserAdmin } from '@/lib/auth';
import type { Notification } from '@/lib/booking-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const setup = requireDb('Notifications');
  if (setup) return setup;
  await ensureMigrated();
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  const notifications = await sql<Notification[]>`
    SELECT * FROM notifications
    WHERE user_id = ${userId!}
    ORDER BY created_at DESC
    LIMIT 10
  `;

  // Computed against the full table (not just the 10 shown above) so counts are
  // accurate even when there are more than 10 unread notifications. Booking-related
  // notifications always set booking_id; order notifications never do — that's the
  // signal used to split the sidebar's separate Orders/Bookings badges.
  const [counts] = await sql<[{ total: string; orders: string; bookings: string }]>`
    SELECT
      COUNT(*) FILTER (WHERE read = FALSE) AS total,
      COUNT(*) FILTER (WHERE read = FALSE AND booking_id IS NULL) AS orders,
      COUNT(*) FILTER (WHERE read = FALSE AND booking_id IS NOT NULL) AS bookings
    FROM notifications
    WHERE user_id = ${userId!}
  `;

  const isAdmin = await isCurrentUserAdmin();

  return Response.json({
    success: true,
    notifications,
    unreadCount: parseInt(counts.total, 10),
    unreadOrderCount: parseInt(counts.orders, 10),
    unreadBookingCount: parseInt(counts.bookings, 10),
    isAdmin,
  });
}

export async function PATCH() {
  const setup = requireDb('Notifications');
  if (setup) return setup;
  await ensureMigrated();
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  await sql`UPDATE notifications SET read = TRUE WHERE user_id = ${userId!} AND read = FALSE`;
  return Response.json({ success: true });
}
