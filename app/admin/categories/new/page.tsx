import { AdminCategoryForm } from '@/components/admin/AdminCategoryForm';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import type { ProductCategoryPage } from '@/lib/category-types';

export const dynamic = 'force-dynamic';

async function getMainCategories(): Promise<ProductCategoryPage[]> {
  if (!isDbConfigured()) return [];
  await ensureMigrated();
  const sql = getDb();
  return sql<ProductCategoryPage[]>`SELECT * FROM product_categories WHERE parent_id IS NULL ORDER BY sort_order, name`;
}

export default async function NewCategoryPage() {
  const mainCategories = await getMainCategories();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-brand-deep">Add New Category</h1>
        <p className="mt-1 text-xs text-brand-deep/50">Fill in the details below to add a main category or a subcategory (e.g. a new Livestock tab).</p>
      </div>
      <AdminCategoryForm mainCategories={mainCategories} />
    </div>
  );
}
