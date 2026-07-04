import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MapPin, CheckCircle2, MessageCircle, Package } from 'lucide-react';
import { ProductImageGallery } from '@/components/products/ProductImageGallery';
import { ProductAddToCart } from '@/components/products/ProductAddToCart';
import { JsonLd } from '@/components/ui/JsonLd';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { productJsonLd } from '@/lib/schema';
import type { Product } from '@/lib/product-types';
import { CATEGORY_LABELS, RANCH_LABELS } from '@/lib/product-types';

// Cached for 5 minutes and revalidated on demand by product writes
// (see revalidatePath() calls in app/api/products routes).
export const revalidate = 300;

async function getProduct(slug: string): Promise<Product | null> {
  if (!isDbConfigured()) return null;
  await ensureMigrated();
  const sql = getDb();
  const [product] = await sql<Product[]>`SELECT * FROM products WHERE slug = ${slug} LIMIT 1`;
  return product ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return {};
  return pageMetadata({
    title: `${product.name} | Nola Farms`,
    description: product.description ?? `Buy ${product.name} from Nola Farms, Kenya.`,
    keywords: [product.name, CATEGORY_LABELS[product.category], RANCH_LABELS[product.ranch], 'Nola Farms', 'farm produce Kenya'],
    path: `/products/${product.slug}`,
    image: product.images[0],
    imageAlt: `${product.name} — Nola Farms`,
  });
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const price = product.price ? parseFloat(product.price) : null;
  const compareAt = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
  const isOnSale = price !== null && compareAt !== null && compareAt > price;
  const whatsappText = encodeURIComponent(`Hello, I'm interested in ordering ${product.name} from Nola Farms. Please provide more details.`);
  const whatsappNumber = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : '254750958780';

  return (
    <main className="pt-16 bg-cream-primary min-h-screen">
      <JsonLd data={productJsonLd(product)} />
      {/* Breadcrumb */}
      <div className="border-b border-farm-border bg-cream-secondary px-6 py-3 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <nav className="flex items-center gap-2 text-xs text-brand-deep/50">
            <Link href="/" className="hover:text-brand-deep">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-brand-deep">Products</Link>
            <span>/</span>
            <span className="text-brand-deep">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Images */}
          <ProductImageGallery images={product.images} name={product.name} />

          {/* Details */}
          <div>
            {/* Badges */}
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="flex items-center gap-1 rounded-full bg-brand-leaf/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-leaf">
                <Package size={10} />
                {CATEGORY_LABELS[product.category]}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-farm-border/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-deep/70">
                <MapPin size={10} />
                {RANCH_LABELS[product.ranch]}
              </span>
            </div>

            <h1 className="font-serif text-3xl text-brand-deep md:text-4xl">{product.name}</h1>

            {/* Price */}
            <div className="mt-4">
              {price !== null ? (
                <div className="flex items-baseline gap-2">
                  <span className="font-serif text-2xl font-semibold text-brand-deep">
                    KES {price.toLocaleString()}
                  </span>
                  <span className="text-sm text-brand-deep/55">{product.price_unit}</span>
                  {isOnSale && (
                    <span className="text-sm text-brand-deep/40 line-through">
                      KES {compareAt!.toLocaleString()}
                    </span>
                  )}
                </div>
              ) : (
                <p className="font-semibold text-gold-warm">Contact for Price</p>
              )}
              {product.bulk_info && (
                <p className="mt-1.5 text-sm text-brand-leaf font-medium">{product.bulk_info}</p>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <p className="mt-5 leading-7 text-brand-deep/75">{product.description}</p>
            )}

            {/* Details list */}
            {product.details.length > 0 && (
              <ul className="mt-5 space-y-2">
                {product.details.map((d, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-brand-deep/80">
                    <CheckCircle2 size={14} className="mt-0.5 flex-shrink-0 text-brand-leaf" />
                    {d}
                  </li>
                ))}
              </ul>
            )}

            {/* Add to cart */}
            <div className="mt-8 border-t border-farm-border pt-6">
              <ProductAddToCart product={product} />
            </div>

            {/* WhatsApp enquiry */}
            <div className="mt-4">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-farm-border px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-deep transition-colors hover:bg-cream-secondary"
              >
                <MessageCircle size={14} />
                Enquire on WhatsApp
              </a>
            </div>

            {/* Ranch info */}
            <div className="mt-6 border border-farm-border bg-cream-warm p-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-deep/40">Ranch</p>
              <p className="mt-1 text-sm font-medium text-brand-deep">{RANCH_LABELS[product.ranch]}</p>
              <p className="mt-1 text-xs text-brand-deep/60">
                {product.ranch === 'oloitoktok' && 'Oloitoktok County, Kenya — Cattle, Goats, Sheep, Pigs, Vegetables'}
                {product.ranch === 'laikipia' && 'Laikipia County, Kenya — Grains & Crops'}
                {product.ranch === 'both' && 'Available from both our Oloitoktok and Laikipia ranches'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
