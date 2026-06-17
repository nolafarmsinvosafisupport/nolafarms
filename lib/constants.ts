export const SITE = {
  name: 'Nola Farms',
  tagline: 'Rooted in Laikipia.',
  description: '375-acre agricultural farm and exotic livestock estate in Laikipia, Kenya.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://nolafarms-production.up.railway.app',
  phone: 'PLACEHOLDER_PHONE',
  whatsapp: 'PLACEHOLDER_WHATSAPP_NUMBER',
  email: 'PLACEHOLDER_EMAIL',
  location: 'Laikipia County, Kenya',
  coordinates: { lat: 'PLACEHOLDER_LAT', lng: 'PLACEHOLDER_LNG' },
  googleAnalyticsId: 'PLACEHOLDER_GA4_ID',
  googleVerification: 'PLACEHOLDER_GSC_TOKEN',
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
  hero: '/images/hero/landing%20page%20farm.jpg',
  wheat: '/images/source/jpeg/wheat.jpeg',
  cattle: '/images/livestock/cow.webp',
  goats: '/images/livestock/goats5.jpeg',
  farmRoad: '/images/farm/farm2.webp',
  produce: '/images/products/watermelon1.jpeg',
  landscape: '/images/farm/farm3.webp',
};
