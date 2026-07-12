import { revalidateTag } from 'next/cache';
import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const setup = requireDb('Blocked dates');
  if (setup) return setup;
  await ensureMigrated();
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  await sql`DELETE FROM blocked_dates WHERE id = ${params.id}`;
  revalidateTag('availability');
  return Response.json({ success: true });
}
