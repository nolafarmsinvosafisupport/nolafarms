export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminMobileNav } from '@/components/admin/AdminMobileNav';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden pt-16">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto bg-cream-primary">
        <AdminMobileNav />
        <div className="mx-auto max-w-5xl px-4 py-5 lg:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
