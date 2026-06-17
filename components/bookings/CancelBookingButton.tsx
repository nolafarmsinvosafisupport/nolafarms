'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function CancelBookingButton({ bookingId, reference }: { bookingId: string; reference: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function confirm() {
    setLoading(true);
    await fetch(`/api/bookings/${bookingId}/cancel`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    setLoading(false);
    setOpen(false);
    router.refresh();
    window.dispatchEvent(new Event('nola:notif:refresh'));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="border border-brand-deep px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-brand-deep hover:text-cream-primary"
      >
        Cancel
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-farm-dark/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm border border-farm-border bg-cream-warm p-8 shadow-2xl">
            <h2 className="font-serif text-3xl text-brand-deep">Cancel Booking</h2>
            <p className="mt-4 text-sm leading-6 text-brand-deep/70">
              Are you sure you want to cancel <strong>{reference}</strong>? This cannot be undone.
            </p>
            <div className="mt-7 flex gap-3">
              <button
                onClick={confirm}
                disabled={loading}
                className="bg-red-700 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-red-800 disabled:opacity-60"
              >
                {loading ? 'Cancelling…' : 'Yes, cancel it'}
              </button>
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="border border-farm-border px-6 py-3 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-farm-border disabled:opacity-60"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
