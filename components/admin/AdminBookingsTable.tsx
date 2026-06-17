'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { AdminActionButtons } from './AdminActionButtons';
import { StatusBadge } from '@/components/bookings/StatusBadge';
import type { Booking, BookingStatus } from '@/lib/booking-types';
import { VISIT_TIMES } from '@/lib/booking-utils';

const ALL_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'];

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
        const haystack = `${b.full_name} ${b.phone_number} ${b.email} ${b.reference}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [bookings, status, dateFrom, dateTo, search]);

  function clearFilters() {
    setStatus('all');
    setDateFrom('');
    setDateTo('');
    setSearch('');
  }

  const isFiltered = status !== 'all' || dateFrom || dateTo || search;

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 border border-farm-border bg-cream-warm p-5">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-brand-deep/60">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Name, phone, email or reference…"
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          />
        </div>

        {/* Status */}
        <div className="min-w-[160px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-brand-deep/60">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as BookingStatus | 'all')}
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          >
            <option value="all">All statuses</option>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Date From */}
        <div className="min-w-[150px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-brand-deep/60">
            Visit date from
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          />
        </div>

        {/* Date To */}
        <div className="min-w-[150px]">
          <label className="mb-1 block text-[11px] font-semibold uppercase tracking-widest text-brand-deep/60">
            Visit date to
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
          />
        </div>

        {/* Clear */}
        {isFiltered && (
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="border border-farm-border px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-deep hover:bg-farm-border"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Result count */}
      <p className="text-sm text-brand-deep/60">
        {filtered.length === bookings.length
          ? `${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`
          : `${filtered.length} of ${bookings.length} booking${bookings.length !== 1 ? 's' : ''}`}
      </p>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] border-collapse text-left text-sm">
          <thead className="bg-brand-deep text-cream-primary">
            <tr>
              {['Reference', 'Name', 'Phone', 'Date', 'Time', 'Group', 'Purpose', 'Status', 'Actions'].map((h) => (
                <th key={h} className="p-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((booking) => (
              <tr key={booking.id} className="border-b border-farm-border bg-cream-warm hover:bg-cream-secondary">
                <td className="p-3">
                  <Link href={`/admin/bookings/${booking.id}`} className="font-medium text-brand-leaf hover:underline">
                    {booking.reference}
                  </Link>
                </td>
                <td className="p-3">{booking.full_name}</td>
                <td className="p-3">{booking.phone_number}</td>
                <td className="p-3">{booking.visit_date}</td>
                <td className="p-3">{VISIT_TIMES[booking.visit_time]}</td>
                <td className="p-3">{booking.group_size}</td>
                <td className="p-3 max-w-[160px] truncate">{booking.purpose}</td>
                <td className="p-3">
                  <StatusBadge status={booking.status} />
                </td>
                <td className="p-3">
                  <AdminActionButtons bookingId={booking.id} compact />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="mt-6 text-brand-deep/65">
            {isFiltered ? 'No bookings match the current filters.' : 'No bookings yet.'}
          </p>
        )}
      </div>
    </div>
  );
}
