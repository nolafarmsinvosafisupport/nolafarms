'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-screen items-center justify-center bg-farm-dark px-6">
      <div className="mx-auto max-w-lg text-center">
        <p className="mb-6 font-serif text-6xl text-brand-leaf">Oops.</p>
        <h1 className="font-serif text-3xl leading-tight text-cream-primary md:text-4xl">
          Something went wrong on our end.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-base leading-7 text-cream-secondary/80">
          Please try again in a moment. If the problem continues, contact us and we&rsquo;ll sort it out.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => reset()}
            className="bg-brand-leaf px-7 py-3 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-brand-deep"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="border border-cream-primary/30 px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary transition-colors hover:border-cream-primary hover:bg-white/5"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}
