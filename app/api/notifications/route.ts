import { requireDb, requireUserResponse } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Notification } from '@/lib/booking-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const setup = requireDb('Notifications');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  const notifications = await sql<Notification[]>`
    SELECT * FROM notifications
    WHERE user_id = ${userId!}
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const unreadCount = notifications.filter((n) => !n.read).length;
  return Response.json({ success: true, notifications, unreadCount });
}

export async function PATCH() {
  const setup = requireDb('Notifications');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  await sql`UPDATE notifications SET read = TRUE WHERE user_id = ${userId!} AND read = FALSE`;
  return Response.json({ success: true });
}
