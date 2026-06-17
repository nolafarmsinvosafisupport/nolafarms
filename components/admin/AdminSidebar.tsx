'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, CalendarDays, Ban, Settings } from 'lucide-react';

const links = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard, exact: true },
  { label: 'Bookings', href: '/admin/bookings', icon: ClipboardList, exact: false },
  { label: 'Calendar', href: '/admin/calendar', icon: CalendarDays, exact: false },
  { label: 'Blocked Dates', href: '/admin/blocked-dates', icon: Ban, exact: false },
  { label: 'Settings', href: '/admin/settings', icon: Settings, exact: false },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-16 flex h-[calc(100vh-4rem)] w-60 flex-shrink-0 flex-col overflow-y-auto bg-farm-dark xl:w-64">
      {/* Branding */}
      <div className="border-b border-white/10 px-6 py-5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Nola Farms</p>
        <h1 className="mt-0.5 font-serif text-xl text-cream-primary">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4" aria-label="Admin navigation">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Management</p>
        <ul className="space-y-0.5">
          {links.map(({ label, href, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-white/15 text-cream-primary'
                      : 'text-white/60 hover:bg-white/8 hover:text-cream-primary'
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
      <div className="border-t border-white/10 p-4">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-xs text-white/30 transition-colors hover:text-white/70"
        >
          ← Back to site
        </Link>
      </div>
    </aside>
  );
}
