import Link from 'next/link';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { markAdminNotificationsRead } from '@/lib/admin-data';
import { AdminNotifRefresh } from '@/components/admin/AdminNotifRefresh';
import type { Order, OrderStatus } from '@/lib/product-types';
import { ORDER_STATUS_LABELS, parseOrderItems } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getOrders(): Promise<Order[]> {
  if (!isDbConfigured()) return [];
  await ensureMigrated();
  const sql = getDb();
  return sql<Order[]>`SELECT * FROM orders ORDER BY created_at DESC`;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border border-blue-200',
  contacted: 'bg-amber-50 text-amber-700 border border-amber-200',
  fulfilled: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-700 border border-red-200',
};

function fmtDate(s: string) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(s));
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();
  await markAdminNotificationsRead('orders');

  return (
    <div className="space-y-6">
      <AdminNotifRefresh />
      <div>
        <h1 className="font-serif text-2xl text-brand-deep">Orders</h1>
        <p className="mt-1 text-xs text-brand-deep/50">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-farm-border bg-cream-warm p-12 text-center">
          <p className="text-sm text-brand-deep/50">No orders yet. They will appear here when customers place orders.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = parseOrderItems(order.items);
            return (
              <div key={order.id} className="border border-farm-border bg-cream-warm">
                {/* Header row */}
                <div className="flex items-center justify-between border-b border-farm-border bg-cream-secondary px-4 py-2.5">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs font-bold tracking-wider text-brand-leaf hover:underline"
                  >
                    {order.reference}
                  </Link>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>

                {/* Body */}
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Customer</p>
                      <p className="mt-0.5 text-sm font-semibold text-brand-deep">{order.customer_name}</p>
                      <p className="text-xs text-brand-deep/60">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Date</p>
                      <p className="mt-0.5 text-sm text-brand-deep/75">{fmtDate(order.created_at)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Items</p>
                      <p className="mt-0.5 text-sm font-medium text-brand-deep">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="truncate text-xs text-brand-deep/50">
                        {items.slice(0, 2).map((i) => i.product_name).join(', ')}{items.length > 2 ? ` +${items.length - 2} more` : ''}
                      </p>
                    </div>
                  </div>

                  {order.delivery_location && (
                    <p className="mt-3 truncate text-xs text-brand-deep/50">
                      <span className="font-semibold text-brand-deep/40">Delivery: </span>{order.delivery_location}
                    </p>
                  )}

                  <div className="mt-3 border-t border-farm-border pt-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:text-brand-deep transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
