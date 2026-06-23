'use client';

import { ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/product-types';

export function AddToCartButton({ product, qty = 1, className }: { product: Product; qty?: number; className?: string }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleAdd}
      className={`flex items-center justify-center gap-2 bg-brand-deep text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-brand-primary active:scale-[0.98] ${className ?? ''}`}
    >
      {added ? <Check size={14} /> : <ShoppingCart size={14} />}
      {added ? 'Added!' : 'Add to Cart'}
    </button>
  );
}
