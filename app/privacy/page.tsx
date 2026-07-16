import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/ui/JsonLd';
import { SITE } from '@/lib/constants';
import { pageMetadata } from '@/lib/seo';
import { breadcrumbSchema } from '@/lib/schema';

export function generateMetadata(): Metadata {
  return pageMetadata({
    title: 'Privacy Policy',
    description: 'How Nola Ranches collects, uses and protects your personal data when you use our website, create an account, or make an enquiry, booking or order.',
    keywords: ['Nola Ranches privacy policy', 'Nola Ranches data protection'],
    path: '/privacy',
    imageAlt: 'Nola Ranches privacy policy',
  });
}

const updated = '16 July 2026';

export default function PrivacyPage() {
  return (
    <main>
      <JsonLd data={breadcrumbSchema([{ name: 'Home', url: SITE.url }, { name: 'Privacy Policy', url: `${SITE.url}/privacy` }])} />
      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle={`Last updated ${updated}`}
        image="/images/hero/hero-cattle.webp"
        alt="Cattle at Nola Ranches, Kenya"
      />
      <section className="bg-cream-primary section-y">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          <div className="space-y-10 text-brand-deep/85">

            <p className="text-lg leading-8">
              Nola Ranches (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) operates {SITE.url}. This
              policy explains what personal data we collect, why, how it is stored, and the choices
              you have. It is written to comply with Kenya&apos;s Data Protection Act, 2019.
            </p>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">1. What we collect</h2>
              <p className="mt-3 leading-7">We collect the following, and no more than we need to run the site and respond to you:</p>
              <ul className="mt-4 space-y-2 leading-7">
                <li><strong>Account details</strong> — name and email address, via our authentication provider, Clerk, when you sign up.</li>
                <li><strong>Enquiries &amp; bookings</strong> — name, phone number, email address, and whatever you write in the contact form, ranch-visit booking, or order (e.g. delivery location).</li>
                <li><strong>Order history</strong> — the livestock/products you enquire about or order, and your order status.</li>
                <li><strong>Usage data</strong> — pages viewed and general traffic patterns, via Google Analytics, to help us understand and improve the site.</li>
                <li><strong>Shopping cart</strong> — held in your browser&apos;s local storage on your device, not on our servers, until you check out.</li>
              </ul>
              <p className="mt-4 leading-7">We do not collect payment card details — Nola Ranches does not take online payment; orders and bookings are confirmed and paid for directly with our team.</p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">2. Why we collect it</h2>
              <ul className="mt-3 space-y-2 leading-7">
                <li>To create and manage your account, and let you view your bookings and orders.</li>
                <li>To respond to enquiries, confirm bookings, and process orders — including notifying you by email and, if you choose, WhatsApp.</li>
                <li>To send booking reminders and status updates for visits and orders you have made.</li>
                <li>To understand how the site is used, so we can improve it.</li>
                <li>To meet legal and accounting obligations.</li>
              </ul>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">3. Who we share it with</h2>
              <p className="mt-3 leading-7">We do not sell your data. We share it only with the service providers that run the site on our behalf, each bound to process it only for that purpose:</p>
              <ul className="mt-4 space-y-2 leading-7">
                <li><strong>Clerk</strong> — account sign-in and authentication.</li>
                <li><strong>Railway / PostgreSQL</strong> — our database host, where bookings, orders and account data are stored.</li>
                <li><strong>Resend</strong> — sends transactional email (booking confirmations, order updates, account notices) on our behalf.</li>
                <li><strong>Cloudflare</strong> — content delivery, security, and image hosting for product photos.</li>
                <li><strong>Google Analytics</strong> — anonymised, aggregated site-usage statistics.</li>
              </ul>
              <p className="mt-4 leading-7">If you message us on WhatsApp, that conversation is subject to WhatsApp/Meta&apos;s own privacy terms, not this policy.</p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">4. How long we keep it</h2>
              <p className="mt-3 leading-7">
                We keep account, booking and order records for as long as your account is active, and for a reasonable period afterward to meet legal, tax and accounting requirements. Contact-form messages are kept only as long as needed to resolve your enquiry.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">5. Your rights</h2>
              <p className="mt-3 leading-7">Under Kenyan law, you can ask us to:</p>
              <ul className="mt-4 space-y-2 leading-7">
                <li>Confirm what personal data we hold about you, and give you a copy.</li>
                <li>Correct inaccurate or incomplete data.</li>
                <li>Delete your data, where we are not required to keep it for a legal reason.</li>
                <li>Withdraw consent for optional processing, such as analytics, at any time.</li>
              </ul>
              <p className="mt-4 leading-7">
                To exercise any of these, email <a className="text-brand-leaf underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or use our <a className="text-brand-leaf underline" href="/contact">contact form</a>. You can also delete your own account from <a className="text-brand-leaf underline" href="/account/settings">Account Settings</a> at any time — this removes your saved account data, though records of any bookings already made are kept for our accounting and record-keeping obligations.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">6. Security</h2>
              <p className="mt-3 leading-7">
                We use industry-standard measures to protect your data — encrypted connections (HTTPS) throughout the site, access-controlled admin tools, and nightly encrypted backups of our database. No method of transmission or storage is 100% secure, but we work to protect your information appropriately for its sensitivity.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">7. Children</h2>
              <p className="mt-3 leading-7">Our services are intended for adults conducting business with the ranch. We do not knowingly collect data from children.</p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">8. Changes to this policy</h2>
              <p className="mt-3 leading-7">We may update this policy as the site or our practices change. The &ldquo;last updated&rdquo; date above will always reflect the latest version.</p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-brand-deep">9. Contact</h2>
              <p className="mt-3 leading-7">
                Questions about this policy or your data: <a className="text-brand-leaf underline" href={`mailto:${SITE.email}`}>{SITE.email}</a>, {SITE.phone}, or WhatsApp {SITE.phone}.
              </p>
            </div>

          </div>
        </div>
      </section>
    </main>
  );
}
