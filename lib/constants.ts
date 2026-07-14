export const SITE = {
  name: 'Nola Ranches',
  tagline: 'Two Ranches. One Farm.',
  description: '375-acre agricultural operation across two ranches in Oloitoktok and Laikipia, Kenya.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nolaranches.co.ke',
  phone: '0750 958 780',
  whatsapp: '254750958780',
  email: 'nolaranches4@gmail.com',
  location: 'Oloitoktok & Laikipia, Kenya',
  ranches: {
    oloitoktok: { name: 'Oloitoktok Ranch', location: 'Oloitoktok County, Kenya', products: 'Cattle, Goats, Sheep, Pigs, Vegetables, Fruits' },
    laikipia: { name: 'Laikipia Ranch', location: 'Laikipia County, Kenya', products: 'Wheat, Sorghum, Millet, Soya Beans' },
  },
  coordinates: { lat: 'PLACEHOLDER_LAT', lng: 'PLACEHOLDER_LNG' },
  // Set NEXT_PUBLIC_GA4_ID / NEXT_PUBLIC_GSC_TOKEN in Railway once real accounts exist —
  // app/layout.tsx skips loading the analytics script and verification tag until then.
  googleAnalyticsId: process.env.NEXT_PUBLIC_GA4_ID || 'PLACEHOLDER_GA4_ID',
  googleVerification: process.env.NEXT_PUBLIC_GSC_TOKEN || 'PLACEHOLDER_GSC_TOKEN',
  socialMedia: {
    instagram: '',
    facebook: '',
    twitter: '',
  },
};

export const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Products', href: '/products' },
  { label: 'Services', href: '/services' },
  { label: 'Gallery', href: '/gallery' },
  { label: 'Contact', href: '/contact' },
];

export const IMAGES = {
  hero: '/images/hero/landing page farm.jpg',
  wheat: '/images/source/jpeg/wheat.jpeg',
  cattle: '/images/livestock/cow.webp',
  goats: '/images/livestock/goats5.jpeg',
  farmRoad: '/images/farm/farm2.webp',
  produce: '/images/products/fruits/Watermelon/watermelon1.jpeg',
  landscape: '/images/farm/farm3.webp',
};
