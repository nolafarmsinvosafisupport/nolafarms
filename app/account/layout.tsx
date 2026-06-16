import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { currentUserSummary } from '@/lib/auth';

const links = [
  { label: 'Profile', href: '/account/profile' },
  { label: 'My Bookings', href: '/account/bookings' },
  { label: 'Settings', href: '/account/settings' },
];

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await currentUserSummary();

  return (
    <main className="bg-cream-primary pt-28">
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-12 md:grid-cols-[280px_1fr] lg:px-8">
        <aside className="h-fit border border-farm-border bg-cream-warm p-6">
          <div className="flex items-center gap-3 border-b border-farm-border pb-6">
            {user?.imageUrl ? (
              <Image src={user.imageUrl} alt={`${user.fullName || 'Account'} profile photo`} width={36} height={36} className="rounded-full" />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary text-xs text-cream-primary">NF</div>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-brand-deep">{user?.fullName || 'Nola Farms visitor'}</p>
              <p className="truncate text-xs text-brand-deep/60">{user?.email}</p>
            </div>
          </div>
          <nav className="mt-6 space-y-2" aria-label="Account navigation">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="block px-3 py-2 text-sm text-brand-deep hover:bg-brand-deep hover:text-cream-primary">
                {link.label}
              </Link>
            ))}
          </nav>
        </aside>
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
