import type { Product, ProductCategory } from './product-types';

/**
 * The single source of truth for product filtering.
 *
 * The shop is livestock-only. The four cards below are the whole filter UI — there is no sidebar
 * and no ranch filter. Any code that filters products must use these helpers so the cards, the
 * counts and the grid can never disagree.
 *
 * The crops (vegetables / grains / fruits) are NOT hidden here. They are hidden by toggling those
 * categories inactive in product_categories, which app/products/page.tsx already honours via
 * filterVisibleProducts. That keeps the decision reversible from /admin/categories with one
 * switch, instead of needing a code change to sell a cabbage again.
 */

// Card artwork lives in /public — these are purpose-shot 4:3 images for the cards, not product
// photos. An admin can still override any of them from /admin/categories (which uploads to R2 and
// writes product_categories.hero_image); these are what shows when no override is set.
const CARDS = '/images/product-cards';

export type CardKey = 'cattle' | 'goats-sheep' | 'pigs' | 'services';

export type CategoryCard = {
  key: CardKey;
  label: string;
  /** lucide icon name, resolved in the component (this file stays free of React imports) */
  icon: 'cow' | 'goat' | 'piggybank' | 'dna';
  image: string;
  /** product.category values this card covers; empty for the services card, which matches on is_service */
  values: ProductCategory[];
};

// Order matters — cards render in this order, and it is also the default product ordering.
export const CATEGORY_CARDS: CategoryCard[] = [
  {
    key: 'cattle',
    label: 'Cattle',
    icon: 'cow',
    image: `${CARDS}/cattle.webp`,
    values: ['cattle'],
  },
  {
    key: 'goats-sheep',
    label: 'Goats & Sheep',
    icon: 'goat',
    image: `${CARDS}/goats-sheep.webp`,
    values: ['goats', 'sheep'],
  },
  {
    key: 'pigs',
    label: 'Pigs',
    icon: 'piggybank',
    image: `${CARDS}/pigs.webp`,
    values: ['pigs'],
  },
  {
    key: 'services',
    label: 'Services',
    icon: 'dna',
    image: `${CARDS}/services.webp`,
    values: [],
  },
];

/**
 * A service (Service Boars) is booked, not bought, so it is kept out of every view except its own
 * card — including the default "all livestock" view. Otherwise a "per service" hire item sits in
 * the grid beside animals with an Add to Cart button.
 */
export function isService(p: Product) {
  return p.is_service === true;
}

export function matchesCard(p: Product, key: CardKey): boolean {
  if (key === 'services') return isService(p);
  if (isService(p)) return false;
  const card = CATEGORY_CARDS.find((c) => c.key === key);
  return card ? card.values.includes(p.category) : false;
}

/** What the grid shows when no card is selected: every animal, minus services. */
export function browsableProducts(products: Product[]): Product[] {
  return products.filter((p) => !isService(p));
}

export function countCard(products: Product[], key: CardKey): number {
  return products.filter((p) => matchesCard(p, key)).length;
}

/**
 * Default ordering: cattle first, then goats & sheep, then pigs — the order of the cards above.
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
