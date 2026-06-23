import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';
import { AdminOrderActions } from '@/components/admin/AdminOrderActions';
import { getDb, isDbConfigured } from '@/lib/db';
import { SITE } from '@/lib/constants';
import type { Order, OrderItem, OrderStatus } from '@/lib/product-types';
import { ORDER_STATUS_LABELS } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getOrder(id: string): Promise<Order | null> {
  if (!isDbConfigured()) return null;
  const sql = getDb();
  const [order] = await sql<Order[]>`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  return order ?? null;
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-400/20 text-blue-300',
  contacted: 'bg-yellow-400/20 text-yellow-300',
  fulfilled: 'bg-green-400/20 text-green-300',
  cancelled: 'bg-red-400/20 text-red-300',
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

  const items = order.items as OrderItem[];
  const whatsappNumber = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : order.customer_phone;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link href="/admin/orders" className="text-xs text-white/30 hover:text-white/60">← All Orders</Link>
          <h1 className="mt-2 font-mono text-2xl font-bold text-cream-primary">{order.reference}</h1>
          <p className="mt-1 text-xs text-white/40">{fmtDate(order.created_at)}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${STATUS_COLORS[order.status]}`}>
          {ORDER_STATUS_LABELS[order.status]}
        </span>
      </div>

      {/* Customer */}
      <div className="border border-white/10 bg-white/5 p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Customer</h2>
        <p className="mt-3 text-lg font-semibold text-cream-primary">{order.customer_name}</p>
        <div className="mt-3 space-y-2">
          <a href={`tel:${order.customer_phone}`} className="flex items-center gap-2 text-sm text-cream-secondary hover:text-cream-primary">
            <Phone size={13} className="text-white/30" />{order.customer_phone}
          </a>
          {order.customer_email && (
            <a href={`mailto:${order.customer_email}`} className="flex items-center gap-2 text-sm text-cream-secondary hover:text-cream-primary">
              <Mail size={13} className="text-white/30" />{order.customer_email}
            </a>
          )}
          {order.delivery_location && (
            <div className="flex items-center gap-2 text-sm text-cream-secondary">
              <MapPin size={13} className="text-white/30" />{order.delivery_location}
            </div>
          )}
        </div>
        <a
          href={`https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`Hello ${order.customer_name}, this is Nola Farms regarding your order ${order.reference}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 bg-green-600/20 border border-green-600/30 px-4 py-2 text-xs font-semibold text-green-400 hover:bg-green-600/30 transition-colors"
        >
          WhatsApp Customer
        </a>
      </div>

      {/* Items */}
      <div className="border border-white/10 bg-white/5 p-5">
        <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Order Items</h2>
        <div className="mt-3 divide-y divide-white/10">
          {items.map((item, i) => {
            const price = item.price_at_time ? parseFloat(item.price_at_time) : null;
            return (
              <div key={i} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-cream-primary">{item.product_name}</p>
                  <p className="text-xs text-white/40">Qty: {item.quantity} {item.unit}</p>
                  {item.note && <p className="text-xs text-white/30 italic">{item.note}</p>}
                </div>
                <div className="text-right">
                  {price !== null ? (
                    <>
                      <p className="text-sm font-semibold text-cream-primary">KES {(price * item.quantity).toLocaleString()}</p>
                      <p className="text-xs text-white/30">@ KES {price.toLocaleString()} {item.unit}</p>
                    </>
                  ) : (
                    <p className="text-xs text-gold-warm">Contact for price</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delivery notes */}
      {order.delivery_notes && (
        <div className="border border-white/10 bg-white/5 p-5">
          <h2 className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Customer Notes</h2>
          <p className="mt-2 text-sm text-cream-secondary">{order.delivery_notes}</p>
        </div>
      )}

      {/* Admin actions */}
      <AdminOrderActions order={order} />
    </div>
  );
}
