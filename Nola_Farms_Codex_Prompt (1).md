# Nola Farms — Codex Scaffolding Prompt
> Hand this file to Codex in VS Code to scaffold the full Nola Farms website project.

---

## Project Overview

Build a **production-ready, SEO-first farm website** for **Nola Farms**, a 375-acre large-scale agricultural operation in Laikipia, Kenya. The farm runs mixed crop farming (wheat and produce) and exotic livestock breeding (cattle and goats).

The site is built on top of an existing cinematic React template (`laikipiaecofarm.tsx`) and must be adapted, extended, and re-branded entirely for Nola Farms. The template's visual language — dark stone backgrounds, warm gold accents, Playfair Display serif headings, Framer Motion animations, and parallax effects — is to be **preserved and elevated**.

The stack is **Next.js 14 (App Router)** with **TypeScript**, **Tailwind CSS**, and **Framer Motion**. SEO must be implemented from the ground up — not as an afterthought.

---

## Tech Stack

```
Framework:     Next.js 14 (App Router)
Language:      TypeScript
Styling:       Tailwind CSS
Animations:    Framer Motion
Icons:         Lucide React
Fonts:         Playfair Display (serif headings) + Inter (body)
Font loading:  next/font/google
Images:        next/image (all images MUST use next/image for SEO & performance)
SEO:           Next.js Metadata API (generateMetadata per page)
Analytics:     Google Analytics 4 via next/script (gtag)
Maps:          Google Maps embed (iframe) on Contact page
Forms:         React Hook Form + client-side validation
```

---

## Project Structure

Scaffold the following folder structure exactly:

```
nola-farms/
├── app/
│   ├── layout.tsx                  # Root layout — fonts, metadata, GA4, nav, footer
│   ├── page.tsx                    # Homepage (/)
│   ├── about/
│   │   └── page.tsx                # About / Our Story
│   ├── products/
│   │   └── page.tsx                # Products & Livestock
│   ├── services/
│   │   └── page.tsx                # Services (ranch visits, tours, wholesale)
│   ├── gallery/
│   │   └── page.tsx                # Photo gallery
│   ├── contact/
│   │   └── page.tsx                # Contact page
│   ├── sitemap.ts                  # Auto-generated XML sitemap
│   └── robots.ts                   # robots.txt rules
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileMenu.tsx
│   ├── ui/
│   │   ├── SectionHeader.tsx       # Reusable brand-leaf accented section header (from template)
│   │   ├── AnimatedCard.tsx        # Reusable motion card
│   │   ├── DustParticles.tsx       # Ambient particle system (from template)
│   │   └── ScrollProgressBar.tsx   # Top scroll progress indicator (from template)
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── FarmStatsSection.tsx
│   │   ├── FeaturedSection.tsx
│   │   └── CTASection.tsx
│   ├── about/
│   │   └── OurStorySection.tsx
│   ├── products/
│   │   └── ProductsGrid.tsx
│   ├── services/
│   │   └── ServicesGrid.tsx
│   ├── gallery/
│   │   └── GalleryGrid.tsx
│   └── contact/
│       ├── ContactForm.tsx
│       └── WhatsAppButton.tsx
├── lib/
│   ├── seo.ts                      # Shared SEO metadata helpers
│   ├── constants.ts                # Site-wide constants (name, phone, location, etc.)
│   └── schema.ts                   # JSON-LD structured data schemas
├── public/
│   ├── images/                     # Placeholder folders for client photos
│   │   ├── hero/
│   │   ├── farm/
│   │   ├── livestock/
│   │   ├── products/
│   │   └── gallery/
│   ├── favicon.ico
│   ├── og-image.jpg                # Open Graph default image (1200x630)
│   └── logo.png                    # Client logo placeholder
├── styles/
│   └── globals.css                 # Tailwind directives + custom scrollbar
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## SEO Implementation — PRIORITY ONE

SEO must be baked into every layer of the build. Do not treat it as a feature — treat it as the foundation.

### 1. Root Metadata (`app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://nolafarms.co.ke'),
  title: {
    default: 'Nola Farms | Large-Scale Farm & Livestock in Laikipia, Kenya',
    template: '%s | Nola Farms'
  },
  description: 'Nola Farms is a 375-acre agricultural estate in Laikipia, Kenya, specialising in crop farming and exotic livestock breeding including cattle and goats. Book ranch visits and explore our farm.',
  keywords: [
    'Nola Farms', 'farm Kenya', 'Laikipia farm', 'exotic livestock Kenya',
    'cattle farm Kenya', 'goat farm Kenya', 'wheat farming Kenya',
    'ranch visits Kenya', 'farm tours Laikipia', 'large scale farming Kenya',
    'agricultural farm Kenya', 'buy livestock Kenya'
  ],
  openGraph: {
    type: 'website',
    locale: 'en_KE',
    siteName: 'Nola Farms',
    title: 'Nola Farms | Large-Scale Farm & Livestock in Laikipia, Kenya',
    description: 'A 375-acre agricultural estate in Laikipia, Kenya. Crop farming, exotic cattle and goat breeds, and farm experiences.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Nola Farms — Laikipia, Kenya' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nola Farms | Laikipia, Kenya',
    description: 'Large-scale farm and exotic livestock in Laikipia, Kenya.',
    images: ['/og-image.jpg']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
  },
  verification: {
    google: 'GOOGLE_SEARCH_CONSOLE_VERIFICATION_TOKEN' // placeholder
  }
};
```

### 2. Per-Page Metadata — Distinct SEO Per Page

**Critical rule:** Every page targets a completely different keyword cluster, search intent, and audience segment. No description, keyword, or title pattern is reused across pages. Google must be able to index each page independently and rank it for different searches.

---

#### `app/page.tsx` — Homepage
**Search intent:** Brand discovery. People searching "Nola Farms" or "large scale farm Laikipia Kenya".
**Target audience:** First-time visitors, potential clients, investors, media.

```typescript
export const metadata: Metadata = {
  title: 'Nola Farms | Large-Scale Agricultural Estate in Laikipia, Kenya',
  description: 'Nola Farms is a 375-acre working estate in Laikipia, Kenya — growing wheat, raising exotic cattle and goat breeds, and welcoming visitors for guided ranch experiences. Rooted in the land.',
  keywords: [
    'Nola Farms', 'Nola Farms Laikipia', 'large scale farm Kenya',
    'agricultural estate Laikipia', 'farm Kenya', 'Laikipia farm Kenya'
  ],
  openGraph: {
    title: 'Nola Farms — 375 Acres of Agriculture & Livestock in Laikipia, Kenya',
    description: 'A working estate growing wheat, raising exotic cattle and goats, and offering guided ranch visits in Laikipia, Kenya.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Nola Farms estate — Laikipia, Kenya' }]
  },
  alternates: { canonical: 'https://nolafarms.co.ke' }
};
```

---

#### `app/about/page.tsx` — Our Story
**Search intent:** Informational. People researching who Nola Farms is before engaging.
**Target audience:** Wholesale buyers doing due diligence, visitors considering a ranch trip, journalists.
**Keyword angle:** Farm history, mission, scale, responsible agriculture.

```typescript
export const metadata: Metadata = {
  title: 'About Nola Farms | Our Story, Mission & 375-Acre Estate',
  description: 'Nola Farms was built on 375 acres of Laikipia highland soil with a vision for large-scale, responsible farming. Learn our story — from wheat fields to exotic livestock, and what drives us.',
  keywords: [
    'about Nola Farms', 'Nola Farms story', 'Laikipia agricultural estate',
    'responsible farming Kenya', 'large scale farming Laikipia',
    'wheat farming Laikipia', 'mixed farming Kenya', 'who is Nola Farms'
  ],
  openGraph: {
    title: 'Our Story | Nola Farms — Built on 375 Acres of Laikipia',
    description: 'From open highland to thriving estate — discover how Nola Farms grows crops, breeds exotic livestock, and operates at scale in Laikipia, Kenya.',
    images: [{ url: '/images/og/about-og.jpg', width: 1200, height: 630, alt: 'Nola Farms fields and livestock — Laikipia Kenya' }]
  },
  alternates: { canonical: 'https://nolafarms.co.ke/about' }
};
```

---

#### `app/products/page.tsx` — Products & Livestock
**Search intent:** Commercial/transactional. People actively looking to buy livestock or source farm produce.
**Target audience:** Livestock buyers, wholesale produce buyers, restaurants, exporters.
**Keyword angle:** Specific breeds, specific crops, buying intent.

```typescript
export const metadata: Metadata = {
  title: 'Farm Products & Exotic Livestock | Nola Farms Laikipia',
  description: 'Buy exotic cattle breeds and goats from Nola Farms — a large-scale livestock and crop producer in Laikipia, Kenya. We grow wheat and farm produce alongside premium livestock breeds available for purchase.',
  keywords: [
    'exotic cattle breeds Kenya', 'buy goats Kenya', 'buy cattle Laikipia',
    'exotic livestock for sale Kenya', 'wheat farm Kenya', 'farm produce Laikipia',
    'exotic breeds Kenya', 'Boran cattle Kenya', 'livestock supplier Kenya',
    'farm products Laikipia', 'buy livestock Kenya', 'wholesale farm produce Kenya'
  ],
  openGraph: {
    title: 'Exotic Livestock & Farm Products — Nola Farms, Laikipia Kenya',
    description: 'Sourcing exotic cattle, goats, wheat, and farm produce from Laikipia? Nola Farms offers quality livestock and produce at scale.',
    images: [{ url: '/images/og/products-og.jpg', width: 1200, height: 630, alt: 'Exotic cattle and goats at Nola Farms, Laikipia Kenya' }]
  },
  alternates: { canonical: 'https://nolafarms.co.ke/products' }
};
```

---

#### `app/services/page.tsx` — Services & Ranch Visits
**Search intent:** Navigational + transactional. People looking to book a farm experience or arrange a farm service.
**Target audience:** Tourists, school groups, agri-tourism visitors, wholesale enquirers.
**Keyword angle:** Ranch visits, farm tours, experiences — action/booking intent.

```typescript
export const metadata: Metadata = {
  title: 'Ranch Visits & Farm Services | Book a Tour at Nola Farms, Laikipia',
  description: 'Visit Nola Farms in Laikipia, Kenya for a guided ranch experience — walk the fields, meet the exotic livestock, and see large-scale farming up close. Enquire about wholesale services and farm tours.',
  keywords: [
    'ranch visit Kenya', 'farm tour Laikipia', 'book farm visit Kenya',
    'agri-tourism Kenya', 'farm experience Laikipia', 'visit a farm Kenya',
    'guided farm tour Kenya', 'wholesale livestock Kenya', 'farm services Laikipia',
    'things to do Laikipia', 'Laikipia farm tours', 'agricultural tourism Kenya'
  ],
  openGraph: {
    title: 'Book a Ranch Visit at Nola Farms — Laikipia, Kenya',
    description: 'Guided farm tours, ranch visits, and wholesale enquiries at Nola Farms, Laikipia. Come experience 375 acres of working agriculture.',
    images: [{ url: '/images/og/services-og.jpg', width: 1200, height: 630, alt: 'Guided ranch visit at Nola Farms, Laikipia Kenya' }]
  },
  alternates: { canonical: 'https://nolafarms.co.ke/services' }
};
```

---

#### `app/gallery/page.tsx` — Gallery
**Search intent:** Visual/discovery. People who found Nola Farms and want to see what it looks like before visiting or buying.
**Target audience:** Prospective visitors, media, buyers doing visual due diligence.
**Keyword angle:** Visual search terms, image-driven discovery, farm photography.

```typescript
export const metadata: Metadata = {
  title: 'Farm Gallery | Photos of Nola Farms — Laikipia, Kenya',
  description: 'See Nola Farms through the lens — 375 acres of highland fields, exotic cattle, goats, wheat crops, and the Laikipia landscape. Photos of our working estate and the animals we raise.',
  keywords: [
    'Nola Farms photos', 'Laikipia farm pictures', 'exotic cattle photos Kenya',
    'farm photography Kenya', 'Laikipia landscape photos', 'goat farm pictures Kenya',
    'wheat farm Kenya photos', 'agricultural estate photos Laikipia',
    'ranch photos Kenya', 'farm animals Kenya photos'
  ],
  openGraph: {
    title: 'Gallery — Inside Nola Farms, Laikipia Kenya',
    description: 'Photos from inside Nola Farms — fields, exotic livestock, highland views, and 375 acres of working agriculture in Laikipia, Kenya.',
    images: [{ url: '/images/og/gallery-og.jpg', width: 1200, height: 630, alt: 'Nola Farms gallery — livestock and fields in Laikipia Kenya' }]
  },
  alternates: { canonical: 'https://nolafarms.co.ke/gallery' }
};
```

---

#### `app/contact/page.tsx` — Contact
**Search intent:** Direct intent. People ready to act — book, buy, call, or visit.
**Target audience:** Buyers, visitors, wholesale enquirers, media — all at decision stage.
**Keyword angle:** Location-specific, action-driven, "how to reach" intent.

```typescript
export const metadata: Metadata = {
  title: 'Contact Nola Farms | Enquiries, Ranch Visits & Directions — Laikipia',
  description: 'Contact Nola Farms in Laikipia, Kenya. Send an enquiry, book a ranch visit, ask about livestock or wholesale, or get directions to the farm. We respond promptly via phone, email, or WhatsApp.',
  keywords: [
    'contact Nola Farms', 'Nola Farms phone number', 'Nola Farms WhatsApp',
    'Nola Farms location', 'how to get to Nola Farms', 'Nola Farms directions',
    'farm enquiry Laikipia', 'book ranch visit Laikipia', 'Nola Farms email',
    'Laikipia farm contact', 'farm contact Kenya', 'livestock enquiry Kenya'
  ],
  openGraph: {
    title: 'Contact Nola Farms — Laikipia, Kenya',
    description: 'Reach Nola Farms by phone, WhatsApp, or email. Book ranch visits, make livestock enquiries, or get directions to our estate in Laikipia.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Nola Farms contact — Laikipia Kenya' }]
  },
  alternates: { canonical: 'https://nolafarms.co.ke/contact' }
};
```

---

#### Additional SEO Rules Applied Across All Pages

**`<h1>` targets per page — Codex must use these exactly:**
```
/           → "Rooted in Laikipia." (brand feel, not keyword-heavy — homepage can afford this)
/about      → "Built on 375 Acres of Laikipia Highland."
/products   → "Exotic Livestock & Farm Produce — Straight from the Source."
/services   → "Come See the Farm for Yourself."
/gallery    → "375 Acres Through the Lens."
/contact    → "Let's Talk. We're Right Here in Laikipia."
```

**Internal linking strategy — Codex must implement:**
- Homepage links to all 5 inner pages via nav + section CTAs
- About page links to Products and Services
- Products page links to Contact with CTA: "Interested in buying? Get in touch."
- Services page links to Contact with CTA: "Ready to book? Send us a message."
- Gallery page links to Services with CTA: "Like what you see? Book a visit."
- Contact page links back to Services and Products in the confirmation message area

> Internal links distribute page authority across the site and help Google understand the relationship between pages. Every page must be reachable within 2 clicks from the homepage.

**Page-specific JSON-LD schemas — inject per page:**
```
/           → LocalBusiness + WebSite schema
/about      → AboutPage schema
/products   → ItemList schema (one ListItem per product/livestock card)
/services   → Service schema (one per service offered)
/gallery    → ImageGallery schema
/contact    → ContactPage schema
```

### 3. Structured Data / JSON-LD (`lib/schema.ts`)

Create and inject the following schemas:

```typescript
// LocalBusiness schema — inject in root layout
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Nola Farms",
  "description": "375-acre large-scale agricultural farm and exotic livestock estate in Laikipia, Kenya.",
  "url": "https://nolafarms.co.ke",
  "telephone": "PLACEHOLDER_PHONE",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Laikipia",
    "addressRegion": "Laikipia County",
    "addressCountry": "KE"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "PLACEHOLDER_LAT",
    "longitude": "PLACEHOLDER_LNG"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    "opens": "08:00",
    "closes": "17:00"
  },
  "image": "https://nolafarms.co.ke/og-image.jpg",
  "sameAs": []
};

// BreadcrumbList schema — inject per page
export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": items.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": item.url
  }))
});
```

### 4. Sitemap (`app/sitemap.ts`)

```typescript
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://nolafarms.co.ke', lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: 'https://nolafarms.co.ke/about', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://nolafarms.co.ke/products', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://nolafarms.co.ke/services', lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: 'https://nolafarms.co.ke/gallery', lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://nolafarms.co.ke/contact', lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
  ];
}
```

### 5. Robots (`app/robots.ts`)

```typescript
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: 'https://nolafarms.co.ke/sitemap.xml',
  };
}
```

### 6. Image SEO Rules (apply everywhere)

- Every `next/image` must have a descriptive, keyword-rich `alt` tag
- Example: `alt="Exotic Boran cattle grazing at Nola Farms, Laikipia Kenya"`
- Never use `alt=""` or `alt="image"` anywhere
- All hero images must have `priority` prop set
- Use `sizes` prop on all images for responsive loading

### 7. Semantic HTML Rules (apply everywhere)

- One `<h1>` per page only — must include primary keyword
- `<h2>` for section headings, `<h3>` for cards/sub-items
- Use `<article>`, `<section>`, `<nav>`, `<main>`, `<aside>`, `<footer>` correctly
- All internal links must use `<Link>` from `next/link`
- External links must have `rel="noopener noreferrer"`

### 8. Performance (Core Web Vitals)

- All images use `next/image` with explicit `width` and `height`
- Fonts loaded via `next/font/google` — no external Google Fonts `<link>` tags
- Framer Motion components wrapped in `lazy` where not above the fold
- No layout shift — define skeleton placeholders for image areas

---

## Brand & Design System

Adapt the template's visual language to Nola Farms. Keep the cinematic feel, replace all Enkare Highlands references. All colours below are extracted directly from the Nola Farms logo.

---

### Colour Palette — Extracted from Nola Farms Logo

```
/* ── PRIMARY GREENS (from logo icon, border ring, and bottom banner) ── */
--color-brand-deep:       #102818   /* Darkest green — outer ring, bottom banner, icon shadows */
--color-brand-dark:       #183020   /* Dark green — barn icon, leaf outlines, primary text on light */
--color-brand-primary:    #1E3C28   /* Mid dark green — main brand green, CTA buttons, nav active */
--color-brand-mid:        #2D4A1E   /* Olive green — secondary buttons, hover states */
--color-brand-leaf:       #486018   /* Warm olive — leaf icon accent, tags, badges */

/* ── CREAM / OFF-WHITE (from logo text background) ── */
--color-cream-primary:    #FAF5F0   /* Primary light background — most used cream */
--color-cream-secondary:  #F5F5EB   /* Slightly cooler cream — alternating sections */
--color-cream-warm:       #FAF5EB   /* Warm cream — cards, floating accents */

/* ── WARM GOLD / AMBER (from logo photography — sunset tones) ── */
--color-gold-light:       #F0D2A5   /* Light gold — subtle highlights, dividers */
--color-gold-mid:         #E6C8AA   /* Mid gold — border accents, card borders */
--color-gold-warm:        #D4A76A   /* Warm gold — CTA hover glow, icon accents */

/* ── NEUTRALS ── */
--color-dark:             #0F1A12   /* Near black with green undertone — hero backgrounds */
--color-text-primary:     #102818   /* Same as brand-deep — all body text on light bg */
--color-text-secondary:   #3D5240   /* Muted dark green — subtitles, captions */
--color-text-muted:       #7A8C7E   /* Soft grey-green — placeholder text, meta */
--color-border:           #D2C8B4   /* Warm grey — card borders, dividers */
--color-border-light:     #EDE8E0   /* Very light — subtle section separators */
```

---

### Tailwind Config — Apply Exactly

```typescript
// tailwind.config.ts
extend: {
  colors: {
    brand: {
      deep:     '#102818',
      dark:     '#183020',
      primary:  '#1E3C28',
      mid:      '#2D4A1E',
      leaf:     '#486018',
    },
    cream: {
      primary:   '#FAF5F0',
      secondary: '#F5F5EB',
      warm:      '#FAF5EB',
    },
    gold: {
      light: '#F0D2A5',
      mid:   '#E6C8AA',
      warm:  '#D4A76A',
    },
    farm: {
      dark:    '#0F1A12',
      text:    '#102818',
      muted:   '#7A8C7E',
      border:  '#D2C8B4',
    }
  },
  fontFamily: {
    serif: ['var(--font-playfair)', 'Georgia', 'serif'],
    sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
  },
}
```

---

### Colour Application Rules — UX Precision

These rules must be followed consistently across every component. No freestyle colour usage.

#### Backgrounds
```
Hero sections:            bg-[#0F1A12] (farm-dark) — deep near-black with green undertone
Dark sections:            bg-brand-deep (#102818)
Mid sections (alt dark):  bg-brand-dark (#183020)
Light sections:           bg-cream-primary (#FAF5F0)
Alternating light:        bg-cream-secondary (#F5F5EB)
Cards on light bg:        bg-cream-warm (#FAF5EB) with border-farm-border
Cards on dark bg:         bg-white/5 with border border-white/10
```

#### Text
```
Headings on light bg:     text-brand-deep (#102818)
Headings on dark bg:      text-cream-primary (#FAF5F0)
Body on light bg:         text-brand-text (#102818) at 80% opacity
Body on dark bg:          text-cream-secondary (#F5F5EB)
Subtitles/captions:       text-farm-muted (#7A8C7E)
Overline labels:          text-brand-leaf (#486018) — uppercase tracking-widest
```

#### Buttons & CTAs
```
Primary CTA (on dark bg):
  bg-brand-primary (#1E3C28)
  text-cream-primary
  hover: bg-brand-mid (#2D4A1E)
  border: none

Secondary CTA (on dark bg):
  bg-transparent
  border border-cream-primary/30
  text-cream-primary
  hover: bg-cream-primary/10 border-cream-primary/60

Primary CTA (on light bg):
  bg-brand-deep (#102818)
  text-cream-primary
  hover: bg-brand-primary (#1E3C28)

Ghost CTA (on light bg):
  bg-transparent
  border border-brand-deep
  text-brand-deep
  hover: bg-brand-deep text-cream-primary
```

#### Accents & Highlights
```
Section overline lines:   bg-brand-leaf (#486018) — the horizontal decorative lines in SectionHeader
Scroll progress bar:      bg-brand-leaf (#486018)
Active nav link:          text-brand-leaf with underline border-brand-leaf
WhatsApp button:          bg-[#25D366] — standard WhatsApp green (do not use brand green here)
Hover glow / warm tone:   gold-warm (#D4A76A) — used sparingly on card hovers
Card border on light:     border-farm-border (#D2C8B4)
Dividers:                 border-[#EDE8E0]
```

#### DustParticles
```
Change particle colour from amber-100/30 to:
bg-brand-leaf/20  (#486018 at 20% opacity)
— keeps the ambient feel but ties to brand palette
```

---

### Section Rhythm — Light / Dark Alternation

Follow this exact pattern for visual breathing room and contrast:

```
/ (Homepage)
  HeroSection          → DARK   bg-[#0F1A12]
  FarmStatsSection     → LIGHT  bg-cream-primary
  FeaturedSection      → DARK   bg-brand-deep
  CTASection           → LIGHT  bg-cream-secondary

/about
  PageHero             → DARK   bg-[#0F1A12]
  OurStorySection      → LIGHT  bg-cream-primary
  StatsRow             → DARK   bg-brand-dark
  ValuesSection        → LIGHT  bg-cream-secondary

/products
  PageHero             → DARK   bg-[#0F1A12]
  CropsGrid            → LIGHT  bg-cream-primary
  LivestockGrid        → DARK   bg-brand-deep
  EnquiryCTA           → LIGHT  bg-cream-secondary

/services
  PageHero             → DARK   bg-[#0F1A12]
  ServicesGrid         → LIGHT  bg-cream-primary
  BookingNote          → DARK   bg-brand-dark

/gallery
  PageHero             → DARK   bg-[#0F1A12]
  GalleryGrid          → DARK   bg-brand-deep  (images pop on dark)
  VisitCTA             → LIGHT  bg-cream-primary

/contact
  PageHero             → DARK   bg-[#0F1A12]
  ContactSection       → LIGHT  bg-cream-primary
  MapSection           → DARK   bg-brand-deep
```

---

### Typography
```
Headings:  Playfair Display — loaded via next/font/google
           Weights: 400 (regular), 500 (medium), italic 400
Body:      Inter — loaded via next/font/google
           Weights: 300, 400, 500

Heading sizes (desktop):
  h1: text-7xl → text-9xl (hero), text-5xl → text-6xl (page heroes)
  h2: text-4xl → text-5xl (section headings)
  h3: text-2xl → text-3xl (card headings)
  overline: text-xs uppercase tracking-[0.2em] text-brand-leaf
```

---

### Motion (preserve from template)
- `DustParticles` — keep, update particle colour to `brand-leaf/20`
- `ScrollProgressBar` — keep, change to `bg-brand-leaf`
- `fadeUp` and `staggerContainer` variants — reuse across all sections
- Parallax on hero — keep
- `whileInView` with `viewport={{ once: true }}` on all sections
- Floating accent card pattern (from AboutSection) — keep, background `bg-cream-warm`

---

## Pages — Detailed Specifications

### `/` — Homepage

Sections in order:
1. **HeroSection** — Full screen, parallax. Headline: `"Rooted in Laikipia."` Subheading: `"375 acres of crops, livestock, and living land."` Two CTAs: `"Explore the Farm"` → `/products` and `"Book a Visit"` → `/services`
2. **FarmStatsSection** — 3 animated stat cards: `375 Acres`, `Mixed Crop & Livestock`, `Laikipia, Kenya`
3. **FeaturedSection** — 3 cards linking to About, Products, Services with farm imagery
4. **CTASection** — Full-width dark section: `"Come See the Farm."` with a button to `/contact`

### `/about` — Our Story

Sections:
1. Page hero with headline: `"Built on the Land."`
2. Two-column layout: left = text (farm history, scale, mission), right = farm image
3. Floating accent card (from template pattern) — a farm stat or quote
4. Team or values section (placeholder — to be filled with client content)

### `/products` — Products & Livestock

Sections:
1. Page hero: `"From the Fields to You."`
2. **Crops grid** — Cards for each crop (wheat, produce — use placeholders). Each card: image, name, short description, season
3. **Livestock grid** — Cards for exotic breeds: Cattle, Goats. Each card: breed name, image, description, enquiry CTA
4. Each card must have semantic `<article>` tags and keyword-rich alt text

### `/services` — Services & Ranch Visits

Sections:
1. Page hero: `"Experience Nola Farms."`
2. Services grid — 3 cards:
   - **Ranch Visits** — guided tours of the farm and livestock
   - **Wholesale & Bulk Orders** — farm produce and livestock
   - **Farm Consultancy** — placeholder, to be confirmed
3. Each service card has a `"Make an Enquiry"` CTA linking to `/contact`
4. Booking note: `"To book a ranch visit, contact us directly via the form or WhatsApp below."`

> Note: Online booking system and payment integration are out of scope for this scaffold — leave clear placeholder components with TODO comments.

### `/gallery` — Farm Gallery

- Masonry-style grid (adapt template's horizontal scroll into a proper responsive grid)
- Use `next/image` for every image
- Placeholder images with descriptive alt text
- Lightbox on click — use a lightweight library or build a simple modal
- Caption support per image (alt text doubles as caption)

### `/contact` — Contact

Sections:
1. Page hero: `"Get in Touch."`
2. **Contact form** — built with React Hook Form:
   - Fields: Full Name, Email, Phone, Subject (dropdown: General Enquiry / Ranch Visit / Livestock / Wholesale / Other), Message
   - Validation on all fields
   - On submit: `mailto:` fallback or fetch to `/api/contact` (scaffold the API route as a placeholder)
3. **WhatsApp CTA button** — prominent, green, links to `https://wa.me/PLACEHOLDER_NUMBER`
4. **Google Maps embed** — iframe placeholder with farm location
5. **Contact details** — Phone, Email, Location (Laikipia County, Kenya)

### API Route — `/app/api/contact/route.ts`

Scaffold a basic contact form handler:
```typescript
// Placeholder — to be connected to email service (Resend / Nodemailer) after client provides email
export async function POST(request: Request) {
  const body = await request.json();
  // TODO: Connect to email service
  console.log('Contact form submission:', body);
  return Response.json({ success: true, message: 'Message received.' });
}
```

---

## Components — Detailed Specs

### `Navbar.tsx`
- Fixed, transparent on top, dark blur on scroll (from template)
- Logo: `NOLA<span style green>FARMS</span>` in Playfair Display
- Nav links: Home, About, Products, Services, Gallery, Contact
- Mobile hamburger with AnimatePresence overlay (from template)
- Active link highlighted with brand-leaf underline

### `Footer.tsx`
- Dark background `bg-farm-dark` (#0F1A12)
- 4 columns: Brand + tagline + social icons | Quick links | Farm info | Contact details
- Copyright line
- All footer links must be `<Link>` for SEO

### `WhatsAppButton.tsx`
- Floating fixed button bottom-right on all pages
- Green circle with WhatsApp icon
- Links to `https://wa.me/PLACEHOLDER` with pre-filled message: `"Hello Nola Farms, I'd like to enquire about..."`
- `aria-label="Chat with Nola Farms on WhatsApp"` for accessibility

### `SectionHeader.tsx`
- Identical to template — brand-leaf overline text (#486018) + large serif heading
- Accept `title`, `subtitle`, `align` props

---

## Constants (`lib/constants.ts`)

```typescript
export const SITE = {
  name: 'Nola Farms',
  tagline: 'Rooted in Laikipia.',
  description: '375-acre agricultural farm and exotic livestock estate in Laikipia, Kenya.',
  url: 'https://nolafarms.co.ke',
  phone: 'PLACEHOLDER_PHONE',
  whatsapp: 'PLACEHOLDER_WHATSAPP_NUMBER',
  email: 'PLACEHOLDER_EMAIL',
  location: 'Laikipia County, Kenya',
  coordinates: { lat: 'PLACEHOLDER', lng: 'PLACEHOLDER' },
  googleAnalyticsId: 'PLACEHOLDER_GA4_ID',
  googleVerification: 'PLACEHOLDER_GSC_TOKEN',
  socialMedia: {
    instagram: '',
    facebook: '',
    twitter: '',
  }
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];
```

---

## Google Analytics 4 Setup

In `app/layout.tsx`, inject GA4 via `next/script`:

```typescript
import Script from 'next/script';

// Inside <body> after children:
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=${SITE.googleAnalyticsId}`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${SITE.googleAnalyticsId}');
  `}
</Script>
```

---

## Placeholder Strategy

Use consistent placeholder patterns so the client's real content can be dropped in cleanly:

```typescript
// Images — use descriptive placeholder
src="/images/hero/nola-farms-hero-placeholder.jpg"
alt="Nola Farms 375-acre estate, Laikipia Kenya — hero image placeholder"

// Text — wrap in a comment
{/* TODO: Replace with client-provided farm description */}

// Phone / WhatsApp
href={`https://wa.me/${SITE.whatsapp}`} // Set SITE.whatsapp in lib/constants.ts

// Booking system
{/* TODO: Booking system to be integrated — pending payment gateway confirmation */}
```

---

## `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' }, // for dev placeholders
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};
module.exports = nextConfig;
```

---

## `tailwind.config.ts` Extensions

> Full colour tokens are defined in the Brand & Design System section above. Apply those exact values here.

```typescript
extend: {
  colors: {
    brand: {
      deep:     '#102818',
      dark:     '#183020',
      primary:  '#1E3C28',
      mid:      '#2D4A1E',
      leaf:     '#486018',
    },
    cream: {
      primary:   '#FAF5F0',
      secondary: '#F5F5EB',
      warm:      '#FAF5EB',
    },
    gold: {
      light: '#F0D2A5',
      mid:   '#E6C8AA',
      warm:  '#D4A76A',
    },
    farm: {
      dark:   '#0F1A12',
      text:   '#102818',
      muted:  '#7A8C7E',
      border: '#D2C8B4',
    }
  },
  fontFamily: {
    serif: ['var(--font-playfair)', 'Georgia', 'serif'],
    sans:  ['var(--font-inter)', 'system-ui', 'sans-serif'],
  },
}
```

---

## Checklist — Codex Must Complete All Of These

- [ ] Full project scaffolded with folder structure above
- [ ] All 6 pages created with correct `generateMetadata`
- [ ] Root layout with fonts, GA4 script, JSON-LD schema, nav, footer
- [ ] `lib/constants.ts` with all placeholders
- [ ] `lib/seo.ts` with shared metadata helper
- [ ] `lib/schema.ts` with LocalBusiness + Breadcrumb schemas
- [ ] `app/sitemap.ts` generating all routes
- [ ] `app/robots.ts` configured
- [ ] All images using `next/image` with descriptive alt text
- [ ] `WhatsAppButton.tsx` floating on all pages
- [ ] Contact form with React Hook Form + validation
- [ ] `/api/contact/route.ts` scaffolded
- [ ] Framer Motion animations ported from template
- [ ] `DustParticles`, `ScrollProgressBar`, `SectionHeader` as reusable components
- [ ] Navbar transparent → blur on scroll, with mobile menu
- [ ] Footer with 4-column layout
- [ ] Dark/light sections alternating as per template pattern
- [ ] All TODO placeholders marked clearly for client content
- [ ] No TypeScript errors on `tsc --noEmit`
- [ ] No ESLint errors

---

## Out of Scope for This Scaffold

- M-Pesa / payment gateway integration
- Online booking system with availability calendar
- CMS or admin dashboard
- Blog / news section
- E-commerce / product purchasing
- Authentication

> All of the above to be scaffolded as clearly marked placeholder sections with TODO comments only.

---

*Prompt prepared by Invosafi Solutions for Nola Farms website build.*
*Last updated: 16 June 2026*
