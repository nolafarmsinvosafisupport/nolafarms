import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ShoppingBag } from 'lucide-react';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Order Confirmed | Nola Ranches',
};

export default async function OrderConfirmedPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams;
  const whatsappNumber = SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : '254750958780';
  const whatsappText = encodeURIComponent(`Hello Nola Ranches, I just placed order ${ref ?? ''} on your website. Looking forward to hearing from you!`);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream-primary px-6 pt-16 text-center">
      <div className="max-w-md w-full">
        <div className="flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-leaf/10">
            <CheckCircle2 size={40} className="text-brand-leaf" />
          </div>
        </div>

        <h1 className="mt-6 font-serif text-3xl text-brand-deep">Order Received!</h1>

        {ref && (
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-brand-leaf">
            Reference: {ref}
          </p>
        )}

        <p className="mt-4 text-brand-deep/70 leading-7">
          Thank you for your order. Our team will contact you within{' '}
          <strong>24 hours</strong> to confirm details, arrange payment, and schedule delivery.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${whatsappText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-green-700 transition-colors"
          >
            <MessageCircle size={14} />
            Message Us on WhatsApp
          </a>
          <Link
            href="/products"
            className="flex items-center justify-center gap-2 border border-farm-border py-3 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-cream-secondary transition-colors"
          >
            <ShoppingBag size={14} />
            Continue Shopping
          </Link>
        </div>

        <p className="mt-8 text-xs text-brand-deep/40">
          Questions? Call or WhatsApp us at {SITE.phone !== 'PLACEHOLDER_PHONE' ? SITE.phone : '0750 958 780'}
        </p>
      </div>
    </main>
  );
}
