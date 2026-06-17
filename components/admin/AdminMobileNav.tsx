'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, CalendarDays, Ban, Settings } from 'lucide-react';

const links = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList, exact: false },
  { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays, exact: false },
  { label: 'Blocked', href: '/admin/blocked-dates', icon: Ban, exact: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  return (
    <div className="flex border-b border-white/10 bg-farm-dark md:hidden">
      {links.map(({ label, href, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-semibold uppercase tracking-widest transition-colors ${active ? 'text-gold-warm border-b-2 border-gold-warm' : 'text-white/40 hover:text-white/70'}`}>
            <Icon size={16} />
            {label}
          </Link>
        );
      })}
    </div>
  );
}
