'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heart, ArrowRight, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { useWishlist } from '@/lib/wishlist-context';
import type { Product } from '@/lib/product-types';

export function WishlistPageClient() {
  const { productIds } = useWishlist();
  const [products, setProducts] = useState<Product[] | null>(null);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setProducts(data.success ? data.products : []))
      .catch(() => setProducts([]));
  }, []);

  const wishlisted = (products ?? []).filter((p) => productIds.includes(p.id));

  if (products === null) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center pt-16">
        <Loader2 size={28} className="animate-spin text-brand-deep/30" />
      </main>
    );
  }

  if (wishlisted.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-24 text-center">
        <Heart size={40} className="text-brand-deep/20" />
        <h1 className="mt-4 font-serif text-3xl text-brand-deep">Your wishlist is empty</h1>
        <p className="mt-2 text-brand-deep/60">Tap the heart icon on any product to save it here.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 bg-brand-deep px-8 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary"
        >
          Browse Products <ArrowRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-16 bg-cream-primary min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
        <h1 className="font-serif text-3xl text-brand-deep md:text-4xl">Your Wishlist</h1>
        <p className="mt-1 text-sm text-brand-deep/60">{wishlisted.length} saved {wishlisted.length === 1 ? 'item' : 'items'}</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {wishlisted.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </main>
  );
}
