import { requireDb, requireAdminResponse, requireUserResponse, parseJsonBody, dbErrorResponse } from '@/lib/api-utils';
import { getDb, ensureMigrated, nextReferenceNumber } from '@/lib/db';
import { ADMIN_LIST_LIMIT } from '@/lib/admin-data';
import { isRateLimited } from '@/lib/rate-limit';
import { sendOrderReceivedEmails } from '@/lib/email';
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

  await ensureMigrated();
  const sql = getDb();

  // Search is done in SQL rather than by loading every order into memory and filtering
  // in JS (which is what this used to do), and the result set is hard-bounded.
  const statusFilter = status && status !== 'all' ? status : null;
  const q = search ? `%${search}%` : null;

  const orders = await sql<Order[]>`
    SELECT * FROM orders
    WHERE (${statusFilter}::text IS NULL OR status = ${statusFilter})
      AND (
        ${q}::text IS NULL
        OR customer_name ILIKE ${q}
        OR customer_phone ILIKE ${q}
        OR reference ILIKE ${q}
        OR COALESCE(customer_email, '') ILIKE ${q}
      )
    ORDER BY created_at DESC
    LIMIT ${ADMIN_LIST_LIMIT}
  `;

  return Response.json({ success: true, orders });
}

export async function POST(request: Request) {
  const setup = requireDb('Orders');
  if (setup) return setup;
  await ensureMigrated();

  // Checkout is account-gated: the /checkout page is already protected by
  // middleware, but the API re-verifies so a direct call can't bypass it.
  const { userId, response: authResponse } = await requireUserResponse();
  if (authResponse) return authResponse;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(`order:${ip}`, 5, 10 * 60 * 1000)) {
    return Response.json({ success: false, message: 'Too many requests. Please try again in a few minutes.' }, { status: 429 });
  }

  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const { customer_name, customer_phone, customer_email, items, delivery_location, delivery_notes } = body as {
    customer_name?: string;
    customer_phone?: string;
    customer_email?: string | null;
    items?: unknown[];
    delivery_location?: string | null;
    delivery_notes?: string | null;
  };

  if (!customer_name || !customer_phone || !Array.isArray(items) || !items.length) {
    return Response.json({ success: false, message: 'Name, phone, and at least one item are required.' }, { status: 400 });
  }

  const sql = getDb();

  try {
    // Generate reference: ORD-YYYY-NNNN (atomic counter — safe under concurrent checkouts)
    const year = new Date().getFullYear();
    const seqNum = await nextReferenceNumber(sql, `orders-${year}`);
    const reference = `ORD-${year}-${String(seqNum).padStart(4, '0')}`;

    const [order] = await sql<Order[]>`
      INSERT INTO orders (reference, user_id, customer_name, customer_phone, customer_email, items, delivery_location, delivery_notes)
      VALUES (${reference}, ${userId}, ${customer_name}, ${customer_phone}, ${customer_email ?? null}, ${JSON.stringify(items)}, ${delivery_location ?? null}, ${delivery_notes ?? null})
      RETURNING *
    `;

    // Notify admin — order_id lets the notification deep-link straight to this order
    const adminUserId = process.env.CLERK_ADMIN_USER_ID;
    if (adminUserId) {
      const itemCount = items.length;
      await sql`
        INSERT INTO notifications (user_id, order_id, type, title, message)
        VALUES (${adminUserId}, ${order.id}, 'submitted', ${`New Order ${reference}`}, ${`Order from ${customer_name} — ${itemCount} item${itemCount !== 1 ? 's' : ''}. Phone: ${customer_phone}`})
      `.catch(() => undefined);
    }

    // Emails the admin (new-order alert) and the customer (receipt), if they gave one.
    // Fire-and-forget so a mail hiccup never fails the order itself.
    sendOrderReceivedEmails(order).catch(() => undefined);

    return Response.json({ success: true, order, reference }, { status: 201 });
  } catch (e) {
    return dbErrorResponse(e, 'Could not place order. Please try again.');
  }
}
