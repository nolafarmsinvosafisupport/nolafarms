import { AccountBookingsList } from '@/components/bookings/AccountBookingsList';
import { getCurrentUserId } from '@/lib/auth';
import { getDb, isDbConfigured } from '@/lib/db';
import type { Booking } from '@/lib/booking-types';

export default async function AccountBookingsPage() {
  const userId = await getCurrentUserId();
  let bookings: Booking[] = [];
  let setupMessage: string | null = null;

  if (!isDbConfigured()) {
    setupMessage = 'DATABASE_URL is not configured. Add it in Railway and redeploy.';
  } else if (userId) {
    const sql = getDb();
    const rows = await sql<Booking[]>`
      SELECT * FROM bookings WHERE user_id = ${userId} ORDER BY visit_date DESC
    `;
    bookings = rows;
  }

  return (
    <div className="space-y-6">
      <div className="border border-farm-border bg-cream-secondary p-8">
        <h1 className="font-serif text-5xl text-brand-deep">My Bookings</h1>
        <p className="mt-4 max-w-2xl leading-7 text-brand-deep/70">
          Review upcoming and past ranch visit requests.
        </p>
        {setupMessage && (
          <p className="mt-6 border border-gold-warm bg-gold-warm/10 p-4 text-sm text-brand-deep">{setupMessage}</p>
        )}
      </div>
      {!setupMessage && <AccountBookingsList bookings={bookings} />}
    </div>
  );
}
