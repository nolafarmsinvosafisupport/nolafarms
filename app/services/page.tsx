import type { Metadata } from 'next';
import { BookingForm } from '@/components/services/BookingForm';
import { ServicesGrid } from '@/components/services/ServicesGrid';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { IMAGES, SITE } from '@/lib/constants';
import { services } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, serviceSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Ranch Visits & Farm Services | Nola Ranches — Oloitoktok & Laikipia',
    description:
      'Visit Nola Ranches at our Oloitoktok or Laikipia ranch. Walk the fields, meet the exotic livestock, and experience working agriculture. Enquire about wholesale services and farm tours.',
    keywords: ['ranch visit Kenya', 'farm tour Oloitoktok', 'farm tour Laikipia', 'book farm visit Kenya', 'agri-tourism Kenya', 'guided farm tour Kenya', 'wholesale livestock Kenya', 'agricultural tourism Kenya'],
    path: '/services',
    image: '/images/og/services-og.jpg',
    imageAlt: 'Guided ranch visit at Nola Ranches, Kenya',
    ogTitle: 'Book a Ranch Visit at Nola Ranches — Oloitoktok & Laikipia',
    ogDescription: 'Guided farm tours at two ranches — Oloitoktok for livestock and produce, Laikipia for grains. Come experience working agriculture at Nola Ranches.',
  });
}

export default function ServicesPage() {
  return (
    <main>
      <JsonLd data={[...services.map(serviceSchema), breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Services', url: `${SITE.url}/services` }])]} />
      <PageHero
        eyebrow="Ranch Visits & Services"
        title="Come See the Farm for Yourself."
        subtitle="Guided visits, wholesale enquiries, and practical farm conversations across our Oloitoktok and Laikipia ranches."
        image={IMAGES.landscape}
        alt="Guided ranch visit landscape at Nola Ranches Kenya"
      />
      <ServicesGrid />
      <section className="bg-cream-secondary section-y">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Book a Ranch Visit</p>
            <h2 className="font-serif text-5xl leading-tight text-brand-deep">Request a Guided Farm Tour.</h2>
            <p className="mt-6 leading-8 text-brand-deep/75">
              Book a farm visit to view Boran, Holstein, and Girolando cattle.
            </p>
          </div>
          <BookingForm />
        </div>
      </section>
      <section className="bg-brand-dark section-y-md text-cream-primary">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Something Else?</p>
          <h2 className="font-serif text-5xl">Have a Different Question?</h2>
          <p className="mt-5 max-w-2xl leading-8 text-cream-secondary/75">
            For wholesale orders, partnerships, or anything not covered above, send us a message and we&rsquo;ll get back to you quickly.
          </p>
          <a
            href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent('Hello, I have a question about Nola Ranches services.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-flex bg-brand-primary px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-mid"
          >
            Send a Message
          </a>
        </div>
      </section>
    </main>
  );
}
