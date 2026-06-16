import type { Metadata } from 'next';
import { CTASection } from '@/components/home/CTASection';
import { FarmStatsSection } from '@/components/home/FarmStatsSection';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { HeroSection } from '@/components/home/HeroSection';
import { JsonLd } from '@/components/ui/JsonLd';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, websiteSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Nola Farms | Large-Scale Agricultural Estate in Laikipia, Kenya',
    description:
      'Nola Farms is a 375-acre working estate in Laikipia, Kenya - growing wheat, raising exotic cattle and goat breeds, and welcoming visitors for guided ranch experiences. Rooted in the land.',
    keywords: ['Nola Farms', 'Nola Farms Laikipia', 'large scale farm Kenya', 'agricultural estate Laikipia', 'farm Kenya', 'Laikipia farm Kenya'],
    imageAlt: 'Nola Farms estate - Laikipia, Kenya',
    ogTitle: 'Nola Farms - 375 Acres of Agriculture & Livestock in Laikipia, Kenya',
    ogDescription: 'A working estate growing wheat, raising exotic cattle and goats, and offering guided ranch visits in Laikipia, Kenya.',
  });
}

export default function HomePage() {
  return (
    <main>
      <JsonLd data={[websiteSchema, breadcrumbSchema([{ name: 'Home', url: 'https://nolafarms.co.ke' }])]} />
      <HeroSection />
      <FarmStatsSection />
      <FeaturedSection />
      <CTASection />
    </main>
  );
}
