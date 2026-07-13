import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { ProductGrid } from '@/components/products/ProductGrid';
import { TrustBadges } from '@/components/products/TrustBadges';
import { Truck, ShieldCheck, Sprout, Headset } from 'lucide-react';
import { SITE } from '@/lib/constants';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import { filterVisibleProducts } from '@/lib/category-visibility';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

// Not ISR: this route has no dynamic segments, so Next.js would try to
// prerender it during `next build` — which fails on Railway because the
// build step can't reach postgres.railway.internal (that hostname only
// resolves at runtime, inside Railway's private network). force-dynamic
// renders on every request instead, avoiding any build-time DB access.
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Livestock for Sale | Cattle, Goats, Sheep & Pigs | Nola Ranches',
    description:
      'Buy cattle, goats, sheep and pigs from Nola Ranches — vaccinated, farm-recorded breeding and market stock from our Oloitoktok and Laikipia ranches in Kenya.',
    keywords: ['buy cattle Kenya', 'buy goats Kenya', 'buy pigs Kenya', 'sheep for sale Kenya', 'breeding stock Kenya', 'boar services Kenya', 'Nola Ranches livestock'],
    path: '/products',
    imageAlt: 'Nola Ranches livestock — cattle, goats, sheep and pigs in Kenya',
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

const getCategories = unstable_cache(
  async (): Promise<ProductCategoryPage[]> => {
    if (!isDbConfigured()) return [];
    await ensureMigrated();
    const sql = getDb();
    return sql<ProductCategoryPage[]>`SELECT * FROM product_categories ORDER BY sort_order, name`;
  },
  ['categories-all'],
  { revalidate: 300, tags: ['categories'] },
);

const TRUST_BADGES = [
  { icon: Truck, label: 'Farm to You', description: 'Directly from our ranches to your table' },
  { icon: ShieldCheck, label: 'Quality Guaranteed', description: 'Fresh, safe, and carefully selected' },
  { icon: Sprout, label: 'Sustainable Farming', description: 'Ethical practices for a better tomorrow' },
  { icon: Headset, label: 'We Are Here', description: 'Chat with us for orders and enquiries' },
];

export default async function ProductsPage() {
  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()]);
  // Categories no longer render anything public — the picture tiles and the /products/livestock
  // landing page are gone. They are still loaded here for one reason: an admin can toggle a whole
  // category inactive (or "coming soon") to bulk-hide every product under it in one switch.
  const products = filterVisibleProducts(allProducts, categories);

  return (
    <main className="pt-16">
      {/* Hero strip */}
      <div className="bg-farm-dark py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-leaf">
            Oloitoktok &amp; Laikipia
          </p>
          <h1 className="mt-3 font-serif text-4xl text-cream-primary md:text-5xl">
            Our Livestock.
          </h1>
          <p className="mt-4 max-w-xl text-cream-secondary/70">
            Cattle, goats, sheep and pigs from two working ranches in Kenya — vaccinated,
            farm-recorded, and selected for performance. Enquire and we&apos;ll arrange the rest.
          </p>
        </div>
      </div>

      <section className="bg-cream-primary px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-8">

          <Suspense fallback={null}>
            <ProductGrid products={products} categories={categories} />
          </Suspense>

          {/* Bulk orders CTA */}
          <div className="flex flex-col items-start justify-between gap-4 rounded-xl bg-farm-dark p-6 sm:flex-row sm:items-center">
            <div>
              <p className="font-serif text-xl text-cream-primary">Need bulk orders or a custom request?</p>
              <p className="mt-1 text-sm text-cream-secondary/70">We supply farms, institutions, schools and businesses.</p>
            </div>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hello, I have a bulk order enquiry for Nola Ranches.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 rounded-lg border border-cream-primary/30 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-cream-primary/10"
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
