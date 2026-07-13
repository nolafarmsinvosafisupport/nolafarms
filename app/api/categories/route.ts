import { revalidatePath, revalidateTag } from 'next/cache';
import { requireDb, requireAdminResponse, categoryCreateSchema, parseJsonBody, dbErrorResponse } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import type { ProductCategoryPage } from '@/lib/category-types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const setup = requireDb('Categories');
  if (setup) return setup;

  await ensureMigrated();
  const sql = getDb();
  const categories = await sql<ProductCategoryPage[]>`SELECT * FROM product_categories ORDER BY sort_order, name`;
  return Response.json({ success: true, categories });
}

export async function POST(request: Request) {
  const setup = requireDb('Categories');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;
  await ensureMigrated();

  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = categoryCreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
  const { slug, name, subtitle, hero_image, hero_description, category_values, cta_label, whatsapp_message, details, sort_order, parent_id, active, coming_soon } = parsed.data;

  const sql = getDb();
  try {
    const [category] = await sql<ProductCategoryPage[]>`
      INSERT INTO product_categories (slug, name, subtitle, hero_image, hero_description, category_values, cta_label, whatsapp_message, details, sort_order, parent_id, active, coming_soon)
      VALUES (${slug}, ${name}, ${subtitle ?? null}, ${hero_image ?? null}, ${hero_description ?? null}, ${category_values}, ${cta_label ?? null}, ${whatsapp_message ?? null}, ${details ?? []}, ${sort_order ?? 0}, ${parent_id ?? null}, ${active ?? true}, ${coming_soon ?? false})
      RETURNING *
    `;
    revalidatePath('/products');
    revalidatePath('/products/livestock');
    revalidateTag('categories');
    return Response.json({ success: true, category }, { status: 201 });
  } catch (e) {
    return dbErrorResponse(e, 'Could not create category. Please check the details and try again.');
  }
}
