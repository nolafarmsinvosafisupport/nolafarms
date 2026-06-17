'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminActionButtons } from './AdminActionButtons';
import { StatusBadge } from '@/components/bookings/StatusBadge';
import type { Booking, BookingStatus } from '@/lib/booking-types';
import { VISIT_TIMES } from '@/lib/booking-utils';

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];

function fmtDate(d: string) {
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Nairobi',
  }).format(new Date(d + 'T12:00:00'));
}

export function AdminBookingsTable({ bookings }: { bookings: Booking[] }) {
  const [status, setStatus] = useState<BookingStatus | 'all'>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return bookings.filter((b) => {
      if (status !== 'all' && b.status !== status) return false;
      if (dateFrom && b.visit_date < dateFrom) return false;
      if (dateTo && b.visit_date > dateTo) return false;
      if (q) {
        const hay = `${b.full_name} ${b.phone_number} ${b.email} ${b.reference}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, status, dateFrom, dateTo, search]);

  const isFiltered = status !== 'all' || dateFrom || dateTo || search;

  return (
    <div className="space-y-5">
      {/* Filter bar */}
      <div className="grid grid-cols-1 gap-3 border border-farm-border bg-cream-warm p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, email, ref…"
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')}
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50">
            From date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50">
            To date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          />
        </div>
      </div>

      {/* Result count + clear */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-deep/60">
          {filtered.length === bookings.length
            ? `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`
            : `${filtered.length} of ${bookings.length} shown`}
        </p>
        {isFiltered && (
          <button
            onClick={() => { setStatus('all'); setDateFrom(''); setDateTo(''); setSearch(''); }}
            className="text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Card list — no table, no horizontal scroll */}
      {filtered.length === 0 ? (
        <p className="py-8 text-center text-sm text-brand-deep/50">
          {isFiltered ? 'No bookings match the current filters.' : 'No bookings yet.'}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="border border-farm-border bg-cream-warm">
              {/* Card header: reference + status */}
              <div className="flex items-center justify-between border-b border-farm-border bg-cream-secondary/60 px-4 py-2.5">
                <Link
                  href={`/admin/bookings/${booking.id}`}
                  className="font-mono text-xs font-semibold tracking-wider text-brand-leaf hover:underline"
                >
                  {booking.reference}
                </Link>
                <StatusBadge status={booking.status} />
              </div>

              {/* Card body: info grid */}
              <div className="p-4">
                <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Visitor</p>
                    <p className="mt-0.5 truncate text-sm font-medium text-brand-deep">{booking.full_name}</p>
                    <p className="truncate text-xs text-brand-deep/55">{booking.phone_number}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Visit</p>
                    <p className="mt-0.5 text-sm font-medium text-brand-deep">{fmtDate(booking.visit_date)}</p>
                    <p className="text-xs text-brand-deep/55">{VISIT_TIMES[booking.visit_time]}</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Group · Purpose</p>
                    <p className="mt-0.5 text-sm font-medium text-brand-deep">{booking.group_size} {booking.group_size === 1 ? 'person' : 'people'}</p>
                    <p className="truncate text-xs text-brand-deep/55">{booking.purpose}</p>
                  </div>
                </div>

                {booking.admin_note && (
                  <p className="mt-3 border-l-2 border-gold-warm pl-3 text-xs text-brand-deep/65">
                    {booking.admin_note}
                  </p>
                )}

                {/* Action buttons inline — no horizontal scroll */}
                <div className="mt-3 border-t border-farm-border pt-3">
                  <AdminActionButtons bookingId={booking.id} compact />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
