import { AdminCalendar } from '@/components/admin/AdminCalendar';
import { getAdminBookings, getBlockedDates } from '@/lib/admin-data';

export default async function AdminCalendarPage() {
  const [{ bookings, setupMessage }, { blockedDates }] = await Promise.all([
    getAdminBookings(),
    getBlockedDates(),
  ]);

  return (
    <div className="space-y-6">
      <div className="border border-farm-border bg-cream-secondary p-6">
        <h1 className="font-serif text-5xl text-brand-deep">Calendar</h1>
        <p className="mt-4 text-brand-deep/70">
          Click any date to see bookings and quick actions. Green dot = confirmed, yellow = pending, red = blocked.
        </p>
        {setupMessage && (
          <p className="mt-6 border border-gold-warm bg-gold-warm/10 p-4 text-sm text-brand-deep">{setupMessage}</p>
        )}
      </div>

      {!setupMessage && <AdminCalendar bookings={bookings} blockedDates={blockedDates} />}
    </div>
  );
}
