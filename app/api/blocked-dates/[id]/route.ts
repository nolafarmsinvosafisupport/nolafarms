import { requireAdminResponse, requireSupabase } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const setupResponse = requireSupabase('Blocked dates');
  if (setupResponse) return setupResponse;
  const adminResponse = await requireAdminResponse();
  if (adminResponse) return adminResponse;

  const { error } = await getSupabaseAdmin().from('blocked_dates').delete().eq('id', params.id);
  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true });
}
