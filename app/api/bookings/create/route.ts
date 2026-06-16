import { bookingSchema, requireSupabase } from '@/lib/api-utils';
import { getCurrentUserId } from '@/lib/auth';
import { generateBookingReference, minimumVisitDate } from '@/lib/booking-utils';
import { sendBookingReceivedEmails } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Booking } from '@/lib/booking-types';

export async function POST(request: Request) {
  const setupResponse = requireSupabase('Booking submissions');
  if (setupResponse) return setupResponse;

  const parsed = bookingSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

  if (parsed.data.visit_date < minimumVisitDate()) {
    return Response.json({ success: false, message: 'Please choose a date at least 24 hours from today.' }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: blocked } = await supabase.from('blocked_dates').select('id').eq('date', parsed.data.visit_date).maybeSingle();
  if (blocked) return Response.json({ success: false, message: 'That date is unavailable.' }, { status: 409 });

  const { data: confirmed } = await supabase
    .from('bookings')
    .select('id')
    .eq('visit_date', parsed.data.visit_date)
    .eq('status', 'confirmed')
    .maybeSingle();
  if (confirmed) return Response.json({ success: false, message: 'That date already has a confirmed visit.' }, { status: 409 });

  const reference = await generateBookingReference();
  const userId = await getCurrentUserId();
  const { data, error } = await supabase
    .from('bookings')
    .insert({ ...parsed.data, reference, user_id: userId, status: 'pending' })
    .select('*')
    .single<Booking>();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  await sendBookingReceivedEmails(data);
  return Response.json({ success: true, booking: data });
}
