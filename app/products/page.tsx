import type { Metadata } from 'next';
import Link from 'next/link';
import { CropsGrid, LivestockGrid } from '@/components/products/ProductsGrid';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { IMAGES, SITE } from '@/lib/constants';
import { crops, livestock } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, itemListSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Farm Products & Exotic Livestock | Nola Farms Laikipia',
    description:
      'Buy exotic cattle breeds and goats from Nola Farms - a large-scale livestock and crop producer in Laikipia, Kenya. We grow wheat and farm produce alongside premium livestock breeds available for purchase.',
    keywords: ['exotic cattle breeds Kenya', 'buy goats Kenya', 'buy cattle Laikipia', 'exotic livestock for sale Kenya', 'wheat farm Kenya', 'farm produce Laikipia', 'exotic breeds Kenya', 'Boran cattle Kenya', 'livestock supplier Kenya', 'farm products Laikipia', 'buy livestock Kenya', 'wholesale farm produce Kenya'],
    path: '/products',
    image: '/images/og/products-og.jpg',
    imageAlt: 'Exotic cattle and goats at Nola Farms, Laikipia Kenya',
    ogTitle: 'Exotic Livestock & Farm Products - Nola Farms, Laikipia Kenya',
    ogDescription: 'Sourcing exotic cattle, goats, wheat, and farm produce from Laikipia? Nola Farms offers quality livestock and produce at scale.',
  });
}

export default function ProductsPage() {
  const items = [...crops, ...livestock].map((item) => ({ name: item.name, description: item.description, url: `${SITE.url}/products` }));

  return (
    <main>
      <JsonLd data={[itemListSchema(items), breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Products', url: `${SITE.url}/products` }])]} />
      <PageHero
        eyebrow="Products & Livestock"
        title={<>Exotic Livestock & Farm Produce &mdash; Straight from the Source.</>}
        subtitle="Wheat, seasonal produce, cattle, and goats from a large-scale Laikipia estate."
        image={IMAGES.cattle}
        alt="Exotic cattle and farm produce at Nola Farms Laikipia Kenya"
      />
      <CropsGrid />
      <LivestockGrid />
      <section className="bg-cream-secondary py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="font-serif text-5xl text-brand-deep">Interested in buying? Get in touch.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-brand-deep/75">Tell us what you are sourcing, the scale of your enquiry, and when you need it.</p>
          <Link href="/contact" className="mt-8 inline-flex bg-brand-deep px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary">
            Contact Sales
          </Link>
        </div>
      </section>
    </main>
  );
}
