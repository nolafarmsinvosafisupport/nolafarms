import type { Metadata } from 'next';
import Link from 'next/link';
import { OurStorySection } from '@/components/about/OurStorySection';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { aboutPageSchema, breadcrumbSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'About — Livestock & Genetics Across Two Ranches in Kenya',
    description:
      'Nola Ranches raises cattle, goats, sheep and pigs with trusted genetics at our Oloitoktok ranch, and also farms grain at scale in Laikipia. Learn our story of responsible, quality-first livestock farming.',
    keywords: ['about Nola Ranches', 'Nola Ranches story', 'livestock farm Kenya', 'cattle breeder Kenya', 'Oloitoktok livestock', 'Laikipia ranch', 'responsible livestock farming Kenya', 'breeding stock Kenya'],
    path: '/about',
    image: '/images/og/about-og.jpg',
    imageAlt: 'Nola Ranches livestock across two ranches — Oloitoktok and Laikipia Kenya',
    ogTitle: 'Our Story — Quality Livestock & Trusted Genetics | Nola Ranches',
    ogDescription: 'Nola Ranches raises cattle, goats, sheep and pigs with trusted genetics in Oloitoktok, and farms grain at scale in Laikipia, Kenya.',
  });
}

export default function AboutPage() {
  return (
    <main>
      <JsonLd data={[aboutPageSchema, breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'About', url: `${SITE.url}/about` }])]} />
      <PageHero
        eyebrow="About Nola Ranches"
        title="Quality Livestock. Trusted Genetics."
        subtitle="A livestock ranch across Oloitoktok and Laikipia — raising cattle, goats, sheep and pigs, and connecting buyers directly to the source."
        image="/images/hero/hero-cattle.webp"
        alt="Cattle at Nola Ranches, Kenya"
      />
      <OurStorySection />
      <section className="bg-brand-dark section-y-sm">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 text-cream-primary md:grid-cols-3 lg:px-8">
          {[
            { value: '12+ Breeds', label: 'Cattle, goats, sheep & pigs' },
            { value: 'Farm-Ready', label: 'Vaccinated, dewormed & vet-checked' },
            { value: '2 Ranches', label: 'Oloitoktok livestock · Laikipia grain' },
          ].map((item) => (
            <article key={item.value} className="border border-white/10 bg-white/5 p-8">
              <h2 className="font-serif text-4xl">{item.value}</h2>
              <p className="mt-4 text-cream-secondary/75">{item.label}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-cream-secondary section-y-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="What Drives Us." subtitle="Our Values" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Trusted Genetics', body: 'Every breed we raise — Boran, Girolando, Holstein, Boer, Galla, Dorper, and our pigs — is selected for its genetics, growth and suitability to Kenyan conditions.' },
              { title: 'Healthy, Farm-Ready Stock', body: 'Every animal is vaccinated, dewormed, vet-checked and farm-recorded before it leaves the ranch, so buyers get healthy stock they can rely on.' },
              { title: 'Direct Relationships', body: 'We sell directly. No middlemen. Buyers know exactly where their livestock comes from and how it was raised, and we know who we\'re serving.' },
            ].map((value) => (
              <article key={value.title} className="border border-farm-border bg-cream-warm p-7">
                <h3 className="font-serif text-2xl text-brand-deep">{value.title}</h3>
                <p className="mt-4 leading-7 text-brand-deep/75">{value.body}</p>
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
