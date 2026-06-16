import { requireAdminResponse, requireSupabase } from '@/lib/api-utils';
import type { Booking } from '@/lib/booking-types';
import { sendStatusEmail } from '@/lib/email';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const setupResponse = requireSupabase('Reject booking');
  if (setupResponse) return setupResponse;
  const adminResponse = await requireAdminResponse();
  if (adminResponse) return adminResponse;

  const body = await request.json().catch(() => ({}));
  const note = typeof body.admin_note === 'string' ? body.admin_note : null;
  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .update({ status: 'rejected', admin_note: note, rejected_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('*')
    .single<Booking>();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  await sendStatusEmail(data, 'rejected', note);
  return Response.json({ success: true, booking: data });
}
