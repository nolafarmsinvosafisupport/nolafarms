'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

/**
 * Products hero slideshow.
 *
 * Deliberately slow: 7 seconds a slide with a 2.5-second crossfade, plus a very gentle continuous
 * zoom. Fast transitions read as "promo banner"; a long dwell and a soft dissolve read as
 * considered and calm, which is the point — the page is selling breeding stock on trust.
 *
 * The images are wide (~2.5:1) but the band is much wider than it is tall (up to 8.8:1 on an
 * ultrawide), so they are cropped hard top and bottom. The animals sit centre-frame, which is
 * where object-cover keeps them.
 */
const SLIDES = [
  { src: '/images/hero/hero-cattle.webp', alt: 'Brahman cattle at the Nola Ranches herd in Oloitoktok, Kenya' },
  { src: '/images/hero/hero-goat.webp', alt: 'Boer goats grazing at Nola Ranches, Kenya' },
  { src: '/images/hero/hero-pigs.webp', alt: 'Yorkshire pigs at the Nola Ranches piggery, Kenya' },
];

const SLIDE_MS = 7000;

export function ProductsHero({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % SLIDES.length), SLIDE_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="relative isolate overflow-hidden bg-farm-dark px-6 py-16 lg:px-[10%]">
      {SLIDES.map((slide, i) => (
        <div
          key={slide.src}
          aria-hidden={i !== active}
          className={`absolute inset-0 -z-10 transition-opacity duration-[2500ms] ease-in-out ${
            i === active ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            // Only the first slide blocks render; the rest load quietly behind it.
            priority={i === 0}
            sizes="100vw"
            className="hero-drift object-cover"
          />
        </div>
      ))}

      {/* Two washes, not one. The horizontal one keeps the headline legible over whatever is
          behind it (cream text on a bright photo is otherwise unreadable — the same contrast
          trap that made the page eyebrows invisible elsewhere on this site). The vertical one
          settles the image into the cream section below it. */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-farm-dark via-farm-dark/85 to-farm-dark/35" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-farm-dark/60 via-transparent to-farm-dark/30" />

      <div className="mx-auto w-full max-w-[1600px]">
        {children}

        {/* Slide markers — thin, quiet, and clickable. They tell the eye the image is meant to
            change rather than leaving the viewer wondering if something glitched. */}
        <div className="mt-8 flex gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
              aria-current={i === active}
              className={`h-[3px] rounded-full transition-all duration-700 ${
                i === active ? 'w-10 bg-gold-warm' : 'w-5 bg-cream-primary/30 hover:bg-cream-primary/60'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
