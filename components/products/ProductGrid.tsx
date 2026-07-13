'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductFilters, CATEGORY_FILTER_OPTIONS, matchesCategoryFilter } from './ProductFilters';
import type { CategoryFilterKey } from './ProductFilters';
import type { Product, Ranch } from '@/lib/product-types';

type SortKey = 'newest' | 'price-asc' | 'price-desc' | 'name';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A-Z' },
];

const ITEMS_PER_PAGE = 8;

function priceOf(p: Product) {
  return p.price ? parseFloat(p.price) : null;
}

export function ProductGrid({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');

  const [selectedCategories, setSelectedCategories] = useState<Set<CategoryFilterKey>>(() => {
    const valid = CATEGORY_FILTER_OPTIONS.some((o) => o.key === initialCategory);
    return valid ? new Set([initialCategory as CategoryFilterKey]) : new Set();
  });
  const [selectedRanches, setSelectedRanches] = useState<Set<Ranch>>(new Set());

  const [sortBy, setSortBy] = useState<SortKey>('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  function toggleCategory(key: CategoryFilterKey) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  function toggleRanch(r: Ranch) {
    setSelectedRanches((prev) => {
      const next = new Set(prev);
      next.has(r) ? next.delete(r) : next.add(r);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategories.size > 0 && !Array.from(selectedCategories).some((c) => matchesCategoryFilter(p, c))) return false;
      if (selectedRanches.size > 0 && !selectedRanches.has(p.ranch) && p.ranch !== 'both') return false;
      return true;
    });
  }, [products, selectedCategories, selectedRanches]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        return arr.sort((a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity));
      case 'price-desc':
        return arr.sort((a, b) => (priceOf(b) ?? -Infinity) - (priceOf(a) ?? -Infinity));
      case 'name':
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
  }, [filtered, sortBy]);

  useEffect(() => setPage(1), [selectedCategories, selectedRanches, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Filters — sidebar on desktop, collapsible drawer on mobile/tablet */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="mb-3 flex w-full items-center justify-between rounded-lg border border-farm-border bg-cream-warm px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-deep lg:hidden"
        >
          <span className="flex items-center gap-2"><SlidersHorizontal size={14} /> Filter &amp; Sort</span>
          <span>{showFilters ? '−' : '+'}</span>
        </button>
        <div className={`${showFilters ? 'block' : 'hidden'} rounded-lg border border-farm-border bg-cream-warm p-4 lg:block`}>
          <ProductFilters
            products={products}
            selectedCategories={selectedCategories}
            onToggleCategory={toggleCategory}
            onClearCategories={() => setSelectedCategories(new Set())}
            selectedRanches={selectedRanches}
            onToggleRanch={toggleRanch}
            onClearRanches={() => setSelectedRanches(new Set())}
          />
          <button
            type="button"
            onClick={() => setShowFilters(false)}
            className="mt-5 w-full rounded-lg bg-brand-leaf py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-deep lg:hidden"
          >
            Apply Filters
          </button>
        </div>
      </aside>

      {/* Grid */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-brand-deep/50">
            Showing {paged.length} of {sorted.length} product{sorted.length !== 1 ? 's' : ''}
          </p>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="rounded-lg border border-farm-border bg-cream-primary px-3 py-1.5 text-xs text-brand-deep outline-none focus:border-brand-leaf"
          >
            {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
          </select>
        </div>

        {paged.length === 0 ? (
          <p className="py-12 text-center text-sm text-brand-deep/50">No products match the selected filters.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {paged.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-farm-border text-brand-deep disabled:opacity-30"
            >
              <ChevronLeft size={14} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-semibold ${
                  n === page ? 'bg-brand-deep text-cream-primary' : 'border border-farm-border text-brand-deep/60'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-farm-border text-brand-deep disabled:opacity-30"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
