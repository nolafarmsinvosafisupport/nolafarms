import { requireDb, requireAdminResponse } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Order } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Orders');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;

  const { id } = await params;
  const sql = getDb();
  const [order] = await sql<Order[]>`SELECT * FROM orders WHERE id = ${id} LIMIT 1`;
  if (!order) return Response.json({ success: false, message: 'Order not found.' }, { status: 404 });
  return Response.json({ success: true, order });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Orders');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;

  const { id } = await params;
  const body = await request.json();
  const sql = getDb();

  const [order] = await sql<Order[]>`
    UPDATE orders SET
      status = COALESCE(${body.status ?? null}, status),
      admin_note = ${body.admin_note !== undefined ? (body.admin_note ?? null) : sql`admin_note`},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!order) return Response.json({ success: false, message: 'Order not found.' }, { status: 404 });
  return Response.json({ success: true, order });
}
