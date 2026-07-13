import { ShoppingBasket, MapPin, LayoutGrid, Leaf } from 'lucide-react';
import type { Product } from '@/lib/product-types';

const LIVESTOCK_CATS = new Set(['cattle', 'goats', 'sheep', 'pigs', 'poultry']);

export function ProductStatsBar({ products }: { products: Product[] }) {
  const hasLivestock = products.some((p) => LIVESTOCK_CATS.has(p.category));
  const hasVegetables = products.some((p) => p.category === 'vegetables');
  const hasGrains = products.some((p) => p.category === 'grains');
  const hasFruits = products.some((p) => p.category === 'fruits');
  const populatedCategories = [hasLivestock, hasVegetables, hasGrains, hasFruits].filter(Boolean).length;

  const stats = [
    { icon: ShoppingBasket, value: `${products.length}+`, label: 'Products' },
    { icon: MapPin, value: '2', label: 'Ranches' },
    { icon: LayoutGrid, value: String(populatedCategories), label: 'Categories' },
    { icon: Leaf, value: '100%', label: 'Farm Fresh' },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 rounded-xl border border-farm-border bg-cream-warm px-6 py-5 sm:grid-cols-4">
      {stats.map(({ icon: Icon, value, label }) => (
        <div key={label} className="flex items-center gap-3">
          <Icon size={20} className="flex-shrink-0 text-brand-leaf" />
          <div>
            <p className="font-serif text-xl text-brand-deep">{value}</p>
            <p className="text-xs text-brand-deep/50">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
