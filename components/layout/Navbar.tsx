'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NAV_LINKS } from '@/lib/constants';
import { AccountButton } from './AccountButton';
import { MobileMenu } from './MobileMenu';

export function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isDashboard = pathname.startsWith('/account') || pathname.startsWith('/admin');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav
        aria-label="Primary navigation"
        className={`fixed z-40 w-full transition-all duration-500 ${
          isScrolled || isDashboard ? 'bg-farm-dark/90 py-4 shadow-lg backdrop-blur-md' : 'bg-transparent py-6'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="font-serif text-2xl tracking-wider text-cream-primary">
            NOLA<span className="text-brand-leaf">FARMS</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`border-b py-1 text-xs font-medium uppercase tracking-widest transition-colors ${
                    active
                      ? 'border-brand-leaf text-brand-leaf'
                      : 'border-transparent text-cream-secondary hover:text-cream-primary'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <AccountButton />
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            className="text-cream-primary md:hidden"
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </nav>
      <MobileMenu open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}
