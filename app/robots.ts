import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private / transactional routes that should never appear in search results. The public
      // marketing and product pages stay crawlable.
      disallow: ['/api/', '/admin', '/account', '/cart', '/checkout', '/order-confirmed', '/booking-confirmed'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
