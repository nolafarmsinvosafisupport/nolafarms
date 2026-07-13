'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/wishlist-context';

export function WishlistIcon() {
  const { totalItems } = useWishlist();

  return (
    <Link
      href="/wishlist"
      aria-label={`Wishlist${totalItems > 0 ? ` (${totalItems} items)` : ''}`}
      className="relative flex h-9 w-9 items-center justify-center rounded-full text-cream-secondary transition-colors hover:text-cream-primary"
    >
      <Heart size={18} />
      {totalItems > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-leaf text-[9px] font-bold text-white ring-1 ring-farm-dark">
          {totalItems > 9 ? '9+' : totalItems}
        </span>
      )}
    </Link>
  );
}
