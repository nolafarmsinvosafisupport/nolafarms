import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden pt-16">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-cream-primary">
        <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  );
}
