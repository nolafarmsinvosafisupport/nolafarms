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
    title: 'Farm Gallery | Photos of Nola Ranches - Laikipia, Kenya',
    description:
      'See Nola Ranches through the lens - 375 acres of highland fields, exotic cattle, goats, wheat crops, and the Laikipia landscape. Photos of our working estate and the animals we raise.',
    keywords: ['Nola Ranches photos', 'Laikipia farm pictures', 'exotic cattle photos Kenya', 'farm photography Kenya', 'Laikipia landscape photos', 'goat farm pictures Kenya', 'wheat farm Kenya photos', 'agricultural estate photos Laikipia', 'ranch photos Kenya', 'farm animals Kenya photos'],
    path: '/gallery',
    image: '/images/og/gallery-og.jpg',
    imageAlt: 'Nola Ranches gallery - livestock and fields in Laikipia Kenya',
    ogTitle: 'Gallery - Inside Nola Ranches, Laikipia Kenya',
    ogDescription: 'Photos from inside Nola Ranches - fields, exotic livestock, highland views, and 375 acres of working agriculture in Laikipia, Kenya.',
  });
}

export default function GalleryPage() {
  return (
    <main>
      <JsonLd data={[imageGallerySchema(galleryImages.map((image) => ({ name: image.caption, contentUrl: image.src, caption: image.caption }))), breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Gallery', url: `${SITE.url}/gallery` }])]} />
      <PageHero
        eyebrow="Farm Gallery"
        title="375 Acres Through the Lens."
        subtitle="A visual look at the land, fields, animals, and working rhythms of Nola Ranches."
        image={IMAGES.wheat}
        alt="Nola Ranches wheat fields and livestock gallery in Laikipia Kenya"
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
