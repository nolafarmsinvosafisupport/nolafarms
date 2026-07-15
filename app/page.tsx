import type { Metadata } from 'next';
import { CTASection } from '@/components/home/CTASection';
import { FarmStatsSection } from '@/components/home/FarmStatsSection';
import { FeaturedSection } from '@/components/home/FeaturedSection';
import { HeroSection } from '@/components/home/HeroSection';
import { HighDemandSection } from '@/components/home/HighDemandSection';
import { JsonLd } from '@/components/ui/JsonLd';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, websiteSchema } from '@/lib/schema';

// The homepage reads products from the database now (HighDemandSection), and this route has no
// dynamic segments — so Next.js would try to PRERENDER it during `next build`. That fails on
// Railway, because postgres.railway.internal only resolves at runtime inside the private network:
// the build dies with `getaddrinfo ENOTFOUND postgres.railway.internal`. Exactly the reason
// /products is already force-dynamic. Rendering per request costs almost nothing here — the query
// is wrapped in unstable_cache (5 min) and Cloudflare caches "/" at the edge for an hour.
export const dynamic = 'force-dynamic';

export function generateMetadata(): Metadata {
  return pageMetadata({
    // Absolute: the homepage title already leads with the brand, so it bypasses the
    // "%s | Nola Ranches" template instead of doubling it.
    title: 'Nola Ranches | Quality Livestock & Trusted Genetics in Kenya',
    titleAbsolute: true,
    description:
      'Buy quality livestock from Nola Ranches, Kenya — Boran, Girolando and Holstein cattle, Boer and Galla goats, Dorper sheep, and Large White, Landrace, Duroc and Pietrain pigs. Vaccinated, dewormed and farm-ready, with trusted genetics.',
    keywords: ['Nola Ranches', 'livestock for sale Kenya', 'buy cattle Kenya', 'buy goats Kenya', 'buy pigs Kenya', 'sheep for sale Kenya', 'breeding stock Kenya', 'boar services Kenya'],
    imageAlt: 'Nola Ranches livestock — cattle, goats, sheep and pigs in Kenya',
    ogTitle: 'Nola Ranches — Quality Livestock & Trusted Genetics, Kenya',
    ogDescription: 'Cattle, goats, sheep and pigs raised in Oloitoktok and Laikipia, Kenya. Vaccinated, dewormed and farm-ready — with the genetics buyers trust.',
  });
}

export default function HomePage() {
  return (
    <main>
      <JsonLd data={[websiteSchema, breadcrumbSchema([{ name: 'Home', url: SITE.url }])]} />
      <HeroSection />
      <HighDemandSection />
      <FarmStatsSection />
      <FeaturedSection />
      <CTASection />
    </main>
  );
}
