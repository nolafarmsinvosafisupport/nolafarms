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
    title: 'Contact — Livestock Enquiries, Ranch Visits & Directions',
    description:
      'Contact Nola Ranches in Kenya. Make a livestock enquiry, ask about breeding stock or bulk orders, book a ranch visit, or get directions. We respond promptly by phone, WhatsApp or email.',
    keywords: ['contact Nola Ranches', 'Nola Ranches phone number', 'Nola Ranches WhatsApp', 'Nola Ranches location', 'buy livestock Kenya contact', 'breeding stock enquiry Kenya', 'Nola Ranches directions', 'book ranch visit Kenya', 'Nola Ranches email', 'livestock enquiry Kenya'],
    path: '/contact',
    imageAlt: 'Nola Ranches contact - Oloitoktok & Laikipia, Kenya',
    ogTitle: 'Contact Nola Ranches — Livestock Enquiries, Kenya',
    ogDescription: 'Reach Nola Ranches by phone, WhatsApp or email. Livestock enquiries, breeding-stock and bulk orders, ranch visits and directions.',
  });
}

export default function ContactPage() {
  return (
    <main>
      <JsonLd data={[contactPageSchema, breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Contact', url: `${SITE.url}/contact` }])]} />
      <PageHero
        eyebrow="Contact Nola Ranches"
        title="Let's Talk. We're Right Here in Oloitoktok & Laikipia."
        subtitle="Send an enquiry, book a ranch visit, ask about livestock, or get directions to the farm."
        image={IMAGES.farmRoad}
        alt="Directions road to Nola Ranches in Oloitoktok and Laikipia, Kenya"
      />
      <section className="bg-cream-primary section-y">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <h2 className="mb-8 font-serif text-5xl text-brand-deep">Send an Enquiry</h2>
            <ContactForm />
          </div>
          <aside className="space-y-6">
            <div className="border border-farm-border bg-cream-warm p-8">
              <h3 className="font-serif text-3xl text-brand-deep">Contact Details</h3>
              <ul className="mt-7 space-y-5 text-brand-deep/75">
                <li className="flex gap-3"><Phone className="mt-1 text-brand-leaf" size={18} aria-hidden="true" />{SITE.phone}</li>
                <li className="flex gap-3"><Mail className="mt-1 text-brand-leaf" size={18} aria-hidden="true" />{SITE.email}</li>
                <li className="flex gap-3"><MapPin className="mt-1 text-brand-leaf" size={18} aria-hidden="true" />Oloitoktok &amp; Laikipia, Kenya</li>
              </ul>
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex bg-[#25D366] px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white">
                WhatsApp Nola Ranches
              </a>
              <div className="mt-8 border-t border-farm-border pt-6 text-sm leading-7 text-brand-deep/70">
                <Link className="text-brand-leaf" href="/services">Book a ranch visit</Link> &middot; <Link className="text-brand-leaf" href="/products">Browse products</Link>
              </div>
            </div>

            {/* Ranch locations */}
            <div className="border border-farm-border bg-cream-warm p-6">
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-leaf">Our Two Ranches</p>
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-brand-deep">Oloitoktok Ranch</p>
                  <p className="mt-1 text-sm text-brand-deep/65">Oloitoktok County, Kenya</p>
                  <p className="mt-0.5 text-xs text-brand-deep/50">Cattle · Goats · Sheep · Pigs</p>
                </div>
                <div className="border-t border-farm-border pt-4">
                  <p className="font-semibold text-brand-deep">Laikipia Ranch</p>
                  <p className="mt-1 text-sm text-brand-deep/65">Laikipia County, Kenya</p>
                  <p className="mt-0.5 text-xs text-brand-deep/50">Wheat · Sorghum · Millet · Soya Beans</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
      <section className="bg-brand-deep section-y-sm">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <h2 className="mb-8 font-serif text-5xl text-cream-primary">Find Our Ranches</h2>
          <div className="aspect-[16/7] min-h-[360px] overflow-hidden border border-white/10 bg-white/5">
            <iframe
              title="Google Maps placeholder for Nola Ranches location in Oloitoktok, Kenya"
              src="https://www.google.com/maps?q=Oloitoktok%20Kenya&output=embed"
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
