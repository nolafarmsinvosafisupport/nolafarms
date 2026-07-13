import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { AdminCategoryDeleteButton } from '@/components/admin/AdminCategoryDeleteButton';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import type { ProductCategoryPage } from '@/lib/category-types';
import { CATEGORY_LABELS } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getCategories(): Promise<ProductCategoryPage[]> {
  if (!isDbConfigured()) return [];
  await ensureMigrated();
  const sql = getDb();
  return sql<ProductCategoryPage[]>`SELECT * FROM product_categories ORDER BY sort_order, name`;
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-brand-deep">Categories</h1>
          <p className="mt-1 text-xs text-brand-deep/50">{categories.length} category page{categories.length !== 1 ? 's' : ''} (e.g. the Livestock landing page tabs)</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 bg-brand-leaf px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-deep transition-colors"
        >
          <Plus size={14} /> Add Category
        </Link>
      </div>

      {categories.length === 0 ? (
        <div className="border border-farm-border bg-cream-warm p-12 text-center">
          <p className="text-sm text-brand-deep/50">No category pages yet.</p>
          <Link href="/admin/categories/new" className="mt-4 inline-block text-sm font-semibold text-brand-leaf hover:underline">
            Add your first category →
          </Link>
        </div>
      ) : (
        <div className="border border-farm-border bg-cream-warm">
          <div className="hidden grid-cols-[1.5fr_1.5fr_1fr_auto] gap-4 border-b border-farm-border bg-cream-secondary px-5 py-2.5 sm:grid">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Category</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Includes</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">CTA</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Actions</p>
          </div>

          {categories.map((category, idx) => (
            <div
              key={category.id}
              className={`flex flex-col gap-3 px-5 py-4 sm:grid sm:grid-cols-[1.5fr_1.5fr_1fr_auto] sm:items-center sm:gap-4 ${idx > 0 ? 'border-t border-farm-border' : ''} hover:bg-cream-secondary transition-colors`}
            >
              <div className="min-w-0">
                <span className="font-medium text-brand-deep text-sm truncate">{category.name}</span>
                {category.subtitle && <p className="text-xs text-brand-deep/50 truncate">{category.subtitle}</p>}
              </div>

              <span className="text-sm text-brand-deep/60">
                <span className="mr-1 text-brand-deep/30 sm:hidden">Includes: </span>
                {category.category_values.map((v) => CATEGORY_LABELS[v as keyof typeof CATEGORY_LABELS] ?? v).join(', ')}
              </span>

              <span className="text-sm text-brand-deep/60 truncate">
                <span className="mr-1 text-brand-deep/30 sm:hidden">CTA: </span>
                {category.cta_label || '—'}
              </span>

              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/categories/${category.id}/edit`}
                  className="flex items-center gap-1.5 border border-farm-border px-3 py-1.5 text-xs font-semibold text-brand-deep/60 hover:border-brand-leaf hover:text-brand-leaf transition-colors"
                >
                  <Pencil size={11} /> Edit
                </Link>
                <AdminCategoryDeleteButton categoryId={category.id} categoryName={category.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
