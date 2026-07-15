import type { Metadata } from 'next';
import Link from 'next/link';
import { GalleryGrid } from '@/components/gallery/GalleryGrid';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { IMAGES, SITE } from '@/lib/constants';
import { galleryImages } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, imageGallerySchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Livestock Gallery — Cattle, Goats, Sheep & Pigs',
    description:
      'See the livestock at Nola Ranches — Boran, Girolando and Holstein cattle, Boer and Galla goats, Dorper sheep, and our pigs, across our Oloitoktok and Laikipia ranches in Kenya.',
    keywords: ['Nola Ranches photos', 'cattle photos Kenya', 'goat photos Kenya', 'pig farm photos Kenya', 'Dorper sheep Kenya', 'livestock photos Kenya', 'breeding stock Kenya', 'Oloitoktok livestock', 'Laikipia ranch photos'],
    path: '/gallery',
    image: '/images/og/gallery-og.jpg',
    imageAlt: 'Nola Ranches livestock gallery — cattle, goats, sheep and pigs in Kenya',
    ogTitle: 'Gallery — The Livestock of Nola Ranches, Kenya',
    ogDescription: 'Photos of the cattle, goats, sheep and pigs raised at Nola Ranches across Oloitoktok and Laikipia, Kenya.',
  });
}

export default function GalleryPage() {
  return (
    <main>
      <JsonLd data={[imageGallerySchema(galleryImages.map((image) => ({ name: image.caption, contentUrl: image.src, caption: image.caption }))), breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Gallery', url: `${SITE.url}/gallery` }])]} />
      <PageHero
        eyebrow="Livestock Gallery"
        title="Our Livestock Through the Lens."
        subtitle="A visual look at the cattle, goats, sheep and pigs of Nola Ranches, and the ranches they're raised on."
        image={IMAGES.cattle}
        alt="Cattle at Nola Ranches, Kenya"
      />
      <GalleryGrid />
      <section className="bg-cream-primary section-y-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="font-serif text-5xl text-brand-deep">Like what you see? Book a visit.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-brand-deep/75">Experience the farm in person with a guided ranch visit.</p>
          <Link href="/services" className="mt-8 inline-flex bg-brand-deep px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary">
            View Ranch Visits
          </Link>
        </div>
      </section>
    </main>
  );
}
