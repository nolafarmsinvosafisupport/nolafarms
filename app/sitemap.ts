import type { MetadataRoute } from 'next';

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
