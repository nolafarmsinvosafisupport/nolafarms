import type { Metadata } from 'next';
import Link from 'next/link';
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
    title: 'Ranch Visits & Farm Services | Nola Farms — Oloitoktok & Laikipia',
    description:
      'Visit Nola Farms at our Oloitoktok or Laikipia ranch. Walk the fields, meet the exotic livestock, and experience working agriculture. Enquire about wholesale services and farm tours.',
    keywords: ['ranch visit Kenya', 'farm tour Oloitoktok', 'farm tour Laikipia', 'book farm visit Kenya', 'agri-tourism Kenya', 'guided farm tour Kenya', 'wholesale livestock Kenya', 'agricultural tourism Kenya'],
    path: '/services',
    image: '/images/og/services-og.jpg',
    imageAlt: 'Guided ranch visit at Nola Farms, Kenya',
    ogTitle: 'Book a Ranch Visit at Nola Farms — Oloitoktok & Laikipia',
    ogDescription: 'Guided farm tours at two ranches — Oloitoktok for livestock and produce, Laikipia for grains. Come experience working agriculture at Nola Farms.',
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
        alt="Guided ranch visit landscape at Nola Farms Kenya"
      />
      <ServicesGrid />
      <section className="bg-cream-secondary py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Book a Ranch Visit</p>
            <h2 className="font-serif text-5xl leading-tight text-brand-deep">Request a Guided Farm Tour.</h2>
            <p className="mt-6 leading-8 text-brand-deep/75">
              Submit your preferred date, visit purpose, and group size. Every request is reviewed by the farm team before confirmation.
            </p>
          </div>
          <BookingForm />
        </div>
      </section>
      <section className="bg-brand-dark py-24 text-cream-primary">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Booking Note</p>
          <h2 className="font-serif text-5xl">Ready to book? Send us a message.</h2>
          <p className="mt-5 max-w-2xl leading-8 text-cream-secondary/75">
            To book a ranch visit, contact us directly via the form or WhatsApp below.
          </p>
          {/* TODO: Booking system to be integrated - pending payment gateway confirmation */}
          <Link href="/contact" className="mt-8 inline-flex bg-brand-primary px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-mid">
            Send an Enquiry
          </Link>
        </div>
      </section>
    </main>
  );
}
