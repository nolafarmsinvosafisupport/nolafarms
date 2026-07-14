import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { getDb, isDbConfigured } from '@/lib/db';
import type { Booking } from '@/lib/booking-types';
import { BookingConfirmedView } from '@/components/bookings/BookingConfirmedView';

export const dynamic = 'force-dynamic';

export default async function BookingConfirmedPage({
  searchParams,
}: {
  searchParams: { ref?: string; wa?: string };
}) {
  const ref = searchParams.ref;
  if (!ref) redirect('/');

  const userId = await getCurrentUserId();
  if (!userId) redirect(`/sign-in?redirect_url=/booking-confirmed?ref=${encodeURIComponent(ref)}`);

  if (!isDbConfigured()) redirect('/account/bookings');

  const sql = getDb();
  const [booking] = await sql<Booking[]>`
    SELECT * FROM bookings WHERE reference = ${ref} AND user_id = ${userId}
  `;
  if (!booking) redirect('/account/bookings');

  // Cosmetic hint only: it decides whether the WhatsApp hand-off is offered. Nothing is trusted
  // from it, so a hand-edited URL can do no harm.
  return <BookingConfirmedView booking={booking} sendToWhatsapp={searchParams.wa === '1'} />;
}
