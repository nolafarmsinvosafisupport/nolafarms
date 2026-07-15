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
    <MotionSection className="bg-cream-primary section-y">
      <div className="mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeader title="Quality Livestock, Trusted Genetics." subtitle="Our Story" />
          <motion.p variants={fadeUp} className="mb-6 text-lg leading-8 text-brand-deep/80">
            Nola Ranches operates across two ranches in Kenya — Oloitoktok and Laikipia — built with a practical vision: raise healthy livestock with trusted genetics, care for the land, and connect buyers directly to the source of their animals.
          </motion.p>
          <motion.p variants={fadeUp} className="mb-8 text-lg leading-8 text-brand-deep/80">
            Our Oloitoktok ranch raises Boran, Girolando and Holstein cattle, Boer and Galla goats, Dorper sheep, and Large White, Landrace, Duroc and Pietrain pigs — all vaccinated, dewormed and farm-recorded. In Laikipia, we also farm wheat, sorghum, millet and soya beans at scale across expansive highland fields.
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
        {/* Fluid floor rather than a hard cap: the image column stacks under the text on
            narrow screens, where a fixed height was two-thirds of a phone viewport on its own.
            Sized up from the original clamp so the image reads larger against the smaller
            overlay card below. */}
        <motion.div variants={fadeUp} className="relative min-h-[clamp(22rem,48vh,38rem)]">
          <div className="image-skeleton absolute inset-0 overflow-hidden">
            <Image src={IMAGES.cattle} alt="Cattle raised at Nola Ranches in Kenya" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
          </div>
          {/* Shrunk ~40% from the original max-w-xs/p-7 footprint so it no longer swallows most
              of the image it overlaps. */}
          <div className="absolute -bottom-4 left-3 max-w-[12rem] border border-farm-border bg-cream-warm p-4 shadow-2xl md:-left-4">
            <Leaf className="mb-2 text-brand-leaf" size={18} aria-hidden="true" />
            <h3 className="font-serif text-lg text-brand-deep">Rooted in Responsibility</h3>
            <p className="mt-3 text-xs leading-5 text-brand-deep/70">A ranch measured by healthy animals, trusted genetics, and trust built over time.</p>
          </div>
        </motion.div>
      </div>
    </MotionSection>
  );
}
