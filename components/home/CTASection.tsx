import Link from 'next/link';

export function CTASection() {
  return (
    <section className="bg-cream-secondary py-24">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 md:flex-row md:items-center lg:px-8">
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-brand-leaf">Visits & Enquiries</p>
          <h2 className="font-serif text-5xl text-brand-deep">Come See the Farm.</h2>
        </div>
        <Link href="/contact" className="bg-brand-deep px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:bg-brand-primary">
          Contact Nola Farms
        </Link>
      </div>
    </section>
  );
}
