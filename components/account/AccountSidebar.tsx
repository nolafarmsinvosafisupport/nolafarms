'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { User, CalendarDays, Settings } from 'lucide-react';

const links = [
  { label: 'My Bookings', href: '/account/bookings', icon: CalendarDays },
  { label: 'Profile', href: '/account/profile', icon: User },
  { label: 'Settings', href: '/account/settings', icon: Settings },
];

interface Props {
  fullName: string | null;
  email: string | null;
  imageUrl: string | null;
}

export function AccountSidebar({ fullName, email, imageUrl }: Props) {
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);
  const showImg = !!imageUrl && !imgError;

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-64 flex-shrink-0 flex-col overflow-y-auto border-r border-farm-border bg-cream-warm xl:w-72">
      {/* User card */}
      <div className="border-b border-farm-border p-6">
        <div className="flex items-center gap-3">
          {showImg ? (
            <Image src={imageUrl!} alt={`${fullName || 'Account'} photo`} width={44} height={44} className="rounded-full ring-2 ring-farm-border" onError={() => setImgError(true)} />
          ) : (
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-medium text-cream-primary">
              {fullName ? fullName.charAt(0).toUpperCase() : 'N'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-brand-deep">{fullName || 'Nola Farms visitor'}</p>
            <p className="truncate text-xs text-brand-deep/50">{email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4" aria-label="Account navigation">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-brand-deep/40">Account</p>
        <ul className="space-y-0.5">
          {links.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-brand-deep text-cream-primary'
                      : 'text-brand-deep hover:bg-brand-deep/8 hover:text-brand-deep'
                  }`}
                >
                  <Icon size={16} className="flex-shrink-0" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Back to site */}
      <div className="border-t border-farm-border p-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-brand-deep/50 transition-colors hover:text-brand-deep"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
