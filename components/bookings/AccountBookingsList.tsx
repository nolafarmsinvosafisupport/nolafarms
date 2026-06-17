'use client';

import { Clock } from 'lucide-react';
import { useMemo, useState } from 'react';
import { CancelBookingButton } from './CancelBookingButton';
import { StatusBadge } from './StatusBadge';
import type { Booking } from '@/lib/booking-types';
import { canVisitorCancel, VISIT_TIMES } from '@/lib/booking-utils';

type Tab = 'all' | 'upcoming' | 'past' | 'cancelled';

const TABS: { key: Tab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

export function AccountBookingsList({ bookings }: { bookings: Booking[] }) {
  const [tab, setTab] = useState<Tab>('all');
  const today = new Date().toISOString().slice(0, 10);

  const pendingBookings = bookings.filter((b) => b.status === 'pending');

  const filtered = useMemo(() => {
    switch (tab) {
      case 'upcoming':
        return bookings.filter(
          (b) => b.visit_date >= today && (b.status === 'confirmed' || b.status === 'pending'),
        );
      case 'past':
        return bookings.filter(
          (b) => b.visit_date < today || b.status === 'completed' || b.status === 'rejected',
        );
      case 'cancelled':
        return bookings.filter((b) => b.status === 'cancelled');
      default:
        return bookings;
    }
  }, [bookings, tab, today]);

  return (
    <div className="space-y-6">
      {/* Pending banner */}
      {pendingBookings.length > 0 && (tab === 'all' || tab === 'upcoming') && (
        <div className="flex items-start gap-3 border border-gold-warm/50 bg-gold-warm/10 px-5 py-4">
          <Clock size={16} className="mt-0.5 flex-shrink-0 text-gold-warm" />
          <div>
            <p className="text-sm font-semibold text-brand-deep">
              {pendingBookings.length === 1
                ? '1 booking request is awaiting confirmation'
                : `${pendingBookings.length} booking requests are awaiting confirmation`}
            </p>
            <p className="mt-0.5 text-xs text-brand-deep/60">
              We review requests within 24 hours and will notify you via email and in your account.
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-farm-border">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
              tab === key
                ? 'border-b-2 border-brand-leaf text-brand-leaf'
                : 'text-brand-deep/60 hover:text-brand-deep'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-5">
        {filtered.map((booking) => (
          <article key={booking.id} className="border border-farm-border bg-cream-warm p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">
                  Reference: {booking.reference}
                </p>
                <h2 className="mt-2 font-serif text-3xl text-brand-deep">Guided Ranch Tour</h2>
                <p className="mt-3 text-brand-deep/75">
                  {booking.visit_date} &mdash; {VISIT_TIMES[booking.visit_time]} &mdash; {booking.group_size}{' '}
                  {booking.group_size === 1 ? 'person' : 'people'}
                </p>
                <p className="mt-2 text-sm text-brand-deep/65">{booking.purpose}</p>
                {booking.admin_note && (
                  <p className="mt-3 border-l-2 border-gold-warm pl-3 text-sm text-brand-deep/70">
                    Note: {booking.admin_note}
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={booking.status} />
                {canVisitorCancel(booking) && (
                  <CancelBookingButton bookingId={booking.id} reference={booking.reference} />
                )}
              </div>
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <p className="text-brand-deep/70">
            {tab === 'all' ? 'No bookings yet.' : `No ${tab} bookings.`}
          </p>
        )}
      </div>
    </div>
  );
}
