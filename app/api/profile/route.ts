import { profileSchema, requireSupabase, requireUserResponse } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const setupResponse = requireSupabase('User profile');
  if (setupResponse) return setupResponse;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const { data, error } = await getSupabaseAdmin().from('user_profiles').select('*').eq('clerk_user_id', userId).maybeSingle();
  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, profile: data });
}

export async function POST() {
  const setupResponse = requireSupabase('User profile');
  if (setupResponse) return setupResponse;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .upsert({ clerk_user_id: userId }, { onConflict: 'clerk_user_id' })
    .select('*')
    .single();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, profile: data });
}

export async function PATCH(request: Request) {
  const setupResponse = requireSupabase('User profile');
  if (setupResponse) return setupResponse;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await getSupabaseAdmin()
    .from('user_profiles')
    .upsert({ clerk_user_id: userId, ...parsed.data, updated_at: new Date().toISOString() }, { onConflict: 'clerk_user_id' })
    .select('*')
    .single();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, profile: data });
}
