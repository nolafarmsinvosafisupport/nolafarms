import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';

export async function GET() {
  const setup = requireDb('Farm settings');
  if (setup) return setup;
  await ensureMigrated();
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  const [settings] = await sql`SELECT * FROM farm_settings WHERE id = 1`;
  return Response.json({ success: true, settings: settings ?? null });
}

export async function PATCH(request: Request) {
  const setup = requireDb('Farm settings');
  if (setup) return setup;
  await ensureMigrated();
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const body = await request.json();
  const sql = getDb();

  const [settings] = await sql`
    UPDATE farm_settings SET
      admin_notification_email  = CASE WHEN ${typeof body.admin_notification_email === 'string'}
                                    THEN ${body.admin_notification_email || null}
                                    ELSE admin_notification_email END,
      reminder_emails_enabled   = CASE WHEN ${typeof body.reminder_emails_enabled === 'boolean'}
                                    THEN ${body.reminder_emails_enabled}
                                    ELSE reminder_emails_enabled END,
      updated_at = NOW()
    WHERE id = 1
    RETURNING *
  `;
  return Response.json({ success: true, settings });
}
