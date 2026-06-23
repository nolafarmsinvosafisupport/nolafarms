import { requireDb, requireAdminResponse } from '@/lib/api-utils';
import { getDb } from '@/lib/db';
import type { Product } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Products');
  if (setup) return setup;

  const { id } = await params;
  const sql = getDb();

  // Accept either UUID id or slug
  const [product] = await sql<Product[]>`
    SELECT * FROM products WHERE id = ${id} OR slug = ${id} LIMIT 1
  `;
  if (!product) return Response.json({ success: false, message: 'Product not found.' }, { status: 404 });
  return Response.json({ success: true, product });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Products');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;

  const { id } = await params;
  const body = await request.json();
  const sql = getDb();

  const [product] = await sql<Product[]>`
    UPDATE products SET
      name = COALESCE(${body.name ?? null}, name),
      slug = COALESCE(${body.slug ?? null}, slug),
      category = COALESCE(${body.category ?? null}, category),
      ranch = COALESCE(${body.ranch ?? null}, ranch),
      description = COALESCE(${body.description ?? null}, description),
      details = COALESCE(${body.details ?? null}, details),
      price = ${body.price !== undefined ? (body.price ?? null) : sql`price`},
      compare_at_price = ${body.compare_at_price !== undefined ? (body.compare_at_price ?? null) : sql`compare_at_price`},
      price_unit = COALESCE(${body.price_unit ?? null}, price_unit),
      bulk_info = ${body.bulk_info !== undefined ? (body.bulk_info ?? null) : sql`bulk_info`},
      images = COALESCE(${body.images ?? null}, images),
      available = COALESCE(${body.available ?? null}, available),
      sort_order = COALESCE(${body.sort_order ?? null}, sort_order),
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `;
  if (!product) return Response.json({ success: false, message: 'Product not found.' }, { status: 404 });
  return Response.json({ success: true, product });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Products');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;

  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM products WHERE id = ${id}`;
  return Response.json({ success: true });
}
