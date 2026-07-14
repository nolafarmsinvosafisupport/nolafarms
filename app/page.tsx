import type { Metadata } from 'next';
import { CTASection } from '@/components/home/CTASection';
import { FarmStatsSection } from '@/components/home/FarmStatsSection';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { HeroSection } from '@/components/home/HeroSection';
import { ProductBannerSection } from '@/components/home/ProductBannerSection';
import { JsonLd } from '@/components/ui/JsonLd';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, websiteSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Nola Ranches | Large-Scale Agricultural Estate in Laikipia, Kenya',
    description:
      'Nola Ranches is a 375-acre working estate in Laikipia, Kenya - growing wheat, raising exotic cattle and goat breeds, and welcoming visitors for guided ranch experiences. Rooted in the land.',
    keywords: ['Nola Ranches', 'Nola Ranches Laikipia', 'large scale farm Kenya', 'agricultural estate Laikipia', 'farm Kenya', 'Laikipia farm Kenya'],
    imageAlt: 'Nola Ranches estate - Laikipia, Kenya',
    ogTitle: 'Nola Ranches - 375 Acres of Agriculture & Livestock in Laikipia, Kenya',
    ogDescription: 'A working estate growing wheat, raising exotic cattle and goats, and offering guided ranch visits in Laikipia, Kenya.',
  });
}

export default function HomePage() {
  return (
    <main>
      <JsonLd data={[websiteSchema, breadcrumbSchema([{ name: 'Home', url: SITE.url }])]} />
      <HeroSection />
      <ProductBannerSection />
      <FarmStatsSection />
      <FeaturedSection />
      <CTASection />
    </main>
  );
}
