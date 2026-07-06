import { requireDb, requireUserResponse } from '@/lib/api-utils';
import { isCurrentUserAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { canCustomerCancelOrder } from '@/lib/product-types';
import type { Order } from '@/lib/product-types';

export async function PATCH(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Cancel order');
  if (setup) return setup;
  const { userId, response } = await requireUserResponse();
  if (response) return response;

  const { id } = await params;
  const sql = getDb();
  const [order] = await sql<Order[]>`SELECT * FROM orders WHERE id = ${id}`;
  if (!order) return Response.json({ success: false, message: 'Order not found.' }, { status: 404 });

  const admin = await isCurrentUserAdmin();
  if (!admin && order.user_id !== userId) {
    return Response.json({ success: false, message: 'You can only cancel your own orders.' }, { status: 403 });
  }
  if (!admin && !canCustomerCancelOrder(order)) {
    return Response.json({ success: false, message: 'This order can no longer be cancelled online.' }, { status: 409 });
  }

  const [updated] = await sql<Order[]>`
    UPDATE orders SET status = 'cancelled', updated_at = NOW() WHERE id = ${id} RETURNING *
  `;
  return Response.json({ success: true, order: updated });
}
