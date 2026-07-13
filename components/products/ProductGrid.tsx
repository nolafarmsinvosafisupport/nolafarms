'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { ProductFilters } from './ProductFilters';
import { CategoryCards } from './CategoryCards';
import {
  MAIN_CATEGORIES,
  matchesMain,
  matchesSub,
  browsableProducts,
  featuredRank,
} from '@/lib/product-taxonomy';
import type { MainKey, SubKey } from '@/lib/product-taxonomy';
import type { Product, Ranch } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest First' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A-Z' },
];

const ITEMS_PER_PAGE = 8;

function priceOf(p: Product) {
  return p.price ? parseFloat(p.price) : null;
}

export function ProductGrid({
  products,
  categories,
}: {
  products: Product[];
  // Only used for category card images: whatever an admin sets at /admin/categories wins over
  // the fallback constants in lib/product-taxonomy.
  categories: ProductCategoryPage[];
}) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');

  // One piece of state, two views onto it: the cards and the sidebar both read and write these.
  // That is what stops the two filters from ever disagreeing.
  const [selectedMain, setSelectedMain] = useState<MainKey | null>(() =>
    MAIN_CATEGORIES.some((c) => c.key === initialCategory) ? (initialCategory as MainKey) : null,
  );
  const [selectedSubs, setSelectedSubs] = useState<Set<SubKey>>(new Set());
  const [selectedRanches, setSelectedRanches] = useState<Set<Ranch>>(new Set());

  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Changing the main category drops any subcategory picks — Cattle is meaningless under Grains.
  function selectMain(key: MainKey | null) {
    setSelectedMain(key);
    setSelectedSubs(new Set());
  }

  function toggleSub(key: SubKey) {
    setSelectedSubs((prev) => {
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
    // No main category selected = the whole catalogue, minus services (a bookable service is not
    // an animal for sale, so it only surfaces under Services).
    const base = selectedMain === null ? browsableProducts(products) : products.filter((p) => matchesMain(p, selectedMain));

    return base.filter((p) => {
      if (selectedSubs.size > 0 && !Array.from(selectedSubs).some((s) => matchesSub(p, s))) return false;
      if (selectedRanches.size > 0 && !selectedRanches.has(p.ranch) && p.ranch !== 'both') return false;
      return true;
    });
  }, [products, selectedMain, selectedSubs, selectedRanches]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    switch (sortBy) {
      case 'price-asc':
        return arr.sort((a, b) => (priceOf(a) ?? Infinity) - (priceOf(b) ?? Infinity));
      case 'price-desc':
        return arr.sort((a, b) => (priceOf(b) ?? -Infinity) - (priceOf(a) ?? -Infinity));
      case 'name':
        return arr.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
        return arr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        // Featured: cattle, then goats & sheep, then pigs, then everything else — so livestock
        // leads the first page instead of being scattered through whatever is newest.
        return arr.sort(
          (a, b) => featuredRank(a) - featuredRank(b) || a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        );
    }
  }, [filtered, sortBy]);

  useEffect(() => setPage(1), [selectedMain, selectedSubs, selectedRanches, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    // Three rows on desktop, so each piece lines up where it should:
    //   row 1  [ spacer ] [ category cards ]   cards start level with the product images
    //   row 2  [ spacer ] [ count + sort    ]
    //   row 3  [ sidebar] [ product grid    ]  sidebar top lines up with the first product row
    // The spacers are lg-only, so on mobile everything just stacks in reading order.
    <div className="grid gap-x-8 gap-y-5 lg:grid-cols-[240px_1fr]">
      <div className="hidden lg:block" aria-hidden />
      <CategoryCards
        products={products}
        categories={categories}
        selectedMain={selectedMain}
        onSelectMain={selectMain}
        selectedSubs={selectedSubs}
        onToggleSub={toggleSub}
      />

      <div className="hidden lg:block" aria-hidden />
      <div className="flex flex-wrap items-center justify-between gap-3">
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

      {/* Filters — sticky sidebar on desktop, collapsible drawer on mobile/tablet. max-h + its own
          scrollbar so a long filter list can never outgrow the viewport and break the stickiness. */}
      <aside className="lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:self-start lg:overflow-y-auto">
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
            selectedMain={selectedMain}
            onSelectMain={selectMain}
            selectedSubs={selectedSubs}
            onToggleSub={toggleSub}
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
