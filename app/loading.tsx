import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-farm-dark">
      {/* Spinning rings around the full Nola Ranches lockup. The rings have to clear the mark's
          diagonal, not just its height — it is a wide 1.65:1 stacked lockup, so a ring sized to
          the logo's height would let the corners poke through. */}
      <div className="relative flex items-center justify-center">
        {/* Outer slow-spin ring */}
        <div className="absolute h-64 w-64 animate-spin rounded-full border-4 border-transparent border-t-brand-leaf [animation-duration:1.8s] sm:h-72 sm:w-72" />
        {/* Inner faster accent ring, counter-rotating */}
        <div className="absolute h-56 w-56 animate-spin rounded-full border-2 border-transparent border-b-gold-warm opacity-60 [animation-direction:reverse] [animation-duration:1.2s] sm:h-64 sm:w-64" />

        {/* The light variant is required on this dark background — the stock wordmark is dark
            artwork and would be all but invisible here. */}
        <Image
          src="/images/logos/wordmark-light.png"
          alt="Nola Ranches"
          width={642}
          height={388}
          priority
          className="relative z-10 w-44 object-contain sm:w-52"
        />
      </div>

      <div className="flex gap-1.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:300ms]" />
      </div>
    </div>
  );
}
