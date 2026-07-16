'use client';

import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { MotionSection } from '@/components/ui/Motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { IMAGES } from '@/lib/constants';

const cards = [
  { title: 'Our Story', href: '/about', image: IMAGES.farmRoad, alt: 'Nola Ranches in Kenya', text: 'Two ranches built around quality livestock and trusted genetics — from Oloitoktok to Laikipia.' },
  { title: 'Our Livestock', href: '/products', image: '/images/products/animals/cattle/giroland/giroland cow nola 1.jpeg', alt: 'Girolando cattle at Nola Ranches, Oloitoktok Kenya', text: 'Browse and enquire on our cattle, goats, sheep and pigs — vaccinated, farm-recorded and farm-ready.' },
  { title: 'Ranch Visits', href: '/services', image: IMAGES.landscape, alt: 'Ranch visit to meet the herds at Nola Ranches Kenya', text: 'Come and meet the herds, inspect the animals, and see how they are raised before you buy.' },
];

export function FeaturedSection() {
  return (
    // Capped to one viewport on desktop (lg:h-screen); mobile/tablet keep natural flow, where
    // cramming this into 100vh isn't worth the art direction. lg:!py-12 forcibly overrides
    // section-y's own padding-block (declared after @tailwind utilities in globals.css, which
    // would otherwise win the cascade tie against a plain lg:py-* utility at equal specificity).
    <MotionSection className="bg-brand-deep section-y lg:flex lg:h-screen lg:min-h-[600px] lg:items-center lg:!py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="A Livestock Ranch with Many Doors In."
          subtitle="Explore"
          align="center"
          dark
          className="mb-14 lg:mb-8"
        />
        <div className="grid gap-8 md:grid-cols-3">
          {cards.map((card) => (
            <AnimatedCard key={card.href} className="group overflow-hidden border border-white/10 bg-white/5">
              <Link href={card.href} className="block">
                <div className="image-skeleton relative h-72 overflow-hidden lg:h-48">
                  <Image src={card.image} alt={card.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                </div>
                <div className="p-7 lg:p-5">
                  <h3 className="font-serif text-3xl text-cream-primary lg:text-2xl">{card.title}</h3>
                  <p className="mt-4 leading-7 text-cream-secondary/75 lg:mt-2 lg:text-sm lg:leading-6">{card.text}</p>
                  <span className="mt-6 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-brand-leaf lg:mt-3">
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
