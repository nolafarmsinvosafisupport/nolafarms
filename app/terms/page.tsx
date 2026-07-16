import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Terms of Service',
    description: 'The terms that apply when you use the Nola Ranches website, create an account, make an enquiry, book a ranch visit, or place an order.',
    keywords: ['Nola Ranches terms of service', 'Nola Ranches terms and conditions'],
    path: '/terms',
    imageAlt: 'Nola Ranches terms of service',
  });
}

const updated = '16 July 2026';

export default function TermsPage() {
  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Terms of Service', url: `${SITE.url}/terms` }])} />
      <PageHero
        eyebrow="Legal"
        title="Terms of Service"
        subtitle={`Last updated ${updated}`}
        image="/images/hero/hero-goat.webp"
        alt="Goats at Nola Ranches, Kenya"
      />
      <section className="bg-cream-primary section-y">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="space-y-10 text-brand-deep/85">

            <p className="text-lg leading-8">
              These terms govern your use of {SITE.url} and any enquiry, ranch-visit booking, or
              order you make through it. By using the site, you agree to them. If you don&apos;t
              agree, please don&apos;t use the site — you&apos;re always welcome to reach us directly
              by phone or WhatsApp instead.
            </p>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">1. Who we are</h2>
              <p className="mt-3 leading-7">
                Nola Ranches is a livestock operation raising cattle, goats, sheep and pigs across our
                Oloitoktok and Laikipia ranches in Kenya, with grain farming also carried out at
                Laikipia. Contact details are on our <a className="text-brand-leaf underline" href="/contact">Contact page</a>.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">2. Accounts</h2>
              <ul className="mt-3 space-y-2 leading-7">
                <li>You need an account, via Clerk, to book a ranch visit or place an order.</li>
                <li>You&apos;re responsible for keeping your sign-in secure and for all activity on your account.</li>
                <li>You agree to give accurate information — name, phone number and email — so we can reach you about your booking or order.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">3. Product listings &amp; pricing</h2>
              <ul className="mt-3 space-y-2 leading-7">
                <li>Livestock are living animals, so photos, weights and descriptions are representative rather than a guarantee of the specific animal supplied — we vaccinate, deworm and farm-record our stock, and will discuss the actual animal available with you directly.</li>
                <li>Where a price is not shown, the product is priced on enquiry — reach out and we&apos;ll confirm current pricing.</li>
                <li>Availability can change quickly with livestock. Submitting an order or booking is a request, not a guaranteed confirmation, until we get back to you.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">4. Orders &amp; payment</h2>
              <p className="mt-3 leading-7">
                We do not take payment on the website. Placing an order or making an enquiry sends
                your request to our team; we then contact you directly — by phone, email or WhatsApp
                — to confirm details, arrange payment, and organise collection or delivery.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">5. Ranch visit bookings</h2>
              <ul className="mt-3 space-y-2 leading-7">
                <li>Booking a visit is a request for a preferred date and time; we confirm, and may propose an alternative if your date is unavailable.</li>
                <li>Please arrive on time and follow any safety guidance given on site — a working livestock ranch has real animals, vehicles and equipment.</li>
                <li>If you need to cancel or change a confirmed visit, let us know as soon as you can via your account or by contacting us directly.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">6. Acceptable use</h2>
              <p className="mt-3 leading-7">You agree not to:</p>
              <ul className="mt-3 space-y-2 leading-7">
                <li>Use the site for any unlawful purpose, or to submit false enquiries, bookings or orders.</li>
                <li>Attempt to gain unauthorised access to any account or part of the site not intended for public use.</li>
                <li>Copy, scrape, or reuse our product photos, breed descriptions or pricing without permission.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">7. Limitation of liability</h2>
              <p className="mt-3 leading-7">
                We take care to keep the information on this site accurate, but we don&apos;t guarantee
                it is complete or error-free at all times. To the extent permitted by Kenyan law, Nola
                Ranches is not liable for indirect or consequential loss arising from use of the site.
                This does not limit any right you have that cannot be excluded by law.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">8. Changes</h2>
              <p className="mt-3 leading-7">
                We may update these terms as the site or our services change. Continued use after an
                update means you accept the revised terms. The &ldquo;last updated&rdquo; date above
                always reflects the latest version.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">9. Governing law</h2>
              <p className="mt-3 leading-7">
                These terms are governed by the laws of Kenya, and any dispute will be subject to the
                jurisdiction of the Kenyan courts.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">10. Contact</h2>
              <p className="mt-3 leading-7">
                Questions about these terms: <a className="text-brand-leaf underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>, {SITE.phone}, or via our <a className="text-brand-leaf underline" href="/contact">contact form</a>.
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
