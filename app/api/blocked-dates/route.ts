import { z } from 'zod';
import { requireAdminResponse, requireSupabase } from '@/lib/api-utils';
import { getSupabaseAdmin } from '@/lib/supabase';

const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional().nullable(),
});

export async function GET() {
  const setupResponse = requireSupabase('Blocked dates');
  if (setupResponse) return setupResponse;
  const adminResponse = await requireAdminResponse();
  if (adminResponse) return adminResponse;

  const { data, error } = await getSupabaseAdmin().from('blocked_dates').select('*').order('date');
  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, blockedDates: data });
}

export async function POST(request: Request) {
  const setupResponse = requireSupabase('Blocked dates');
  if (setupResponse) return setupResponse;
  const adminResponse = await requireAdminResponse();
  if (adminResponse) return adminResponse;

  const parsed = blockedDateSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

  const { data, error } = await getSupabaseAdmin().from('blocked_dates').insert(parsed.data).select('*').single();
  if (error) return Response.json({ success: false, message: error.message }, { status: 500 });
  return Response.json({ success: true, blockedDate: data });
}
