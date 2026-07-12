import { Facebook, Instagram, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { NAV_LINKS, SITE } from '@/lib/constants';

export function Footer() {
  return (
    <footer className="bg-farm-dark pt-24 text-cream-secondary">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 border-b border-white/10 pb-16 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-5 flex items-center gap-3">
              <Image
                src="/images/logos/small logo.png"
                alt="Nola Ranches"
                width={44}
                height={44}
                className="object-contain"
              />
              <span className="font-serif text-2xl tracking-wider text-cream-primary">
                NOLA<span className="text-brand-leaf">RANCHES</span>
              </span>
            </div>
            <p className="text-sm leading-7 text-cream-secondary/75">{SITE.description}</p>
            <div className="mt-7 flex gap-3">
              <a href={SITE.socialMedia.instagram || '#'} aria-label="Nola Ranches Instagram" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-brand-primary">
                <Instagram size={16} aria-hidden="true" />
              </a>
              <a href={SITE.socialMedia.facebook || '#'} aria-label="Nola Ranches Facebook" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 transition-colors hover:bg-brand-primary">
                <Facebook size={16} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-cream-primary">Quick Links</h3>
            <ul className="space-y-4 text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-brand-leaf">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-cream-primary">Farm Info</h3>
            <ul className="space-y-4 text-sm text-cream-secondary/75">
              <li>375 acres</li>
              <li>Mixed crop farming</li>
              <li>Exotic cattle and goats</li>
              <li>Guided ranch visits</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-cream-primary">Contact</h3>
            <ul className="space-y-4 text-sm text-cream-secondary/75">
              <li className="flex gap-3"><MapPin size={16} className="mt-1 text-brand-leaf" aria-hidden="true" />{SITE.location}</li>
              <li className="flex gap-3"><Phone size={16} className="mt-1 text-brand-leaf" aria-hidden="true" />{SITE.phone}</li>
              <li className="flex gap-3"><Mail size={16} className="mt-1 text-brand-leaf" aria-hidden="true" />{SITE.email}</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 py-8 text-xs text-cream-secondary/55 md:flex-row">
          <p>&copy; {new Date().getFullYear()} Nola Ranches. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/services" className="hover:text-cream-primary">Ranch Visits</Link>
            <Link href="/products" className="hover:text-cream-primary">Products & Livestock</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
