import Link from 'next/link';
import Image from 'next/image';
import { Beef, Carrot, Wheat, Apple, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Product } from '@/lib/product-types';

const LIVESTOCK_CATS = new Set(['cattle', 'goats', 'sheep', 'pigs', 'poultry']);

const TILES: { key: string; label: string; icon: LucideIcon; href: string; match: (p: Product) => boolean }[] = [
  { key: 'livestock', label: 'Livestock', icon: Beef, href: '/products/livestock', match: (p) => LIVESTOCK_CATS.has(p.category) },
  { key: 'vegetables', label: 'Vegetables', icon: Carrot, href: '/products?category=vegetables', match: (p) => p.category === 'vegetables' },
  { key: 'grains', label: 'Grains', icon: Wheat, href: '/products?category=grains', match: (p) => p.category === 'grains' },
  { key: 'fruits', label: 'Fruits', icon: Apple, href: '/products?category=fruits', match: (p) => p.category === 'fruits' },
];

export function CategoryTiles({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {TILES.map((tile) => {
        const matches = products.filter(tile.match);
        const image = matches[0]?.images[0] || '/images/farm/farm.webp';
        const Icon = tile.icon;
        return (
          <Link
            key={tile.key}
            href={tile.href}
            className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-farm-dark sm:aspect-[16/10]"
          >
            <Image
              src={image}
              alt={`${tile.label} at Nola Ranches`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                <Icon size={18} className="text-brand-deep" />
              </span>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-white">{tile.label}</p>
                  <p className="text-xs text-white/70">{matches.length} Product{matches.length !== 1 ? 's' : ''}</p>
                </div>
                <ArrowRight size={16} className="text-white/70 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
