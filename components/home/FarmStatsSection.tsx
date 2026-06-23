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
    <MotionSection className="bg-cream-primary py-28">
      <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3 lg:px-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <AnimatedCard key={stat.label} className="border border-farm-border bg-cream-warm p-8">
              <Icon className="mb-8 text-brand-leaf" size={30} aria-hidden="true" />
              <h2 className="font-serif text-5xl text-brand-deep">{stat.value}</h2>
              <h3 className="mt-3 text-sm font-semibold uppercase tracking-[0.2em] text-brand-leaf">{stat.label}</h3>
              <p className="mt-5 leading-7 text-brand-deep/75">{stat.text}</p>
            </AnimatedCard>
          );
        })}
      </div>
    </MotionSection>
  );
}
