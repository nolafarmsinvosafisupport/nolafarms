import Image from 'next/image';
import Link from 'next/link';
import { IMAGES } from '@/lib/constants';

export default function NotFound() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-farm-dark">
      <div className="absolute inset-0">
        <Image src={IMAGES.landscape} alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-farm-dark/55 to-farm-dark" />
      </div>
      <div className="relative z-10 mx-auto max-w-2xl px-6 section-y-md text-center lg:px-8">
        <p className="mb-6 font-serif text-7xl text-brand-leaf">404</p>
        <h1 className="font-serif text-4xl leading-tight text-cream-primary md:text-5xl">
          This field hasn&rsquo;t been planted yet.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-cream-secondary/85">
          The page you&rsquo;re looking for doesn&rsquo;t exist or may have moved.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="bg-brand-leaf px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-deep"
          >
            Back to Home
          </Link>
          <Link
            href="/products"
            className="border border-cream-primary/30 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:border-cream-primary hover:bg-white/5"
          >
            Browse Products
          </Link>
        </div>
      </div>
    </section>
  );
}
