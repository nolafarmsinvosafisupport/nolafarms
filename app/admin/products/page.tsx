import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { AdminProductDeleteButton } from '@/components/admin/AdminProductDeleteButton';
import { getDb, isDbConfigured } from '@/lib/db';
import type { Product } from '@/lib/product-types';
import { CATEGORY_LABELS, RANCH_LABELS } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getProducts(): Promise<Product[]> {
  if (!isDbConfigured()) return [];
  const sql = getDb();
  return sql<Product[]>`SELECT * FROM products ORDER BY sort_order, name`;
}

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-cream-primary">Products</h1>
          <p className="mt-1 text-xs text-white/40">{products.length} products in catalogue</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-brand-leaf px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-mid transition-colors"
        >
          <Plus size={14} /> Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/30">No products yet. Add your first product.</p>
      ) : (
        <div className="space-y-2">
          {products.map((product) => {
            const price = product.price ? parseFloat(product.price) : null;
            return (
              <div key={product.id} className="flex items-center gap-4 border border-white/10 bg-white/5 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-cream-primary text-sm truncate">{product.name}</span>
                    {!product.available && (
                      <span className="rounded-full bg-red-400/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-400">
                        Unavailable
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="text-xs text-white/40">{CATEGORY_LABELS[product.category]}</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs text-white/40">{RANCH_LABELS[product.ranch]}</span>
                    <span className="text-xs text-white/30">·</span>
                    <span className="text-xs text-white/40">
                      {price !== null ? `KES ${price.toLocaleString()} ${product.price_unit}` : 'Contact for Price'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="flex items-center gap-1.5 border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:text-cream-primary hover:border-white/30 transition-colors"
                  >
                    <Pencil size={12} /> Edit
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
