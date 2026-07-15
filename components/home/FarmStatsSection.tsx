'use client';

import { MapPin, ShieldCheck, PawPrint } from 'lucide-react';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { MotionSection } from '@/components/ui/Motion';

const stats = [
  { value: '12+', label: 'Breeds Raised', icon: PawPrint, text: 'Cattle, goats, sheep and pigs — selected for genetics, growth and market performance.' },
  { value: '100%', label: 'Vaccinated & Vet-Checked', icon: ShieldCheck, text: 'Every animal is vaccinated, dewormed and farm-recorded before it leaves the ranch.' },
  { value: '2', label: 'Ranches · Oloitoktok & Laikipia', icon: MapPin, text: 'Livestock raised at our Oloitoktok ranch, with grain farming at scale in Laikipia.' },
];

export function FarmStatsSection() {
  return (
    // Matches the vertical rhythm of the stat block on the About page directly below "Our
    // Story" (section-y-sm, no fixed/vh height, natural card sizing at every breakpoint).
    <MotionSection className="bg-cream-primary section-y-sm">
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
