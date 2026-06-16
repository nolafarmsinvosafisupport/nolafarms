import { requireSupabase } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const setupResponse = requireSupabase('Booking availability');
  if (setupResponse) return setupResponse;

  const supabase = getSupabaseAdmin();
  const [{ data: blockedDates, error: blockedError }, { data: confirmedBookings, error: bookingsError }] = await Promise.all([
    supabase.from('blocked_dates').select('date, reason').order('date'),
    supabase.from('bookings').select('visit_date').eq('status', 'confirmed').order('visit_date'),
  ]);

  if (blockedError || bookingsError) {
    return Response.json({ success: false, message: blockedError?.message || bookingsError?.message }, { status: 500 });
  }

  const unavailableDates = Array.from(new Set([...(blockedDates || []).map((item) => item.date), ...(confirmedBookings || []).map((item) => item.visit_date)]));
  return Response.json({ success: true, unavailableDates, blockedDates: blockedDates || [] });
}
