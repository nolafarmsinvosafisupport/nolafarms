import Image from 'next/image';
import type { ReactNode } from 'react';
import { IMAGES } from '@/lib/constants';

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image = IMAGES.landscape,
  alt,
}: {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  image?: string;
  alt: string;
}) {
  return (
    <section className="page-hero relative flex items-center overflow-hidden bg-farm-dark">
      <div className="absolute inset-0">
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-farm-dark/55 to-farm-dark" />
      </div>
      <div className="page-hero-body relative z-10 mx-auto w-full max-w-7xl px-6 lg:px-8">
        {/* gold-warm, not brand-leaf: the leaf green is a dark olive (#486018) that scores 1.5:1
            against the hero photo — illegible. gold-warm scores 4.84:1 and is what the home hero
            already uses for exactly this. brand-leaf stays correct on cream sections. */}
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gold-warm sm:mb-6">{eyebrow}</p>
        {/* Steps down on narrow screens: at text-5xl a title like "Come See the Farm for
            Yourself." wrapped to three lines on a 390px phone, which alone added ~170px. */}
        <h1 className="max-w-5xl font-serif text-4xl leading-tight text-cream-primary sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-cream-secondary/85 sm:mt-6 sm:text-lg sm:leading-8">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
