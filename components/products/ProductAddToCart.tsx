'use client';

import { useState } from 'react';
import { Minus, Plus, ShoppingCart, MessageCircle, PackageX } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/cart-context';
import { useNotifications } from '@/lib/notification-context';
import { SITE } from '@/lib/constants';
import type { Product } from '@/lib/product-types';

export function ProductAddToCart({ product }: { product: Product }) {
  const { addItem, totalItems } = useCart();
  const { isAdmin } = useNotifications();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  // Admin accounts browse the storefront but don't place orders themselves —
  // they view what visitors have purchased/booked instead.
  if (isAdmin) return null;

  // Services (e.g. boar hire) are booked, not added to a cart — send straight to WhatsApp.
  if (product.is_service) {
    const whatsappNumber = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : '254750958780';
    const text = encodeURIComponent(`Hello, I'd like to request ${product.name} from Nola Ranches. Please provide more details.`);
    return (
      <a
        href={`https://wa.me/${whatsappNumber}?text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 bg-brand-deep py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-brand-primary"
      >
        <MessageCircle size={14} />
        Request This Service
      </a>
    );
  }

  if (!product.in_stock) {
    return (
      <div className="flex items-center justify-center gap-2 bg-brand-deep/10 py-3 text-xs font-semibold uppercase tracking-widest text-brand-deep/50">
        <PackageX size={14} />
        Out of Stock
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* Quantity */}
        <div className="flex items-center border border-farm-border">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-10 w-10 items-center justify-center text-brand-deep hover:bg-cream-secondary"
          >
            <Minus size={14} />
          </button>
          <span className="w-12 text-center text-sm font-semibold text-brand-deep">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="flex h-10 w-10 items-center justify-center text-brand-deep hover:bg-cream-secondary"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={handleAdd}
          className={`flex flex-1 items-center justify-center gap-2 py-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
            added
              ? 'bg-brand-leaf text-white'
              : 'bg-brand-deep text-cream-primary hover:bg-brand-primary'
          }`}
        >
          <ShoppingCart size={14} />
          {added ? 'Added to Cart!' : 'Add to Cart'}
        </button>
      </div>

      {added && totalItems > 0 && (
        <Link
          href="/cart"
          className="block w-full border border-farm-border py-2.5 text-center text-xs font-semibold uppercase tracking-widest text-brand-deep transition-colors hover:bg-cream-secondary"
        >
          View Cart ({totalItems} {totalItems === 1 ? 'item' : 'items'})
        </Link>
      )}
    </div>
  );
}
