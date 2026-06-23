'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Minus, Plus } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import type { Product } from '@/lib/product-types';
import { CATEGORY_LABELS, RANCH_LABELS } from '@/lib/product-types';

const CATEGORY_COLORS: Record<string, string> = {
  cattle: 'bg-amber-100 text-amber-800',
  goats: 'bg-lime-100 text-lime-800',
  sheep: 'bg-sky-100 text-sky-800',
  pigs: 'bg-pink-100 text-pink-800',
  poultry: 'bg-yellow-100 text-yellow-800',
  vegetables: 'bg-green-100 text-green-800',
  fruits: 'bg-orange-100 text-orange-800',
  grains: 'bg-stone-100 text-stone-700',
};

export function ProductCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [showQty, setShowQty] = useState(false);

  const price = product.price ? parseFloat(product.price) : null;
  const compareAt = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
  const isOnSale = price !== null && compareAt !== null && compareAt > price;
  const imageSrc = product.images[0] ?? '/images/farm/farm.webp';

  return (
    <article className="group flex flex-col border border-farm-border bg-cream-warm transition-shadow hover:shadow-md">
      {/* Image */}
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-cream-secondary">
        <Image
          src={imageSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {isOnSale && (
          <span className="absolute left-2 top-2 bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Sale
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Badges */}
        <div className="mb-2 flex flex-wrap gap-1.5">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${CATEGORY_COLORS[product.category] ?? 'bg-gray-100 text-gray-700'}`}>
            {CATEGORY_LABELS[product.category]}
          </span>
          {product.ranch !== 'both' && (
            <span className="flex items-center gap-0.5 rounded-full bg-brand-leaf/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-leaf">
              <MapPin size={9} />
              {product.ranch === 'oloitoktok' ? 'Oloitoktok' : 'Laikipia'}
            </span>
          )}
        </div>

        <Link href={`/products/${product.slug}`} className="flex-1">
          <h3 className="text-sm font-semibold leading-snug text-brand-deep group-hover:text-brand-leaf sm:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2">
          {price !== null ? (
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-brand-deep">KES {price.toLocaleString()}</span>
              <span className="text-xs text-brand-deep/50">{product.price_unit}</span>
              {isOnSale && (
                <span className="text-xs text-brand-deep/40 line-through">KES {compareAt!.toLocaleString()}</span>
              )}
            </div>
          ) : (
            <span className="text-xs font-semibold text-gold-warm">Contact for Price</span>
          )}
          {product.bulk_info && (
            <p className="mt-0.5 text-[10px] text-brand-deep/50">{product.bulk_info}</p>
          )}
        </div>

        {/* Add to cart */}
        <div className="mt-3 border-t border-farm-border pt-3">
          {showQty ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center border border-farm-border">
                <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-8 w-8 items-center justify-center text-brand-deep hover:bg-cream-secondary">
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-sm font-medium text-brand-deep">{qty}</span>
                <button type="button" onClick={() => setQty((q) => q + 1)} className="flex h-8 w-8 items-center justify-center text-brand-deep hover:bg-cream-secondary">
                  <Plus size={12} />
                </button>
              </div>
              <AddToCartButton product={product} qty={qty} className="h-8 flex-1 px-3" />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowQty(true)}
              className="w-full border border-brand-deep py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep transition-colors hover:bg-brand-deep hover:text-cream-primary"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-farm-border bg-cream-warm">
      <div className="aspect-[4/3] image-skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded bg-cream-secondary" />
        <div className="h-4 w-3/4 rounded bg-cream-secondary" />
        <div className="h-3 w-1/2 rounded bg-cream-secondary" />
      </div>
    </div>
  );
}
