'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { MotionSection } from '@/components/ui/Motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { crops, livestock } from '@/lib/content';

function ProductCard({ item, dark = false }: { item: typeof crops[number] | typeof livestock[number]; dark?: boolean }) {
  return (
    <AnimatedCard className={`group overflow-hidden border ${dark ? 'border-white/10 bg-white/5' : 'border-farm-border bg-cream-warm'}`}>
      <div className="image-skeleton relative h-72 overflow-hidden">
        <Image src={item.image} alt={item.alt} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="p-7">
        <h3 className={`font-serif text-3xl ${dark ? 'text-cream-primary' : 'text-brand-deep'}`}>{item.name}</h3>
        {'season' in item && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">{item.season}</p>}
        <p className={`mt-4 leading-7 ${dark ? 'text-cream-secondary/75' : 'text-brand-deep/75'}`}>{item.description}</p>
        <Link href="/contact" className="mt-6 inline-flex text-xs font-semibold uppercase tracking-widest text-brand-leaf">
          Interested in buying? Get in touch.
        </Link>
      </div>
    </AnimatedCard>
  );
}

export function CropsGrid() {
  return (
    <MotionSection className="bg-cream-primary py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader title="Field-Grown Farm Products." subtitle="Crops" />
        <div className="grid gap-8 md:grid-cols-2">{crops.map((item) => <ProductCard key={item.name} item={item} />)}</div>
      </div>
    </MotionSection>
  );
}

export function LivestockGrid() {
  return (
    <MotionSection className="bg-brand-deep py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader title="Exotic Livestock Raised at the Source." subtitle="Livestock" dark />
        <div className="grid gap-8 md:grid-cols-2">{livestock.map((item) => <ProductCard key={item.name} item={item} dark />)}</div>
      </div>
    </MotionSection>
  );
}
