'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, Package, ShoppingCart, Users, Settings } from 'lucide-react';
import { useNotifications } from '@/lib/notification-context';

const links = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList, exact: false },
  { label: 'Products', href: '/admin/products', icon: Package, exact: false },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart, exact: false },
  { label: 'Users', href: '/admin/users', icon: Users, exact: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
] as const;

export function AdminMobileNav() {
  const pathname = usePathname();
  const { unreadOrderCount, unreadBookingCount } = useNotifications();

  const badgeFor: Partial<Record<(typeof links)[number]['href'], number>> = {
    '/admin/orders': unreadOrderCount,
    '/admin/bookings': unreadBookingCount,
  };

  return (
    <div className="flex border-b border-white/10 bg-farm-dark md:hidden">
      {links.map(({ label, href, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const badge = badgeFor[href] ?? 0;
        return (
          <Link key={href} href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-widest transition-colors ${active ? 'text-gold-warm border-b-2 border-gold-warm' : 'text-white/40 hover:text-white/70'}`}>
            <span className="relative">
              <Icon size={16} />
              {badge > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">
                  {badge > 9 ? '9+' : badge}
                </span>
              )}
            </span>
            {label}
          </Link>
        );
      })}
    </div>
  );
}
