'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Beef, PawPrint, PiggyBank, MessageCircle, HeartPulse, ClipboardCheck, Droplets, Dna, Headset } from 'lucide-react';
import { TrustBadges } from './TrustBadges';
import type { Ranch } from '@/lib/product-types';
import { SITE } from '@/lib/constants';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

const CATEGORY_ICONS: Record<string, typeof Beef> = {
  cattle: Beef,
  'goats-sheep': PawPrint,
  pigs: PiggyBank,
};

const LIVESTOCK_TRUST_BADGES = [
  { icon: HeartPulse, label: 'Healthy Animals', description: 'Vaccinated & dewormed' },
  { icon: ClipboardCheck, label: 'Farm Recorded', description: 'Tagged & tracked' },
  { icon: Droplets, label: 'Drought Adapted', description: 'Ideal for Kajiado climate' },
  { icon: Dna, label: 'Quality Genetics', description: 'Better growth & productivity' },
  { icon: Headset, label: 'Expert Support', description: 'Breeding & health advice' },
];

const RANCH_OPTIONS: { key: Ranch | 'all'; label: string }[] = [
  { key: 'all', label: 'All Ranches' },
  { key: 'oloitoktok', label: 'Oloitoktok Ranch' },
  { key: 'laikipia', label: 'Laikipia Ranch' },
];

function whatsappHref(message: string | null) {
  const number = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : '254750958780';
  return `https://wa.me/${number}?text=${encodeURIComponent(message || `Hello, I'm interested in livestock available at Nola Ranches.`)}`;
}

export function LivestockCategoryTabs({ products, categories }: { products: Product[]; categories: ProductCategoryPage[] }) {
  const [selectedSlug, setSelectedSlug] = useState(categories[0]?.slug ?? '');
  const [ranch, setRanch] = useState<Ranch | 'all'>('all');

  const filteredProducts = useMemo(
    () => products.filter((p) => ranch === 'all' || p.ranch === ranch || p.ranch === 'both'),
    [products, ranch],
  );

  const breedsFor = (category: ProductCategoryPage) =>
    filteredProducts.filter((p) => category.category_values.includes(p.category));

  const selected = categories.find((c) => c.slug === selectedSlug) ?? categories[0];
  const others = categories.filter((c) => c.slug !== selected?.slug);

  if (!selected) return null;

  return (
    <>
      {/* Header */}
      <div className="bg-farm-dark px-6 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-warm">Products / Livestock</p>
            <h1 className="mt-3 font-serif text-4xl text-cream-primary md:text-5xl">Our Livestock</h1>
            <p className="mt-2 text-sm font-medium text-cream-secondary/80">Healthy. Productive. Farm-Raised.</p>
            <p className="mt-3 max-w-xl text-sm text-cream-secondary/70">
              Quality livestock from our ranches in Oloitoktok and Laikipia. All animals are vaccinated, healthy,
              and selected for performance in Kajiado&apos;s climate.
            </p>
          </div>
          <label className="flex-shrink-0">
            <span className="sr-only">Filter by ranch</span>
            <select
              value={ranch}
              onChange={(e) => setRanch(e.target.value as Ranch | 'all')}
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-medium text-cream-primary outline-none focus:border-gold-warm sm:w-48"
            >
              {RANCH_OPTIONS.map((r) => (
                <option key={r.key} value={r.key} className="bg-farm-dark">{r.label}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-farm-border bg-cream-primary px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto py-4">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? PawPrint;
            const active = c.slug === selected.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setSelectedSlug(c.slug)}
                className={`flex flex-shrink-0 items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                  active ? 'border-brand-leaf bg-brand-leaf/10' : 'border-farm-border hover:border-brand-deep/30'
                }`}
              >
                <Icon size={22} className={active ? 'text-brand-leaf' : 'text-brand-deep/50'} />
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-wide text-brand-deep">{c.name}</span>
                  {c.subtitle && <span className="block text-[10px] text-brand-deep/50">{c.subtitle}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-cream-primary px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-12">
          {/* Selected category — full detail */}
          <section>
            <h2 className="font-serif text-3xl text-brand-deep">{selected.name}</h2>
            {selected.subtitle && <p className="mt-1 text-sm font-medium text-brand-leaf">{selected.subtitle}</p>}
            <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
              {selected.hero_description && (
                <div>
                  <p className="leading-7 text-brand-deep/75">{selected.hero_description}</p>
                  {selected.details.length > 0 && (
                    <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
                      {selected.details.map((d, i) => (
                        <li key={i} className="text-sm text-brand-deep/70">• {d}</li>
                      ))}
                    </ul>
                  )}
                  {selected.cta_label && (
                    <a
                      href={whatsappHref(selected.whatsapp_message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-leaf px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-deep transition-colors"
                    >
                      <MessageCircle size={14} />
                      {selected.cta_label}
                    </a>
                  )}
                </div>
              )}
              <div className="image-skeleton relative aspect-[4/3] overflow-hidden rounded-xl bg-cream-secondary">
                <Image
                  src={selected.hero_image || '/images/farm/farm.webp'}
                  alt={`${selected.name} at Nola Ranches`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Breed boxes */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {breedsFor(selected).map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block overflow-hidden rounded-xl border border-farm-border bg-cream-warm transition-shadow hover:shadow-md"
                >
                  <div className="image-skeleton relative aspect-square overflow-hidden bg-cream-secondary">
                    <Image
                      src={product.images[0] ?? '/images/farm/farm.webp'}
                      alt={product.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {product.is_service && (
                      <span className="absolute left-2 top-2 bg-brand-deep px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-white">
                        Service
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">{i + 1}.</p>
                    <h3 className="mt-0.5 text-sm font-semibold text-brand-deep group-hover:text-brand-leaf">{product.name}</h3>
                    {product.description && (
                      <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-brand-deep/60">{product.description}</p>
                    )}
                  </div>
                </Link>
              ))}
              {breedsFor(selected).length === 0 && (
                <p className="col-span-full py-6 text-sm text-brand-deep/50">No breeds match the selected ranch filter.</p>
              )}
            </div>
          </section>

          {/* Other categories — condensed teasers */}
          {others.length > 0 && (
            <section className="grid gap-6 sm:grid-cols-2">
              {others.map((c) => {
                const Icon = CATEGORY_ICONS[c.slug] ?? PawPrint;
                return (
                  <div
                    key={c.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSlug(c.slug)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedSlug(c.slug)}
                    className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-farm-border bg-cream-warm text-left transition-shadow hover:shadow-md"
                  >
                    <div className="image-skeleton relative aspect-[16/9] overflow-hidden bg-cream-secondary">
                      <Image
                        src={c.hero_image || '/images/farm/farm.webp'}
                        alt={`${c.name} at Nola Ranches`}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2">
                        <Icon size={16} className="text-brand-leaf" />
                        <h3 className="font-serif text-xl text-brand-deep">{c.name}</h3>
                      </div>
                      {c.subtitle && <p className="mt-1 text-xs font-medium text-brand-leaf">{c.subtitle}</p>}
                      {c.hero_description && (
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-brand-deep/60">{c.hero_description}</p>
                      )}
                      {c.cta_label && (
                        <a
                          href={whatsappHref(c.whatsapp_message)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-leaf px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white hover:bg-brand-deep transition-colors"
                        >
                          <MessageCircle size={12} />
                          {c.cta_label}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Trust badges */}
          <section className="border-t border-farm-border pt-8">
            <TrustBadges badges={LIVESTOCK_TRUST_BADGES} />
          </section>
        </div>
      </div>
    </>
  );
}
