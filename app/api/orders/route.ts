import { requireDb, requireAdminResponse } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Order } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const setup = requireDb('Orders');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');

  const sql = getDb();
  let orders: Order[];

  if (status && status !== 'all') {
    orders = await sql<Order[]>`SELECT * FROM orders WHERE status = ${status} ORDER BY created_at DESC`;
  } else {
    orders = await sql<Order[]>`SELECT * FROM orders ORDER BY created_at DESC`;
  }

  if (search) {
    const q = search.toLowerCase();
    orders = orders.filter(
      (o) =>
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q) ||
        o.reference.toLowerCase().includes(q) ||
        (o.customer_email ?? '').toLowerCase().includes(q),
    );
  }

  return Response.json({ success: true, orders });
}

export async function POST(request: Request) {
  const setup = requireDb('Orders');
  if (setup) return setup;

  const body = await request.json();
  const { customer_name, customer_phone, customer_email, items, delivery_location, delivery_notes } = body;

  if (!customer_name || !customer_phone || !items?.length) {
    return Response.json({ success: false, message: 'Name, phone, and at least one item are required.' }, { status: 400 });
  }

  const sql = getDb();

  // Generate reference: ORD-YYYY-NNNN
  const year = new Date().getFullYear();
  const [{ count }] = await sql<[{ count: string }]>`
    SELECT COUNT(*) as count FROM orders WHERE reference LIKE ${`ORD-${year}-%`}
  `;
  const seq = String(parseInt(count) + 1).padStart(4, '0');
  const reference = `ORD-${year}-${seq}`;

  const [order] = await sql<Order[]>`
    INSERT INTO orders (reference, customer_name, customer_phone, customer_email, items, delivery_location, delivery_notes)
    VALUES (${reference}, ${customer_name}, ${customer_phone}, ${customer_email ?? null}, ${JSON.stringify(items)}, ${delivery_location ?? null}, ${delivery_notes ?? null})
    RETURNING *
  `;

  // Notify admin
  const adminUserId = process.env.CLERK_ADMIN_USER_ID;
  if (adminUserId) {
    const itemCount = items.length;
    await sql`
      INSERT INTO notifications (user_id, type, title, message)
      VALUES (${adminUserId}, 'submitted', ${`New Order ${reference}`}, ${`Order from ${customer_name} — ${itemCount} item${itemCount !== 1 ? 's' : ''}. Phone: ${customer_phone}`})
    `.catch(() => undefined);
  }

  // Dispatch refresh event (server-side — not possible; client handles via redirect + event)
  return Response.json({ success: true, order, reference }, { status: 201 });
}
