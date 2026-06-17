import Image from 'next/image';

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-farm-dark">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/images/logos/pageloading.png"
          alt="Nola Farms"
          width={240}
          height={150}
          priority
          className="animate-pulse object-contain"
        />
        <div className="flex gap-1.5">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-leaf [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}
