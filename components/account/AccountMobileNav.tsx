'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, User, Package, Settings } from 'lucide-react';

const links = [
  { label: 'Bookings', href: '/account/bookings', icon: CalendarDays },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Profile', href: '/account/profile', icon: User },
  { label: 'Settings', href: '/account/settings', icon: Settings },
];

export function AccountMobileNav() {
  const pathname = usePathname();
  return (
    <div className="flex border-b border-farm-border bg-cream-warm md:hidden">
      {links.map(({ label, href, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-widest transition-colors ${active ? 'text-brand-leaf border-b-2 border-brand-leaf' : 'text-brand-deep/50 hover:text-brand-deep'}`}>
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
