import type { Metadata } from 'next';
import { CartPageClient } from '@/components/products/CartPageClient';

export const metadata: Metadata = {
  title: 'Your Cart | Nola Farms',
};

export default function CartPage() {
  return <CartPageClient />;
}
