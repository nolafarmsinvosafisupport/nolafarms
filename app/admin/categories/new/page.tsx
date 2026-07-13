import { AdminCategoryForm } from '@/components/admin/AdminCategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-brand-deep">Add New Category</h1>
        <p className="mt-1 text-xs text-brand-deep/50">Fill in the details below to add a category landing page (e.g. a new Livestock tab).</p>
      </div>
      <AdminCategoryForm />
    </div>
  );
}
