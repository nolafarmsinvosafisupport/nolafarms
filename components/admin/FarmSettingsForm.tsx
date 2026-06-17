'use client';

import { useEffect, useState } from 'react';

interface Settings {
  admin_notification_email: string | null;
  reminder_emails_enabled: boolean;
}

export function FarmSettingsForm() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [email, setEmail] = useState('');
  const [reminders, setReminders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/farm-settings')
      .then((r) => r.json())
      .then((result) => {
        if (result.settings) {
          setSettings(result.settings);
          setEmail(result.settings.admin_notification_email ?? '');
          setReminders(result.settings.reminder_emails_enabled ?? true);
        }
      })
      .catch(() => setError('Could not load settings.'));
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const res = await fetch('/api/farm-settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_notification_email: email, reminder_emails_enabled: reminders }),
    });
    const result = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(result.message || 'Failed to save settings.');
    } else {
      setSettings(result.settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (!settings && !error) {
    return <p className="text-sm text-brand-deep/60">Loading settings…</p>;
  }

  return (
    <form onSubmit={save} className="space-y-6">
      {error && <p className="border border-red-300 bg-red-50 p-4 text-sm text-red-800">{error}</p>}

      <div>
        <label className="block text-sm font-medium text-brand-deep">
          <span className="mb-2 block">Admin notification email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="farm@example.com"
            className="w-full max-w-md border border-farm-border bg-cream-primary px-4 py-3 text-brand-deep outline-none focus:border-brand-leaf"
          />
        </label>
        <p className="mt-2 text-xs text-brand-deep/55">
          New booking alerts are sent to this address. Leave blank to use the default site email.
        </p>
      </div>

      <div>
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={reminders}
            onChange={(e) => setReminders(e.target.checked)}
            className="h-4 w-4 accent-brand-leaf"
          />
          <span className="text-sm font-medium text-brand-deep">Send 24-hour reminder emails to visitors</span>
        </label>
        <p className="mt-2 ml-7 text-xs text-brand-deep/55">
          Controlled by the Supabase Edge Function. Toggle here to enable or disable the daily reminder job.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary disabled:opacity-60"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
        {saved && (
          <span className="text-xs font-semibold uppercase tracking-widest text-brand-leaf">Saved</span>
        )}
      </div>
    </form>
  );
}
