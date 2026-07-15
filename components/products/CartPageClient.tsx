'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, ShoppingCart, ArrowRight, LogIn } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useCart } from '@/lib/cart-context';

export function CartPageClient() {
  const { isSignedIn } = useUser();
  const { items, removeItem, updateQty, totalItems, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 pt-24 text-center">
        <ShoppingCart size={40} className="text-brand-deep/20" />
        <h1 className="mt-4 font-serif text-3xl text-brand-deep">Your cart is empty</h1>
        <p className="mt-2 text-brand-deep/60">Add products from our catalogue to get started.</p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-2 bg-brand-deep px-8 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary"
        >
          Browse Products <ArrowRight size={14} />
        </Link>
      </main>
    );
  }

  return (
    <main className="pt-16 bg-cream-primary min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-10 lg:px-8">
        <h1 className="font-serif text-3xl text-brand-deep md:text-4xl">Your Cart</h1>
        <p className="mt-1 text-sm text-brand-deep/60">{totalItems} {totalItems === 1 ? 'item' : 'items'}</p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
          {/* Cart items */}
          <div className="space-y-4">
            {items.map((item) => {
              const price = item.price_at_time ? parseFloat(item.price_at_time) : null;
              return (
                <div key={item.product_id} className="flex gap-4 border border-farm-border bg-cream-warm p-4">
                  {/* Image */}
                  {item.image && (
                    <Link href={`/products/${item.slug}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden bg-cream-secondary">
                      <Image src={item.image} alt={item.product_name} fill sizes="96px" className="object-cover object-top" />
                    </Link>
                  )}
                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/products/${item.slug}`} className="text-sm font-semibold text-brand-deep hover:text-brand-leaf truncate">
                        {item.product_name}
                      </Link>
                      <button
                        type="button"
                        aria-label="Remove item"
                        onClick={() => removeItem(item.product_id)}
                        className="flex-shrink-0 text-brand-deep/30 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      {/* Qty */}
                      <div className="flex items-center border border-farm-border">
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center text-brand-deep hover:bg-cream-secondary"
                        >
                          <Minus size={11} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-brand-deep">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQty(item.product_id, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center text-brand-deep hover:bg-cream-secondary"
                        >
                          <Plus size={11} />
                        </button>
                      </div>
                      {/* Line price */}
                      {price !== null ? (
                        <span className="text-sm font-semibold text-brand-deep">
                          KES {(price * item.quantity).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gold-warm">Contact for Price</span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-brand-deep/40">{item.unit}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="self-start border border-farm-border bg-cream-warm p-6">
            <h2 className="font-semibold text-brand-deep">Order Summary</h2>
            <div className="mt-4 space-y-2 border-t border-farm-border pt-4">
              <div className="flex justify-between text-sm text-brand-deep/70">
                <span>{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                {totalPrice !== null ? (
                  <span>KES {totalPrice.toLocaleString()}</span>
                ) : (
                  <span className="text-gold-warm text-xs">Quoted on contact</span>
                )}
              </div>
              <div className="flex justify-between text-xs text-brand-deep/40">
                <span>Delivery</span>
                <span>Arranged on contact</span>
              </div>
            </div>
            <div className="mt-4 border-t border-farm-border pt-4 flex justify-between font-semibold text-brand-deep">
              <span>Total</span>
              {totalPrice !== null ? (
                <span>KES {totalPrice.toLocaleString()}</span>
              ) : (
                <span className="text-sm text-gold-warm">On request</span>
              )}
            </div>
            <Link
              href="/checkout"
              className="mt-6 flex items-center justify-center gap-2 w-full bg-brand-deep py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary transition-colors"
            >
              Proceed to Order <ArrowRight size={14} />
            </Link>
            {isSignedIn === false && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-brand-deep/50">
                <LogIn size={11} /> Sign in to complete your order — your cart is saved.
              </p>
            )}
            <Link
              href="/products"
              className="mt-3 block text-center text-xs text-brand-deep/50 hover:text-brand-deep underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
