import { CancelBookingButton } from '@/components/bookings/CancelBookingButton';
import { StatusBadge } from '@/components/bookings/StatusBadge';
import { canVisitorCancel, VISIT_TIMES } from '@/lib/booking-utils';
import type { Booking } from '@/lib/booking-types';
import { getCurrentUserId } from '@/lib/auth';
import { isSupabaseConfigured, getSupabaseAdmin } from '@/lib/supabase';

export default async function AccountBookingsPage() {
  const userId = await getCurrentUserId();
  let bookings: Booking[] = [];
  let setupMessage: string | null = null;

  if (!isSupabaseConfigured()) {
    setupMessage = 'Supabase is not configured yet. Add the environment variables and run the SQL schema to show booking history.';
  } else if (userId) {
    const { data } = await getSupabaseAdmin().from('bookings').select('*').eq('user_id', userId).order('visit_date', { ascending: false });
    bookings = (data || []) as Booking[];
  }

  return (
    <div className="border border-farm-border bg-cream-secondary p-8">
      <h1 className="font-serif text-5xl text-brand-deep">My Bookings</h1>
      <p className="mt-4 max-w-2xl leading-7 text-brand-deep/70">Review upcoming and past ranch visit requests.</p>
      {setupMessage && <p className="mt-8 border border-gold-warm bg-gold-warm/10 p-4 text-sm text-brand-deep">{setupMessage}</p>}
      <div className="mt-10 space-y-5">
        {bookings.map((booking) => (
          <article key={booking.id} className="border border-farm-border bg-cream-warm p-6">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Reference: {booking.reference}</p>
                <h2 className="mt-2 font-serif text-3xl text-brand-deep">Guided Ranch Tour</h2>
                <p className="mt-3 text-brand-deep/75">{booking.visit_date} - {VISIT_TIMES[booking.visit_time]} - {booking.group_size} people</p>
                <p className="mt-2 text-sm text-brand-deep/65">{booking.purpose}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={booking.status} />
                {canVisitorCancel(booking) && <CancelBookingButton bookingId={booking.id} reference={booking.reference} />}
              </div>
            </div>
          </article>
        ))}
        {!setupMessage && bookings.length === 0 && <p className="text-brand-deep/70">No bookings yet.</p>}
      </div>
    </div>
  );
}
