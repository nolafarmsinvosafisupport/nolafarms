import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdminResponse, requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import type { BlockedDate } from '@/lib/booking-types';

const blockedDateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().optional().nullable(),
});

export async function GET() {
  const setup = requireDb('Blocked dates');
  if (setup) return setup;
  await ensureMigrated();
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const sql = getDb();
  const blockedDates = await sql<BlockedDate[]>`SELECT * FROM blocked_dates ORDER BY date`;
  return Response.json({ success: true, blockedDates });
}

export async function POST(request: Request) {
  const setup = requireDb('Blocked dates');
  if (setup) return setup;
  await ensureMigrated();
  const admin = await requireAdminResponse();
  if (admin) return admin;

  const parsed = blockedDateSchema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });

  const sql = getDb();
  const [blockedDate] = await sql<BlockedDate[]>`
    INSERT INTO blocked_dates (date, reason) VALUES (${parsed.data.date}, ${parsed.data.reason ?? null})
    ON CONFLICT (date) DO NOTHING
    RETURNING *
  `;
  revalidateTag('availability');
  return Response.json({ success: true, blockedDate });
}
