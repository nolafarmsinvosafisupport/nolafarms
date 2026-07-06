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
    // Added after initial launch — booking routes insert this column.
    // ADD COLUMN IF NOT EXISTS so it backfills on databases that already have the table.
    await sql`ALTER TABLE notifications ADD COLUMN IF NOT EXISTS booking_id UUID`;

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

    _migrationDone = true;
  })();

  return _migrationPromise;
}

async function seedProducts(sql: ReturnType<typeof postgres>) {
  const products = [
    { name: 'Brahman Cattle', slug: 'brahman-cattle', category: 'cattle', ranch: 'oloitoktok', description: 'Hardy, heat-tolerant Brahman cattle ideal for the East African climate. Known for excellent feed conversion and disease resistance.', details: ['Purebred Brahman bloodline', 'Heat and tick tolerant', 'Excellent for beef production', 'Available as calves, heifers, or bulls'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/cattle/brahman/cow2.jpeg', '/images/products/animals/cattle/brahman/cow3.jpeg', '/images/products/animals/cattle/brahman/cow4.jpeg'], sort_order: 10 },
    { name: 'Holstein Dairy Cattle', slug: 'holstein-dairy-cattle', category: 'cattle', ranch: 'oloitoktok', description: 'High-performance Holstein dairy cattle bred for maximum milk yield under Kenyan conditions.', details: ['Top-tier dairy bloodline', 'High daily milk yield', 'Well-adapted to zero-grazing', 'Available as heifers and in-calf cows'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/cattle/holstein/cow.jpeg', '/images/products/animals/cattle/holstein/cow5.jpeg', '/images/products/animals/cattle/holstein/cow6.jpeg'], sort_order: 20 },
    { name: 'Boer Goats', slug: 'boer-goats', category: 'goats', ranch: 'oloitoktok', description: 'Premium Boer goats bred for exceptional meat quality and rapid growth. South African bloodline raised at our Oloitoktok ranch.', details: ['Purebred Boer bloodline', 'Fast growth rate', 'Superior meat-to-bone ratio', 'Available as kids, does, and bucks'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/goat/boer/boer main 1.jpeg', '/images/products/animals/goat/boer/boer main 2.jpeg', '/images/products/animals/goat/boer/boer main 3.jpeg'], sort_order: 30 },
    { name: 'American Yorkshire Pigs', slug: 'american-yorkshire-pigs', category: 'pigs', ranch: 'oloitoktok', description: 'American Yorkshire pigs, the most recorded breed in the world. Known for lean carcass quality and outstanding mothering ability.', details: ['American Yorkshire bloodline', 'Lean, high-quality pork', 'Excellent feed efficiency', 'Available as weaners, gilts, and boars'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/pigs/American Yorkshire pigs/pigs.jpeg', '/images/products/animals/pigs/American Yorkshire pigs/pigs2.jpeg', '/images/products/animals/pigs/American Yorkshire pigs/pigs3.jpeg'], sort_order: 40 },
    { name: 'Dorper Sheep', slug: 'dorper-sheep', category: 'sheep', ranch: 'oloitoktok', description: 'Dorper sheep — a South African breed developed for arid conditions. Excellent meat quality with minimal management requirements.', details: ['Dorper breed — low maintenance', 'Fast maturing', 'Superior meat quality', 'Adapted to dry conditions'], price: null, compare_at_price: null, price_unit: 'per head', bulk_info: null, images: ['/images/products/animals/sheep/dorper/sheep.jpeg'], sort_order: 50 },
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
      INSERT INTO products (name, slug, category, ranch, description, details, price, compare_at_price, price_unit, bulk_info, images, sort_order)
      VALUES (${p.name}, ${p.slug}, ${p.category}, ${p.ranch}, ${p.description}, ${p.details}, ${p.price}, ${p.compare_at_price}, ${p.price_unit}, ${p.bulk_info}, ${p.images}, ${p.sort_order})
      ON CONFLICT (slug) DO NOTHING
    `;
  }
}
