export type ProductCategoryPage = {
  id: string;
  slug: string;
  name: string;
  subtitle: string | null;
  hero_image: string | null;
  hero_description: string | null;
  category_values: string[];
  cta_label: string | null;
  whatsapp_message: string | null;
  details: string[];
  sort_order: number;
  created_at: string;
  updated_at: string;
};
