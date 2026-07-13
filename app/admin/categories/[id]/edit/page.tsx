import { notFound } from 'next/navigation';
import { AdminCategoryForm } from '@/components/admin/AdminCategoryForm';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import type { ProductCategoryPage } from '@/lib/category-types';

export const dynamic = 'force-dynamic';

async function getCategory(id: string): Promise<ProductCategoryPage | null> {
  if (!isDbConfigured()) return null;
  await ensureMigrated();
  const sql = getDb();
  const [category] = await sql<ProductCategoryPage[]>`SELECT * FROM product_categories WHERE id = ${id} LIMIT 1`;
  return category ?? null;
}

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategory(id);
  if (!category) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-brand-deep">Edit Category</h1>
        <p className="mt-1 text-xs text-brand-deep/50">{category.name}</p>
      </div>
      <AdminCategoryForm category={category} />
    </div>
  );
}
