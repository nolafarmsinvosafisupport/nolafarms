import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb } from '@/lib/db';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Blocked dates');
  if (setup) return setup;
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  await sql`DELETE FROM blocked_dates WHERE id = ${params.id}`;
  return Response.json({ success: true });
}
