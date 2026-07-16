import type { getDb } from '@/lib/db';
import { getAdminUserIds } from '@/lib/auth';

type AdminNotification = {
  type: string;
  title: string;
  message: string;
  orderId?: string;
  bookingId?: string;
};

// Fans an admin notification out to every current admin, not just the env-var one — a Clerk
// metadata-role admin has full admin access but a different Clerk id, so a single hardcoded
// insert never reached them. Read/mark-as-read is already scoped per signed-in user, so one row
// per admin id is all this needs.
export async function notifyAdmins(sql: ReturnType<typeof getDb>, notif: AdminNotification): Promise<void> {
  try {
    const adminIds = await getAdminUserIds();
    await Promise.all(
      adminIds.map((adminId) =>
        sql`
          INSERT INTO notifications (user_id, order_id, booking_id, type, title, message)
          VALUES (${adminId}, ${notif.orderId ?? null}, ${notif.bookingId ?? null}, ${notif.type}, ${notif.title}, ${notif.message})
        `.catch(() => undefined)
      )
    );
  } catch {
    // Never let a notification failure affect the order/booking that triggered it.
  }
}
