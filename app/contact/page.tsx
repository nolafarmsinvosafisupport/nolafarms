import type { Metadata } from 'next';
import { Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { ContactForm } from '@/components/contact/ContactForm';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { IMAGES, SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema, contactPageSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Contact Nola Farms | Enquiries, Ranch Visits & Directions - Laikipia',
    description:
      'Contact Nola Farms in Laikipia, Kenya. Send an enquiry, book a ranch visit, ask about livestock or wholesale, or get directions to the farm. We respond promptly via phone, email, or WhatsApp.',
    keywords: ['contact Nola Farms', 'Nola Farms phone number', 'Nola Farms WhatsApp', 'Nola Farms location', 'how to get to Nola Farms', 'Nola Farms directions', 'farm enquiry Laikipia', 'book ranch visit Laikipia', 'Nola Farms email', 'Laikipia farm contact', 'farm contact Kenya', 'livestock enquiry Kenya'],
    path: '/contact',
    imageAlt: 'Nola Farms contact - Laikipia Kenya',
    ogTitle: 'Contact Nola Farms - Laikipia, Kenya',
    ogDescription: 'Reach Nola Farms by phone, WhatsApp, or email. Book ranch visits, make livestock enquiries, or get directions to our estate in Laikipia.',
  });
}

export default function ContactPage() {
  return (
    <main>
      <JsonLd data={[contactPageSchema, breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Contact', url: `${SITE.url}/contact` }])]} />
      <PageHero
        eyebrow="Contact Nola Farms"
        title="Let's Talk. We're Right Here in Laikipia."
        subtitle="Send an enquiry, book a ranch visit, ask about livestock, or get directions to the farm."
        image={IMAGES.farmRoad}
        alt="Directions road to Nola Farms in Laikipia County Kenya"
      />
      <section className="bg-cream-primary py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <h2 className="mb-8 font-serif text-5xl text-brand-deep">Send an Enquiry</h2>
            <ContactForm />
          </div>
          <aside className="border border-farm-border bg-cream-warm p-8">
            <h3 className="font-serif text-3xl text-brand-deep">Contact Details</h3>
            <ul className="mt-7 space-y-5 text-brand-deep/75">
              <li className="flex gap-3"><Phone className="mt-1 text-brand-leaf" size={18} aria-hidden="true" />{SITE.phone}</li>
              <li className="flex gap-3"><Mail className="mt-1 text-brand-leaf" size={18} aria-hidden="true" />{SITE.email}</li>
              <li className="flex gap-3"><MapPin className="mt-1 text-brand-leaf" size={18} aria-hidden="true" />{SITE.location}</li>
            </ul>
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex bg-[#25D366] px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white">
              WhatsApp Nola Farms
            </a>
            <div className="mt-8 border-t border-farm-border pt-6 text-sm leading-7 text-brand-deep/70">
              Confirmation links: <Link className="text-brand-leaf" href="/services">ranch visits</Link> and <Link className="text-brand-leaf" href="/products">products and livestock</Link>.
            </div>
          </aside>
        </div>
      </section>
      <section className="bg-brand-deep py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-8 font-serif text-5xl text-cream-primary">Find Us in Laikipia</h2>
          <div className="aspect-[16/7] min-h-[360px] overflow-hidden border border-white/10 bg-white/5">
            <iframe
              title="Google Maps placeholder for Nola Farms location in Laikipia County Kenya"
              src="https://www.google.com/maps?q=Laikipia%20County%20Kenya&output=embed"
              className="h-full w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
