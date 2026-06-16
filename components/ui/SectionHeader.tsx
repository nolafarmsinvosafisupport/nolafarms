'use client';

import { motion } from 'framer-motion';
import { fadeUp } from './Motion';

export function SectionHeader({
  title,
  subtitle,
  align = 'left',
  dark = false,
}: {
  title: string;
  subtitle: string;
  align?: 'left' | 'center';
  dark?: boolean;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      className={`mb-14 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <p
        className={`mb-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf ${
          align === 'center' ? 'justify-center' : 'justify-start'
        }`}
      >
        {align === 'center' && <span className="block h-px w-8 bg-brand-leaf" />}
        {subtitle}
        <span className={`block h-px bg-brand-leaf ${align === 'center' ? 'w-8' : 'w-12'}`} />
      </p>
      <h2 className={`font-serif text-4xl leading-tight md:text-5xl ${dark ? 'text-cream-primary' : 'text-brand-deep'}`}>
        {title}
      </h2>
    </motion.div>
  );
}
