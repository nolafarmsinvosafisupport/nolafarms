'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { CategoryCards } from './CategoryCards';
import { CATEGORY_CARDS, matchesCard, browsableProducts, featuredRank } from '@/lib/product-taxonomy';
import type { CardKey } from '@/lib/product-taxonomy';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

type SortKey = 'featured' | 'newest' | 'price-asc' | 'price-desc' | 'name';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'newest', label: 'Newest First' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name', label: 'Name A-Z' },
];

const ITEMS_PER_PAGE = 12;

function priceOf(p: Product) {
  return p.price ? parseFloat(p.price) : null;
}

export function ProductGrid({
  products,
  categories,
}: {
  products: Product[];
  // Only used for card images: whatever an admin sets at /admin/categories wins over the
  // fallback constants in lib/product-taxonomy.
  categories: ProductCategoryPage[];
}) {
  const searchParams = useSearchParams();
  const initial = searchParams.get('category');

  // The cards are the only filter — there is no sidebar and no ranch filter, so this single
  // value is the whole filter state.
  const [selected, setSelected] = useState<CardKey | null>(() =>
    CATEGORY_CARDS.some((c) => c.key === initial) ? (initial as CardKey) : null,
  );
  const [sortBy, setSortBy] = useState<SortKey>('featured');
  const [page, setPage] = useState(1);

  const filtered = useMemo(
    () => (selected === null ? browsableProducts(products) : products.filter((p) => matchesCard(p, selected))),
    [products, selected],
  );

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
        // Featured: cattle, then goats & sheep, then pigs — the same order as the cards.
        return arr.sort(
          (a, b) => featuredRank(a) - featuredRank(b) || a.sort_order - b.sort_order || a.name.localeCompare(b.name),
        );
    }
  }, [filtered, sortBy]);

  useEffect(() => setPage(1), [selected, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const paged = sorted.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <CategoryCards products={products} categories={categories} selected={selected} onSelect={setSelected} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-brand-deep/50">
          Showing {paged.length} of {sorted.length} product{sorted.length !== 1 ? 's' : ''}
        </p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortKey)}
          className="rounded-lg border border-farm-border bg-cream-primary px-3 py-1.5 text-xs text-brand-deep outline-none focus:border-brand-leaf"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.key} value={o.key}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {/* Full width now the sidebar is gone — the grid takes the space it used to occupy, so an
          extra column fits at each breakpoint. */}
      {paged.length === 0 ? (
        <p className="py-12 text-center text-sm text-brand-deep/50">No products match the selected filter.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {paged.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

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
  );
}
