'use client';

import Image from 'next/image';
import { MAIN_CATEGORIES, SUB_CATEGORIES, countMain, countSub } from '@/lib/product-taxonomy';
import type { MainKey, SubKey } from '@/lib/product-taxonomy';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

/**
 * Category cards. These are filters, not links — they drive the same state as the sidebar, so the
 * two can never show different things. Picking a main category reveals its subcategory cards
 * (only Livestock has any); picking subcategories narrows further.
 *
 * Images: an admin can set a category's picture at /admin/categories (it uploads to R2 and stores
 * the URL on product_categories.hero_image). Whatever they set wins; the constants in
 * lib/product-taxonomy are only the fallback for a category with no image set. "Services" has no
 * category row at all, so it always uses the constant.
 */
export function CategoryCards({
  products,
  categories,
  selectedMain,
  onSelectMain,
  selectedSubs,
  onToggleSub,
}: {
  products: Product[];
  categories: ProductCategoryPage[];
  selectedMain: MainKey | null;
  onSelectMain: (key: MainKey | null) => void;
  selectedSubs: Set<SubKey>;
  onToggleSub: (key: SubKey) => void;
}) {
  const imageFor = (slug: string, fallback: string) =>
    categories.find((c) => c.slug === slug)?.hero_image || fallback;

  const active = MAIN_CATEGORIES.find((c) => c.key === selectedMain);
  const subs = active ? SUB_CATEGORIES.filter((s) => active.subs.includes(s.key)) : [];

  const cardBase =
    'group relative overflow-hidden rounded-xl border text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf';

  return (
    <div className="space-y-4">
      {/* Main categories. Clicking the active one again clears it back to the whole catalogue,
          which is why there is no separate "All" card taking up a slot. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {MAIN_CATEGORIES.map((c) => {
          const isActive = c.key === selectedMain;
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onSelectMain(isActive ? null : c.key)}
              aria-pressed={isActive}
              className={`${cardBase} ${
                isActive
                  ? 'border-brand-leaf ring-2 ring-brand-leaf'
                  : 'border-farm-border hover:border-brand-deep/30'
              }`}
            >
              <div className="image-skeleton relative aspect-[4/3] w-full overflow-hidden bg-cream-secondary">
                <Image
                  src={imageFor(c.key, c.image)}
                  alt={c.label}
                  fill
                  sizes="(min-width: 1024px) 20vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-farm-dark/20" />
              </div>
              <div className={`px-3 py-2.5 ${isActive ? 'bg-brand-leaf/10' : 'bg-cream-warm'}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-deep">{c.label}</p>
                <p className="mt-0.5 text-[11px] text-brand-deep/50">
                  {countMain(products, c.key)} {countMain(products, c.key) === 1 ? 'item' : 'items'}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subcategories — only for a main category that has them (Livestock). The name sits above
          the picture rather than the card being split into a picture half and a text half. */}
      {subs.length > 0 && (
        <div className="flex flex-wrap gap-3 rounded-xl border border-farm-border bg-cream-warm/60 p-3">
          {subs.map((s) => {
            const isOn = selectedSubs.has(s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onToggleSub(s.key)}
                aria-pressed={isOn}
                className={`${cardBase} w-32 bg-cream-primary ${
                  isOn ? 'border-brand-leaf ring-2 ring-brand-leaf' : 'border-farm-border hover:border-brand-deep/30'
                }`}
              >
                <div className={`px-2 pb-1.5 pt-2 ${isOn ? 'bg-brand-leaf/10' : ''}`}>
                  <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-brand-deep">
                    {s.label}
                  </p>
                  <p className="text-[10px] text-brand-deep/50">{countSub(products, s.key)}</p>
                </div>
                <div className="image-skeleton relative h-20 w-full overflow-hidden bg-cream-secondary">
                  <Image
                    src={imageFor(s.key, s.image)}
                    alt={s.label}
                    fill
                    sizes="128px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
