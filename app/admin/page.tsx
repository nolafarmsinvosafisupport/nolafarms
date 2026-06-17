import Link from 'next/link';
import { StatusBadge } from '@/components/bookings/StatusBadge';
import { bookingStats, getAdminBookings } from '@/lib/admin-data';
import { VISIT_TIMES } from '@/lib/booking-utils';

export default async function AdminOverviewPage() {
  const { bookings, setupMessage } = await getAdminBookings();
  const stats = bookingStats(bookings);
  const statCards = [
    { label: 'Pending', value: stats.pending, text: 'awaiting approval' },
    { label: 'Confirmed', value: stats.confirmed, text: 'upcoming visits' },
    { label: 'This Week', value: stats.thisWeek, text: 'visits coming up' },
    { label: 'This Month', value: stats.thisMonth, text: 'bookings' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Dashboard</p>
        <h1 className="mt-1 font-serif text-4xl text-brand-deep">Good morning. Here&apos;s today.</h1>
      </div>
      {setupMessage && <p className="border border-gold-warm bg-gold-warm/10 p-4 text-sm text-brand-deep">{setupMessage}</p>}
      <div className="grid gap-5 md:grid-cols-4">
        {statCards.map((card) => (
          <article key={card.label} className="border border-farm-border bg-cream-warm p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">{card.label}</p>
            <h2 className="mt-3 font-serif text-3xl text-brand-deep">{card.value}</h2>
            <p className="mt-2 text-sm text-brand-deep/65">{card.text}</p>
          </article>
        ))}
      </div>
      <section className="border border-farm-border bg-cream-secondary p-6">
        <h2 className="font-serif text-3xl text-brand-deep">Today&apos;s Visits</h2>
        <div className="mt-5 space-y-3">
          {stats.todayVisits.map((booking) => (
            <div key={booking.id} className="flex justify-between gap-4 border border-farm-border bg-cream-warm p-4">
              <span>{VISIT_TIMES[booking.visit_time]} - {booking.full_name} ({booking.group_size} people)</span>
              <StatusBadge status={booking.status} />
            </div>
          ))}
          {stats.todayVisits.length === 0 && <p className="text-brand-deep/65">No visit scheduled today.</p>}
        </div>
      </section>
      <section className="border border-farm-border bg-cream-secondary p-6">
        <h2 className="font-serif text-3xl text-brand-deep">Pending Approvals</h2>
        <div className="mt-5 space-y-3">
          {stats.pendingBookings.slice(0, 6).map((booking) => (
            <Link key={booking.id} href={`/admin/bookings/${booking.id}`} className="flex flex-col justify-between gap-3 border border-farm-border bg-cream-warm p-4 hover:border-brand-leaf md:flex-row">
              <span>{booking.reference} - {booking.full_name} - {booking.visit_date} - {VISIT_TIMES[booking.visit_time]} - {booking.group_size} people</span>
              <span className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">Review</span>
            </Link>
          ))}
          {stats.pendingBookings.length === 0 && <p className="text-brand-deep/65">No pending approvals.</p>}
        </div>
      </section>
    </div>
  );
}
