'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { useNotifications } from '@/lib/notification-context';
import { AccountButton } from './AccountButton';
import { NotificationBell } from './NotificationBell';
import { MobileMenu } from './MobileMenu';
import { CartIcon } from '@/components/products/CartIcon';

export function Navbar() {
  const pathname = usePathname();
  const { isAdmin } = useNotifications();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard = pathname.startsWith('/account') || pathname.startsWith('/admin');
  // Dark navbar on any page that doesn't have a full-screen dark hero (i.e. everywhere except home)
  const isHomePage = pathname === '/';

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showDarkNav = isScrolled || isDashboard || !isHomePage;

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className={`fixed z-40 w-full transition-all duration-500 ${
          showDarkNav ? 'bg-farm-dark/90 py-4 shadow-lg backdrop-blur-md' : 'bg-transparent py-6'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          {/* Brand: full Nola Ranches lockup. The light variant is required here — the stock
              wordmark is dark artwork and would be invisible against farm-dark. */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logos/wordmark-light.png"
              alt="Nola Ranches"
              width={642}
              height={388}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`border-b py-1 text-xs font-medium uppercase tracking-widest transition-colors ${
                    active
                      ? 'border-gold-warm text-gold-warm'
                      : 'border-transparent text-cream-secondary hover:text-cream-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <NotificationBell />
            {!isAdmin && <CartIcon />}
            <AccountButton />
          </div>

          {/* Mobile right: bell (signed-in only) + cart/dashboard + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <NotificationBell />
            {!isAdmin && <CartIcon />}
            <button
              type="button"
              aria-label="Toggle menu"
              className="flex h-10 w-10 items-center justify-center text-cream-primary"
              onClick={() => setMobileMenuOpen((open) => !open)}
            >
              {mobileMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
