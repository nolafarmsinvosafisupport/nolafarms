'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

export function DustParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        size: ((i * 17) % 30) / 10 + 1,
        left: (i * 37) % 100,
        top: (i * 53) % 100,
        driftA: ((i * 19) % 50) - 25,
        driftB: ((i * 29) % 50) - 25,
        duration: ((i * 11) % 10) + 10,
        delay: (i * 7) % 10,
      })),
    [],
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-40 mix-blend-screen">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-brand-leaf/20"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            y: [0, -100, -200],
            x: [0, particle.driftA, particle.driftB],
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  );
}
