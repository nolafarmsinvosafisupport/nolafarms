'use client';

import { Leaf } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MotionSection, fadeUp } from '@/components/ui/Motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { IMAGES } from '@/lib/constants';
import { motion } from 'framer-motion';

export function OurStorySection() {
  return (
    <MotionSection className="bg-cream-primary py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeader title="Built on 375 Acres of Laikipia Highland." subtitle="Our Story" />
          <motion.p variants={fadeUp} className="mb-6 text-lg leading-8 text-brand-deep/80">
            {/* TODO: Replace with client-provided farm description */}
            Nola Farms was built with a practical vision: operate at meaningful scale, care for the land, and connect buyers and visitors to the source of their food and livestock.
          </motion.p>
          <motion.p variants={fadeUp} className="mb-8 text-lg leading-8 text-brand-deep/80">
            From wheat fields to cattle and goats, the estate brings together mixed farming, disciplined breeding, and the everyday work of agriculture in Laikipia County.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-4">
            <Link href="/products" className="bg-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary">
              View Products
            </Link>
            <Link href="/services" className="border border-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-brand-deep hover:text-cream-primary">
              Plan a Visit
            </Link>
          </motion.div>
        </div>
        <motion.div variants={fadeUp} className="relative min-h-[560px]">
          <div className="image-skeleton absolute inset-0 overflow-hidden">
            <Image src={IMAGES.wheat} alt="Wheat fields growing at Nola Farms in Laikipia Kenya" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-8 left-5 max-w-xs border border-farm-border bg-cream-warm p-7 shadow-2xl md:-left-8">
            <Leaf className="mb-4 text-brand-leaf" size={30} aria-hidden="true" />
            <h3 className="font-serif text-2xl text-brand-deep">Rooted in Responsibility</h3>
            <p className="mt-3 text-sm leading-6 text-brand-deep/70">A farm measured by productive fields, healthy animals, and trust built over time.</p>
          </div>
        </motion.div>
      </div>
    </MotionSection>
  );
}
