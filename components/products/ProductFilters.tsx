'use client';

import type { Product, ProductCategory, Ranch } from '@/lib/product-types';

export type CategoryFilterKey = ProductCategory | 'livestock';

export const CATEGORY_FILTER_OPTIONS: { key: CategoryFilterKey; label: string }[] = [
  { key: 'livestock', label: 'Livestock' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'grains', label: 'Grains' },
  { key: 'fruits', label: 'Fruits' },
];

const LIVESTOCK_CATS = new Set<ProductCategory>(['cattle', 'goats', 'sheep', 'pigs', 'poultry']);

export function matchesCategoryFilter(product: Product, key: CategoryFilterKey) {
  return key === 'livestock' ? LIVESTOCK_CATS.has(product.category) : product.category === key;
}

const RANCH_OPTIONS: { key: Ranch; label: string }[] = [
  { key: 'oloitoktok', label: 'Oloitoktok Ranch' },
  { key: 'laikipia', label: 'Laikipia Ranch' },
];

type Props = {
  products: Product[];
  selectedCategories: Set<CategoryFilterKey>;
  onToggleCategory: (key: CategoryFilterKey) => void;
  onClearCategories: () => void;
  selectedRanches: Set<Ranch>;
  onToggleRanch: (r: Ranch) => void;
  onClearRanches: () => void;
  priceBounds: [number, number];
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
};

export function ProductFilters({
  products,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  selectedRanches,
  onToggleRanch,
  onClearRanches,
  priceBounds,
  priceRange,
  onPriceRangeChange,
}: Props) {
  const checkboxCls = 'h-4 w-4 flex-shrink-0 accent-brand-leaf';

  return (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-deep/60">Category</p>
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-deep/80">
            <input type="checkbox" className={checkboxCls} checked={selectedCategories.size === 0} onChange={onClearCategories} />
            All
          </label>
          {CATEGORY_FILTER_OPTIONS.map(({ key, label }) => {
            const count = products.filter((p) => matchesCategoryFilter(p, key)).length;
            return (
              <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-brand-deep/80">
                <input
                  type="checkbox"
                  className={checkboxCls}
                  checked={selectedCategories.has(key)}
                  onChange={() => onToggleCategory(key)}
                />
                {label} <span className="text-brand-deep/40">({count})</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Ranch */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-deep/60">Ranch</p>
        <div className="space-y-1.5">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-deep/80">
            <input type="checkbox" className={checkboxCls} checked={selectedRanches.size === 0} onChange={onClearRanches} />
            All Ranches
          </label>
          {RANCH_OPTIONS.map(({ key, label }) => (
            <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-brand-deep/80">
              <input type="checkbox" className={checkboxCls} checked={selectedRanches.has(key)} onChange={() => onToggleRanch(key)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Price range */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-deep/60">Price Range (KES)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={priceBounds[0]}
            max={priceRange[1]}
            value={priceRange[0]}
            onChange={(e) => onPriceRangeChange([Math.min(Number(e.target.value) || 0, priceRange[1]), priceRange[1]])}
            className="w-full border border-farm-border bg-cream-primary px-2 py-1.5 text-xs text-brand-deep outline-none focus:border-brand-leaf"
          />
          <span className="text-brand-deep/30">–</span>
          <input
            type="number"
            min={priceRange[0]}
            max={priceBounds[1]}
            value={priceRange[1]}
            onChange={(e) => onPriceRangeChange([priceRange[0], Math.max(Number(e.target.value) || 0, priceRange[0])])}
            className="w-full border border-farm-border bg-cream-primary px-2 py-1.5 text-xs text-brand-deep outline-none focus:border-brand-leaf"
          />
        </div>
        <p className="mt-1.5 text-[10px] text-brand-deep/40">
          Applies to priced items only — &quot;Contact for Price&quot; items are always shown.
        </p>
      </div>
    </div>
  );
}
