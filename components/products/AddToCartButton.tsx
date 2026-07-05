'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/product-types';

export function AddToCartButton({ product, qty = 1, className, compact }: { product: Product; qty?: number; className?: string; compact?: boolean }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  const label = added ? 'Added!' : compact ? 'Add' : 'Add to Cart';

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`flex items-center justify-center gap-2 whitespace-nowrap bg-brand-deep text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-brand-primary active:scale-[0.98] ${className ?? ''}`}
    >
      {added ? <Check size={14} /> : <ShoppingCart size={14} />}
      {label}
    </button>
  );
}
