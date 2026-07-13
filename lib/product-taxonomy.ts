import type { Product, ProductCategory } from './product-types';

/**
 * The single source of truth for product filtering.
 *
 * The category cards, the sidebar checkboxes and the grid all read their labels, counts and
 * match rules from here. That is deliberate: previously the cards linked to pages while the
 * sidebar filtered client-side, so the two could disagree about what "Livestock" meant. There
 * is now exactly one definition, and any UI that filters products must use these helpers.
 *
 * Card images are R2 URLs held in code, not in the database. product_categories.hero_image is
 * intentionally NOT used for this.
 */

const R2 = 'https://images.nolaranches.co.ke/products';

export type MainKey = 'livestock' | 'vegetables' | 'grains' | 'fruits' | 'services';
export type SubKey = 'cattle' | 'goats-sheep' | 'pigs';

export type MainCategory = {
  key: MainKey;
  label: string;
  blurb: string;
  image: string;
  subs: SubKey[];
};

export type SubCategory = {
  key: SubKey;
  label: string;
  image: string;
  values: ProductCategory[];
};

// Order matters — this is the order the cards render in.
export const MAIN_CATEGORIES: MainCategory[] = [
  {
    key: 'livestock',
    label: 'Livestock',
    blurb: 'Cattle, goats, sheep & pigs',
    image: `${R2}/animals/cattle/brahman/cow2.jpeg`,
    subs: ['cattle', 'goats-sheep', 'pigs'],
  },
  {
    key: 'vegetables',
    label: 'Vegetables',
    blurb: 'Fresh from the field',
    image: `${R2}/vegetables/swiss-spinach/broad-leaf-swiss-spinach-1.jpg`,
    subs: [],
  },
  {
    key: 'grains',
    label: 'Grains',
    blurb: 'Wheat, sorghum, millet & soya',
    image: `${R2}/grains/wheat/wheat.webp`,
    subs: [],
  },
  {
    key: 'fruits',
    label: 'Fruits',
    blurb: 'Seasonal and sweet',
    image: `${R2}/fruits/watermelon/watermelon1.jpeg`,
    subs: [],
  },
  {
    key: 'services',
    label: 'Services',
    blurb: 'Breeding & boar services',
    image: `${R2}/animals/pigs/american-yorkshire-pigs/pigs2.jpeg`,
    subs: [],
  },
];

export const SUB_CATEGORIES: SubCategory[] = [
  { key: 'cattle', label: 'Cattle', image: `${R2}/animals/cattle/brahman/cow4.jpeg`, values: ['cattle'] },
  { key: 'goats-sheep', label: 'Goats & Sheep', image: `${R2}/animals/goat/boer/boer-main-1.jpeg`, values: ['goats', 'sheep'] },
  { key: 'pigs', label: 'Pigs', image: `${R2}/animals/pigs/american-yorkshire-pigs/pigs.jpeg`, values: ['pigs'] },
];

const LIVESTOCK_VALUES = new Set<ProductCategory>(['cattle', 'goats', 'sheep', 'pigs', 'poultry']);

/**
 * A service (e.g. Service Boars) is a thing you book, not an animal you buy, so it is kept out of
 * every browsing view except Services — including "All". Otherwise a "per service" hire item sits
 * in the grid next to animals with an Add to Cart button.
 */
export function isService(p: Product) {
  return p.is_service === true;
}

export function matchesMain(p: Product, key: MainKey): boolean {
  if (key === 'services') return isService(p);
  if (isService(p)) return false;
  if (key === 'livestock') return LIVESTOCK_VALUES.has(p.category);
  return p.category === key;
}

export function matchesSub(p: Product, key: SubKey): boolean {
  if (isService(p)) return false;
  const sub = SUB_CATEGORIES.find((s) => s.key === key);
  return sub ? sub.values.includes(p.category) : false;
}

/** Products shown when no main category is selected ("All") — everything except services. */
export function browsableProducts(products: Product[]): Product[] {
  return products.filter((p) => !isService(p));
}

export function countMain(products: Product[], key: MainKey): number {
  return products.filter((p) => matchesMain(p, key)).length;
}

export function countSub(products: Product[], key: SubKey): number {
  return products.filter((p) => matchesSub(p, key)).length;
}

/**
 * Default ordering: cattle first, then goats & sheep, then pigs, then everything else.
 * Livestock is the headline offering, so it leads the first page rather than being scattered
 * through whatever happens to be newest.
 */
const FEATURED_RANK: Record<ProductCategory, number> = {
  cattle: 0,
  goats: 1,
  sheep: 1,
  pigs: 2,
  poultry: 3,
  vegetables: 4,
  grains: 4,
  fruits: 4,
};

export function featuredRank(p: Product): number {
  return FEATURED_RANK[p.category] ?? 9;
}
