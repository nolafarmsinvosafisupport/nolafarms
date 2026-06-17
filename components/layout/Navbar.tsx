'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { AccountButton } from './AccountButton';
import { NotificationBell } from './NotificationBell';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const pathname = usePathname();
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
          {/* Brand: logo icon + wordmark */}
          <Link href="/" className="flex items-center gap-2.5 font-serif text-2xl tracking-wider text-cream-primary">
            <Image
              src="/images/logos/small logo.png"
              alt="Nola Farms logo"
              width={32}
              height={32}
              className="h-8 w-8 object-contain"
              priority
            />
            NOLA<span className="text-brand-leaf">FARMS</span>
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
            <AccountButton />
          </div>

          {/* Mobile right: bell (signed-in only) + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <NotificationBell />
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
