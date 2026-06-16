import type { Metadata } from 'next';
import { SITE } from './constants';

type SeoInput = {
  title: string;
  description: string;
  keywords: string[];
  path?: string;
  image?: string;
  imageAlt: string;
  ogTitle?: string;
  ogDescription?: string;
};

export function pageMetadata({
  title,
  description,
  keywords,
  path = '',
  image = '/og-image.jpg',
  imageAlt,
  ogTitle = title,
  ogDescription = description,
}: SeoInput): Metadata {
  const canonical = `${SITE.url}${path}`;

  return {
    title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    alternates: { canonical },
  };
}
