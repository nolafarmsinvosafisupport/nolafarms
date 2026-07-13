'use client';

import { X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { MotionSection } from '@/components/ui/Motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { galleryImages } from '@/lib/content';

export function GalleryGrid() {
  const [active, setActive] = useState<(typeof galleryImages)[number] | null>(null);

  return (
    <MotionSection className="bg-brand-deep section-y">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader title="Fields, Herds, and Highland Light." subtitle="Gallery" align="center" dark />
        <div className="grid auto-rows-[280px] gap-5 md:grid-cols-3">
          {galleryImages.map((image, index) => (
            <button
              key={image.alt}
              type="button"
              onClick={() => setActive(image)}
              className={`image-skeleton group relative overflow-hidden text-left ${index === 0 || index === 5 ? 'md:col-span-2' : ''}`}
            >
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-5 text-sm text-cream-primary">{image.caption}</span>
            </button>
          ))}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-5" role="dialog" aria-modal="true">
          <button type="button" aria-label="Close gallery image" onClick={() => setActive(null)} className="absolute right-5 top-5 text-cream-primary">
            <X aria-hidden="true" />
          </button>
          <figure className="w-full max-w-5xl">
            <div className="relative aspect-[16/10] w-full">
              <Image src={active.src} alt={active.alt} fill sizes="100vw" className="object-contain" />
            </div>
            <figcaption className="mt-4 text-center text-cream-secondary">{active.caption}</figcaption>
          </figure>
        </div>
      )}
    </MotionSection>
  );
}
