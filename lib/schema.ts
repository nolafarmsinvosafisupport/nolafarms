import { SITE } from './constants';

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Nola Farms',
  description: '375-acre large-scale agricultural farm and exotic livestock estate in Laikipia, Kenya.',
  url: SITE.url,
  telephone: SITE.phone,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Laikipia',
    addressRegion: 'Laikipia County',
    addressCountry: 'KE',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: SITE.coordinates.lat,
    longitude: SITE.coordinates.lng,
  },
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
  name: 'About Nola Farms',
  url: `${SITE.url}/about`,
  description: 'The story, mission, and scale of Nola Farms in Laikipia, Kenya.',
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
  name: 'Nola Farms Gallery',
  url: `${SITE.url}/gallery`,
  image: images.map((image) => ({
    '@type': 'ImageObject',
    name: image.name,
    contentUrl: image.contentUrl,
    caption: image.caption,
  })),
});

export const contactPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Contact Nola Farms',
  url: `${SITE.url}/contact`,
  description: 'Contact details, ranch visit enquiries, and directions for Nola Farms in Laikipia, Kenya.',
};
