'use client';

import Link from 'next/link';
import { Package } from 'lucide-react';
import { CancelOrderButton } from './CancelOrderButton';
import type { Order, OrderStatus } from '@/lib/product-types';
import { ORDER_STATUS_LABELS, parseOrderItems, canCustomerCancelOrder } from '@/lib/product-types';

// Same status colours used on the admin order views, so the badge reads the
// same way for the customer as it does for the admin who set it.
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

export function AccountOrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div className="border border-farm-border bg-cream-warm p-12 text-center">
        <Package size={28} className="mx-auto text-brand-deep/20" />
        <p className="mt-3 text-sm text-brand-deep/60">You haven&apos;t placed any orders yet.</p>
        <Link href="/products" className="mt-4 inline-block text-sm font-semibold text-brand-leaf hover:underline">
          Browse Products →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => {
        const items = parseOrderItems(order.items);
        // Site-wide rule: show a total only when every item has a set price;
        // otherwise the order needs a quote, same as cart/checkout/admin views.
        const hasTotal = items.length > 0 && items.every((i) => i.price_at_time !== null);
        const total = hasTotal
          ? items.reduce((sum, i) => sum + parseFloat(i.price_at_time as string) * i.quantity, 0)
          : null;

        return (
          <article key={order.id} className="border border-farm-border bg-cream-warm p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">
                  Reference: {order.reference}
                </p>
                <p className="mt-1 text-xs text-brand-deep/50">{fmtDate(order.created_at)}</p>

                <ul className="mt-4 space-y-1.5">
                  {items.map((item, i) => {
                    const itemPrice = item.price_at_time ? parseFloat(item.price_at_time) : null;
                    return (
                      <li key={i} className="flex items-baseline justify-between gap-3 text-sm text-brand-deep/75">
                        <span>
                          {item.product_name} <span className="text-brand-deep/40">— Qty: {item.quantity} {item.unit}</span>
                        </span>
                        {itemPrice !== null ? (
                          <span className="flex-shrink-0 font-medium text-brand-deep">
                            KES {(itemPrice * item.quantity).toLocaleString()}
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-xs font-semibold text-gold-warm">Contact for Price</span>
                        )}
                      </li>
                    );
                  })}
                </ul>

                {order.admin_note && (
                  <p className="mt-3 border-l-2 border-gold-warm pl-3 text-sm text-brand-deep/70">
                    Note from Nola Ranches: {order.admin_note}
                  </p>
                )}
              </div>

              <div className="flex flex-shrink-0 flex-col items-start gap-2 md:items-end">
                <span className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status]}`}>
                  {ORDER_STATUS_LABELS[order.status]}
                </span>
                {total !== null ? (
                  <p className="font-serif text-lg font-semibold text-brand-deep">KES {total.toLocaleString()}</p>
                ) : (
                  <p className="text-xs font-semibold text-gold-warm">Contact for final pricing</p>
                )}
                {canCustomerCancelOrder(order) && (
                  <CancelOrderButton orderId={order.id} reference={order.reference} />
                )}
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
