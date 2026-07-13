'use client';

import {
  MAIN_CATEGORIES,
  SUB_CATEGORIES,
  countMain,
  countSub,
  browsableProducts,
} from '@/lib/product-taxonomy';
import type { MainKey, SubKey } from '@/lib/product-taxonomy';
import type { Product, Ranch } from '@/lib/product-types';

const RANCH_OPTIONS: { key: Ranch; label: string }[] = [
  { key: 'oloitoktok', label: 'Oloitoktok Ranch' },
  { key: 'laikipia', label: 'Laikipia Ranch' },
];

type Props = {
  products: Product[];
  selectedMain: MainKey | null;
  onSelectMain: (key: MainKey | null) => void;
  selectedSubs: Set<SubKey>;
  onToggleSub: (key: SubKey) => void;
  selectedRanches: Set<Ranch>;
  onToggleRanch: (r: Ranch) => void;
  onClearRanches: () => void;
};

/**
 * The sidebar is a second view onto exactly the same state as the category cards — same keys,
 * same counts, same match rules from lib/product-taxonomy. Tick something here and the cards
 * update, and vice versa; the two cannot drift apart.
 *
 * Main category is radio-style (one at a time) because subcategories only make sense under a
 * single parent. Subcategories are checkboxes, so you can view Cattle and Pigs together.
 */
export function ProductFilters({
  products,
  selectedMain,
  onSelectMain,
  selectedSubs,
  onToggleSub,
  selectedRanches,
  onToggleRanch,
  onClearRanches,
}: Props) {
  const inputCls = 'h-4 w-4 flex-shrink-0 accent-brand-leaf';
  const rowCls = 'flex cursor-pointer items-center gap-2 text-sm text-brand-deep/80';

  const active = MAIN_CATEGORIES.find((c) => c.key === selectedMain);
  const subs = active ? SUB_CATEGORIES.filter((s) => active.subs.includes(s.key)) : [];

  return (
    <div className="space-y-6">
      {/* Category — single select */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-deep/60">Category</p>
        <div className="space-y-1.5">
          <label className={rowCls}>
            <input
              type="radio"
              name="category"
              className={inputCls}
              checked={selectedMain === null}
              onChange={() => onSelectMain(null)}
            />
            All <span className="text-brand-deep/40">({browsableProducts(products).length})</span>
          </label>
          {MAIN_CATEGORIES.map((c) => (
            <label key={c.key} className={rowCls}>
              <input
                type="radio"
                name="category"
                className={inputCls}
                checked={selectedMain === c.key}
                onChange={() => onSelectMain(c.key)}
              />
              {c.label} <span className="text-brand-deep/40">({countMain(products, c.key)})</span>
            </label>
          ))}
        </div>
      </div>

      {/* Subcategories — only for a main category that has them */}
      {subs.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-deep/60">
            {active?.label} Type
          </p>
          <div className="space-y-1.5">
            {subs.map((s) => (
              <label key={s.key} className={rowCls}>
                <input
                  type="checkbox"
                  className={`${inputCls} rounded`}
                  checked={selectedSubs.has(s.key)}
                  onChange={() => onToggleSub(s.key)}
                />
                {s.label} <span className="text-brand-deep/40">({countSub(products, s.key)})</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Ranch */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-deep/60">Ranch</p>
        <div className="space-y-1.5">
          <label className={rowCls}>
            <input
              type="checkbox"
              className={`${inputCls} rounded`}
              checked={selectedRanches.size === 0}
              onChange={onClearRanches}
            />
            All Ranches
          </label>
          {RANCH_OPTIONS.map(({ key, label }) => (
            <label key={key} className={rowCls}>
              <input
                type="checkbox"
                className={`${inputCls} rounded`}
                checked={selectedRanches.has(key)}
                onChange={() => onToggleRanch(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
