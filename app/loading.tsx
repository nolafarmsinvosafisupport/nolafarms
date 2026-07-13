import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-farm-dark">
      {/* Full Nola Ranches lockup. The light variant is required on this dark background — the
          stock wordmark is dark artwork and would be all but invisible here. The spinning rings
          that used to sit here framed a circular emblem; the full lockup is a wide stacked mark,
          so the bouncing dots below now carry the loading cue. */}
      <Image
        src="/images/logos/wordmark-light.png"
        alt="Nola Ranches"
        width={642}
        height={388}
        priority
        className="w-64 animate-pulse object-contain [animation-duration:2s] sm:w-72"
      />

      <div className="flex gap-1.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:0ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:150ms]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:300ms]" />
      </div>
    </div>
  );
}
