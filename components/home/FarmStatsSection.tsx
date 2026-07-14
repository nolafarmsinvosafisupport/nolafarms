'use client';

import { MapPin, Sprout, Wheat } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { MotionSection } from '@/components/ui/Motion';

const stats = [
  { value: '375', label: 'Acres', icon: Wheat, text: 'A working agricultural estate spanning two ranches across Kenya.' },
  { value: 'Mixed', label: 'Crop & Livestock', icon: Sprout, text: 'Cattle, goats, sheep, pigs, vegetables, fruits, and grains.' },
  { value: '2', label: 'Ranches · Oloitoktok & Laikipia', icon: MapPin, text: "Oloitoktok for livestock and produce. Laikipia for large-scale grain farming." },
];

export function FarmStatsSection() {
  return (
    // Paired with ProductBannerSection above it: together they fill one more full screen below
    // the hero (lg:h-[50vh] each, matching min-height). Below lg, both sections just flow at
    // natural height instead — cramming this 3-card grid into half a phone screen isn't worth
    // matching the desktop art direction there. lg:!py-6 forcibly overrides section-y's own
    // padding-block, which is declared after @tailwind utilities in globals.css and would
    // otherwise win the cascade tie against a plain lg:py-* utility at equal specificity.
    <MotionSection className="bg-cream-primary section-y lg:!py-6 lg:flex lg:h-[50vh] lg:min-h-[420px] lg:items-center">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3 lg:px-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard key={stat.label} className="border border-farm-border bg-cream-warm p-8 lg:p-6">
              <Icon className="mb-8 text-brand-leaf lg:mb-3" size={30} aria-hidden="true" />
              <h2 className="font-serif text-5xl text-brand-deep lg:text-4xl">{stat.value}</h2>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-leaf lg:mt-2">{stat.label}</h3>
              <p className="mt-5 leading-7 text-brand-deep/75 lg:mt-3 lg:text-sm lg:leading-6">{stat.text}</p>
            </AnimatedCard>
          );
        })}
      </div>
    </MotionSection>
  );
}
