import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryTiles } from '@/components/products/CategoryTiles';
import { ProductStatsBar } from '@/components/products/ProductStatsBar';
import { TrustBadges } from '@/components/products/TrustBadges';
import { Truck, ShieldCheck, Sprout, Headset } from 'lucide-react';
import { SITE } from '@/lib/constants';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import type { Product } from '@/lib/product-types';

// Not ISR: this route has no dynamic segments, so Next.js would try to
// prerender it during `next build` — which fails on Railway because the
// build step can't reach postgres.railway.internal (that hostname only
// resolves at runtime, inside Railway's private network). force-dynamic
// renders on every request instead, avoiding any build-time DB access.
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Farm Products & Livestock | Nola Ranches',
    description:
      'Shop fresh farm produce, exotic livestock, and grain from Nola Ranches — two ranches in Oloitoktok and Laikipia, Kenya.',
    keywords: ['buy goats Kenya', 'buy cattle Laikipia', 'farm produce Kenya', 'exotic livestock Kenya', 'wheat Laikipia', 'spinach Oloitoktok', 'Nola Ranches products'],
    path: '/products',
    imageAlt: 'Nola Ranches products — livestock and farm produce from Kenya',
  });
}

// Cache the available-products query for 5 minutes so repeat views and crawler
// hits don't re-query Postgres on every request (keeps Railway CPU/DB load low).
// force-dynamic (above) still prevents any build-time DB access; unstable_cache
// serves cached data across requests at runtime, and is busted immediately when
// an admin creates/edits/deletes a product via revalidateTag('products') in the
// app/api/products routes.
const getProducts = unstable_cache(
  async (): Promise<Product[]> => {
    if (!isDbConfigured()) return [];
    await ensureMigrated();
    const sql = getDb();
    return sql<Product[]>`SELECT * FROM products WHERE available = TRUE ORDER BY sort_order, name`;
  },
  ['products-available'],
  { revalidate: 300, tags: ['products'] },
);

const TRUST_BADGES = [
  { icon: Truck, label: 'Farm to You', description: 'Directly from our ranches to your table' },
  { icon: ShieldCheck, label: 'Quality Guaranteed', description: 'Fresh, safe, and carefully selected' },
  { icon: Sprout, label: 'Sustainable Farming', description: 'Ethical practices for a better tomorrow' },
  { icon: Headset, label: 'We Are Here', description: 'Chat with us for orders and enquiries' },
];

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

      <section className="bg-cream-primary px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">
          <CategoryTiles products={products} />
          <ProductStatsBar products={products} />

          <Suspense fallback={null}>
            <ProductGrid products={products} />
          </Suspense>

          {/* Bulk orders CTA */}
          <div className="flex flex-col items-start justify-between gap-4 bg-farm-dark p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-serif text-xl text-cream-primary">Need bulk orders or a custom request?</p>
              <p className="mt-1 text-sm text-cream-secondary/70">We supply farms, institutions, schools and businesses.</p>
            </div>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hello, I have a bulk order enquiry for Nola Ranches.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 border border-cream-primary/30 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-cream-primary/10"
            >
              Contact Us
            </a>
          </div>

          <div className="border-t border-farm-border pt-8">
            <TrustBadges badges={TRUST_BADGES} />
          </div>
        </div>
      </section>
    </main>
  );
}
