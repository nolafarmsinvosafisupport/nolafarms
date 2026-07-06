import { AccountOrdersList } from '@/components/orders/AccountOrdersList';
import { getCurrentUserId } from '@/lib/auth';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import type { Order } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

export default async function AccountOrdersPage() {
  const userId = await getCurrentUserId();
  let orders: Order[] = [];
  let setupMessage: string | null = null;

  if (!isDbConfigured()) {
    setupMessage = 'DATABASE_URL is not configured. Add it in Railway and redeploy.';
  } else if (userId) {
    await ensureMigrated();
    const sql = getDb();
    orders = await sql<Order[]>`SELECT * FROM orders WHERE user_id = ${userId} ORDER BY created_at DESC`;
  }

  return (
    <div className="space-y-6">
      <div className="border border-farm-border bg-cream-secondary p-5">
        <h1 className="font-serif text-3xl text-brand-deep">My Orders</h1>
        <p className="mt-2 max-w-2xl leading-7 text-brand-deep/70">
          Review the products you&apos;ve ordered and the status of each.
        </p>
        {setupMessage && (
          <p className="mt-6 border border-gold-warm bg-gold-warm/10 p-4 text-sm text-brand-deep">{setupMessage}</p>
        )}
      </div>
      {!setupMessage && <AccountOrdersList orders={orders} />}
    </div>
  );
}
