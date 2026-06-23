'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/lib/cart-context';

export function CartIcon() {
  const { totalItems } = useCart();

  return (
    <Link
      href="/cart"
      aria-label={`Cart${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-cream-secondary transition-colors hover:text-cream-primary"
    >
      <ShoppingCart size={18} />
      {totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-leaf text-[9px] font-bold text-white ring-1 ring-farm-dark">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  );
}
