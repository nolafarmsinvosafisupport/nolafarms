import { notFound } from 'next/navigation';
import { AdminProductForm } from '@/components/admin/AdminProductForm';
import { getDb, isDbConfigured, ensureMigrated } from '@/lib/db';
import type { Product } from '@/lib/product-types';

export const dynamic = 'force-dynamic';

async function getProduct(id: string): Promise<Product | null> {
  if (!isDbConfigured()) return null;
  await ensureMigrated();
  const sql = getDb();
  const [product] = await sql<Product[]>`SELECT * FROM products WHERE id = ${id} LIMIT 1`;
  return product ?? null;
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-cream-primary">Edit Product</h1>
        <p className="mt-1 text-xs text-white/40">{product.name}</p>
      </div>
      <AdminProductForm product={product} />
    </div>
  );
}
