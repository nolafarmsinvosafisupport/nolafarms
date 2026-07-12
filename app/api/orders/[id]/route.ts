import { requireDb, requireAdminResponse, orderUpdateSchema, parseJsonBody, dbErrorResponse } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import { sendOrderStatusEmail } from '@/lib/email';
import type { Order } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Orders');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;
  await ensureMigrated();

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
  await ensureMigrated();

  const { id } = await params;
  const { data: rawBody, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = orderUpdateSchema.safeParse(rawBody);
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;

  const sql = getDb();
  try {
    // Capture the prior status so we only email the customer on an actual change.
    const [prev] = await sql<{ status: string }[]>`SELECT status FROM orders WHERE id = ${id}`;

    const [order] = await sql<Order[]>`
      UPDATE orders SET
        status = COALESCE(${body.status ?? null}, status),
        admin_note = ${body.admin_note !== undefined ? (body.admin_note ?? null) : sql`admin_note`},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!order) return Response.json({ success: false, message: 'Order not found.' }, { status: 404 });

    // Email the customer when the status genuinely changed. Fire-and-forget so a
    // mail hiccup never fails the admin's save. 'new' is skipped inside the helper.
    if (body.status && prev && body.status !== prev.status) {
      sendOrderStatusEmail(order, order.status).catch(() => undefined);
    }

    return Response.json({ success: true, order });
  } catch (e) {
    return dbErrorResponse(e, 'Could not update order. Please try again.');
  }
}
