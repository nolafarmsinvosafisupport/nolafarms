'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CancelBookingButton({ bookingId, reference }: { bookingId: string; reference: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function cancelBooking() {
    if (!window.confirm(`Are you sure you want to cancel ${reference}?`)) return;
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    setLoading(false);
    router.refresh();
  }

  return (
    <button onClick={cancelBooking} disabled={loading} className="border border-brand-deep px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-brand-deep hover:text-cream-primary disabled:opacity-60">
      Cancel
    </button>
  );
}
