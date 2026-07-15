import type { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { unstable_cache } from 'next/cache';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductsHero } from '@/components/products/ProductsHero';
import { TrustBadges } from '@/components/products/TrustBadges';
import { JsonLd } from '@/components/ui/JsonLd';
import { Truck, ShieldCheck, Sprout, Headset } from 'lucide-react';
import { SITE } from '@/lib/constants';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';
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
    title: 'Livestock for Sale — Cattle, Goats, Sheep & Pigs',
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

  // ItemList + breadcrumb structured data — this listing page previously had none. ItemList helps
  // Google understand the livestock catalogue; the breadcrumb renders the trail in results.
  const itemList = itemListSchema(
    products.map((p) => ({
      name: p.name,
      description: p.description ?? `${p.name} from Nola Ranches, Kenya.`,
      url: `${SITE.url}/products/${p.slug}`,
    })),
  );
  const breadcrumb = breadcrumbSchema([
    { name: 'Home', url: SITE.url },
    { name: 'Livestock', url: `${SITE.url}/products` },
  ]);

  return (
    <main className="pt-16">
      <JsonLd data={[breadcrumb, itemList]} />
      {/* Hero. The ~10% side gutter matches the product section below so the headline lines up
          with the category cards; the slideshow bleeds to the full width behind it. */}
      <ProductsHero>
        {/* gold-warm, not brand-leaf: the leaf green is a dark olive and scores ~1.5:1 against a
            photograph — illegible. Gold clears AA. */}
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-warm">
          Oloitoktok &amp; Laikipia
        </p>
        <h1 className="mt-3 font-serif text-4xl text-cream-primary drop-shadow-sm md:text-5xl">
          Our Livestock.
        </h1>
        <p className="mt-4 max-w-xl text-cream-secondary/85">
          Cattle, goats, sheep and pigs from two working ranches in Kenya — vaccinated,
          farm-recorded, and selected for performance. Enquire and we&apos;ll arrange the rest.
        </p>
      </ProductsHero>

      {/* ~10% gutter each side, so the grid no longer runs edge to edge now that the sidebar is
          gone. max-w keeps it from getting silly on an ultrawide monitor. */}
      <section className="bg-cream-primary px-6 py-10 lg:px-[10%]">
        <div className="mx-auto w-full max-w-[1600px] space-y-8">

          <Suspense fallback={null}>
            <ProductGrid products={products} categories={categories} />
          </Suspense>

          {/* Bulk orders CTA — cattle/sheep/goats/pigs banner. The gradient is solid brand-deep
              green on the left (text needs a guaranteed-legible background) fading to transparent
              on the right (where the animals are, per the source photo's composition). Flat on
              mobile instead of left-to-right: text goes full-width there, so a horizontal fade
              would leave the right edge of the text sitting on bare photo. */}
          <div className="relative h-64 overflow-hidden rounded-xl sm:h-72 lg:h-80">
            <Image
              src="/images/banner/bottom banner.png"
              alt="Cattle, sheep, goats and pigs together at Nola Ranches"
              fill
              sizes="(min-width: 1024px) 1600px, 100vw"
              className="object-cover object-right"
            />
            <div className="absolute inset-0 bg-brand-deep/80 sm:bg-transparent sm:bg-gradient-to-r sm:from-brand-deep sm:via-brand-deep/85 sm:to-brand-deep/10" />
            <div className="relative flex h-full flex-col items-start justify-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-serif text-2xl text-cream-primary drop-shadow-sm sm:text-3xl">Need bulk orders or a custom request?</p>
                <p className="mt-2 max-w-sm text-sm text-cream-secondary/85 drop-shadow-sm">We supply farms, institutions, schools and businesses.</p>
              </div>
              <a
                href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hello, I have a bulk order enquiry for Nola Ranches.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 rounded-lg border border-cream-primary/40 bg-cream-primary/5 px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-cream-primary backdrop-blur-sm hover:bg-cream-primary/15"
              >
                Contact Us
              </a>
            </div>
          </div>

          <div className="border-t border-farm-border pt-8">
            <TrustBadges badges={TRUST_BADGES} />
          </div>
        </div>
      </section>
    </main>
  );
}
