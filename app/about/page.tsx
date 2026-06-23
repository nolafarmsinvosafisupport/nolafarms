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
    title: 'About Nola Farms | Two Ranches — Oloitoktok & Laikipia, Kenya',
    description:
      'Nola Farms operates two ranches in Kenya — Oloitoktok for livestock, fresh vegetables and fruits; Laikipia for grains. Learn our story of responsible, large-scale farming.',
    keywords: ['about Nola Farms', 'Nola Farms story', 'Oloitoktok farm Kenya', 'Laikipia agricultural estate', 'responsible farming Kenya', 'mixed farming Kenya', 'livestock farm Kenya', 'grain farm Laikipia'],
    path: '/about',
    image: '/images/og/about-og.jpg',
    imageAlt: 'Nola Farms two ranches — Oloitoktok and Laikipia Kenya',
    ogTitle: 'Our Story | Nola Farms — Two Ranches Across Kenya',
    ogDescription: 'Two ranches, one farm. Nola Farms raises exotic livestock and fresh produce in Oloitoktok, and farms wheat and grains at scale in Laikipia.',
  });
}

export default function AboutPage() {
  return (
    <main>
      <JsonLd data={[aboutPageSchema, breadcrumbSchema([{ name: 'Home', url: 'https://nolafarms.co.ke' }, { name: 'About', url: 'https://nolafarms.co.ke/about' }])]} />
      <PageHero
        eyebrow="About Nola Farms"
        title="Two Ranches. One Vision."
        subtitle="A working farm across Oloitoktok and Laikipia — built for scale, land care, and direct connection to buyers."
        image={IMAGES.farmRoad}
        alt="Road through Nola Farms estate Kenya"
      />
      <OurStorySection />
      <section className="bg-brand-dark py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 text-cream-primary md:grid-cols-3 lg:px-8">
          {[
            { value: '375 Acres', label: 'Across two ranches in Kenya' },
            { value: 'Mixed Farming', label: 'Livestock, vegetables, grains & fruits' },
            { value: '2 Ranches', label: 'Oloitoktok & Laikipia County' },
          ].map((item) => (
            <article key={item.value} className="border border-white/10 bg-white/5 p-8">
              <h2 className="font-serif text-4xl">{item.value}</h2>
              <p className="mt-4 text-cream-secondary/75">{item.label}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="bg-cream-secondary py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeader title="What Drives Us." subtitle="Our Values" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { title: 'Responsible Land Use', body: 'We farm with the long term in mind — rotating crops, managing grazing, and maintaining the health of both our Oloitoktok and Laikipia land.' },
              { title: 'Quality Livestock', body: 'Every breed we raise — Brahman, Holstein, Boer, Dorper — is selected for its suitability to Kenyan conditions and the quality of its produce.' },
              { title: 'Direct Relationships', body: 'We sell and source directly. No middlemen. Buyers know where their food and livestock come from, and we know who we\'re serving.' },
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
