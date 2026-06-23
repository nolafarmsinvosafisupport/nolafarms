import type { Metadata } from 'next';
import { CheckoutClient } from '@/components/products/CheckoutClient';

export const metadata: Metadata = {
  title: 'Checkout | Nola Farms',
};

export default function CheckoutPage() {
  return <CheckoutClient />;
}
