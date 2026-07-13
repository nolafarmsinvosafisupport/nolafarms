'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

type WishlistContextType = {
  productIds: string[];
  isWishlisted: (productId: string) => boolean;
  toggleItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  totalItems: number;
};

const WishlistContext = createContext<WishlistContextType | null>(null);

const STORAGE_KEY = 'nolafarms_wishlist';

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setProductIds(JSON.parse(stored));
    } catch {
      // ignore invalid JSON
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(productIds));
  }, [productIds, hydrated]);

  const toggleItem = useCallback((productId: string) => {
    setProductIds((prev) => (prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]));
  }, []);

  const removeItem = useCallback((productId: string) => {
    setProductIds((prev) => prev.filter((id) => id !== productId));
  }, []);

  const isWishlisted = useCallback((productId: string) => productIds.includes(productId), [productIds]);

  return (
    <WishlistContext.Provider value={{ productIds, isWishlisted, toggleItem, removeItem, totalItems: productIds.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}
