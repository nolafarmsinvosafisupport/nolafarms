import Image from 'next/image';
import Link from 'next/link';
import { unstable_cache } from 'next/cache';
import { ArrowRight, MessageCircle, Truck, ShieldCheck, BadgeCheck, Headset } from 'lucide-react';
import { TrustBadges } from '@/components/products/TrustBadges';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { whatsappHref } from '@/lib/whatsapp';
import type { Product } from '@/lib/product-types';

/**
 * The three breeds this section leads with. Kept in code rather than a DB flag because it is an
 * editorial choice about the homepage, not product data — but the copy, photo, price, badge and
 * tags all come from the database, so an admin can change everything that appears here from
 * /admin/products without touching code.
 */
const FEATURED_SLUGS = ['girolando-cattle', 'boran-cattle', 'holstein-dairy-cattle'] as const;

const TRUST_BADGES = [
  { icon: ShieldCheck, label: '100% Healthy Animals', description: 'Vet-checked & certified' },
  { icon: Truck, label: 'Nationwide Delivery', description: 'Safe & reliable transport' },
  { icon: BadgeCheck, label: 'Quality Guarantee', description: 'Satisfaction guaranteed' },
  { icon: Headset, label: 'Expert Support', description: "We're here to help" },
];

const getFeatured = unstable_cache(
  async (): Promise<Product[]> => {
    if (!isDbConfigured()) return [];
    await ensureMigrated();
    const sql = getDb();
    const rows = await sql<Product[]>`
      SELECT * FROM products WHERE slug = ANY(${[...FEATURED_SLUGS]}) AND available = TRUE
    `;
    // Preserve the order in FEATURED_SLUGS — SQL gives no ordering guarantee from ANY().
    return FEATURED_SLUGS.map((slug) => rows.find((r) => r.slug === slug)).filter((p): p is Product => Boolean(p));
  },
  ['home-high-demand'],
  { revalidate: 300, tags: ['products'] },
);

function priceLabel(product: Product) {
  const price = product.price ? parseFloat(product.price) : null;
  if (price === null) return { from: false, text: 'Contact for Price' };
  return { from: true, text: `KSh ${price.toLocaleString()}` };
}

export async function HighDemandSection() {
  const products = await getFeatured();

  // A missing product must not blow up the homepage — if all three are gone, render nothing.
  if (products.length === 0) return null;

  const bulkHref = whatsappHref('Hello, I have a bulk order enquiry for Nola Ranches.');

  return (
    <section className="home-demand bg-cream-primary px-6 lg:px-[10%]">
      <div className="mx-auto w-full max-w-[1600px]">
        {/* Heading */}
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-leaf">Top Selling</p>
          <h2 className="home-demand-title mt-1 font-serif text-brand-deep">Our High Demand Products</h2>
          <p className="mt-2 text-sm leading-6 text-brand-deep/60">
            Premium quality livestock and farm animals — healthy, productive, and ready for your farm.
          </p>
        </div>

        {/* Cards */}
        <div className="home-demand-gap grid gap-5 md:grid-cols-3">
          {products.map((product) => {
            const price = priceLabel(product);
            const enquireHref = whatsappHref(
              `Hello, I'm interested in the ${product.name} at Nola Ranches. Please provide more details.`,
            );

            return (
              <article
                key={product.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-farm-border bg-cream-warm shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="home-demand-media relative w-full overflow-hidden bg-cream-secondary">
                  <Image
                    src={product.images[0] ?? '/images/farm/farm.webp'}
                    alt={product.name}
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    // Anchored above centre. The card photo is a short wide strip, and a centred
                    // crop of a full-body livestock shot lands squarely on rumps, legs and udders.
                    className="object-cover object-[center_28%]"
                  />

                  {product.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-brand-leaf px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                      {product.badge}
                    </span>
                  )}

                  <span className="absolute bottom-3 left-3 flex items-center gap-2 rounded-lg bg-farm-dark/85 px-3 py-1.5 text-white backdrop-blur-sm">
                    <Truck size={14} className="flex-shrink-0" />
                    <span className="text-[10px] font-semibold leading-tight">
                      Nationwide Delivery
                      <span className="block font-normal text-white/70">Available</span>
                    </span>
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-serif text-xl text-brand-deep">{product.name}</h3>
                  {product.description && (
                    <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-brand-deep/60">{product.description}</p>
                  )}

                  {/* Tight enough that three tags stay on ONE row. "Drought Tolerant, Premium Beef,
                      Highly Fertile" wrapped to a second row at the old padding, and because the
                      grid stretches, that one wrap made all three cards taller. */}
                  {product.tags.length > 0 && (
                    <div className="mt-2.5 flex flex-wrap gap-1">
                      {product.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="flex items-center gap-0.5 whitespace-nowrap rounded-full border border-farm-border bg-cream-primary px-1.5 py-0.5 text-[9px] font-medium text-brand-deep/70"
                        >
                          <BadgeCheck size={10} className="flex-shrink-0 text-brand-leaf" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Price + primary action share a row, as in the design. mt-auto pins them to the
                      bottom so cards with shorter descriptions still line up. */}
                  <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="min-w-0">
                      {price.from && (
                        <p className="text-[10px] font-medium uppercase tracking-wide text-brand-deep/40">From</p>
                      )}
                      <p
                        className={`truncate font-semibold ${
                          price.from ? 'text-lg text-brand-leaf' : 'text-sm text-gold-warm'
                        }`}
                      >
                        {price.text}
                      </p>
                    </div>

                    <Link
                      href={`/products/${product.slug}`}
                      className="flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-farm-dark px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-brand-primary"
                    >
                      View Product
                      <ArrowRight size={13} />
                    </Link>
                  </div>

                  <a
                    href={enquireHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2.5 flex items-center justify-center gap-2 rounded-lg border border-farm-border py-2.5 text-[10px] font-semibold uppercase tracking-widest text-brand-deep transition-colors hover:border-brand-leaf hover:text-brand-leaf"
                  >
                    <MessageCircle size={13} />
                    Enquire on WhatsApp
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        {/* Bulk orders + farm visits. The heading names two things, so it offers two doors. */}
        <div className="home-demand-gap flex flex-col items-start justify-between gap-4 rounded-2xl bg-farm-dark p-5 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-serif text-xl text-cream-primary">Bulk Orders &amp; Farm Visits</h3>
            <p className="mt-1 text-sm text-cream-secondary/70">
              Special pricing on bulk orders — or come and see the herd for yourself.
            </p>
          </div>
          <div className="flex flex-shrink-0 flex-wrap gap-2">
            <a
              href={bulkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-brand-leaf px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-cream-primary hover:text-brand-deep"
            >
              <MessageCircle size={13} />
              Bulk Orders
            </a>
            <Link
              href="/services"
              className="flex items-center gap-2 rounded-lg border border-cream-primary/30 px-5 py-2.5 text-[10px] font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-cream-primary/10"
            >
              Book a Visit
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* Trust row */}
        <div className="home-demand-gap border-t border-farm-border pt-4">
          <TrustBadges badges={TRUST_BADGES} />
        </div>
      </div>
    </section>
  );
}
