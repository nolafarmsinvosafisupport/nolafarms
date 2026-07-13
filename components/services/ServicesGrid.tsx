'use client';

import Link from 'next/link';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { MotionSection } from '@/components/ui/Motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { services } from '@/lib/content';

export function ServicesGrid() {
  return (
    <MotionSection className="bg-cream-primary section-y">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader title="Services for Visitors, Buyers, and Partners." subtitle="Farm Services" />
        <div className="grid gap-8 md:grid-cols-3">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <AnimatedCard key={service.name} className="border border-farm-border bg-cream-warm p-8">
                <Icon className="mb-8 text-brand-leaf" size={32} aria-hidden="true" />
                <h3 className="font-serif text-3xl text-brand-deep">{service.name}</h3>
                <p className="mt-4 leading-7 text-brand-deep/75">{service.description}</p>
                <Link href="/contact" className="mt-7 inline-flex text-xs font-semibold uppercase tracking-widest text-brand-leaf">
                  Make an Enquiry
                </Link>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </MotionSection>
  );
}
