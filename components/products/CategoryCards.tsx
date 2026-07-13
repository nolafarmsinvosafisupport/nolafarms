'use client';

import Image from 'next/image';
import { Beef, PawPrint, PiggyBank, Dna, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORY_CARDS, countCard } from '@/lib/product-taxonomy';
import type { CardKey } from '@/lib/product-taxonomy';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

const ICONS: Record<string, LucideIcon> = {
  beef: Beef,
  pawprint: PawPrint,
  piggybank: PiggyBank,
  dna: Dna,
};

/**
 * The entire filter UI for the shop — there is no sidebar. Cards are filters, not links: clicking
 * one narrows the grid, clicking it again clears back to all livestock.
 *
 * Images: an admin can set a category's picture at /admin/categories (it uploads to R2 and stores
 * the URL on product_categories.hero_image). Whatever they set wins; the constants in
 * lib/product-taxonomy are only the fallback. "Services" has no category row, so it always uses
 * the constant.
 */
export function CategoryCards({
  products,
  categories,
  selected,
  onSelect,
}: {
  products: Product[];
  categories: ProductCategoryPage[];
  selected: CardKey | null;
  onSelect: (key: CardKey | null) => void;
}) {
  const imageFor = (slug: string, fallback: string) =>
    categories.find((c) => c.slug === slug)?.hero_image || fallback;

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {CATEGORY_CARDS.map((c) => {
        const Icon = ICONS[c.icon] ?? Beef;
        const isActive = c.key === selected;
        const count = countCard(products, c.key);

        return (
          <button
            key={c.key}
            type="button"
            onClick={() => onSelect(isActive ? null : c.key)}
            aria-pressed={isActive}
            className={`group relative aspect-[4/3] overflow-hidden rounded-2xl text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf ${
              isActive ? 'ring-2 ring-brand-leaf ring-offset-2 ring-offset-cream-primary' : 'hover:shadow-lg'
            }`}
          >
            <Image
              src={imageFor(c.key, c.image)}
              alt={c.label}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Dark wash from the bottom so the label stays readable over any photo. */}
            <div className="absolute inset-0 bg-gradient-to-t from-farm-dark via-farm-dark/45 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
              <div>
                <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow">
                  <Icon size={18} className="text-brand-deep" />
                </span>
                <p className="text-sm font-bold uppercase tracking-wide text-white">{c.label}</p>
                <p className="mt-0.5 text-xs text-white/70">
                  {count} {count === 1 ? 'Product' : 'Products'}
                </p>
              </div>

              <span className="mb-1 flex-shrink-0 text-white transition-transform duration-300 group-hover:translate-x-1">
                <ArrowRight size={20} />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
