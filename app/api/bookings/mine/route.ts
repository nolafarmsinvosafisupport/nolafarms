import { requireSupabase, requireUserResponse } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const setupResponse = requireSupabase('My bookings');
  if (setupResponse) return setupResponse;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const { data, error } = await getSupabaseAdmin()
    .from('bookings')
    .select('*')
    .eq('user_id', userId)
    .order('visit_date', { ascending: false });

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, bookings: data });
}
