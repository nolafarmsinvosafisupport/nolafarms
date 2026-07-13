'use client';

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ShoppingCart, MessageCircle, Check, PackageX, Eye } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import { useNotifications } from '@/lib/notification-context';
import { SITE } from '@/lib/constants';
import type { Product } from '@/lib/product-types';
import { CATEGORY_LABELS } from '@/lib/product-types';

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
  const { addItem } = useCart();
  const { isAdmin } = useNotifications();
  const [added, setAdded] = useState(false);

  const price = product.price ? parseFloat(product.price) : null;
  const compareAt = product.compare_at_price ? parseFloat(product.compare_at_price) : null;
  const isOnSale = price !== null && compareAt !== null && compareAt > price;
  const imageSrc = product.images[0] ?? '/images/farm/farm.webp';

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault();
    addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const whatsappNumber = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : '254750958780';
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello, I'd like to request ${product.name} from Nola Ranches. Please provide more details.`)}`;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-farm-border bg-cream-warm transition-shadow hover:shadow-md">
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
          <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Sale
          </span>
        )}
        {!product.in_stock && (
          <span className="absolute right-2 top-2 rounded-full bg-brand-deep px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">
            Out of Stock
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

        {/* Actions: eye (view) — WhatsApp (primary) — cart.
            An admin gets a plain View Details instead: they manage enquiries from the admin panel
            and have no reason to WhatsApp or buy from their own shop. */}
        <div className="mt-3 flex items-stretch gap-2 border-t border-farm-border pt-3">
          {isAdmin ? (
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 rounded-lg border border-brand-deep py-2 text-center text-xs font-semibold uppercase tracking-widest text-brand-deep transition-colors hover:bg-brand-deep hover:text-cream-primary"
            >
              View Details
            </Link>
          ) : (
            <>
              <Link
                href={`/products/${product.slug}`}
                aria-label={`View details for ${product.name}`}
                title="View details"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-brand-deep text-brand-deep transition-colors hover:bg-brand-deep hover:text-cream-primary"
              >
                <Eye size={14} />
              </Link>

              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand-leaf text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-deep"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>

              {/* A service is booked, not bought — no cart button for it. */}
              {!product.is_service &&
                (!product.in_stock ? (
                  <span
                    aria-label="Out of stock"
                    title="Out of stock"
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-brand-deep/10 text-brand-deep/40"
                  >
                    <PackageX size={14} />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleQuickAdd}
                    aria-label={`Add ${product.name} to cart`}
                    title="Add to cart"
                    className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                      added ? 'bg-brand-leaf text-white' : 'bg-brand-deep text-cream-primary hover:bg-brand-primary'
                    }`}
                  >
                    {added ? <Check size={14} /> : <ShoppingCart size={14} />}
                  </button>
                ))}
            </>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-farm-border bg-cream-warm">
      <div className="aspect-[4/3] image-skeleton" />
      <div className="p-4 space-y-3">
        <div className="h-3 w-16 rounded bg-cream-secondary" />
        <div className="h-4 w-3/4 rounded bg-cream-secondary" />
        <div className="h-3 w-1/2 rounded bg-cream-secondary" />
      </div>
    </div>
  );
}
