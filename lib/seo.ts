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
  // When true, the title bypasses the root "%s | Nola Ranches" template. Used for the homepage,
  // whose title already leads with the brand — without this it renders "Nola Ranches … | Nola
  // Ranches". Every other page passes a topic-only title and lets the template add the brand once.
  titleAbsolute?: boolean;
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
  titleAbsolute = false,
}: SeoInput): Metadata {
  const canonical = `${SITE.url}${path}`;

  return {
    title: titleAbsolute ? { absolute: title } : title,
    description,
    keywords,
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: image, width: 1200, height: 630, alt: imageAlt }],
    },
    // Without this, every page inherits the root layout's single generic Twitter card and the
    // page-specific OG title/description never reach Twitter/X. summary_large_image mirrors OG.
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [image],
    },
    alternates: { canonical },
  };
}
