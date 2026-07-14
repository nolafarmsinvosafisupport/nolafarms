import { unstable_cache } from 'next/cache';
import { ShieldCheck, Truck, BadgeCheck, Headset } from 'lucide-react';
import { TrustBadges } from '@/components/products/TrustBadges';
import { HighDemandCarousel } from './HighDemandCarousel';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import type { Product } from '@/lib/product-types';

/**
 * The three breeds this section leads with. Kept in code rather than a DB flag because it is an
 * editorial choice about the homepage, not product data — but the photo, copy, badge and tags all
 * come from the database, so an admin can change everything that shows here from /admin/products.
 */
const FEATURED_SLUGS = ['girolando-cattle', 'boran-cattle', 'holstein-dairy-cattle'] as const;

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'Healthy & Vaccinated', description: 'All animals are vet-checked and up to date.' },
  { icon: Truck, label: 'Nationwide Delivery', description: 'Safe and reliable transport across Kenya.' },
  { icon: BadgeCheck, label: 'Quality Guaranteed', description: 'We guarantee quality and customer satisfaction.' },
  { icon: Headset, label: 'Expert Support', description: 'Our team is here to help you succeed.' },
];

const getFeatured = unstable_cache(
  async (): Promise<Product[]> => {
    if (!isDbConfigured()) return [];
    await ensureMigrated();
    const sql = getDb();
    const rows = await sql<Product[]>`
      SELECT * FROM products WHERE slug = ANY(${[...FEATURED_SLUGS]}) AND available = TRUE
    `;
    // Preserve the order in FEATURED_SLUGS — ANY() gives no ordering guarantee.
    return FEATURED_SLUGS.map((slug) => rows.find((r) => r.slug === slug)).filter((p): p is Product => Boolean(p));
  },
  ['home-high-demand'],
  { revalidate: 300, tags: ['products'] },
);

export async function HighDemandSection() {
  const products = await getFeatured();

  // A missing product must never blow up the homepage.
  if (products.length === 0) return null;

  return (
    <section className="bg-farm-dark">
      {/* Title + carousel fill one screen (minus the fixed navbar). The trust row deliberately
          starts below that fold, so it appears as the visitor begins to scroll. */}
      <div className="home-demand-stage mx-auto flex w-full max-w-[1600px] flex-col justify-center px-6 lg:px-[10%]">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold-warm">Premium Livestock</p>
          <h2 className="home-demand-title mt-1.5 font-serif text-cream-primary">Our High Demand Products</h2>
          <p className="mt-2 text-sm leading-6 text-cream-secondary/65">
            Carefully bred for performance, health and productivity — trusted by farmers across Kenya.
          </p>
        </div>

        <div className="mt-5">
          <HighDemandCarousel products={products} />
        </div>
      </div>

      {/* Quality assurance — below the fold on purpose. */}
      <div className="mx-auto w-full max-w-[1600px] px-6 pb-12 lg:px-[10%]">
        <div className="rounded-2xl border border-cream-primary/10 bg-brand-deep/40 px-6 py-6">
          <TrustBadges badges={TRUST_BADGES} dark />
        </div>
      </div>
    </section>
  );
}
