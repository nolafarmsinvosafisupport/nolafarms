'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '@/lib/constants';

export function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.1]);
  const opacity = useTransform(scrollY, [0, 520], [1, 0]);

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-farm-dark">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <Image
          src={IMAGES.hero}
          alt="Nola Farms 375-acre estate in Laikipia Kenya at golden hour"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-farm-dark" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto mt-16 max-w-5xl px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mb-6 text-sm font-light uppercase tracking-[0.3em] text-gold-warm md:text-base"
        >
          Laikipia, Kenya
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-8 font-serif text-6xl leading-tight text-cream-primary md:text-8xl lg:text-9xl"
        >
          Rooted in <span className="italic text-cream-secondary">Laikipia.</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mb-12 max-w-2xl text-lg font-light leading-8 text-cream-secondary md:text-xl"
        >
          375 acres of crops, livestock, and living land.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <Link href="/products" className="group px-8 py-4 bg-brand-primary text-cream-primary transition-all hover:bg-brand-mid">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
              Explore the Farm <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link href="/services" className="px-8 py-4 border border-cream-primary/30 text-cream-primary transition-all hover:border-cream-primary/60 hover:bg-cream-primary/10">
            <span className="text-xs font-semibold uppercase tracking-widest">Book a Visit</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
