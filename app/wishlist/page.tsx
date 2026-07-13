import type { Metadata } from 'next';
import { WishlistPageClient } from '@/components/products/WishlistPageClient';

export const metadata: Metadata = {
  title: 'Your Wishlist | Nola Ranches',
};

export default function WishlistPage() {
  return <WishlistPageClient />;
}
