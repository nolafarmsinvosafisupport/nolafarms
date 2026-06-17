export const dynamic = 'force-dynamic';

import type { ReactNode } from 'react';
import { currentUserSummary } from '@/lib/auth';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { AccountMobileNav } from '@/components/account/AccountMobileNav';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await currentUserSummary();

  return (
    <div className="flex h-screen overflow-hidden pt-16">
      <AccountSidebar
        fullName={user?.fullName ?? null}
        email={user?.email ?? null}
        imageUrl={user?.imageUrl ?? null}
      />
      <main className="flex-1 overflow-y-auto bg-cream-primary">
        <AccountMobileNav />
        <div className="mx-auto max-w-4xl px-4 py-5 lg:px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
