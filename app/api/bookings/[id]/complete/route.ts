import { requireAdminResponse, requireSupabase } from '@/lib/api-utils';
import type { Booking } from '@/lib/booking-types';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PATCH(_request: Request, { params }: { params: { id: string } }) {
  const setupResponse = requireSupabase('Complete booking');
  if (setupResponse) return setupResponse;
  const adminResponse = await requireAdminResponse();
  if (adminResponse) return adminResponse;

  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select('*')
    .single<Booking>();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, booking: data });
}
