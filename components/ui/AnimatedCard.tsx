'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeUp } from './Motion';

export function AnimatedCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.35 }}
      className={className}
    >
      {children}
    </motion.article>
  );
}
