import Link from 'next/link';
import { ShoppingCart, Package, ClipboardList } from 'lucide-react';
import { StatusBadge } from '@/components/bookings/StatusBadge';
import { bookingStats, getAdminBookings, getOrderStats, getProductStats } from '@/lib/admin-data';
import { VISIT_TIMES } from '@/lib/booking-utils';
import type { OrderStatus } from '@/lib/product-types';
import { ORDER_STATUS_LABELS } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  new: 'bg-blue-400/20 text-blue-300',
  contacted: 'bg-yellow-400/20 text-yellow-300',
  fulfilled: 'bg-green-400/20 text-green-300',
  cancelled: 'bg-red-400/20 text-red-300',
};

function fmtDate(s: string) {
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi' }).format(new Date(s));
}

export default async function AdminOverviewPage() {
  const [{ bookings, setupMessage }, orderStats, productStats] = await Promise.all([
    getAdminBookings(),
    getOrderStats(),
    getProductStats(),
  ]);
  const stats = bookingStats(bookings);

  const bookingCards = [
    { label: 'Pending Bookings', value: stats.pending, text: 'awaiting approval', href: '/admin/bookings', icon: ClipboardList },
    { label: 'Confirmed Visits', value: stats.confirmed, text: 'upcoming visits', href: '/admin/bookings', icon: ClipboardList },
    { label: 'This Week', value: stats.thisWeek, text: 'visits coming up', href: '/admin/calendar', icon: ClipboardList },
    { label: 'This Month', value: stats.thisMonth, text: 'total bookings', href: '/admin/bookings', icon: ClipboardList },
  ];

  const orderCards = [
    { label: 'New Orders', value: orderStats.newOrders, text: 'need attention', href: '/admin/orders', accent: 'text-blue-400', icon: ShoppingCart },
    { label: 'Total Orders', value: orderStats.total, text: 'all time', href: '/admin/orders', accent: 'text-brand-leaf', icon: ShoppingCart },
    { label: 'Products Listed', value: productStats.total, text: 'in catalogue', href: '/admin/products', accent: 'text-gold-warm', icon: Package },
    { label: 'Available Now', value: productStats.available, text: 'visible to customers', href: '/admin/products', accent: 'text-brand-leaf', icon: Package },
  ];

  return (
    <div className="space-y-10">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Dashboard</p>
        <h1 className="mt-1 font-serif text-4xl text-brand-deep">Good morning. Here&apos;s today.</h1>
      </div>

      {setupMessage && <p className="border border-gold-warm bg-gold-warm/10 p-4 text-sm text-brand-deep">{setupMessage}</p>}

      {/* Bookings Stats */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-deep/50">Bookings</h2>
          <Link href="/admin/bookings" className="text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:underline">View all →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {bookingCards.map((card) => (
            <Link key={card.label} href={card.href}>
              <article className="border border-farm-border bg-cream-warm p-4 transition-colors hover:border-brand-leaf">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">{card.label}</p>
                <h2 className="mt-3 font-serif text-3xl text-brand-deep">{card.value}</h2>
                <p className="mt-2 text-sm text-brand-deep/65">{card.text}</p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Orders & Products Stats */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-brand-deep/50">Shop</h2>
          <Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:underline">View orders →</Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {orderCards.map((card) => (
            <Link key={card.label} href={card.href}>
              <article className="border border-farm-border bg-cream-warm p-4 transition-colors hover:border-brand-leaf">
                <div className="flex items-center gap-2">
                  <card.icon size={13} className={card.accent} />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-deep/50">{card.label}</p>
                </div>
                <h2 className={`mt-3 font-serif text-3xl ${card.accent}`}>{card.value}</h2>
                <p className="mt-2 text-sm text-brand-deep/65">{card.text}</p>
              </article>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Orders */}
      {orderStats.recent.length > 0 && (
        <section className="border border-farm-border bg-cream-secondary p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl text-brand-deep">Recent Orders</h2>
            <Link href="/admin/orders" className="text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:underline">All Orders →</Link>
          </div>
          <div className="space-y-2">
            {orderStats.recent.map((order) => (
              <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex items-center justify-between gap-4 border border-farm-border bg-cream-warm p-4 hover:border-brand-leaf transition-colors">
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs font-bold text-brand-deep">{order.reference}</span>
                  <span className="text-sm text-brand-deep/70">{order.customer_name}</span>
                  <span className="hidden text-xs text-brand-deep/40 sm:inline">{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden text-xs text-brand-deep/40 sm:inline">{fmtDate(order.created_at)}</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${ORDER_STATUS_COLORS[order.status]}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Today's Visits */}
      <section className="border border-farm-border bg-cream-secondary p-6">
        <h2 className="font-serif text-2xl text-brand-deep">Today&apos;s Visits</h2>
        <div className="mt-4 space-y-3">
          {stats.todayVisits.map((booking) => (
            <div key={booking.id} className="flex justify-between gap-4 border border-farm-border bg-cream-warm p-4">
              <span>{VISIT_TIMES[booking.visit_time]} — {booking.full_name} ({booking.group_size} people)</span>
              <StatusBadge status={booking.status} />
            </div>
          ))}
          {stats.todayVisits.length === 0 && <p className="text-brand-deep/65">No visits scheduled today.</p>}
        </div>
      </section>

      {/* Pending Approvals */}
      <section className="border border-farm-border bg-cream-secondary p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-2xl text-brand-deep">Pending Approvals</h2>
          {stats.pendingBookings.length > 0 && (
            <Link href="/admin/bookings" className="text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:underline">All Bookings →</Link>
          )}
        </div>
        <div className="space-y-3">
          {stats.pendingBookings.slice(0, 6).map((booking) => (
            <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="flex flex-col justify-between gap-3 border border-farm-border bg-cream-warm p-4 hover:border-brand-leaf md:flex-row transition-colors">
              <span>{booking.reference} — {booking.full_name} — {booking.visit_date} — {VISIT_TIMES[booking.visit_time]} — {booking.group_size} people</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">Review →</span>
            </Link>
          ))}
          {stats.pendingBookings.length === 0 && <p className="text-brand-deep/65">No pending approvals.</p>}
        </div>
      </section>
    </div>
  );
}
