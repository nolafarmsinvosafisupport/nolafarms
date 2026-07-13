'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Beef, PawPrint, PiggyBank, MessageCircle, HeartPulse, ClipboardCheck, Droplets, Dna, Headset, ArrowLeft } from 'lucide-react';
import { TrustBadges } from './TrustBadges';
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

// Every block on this page sits in its own bordered card so the sections read as
// distinct panels rather than running together.
const PANEL = 'rounded-xl border border-farm-border bg-cream-warm';

function whatsappHref(message: string | null) {
  const number = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : '254750958780';
  return `https://wa.me/${number}?text=${encodeURIComponent(message || `Hello, I'm interested in livestock available at Nola Ranches.`)}`;
}

export function LivestockCategoryTabs({ products, categories }: { products: Product[]; categories: ProductCategoryPage[] }) {
  const [selectedSlug, setSelectedSlug] = useState(categories[0]?.slug ?? '');

  const breedsFor = (category: ProductCategoryPage) =>
    products.filter((p) => category.category_values.includes(p.category));

  const selected = categories.find((c) => c.slug === selectedSlug) ?? categories[0];
  const others = categories.filter((c) => c.slug !== selected?.slug);

  if (!selected) return null;

  return (
    <>
      {/* Header — centred, and roughly 40% shorter than before. The "Products / Livestock"
          breadcrumb and the ranch picker that used to live up here are both gone; the way back
          to the catalogue is now a pill at the foot of the page. */}
      <div className="bg-farm-dark px-6 py-5 lg:px-8">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="font-serif text-2xl text-cream-primary md:text-3xl">Our Livestock</h1>
          <p className="mt-1 text-xs font-medium text-gold-warm">Healthy. Productive. Farm-Raised.</p>
          <p className="mt-1.5 text-xs leading-5 text-cream-secondary/70">
            Vaccinated, farm-recorded animals from our Oloitoktok and Laikipia ranches, selected for
            performance in Kajiado&apos;s climate.
          </p>
        </div>
      </div>

      {/* Category tabs — centred */}
      <div className="border-b border-farm-border bg-cream-primary px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl justify-center gap-2 overflow-x-auto py-3">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c.slug] ?? PawPrint;
            const active = c.slug === selected.slug;
            return (
              <button
                key={c.slug}
                type="button"
                onClick={() => setSelectedSlug(c.slug)}
                className={`flex flex-shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors ${
                  active ? 'border-brand-leaf bg-brand-leaf/10' : 'border-farm-border hover:border-brand-deep/30'
                }`}
              >
                <Icon size={16} className={active ? 'text-brand-leaf' : 'text-brand-deep/50'} />
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-wide text-brand-deep">{c.name}</span>
                  {c.subtitle && <span className="hidden text-[9px] text-brand-deep/50 sm:block">{c.subtitle}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-cream-primary px-6 py-6 lg:px-8">
        <div className="mx-auto max-w-7xl space-y-6">
          {/* Selected category — now inside its own panel */}
          <section className={`${PANEL} p-4`}>
            <h2 className="font-serif text-lg text-brand-deep">{selected.name}</h2>
            {selected.subtitle && <p className="mt-0.5 text-xs font-medium text-brand-leaf">{selected.subtitle}</p>}

            {/* items-start, not items-center: centring stretched the row to the image's height and
                left dead space above and below the text. */}
            <div className="mt-3 grid gap-4 lg:grid-cols-2 lg:items-start">
              {selected.hero_description && (
                <div>
                  <p className="text-sm leading-6 text-brand-deep/75">{selected.hero_description}</p>
                  {selected.details.length > 0 && (
                    <ul className="mt-3 grid gap-1 sm:grid-cols-2">
                      {selected.details.map((d, i) => (
                        <li key={i} className="text-xs text-brand-deep/70">• {d}</li>
                      ))}
                    </ul>
                  )}
                  {selected.cta_label && (
                    <a
                      href={whatsappHref(selected.whatsapp_message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-brand-leaf px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-deep"
                    >
                      <MessageCircle size={13} />
                      {selected.cta_label}
                    </a>
                  )}
                </div>
              )}
              {/* Fixed height, not an aspect ratio: an aspect box takes its height from the column
                  width, so on a wide screen this grew to 346px and pushed the breed cards off the
                  fold — the whole thing we are trying to fix. */}
              <div className="image-skeleton relative h-40 overflow-hidden rounded-lg bg-cream-secondary lg:h-44">
                <Image
                  src={selected.hero_image || '/images/farm/farm.webp'}
                  alt={`${selected.name} at Nola Ranches`}
                  fill
                  priority
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Breed cards. The image was aspect-square, which on a 4-column grid made each card
                444px tall — so not one of them fitted above the fold on a 768px laptop. */}
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {breedsFor(selected).map((product, i) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group block overflow-hidden rounded-lg border border-farm-border bg-cream-primary transition-shadow hover:shadow-md"
                >
                  <div className="image-skeleton relative aspect-[16/10] overflow-hidden bg-cream-secondary">
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
                  <div className="p-3">
                    <h3 className="text-xs font-semibold text-brand-deep group-hover:text-brand-leaf">
                      <span className="text-brand-leaf">{i + 1}.</span> {product.name}
                    </h3>
                    {product.description && (
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-brand-deep/60">{product.description}</p>
                    )}
                  </div>
                </Link>
              ))}
              {breedsFor(selected).length === 0 && (
                <p className="col-span-full py-4 text-sm text-brand-deep/50">No breeds in this category yet.</p>
              )}
            </div>
          </section>

          {/* Other categories — condensed teasers, each its own panel */}
          {others.length > 0 && (
            <section className="grid gap-4 sm:grid-cols-2">
              {others.map((c) => {
                const Icon = CATEGORY_ICONS[c.slug] ?? PawPrint;
                return (
                  <div
                    key={c.slug}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedSlug(c.slug)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedSlug(c.slug)}
                    className={`${PANEL} group flex cursor-pointer flex-col overflow-hidden text-left transition-shadow hover:shadow-md`}
                  >
                    <div className="image-skeleton relative aspect-[21/9] overflow-hidden bg-cream-secondary">
                      <Image
                        src={c.hero_image || '/images/farm/farm.webp'}
                        alt={`${c.name} at Nola Ranches`}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <div className="flex items-center gap-2">
                        <Icon size={14} className="text-brand-leaf" />
                        <h3 className="font-serif text-base text-brand-deep">{c.name}</h3>
                      </div>
                      {c.subtitle && <p className="mt-0.5 text-[11px] font-medium text-brand-leaf">{c.subtitle}</p>}
                      {c.hero_description && (
                        <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-brand-deep/60">{c.hero_description}</p>
                      )}
                      {c.cta_label && (
                        <a
                          href={whatsappHref(c.whatsapp_message)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand-leaf px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-deep"
                        >
                          <MessageCircle size={11} />
                          {c.cta_label}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Trust badges — also a panel now */}
          <section className={`${PANEL} px-5 py-4`}>
            <TrustBadges badges={LIVESTOCK_TRUST_BADGES} />
          </section>

          {/* The way back to the catalogue: a pill at the foot of the page, replacing the
              old-school "Products / Livestock" breadcrumb that sat above the hero. */}
          <div className="flex justify-center pt-1">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-farm-border bg-cream-warm px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-brand-deep transition-colors hover:border-brand-leaf hover:text-brand-leaf"
            >
              <ArrowLeft size={13} />
              All Products
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
