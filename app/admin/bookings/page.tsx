import { AdminBookingsTable } from '@/components/admin/AdminBookingsTable';
import { getAdminBookings, markAdminNotificationsRead } from '@/lib/admin-data';
import { AdminNotifRefresh } from '@/components/admin/AdminNotifRefresh';

export default async function AdminBookingsPage() {
  const { bookings, setupMessage } = await getAdminBookings();
  await markAdminNotificationsRead('bookings');

  return (
    <div className="space-y-6">
      <AdminNotifRefresh />
      <div className="border border-farm-border bg-cream-secondary p-6">
        <h1 className="font-serif text-5xl text-brand-deep">All Bookings</h1>
        {setupMessage && (
          <p className="mt-6 border border-gold-warm bg-gold-warm/10 p-4 text-sm text-brand-deep">{setupMessage}</p>
        )}
      </div>

      {!setupMessage && <AdminBookingsTable bookings={bookings} />}
    </div>
  );
}
