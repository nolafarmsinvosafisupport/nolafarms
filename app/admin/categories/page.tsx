import Link from 'next/link';
import { Plus, Pencil } from 'lucide-react';
import { AdminCategoryDeleteButton } from '@/components/admin/AdminCategoryDeleteButton';
import { AdminQuickToggle } from '@/components/admin/AdminQuickToggle';
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

function CategoryRow({ category, indent, subcategoryCount = 0 }: { category: ProductCategoryPage; indent: boolean; subcategoryCount?: number }) {
  return (
    <div className="flex flex-col gap-3 border-t border-farm-border px-5 py-4 sm:grid sm:grid-cols-[1.5fr_1.5fr_1fr_auto] sm:items-center sm:gap-4 hover:bg-cream-secondary transition-colors">
      <div className={`min-w-0 ${indent ? 'sm:pl-6' : ''}`}>
        <div className="flex items-center gap-2">
          {indent && <span className="text-brand-deep/30">↳</span>}
          <span className="font-medium text-brand-deep text-sm truncate">{category.name}</span>
          {!category.active && (
            <span className="flex-shrink-0 rounded bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-red-600">Hidden</span>
          )}
          {category.coming_soon && (
            <span className="flex-shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-amber-700">Coming Soon</span>
          )}
        </div>
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

      <div className="flex items-center gap-3">
        <AdminQuickToggle endpoint={`/api/categories/${category.id}`} field="active" value={category.active} label="Visible" />
        <Link
          href={`/admin/categories/${category.id}/edit`}
          className="flex items-center gap-1.5 border border-farm-border px-3 py-1.5 text-xs font-semibold text-brand-deep/60 hover:border-brand-leaf hover:text-brand-leaf transition-colors"
        >
          <Pencil size={11} /> Edit
        </Link>
        <AdminCategoryDeleteButton categoryId={category.id} categoryName={category.name} subcategoryCount={subcategoryCount} />
      </div>
    </div>
  );
}

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  const mainCategories = categories.filter((c) => c.parent_id === null);
  const subcategoriesOf = (parentId: string) => categories.filter((c) => c.parent_id === parentId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl text-brand-deep">Categories</h1>
          <p className="mt-1 text-xs text-brand-deep/50">
            {mainCategories.length} main categor{mainCategories.length !== 1 ? 'ies' : 'y'} (the tiles on /products), with subcategories nested under each
          </p>
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
          <div className="hidden grid-cols-[1.5fr_1.5fr_1fr_auto] gap-4 bg-cream-secondary px-5 py-2.5 sm:grid">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Category</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Includes</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">CTA</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Actions</p>
          </div>

          {mainCategories.map((main) => (
            <div key={main.id}>
              <CategoryRow category={main} indent={false} subcategoryCount={subcategoriesOf(main.id).length} />
              {subcategoriesOf(main.id).map((sub) => (
                <CategoryRow key={sub.id} category={sub} indent />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
