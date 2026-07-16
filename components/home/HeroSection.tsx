'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const HERO_IMAGES = [
  { src: '/images/hero/landing page farm.jpg', alt: 'Nola Ranches estate — farmlands at golden hour in Laikipia Kenya' },
  { src: '/images/hero/landing page farm 2.jpg', alt: 'Nola Ranches crops and open fields in Laikipia Kenya' },
  { src: '/images/hero/landing page farm 3.jpg', alt: 'Nola Ranches highland terrain and livestock in Laikipia Kenya' },
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
        {/* All images rendered at once — opacity toggled, not mounted/unmounted.
            priority on every image so the browser fetches all 3 on page load,
            making carousel transitions instant after the first load. */}
        {HERO_IMAGES.map((img, i) => (
          <motion.div
            key={img.src}
            animate={{ opacity: i === idx ? 1 : 0 }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
            className="absolute inset-0"
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-farm-dark" />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 mx-auto mt-16 max-w-5xl px-4 text-center">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="mb-4 text-xs font-light uppercase tracking-[0.3em] text-gold-warm md:text-sm"
        >
          Oloitoktok &amp; Laikipia
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="mb-6 font-serif text-5xl leading-tight tracking-widest text-cream-primary md:text-7xl lg:text-8xl"
        >
          NOLA RANCHES
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mx-auto mb-8 max-w-2xl text-base font-light leading-7 text-cream-secondary md:text-lg"
        >
          Boran Bulls &nbsp;|&nbsp; Holstein Cattle &nbsp;|&nbsp; Full Blood Boer Goats &nbsp;|&nbsp; Dorper Sheep
          &nbsp;|&nbsp; Landrace &amp; Large White Pigs.{' '}
          <span className="font-normal text-gold-warm">Quality Livestock, Trusted Genetics.</span>
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="flex flex-col items-center justify-center gap-5 sm:flex-row"
        >
          <Link href="/products" className="group bg-brand-primary px-8 py-4 text-cream-primary transition-all hover:bg-brand-mid">
            <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest">
              View Our Livestock <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
