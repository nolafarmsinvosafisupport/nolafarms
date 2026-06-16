'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';

export function AccountProfileForm() {
  const { user } = useUser();
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => setPhone(result?.profile?.phone_number || ''))
      .catch(() => undefined);
  }, []);

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const formData = new FormData(event.currentTarget);
    await user?.update({
      firstName: String(formData.get('firstName') || ''),
      lastName: String(formData.get('lastName') || ''),
    });
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_number: phone }),
    });
    setStatus(response.ok ? 'Profile saved.' : 'Profile could not be saved yet. Check Supabase configuration.');
  }

  return (
    <form onSubmit={saveProfile} className="max-w-2xl space-y-5">
      <Field label="First Name"><input name="firstName" defaultValue={user?.firstName || ''} className="field" /></Field>
      <Field label="Last Name"><input name="lastName" defaultValue={user?.lastName || ''} className="field" /></Field>
      <Field label="Email"><input value={user?.primaryEmailAddress?.emailAddress || ''} readOnly className="field opacity-70" /></Field>
      <Field label="Phone Number"><input value={phone} onChange={(event) => setPhone(event.target.value)} className="field" /></Field>
      <button className="bg-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary">Save Changes</button>
      {status && <p className="text-sm text-brand-leaf">{status}</p>}
      <style jsx>{`
        .field {
          width: 100%;
          border: 1px solid #d2c8b4;
          background: #faf5eb;
          padding: 0.8rem 1rem;
          outline: none;
        }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm font-medium text-brand-deep"><span className="mb-2 block">{label}</span>{children}</label>;
}
