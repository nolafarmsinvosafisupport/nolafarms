import Link from 'next/link';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import type { Order, OrderStatus } from '@/lib/product-types';
import { ORDER_STATUS_LABELS } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getOrders(): Promise<Order[]> {
  if (!isDbConfigured()) return [];
  await ensureMigrated();
  const sql = getDb();
  return sql<Order[]>`SELECT * FROM orders ORDER BY created_at DESC`;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-400/20 text-blue-300',
  contacted: 'bg-yellow-400/20 text-yellow-300',
  fulfilled: 'bg-green-400/20 text-green-300',
  cancelled: 'bg-red-400/20 text-red-300',
};

function fmtDate(s: string) {
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi' }).format(new Date(s));
}

export default async function AdminOrdersPage() {
  const orders = await getOrders();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-cream-primary">Orders</h1>
        <p className="mt-1 text-xs text-white/40">{orders.length} orders total</p>
      </div>

      {orders.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/30">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const items = order.items as { product_name: string; quantity: number; unit: string }[];
            return (
              <div key={order.id} className="border border-white/10 bg-white/5">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 bg-white/5 px-4 py-2.5">
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="font-mono text-xs font-semibold tracking-wider text-brand-leaf hover:underline"
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
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">Customer</p>
                      <p className="mt-0.5 text-sm font-medium text-cream-primary">{order.customer_name}</p>
                      <p className="text-xs text-white/50">{order.customer_phone}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">Date</p>
                      <p className="mt-0.5 text-sm text-cream-secondary">{fmtDate(order.created_at)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">Items</p>
                      <p className="mt-0.5 text-sm text-cream-secondary">
                        {items.length} {items.length === 1 ? 'item' : 'items'}
                      </p>
                      <p className="truncate text-xs text-white/40">{items.slice(0, 2).map((i) => i.product_name).join(', ')}{items.length > 2 ? '…' : ''}</p>
                    </div>
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:text-cream-primary transition-colors"
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
