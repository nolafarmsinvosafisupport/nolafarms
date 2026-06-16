import { MessageCircle } from 'lucide-react';
import { SITE } from '@/lib/constants';

export function WhatsAppButton() {
  const message = encodeURIComponent("Hello Nola Farms, I'd like to enquire about...");

  return (
    <a
      href={`https://wa.me/${SITE.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Nola Farms on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2"
    >
      <MessageCircle aria-hidden="true" size={26} />
    </a>
  );
}
