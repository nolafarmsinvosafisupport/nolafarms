import { SITE } from './constants';

// Emit geo only when real coordinates exist — the constants ship with PLACEHOLDER_* values, and
// invalid GeoCoordinates in structured data is worse than none.
const hasRealCoordinates =
  !SITE.coordinates.lat.startsWith('PLACEHOLDER') && !SITE.coordinates.lng.startsWith('PLACEHOLDER');

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Nola Ranches',
  description: 'Quality livestock and trusted genetics — cattle, goats, sheep and pigs — raised at Nola Ranches in Oloitoktok and Laikipia, Kenya. Vaccinated, dewormed and farm-ready.',
  url: SITE.url,
  telephone: SITE.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Laikipia',
    addressRegion: 'Laikipia County',
    addressCountry: 'KE',
  },
  ...(hasRealCoordinates && {
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.coordinates.lat,
      longitude: SITE.coordinates.lng,
    },
  }),
  openingHoursSpecification: {
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    opens: '08:00',
    closes: '17:00',
  },
  image: `${SITE.url}/og-image.jpg`,
  sameAs: Object.values(SITE.socialMedia).filter(Boolean),
};

export const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE.name,
  url: SITE.url,
  description: SITE.description,
};

export const breadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const aboutPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Nola Ranches',
  url: `${SITE.url}/about`,
  description: 'The story, mission, and scale of Nola Ranches in Laikipia, Kenya.',
};

export const itemListSchema = (items: { name: string; description: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    item: {
      '@type': 'Product',
      name: item.name,
      description: item.description,
      url: item.url,
    },
  })),
});

export const serviceSchema = (service: { name: string; description: string }) => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: service.name,
  description: service.description,
  areaServed: 'Laikipia County, Kenya',
  provider: {
    '@type': 'LocalBusiness',
    name: SITE.name,
    url: SITE.url,
  },
});

export const imageGallerySchema = (images: { name: string; contentUrl: string; caption: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ImageGallery',
  name: 'Nola Ranches Gallery',
  url: `${SITE.url}/gallery`,
  image: images.map((image) => ({
    '@type': 'ImageObject',
    name: image.name,
    contentUrl: image.contentUrl,
    caption: image.caption,
  })),
});

export const productJsonLd = (product: {
  name: string;
  slug: string;
  description: string | null;
  images: string[];
  price: string | null;
  available: boolean;
}) => {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? `${product.name} from Nola Ranches, Kenya.`,
    // Product images are absolute R2 URLs after the image migration; only legacy /public paths are
    // relative. Prefixing SITE.url unconditionally produced doubled URLs
    // (https://nolaranches.co.kehttps://images…), which broke Product rich results on every page.
    image: product.images.map((img) => (/^https?:\/\//.test(img) ? img : `${SITE.url}${img}`)),
    url: `${SITE.url}/products/${product.slug}`,
  };
  // Only attach Offer/price rich-snippet data when a price actually exists —
  // omitting it for "Contact for Price" products avoids showing a misleading KES 0.
  if (product.price) {
    data.offers = {
      '@type': 'Offer',
      priceCurrency: 'KES',
      price: product.price,
      availability: product.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: `${SITE.url}/products/${product.slug}`,
    };
  }
  return data;
};

export const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Nola Ranches',
  url: `${SITE.url}/contact`,
  description: 'Contact details, ranch visit enquiries, and directions for Nola Ranches in Laikipia, Kenya.',
};
