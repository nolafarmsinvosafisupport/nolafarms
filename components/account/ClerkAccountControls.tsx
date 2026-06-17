'use client';

import { useClerk, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ClerkAccountControls() {
  const { openUserProfile } = useClerk();
  const { user } = useUser();
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await user.delete();
      router.push('/');
    } catch {
      setDeleteError('Account could not be deleted. Please contact support.');
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="space-y-3">
        <button
          onClick={() => openUserProfile({ appearance: { variables: { colorPrimary: '#486018' } } })}
          className="flex w-full items-center justify-between border border-farm-border bg-cream-warm px-5 py-4 text-left text-sm font-medium text-brand-deep hover:border-brand-leaf hover:bg-cream-secondary"
        >
          Change Password
          <span className="text-brand-deep/40">→</span>
        </button>

        <button
          onClick={() => openUserProfile({ appearance: { variables: { colorPrimary: '#486018' } } })}
          className="flex w-full items-center justify-between border border-farm-border bg-cream-warm px-5 py-4 text-left text-sm font-medium text-brand-deep hover:border-brand-leaf hover:bg-cream-secondary"
        >
          Manage Connected Accounts
          <span className="text-brand-deep/40">→</span>
        </button>

        <button
          onClick={() => setDeleteOpen(true)}
          className="flex w-full items-center justify-between border border-red-200 bg-cream-warm px-5 py-4 text-left text-sm font-medium text-red-700 hover:border-red-400 hover:bg-red-50"
        >
          Delete Account
          <span className="text-red-300">→</span>
        </button>
      </div>

      {deleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-farm-dark/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md border border-farm-border bg-cream-warm p-8 shadow-2xl">
            <h2 className="font-serif text-3xl text-brand-deep">Delete Account</h2>
            <p className="mt-4 text-sm leading-6 text-brand-deep/70">
              This will permanently delete your account and all saved data. Your existing bookings will remain in our system for record-keeping. This cannot be undone.
            </p>
            {deleteError && (
              <p className="mt-4 border border-red-300 bg-red-50 p-3 text-sm text-red-800">{deleteError}</p>
            )}
            <div className="mt-7 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-700 px-6 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-red-800 disabled:opacity-60"
              >
                {deleting ? 'Deleting…' : 'Yes, delete my account'}
              </button>
              <button
                onClick={() => { setDeleteOpen(false); setDeleteError(null); }}
                disabled={deleting}
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
