import type { Metadata } from 'next';
import Link from 'next/link';
import { OurStorySection } from '@/components/about/OurStorySection';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { IMAGES } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { aboutPageSchema, breadcrumbSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'About Nola Farms | Our Story, Mission & 375-Acre Estate',
    description:
      'Nola Farms was built on 375 acres of Laikipia highland soil with a vision for large-scale, responsible farming. Learn our story - from wheat fields to exotic livestock, and what drives us.',
    keywords: ['about Nola Farms', 'Nola Farms story', 'Laikipia agricultural estate', 'responsible farming Kenya', 'large scale farming Laikipia', 'wheat farming Laikipia', 'mixed farming Kenya', 'who is Nola Farms'],
    path: '/about',
    image: '/images/og/about-og.jpg',
    imageAlt: 'Nola Farms fields and livestock - Laikipia Kenya',
    ogTitle: 'Our Story | Nola Farms - Built on 375 Acres of Laikipia',
    ogDescription: 'From open highland to thriving estate - discover how Nola Farms grows crops, breeds exotic livestock, and operates at scale in Laikipia, Kenya.',
  });
}

export default function AboutPage() {
  return (
    <main>
      <JsonLd data={[aboutPageSchema, breadcrumbSchema([{ name: 'Home', url: 'https://nolafarms.co.ke' }, { name: 'About', url: 'https://nolafarms.co.ke/about' }])]} />
      <PageHero
        eyebrow="About Nola Farms"
        title="Built on 375 Acres of Laikipia Highland."
        subtitle="A working farm with a clear sense of scale, place, and responsibility."
        image={IMAGES.farmRoad}
        alt="Road through Nola Farms 375-acre estate in Laikipia Kenya"
      />
      <OurStorySection />
      <section className="bg-brand-dark py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 text-cream-primary md:grid-cols-3 lg:px-8">
          {['375 acres', 'Mixed farming', 'Laikipia County'].map((item) => (
            <article key={item} className="border border-white/10 bg-white/5 p-8">
              <h2 className="font-serif text-4xl">{item}</h2>
              <p className="mt-4 text-cream-secondary/75">A core part of the Nola Farms operating story.</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-cream-secondary py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="Values Waiting for Client Detail." subtitle="Values" />
          <div className="grid gap-6 md:grid-cols-3">
            {['Responsible land use', 'Quality livestock', 'Direct relationships'].map((value) => (
              <article key={value} className="border border-farm-border bg-cream-warm p-7">
                <h3 className="font-serif text-2xl text-brand-deep">{value}</h3>
                <p className="mt-4 leading-7 text-brand-deep/75">{/* TODO: Replace with client-approved values copy */}Placeholder copy for client content.</p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/products" className="bg-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary">Products</Link>
            <Link href="/services" className="border border-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-brand-deep hover:text-cream-primary">Services</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
