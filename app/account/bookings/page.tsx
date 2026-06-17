import { AccountBookingsList } from '@/components/bookings/AccountBookingsList';
import { getCurrentUserId } from '@/lib/auth';
import { getSupabaseAdmin, isSupabaseConfigured } from '@/lib/supabase';
import type { Booking } from '@/lib/booking-types';

export default async function AccountBookingsPage() {
  const userId = await getCurrentUserId();
  let bookings: Booking[] = [];
  let setupMessage: string | null = null;

  if (!isSupabaseConfigured()) {
    setupMessage = 'Supabase is not configured yet. Add the environment variables and run the SQL schema to show booking history.';
  } else if (userId) {
    const { data } = await getSupabaseAdmin()
      .from('bookings')
      .select('*')
      .eq('user_id', userId)
      .order('visit_date', { ascending: false });
    bookings = (data || []) as Booking[];
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
