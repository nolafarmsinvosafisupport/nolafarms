import { requireSupabase, requireUserResponse } from '@/lib/api-utils';
import { isCurrentUserAdmin } from '@/lib/auth';
import type { Booking } from '@/lib/booking-types';
import { canVisitorCancel } from '@/lib/booking-utils';
import { sendStatusEmail } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const setupResponse = requireSupabase('Cancel booking');
  if (setupResponse) return setupResponse;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const supabase = getSupabaseAdmin();
  const { data: booking, error: readError } = await supabase.from('bookings').select('*').eq('id', params.id).single<Booking>();
  if (readError) return Response.json({ success: false, message: readError.message }, { status: 404 });

  const admin = await isCurrentUserAdmin();
  if (!admin && booking.user_id !== userId) return Response.json({ success: false, message: 'You can only cancel your own bookings.' }, { status: 403 });
  if (!admin && !canVisitorCancel(booking)) return Response.json({ success: false, message: 'This booking can no longer be cancelled online.' }, { status: 409 });

  const body = await request.json().catch(() => ({}));
  const note = typeof body.admin_note === 'string' ? body.admin_note : null;
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled', admin_note: note, cancelled_at: new Date().toISOString(), cancellation_by: admin ? 'admin' : 'visitor', updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('*')
    .single<Booking>();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  await sendStatusEmail(data, 'cancelled', note);
  return Response.json({ success: true, booking: data });
}
