import type postgres from 'postgres';

// Run once per server process. Creates all tables if they don't exist.
let _migrationDone = false;
let _migrationPromise: Promise<void> | null = null;

export async function runMigrations(sql: ReturnType<typeof postgres>) {
  if (_migrationDone) return;
  if (_migrationPromise) return _migrationPromise;

  _migrationPromise = (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        read BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    // Added after initial launch — booking/order routes insert these columns.
    // ADD COLUMN IF NOT EXISTS so they backfill on databases that already have the table.
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS booking_id UUID`;
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS order_id UUID`;

    await sql`
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
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS blocked_dates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        date DATE UNIQUE NOT NULL,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS user_profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        clerk_user_id TEXT UNIQUE NOT NULL,
        phone_number TEXT,
        notify_on_confirm BOOLEAN DEFAULT TRUE,
        notify_on_reminder BOOLEAN DEFAULT TRUE,
        notify_on_rejection BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS farm_settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        admin_notification_email TEXT,
        reminder_emails_enabled BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    await sql`INSERT INTO farm_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING`;

    await sql`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        category TEXT NOT NULL,
        ranch TEXT NOT NULL DEFAULT 'both',
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
      )
    `;
    // Added for boar-hire and similar bookable services that shouldn't go through
    // Add-to-Cart/checkout like a physical product does.
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS is_service BOOLEAN NOT NULL DEFAULT FALSE`;
    // Separate from `available` (shown on the site at all) — a visible product can still be
    // temporarily out of stock, which disables Add-to-Cart and shows a badge instead of
    // delisting it the way `available = FALSE` does.
    await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS in_stock BOOLEAN NOT NULL DEFAULT TRUE`;

    // Category-level landing content (hero photo/description/CTA) for grouped product
    // categories. Deliberately separate from `products.category` (which stays a flat enum)
    // — `category_values` maps a category page to one or more of those enum values, e.g.
    // ['goats','sheep']. Self-referencing `parent_id`: NULL = a main/top-level category
    // (Livestock, Vegetables, Grains, Fruits — the tiles on /products), set = a subcategory
    // of that main category (e.g. Cattle / Goats & Sheep / Pigs under Livestock).
    await sql`
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
      )
    `;
    // ADD COLUMN IF NOT EXISTS backfill for databases where this table already existed
    // before parent_id/active/coming_soon were added.
    await sql`ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES product_categories(id) ON DELETE CASCADE`;
    await sql`ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT TRUE`;
    await sql`ALTER TABLE product_categories ADD COLUMN IF NOT EXISTS coming_soon BOOLEAN NOT NULL DEFAULT FALSE`;

    await sql`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reference TEXT UNIQUE NOT NULL,
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_email TEXT,
        items JSONB NOT NULL DEFAULT '[]',
        delivery_location TEXT,
        delivery_notes TEXT,
        status TEXT NOT NULL DEFAULT 'new',
        admin_note TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    // Added when checkout became account-gated — links an order back to the Clerk
    // account that placed it. Nullable so the 2 pre-existing guest orders are unaffected.
    await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id TEXT`;

    // Atomic per-scope counters for collision-proof reference numbers (e.g. "orders-2026", "bookings-2026").
    // Replaces the old COUNT(*)+1 pattern, which could assign the same reference to two concurrent submissions.
    await sql`
      CREATE TABLE IF NOT EXISTS reference_counters (
        scope TEXT PRIMARY KEY,
        value INTEGER NOT NULL DEFAULT 0
      )
    `;

    // ---- Indexes -----------------------------------------------------------
    // Before this, the only indexes were the implicit unique constraints, so every
    // lookup by date/user/status was a sequential scan. Harmless while the tables are
    // near-empty, but these are the hot paths and they degrade quickly with real data.
    // IF NOT EXISTS keeps this idempotent on every boot.

    // Availability lookup + double-booking guard + reminder cron all filter on
    // (status, visit_date); the plain visit_date index covers the admin calendar.
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_status_visit_date ON bookings (status, visit_date)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_visit_date ON bookings (visit_date)`;
    // "My bookings" (/api/bookings/mine) filters by the Clerk user id.
    await sql`CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings (user_id)`;

    // The notification bell polls this every 10-30s per signed-in user:
    //   WHERE user_id = $1 ORDER BY created_at DESC LIMIT 10
    await sql`CREATE INDEX IF NOT EXISTS idx_notifications_user_created ON notifications (user_id, created_at DESC)`;

    // Account order history + admin status filter + admin list ordering.
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC)`;

    // Public catalogue: WHERE available = TRUE ORDER BY sort_order, name
    await sql`CREATE INDEX IF NOT EXISTS idx_products_available_sort ON products (available, sort_order)`;

    // Backfill/self-heal each scope's counter from actual orders/bookings history, so it
    // always covers at least every reference already used under the old COUNT(*)-based
    // numbering (fixes the live bug where a fresh counter started at 0 and collided with
    // pre-existing "ORD-2026-0001"). GREATEST(...) only ever moves a counter UP to match
    // real history — it never lowers a value that's already correctly advanced past this
    // point by real order/booking submissions, so this is safe to run on every boot.
    await sql`
      INSERT INTO reference_counters (scope, value)
      SELECT 'orders-' || year_part, COUNT(*)
      FROM (SELECT EXTRACT(YEAR FROM created_at)::text AS year_part FROM orders) sub
      GROUP BY year_part
      ON CONFLICT (scope) DO UPDATE SET value = GREATEST(reference_counters.value, EXCLUDED.value)
    `;
    await sql`
      INSERT INTO reference_counters (scope, value)
      SELECT 'bookings-' || year_part, COUNT(*)
      FROM (SELECT EXTRACT(YEAR FROM created_at)::text AS year_part FROM bookings) sub
      GROUP BY year_part
      ON CONFLICT (scope) DO UPDATE SET value = GREATEST(reference_counters.value, EXCLUDED.value)
    `;

    // Always seed (ON CONFLICT (slug) DO NOTHING makes it idempotent)
    await seedProducts(sql);
    await seedProductCategories(sql);
    await backfillPlaceholderImages(sql);

    _migrationDone = true;
  })();

  return _migrationPromise;
}

async function seedProductCategories(sql: ReturnType<typeof postgres>) {
  // Main (top-level) categories — the tiles on /products. Livestock is the only one with
  // subcategories today; Vegetables/Grains/Fruits link straight to a filtered product grid
  // until they have subcategory-worthy content of their own.
  const mainCategories = [
    { slug: 'livestock', name: 'Livestock', category_values: ['cattle', 'goats', 'sheep', 'pigs', 'poultry'], sort_order: 10 },
    { slug: 'vegetables', name: 'Vegetables', category_values: ['vegetables'], sort_order: 20 },
    { slug: 'grains', name: 'Grains', category_values: ['grains'], sort_order: 30 },
    { slug: 'fruits', name: 'Fruits', category_values: ['fruits'], sort_order: 40 },
  ];
  for (const c of mainCategories) {
    await sql`
      INSERT INTO product_categories (slug, name, category_values, sort_order)
      VALUES (${c.slug}, ${c.name}, ${c.category_values}, ${c.sort_order})
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  const [livestock] = await sql<{ id: string }[]>`SELECT id FROM product_categories WHERE slug = 'livestock' LIMIT 1`;
  const livestockId = livestock?.id ?? null;

  // Subcategories of Livestock. No longer rendered publicly (the category landing page was
  // removed) — kept because toggling a category inactive bulk-hides its products from /products.
  const subcategories = [
    {
      slug: 'cattle', name: 'Cattle', subtitle: 'Zebu, Dairy Cross & Breeding Stock',
      // null on purpose: a NULL hero_image makes the category card fall back to its
      // purpose-shot artwork in lib/product-taxonomy. Seeding a product photo here would
      // override that card art on any fresh install.
      hero_image: null as string | null,
      hero_description: 'Nola Ranch maintains a diverse herd of cattle in Oloitoktok, Kajiado County. Our animals are selected for drought resistance, fertility, and market performance. All cattle are vaccinated, tagged, and farm-recorded.',
      category_values: ['cattle'],
      cta_label: 'View Available Sales Stock',
      whatsapp_message: "Hello, I'm interested in the cattle available at Nola Ranches. Please provide more details.",
      details: [], sort_order: 10,
    },
    {
      slug: 'goats-sheep', name: 'Goats & Sheep', subtitle: 'Premium Meat Breeds Adapted for Kajiado',
      hero_image: null as string | null,
      hero_description: 'Nola Ranch raises hardy meat goats and sheep bred for drought resistance and fast growth. All animals are vaccinated, healthy, and ready for breeding or meat market.',
      category_values: ['goats', 'sheep'],
      cta_label: 'Contact Us for Sales Stock',
      whatsapp_message: "Hello, I'm interested in the goats and sheep available at Nola Ranches. Please provide more details.",
      details: [], sort_order: 20,
    },
    {
      slug: 'pigs', name: 'Pigs', subtitle: 'Commercial Breeding Stock & Meat Production',
      hero_image: null as string | null,
      hero_description: 'Nola Ranch operates a modern piggery in Oloitoktok focused on genetics, fertility, and fast growth. We maintain pure breeds and terminal crosses to supply quality piglets, gilts, and porkers to farmers and the market.',
      category_values: ['pigs'],
      cta_label: 'Inquire About Piglets, Gilts & Boar Services',
      whatsapp_message: "Hello, I'm interested in piglets, gilts, or boar services at Nola Ranches. Please provide more details.",
      details: ['Purebred Gilts & Boars Available', 'High Fertility & Large Litters', 'Fast Growth: Market-Ready in 6 Months', 'Full Vaccination & Deworming Program', 'Breeding & Genetic Advice Offered'],
      sort_order: 30,
    },
  ];

  for (const c of subcategories) {
    await sql`
      INSERT INTO product_categories (slug, name, subtitle, hero_image, hero_description, category_values, cta_label, whatsapp_message, details, sort_order, parent_id)
      VALUES (${c.slug}, ${c.name}, ${c.subtitle}, ${c.hero_image}, ${c.hero_description}, ${c.category_values}, ${c.cta_label}, ${c.whatsapp_message}, ${c.details}, ${c.sort_order}, ${livestockId})
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  // Re-parents rows that were seeded before parent_id existed (safe to re-run — a no-op
  // once they're already parented).
  if (livestockId) {
    await sql`UPDATE product_categories SET parent_id = ${livestockId} WHERE slug IN ('cattle', 'goats-sheep', 'pigs') AND parent_id IS NULL`;
  }
}

// Temporary stand-ins for breeds/categories the client hasn't sent real photos for yet —
// reuses existing R2-hosted photos of a related breed so cards don't show a bare fallback.
// Swap these out via the admin image uploader once real photos are supplied; the backfill
// below only ever fills empty image fields, so it never clobbers a real upload.
const PLACEHOLDER_IMAGES = {
  cattle: 'https://images.nolaranches.co.ke/products/animals/cattle/brahman/cow3.jpeg',
  cattle2: 'https://images.nolaranches.co.ke/products/animals/cattle/holstein/cow5.jpeg',
  goats: 'https://images.nolaranches.co.ke/products/animals/goat/boer/boer-main-3.jpeg',
  pigs1: 'https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs2.jpeg',
  pigs2: 'https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs3.jpeg',
  pigs3: 'https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs.jpeg',
};

const CATEGORY_PLACEHOLDER_IMAGES: Record<string, string> = {
  cattle: 'https://images.nolaranches.co.ke/products/animals/cattle/brahman/cow4.jpeg',
  'goats-sheep': 'https://images.nolaranches.co.ke/products/animals/goat/boer/boer-main-1.jpeg',
  pigs: 'https://images.nolaranches.co.ke/products/animals/pigs/american-yorkshire-pigs/pigs.jpeg',
};

// Backfills placeholder images onto rows that were already seeded with an empty images
// array / null hero_image before PLACEHOLDER_IMAGES existed. Guarded to only touch empty
// fields, so a real photo added later (via admin or a fresh seed) is never overwritten.
async function backfillPlaceholderImages(sql: ReturnType<typeof postgres>) {
  for (const [slug, url] of Object.entries({
    'boran-cattle': PLACEHOLDER_IMAGES.cattle,
    'sahiwal-cattle': PLACEHOLDER_IMAGES.cattle2,
    'galla-goats': PLACEHOLDER_IMAGES.goats,
    'landrace-pigs': PLACEHOLDER_IMAGES.pigs1,
    'pietrain-pigs': PLACEHOLDER_IMAGES.pigs2,
    'duroc-pigs': PLACEHOLDER_IMAGES.pigs3,
    'service-boars': PLACEHOLDER_IMAGES.pigs1,
  })) {
    await sql`UPDATE products SET images = ${[url]}, updated_at = NOW() WHERE slug = ${slug} AND (images IS NULL OR images = '{}')`;
  }

  // Category hero_image is deliberately NOT backfilled any more. The category cards now have
  // purpose-shot 4:3 artwork in code (CATEGORY_CARDS in lib/product-taxonomy), and the card falls
  // back to it precisely when hero_image is NULL. Backfilling a product photo into that column
  // therefore *overrode* the card art on every boot — set the column to NULL and this loop put a
  // pig photo straight back. A NULL hero_image is now the correct "use the card artwork" state;
  // an admin uploading at /admin/categories still overrides it.
}

// Corrects the 5 breed products above that were already seeded before the client sent
// refreshed names/descriptions (see seedProducts()). Runs unconditionally on every boot —
// harmless/idempotent since it just re-sets the same target values each time — so it also
// self-heals a fresh install if seedProducts() ever inserts before this ran once.
async function updateExistingBreedContent(sql: ReturnType<typeof postgres>) {
  const updates = [
    { slug: 'brahman-cattle', name: 'Brahman Cattle', description: 'Premium breeding bulls. Used to improve calf size, growth rate, and heat tolerance.', details: ['Premium breeding bulls', 'Improves calf size and growth rate', 'Excellent heat tolerance', 'Used to strengthen herd genetics'] },
    { slug: 'holstein-dairy-cattle', name: 'Cross Holstein-Friesian Cattle', description: 'Dairy cross for improved milk yield. Ideal for farmers wanting both milk and beef production.', details: ['Dairy cross bloodline', 'Improved milk yield', 'Suited to both milk and beef production', 'Available as heifers and in-calf cows'] },
    { slug: 'boer-goats', name: 'Boer Cross Goats', description: 'Fast-growing meat goats. Crossed for improved size and kid growth. Excellent for commercial meat production.', details: ['Boer cross bloodline', 'Fast growth rate', 'Improved size and kid growth', 'Excellent for commercial meat production'] },
    { slug: 'american-yorkshire-pigs', name: 'Pure Large White / Yorkshire Pigs', description: "The world's leading mother breed. Known for large litters of 12-14 piglets, excellent mothering ability, and high milk production. Foundation of our breeding program.", details: ['Large litters of 12-14 piglets', 'Excellent mothering ability', 'High milk production', 'Foundation of our breeding program'] },
    { slug: 'dorper-sheep', name: 'Dorper Sheep', description: 'Premium meat sheep. Quick growth, no wool, excellent carcass quality. Ideal for dry areas.', details: ['Quick growth', 'No wool — low maintenance', 'Excellent carcass quality', 'Ideal for dry areas'] },
  ];
  for (const u of updates) {
    await sql`UPDATE products SET name = ${u.name}, description = ${u.description}, details = ${u.details}, updated_at = NOW() WHERE slug = ${u.slug}`;
  }
}

type SeedProduct = {
  name: string; slug: string; category: string; ranch: string; description: string; details: string[];
  price: number | null; compare_at_price: number | null; price_unit: string; bulk_info: string | null;
  images: string[]; sort_order: number; is_service?: boolean;
};

async function seedProducts(sql: ReturnType<typeof postgres>) {
  await updateExistingBreedContent(sql);

  const products: SeedProduct[] = [
    { name: 'Brahman Cattle', slug: 'brahman-cattle', category: 'cattle', ranch: 'oloitoktok', description: 'Premium breeding bulls. Used to improve calf size, growth rate, and heat tolerance.', details: ['Premium breeding bulls', 'Improves calf size and growth rate', 'Excellent heat tolerance', 'Used to strengthen herd genetics'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/cattle/brahman/cow2.jpeg', '/images/products/animals/cattle/brahman/cow3.jpeg', '/images/products/animals/cattle/brahman/cow4.jpeg'], sort_order: 10 },
    { name: 'Boran Cattle', slug: 'boran-cattle', category: 'cattle', ranch: 'oloitoktok', description: "Kenya's leading beef breed. Extremely drought tolerant with excellent fertility and beef quality.", details: ["Kenya's premier beef breed", 'Extremely drought tolerant', 'Excellent fertility', 'Premium beef quality'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: [PLACEHOLDER_IMAGES.cattle], sort_order: 11 },
    { name: 'Sahiwal Cattle', slug: 'sahiwal-cattle', category: 'cattle', ranch: 'oloitoktok', description: 'Dual-purpose breed from Pakistan/India. Heat tolerant. Ideal for milk production and raising strong calves.', details: ['Dual-purpose breed from Pakistan/India', 'Heat tolerant', 'Ideal for milk production', 'Raises strong, fast-growing calves'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: [PLACEHOLDER_IMAGES.cattle2], sort_order: 12 },
    { name: 'Cross Holstein-Friesian Cattle', slug: 'holstein-dairy-cattle', category: 'cattle', ranch: 'oloitoktok', description: 'Dairy cross for improved milk yield. Ideal for farmers wanting both milk and beef production.', details: ['Dairy cross bloodline', 'Improved milk yield', 'Suited to both milk and beef production', 'Available as heifers and in-calf cows'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/cattle/holstein/cow.jpeg', '/images/products/animals/cattle/holstein/cow5.jpeg', '/images/products/animals/cattle/holstein/cow6.jpeg'], sort_order: 20 },
    { name: 'Boer Cross Goats', slug: 'boer-goats', category: 'goats', ranch: 'oloitoktok', description: 'Fast-growing meat goats. Crossed for improved size and kid growth. Excellent for commercial meat production.', details: ['Boer cross bloodline', 'Fast growth rate', 'Improved size and kid growth', 'Excellent for commercial meat production'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/goat/boer/boer main 1.jpeg', '/images/products/animals/goat/boer/boer main 2.jpeg', '/images/products/animals/goat/boer/boer main 3.jpeg'], sort_order: 30 },
    { name: 'Galla Goats', slug: 'galla-goats', category: 'goats', ranch: 'oloitoktok', description: "Kenya's leading meat goat. Tall, drought resistant, and in high demand. Produces heavy carcasses.", details: ["Kenya's leading meat goat breed", 'Tall and drought resistant', 'High market demand', 'Produces heavy carcasses'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: [PLACEHOLDER_IMAGES.goats], sort_order: 31 },
    { name: 'Pure Large White / Yorkshire Pigs', slug: 'american-yorkshire-pigs', category: 'pigs', ranch: 'oloitoktok', description: "The world's leading mother breed. Known for large litters of 12-14 piglets, excellent mothering ability, and high milk production. Foundation of our breeding program.", details: ['Large litters of 12-14 piglets', 'Excellent mothering ability', 'High milk production', 'Foundation of our breeding program'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/pigs/American Yorkshire pigs/pigs.jpeg', '/images/products/animals/pigs/American Yorkshire pigs/pigs2.jpeg', '/images/products/animals/pigs/American Yorkshire pigs/pigs3.jpeg'], sort_order: 40 },
    { name: 'Pure Landrace Pigs', slug: 'landrace-pigs', category: 'pigs', ranch: 'oloitoktok', description: 'Premium maternal breed. Prolific, docile, and excellent for cross breeding. Produces long-bodied piglets with high survival rates.', details: ['Premium maternal breed', 'Prolific and docile', 'Excellent for cross breeding', 'Long-bodied piglets with high survival rates'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: [PLACEHOLDER_IMAGES.pigs1], sort_order: 41 },
    { name: 'Pietrain Pigs', slug: 'pietrain-pigs', category: 'pigs', ranch: 'oloitoktok', description: 'Terminal sire breed. Adds superior muscling, leanness, and fast growth to market pigs. Used to improve carcass quality.', details: ['Terminal sire breed', 'Superior muscling and leanness', 'Fast growth rate', 'Improves carcass quality'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: [PLACEHOLDER_IMAGES.pigs2], sort_order: 42 },
    { name: 'Duroc Pigs', slug: 'duroc-pigs', category: 'pigs', ranch: 'oloitoktok', description: 'Hardy terminal sire breed. Excellent for growth rate, meat quality, and adaptability. Produces strong, fast-growing porkers.', details: ['Hardy terminal sire breed', 'Excellent growth rate and meat quality', 'Highly adaptable', 'Produces strong, fast-growing porkers'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: [PLACEHOLDER_IMAGES.pigs3], sort_order: 43 },
    { name: 'Service Boars', slug: 'service-boars', category: 'pigs', ranch: 'oloitoktok', description: 'Professional boar services. Pure Pietrain and Duroc boars available for hire to improve your herd genetics.', details: ['Pure Pietrain and Duroc boars available', 'Improves herd genetics', 'Professional service booking via WhatsApp'], price: null, compare_at_price: null, price_unit: 'per service', bulk_info: null, images: [PLACEHOLDER_IMAGES.pigs1], sort_order: 44, is_service: true },
    { name: 'Dorper Sheep', slug: 'dorper-sheep', category: 'sheep', ranch: 'oloitoktok', description: 'Premium meat sheep. Quick growth, no wool, excellent carcass quality. Ideal for dry areas.', details: ['Quick growth', 'No wool — low maintenance', 'Excellent carcass quality', 'Ideal for dry areas'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/sheep/dorper/sheep.jpeg'], sort_order: 50 },
    { name: 'Watermelon', slug: 'watermelon', category: 'fruits', ranch: 'oloitoktok', description: 'Sweet, sun-ripened watermelons grown naturally at our Oloitoktok farm. Harvested at peak ripeness with no artificial ripening.', details: ['Grown without chemical fertilisers', 'Harvested daily at peak ripeness', 'Sweet, crisp flesh', 'Available retail and bulk'], price: 80.00, compare_at_price: null, price_unit: 'per kg', bulk_info: '50kg+ @ KES 65/kg', images: ['/images/products/fruits/Watermelon/watermelon1.jpeg'], sort_order: 60 },
    { name: 'Georgia Southern Sukuma Wiki', slug: 'sukuma-wiki', category: 'vegetables', ranch: 'oloitoktok', description: 'Georgia Southern Sukuma Wiki (kale) — deeply nutritious, large-leaf variety grown fresh at our Oloitoktok farm.', details: ['Large-leaf Georgia Southern variety', 'Rich in iron and vitamins', 'Grown with manure — no chemicals', 'Harvested fresh daily'], price: 45.00, compare_at_price: null, price_unit: 'per kg', bulk_info: '10kg+ @ KES 35/kg', images: ['/images/products/vegetables/Georgia Southern Sukuma Wiki/plant1.jpeg'], sort_order: 70 },
    { name: 'Cabbage', slug: 'cabbage', category: 'vegetables', ranch: 'oloitoktok', description: 'Firm, tight-headed cabbages grown at our Oloitoktok farm. Ideal for hotels, wholesale markets, and home kitchens.', details: ['Dense, tight-headed variety', 'No pesticides — manure grown', 'Ideal for hotels and wholesale', 'Available in 50kg+ bulk bags'], price: 60.00, compare_at_price: null, price_unit: 'per head', bulk_info: '20+ heads @ KES 50 each', images: ['/images/products/vegetables/cabbage/cabbage.jfif'], sort_order: 80 },
    { name: 'Broad Leaf Swiss Spinach', slug: 'swiss-spinach', category: 'vegetables', ranch: 'oloitoktok', description: 'Broad-leaf Swiss Chard Spinach with young tender leaves and white stems. A premium spinach variety perfect for juicing, cooking, and hotels.', details: ['Broad-leaf Swiss Chard variety', 'Young tender leaves, white stems', 'Harvested daily from our farm', 'No chemicals — just manure and water', 'Best for hotels, homes, and juicing'], price: 75.00, compare_at_price: 80.00, price_unit: 'per kg', bulk_info: '10kg+ @ KES 70/kg', images: ['/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 1.jpg', '/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 2.jpg', '/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 3.jpg', '/images/products/vegetables/swiss spinach/Broad Leaf Swiss Spinach 4.jpg'], sort_order: 90 },
    { name: 'Wheat', slug: 'wheat', category: 'grains', ranch: 'laikipia', description: 'High-quality wheat harvested from our expansive Laikipia ranch. Available for milling, wholesale, and direct purchase.', details: ['Grown across 375 acres in Laikipia', 'Seasonal harvest — order in advance', 'Suitable for milling and wholesale', 'Certificate of origin available'], price: null, compare_at_price: null, price_unit: 'per 90kg bag', bulk_info: 'Contact for bulk tonnage pricing', images: ['/images/products/grains/wheat/wheat.webp'], sort_order: 100 },
    { name: 'Guinea Corn Sorghum', slug: 'sorghum', category: 'grains', ranch: 'laikipia', description: 'Drought-resistant Guinea Corn Sorghum from our Laikipia farm. High nutritional value, ideal for animal feed and food production.', details: ['Drought-resistant variety', 'High energy grain', 'Suitable for animal feed and flour', 'Available in bulk bags'], price: null, compare_at_price: null, price_unit: 'per 90kg bag', bulk_info: 'Contact for bulk tonnage pricing', images: ['/images/products/grains/Guinea Corn Sorghum/sorghum.webp'], sort_order: 110 },
    { name: 'Millet (Wimbi)', slug: 'wimbi-millet', category: 'grains', ranch: 'laikipia', description: 'Finger millet (Wimbi) from our Laikipia highlands. A nutritious grain used for flour, uji, and traditional fermented drinks.', details: ['Highland-grown finger millet', 'High in calcium and iron', 'Used for uji, flour, and fermentation', 'Available retail and wholesale'], price: null, compare_at_price: null, price_unit: 'per kg', bulk_info: 'Contact for bulk bag pricing', images: ['/images/products/grains/Millet aka Wimbi/wimbi.jfif'], sort_order: 120 },
    { name: 'Soya Beans', slug: 'soya-beans', category: 'grains', ranch: 'laikipia', description: 'Protein-rich soya beans from our Laikipia farm. Used for animal feed, oil extraction, and human consumption.', details: ['High protein content (35-40%)', 'Ideal for livestock feed and tofu', 'Non-GMO variety', 'Available in 50kg bags'], price: null, compare_at_price: null, price_unit: 'per 50kg bag', bulk_info: 'Contact for large-volume pricing', images: ['/images/products/grains/soya beans/soya beans.jpg'], sort_order: 130 },
  ];

  for (const p of products) {
    await sql`
      INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order, is_service)
      VALUES (${p.name}, ${p.slug}, ${p.category}, ${p.ranch}, ${p.description}, ${p.details}, ${p.price}, ${p.compare_at_price}, ${p.price_unit}, ${p.bulk_info}, ${p.images}, ${p.sort_order}, ${p.is_service ?? false})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
}
