'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ActionKind = 'approve' | 'reject' | 'cancel' | 'complete';

interface ModalState {
  kind: 'reject' | 'cancel';
  note: string;
}

export function AdminActionButtons({ bookingId, compact = false }: { bookingId: string; compact?: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<ActionKind | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);

  async function runAction(kind: ActionKind, note?: string) {
    setLoading(kind);
    await fetch(`/api/bookings/${bookingId}/${kind}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_note: note ?? null }),
    });
    setLoading(null);
    setModal(null);
    router.refresh();
    // Trigger immediate NotificationBell refresh for both admin and user
    window.dispatchEvent(new Event('nola:notif:refresh'));
  }

  function handleClick(kind: ActionKind) {
    if (kind === 'reject' || kind === 'cancel') {
      setModal({ kind, note: '' });
    } else {
      runAction(kind);
    }
  }

  const base = compact
    ? 'border border-brand-deep px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-brand-deep hover:bg-brand-deep hover:text-cream-primary disabled:opacity-60'
    : 'px-5 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary disabled:opacity-60';

  const filled = (colour: string) => `${base} ${compact ? '' : `${colour}`}`;

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <button
          disabled={loading !== null}
          onClick={() => handleClick('approve')}
          className={filled('bg-brand-primary hover:bg-brand-mid')}
        >
          {loading === 'approve' ? 'Approving…' : 'Approve'}
        </button>
        <button
          disabled={loading !== null}
          onClick={() => handleClick('reject')}
          className={filled('bg-red-700 hover:bg-red-800')}
        >
          {loading === 'reject' ? 'Rejecting…' : 'Reject'}
        </button>
        <button
          disabled={loading !== null}
          onClick={() => handleClick('cancel')}
          className={filled('bg-farm-muted hover:bg-brand-dark')}
        >
          {loading === 'cancel' ? 'Cancelling…' : 'Cancel'}
        </button>
        <button
          disabled={loading !== null}
          onClick={() => handleClick('complete')}
          className={filled('bg-brand-deep hover:bg-brand-primary')}
        >
          {loading === 'complete' ? 'Saving…' : 'Complete'}
        </button>
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-farm-dark/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-farm-border bg-cream-warm p-8 shadow-2xl">
            <h2 className="font-serif text-3xl text-brand-deep">
              {modal.kind === 'reject' ? 'Reject Booking' : 'Cancel Booking'}
            </h2>
            <p className="mt-3 text-sm text-brand-deep/70">
              {modal.kind === 'reject'
                ? 'An optional note will be included in the rejection email sent to the visitor.'
                : 'An optional note will be included in the cancellation email sent to the visitor.'}
            </p>

            <label className="mt-6 block text-sm font-medium text-brand-deep">
              <span className="mb-2 block">Note for visitor (optional)</span>
              <textarea
                rows={4}
                value={modal.note}
                onChange={(e) => setModal({ ...modal, note: e.target.value })}
                placeholder={
                  modal.kind === 'reject'
                    ? 'e.g. We are fully booked on that date…'
                    : 'e.g. The farm will be closed for maintenance…'
                }
                className="w-full border border-farm-border bg-cream-primary px-4 py-3 text-brand-deep outline-none focus:border-brand-leaf"
              />
            </label>

            <div className="mt-6 flex gap-3">
              <button
                disabled={loading !== null}
                onClick={() => runAction(modal.kind, modal.note)}
                className={`px-6 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary disabled:opacity-60 ${
                  modal.kind === 'reject' ? 'bg-red-700 hover:bg-red-800' : 'bg-farm-muted hover:bg-brand-dark'
                }`}
              >
                {loading === modal.kind
                  ? modal.kind === 'reject'
                    ? 'Rejecting…'
                    : 'Cancelling…'
                  : modal.kind === 'reject'
                    ? 'Confirm Reject'
                    : 'Confirm Cancel'}
              </button>
              <button
                disabled={loading !== null}
                onClick={() => setModal(null)}
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
