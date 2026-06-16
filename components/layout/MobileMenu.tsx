'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { NAV_LINKS } from '@/lib/constants';

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="fixed inset-0 z-30 flex flex-col gap-7 bg-farm-dark px-6 pt-28 md:hidden"
        >
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} onClick={onClose} className="text-center font-serif text-3xl text-cream-primary">
              {link.label}
            </Link>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
