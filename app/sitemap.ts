import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { filterVisibleProducts } from '@/lib/category-visibility';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

// Generated per request, not at build time: it queries the database for breed pages, and
// postgres.railway.internal does not resolve during a Railway build (the same trap that forced
// /products to be force-dynamic).
export const dynamic = 'force-dynamic';

// The individual breed pages (/products/{slug}) are the money pages for searches like
// "buy Boran cattle Kenya" — without them in the sitemap Google is never pointed at them. Only
// pages a visitor can actually reach are listed (available AND category not hidden), matching the
// public shop exactly.
async function breedPageEntries(base: string): Promise<MetadataRoute.Sitemap> {
  if (!isDbConfigured()) return [];
  try {
    await ensureMigrated();
    const sql = getDb();
    const [products, categories] = await Promise.all([
      sql<Product[]>`SELECT * FROM products WHERE available = TRUE`,
      sql<ProductCategoryPage[]>`SELECT * FROM product_categories`,
    ]);
    return filterVisibleProducts(products, categories).map((p) => ({
      url: `${base}/products/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch {
    // Never let a DB hiccup break the sitemap — fall back to the static routes below.
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/products`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/gallery`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
  ];

  return [...staticRoutes, ...(await breedPageEntries(base))];
}
