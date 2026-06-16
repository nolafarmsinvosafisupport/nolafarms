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
    <section className="relative flex min-h-[72vh] items-center overflow-hidden bg-farm-dark pt-28">
      <div className="absolute inset-0">
        <Image src={image} alt={alt} fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-farm-dark/55 to-farm-dark" />
      </div>
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">{eyebrow}</p>
        <h1 className="max-w-5xl font-serif text-5xl leading-tight text-cream-primary md:text-6xl">{title}</h1>
        <p className="mt-7 max-w-2xl text-lg leading-8 text-cream-secondary/85">{subtitle}</p>
      </div>
    </section>
  );
}
