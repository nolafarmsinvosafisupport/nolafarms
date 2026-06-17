import { profileSchema, requireDb, requireUserResponse } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { UserProfile } from '@/lib/booking-types';

export async function GET() {
  const setup = requireDb('User profile');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  const [profile] = await sql<UserProfile[]>`SELECT * FROM user_profiles WHERE clerk_user_id = ${userId!}`;
  return Response.json({ success: true, profile: profile ?? null });
}

export async function POST() {
  const setup = requireDb('User profile');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const sql = getDb();
  const [profile] = await sql<UserProfile[]>`
    INSERT INTO user_profiles (clerk_user_id) VALUES (${userId!})
    ON CONFLICT (clerk_user_id) DO UPDATE SET updated_at = NOW()
    RETURNING *
  `;
  return Response.json({ success: true, profile });
}

export async function PATCH(request: Request) {
  const setup = requireDb('User profile');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const parsed = profileSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

  const { phone_number, notify_on_confirm, notify_on_reminder, notify_on_rejection } = parsed.data;
  const sql = getDb();

  const [profile] = await sql<UserProfile[]>`
    INSERT INTO user_profiles (clerk_user_id, phone_number, notify_on_confirm, notify_on_reminder, notify_on_rejection)
    VALUES (
      ${userId!},
      ${phone_number ?? null},
      ${notify_on_confirm ?? true},
      ${notify_on_reminder ?? true},
      ${notify_on_rejection ?? true}
    )
    ON CONFLICT (clerk_user_id) DO UPDATE SET
      phone_number        = COALESCE(EXCLUDED.phone_number, user_profiles.phone_number),
      notify_on_confirm   = COALESCE(EXCLUDED.notify_on_confirm, user_profiles.notify_on_confirm),
      notify_on_reminder  = COALESCE(EXCLUDED.notify_on_reminder, user_profiles.notify_on_reminder),
      notify_on_rejection = COALESCE(EXCLUDED.notify_on_rejection, user_profiles.notify_on_rejection),
      updated_at = NOW()
    RETURNING *
  `;
  return Response.json({ success: true, profile });
}
