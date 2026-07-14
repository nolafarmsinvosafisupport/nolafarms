import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/constants';

// Background-removed cutout of the photo cluster, cropped to its own content (no dead
// transparent margin) — see public/images/products/animals/cattle/giroland/ for the source.
// Its true aspect ratio (445x298) lets it sit straight on bg-brand-deep with no crop/seam.
const BANNER_IMAGE = '/images/products/animals/cattle/giroland/giroland-banner-cutout.png';

// The one product this section exists to sell — keep in sync with the girolando-cattle
// slug seeded in lib/db-migrate.ts if that product is ever renamed.
const PRODUCT_SLUG = 'girolando-cattle';

export function ProductBannerSection() {
  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    "Hello, I'm interested in the Girolando cattle at Nola Ranches. Please provide more details.",
  )}`;

  return (
    // Single horizontal row at every breakpoint — text left, cutout right — both painted
    // directly on bg-brand-deep. Because the cutout has no baked-in background of its own,
    // object-contain can shrink it freely on narrow screens with no crop and no visible edge/
    // seam against the section background. The row has no vh/height cap: it grows with the
    // 3-paragraph copy instead of truncating either the text or the image.
    <section className="w-full bg-brand-deep">
      <div className="mx-auto flex max-w-6xl flex-row items-center gap-4 px-4 py-8 sm:gap-8 sm:px-8 sm:py-12 lg:gap-14 lg:px-16 lg:py-16">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-warm sm:text-xs sm:tracking-[0.25em]">
            Featured Breed
          </p>
          <h2 className="mt-1.5 font-serif text-xl leading-tight text-cream-primary sm:mt-2 sm:text-2xl lg:text-3xl">
            Girolando Cattle
          </h2>
          <p className="mt-2.5 text-xs leading-5 text-cream-secondary/85 sm:mt-4 sm:text-base sm:leading-7">
            Girolando cattle are renowned for their high milk yields and excellent heat tolerance. They thrive in
            Oloitoktok and Kajiado conditions, making them an ideal choice for local dairy and breeding operations.
          </p>
          <p className="mt-2 text-xs leading-5 text-cream-secondary/85 sm:mt-4 sm:text-base sm:leading-7">
            At Nola Ranches, we offer healthy, vaccinated Girolando bulls and dairy cows. All our stock is
            dewormed, vet-checked, and ready for breeding or milk production.
          </p>
          <p className="mt-2 text-xs leading-5 text-cream-secondary/85 sm:mt-4 sm:text-base sm:leading-7">
            Don&apos;t see the bull you want? No problem — if you have a specific bull in mind, we can source it
            for you.
          </p>
          <div className="mt-3 flex flex-row flex-nowrap gap-1.5 sm:mt-6 sm:gap-3">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md bg-brand-leaf px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-cream-primary hover:text-brand-deep sm:gap-2 sm:rounded-lg sm:px-5 sm:py-3 sm:text-xs sm:tracking-widest"
            >
              <MessageCircle size={12} className="flex-shrink-0 sm:hidden" />
              <MessageCircle size={16} className="hidden flex-shrink-0 sm:block" />
              WhatsApp
            </a>
            <Link
              href={`/products/${PRODUCT_SLUG}`}
              className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-cream-primary/40 px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-cream-primary transition-colors hover:bg-cream-primary/10 sm:gap-2 sm:rounded-lg sm:px-5 sm:py-3 sm:text-xs sm:tracking-widest"
            >
              <span className="sm:hidden">View</span>
              <span className="hidden sm:inline">View Product</span>
              <ArrowRight size={12} className="flex-shrink-0 sm:hidden" />
              <ArrowRight size={16} className="hidden flex-shrink-0 sm:block" />
            </Link>
          </div>
        </div>

        <div className="relative aspect-[445/298] w-[34%] max-w-[300px] flex-shrink-0 sm:w-[38%] sm:max-w-[380px] lg:w-[36%] lg:max-w-[460px]">
          <Image
            src={BANNER_IMAGE}
            alt="Girolando cattle at Nola Ranches"
            fill
            sizes="(min-width: 1024px) 460px, (min-width: 640px) 380px, 150px"
            priority
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
