import { AdminProductForm } from '@/components/admin/AdminProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-cream-primary">Add New Product</h1>
        <p className="mt-1 text-xs text-white/40">Fill in the details below to add a product to your catalogue.</p>
      </div>
      <AdminProductForm />
    </div>
  );
}
