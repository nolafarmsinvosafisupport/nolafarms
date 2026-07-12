import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { AdminOrderActions } from '@/components/admin/AdminOrderActions';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { SITE } from '@/lib/constants';
import type { Order, OrderStatus } from '@/lib/product-types';
import { ORDER_STATUS_LABELS, parseOrderItems } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getOrder(id: string): Promise<Order | null> {
  if (!isDbConfigured()) return null;
  await ensureMigrated();
  const sql = getDb();
  const [order] = await sql<Order[]>`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  return order ?? null;
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
    hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Nairobi',
  }).format(new Date(s));
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getOrder(id);
  if (!order) notFound();

  const items = parseOrderItems(order.items);
  const whatsappNumber = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : order.customer_phone;

  const hasTotal = items.every((i) => i.price_at_time !== null);
  const total = hasTotal
    ? items.reduce((sum, i) => sum + (parseFloat(i.price_at_time as string) * i.quantity), 0)
    : null;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Back + header */}
      <div>
        <Link href="/admin/orders" className="text-xs font-semibold text-brand-leaf hover:underline">
          ← All Orders
        </Link>
        <div className="mt-3 flex items-start justify-between gap-4">
          <div>
            <h1 className="font-mono text-2xl font-bold text-brand-deep">{order.reference}</h1>
            <p className="mt-1 text-xs text-brand-deep/50">{fmtDate(order.created_at)}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status]}`}>
            {ORDER_STATUS_LABELS[order.status]}
          </span>
        </div>
      </div>

      {/* Customer */}
      <div className="border border-farm-border bg-cream-warm p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-brand-deep/40">Customer</h2>
        <p className="mt-3 text-lg font-semibold text-brand-deep">{order.customer_name}</p>
        <div className="mt-3 space-y-2">
          <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 text-sm text-brand-deep/70 hover:text-brand-leaf transition-colors">
            <Phone size={13} className="text-brand-deep/30" />{order.customer_phone}
          </a>
          {order.customer_email && (
            <a href={`mailto:${order.customer_email}`} className="flex items-center gap-2 text-sm text-brand-deep/70 hover:text-brand-leaf transition-colors">
              <Mail size={13} className="text-brand-deep/30" />{order.customer_email}
            </a>
          )}
          {order.delivery_location && (
            <div className="flex items-center gap-2 text-sm text-brand-deep/70">
              <MapPin size={13} className="text-brand-deep/30" />{order.delivery_location}
            </div>
          )}
        </div>
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customer_name}, this is Nola Ranches regarding your order ${order.reference}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 bg-green-600 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-green-700 transition-colors"
        >
          <MessageCircle size={13} /> WhatsApp Customer
        </a>
      </div>

      {/* Order items */}
      <div className="border border-farm-border bg-cream-warm p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-brand-deep/40">Order Items</h2>
        <div className="mt-3 divide-y divide-farm-border">
          {items.map((item, i) => {
            const price = item.price_at_time ? parseFloat(item.price_at_time as string) : null;
            return (
              <div key={i} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-brand-deep">{item.product_name}</p>
                  <p className="text-xs text-brand-deep/55">Qty: {item.quantity} {item.unit}</p>
                  {item.note && <p className="text-xs text-brand-deep/40 italic">{item.note}</p>}
                </div>
                <div className="text-right">
                  {price !== null ? (
                    <>
                      <p className="text-sm font-semibold text-brand-deep">KES {(price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-brand-deep/40">@ KES {price.toLocaleString()} {item.unit}</p>
                    </>
                  ) : (
                    <p className="text-xs font-semibold text-amber-700">Contact for price</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {total !== null && (
          <div className="mt-3 flex items-center justify-between border-t border-farm-border pt-3">
            <p className="text-sm font-semibold text-brand-deep">Order Total</p>
            <p className="font-serif text-lg font-bold text-brand-deep">KES {total.toLocaleString()}</p>
          </div>
        )}
      </div>

      {/* Delivery notes */}
      {order.delivery_notes && (
        <div className="border border-farm-border bg-cream-warm p-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-brand-deep/40">Customer Notes</h2>
          <p className="mt-2 text-sm leading-6 text-brand-deep/70">{order.delivery_notes}</p>
        </div>
      )}

      {/* Admin actions */}
      <AdminOrderActions order={order} />
    </div>
  );
}
