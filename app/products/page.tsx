import type { Metadata } from 'next';
import { ProductGrid } from '@/components/products/ProductGrid';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import type { Product } from '@/lib/product-types';

// Cached for 5 minutes and revalidated on demand by product writes
// (see revalidatePath() calls in app/api/products routes) — the catalogue
// changes rarely, so there's no need to hit Postgres on every single view.
export const revalidate = 300;

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Farm Products & Livestock | Nola Farms',
    description:
      'Shop fresh farm produce, exotic livestock, and grain from Nola Farms — two ranches in Oloitoktok and Laikipia, Kenya.',
    keywords: ['buy goats Kenya', 'buy cattle Laikipia', 'farm produce Kenya', 'exotic livestock Kenya', 'wheat Laikipia', 'spinach Oloitoktok', 'Nola Farms products'],
    path: '/products',
    imageAlt: 'Nola Farms products — livestock and farm produce from Kenya',
  });
}

async function getProducts(): Promise<Product[]> {
  if (!isDbConfigured()) return [];
  await ensureMigrated();
  const sql = getDb();
  return sql<Product[]>`SELECT * FROM products WHERE available = TRUE ORDER BY sort_order, name`;
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="pt-16">
      {/* Hero strip */}
      <div className="bg-farm-dark py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-leaf">
            Oloitoktok &amp; Laikipia
          </p>
          <h1 className="mt-3 font-serif text-4xl text-cream-primary md:text-5xl">
            Fresh from the Ranch.
          </h1>
          <p className="mt-4 max-w-xl text-cream-secondary/70">
            Livestock, vegetables, fruits, and grains from two working ranches in Kenya.
            Order online — we&apos;ll contact you to arrange delivery or collection.
          </p>
        </div>
      </div>

      {/* Products */}
      <section className="bg-cream-primary px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <ProductGrid products={products} />
        </div>
      </section>
    </main>
  );
}
