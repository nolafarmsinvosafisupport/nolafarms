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
};

export function ProductFilters({
  products,
  selectedCategories,
  onToggleCategory,
  onClearCategories,
  selectedRanches,
  onToggleRanch,
  onClearRanches,
}: Props) {
  const checkboxCls = 'h-4 w-4 flex-shrink-0 rounded accent-brand-leaf';

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
    </div>
  );
}
