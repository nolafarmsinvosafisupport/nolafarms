'use client';

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const HERO_IMAGES = [
  { src: '/images/hero/landing%20page%20farm.jpg', alt: 'Nola Farms estate — farmlands at golden hour in Laikipia Kenya' },
  { src: '/images/hero/landing%20page%20farm%202.jpg', alt: 'Nola Farms crops and open fields in Laikipia Kenya' },
  { src: '/images/hero/landing%20page%20farm%203.jpg', alt: 'Nola Farms highland terrain and livestock in Laikipia Kenya' },
];

export function HeroSection() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 1000], [0, 200]);
  const scale = useTransform(scrollY, [0, 1000], [1, 1.1]);
  const opacity = useTransform(scrollY, [0, 520], [1, 0]);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-farm-dark">
      <motion.div style={{ y, scale }} className="absolute inset-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={HERO_IMAGES[idx].src}
              alt={HERO_IMAGES[idx].alt}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-farm-dark" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto mt-16 max-w-5xl px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mb-4 text-xs font-light uppercase tracking-[0.3em] text-gold-warm md:text-sm"
        >
          Laikipia, Kenya
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-6 font-serif text-5xl leading-tight tracking-widest text-cream-primary md:text-7xl lg:text-8xl"
        >
          NOLA FARMS
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mb-8 max-w-lg text-base font-light leading-7 text-cream-secondary md:text-lg"
        >
          375 acres of crops, livestock, and living land.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <Link href="/products" className="group bg-brand-primary px-8 py-4 text-cream-primary transition-all hover:bg-brand-mid">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
              Explore the Farm <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
          <Link href="/services" className="border border-cream-primary/30 px-8 py-4 text-cream-primary transition-all hover:border-cream-primary/60 hover:bg-cream-primary/10">
            <span className="text-xs font-semibold uppercase tracking-widest">Book a Visit</span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
