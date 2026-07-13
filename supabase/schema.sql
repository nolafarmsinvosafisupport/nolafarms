CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  user_id TEXT,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  visit_date DATE NOT NULL,
  visit_time TEXT NOT NULL,
  group_size INTEGER NOT NULL DEFAULT 1,
  purpose TEXT NOT NULL,
  special_requests TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_note TEXT,
  confirmed_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ,
  cancellation_by TEXT,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blocked_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  phone_number TEXT,
  notify_on_confirm BOOLEAN DEFAULT TRUE,
  notify_on_reminder BOOLEAN DEFAULT TRUE,
  notify_on_rejection BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Single-row settings table. Insert the seed row once after running this schema.
CREATE TABLE IF NOT EXISTS farm_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),   -- enforces single row
  admin_notification_email TEXT,
  reminder_emails_enabled BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed the single row (safe to re-run)
INSERT INTO farm_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('cattle','goats','sheep','pigs','poultry','vegetables','fruits','grains')),
  ranch TEXT NOT NULL DEFAULT 'both' CHECK (ranch IN ('oloitoktok','laikipia','both')),
  description TEXT,
  details TEXT[] DEFAULT '{}',
  price NUMERIC(10,2),
  compare_at_price NUMERIC(10,2),
  price_unit TEXT DEFAULT 'per kg',
  bulk_info TEXT,
  images TEXT[] DEFAULT '{}',
  available BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  is_service BOOLEAN NOT NULL DEFAULT FALSE,
  -- Separate from `available` (shown on the site at all) — a visible product can still be
  -- temporarily out of stock, which disables Add-to-Cart and shows a badge instead of
  -- delisting it the way `available = FALSE` does.
  in_stock BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Category-level landing content (hero photo/description/CTA) for grouped product
-- categories. Separate from products.category (which stays a flat enum) — category_values
-- maps a category page to one or more of those enum values, e.g. ARRAY['goats','sheep'].
-- Self-referencing parent_id: NULL = a main/top-level category (Livestock, Vegetables,
-- Grains, Fruits — the tiles on /products), set = a subcategory of that main category
-- (e.g. Cattle / Goats & Sheep / Pigs under Livestock).
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  subtitle TEXT,
  hero_image TEXT,
  hero_description TEXT,
  category_values TEXT[] NOT NULL DEFAULT '{}',
  cta_label TEXT,
  whatsapp_message TEXT,
  details TEXT[] DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  coming_soon BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Main (top-level) categories — the tiles on /products (safe to re-run)
INSERT INTO product_categories (slug, name, category_values, sort_order) VALUES
  ('livestock', 'Livestock', ARRAY['cattle','goats','sheep','pigs','poultry'], 10)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_categories (slug, name, category_values, sort_order) VALUES
  ('vegetables', 'Vegetables', ARRAY['vegetables'], 20)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_categories (slug, name, category_values, sort_order) VALUES
  ('grains', 'Grains', ARRAY['grains'], 30)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO product_categories (slug, name, category_values, sort_order) VALUES
  ('fruits', 'Fruits', ARRAY['fruits'], 40)
ON CONFLICT (slug) DO NOTHING;

-- Subcategories of Livestock — the Cattle / Goats & Sheep / Pigs tabs on /products/livestock
-- (safe to re-run)
INSERT INTO product_categories (slug, name, subtitle, hero_image, hero_description, category_values, cta_label, whatsapp_message, details, sort_order, parent_id) VALUES
  ('cattle', 'Cattle', 'Zebu, Dairy Cross & Breeding Stock',
   'https://images.nolaranches.co.ke/products/animals/cattle/brahman/cow4.jpeg',
   'Nola Ranch maintains a diverse herd of cattle in Oloitoktok, Kajiado County. Our animals are selected for drought resistance, fertility, and market performance. All cattle are vaccinated, tagged, and farm-recorded.',
   ARRAY['cattle'], 'View Available Sales Stock',
   'Hello, I''m interested in the cattle available at Nola Ranches. Please provide more details.',
   ARRAY[]::TEXT[], 10, (SELECT id FROM product_categories WHERE slug = 'livestock'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_categories (slug, name, subtitle, hero_image, hero_description, category_values, cta_label, whatsapp_message, details, sort_order, parent_id) VALUES
  ('goats-sheep', 'Goats & Sheep', 'Premium Meat Breeds Adapted for Kajiado',
   'https://images.nolaranches.co.ke/products/animals/goat/boer/boer-main-1.jpeg',
   'Nola Ranch raises hardy meat goats and sheep bred for drought resistance and fast growth. All animals are vaccinated, healthy, and ready for breeding or meat market.',
   ARRAY['goats','sheep'], 'Contact Us for Sales Stock',
   'Hello, I''m interested in the goats and sheep available at Nola Ranches. Please provide more details.',
   ARRAY[]::TEXT[], 20, (SELECT id FROM product_categories WHERE slug = 'livestock'))
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_categories (slug, name, subtitle, hero_image, hero_description, category_values, cta_label, whatsapp_message, details, sort_order, parent_id) VALUES
  ('pigs', 'Pigs', 'Commercial Breeding Stock & Meat Production',
   'https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs.jpeg',
   'Nola Ranch operates a modern piggery in Oloitoktok focused on genetics, fertility, and fast growth. We maintain pure breeds and terminal crosses to supply quality piglets, gilts, and porkers to farmers and the market.',
   ARRAY['pigs'], 'Inquire About Piglets, Gilts & Boar Services',
   'Hello, I''m interested in piglets, gilts, or boar services at Nola Ranches. Please provide more details.',
   ARRAY['Purebred Gilts & Boars Available','High Fertility & Large Litters','Fast Growth: Market-Ready in 6 Months','Full Vaccination & Deworming Program','Breeding & Genetic Advice Offered'], 30, (SELECT id FROM product_categories WHERE slug = 'livestock'))
ON CONFLICT (slug) DO NOTHING;

-- Re-parents rows seeded before parent_id existed (safe to re-run — a no-op once parented)
UPDATE product_categories SET parent_id = (SELECT id FROM product_categories WHERE slug = 'livestock')
WHERE slug IN ('cattle', 'goats-sheep', 'pigs') AND parent_id IS NULL;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  delivery_location TEXT,
  delivery_notes TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','fulfilled','cancelled')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Corrects the 5 breed rows below if they were already seeded before this content was
-- refreshed (safe to re-run — re-sets the same target values each time).
UPDATE products SET name = 'Brahman Cattle', description = 'Premium breeding bulls. Used to improve calf size, growth rate, and heat tolerance.', details = ARRAY['Premium breeding bulls','Improves calf size and growth rate','Excellent heat tolerance','Used to strengthen herd genetics'], updated_at = NOW() WHERE slug = 'brahman-cattle';
UPDATE products SET name = 'Cross Holstein-Friesian Cattle', description = 'Dairy cross for improved milk yield. Ideal for farmers wanting both milk and beef production.', details = ARRAY['Dairy cross bloodline','Improved milk yield','Suited to both milk and beef production','Available as heifers and in-calf cows'], updated_at = NOW() WHERE slug = 'holstein-dairy-cattle';
UPDATE products SET name = 'Boer Cross Goats', description = 'Fast-growing meat goats. Crossed for improved size and kid growth. Excellent for commercial meat production.', details = ARRAY['Boer cross bloodline','Fast growth rate','Improved size and kid growth','Excellent for commercial meat production'], updated_at = NOW() WHERE slug = 'boer-goats';
UPDATE products SET name = 'Pure Large White / Yorkshire Pigs', description = 'The world''s leading mother breed. Known for large litters of 12-14 piglets, excellent mothering ability, and high milk production. Foundation of our breeding program.', details = ARRAY['Large litters of 12-14 piglets','Excellent mothering ability','High milk production','Foundation of our breeding program'], updated_at = NOW() WHERE slug = 'american-yorkshire-pigs';
UPDATE products SET name = 'Dorper Sheep', description = 'Premium meat sheep. Quick growth, no wool, excellent carcass quality. Ideal for dry areas.', details = ARRAY['Quick growth','No wool — low maintenance','Excellent carcass quality','Ideal for dry areas'], updated_at = NOW() WHERE slug = 'dorper-sheep';

-- Temporary placeholder photos for breeds/categories the client hasn't sent real photos
-- for yet — reuses existing R2-hosted photos of a related breed. Guarded to only fill
-- empty fields, so a real photo added later (via admin or a fresh seed) is never overwritten.
UPDATE products SET images = ARRAY['https://images.nolaranches.co.ke/products/animals/cattle/brahman/cow3.jpeg'], updated_at = NOW() WHERE slug = 'boran-cattle' AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.nolaranches.co.ke/products/animals/cattle/holstein/cow5.jpeg'], updated_at = NOW() WHERE slug = 'sahiwal-cattle' AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.nolaranches.co.ke/products/animals/goat/boer/boer-main-3.jpeg'], updated_at = NOW() WHERE slug = 'galla-goats' AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs2.jpeg'], updated_at = NOW() WHERE slug = 'landrace-pigs' AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs3.jpeg'], updated_at = NOW() WHERE slug = 'pietrain-pigs' AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs.jpeg'], updated_at = NOW() WHERE slug = 'duroc-pigs' AND (images IS NULL OR images = '{}');
UPDATE products SET images = ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs2.jpeg'], updated_at = NOW() WHERE slug = 'service-boars' AND (images IS NULL OR images = '{}');
UPDATE product_categories SET hero_image = 'https://images.nolaranches.co.ke/products/animals/cattle/brahman/cow4.jpeg', updated_at = NOW() WHERE slug = 'cattle' AND hero_image IS NULL;
UPDATE product_categories SET hero_image = 'https://images.nolaranches.co.ke/products/animals/goat/boer/boer-main-1.jpeg', updated_at = NOW() WHERE slug = 'goats-sheep' AND hero_image IS NULL;
UPDATE product_categories SET hero_image = 'https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs.jpeg', updated_at = NOW() WHERE slug = 'pigs' AND hero_image IS NULL;

-- Seed products (safe to re-run)
INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Brahman Cattle', 'brahman-cattle', 'cattle', 'oloitoktok',
   'Premium breeding bulls. Used to improve calf size, growth rate, and heat tolerance.',
   ARRAY['Premium breeding bulls','Improves calf size and growth rate','Excellent heat tolerance','Used to strengthen herd genetics'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/cattle/brahman/cow2.jpeg','/images/products/animals/cattle/brahman/cow3.jpeg','/images/products/animals/cattle/brahman/cow4.jpeg'],
   10)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Boran Cattle', 'boran-cattle', 'cattle', 'oloitoktok',
   'Kenya''s leading beef breed. Extremely drought tolerant with excellent fertility and beef quality.',
   ARRAY['Kenya''s premier beef breed','Extremely drought tolerant','Excellent fertility','Premium beef quality'],
   NULL, NULL, 'per head', NULL, ARRAY['https://images.nolaranches.co.ke/products/animals/cattle/brahman/cow3.jpeg'], 11)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Sahiwal Cattle', 'sahiwal-cattle', 'cattle', 'oloitoktok',
   'Dual-purpose breed from Pakistan/India. Heat tolerant. Ideal for milk production and raising strong calves.',
   ARRAY['Dual-purpose breed from Pakistan/India','Heat tolerant','Ideal for milk production','Raises strong, fast-growing calves'],
   NULL, NULL, 'per head', NULL, ARRAY['https://images.nolaranches.co.ke/products/animals/cattle/holstein/cow5.jpeg'], 12)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Cross Holstein-Friesian Cattle', 'holstein-dairy-cattle', 'cattle', 'oloitoktok',
   'Dairy cross for improved milk yield. Ideal for farmers wanting both milk and beef production.',
   ARRAY['Dairy cross bloodline','Improved milk yield','Suited to both milk and beef production','Available as heifers and in-calf cows'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/cattle/holstein/cow.jpeg','/images/products/animals/cattle/holstein/cow5.jpeg','/images/products/animals/cattle/holstein/cow6.jpeg'],
   20)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Boer Cross Goats', 'boer-goats', 'goats', 'oloitoktok',
   'Fast-growing meat goats. Crossed for improved size and kid growth. Excellent for commercial meat production.',
   ARRAY['Boer cross bloodline','Fast growth rate','Improved size and kid growth','Excellent for commercial meat production'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/goat/boer/boer main 1.jpeg','/images/products/animals/goat/boer/boer main 2.jpeg','/images/products/animals/goat/boer/boer main 3.jpeg','/images/products/animals/goat/boer/boer main 4.jpeg','/images/products/animals/goat/boer/boer main 5.jpeg'],
   30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Galla Goats', 'galla-goats', 'goats', 'oloitoktok',
   'Kenya''s leading meat goat. Tall, drought resistant, and in high demand. Produces heavy carcasses.',
   ARRAY['Kenya''s leading meat goat breed','Tall and drought resistant','High market demand','Produces heavy carcasses'],
   NULL, NULL, 'per head', NULL, ARRAY['https://images.nolaranches.co.ke/products/animals/goat/boer/boer-main-3.jpeg'], 31)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Pure Large White / Yorkshire Pigs', 'american-yorkshire-pigs', 'pigs', 'oloitoktok',
   'The world''s leading mother breed. Known for large litters of 12-14 piglets, excellent mothering ability, and high milk production. Foundation of our breeding program.',
   ARRAY['Large litters of 12-14 piglets','Excellent mothering ability','High milk production','Foundation of our breeding program'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/pigs/American Yorkshire pigs/pigs.jpeg','/images/products/animals/pigs/American Yorkshire pigs/pigs2.jpeg','/images/products/animals/pigs/American Yorkshire pigs/pigs3.jpeg'],
   40)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Pure Landrace Pigs', 'landrace-pigs', 'pigs', 'oloitoktok',
   'Premium maternal breed. Prolific, docile, and excellent for cross breeding. Produces long-bodied piglets with high survival rates.',
   ARRAY['Premium maternal breed','Prolific and docile','Excellent for cross breeding','Long-bodied piglets with high survival rates'],
   NULL, NULL, 'per head', NULL, ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs2.jpeg'], 41)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Pietrain Pigs', 'pietrain-pigs', 'pigs', 'oloitoktok',
   'Terminal sire breed. Adds superior muscling, leanness, and fast growth to market pigs. Used to improve carcass quality.',
   ARRAY['Terminal sire breed','Superior muscling and leanness','Fast growth rate','Improves carcass quality'],
   NULL, NULL, 'per head', NULL, ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs3.jpeg'], 42)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Duroc Pigs', 'duroc-pigs', 'pigs', 'oloitoktok',
   'Hardy terminal sire breed. Excellent for growth rate, meat quality, and adaptability. Produces strong, fast-growing porkers.',
   ARRAY['Hardy terminal sire breed','Excellent growth rate and meat quality','Highly adaptable','Produces strong, fast-growing porkers'],
   NULL, NULL, 'per head', NULL, ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs.jpeg'], 43)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order, is_service) VALUES
  ('Service Boars', 'service-boars', 'pigs', 'oloitoktok',
   'Professional boar services. Pure Pietrain and Duroc boars available for hire to improve your herd genetics.',
   ARRAY['Pure Pietrain and Duroc boars available','Improves herd genetics','Professional service booking via WhatsApp'],
   NULL, NULL, 'per service', NULL, ARRAY['https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs2.jpeg'], 44, TRUE)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Dorper Sheep', 'dorper-sheep', 'sheep', 'oloitoktok',
   'Premium meat sheep. Quick growth, no wool, excellent carcass quality. Ideal for dry areas.',
   ARRAY['Quick growth','No wool — low maintenance','Excellent carcass quality','Ideal for dry areas'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/sheep/dorper/sheep.jpeg'],
   50)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Watermelon', 'watermelon', 'fruits', 'oloitoktok',
   'Sweet, sun-ripened watermelons grown naturally at our Oloitoktok farm. Harvested at peak ripeness with no artificial ripening.',
   ARRAY['Grown without chemical fertilisers','Harvested daily at peak ripeness','Sweet, crisp flesh','Available retail and bulk'],
   80.00, NULL, 'per kg', '50kg+ @ KES 65/kg',
   ARRAY['/images/products/fruits/Watermelon/watermelon1.jpeg'],
   60)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Georgia Southern Sukuma Wiki', 'sukuma-wiki', 'vegetables', 'oloitoktok',
   'Georgia Southern Sukuma Wiki (kale) — deeply nutritious, large-leaf variety grown fresh at our Oloitoktok farm.',
   ARRAY['Large-leaf Georgia Southern variety','Rich in iron and vitamins','Grown with manure — no chemicals','Harvested fresh daily'],
   45.00, NULL, 'per kg', '10kg+ @ KES 35/kg',
   ARRAY['/images/products/vegetables/Georgia Southern Sukuma Wiki/plant1.jpeg'],
   70)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Cabbage', 'cabbage', 'vegetables', 'oloitoktok',
   'Firm, tight-headed cabbages grown at our Oloitoktok farm. Ideal for hotels, wholesale markets, and home kitchens.',
   ARRAY['Dense, tight-headed variety','No pesticides — manure grown','Ideal for hotels and wholesale','Available in 50kg+ bulk bags'],
   60.00, NULL, 'per head', '20+ heads @ KES 50 each',
   ARRAY['/images/products/vegetables/cabbage/cabbage.jfif'],
   80)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Broad Leaf Swiss Spinach', 'swiss-spinach', 'vegetables', 'oloitoktok',
   'Broad-leaf Swiss Chard Spinach with young tender leaves and white stems. A premium spinach variety perfect for juicing, cooking, and hotels.',
   ARRAY['Broad-leaf Swiss Chard variety','Young tender leaves, white stems','Harvested daily from our farm','No chemicals — just manure and water','Best for hotels, homes, and juicing'],
   75.00, 80.00, 'per kg', '10kg+ @ KES 70/kg',
   ARRAY['/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 1.jpg','/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 2.jpg','/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 3.jpg','/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 4.jpg'],
   90)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Wheat', 'wheat', 'grains', 'laikipia',
   'High-quality wheat harvested from our expansive Laikipia ranch. Available for milling, wholesale, and direct purchase.',
   ARRAY['Grown across 375 acres in Laikipia','Seasonal harvest — order in advance','Suitable for milling and wholesale','Certificate of origin available'],
   NULL, NULL, 'per 90kg bag', 'Contact for bulk tonnage pricing',
   ARRAY['/images/products/grains/wheat/wheat.webp'],
   100)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Guinea Corn Sorghum', 'sorghum', 'grains', 'laikipia',
   'Drought-resistant Guinea Corn Sorghum from our Laikipia farm. High nutritional value, ideal for animal feed and food production.',
   ARRAY['Drought-resistant variety','High energy grain','Suitable for animal feed and flour','Available in bulk bags'],
   NULL, NULL, 'per 90kg bag', 'Contact for bulk tonnage pricing',
   ARRAY['/images/products/grains/Guinea Corn Sorghum/sorghum.webp'],
   110)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Millet (Wimbi)', 'wimbi-millet', 'grains', 'laikipia',
   'Finger millet (Wimbi) from our Laikipia highlands. A nutritious grain used for flour, uji, and traditional fermented drinks.',
   ARRAY['Highland-grown finger millet','High in calcium and iron','Used for uji, flour, and fermentation','Available retail and wholesale'],
   NULL, NULL, 'per kg', 'Contact for bulk bag pricing',
   ARRAY['/images/products/grains/Millet aka Wimbi/wimbi.jfif'],
   120)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Soya Beans', 'soya-beans', 'grains', 'laikipia',
   'Protein-rich soya beans from our Laikipia farm. Used for animal feed, oil extraction, and human consumption.',
   ARRAY['High protein content (35-40%)','Ideal for livestock feed and tofu','Non-GMO variety','Available in 50kg bags'],
   NULL, NULL, 'per 50kg bag', 'Contact for large-volume pricing',
   ARRAY['/images/products/grains/soya beans/soya beans.jpg'],
   130)
ON CONFLICT (slug) DO NOTHING;
