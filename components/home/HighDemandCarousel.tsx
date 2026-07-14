'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, MessageCircle, ShoppingBag, ShieldCheck, Check } from 'lucide-react';
import { whatsappHref } from '@/lib/whatsapp';
import type { Product } from '@/lib/product-types';

const SLIDE_MS = 7000;

/**
 * One breed at a time: big photograph on the left, the full pitch on the right.
 *
 * Everything shown comes from the product row — name, badge, tags, description, details, image —
 * so an admin changes what appears here from /admin/products, not from code.
 *
 * Autoplay is slow (7s) and gives way to the visitor immediately: it stops on hover and stops for
 * good the moment anyone clicks an arrow or a dot. Content that slides away while you are reading
 * it is worse than content that never moved.
 */
export function HighDemandCarousel({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const stopped = useRef(false);

  const go = useCallback(
    (next: number) => {
      // Any deliberate interaction ends autoplay for the rest of the visit.
      stopped.current = true;
      setActive((next + products.length) % products.length);
    },
    [products.length],
  );

  useEffect(() => {
    if (products.length < 2) return;
    // Someone who has asked their OS for less motion gets a static first slide.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    const id = setInterval(() => {
      if (paused || stopped.current) return;
      setActive((i) => (i + 1) % products.length);
    }, SLIDE_MS);
    return () => clearInterval(id);
  }, [products.length, paused]);

  const product = products[active];
  if (!product) return null;

  const enquireHref = whatsappHref(
    `Hello, I'm interested in the ${product.name} at Nola Ranches. Please provide more details.`,
  );

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Arrows. Outside the panel on wide screens, tucked over the photo on narrow ones. */}
      {products.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(active - 1)}
            aria-label="Previous breed"
            className="absolute left-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cream-primary/25 bg-farm-dark/70 text-cream-primary backdrop-blur-sm transition-colors hover:bg-cream-primary hover:text-brand-deep xl:-left-14 xl:h-11 xl:w-11"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => go(active + 1)}
            aria-label="Next breed"
            className="absolute right-2 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-cream-primary/25 bg-farm-dark/70 text-cream-primary backdrop-blur-sm transition-colors hover:bg-cream-primary hover:text-brand-deep xl:-right-14 xl:h-11 xl:w-11"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      <div className="overflow-hidden rounded-2xl border border-cream-primary/10 bg-brand-deep/40">
        <div className="grid md:grid-cols-2">
          {/* Photo */}
          <div className="home-carousel-media relative w-full overflow-hidden bg-farm-dark">
            {/* All slides stay mounted and crossfade — a swap would flash. */}
            {products.map((p, i) => (
              <Image
                key={p.id}
                src={p.images[0] ?? '/images/farm/farm.webp'}
                alt={p.name}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                priority={i === 0}
                className={`object-cover object-[center_30%] transition-opacity duration-1000 ease-in-out ${
                  i === active ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}

            {product.badge && (
              <span className="absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-brand-leaf px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                <Check size={12} />
                {product.badge}
              </span>
            )}

            <span className="absolute bottom-4 left-4 z-10 flex max-w-[80%] items-center gap-2.5 rounded-lg bg-farm-dark/85 px-3 py-2 text-cream-primary backdrop-blur-sm">
              <ShieldCheck size={16} className="flex-shrink-0 text-gold-warm" />
              <span className="text-[11px] leading-4">
                All animals are vet-checked, vaccinated and dewormed.
              </span>
            </span>
          </div>

          {/* The pitch */}
          <div className="home-carousel-body flex flex-col justify-center px-5 sm:px-8">
            <h3 className="font-serif text-2xl leading-tight text-cream-primary sm:text-3xl lg:text-4xl">
              {product.name}
            </h3>

            {/* The gold line is the product's own tags — no separate "tagline" field to keep in sync. */}
            {product.tags.length > 0 && (
              <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-gold-warm">
                {product.tags.join(' · ')}
              </p>
            )}

            <span className="mt-3 block h-px w-12 bg-gold-warm/50" />

            {product.description && (
              <p className="mt-4 text-sm leading-6 text-cream-secondary/85">{product.description}</p>
            )}

            {/* Prose, not an icon row — the client asked for more of the product's story here. These
                are the product's own `details` bullets. */}
            {product.details.length > 0 && (
              <ul className="mt-3 space-y-1.5">
                {product.details.slice(0, 4).map((d) => (
                  <li key={d} className="flex items-start gap-2 text-xs leading-5 text-cream-secondary/70">
                    <Check size={13} className="mt-0.5 flex-shrink-0 text-brand-leaf" />
                    {d}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-5 flex flex-col gap-4 border-t border-cream-primary/10 pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-cream-secondary/45">Price</p>
                <p className="mt-0.5 font-serif text-xl font-semibold text-gold-warm">Contact for Price</p>
                <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-cream-secondary/60">
                  <Check size={12} className="flex-shrink-0 text-brand-leaf" />
                  Nationwide Delivery Available
                </p>
              </div>

              <div className="flex flex-shrink-0 flex-col gap-2 sm:w-44">
                <a
                  href={enquireHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 rounded-lg bg-gold-warm px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-brand-deep transition-colors hover:bg-gold-light"
                >
                  Enquire Now
                  <MessageCircle size={14} />
                </a>
                <Link
                  href={`/products/${product.slug}`}
                  className="flex items-center justify-center gap-2 rounded-lg border border-cream-primary/25 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-cream-primary transition-colors hover:bg-cream-primary/10"
                >
                  <ShoppingBag size={14} />
                  View Product
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dots */}
      {products.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {products.map((p, i) => (
            <button
              key={p.id}
              type="button"
              onClick={() => go(i)}
              aria-label={`Show ${p.name}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all duration-500 ${
                i === active ? 'w-6 bg-gold-warm' : 'w-2 bg-cream-primary/25 hover:bg-cream-primary/50'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
