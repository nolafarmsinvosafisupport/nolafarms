import Link from 'next/link';
import Image from 'next/image';
import { Beef, Carrot, Wheat, Apple, ArrowRight, Clock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Product } from '@/lib/product-types';
import type { ProductCategoryPage } from '@/lib/category-types';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  livestock: Beef,
  vegetables: Carrot,
  grains: Wheat,
  fruits: Apple,
};

// Livestock has its own tabbed landing page; everything else links straight into the
// main grid pre-filtered to that category until it has subcategory-worthy content too.
function hrefFor(slug: string) {
  return slug === 'livestock' ? '/products/livestock' : `/products?category=${slug}`;
}

export function CategoryTiles({ products, categories }: { products: Product[]; categories: ProductCategoryPage[] }) {
  const visible = categories.filter((c) => c.active).sort((a, b) => a.sort_order - b.sort_order);
  if (visible.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {visible.map((category) => {
        const matches = products.filter((p) => category.category_values.includes(p.category));
        const image = category.hero_image || matches[0]?.images[0] || '/images/farm/farm.webp';
        const Icon = CATEGORY_ICONS[category.slug] ?? Beef;

        const content = (
          <>
            <Image
              src={image}
              alt={`${category.name} at Nola Ranches`}
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className={`object-cover transition-transform duration-500 ${category.coming_soon ? 'grayscale' : 'group-hover:scale-105'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
                <Icon size={18} className="text-brand-deep" />
              </span>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-white">{category.name}</p>
                  {category.coming_soon ? (
                    <p className="flex items-center gap-1 text-xs font-medium text-gold-warm">
                      <Clock size={11} /> Coming Soon
                    </p>
                  ) : (
                    <p className="text-xs text-white/70">{matches.length} Product{matches.length !== 1 ? 's' : ''}</p>
                  )}
                </div>
                {!category.coming_soon && (
                  <ArrowRight size={16} className="text-white/70 transition-transform group-hover:translate-x-1" />
                )}
              </div>
            </div>
          </>
        );

        if (category.coming_soon) {
          return (
            <div
              key={category.slug}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-farm-dark sm:aspect-[16/10]"
            >
              {content}
            </div>
          );
        }

        return (
          <Link
            key={category.slug}
            href={hrefFor(category.slug)}
            className="group relative block aspect-[4/3] overflow-hidden rounded-xl bg-farm-dark sm:aspect-[16/10]"
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
