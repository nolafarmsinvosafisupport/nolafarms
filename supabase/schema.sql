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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

-- Seed products (safe to re-run)
INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Brahman Cattle', 'brahman-cattle', 'cattle', 'oloitoktok',
   'Hardy, heat-tolerant Brahman cattle ideal for the East African climate. Known for excellent feed conversion and disease resistance.',
   ARRAY['Purebred Brahman bloodline','Heat and tick tolerant','Excellent for beef production','Available as calves, heifers, or bulls'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/cattle/brahman/cow2.jpeg','/images/products/animals/cattle/brahman/cow3.jpeg','/images/products/animals/cattle/brahman/cow4.jpeg'],
   10)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Holstein Dairy Cattle', 'holstein-dairy-cattle', 'cattle', 'oloitoktok',
   'High-performance Holstein dairy cattle bred for maximum milk yield under Kenyan conditions.',
   ARRAY['Top-tier dairy bloodline','High daily milk yield','Well-adapted to zero-grazing','Available as heifers and in-calf cows'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/cattle/holstein/cow.jpeg','/images/products/animals/cattle/holstein/cow5.jpeg','/images/products/animals/cattle/holstein/cow6.jpeg'],
   20)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Boer Goats', 'boer-goats', 'goats', 'oloitoktok',
   'Premium Boer goats bred for exceptional meat quality and rapid growth. South African bloodline raised at our Oloitoktok ranch.',
   ARRAY['Purebred Boer bloodline','Fast growth rate','Superior meat-to-bone ratio','Available as kids, does, and bucks'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/goat/boer/boer main 1.jpeg','/images/products/animals/goat/boer/boer main 2.jpeg','/images/products/animals/goat/boer/boer main 3.jpeg','/images/products/animals/goat/boer/boer main 4.jpeg','/images/products/animals/goat/boer/boer main 5.jpeg'],
   30)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('American Yorkshire Pigs', 'american-yorkshire-pigs', 'pigs', 'oloitoktok',
   'American Yorkshire pigs, the most recorded breed in the world. Known for lean carcass quality and outstanding mothering ability.',
   ARRAY['American Yorkshire bloodline','Lean, high-quality pork','Excellent feed efficiency','Available as weaners, gilts, and boars'],
   NULL, NULL, 'per head', NULL,
   ARRAY['/images/products/animals/pigs/American Yorkshire pigs/pigs.jpeg','/images/products/animals/pigs/American Yorkshire pigs/pigs2.jpeg','/images/products/animals/pigs/American Yorkshire pigs/pigs3.jpeg'],
   40)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order) VALUES
  ('Dorper Sheep', 'dorper-sheep', 'sheep', 'oloitoktok',
   'Dorper sheep — a South African breed developed for arid conditions. Excellent meat quality with minimal management requirements.',
   ARRAY['Dorper breed — low maintenance','Fast maturing','Superior meat quality','Adapted to dry conditions'],
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
