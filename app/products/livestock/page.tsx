import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { unstable_cache } from 'next/cache';
import { LivestockCategoryTabs } from '@/components/products/LivestockCategoryTabs';
import { JsonLd } from '@/components/ui/JsonLd';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { pageMetadata } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { breadcrumbSchema } from '@/lib/schema';
import { filterVisibleProducts } from '@/lib/category-visibility';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Our Livestock | Cattle, Goats, Sheep & Pigs | Nola Ranches',
    description:
      'Healthy, productive, farm-raised livestock from Nola Ranches — Boran, Sahiwal, Brahman and Cross Holstein-Friesian cattle, Galla and Boer Cross goats, Dorper sheep, and pedigree breeding pigs from Oloitoktok, Kenya.',
    keywords: ['Boran cattle Kenya', 'Sahiwal cattle Kenya', 'Brahman cattle Kenya', 'Galla goats Kenya', 'Boer goats Kenya', 'Dorper sheep Kenya', 'pig breeding Kenya', 'livestock for sale Kenya'],
    path: '/products/livestock',
    imageAlt: 'Livestock at Nola Ranches — cattle, goats, sheep and pigs in Oloitoktok, Kenya',
  });
}

const LIVESTOCK_CATEGORIES = new Set(['cattle', 'goats', 'sheep', 'pigs']);

const getLivestockProducts = unstable_cache(
  async (): Promise<Product[]> => {
    if (!isDbConfigured()) return [];
    await ensureMigrated();
    const sql = getDb();
    const products = await sql<Product[]>`SELECT * FROM products WHERE available = TRUE ORDER BY sort_order, name`;
    return products.filter((p) => LIVESTOCK_CATEGORIES.has(p.category));
  },
  ['products-livestock'],
  { revalidate: 300, tags: ['products'] },
);

// Fetches every category row (main + sub) rather than a hardcoded slug list, so any
// subcategory an admin adds under Livestock shows up automatically, and the cascade
// visibility rule (an inactive category hides its products everywhere) has the full
// picture to work with.
const getAllCategories = unstable_cache(
  async (): Promise<ProductCategoryPage[]> => {
    if (!isDbConfigured()) return [];
    await ensureMigrated();
    const sql = getDb();
    return sql<ProductCategoryPage[]>`SELECT * FROM product_categories ORDER BY sort_order, name`;
  },
  ['product-categories-all'],
  { revalidate: 300, tags: ['categories'] },
);

export default async function LivestockCategoryPage() {
  const [rawProducts, allCategories] = await Promise.all([getLivestockProducts(), getAllCategories()]);

  const livestock = allCategories.find((c) => c.slug === 'livestock' && c.parent_id === null);
  if (!livestock || !livestock.active || livestock.coming_soon) notFound();

  const products = filterVisibleProducts(rawProducts, allCategories);
  const subcategories = allCategories.filter((c) => c.parent_id === livestock.id && c.active);

  return (
    <main className="pt-16 bg-cream-primary min-h-screen">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'Home', url: SITE.url },
          { name: 'Products', url: `${SITE.url}/products` },
          { name: 'Livestock', url: `${SITE.url}/products/livestock` },
        ])}
      />

      {/* The visible Home / Products / Livestock breadcrumb bar that used to sit here is gone —
          the way back to the catalogue is now an "All Products" pill at the foot of the page.
          The JSON-LD breadcrumb above stays: it is invisible to visitors but is what lets Google
          render the breadcrumb trail in search results, so removing it would cost SEO for nothing. */}
      <LivestockCategoryTabs products={products} categories={subcategories} />
    </main>
  );
}
