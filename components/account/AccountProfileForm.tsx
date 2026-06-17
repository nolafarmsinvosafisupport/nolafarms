'use client';

import { useUser } from '@clerk/nextjs';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

const field = 'w-full border border-farm-border bg-cream-warm px-4 py-3 text-sm text-brand-deep outline-none focus:border-brand-leaf';

export function AccountProfileForm() {
  const { user } = useUser();
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((r) => r.ok ? r.json() : null)
      .then((result) => setPhone(result?.profile?.phone_number || ''))
      .catch(() => undefined);
  }, []);

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPhotoLoading(true);
    setStatus(null);
    try {
      await user.setProfileImage({ file });
      setStatus('Profile photo updated.');
    } catch {
      setStatus('Photo could not be updated.');
    } finally {
      setPhotoLoading(false);
      e.target.value = '';
    }
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    const formData = new FormData(e.currentTarget);
    await user?.update({
      firstName: String(formData.get('firstName') || ''),
      lastName: String(formData.get('lastName') || ''),
    });
    const res = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone }),
    });
    setStatus(res.ok ? 'Profile saved.' : 'Profile could not be saved.');
  }

  const initials =
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() ||
    user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
    'NF';

  return (
    <div className="max-w-2xl space-y-8">
      <div className="flex items-center gap-6">
        <div className="relative">
          {user?.imageUrl ? (
            <Image src={user.imageUrl} alt="Profile photo" width={80} height={80} className="rounded-full object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-primary text-xl font-semibold text-cream-primary">
              {initials}
            </div>
          )}
          {photoLoading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-farm-dark/50">
              <span className="text-xs text-cream-primary">…</span>
            </div>
          )}
        </div>
        <div>
          <button
            type="button"
            disabled={photoLoading}
            onClick={() => fileInputRef.current?.click()}
            className="border border-farm-border px-5 py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-farm-border disabled:opacity-60"
          >
            {photoLoading ? 'Uploading…' : 'Change Photo'}
          </button>
          <p className="mt-2 text-xs text-brand-deep/50">JPG, PNG or GIF · Max 10 MB</p>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
      </div>

      <form onSubmit={saveProfile} className="space-y-5">
        <Field label="First Name">
          <input name="firstName" defaultValue={user?.firstName || ''} className={field} />
        </Field>
        <Field label="Last Name">
          <input name="lastName" defaultValue={user?.lastName || ''} className={field} />
        </Field>
        <Field label="Email">
          <input value={user?.primaryEmailAddress?.emailAddress || ''} readOnly className={`${field} opacity-60`} />
        </Field>
        <Field label="Phone Number">
          <input value={phone} onChange={(e) => setPhone(e.target.value)} className={field} />
        </Field>
        <button
          type="submit"
          className="bg-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary"
        >
          Save Changes
        </button>
        {status && <p className="text-sm text-brand-leaf">{status}</p>}
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-brand-deep">
      <span className="mb-2 block">{label}</span>
      {children}
    </label>
  );
}
