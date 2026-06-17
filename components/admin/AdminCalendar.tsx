'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { BlockedDate, Booking } from '@/lib/booking-types';

interface Props {
  bookings: Booking[];
  blockedDates: BlockedDate[];
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function AdminCalendar({ bookings, blockedDates }: Props) {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selected, setSelected] = useState<string | null>(null);
  const [blockLoading, setBlockLoading] = useState(false);
  // Inline block form state
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockReason, setBlockReason] = useState('');

  const todayStr = now.toISOString().slice(0, 10);

  const bookingsByDate = new Map<string, Booking[]>();
  for (const b of bookings) {
    const list = bookingsByDate.get(b.visit_date) ?? [];
    list.push(b);
    bookingsByDate.set(b.visit_date, list);
  }
  const blockedSet = new Set(blockedDates.map((d) => d.date));
  const blockedReasonMap = new Map(blockedDates.map((d) => [d.date, d.reason]));
  const blockedIdMap = new Map(blockedDates.map((d) => [d.date, d.id]));

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
    setSelected(null);
    setShowBlockForm(false);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
    setSelected(null);
    setShowBlockForm(false);
  }

  function selectDate(dateStr: string) {
    setSelected((prev) => (prev === dateStr ? null : dateStr));
    setShowBlockForm(false);
    setBlockReason('');
  }

  async function confirmBlock(dateStr: string) {
    setBlockLoading(true);
    await fetch('/api/blocked-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: dateStr, reason: blockReason.trim() || null }),
    });
    setBlockLoading(false);
    setShowBlockForm(false);
    setBlockReason('');
    router.refresh();
  }

  async function unblockDate(id: string) {
    setBlockLoading(true);
    await fetch(`/api/blocked-dates/${id}`, { method: 'DELETE' });
    setBlockLoading(false);
    router.refresh();
  }

  const selectedDateBookings = selected ? (bookingsByDate.get(selected) ?? []) : [];
  const selectedIsBlocked = selected ? blockedSet.has(selected) : false;

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-6">
      {/* Month navigation */}
      <div className="flex items-center justify-between border border-farm-border bg-cream-warm p-5">
        <button onClick={prevMonth} className="p-2 hover:bg-farm-border" aria-label="Previous month">
          <ChevronLeft size={20} />
        </button>
        <h2 className="font-serif text-3xl text-brand-deep">{MONTHS[month]} {year}</h2>
        <button onClick={nextMonth} className="p-2 hover:bg-farm-border" aria-label="Next month">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-5 text-xs font-semibold uppercase tracking-widest text-brand-deep/70">
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-brand-leaf" /> Confirmed</span>
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-gold-warm" /> Pending</span>
        <span className="flex items-center gap-2"><span className="inline-block h-3 w-3 rounded-full bg-red-500" /> Blocked</span>
      </div>

      {/* Calendar grid */}
      <div className="border border-farm-border">
        <div className="grid grid-cols-7 border-b border-farm-border bg-brand-deep">
          {DAYS.map((d) => (
            <div key={d} className="p-3 text-center text-xs font-semibold uppercase tracking-widest text-cream-secondary">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="min-h-[88px] border-b border-r border-farm-border bg-cream-primary/40" />;
            }

            const dateStr = toDateStr(year, month, day);
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selected;
            const dayBookings = bookingsByDate.get(dateStr) ?? [];
            const isBlocked = blockedSet.has(dateStr);
            const hasConfirmed = dayBookings.some((b) => b.status === 'confirmed');
            const hasPending = dayBookings.some((b) => b.status === 'pending');

            return (
              <button
                key={dateStr}
                onClick={() => selectDate(dateStr)}
                className={`min-h-[88px] border-b border-r border-farm-border p-2 text-left transition-colors ${
                  isSelected
                    ? 'bg-brand-deep text-cream-primary'
                    : isBlocked
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'bg-cream-warm hover:bg-cream-secondary'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center text-sm font-semibold ${
                    isToday
                      ? 'rounded-full border-2 border-brand-leaf text-brand-leaf'
                      : isSelected
                        ? 'text-cream-primary'
                        : 'text-brand-deep'
                  }`}
                >
                  {day}
                </span>
                <div className="mt-2 flex flex-wrap gap-1">
                  {hasConfirmed && <span className="h-2 w-2 rounded-full bg-brand-leaf" title="Confirmed visit" />}
                  {hasPending && <span className="h-2 w-2 rounded-full bg-gold-warm" title="Pending booking" />}
                  {isBlocked && <span className="h-2 w-2 rounded-full bg-red-500" title="Blocked date" />}
                </div>
                {dayBookings.length > 0 && (
                  <p className={`mt-1 text-[10px] ${isSelected ? 'text-cream-secondary' : 'text-brand-deep/60'}`}>
                    {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Date detail panel */}
      {selected && (
        <div className="border border-farm-border bg-cream-secondary p-6 space-y-5">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <h3 className="font-serif text-3xl text-brand-deep">{selected}</h3>
            <div className="flex gap-3">
              {selectedIsBlocked ? (
                <button
                  disabled={blockLoading}
                  onClick={() => {
                    const id = blockedIdMap.get(selected);
                    if (id) unblockDate(id);
                  }}
                  className="border border-farm-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-farm-border disabled:opacity-60"
                >
                  {blockLoading ? 'Removing…' : 'Remove Block'}
                </button>
              ) : (
                !showBlockForm && (
                  <button
                    onClick={() => setShowBlockForm(true)}
                    className="border border-red-400 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-red-700 hover:bg-red-50"
                  >
                    Block This Date
                  </button>
                )
              )}
            </div>
          </div>

          {/* Inline block form */}
          {showBlockForm && !selectedIsBlocked && (
            <div className="border border-red-200 bg-red-50 p-5 space-y-4">
              <p className="text-sm font-medium text-red-800">Block {selected}</p>
              <label className="block text-sm text-brand-deep">
                <span className="mb-2 block font-medium">Reason (optional — internal only)</span>
                <input
                  type="text"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  placeholder="e.g. Public holiday, maintenance…"
                  className="w-full border border-red-200 bg-cream-primary px-4 py-2 text-brand-deep outline-none focus:border-red-400"
                />
              </label>
              <div className="flex gap-3">
                <button
                  disabled={blockLoading}
                  onClick={() => confirmBlock(selected)}
                  className="bg-red-700 px-5 py-2 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-red-800 disabled:opacity-60"
                >
                  {blockLoading ? 'Blocking…' : 'Confirm Block'}
                </button>
                <button
                  disabled={blockLoading}
                  onClick={() => { setShowBlockForm(false); setBlockReason(''); }}
                  className="border border-farm-border px-5 py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-farm-border disabled:opacity-60"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {selectedIsBlocked && (
            <p className="text-sm text-red-800">
              Blocked — {blockedReasonMap.get(selected) || 'No reason recorded'}
            </p>
          )}

          {selectedDateBookings.length === 0 && !selectedIsBlocked && !showBlockForm && (
            <p className="text-sm text-brand-deep/65">No bookings on this date.</p>
          )}

          {selectedDateBookings.map((b) => (
            <div key={b.id} className="flex flex-col justify-between gap-3 border border-farm-border bg-cream-warm p-4 md:flex-row md:items-center">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">{b.reference}</p>
                <p className="mt-1 font-medium text-brand-deep">
                  {b.full_name} — {b.group_size} {b.group_size === 1 ? 'person' : 'people'}
                </p>
                <p className="text-sm text-brand-deep/65">{b.purpose}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className={`border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusClass(b.status)}`}>
                  {b.status}
                </span>
                <Link
                  href={`/admin/bookings/${b.id}`}
                  className="border border-brand-deep px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-brand-deep hover:text-cream-primary"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function statusClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-gold-warm/20 text-brand-deep border-gold-warm',
    confirmed: 'bg-brand-leaf/20 text-brand-deep border-brand-leaf',
    rejected: 'bg-red-400/20 text-red-900 border-red-400',
    cancelled: 'bg-farm-muted/20 text-brand-deep border-farm-muted',
    completed: 'bg-cream-secondary text-brand-deep border-farm-border',
  };
  return map[status] ?? '';
}
