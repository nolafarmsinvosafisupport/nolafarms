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
    // One fixed image at every breakpoint — no separate mobile layout — so the banner stays a
    // horizontal strip everywhere instead of restacking into a tall block on narrow screens.
    // h-[30vh] is the target (paired with FarmStatsSection's h-[70vh] below to fill one more
    // screen under the hero); min-h is a floor so short viewports don't crush it into a sliver.
    <section className="relative h-[30vh] min-h-[220px] w-full overflow-hidden bg-brand-deep">
      <Image
        src={BANNER_IMAGE}
        alt="Girolando cattle at Nola Ranches"
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />

      {/* Left-aligned over the image's own solid-green zone. w-* keeps it clear of the photo
          cluster baked into the right side of the image at every breakpoint. */}
      <div className="absolute inset-y-0 left-0 flex w-3/5 flex-col justify-center px-3 sm:w-[42%] sm:px-8 lg:w-[38%] lg:px-14">
        <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-gold-warm sm:block sm:text-xs sm:tracking-[0.25em]">
          Featured Breed
        </p>
        <h2 className="mt-0 font-serif text-lg leading-tight text-cream-primary sm:mt-2 sm:text-2xl lg:text-3xl">
          Girolando Cattle
        </h2>
        <p className="mt-1.5 hidden text-xs leading-5 text-cream-secondary/85 sm:block sm:mt-3 sm:text-sm lg:leading-6">
          High milk yields, excellent heat tolerance — vaccinated and vet-checked.
        </p>
        <div className="mt-2.5 flex flex-row flex-nowrap gap-1.5 sm:mt-5 sm:gap-3">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md bg-brand-leaf px-1.5 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-white transition-colors hover:bg-cream-primary hover:text-brand-deep sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-widest"
          >
            <MessageCircle size={12} className="flex-shrink-0" />
            WhatsApp
          </a>
          <Link
            href={`/products/${PRODUCT_SLUG}`}
            className="flex items-center justify-center gap-1 whitespace-nowrap rounded-md border border-cream-primary/40 px-1.5 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-cream-primary transition-colors hover:bg-cream-primary/10 sm:gap-2 sm:rounded-lg sm:px-4 sm:py-2.5 sm:text-xs sm:tracking-widest"
          >
            <span className="sm:hidden">View</span>
            <span className="hidden sm:inline">View Product</span>
            <ArrowRight size={12} className="flex-shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
