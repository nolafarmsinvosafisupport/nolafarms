import Image from 'next/image';
import Link from 'next/link';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { SITE } from '@/lib/constants';

const PHOTOS = {
  main: 'https://images.nolaranches.co.ke/products/animals/cattle/giroland/giroland-cow-nola-1.jpeg',
  small1: 'https://images.nolaranches.co.ke/products/animals/cattle/giroland/giroland-cow-nola-2.jpeg',
  small2: 'https://images.nolaranches.co.ke/products/animals/cattle/giroland/giroland-cow-nola-3.jpeg',
};

// The one product this section exists to sell — keep in sync with the girolando-cattle
// slug seeded in lib/db-migrate.ts if that product is ever renamed.
const PRODUCT_SLUG = 'girolando-cattle';

export function ProductBannerSection() {
  const whatsappHref = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
    "Hello, I'm interested in the Girolando cattle at Nola Ranches. Please provide more details.",
  )}`;

  return (
    // min-h, not a hard h, at lg: 50vh is the target but real viewports vary enough (short
    // laptop screens, browser chrome) that a hard cap risks clipping the copy. min-h-[420px]
    // is the floor so it never gets uncomfortably short on a small lg viewport either.
    <section className="relative overflow-hidden bg-brand-deep lg:h-[50vh] lg:min-h-[420px]">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:h-full lg:grid-cols-2 lg:items-center lg:gap-6 lg:px-8 lg:py-0">
        {/* Copy */}
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gold-warm">Featured Breed</p>
          <h2 className="mt-3 font-serif text-3xl text-cream-primary">Girolando Cattle</h2>
          <p className="mt-4 leading-7 text-cream-secondary/85">
            Renowned for high milk yields and excellent heat tolerance, Girolando cattle thrive in
            Oloitoktok and Kajiado conditions — ideal for local dairy and breeding operations.
            Every animal at Nola Ranches is vaccinated, dewormed, and vet-checked.
          </p>
          <p className="mt-3 text-sm text-cream-secondary/70">
            Looking for a specific bull? We can source it for you.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-leaf px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-cream-primary hover:text-brand-deep"
            >
              <MessageCircle size={14} /> WhatsApp Inquiry
            </a>
            <Link
              href={`/products/${PRODUCT_SLUG}`}
              className="flex items-center justify-center gap-2 rounded-lg border border-cream-primary/40 px-6 py-3.5 text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-cream-primary/10"
            >
              View Product <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* Photo cluster — desktop only. Main photo bleeds to the right edge with its left side
            feathered into the dark background (mask-image, not a hard edge) so the text side
            stays solid and legible while the photo side reads clearly. The two smaller photos
            overlap it bottom-left, tilted, with a white polaroid-style border. */}
        <div className="relative hidden lg:block lg:h-full">
          <div className="absolute inset-y-0 right-0 w-[90%] overflow-hidden rounded-l-[4rem] [mask-image:linear-gradient(to_right,transparent,black_25%)]">
            <Image src={PHOTOS.main} alt="Girolando cattle at Nola Ranches" fill sizes="45vw" className="object-cover" />
          </div>
          <div className="absolute bottom-6 left-0 h-28 w-28 -rotate-6 overflow-hidden rounded-lg border-4 border-cream-primary bg-cream-primary shadow-xl xl:h-32 xl:w-32">
            <Image src={PHOTOS.small1} alt="Girolando bull at Nola Ranches" fill sizes="130px" className="object-cover" />
          </div>
          <div className="absolute bottom-20 left-20 h-28 w-28 rotate-6 overflow-hidden rounded-lg border-4 border-cream-primary bg-cream-primary shadow-xl xl:h-32 xl:w-32 xl:left-24">
            <Image src={PHOTOS.small2} alt="Girolando dairy cow at Nola Ranches" fill sizes="130px" className="object-cover" />
          </div>
        </div>
      </div>

      {/* Photo cluster — mobile/tablet. The masked bleed effect only reads at real width, so
          this is a plain 3-up row instead of trying to shrink the same composition down. */}
      <div className="grid grid-cols-3 gap-3 px-6 pb-14 lg:hidden">
        {[PHOTOS.main, PHOTOS.small1, PHOTOS.small2].map((src) => (
          <div key={src} className="relative aspect-square overflow-hidden rounded-lg">
            <Image src={src} alt="Girolando cattle at Nola Ranches" fill sizes="33vw" className="object-cover" />
          </div>
        ))}
      </div>
    </section>
  );
}
