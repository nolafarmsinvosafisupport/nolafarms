'use client';

import { useState, useMemo } from 'react';
import { ProductCard } from './ProductCard';
import type { Product, ProductCategory, Ranch } from '@/lib/product-types';

type CategoryFilter = ProductCategory | 'all' | 'livestock';

const CATEGORY_TABS: { key: CategoryFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'livestock', label: 'Livestock' },
  { key: 'vegetables', label: 'Vegetables' },
  { key: 'grains', label: 'Grains' },
  { key: 'fruits', label: 'Fruits' },
];

const LIVESTOCK_CATS = new Set(['cattle', 'goats', 'sheep', 'pigs', 'poultry']);

const RANCH_OPTIONS: { key: Ranch | 'all'; label: string }[] = [
  { key: 'all', label: 'All Ranches' },
  { key: 'oloitoktok', label: 'Oloitoktok' },
  { key: 'laikipia', label: 'Laikipia' },
];

export function ProductGrid({ products }: { products: Product[] }) {
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [ranch, setRanch] = useState<Ranch | 'all'>('all');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (category === 'livestock' && !LIVESTOCK_CATS.has(p.category)) return false;
      if (category !== 'all' && category !== 'livestock' && p.category !== category) return false;
      if (ranch !== 'all' && p.ranch !== ranch && p.ranch !== 'both') return false;
      return true;
    });
  }, [products, category, ranch]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Category tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={`flex-shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
                category === tab.key
                  ? 'bg-brand-deep text-cream-primary'
                  : 'border border-farm-border text-brand-deep/60 hover:text-brand-deep'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Ranch filter */}
        <select
          value={ranch}
          onChange={(e) => setRanch(e.target.value as Ranch | 'all')}
          className="border border-farm-border bg-cream-primary px-3 py-1.5 text-xs text-brand-deep outline-none focus:border-brand-leaf sm:w-44"
        >
          {RANCH_OPTIONS.map((r) => (
            <option key={r.key} value={r.key}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="text-xs text-brand-deep/50">
        {filtered.length} {filtered.length === 1 ? 'product' : 'products'}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-brand-deep/50">No products match the selected filters.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
