import { requireAdminResponse, requireSupabase } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const setupResponse = requireSupabase('Booking details');
  if (setupResponse) return setupResponse;
  const adminResponse = await requireAdminResponse();
  if (adminResponse) return adminResponse;

  const { data, error } = await getSupabaseAdmin().from('bookings').select('*').eq('id', params.id).single();
  if (error) return Response.json({ success: false, message: error.message }, { status: 404 });
  return Response.json({ success: true, booking: data });
}
