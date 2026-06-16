'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { MotionSection } from '@/components/ui/Motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { IMAGES } from '@/lib/constants';

const cards = [
  { title: 'Our Story', href: '/about', image: IMAGES.farmRoad, alt: 'Farm road crossing Nola Farms in Laikipia Kenya', text: 'A large-scale estate built around responsible agriculture and long-term land stewardship.' },
  { title: 'Products & Livestock', href: '/products', image: IMAGES.cattle, alt: 'Exotic cattle grazing at Nola Farms in Laikipia Kenya', text: 'Source wheat, seasonal produce, cattle, and goats directly from the farm.' },
  { title: 'Ranch Visits', href: '/services', image: IMAGES.landscape, alt: 'Laikipia landscape viewed during a Nola Farms ranch visit', text: 'Walk the fields, meet the herds, and experience working agriculture up close.' },
];

export function FeaturedSection() {
  return (
    <MotionSection className="bg-brand-deep py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader title="A Working Estate with Many Doors In." subtitle="Explore" align="center" dark />
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card) => (
            <AnimatedCard key={card.href} className="group overflow-hidden border border-white/10 bg-white/5">
              <Link href={card.href} className="block">
                <div className="image-skeleton relative h-72 overflow-hidden">
                  <Image src={card.image} alt={card.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-7">
                  <h3 className="font-serif text-3xl text-cream-primary">{card.title}</h3>
                  <p className="mt-4 leading-7 text-cream-secondary/75">{card.text}</p>
                  <span className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-leaf">
                    Open <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            </AnimatedCard>
          ))}
        </div>
      </div>
    </MotionSection>
  );
}
