import type { ProductCategoryPage } from './category-types';
import type { Product } from './product-types';

// A category (main or sub) that's inactive — or a main category marked "coming soon" —
// hides every product whose `category` falls under it. This lets an admin bulk-hide an
// entire species/line (e.g. toggle off the "Pigs" subcategory) with one switch instead of
// hiding each product individually, and keeps a "Coming Soon" main category from quietly
// leaving its products purchasable elsewhere on the site.
export function computeHiddenCategoryValues(categories: ProductCategoryPage[]): Set<string> {
  const hidden = new Set<string>();
  for (const c of categories) {
    const isMain = c.parent_id === null;
    if (!c.active || (isMain && c.coming_soon)) {
      for (const v of c.category_values) hidden.add(v);
    }
  }
  return hidden;
}

export function filterVisibleProducts(products: Product[], categories: ProductCategoryPage[]): Product[] {
  const hidden = computeHiddenCategoryValues(categories);
  return products.filter((p) => !hidden.has(p.category));
}
