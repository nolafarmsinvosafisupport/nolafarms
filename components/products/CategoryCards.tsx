'use client';

import Image from 'next/image';
import { LayoutGrid } from 'lucide-react';
import {
  MAIN_CATEGORIES,
  SUB_CATEGORIES,
  countMain,
  countSub,
  browsableProducts,
} from '@/lib/product-taxonomy';
import type { MainKey, SubKey } from '@/lib/product-taxonomy';
import type { Product } from '@/lib/product-types';

/**
 * Category cards. These are filters, not links — they drive the same state as the sidebar, so the
 * two can never show different things. Picking a main category reveals its subcategory cards
 * (only Livestock has any); picking subcategories narrows further.
 */
export function CategoryCards({
  products,
  selectedMain,
  onSelectMain,
  selectedSubs,
  onToggleSub,
}: {
  products: Product[];
  selectedMain: MainKey | null;
  onSelectMain: (key: MainKey | null) => void;
  selectedSubs: Set<SubKey>;
  onToggleSub: (key: SubKey) => void;
}) {
  const active = MAIN_CATEGORIES.find((c) => c.key === selectedMain);
  const subs = active ? SUB_CATEGORIES.filter((s) => active.subs.includes(s.key)) : [];

  const cardBase =
    'group relative overflow-hidden rounded-lg border text-left transition-all hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-leaf';

  return (
    <div className="space-y-3">
      {/* Main categories */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
        {/* "All" resets to the full catalogue. Icon rather than a photo — no single image
            honestly represents "everything". */}
        <button
          type="button"
          onClick={() => onSelectMain(null)}
          aria-pressed={selectedMain === null}
          className={`${cardBase} flex flex-col items-center justify-center gap-1 px-2 py-3 ${
            selectedMain === null
              ? 'border-brand-leaf bg-brand-leaf/10'
              : 'border-farm-border bg-cream-warm hover:border-brand-deep/30'
          }`}
        >
          <LayoutGrid size={18} className={selectedMain === null ? 'text-brand-leaf' : 'text-brand-deep/50'} />
          <span className="text-[10px] font-semibold uppercase tracking-wide text-brand-deep">All</span>
          <span className="text-[10px] text-brand-deep/40">{browsableProducts(products).length}</span>
        </button>

        {MAIN_CATEGORIES.map((c) => {
          const isActive = c.key === selectedMain;
          const count = countMain(products, c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => onSelectMain(isActive ? null : c.key)}
              aria-pressed={isActive}
              className={`${cardBase} ${
                isActive ? 'border-brand-leaf ring-1 ring-brand-leaf' : 'border-farm-border hover:border-brand-deep/30'
              }`}
            >
              <div className="image-skeleton relative h-14 w-full overflow-hidden bg-cream-secondary sm:h-16">
                <Image
                  src={c.image}
                  alt={c.label}
                  fill
                  sizes="(min-width: 640px) 16vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-farm-dark/25" />
              </div>
              <div className={`px-2 py-1.5 ${isActive ? 'bg-brand-leaf/10' : 'bg-cream-warm'}`}>
                <p className="truncate text-[10px] font-semibold uppercase tracking-wide text-brand-deep">
                  {c.label}
                </p>
                <p className="text-[10px] text-brand-deep/40">{count}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Subcategories — only rendered for a main category that actually has them (Livestock).
          Vegetables, Grains and Fruits have none, so nothing appears rather than an empty row. */}
      {subs.length > 0 && (
        <div className="flex flex-wrap gap-2 rounded-lg border border-farm-border bg-cream-warm/60 p-2">
          {subs.map((s) => {
            const isOn = selectedSubs.has(s.key);
            const count = countSub(products, s.key);
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => onToggleSub(s.key)}
                aria-pressed={isOn}
                className={`${cardBase} flex items-center gap-2 pr-3 ${
                  isOn ? 'border-brand-leaf bg-brand-leaf/10 ring-1 ring-brand-leaf' : 'border-farm-border bg-cream-primary hover:border-brand-deep/30'
                }`}
              >
                <span className="image-skeleton relative h-9 w-9 flex-shrink-0 overflow-hidden bg-cream-secondary">
                  <Image src={s.image} alt={s.label} fill sizes="36px" className="object-cover" />
                </span>
                <span>
                  <span className="block text-[10px] font-semibold uppercase tracking-wide text-brand-deep">
                    {s.label}
                  </span>
                  <span className="block text-[10px] text-brand-deep/40">{count}</span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
