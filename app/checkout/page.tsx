import type { Metadata } from 'next';
import { CheckoutClient } from '@/components/products/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout | Nola Ranches',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
