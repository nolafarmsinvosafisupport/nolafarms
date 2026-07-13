import { revalidatePath, revalidateTag } from 'next/cache';
import { requireDb, requireAdminResponse, productCreateSchema, parseJsonBody, dbErrorResponse } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import type { Product } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const setup = requireDb('Products');
  if (setup) return setup;

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const ranch = searchParams.get('ranch');
  const search = searchParams.get('search');
  const includeUnavailable = searchParams.get('all') === '1';

  await ensureMigrated();
  const sql = getDb();

  let products: Product[];
  if (includeUnavailable) {
    products = await sql<Product[]>`SELECT * FROM products ORDER BY sort_order, name`;
  } else {
    products = await sql<Product[]>`SELECT * FROM products WHERE available = TRUE ORDER BY sort_order, name`;
  }

  let filtered = products;
  if (category && category !== 'all') {
    const livestock = ['cattle', 'goats', 'sheep', 'pigs', 'poultry'];
    if (category === 'livestock') {
      filtered = filtered.filter((p) => livestock.includes(p.category));
    } else {
      filtered = filtered.filter((p) => p.category === category);
    }
  }
  if (ranch && ranch !== 'all') {
    filtered = filtered.filter((p) => p.ranch === ranch || p.ranch === 'both');
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((p) => p.name.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q));
  }

  return Response.json({ success: true, products: filtered });
}

export async function POST(request: Request) {
  const setup = requireDb('Products');
  if (setup) return setup;
  const deny = await requireAdminResponse();
  if (deny) return deny;
  await ensureMigrated();

  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
  const { name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, available, sort_order, is_service } = parsed.data;

  const sql = getDb();
  try {
    const [product] = await sql<Product[]>`
      INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, available, sort_order, is_service)
      VALUES (${name}, ${slug}, ${category}, ${ranch}, ${description ?? null}, ${details ?? []}, ${price ?? null}, ${compare_at_price ?? null}, ${price_unit ?? 'per kg'}, ${bulk_info ?? null}, ${images ?? []}, ${available ?? true}, ${sort_order ?? 0}, ${is_service ?? false})
      RETURNING *
    `;
    revalidatePath('/products');
    revalidateTag('products');
    return Response.json({ success: true, product }, { status: 201 });
  } catch (e) {
    return dbErrorResponse(e, 'Could not create product. Please check the details and try again.');
  }
}
