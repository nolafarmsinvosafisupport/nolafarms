import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  return [
    { url: base, lastModified: new Date(), changeFrequency: 'monthly', priority: 1 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/products`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${base}/gallery`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.7 },
  ];
}
