'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { ProductAddToCart } from './ProductAddToCart';
import { CATEGORY_LABELS } from '@/lib/product-types';
import type { Product } from '@/lib/product-types';

export function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const price = product.price ? parseFloat(product.price) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view — ${product.name}`}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="grid max-h-[90vh] w-full max-w-3xl grid-cols-1 overflow-y-auto bg-cream-primary shadow-2xl sm:grid-cols-2"
      >
        <div className="image-skeleton relative aspect-square bg-cream-secondary sm:aspect-auto">
          <Image
            src={product.images[0] ?? '/images/farm/farm.webp'}
            alt={product.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="relative p-6">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick view"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-brand-deep/50 hover:text-brand-deep"
          >
            <X size={18} />
          </button>

          <span className="inline-block rounded-full bg-brand-leaf/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-leaf">
            {CATEGORY_LABELS[product.category]}
          </span>
          <h2 className="mt-3 font-serif text-2xl text-brand-deep">{product.name}</h2>

          <div className="mt-2">
            {price !== null ? (
              <span className="font-semibold text-brand-deep">
                KES {price.toLocaleString()} <span className="text-xs font-normal text-brand-deep/50">{product.price_unit}</span>
              </span>
            ) : (
              <span className="text-sm font-semibold text-gold-warm">Contact for Price</span>
            )}
          </div>

          {product.description && <p className="mt-4 text-sm leading-6 text-brand-deep/75">{product.description}</p>}

          <div className="mt-5">
            <ProductAddToCart product={product} />
          </div>

          <Link href={`/products/${product.slug}`} className="mt-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-leaf hover:text-brand-deep">
            View full details →
          </Link>
        </div>
      </div>
    </div>
  );
}
