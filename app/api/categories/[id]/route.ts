import { revalidatePath, revalidateTag } from 'next/cache';
import { requireDb, requireAdminResponse, categoryUpdateSchema, parseJsonBody, dbErrorResponse } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import type { ProductCategoryPage } from '@/lib/category-types';

export const dynamic = 'force-dynamic';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Categories');
  if (setup) return setup;
  await ensureMigrated();

  const { id } = await params;
  const sql = getDb();

  // Accept either UUID id or slug
  const [category] = await sql<ProductCategoryPage[]>`
    SELECT * FROM product_categories WHERE id = ${id} OR slug = ${id} LIMIT 1
  `;
  if (!category) return Response.json({ success: false, message: 'Category not found.' }, { status: 404 });
  return Response.json({ success: true, category });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Categories');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;
  await ensureMigrated();

  const { id } = await params;
  const { data: rawBody, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = categoryUpdateSchema.safeParse(rawBody);
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;

  const sql = getDb();
  try {
    const [category] = await sql<ProductCategoryPage[]>`
      UPDATE product_categories SET
        slug = COALESCE(${body.slug ?? null}, slug),
        name = COALESCE(${body.name ?? null}, name),
        subtitle = ${body.subtitle !== undefined ? (body.subtitle ?? null) : sql`subtitle`},
        hero_image = ${body.hero_image !== undefined ? (body.hero_image ?? null) : sql`hero_image`},
        hero_description = ${body.hero_description !== undefined ? (body.hero_description ?? null) : sql`hero_description`},
        category_values = COALESCE(${body.category_values ?? null}, category_values),
        cta_label = ${body.cta_label !== undefined ? (body.cta_label ?? null) : sql`cta_label`},
        whatsapp_message = ${body.whatsapp_message !== undefined ? (body.whatsapp_message ?? null) : sql`whatsapp_message`},
        details = COALESCE(${body.details ?? null}, details),
        sort_order = COALESCE(${body.sort_order ?? null}, sort_order),
        parent_id = ${body.parent_id !== undefined ? (body.parent_id ?? null) : sql`parent_id`},
        active = COALESCE(${body.active ?? null}, active),
        coming_soon = COALESCE(${body.coming_soon ?? null}, coming_soon),
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING *
    `;
    if (!category) return Response.json({ success: false, message: 'Category not found.' }, { status: 404 });
    revalidatePath('/products');
    revalidateTag('categories');
    return Response.json({ success: true, category });
  } catch (e) {
    return dbErrorResponse(e, 'Could not update category. Please check the details and try again.');
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const setup = requireDb('Categories');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;
  await ensureMigrated();

  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM product_categories WHERE id = ${id}`;
  revalidatePath('/products');
  revalidateTag('categories');
  return Response.json({ success: true });
}
