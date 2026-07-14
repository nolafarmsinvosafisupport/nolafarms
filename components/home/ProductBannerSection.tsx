'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/constants';

// Real product photos, crossfaded as a slow ambient carousel — no dots/arrows by design.
const CAROUSEL_IMAGES = [
  '/images/products/animals/cattle/giroland/giroland cow nola 1.jpeg',
  '/images/products/animals/cattle/giroland/giroland cow nola 2.jpeg',
  '/images/products/animals/cattle/giroland/giroland cow nola 3.jpeg',
];

const SLIDE_INTERVAL_MS = 5000;

// The one product this section exists to sell — keep in sync with the girolando-cattle
// slug seeded in lib/db-migrate.ts if that product is ever renamed.
const PRODUCT_SLUG = 'girolando-cattle';

function CarouselSlides({ active, sizes }: { active: number; sizes: string }) {
  return (
    <>
      {CAROUSEL_IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt="Girolando cattle at Nola Ranches"
          fill
          sizes={sizes}
          priority={i === 0}
          className={`object-cover transition-opacity duration-[1800ms] ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
    </>
  );
}

export function ProductBannerSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((i) => (i + 1) % CAROUSEL_IMAGES.length);
    }, SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    "Hello, I'm interested in the Girolando cattle at Nola Ranches. Please provide more details.",
  )}`;

  return (
    // Desktop/tablet (sm+): photo panel is absolutely positioned (no padding, inset-y-0) so it
    // fills the section edge-to-edge top-to-bottom, pinned to the far right; a short gradient
    // only softens the seam right at its left edge instead of eating a big chunk of the photo.
    // Mobile: that absolute panel is hidden — instead a full-bleed (edge-to-edge, no side
    // padding) carousel band sits in normal flow between the title and the first paragraph.
    // Both bands share one timer/active-index so they stay in sync.
    <section className="relative w-full overflow-hidden bg-brand-deep">
      <div className="absolute inset-y-0 right-0 hidden w-[50%] sm:block lg:w-[54%]">
        <CarouselSlides active={active} sizes="(min-width: 1024px) 54vw, 50vw" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-deep from-0% via-brand-deep/35 via-[14%] to-transparent to-[42%]" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16 lg:px-16 lg:py-20">
        <div className="sm:max-w-[56%] lg:max-w-lg">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-warm sm:text-xs sm:tracking-[0.25em]">
            Featured Breed
          </p>
          <h2 className="mt-1.5 font-serif text-xl leading-tight text-cream-primary sm:mt-2 sm:text-2xl lg:text-3xl">
            Girolando Cattle
          </h2>

          <div className="relative -mx-4 mt-3 aspect-[16/10] w-auto overflow-hidden sm:hidden">
            <CarouselSlides active={active} sizes="100vw" />
          </div>

          <p className="mt-3 text-xs leading-5 text-cream-secondary/85 sm:mt-4 sm:text-base sm:leading-7">
            Girolando cattle are renowned for their high milk yields and excellent heat tolerance. They thrive in
            Oloitoktok and Kajiado conditions, making them an ideal choice for local dairy and breeding operations.
          </p>
          <p className="mt-2 text-xs leading-5 text-cream-secondary/85 sm:mt-4 sm:text-base sm:leading-7">
            At Nola Ranches, we offer healthy, vaccinated Girolando bulls and dairy cows. All our stock is
            dewormed, vet-checked, and ready for breeding or milk production.
          </p>
          <p className="mt-2 text-xs leading-5 text-cream-secondary/85 sm:mt-4 sm:text-base sm:leading-7">
            Don&apos;t see the bull you want? No problem — if you have a specific bull in mind, we can source it
            for you.
          </p>
          <div className="mt-3 flex flex-row flex-nowrap gap-1.5 sm:mt-6 sm:gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md bg-brand-leaf px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-cream-primary hover:text-brand-deep sm:gap-2 sm:rounded-lg sm:px-5 sm:py-3 sm:text-xs sm:tracking-widest"
            >
              <MessageCircle size={12} className="flex-shrink-0 sm:hidden" />
              <MessageCircle size={16} className="hidden flex-shrink-0 sm:block" />
              WhatsApp
            </a>
            <Link
              href={`/products/${PRODUCT_SLUG}`}
              className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-cream-primary/40 px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-cream-primary transition-colors hover:bg-cream-primary/10 sm:gap-2 sm:rounded-lg sm:px-5 sm:py-3 sm:text-xs sm:tracking-widest"
            >
              <span className="sm:hidden">View</span>
              <span className="hidden sm:inline">View Product</span>
              <ArrowRight size={12} className="flex-shrink-0 sm:hidden" />
              <ArrowRight size={16} className="hidden flex-shrink-0 sm:block" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
