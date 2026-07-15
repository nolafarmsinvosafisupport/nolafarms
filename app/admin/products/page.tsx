import Image from 'next/image';
import Link from 'next/link';
import { Plus, Pencil, ImageOff } from 'lucide-react';
import { AdminProductDeleteButton } from '@/components/admin/AdminProductDeleteButton';
import { AdminQuickToggle } from '@/components/admin/AdminQuickToggle';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import { computeHiddenCategoryValues } from '@/lib/category-visibility';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';
import { CATEGORY_LABELS, RANCH_LABELS } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getData(): Promise<{ products: Product[]; categories: ProductCategoryPage[] }> {
  if (!isDbConfigured()) return { products: [], categories: [] };
  await ensureMigrated();
  const sql = getDb();
  const [products, categories] = await Promise.all([
    sql<Product[]>`SELECT * FROM products ORDER BY sort_order, name`,
    sql<ProductCategoryPage[]>`SELECT * FROM product_categories`,
  ]);
  return { products, categories };
}

export default async function AdminProductsPage() {
  const { products, categories } = await getData();

  // The same rule the public shop uses. A product is only on the site if its own `available` flag
  // is on AND its category is active — so the admin count can never disagree with what a visitor
  // actually sees.
  const hiddenCategoryValues = computeHiddenCategoryValues(categories);
  const isCategoryOff = (p: Product) => hiddenCategoryValues.has(p.category);
  const isLive = (p: Product) => p.available && !isCategoryOff(p);
  const liveCount = products.filter(isLive).length;
  const categoryOffCount = products.filter(isCategoryOff).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-brand-deep">Products</h1>
          <p className="mt-1 text-xs text-brand-deep/50">
            {products.length} in catalogue
            <span className="mx-1.5 text-brand-deep/25">·</span>
            <span className="font-semibold text-brand-leaf">{liveCount} live on the site</span>
            {categoryOffCount > 0 && (
              <>
                <span className="mx-1.5 text-brand-deep/25">·</span>
                <span className="text-amber-700">{categoryOffCount} hidden by category</span>
              </>
            )}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand-leaf px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-deep transition-colors"
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="border border-farm-border bg-cream-warm p-12 text-center">
          <p className="text-sm text-brand-deep/50">No products yet.</p>
          <Link href="/admin/products/new" className="mt-4 inline-block text-sm font-semibold text-brand-leaf hover:underline">
            Add your first product →
          </Link>
        </div>
      ) : (
        <div className="border border-farm-border bg-cream-warm">
          {/* Table header */}
          <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 border-b border-farm-border bg-cream-secondary px-5 py-2.5 sm:grid">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Product</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Category</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Ranch</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Price</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Actions</p>
          </div>

          {products.map((product, idx) => {
            const price = product.price ? parseFloat(product.price) : null;
            return (
              <div
                key={product.id}
                className={`flex flex-col gap-3 px-5 py-4 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-4 ${idx > 0 ? 'border-t border-farm-border' : ''} hover:bg-cream-secondary transition-colors`}
              >
                {/* Thumbnail + name + status */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-farm-border bg-cream-secondary">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt=""
                        fill
                        sizes="48px"
                        className="object-cover object-top"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-brand-deep/25">
                        <ImageOff size={16} />
                      </span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="truncate text-sm font-medium text-brand-deep">{product.name}</span>
                    {!product.available && (
                      <span className="flex-shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-600">
                        Hidden
                      </span>
                    )}
                    {/* Distinct from "Hidden": this product's own toggle is ON, but its whole
                        category is switched off, so it is still not on the site. Without this the
                        admin sees a green Visible toggle on a product no visitor can reach. */}
                    {product.available && isCategoryOff(product) && (
                      <span className="flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                        Category off
                      </span>
                    )}
                    {isLive(product) && !product.in_stock && (
                      <span className="flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>

                {/* Category */}
                <span className="text-sm text-brand-deep/60">
                  <span className="mr-1 text-brand-deep/30 sm:hidden">Category: </span>
                  {CATEGORY_LABELS[product.category]}
                </span>

                {/* Ranch */}
                <span className="text-sm text-brand-deep/60">
                  <span className="mr-1 text-brand-deep/30 sm:hidden">Ranch: </span>
                  {RANCH_LABELS[product.ranch]}
                </span>

                {/* Price */}
                <span className="text-sm font-medium">
                  {price !== null ? (
                    <span className="text-brand-deep">KES {price.toLocaleString()} <span className="text-xs text-brand-deep/50">{product.price_unit}</span></span>
                  ) : (
                    <span className="text-amber-700">Contact for price</span>
                  )}
                </span>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <AdminQuickToggle endpoint={`/api/products/${product.id}`} field="available" value={product.available} label="Visible" />
                  <AdminQuickToggle endpoint={`/api/products/${product.id}`} field="in_stock" value={product.in_stock} label="In Stock" />
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-1.5 border border-farm-border px-3 py-1.5 text-xs font-semibold text-brand-deep/60 hover:border-brand-leaf hover:text-brand-leaf transition-colors"
                  >
                    <Pencil size={11} /> Edit
                  </Link>
                  <AdminProductDeleteButton productId={product.id} productName={product.name} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
