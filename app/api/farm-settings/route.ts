import { requireAdminResponse, requireSupabase } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET() {
  const setup = requireSupabase('Farm settings');
  if (setup) return setup;
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const { data, error } = await getSupabaseAdmin()
    .from('farm_settings')
    .select('*')
    .eq('id', 1)
    .single();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, settings: data });
}

export async function PATCH(request: Request) {
  const setup = requireSupabase('Farm settings');
  if (setup) return setup;
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const body = await request.json();
  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (typeof body.admin_notification_email === 'string') {
    updates.admin_notification_email = body.admin_notification_email.trim() || null;
  }
  if (typeof body.reminder_emails_enabled === 'boolean') {
    updates.reminder_emails_enabled = body.reminder_emails_enabled;
  }

  const { data, error } = await getSupabaseAdmin()
    .from('farm_settings')
    .update(updates)
    .eq('id', 1)
    .select('*')
    .single();

  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, settings: data });
}
