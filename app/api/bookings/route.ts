import { requireAdminResponse, requireSupabase } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const setupResponse = requireSupabase('Admin bookings');
  if (setupResponse) return setupResponse;
  const adminResponse = await requireAdminResponse();
  if (adminResponse) return adminResponse;

  const { searchParams } = new URL(request.url);
  let query = getSupabaseAdmin().from('bookings').select('*').order('created_at', { ascending: false });

  const status = searchParams.get('status');
  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const search = searchParams.get('search');

  if (status && status !== 'all') query = query.eq('status', status);
  if (from) query = query.gte('visit_date', from);
  if (to) query = query.lte('visit_date', to);
  if (search) query = query.or(`full_name.ilike.%${search}%,phone_number.ilike.%${search}%,email.ilike.%${search}%,reference.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, bookings: data });
}
