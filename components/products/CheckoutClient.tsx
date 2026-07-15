'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/lib/cart-context';

export function CheckoutClient() {
  const router = useRouter();
  const { user, isSignedIn } = useUser();
  const { items, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    delivery_location: '',
    delivery_notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Checkout is account-gated, so a signed-in user's own details are already
  // known — pre-fill name/email so they don't have to retype what Clerk has.
  useEffect(() => {
    if (!isSignedIn || !user) return;
    setForm((f) => ({
      ...f,
      customer_name: f.customer_name || user.fullName || '',
      customer_email: f.customer_email || user.primaryEmailAddress?.emailAddress || '',
    }));
  }, [isSignedIn, user]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!items.length) return;
    setLoading(true);
    setError('');
    try {
      const orderItems = items.map((i) => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        unit: i.unit,
        price_at_time: i.price_at_time,
        note: '',
      }));
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, items: orderItems }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Order failed.');
      clearCart();
      window.dispatchEvent(new Event('nola:notif:refresh'));
      router.push(`/order-confirmed?ref=${data.reference}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-24 text-center">
        <h1 className="font-serif text-3xl text-brand-deep">Cart is empty</h1>
        <Link href="/products" className="mt-6 text-sm text-brand-leaf hover:underline">Back to products</Link>
      </main>
    );
  }

  return (
    <main className="bg-cream-primary min-h-screen pt-16">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        <Link href="/cart" className="mb-6 inline-flex items-center gap-1.5 text-xs text-brand-deep/50 hover:text-brand-deep">
          <ArrowLeft size={12} /> Back to Cart
        </Link>

        <h1 className="font-serif text-3xl text-brand-deep md:text-4xl">Place Your Order</h1>
        <p className="mt-2 text-sm text-brand-deep/60">
          We&apos;ll contact you within 24 hours to arrange payment and delivery.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-deep/50">
                  Full Name *
                </label>
                <input
                  name="customer_name"
                  required
                  value={form.customer_name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="w-full border border-farm-border bg-white px-4 py-2.5 text-sm text-brand-deep outline-none focus:border-brand-leaf"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-deep/50">
                  Phone Number *
                </label>
                <input
                  name="customer_phone"
                  required
                  type="tel"
                  value={form.customer_phone}
                  onChange={handleChange}
                  placeholder="07XX XXX XXX"
                  className="w-full border border-farm-border bg-white px-4 py-2.5 text-sm text-brand-deep outline-none focus:border-brand-leaf"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-deep/50">
                Email Address <span className="font-normal normal-case text-brand-deep/30">(optional)</span>
              </label>
              <input
                name="customer_email"
                type="email"
                value={form.customer_email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full border border-farm-border bg-white px-4 py-2.5 text-sm text-brand-deep outline-none focus:border-brand-leaf"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-deep/50">
                Delivery Location *
              </label>
              <input
                name="delivery_location"
                required
                value={form.delivery_location}
                onChange={handleChange}
                placeholder="Town, area or address"
                className="w-full border border-farm-border bg-white px-4 py-2.5 text-sm text-brand-deep outline-none focus:border-brand-leaf"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-widest text-brand-deep/50">
                Additional Notes <span className="font-normal normal-case text-brand-deep/30">(optional)</span>
              </label>
              <textarea
                name="delivery_notes"
                rows={3}
                value={form.delivery_notes}
                onChange={handleChange}
                placeholder="Specific quantities, preferred delivery time, special requirements..."
                className="w-full border border-farm-border bg-white px-4 py-2.5 text-sm text-brand-deep outline-none focus:border-brand-leaf resize-none"
              />
            </div>

            {error && (
              <p className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 bg-brand-deep py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary disabled:opacity-60 transition-colors"
            >
              {loading ? <><Loader2 size={14} className="animate-spin" /> Placing Order...</> : 'Place Order'}
            </button>

            <p className="text-center text-xs text-brand-deep/40">
              No payment required now. We&apos;ll contact you to confirm and arrange payment.
            </p>
          </form>

          {/* Summary */}
          <div className="self-start border border-farm-border bg-cream-warm p-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-brand-deep/50">Order Items</h2>
            <div className="mt-3 space-y-3">
              {items.map((item) => {
                const price = item.price_at_time ? parseFloat(item.price_at_time) : null;
                return (
                  <div key={item.product_id} className="flex gap-3">
                    {item.image && (
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden bg-cream-secondary">
                        <Image src={item.image} alt={item.product_name} fill sizes="48px" className="object-cover object-top" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-xs font-medium text-brand-deep">{item.product_name}</p>
                      <p className="text-xs text-brand-deep/50">Qty: {item.quantity} {item.unit}</p>
                      {price !== null ? (
                        <p className="text-xs font-semibold text-brand-deep">KES {(price * item.quantity).toLocaleString()}</p>
                      ) : (
                        <p className="text-xs text-gold-warm">Contact for price</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {totalPrice !== null && (
              <div className="mt-4 border-t border-farm-border pt-4 flex justify-between font-semibold text-sm text-brand-deep">
                <span>Total</span>
                <span>KES {totalPrice.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
