import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-farm-dark">
      {/* Spinning ring + white circle logo */}
      <div className="relative flex items-center justify-center">
        {/* Outer slow-spin ring */}
        <div className="absolute h-36 w-36 animate-spin rounded-full border-4 border-transparent border-t-brand-leaf [animation-duration:1.8s]" />
        {/* Inner faster accent ring */}
        <div className="absolute h-28 w-28 animate-spin rounded-full border-2 border-transparent border-b-gold-warm opacity-60 [animation-duration:1.2s] [animation-direction:reverse]" />
        {/* White circle background — makes the logo visible on dark bg */}
        <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-2xl">
          <Image
            src="/images/logos/small logo.png"
            alt="Nola Farms"
            width={68}
            height={68}
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* Wordmark */}
      <div className="flex flex-col items-center gap-2">
        <p className="font-serif text-xl tracking-[0.25em] text-cream-primary">
          NOLA<span className="text-brand-leaf">FARMS</span>
        </p>
        {/* Bouncing dots */}
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
