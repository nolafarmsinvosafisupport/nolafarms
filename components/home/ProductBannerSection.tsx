import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/constants';

const BANNER_IMAGE = '/images/products/animals/cattle/giroland/giroland image in banner only.png';

// The one product this section exists to sell — keep in sync with the girolando-cattle
// slug seeded in lib/db-migrate.ts if that product is ever renamed.
const PRODUCT_SLUG = 'girolando-cattle';

export function ProductBannerSection() {
  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    "Hello, I'm interested in the Girolando cattle at Nola Ranches. Please provide more details.",
  )}`;

  return (
    // Stacked layout: the image is its own full-width band sized to its true aspect ratio
    // (1983x793 ≈ 2.5:1), so object-cover never has to crop it at any breakpoint. Copy and CTAs
    // live in a separate content band below, free to grow as tall as the text needs — this is
    // what makes the full 3-paragraph description viewable on a phone without truncating either
    // the image or the text.
    <section className="w-full bg-brand-deep">
      <div className="relative w-full aspect-[1983/793]">
        <Image
          src={BANNER_IMAGE}
          alt="Girolando cattle at Nola Ranches"
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      </div>

      <div className="px-6 py-10 sm:px-10 sm:py-12 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-warm">Featured Breed</p>
          <h2 className="mt-2 font-serif text-2xl leading-tight text-cream-primary sm:text-3xl">Girolando Cattle</h2>
          <p className="mt-4 leading-7 text-cream-secondary/85">
            Girolando cattle are renowned for their high milk yields and excellent heat tolerance. They thrive in
            Oloitoktok and Kajiado conditions, making them an ideal choice for local dairy and breeding operations.
          </p>
          <p className="mt-4 leading-7 text-cream-secondary/85">
            At Nola Ranches, we offer healthy, vaccinated Girolando bulls and dairy cows. All our stock is
            dewormed, vet-checked, and ready for breeding or milk production.
          </p>
          <p className="mt-4 leading-7 text-cream-secondary/85">
            Don&apos;t see the bull you want? No problem — if you have a specific bull in mind, we can source it
            for you.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg bg-brand-leaf px-5 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-cream-primary hover:text-brand-deep"
            >
              <MessageCircle size={16} className="flex-shrink-0" />
              WhatsApp
            </a>
            <Link
              href={`/products/${PRODUCT_SLUG}`}
              className="flex items-center gap-2 rounded-lg border border-cream-primary/40 px-5 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-cream-primary/10"
            >
              View Product
              <ArrowRight size={16} className="flex-shrink-0" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
