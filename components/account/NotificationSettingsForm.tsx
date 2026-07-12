'use client';

import { useEffect, useState } from 'react';

type Settings = {
  notify_on_confirm: boolean;
  notify_on_reminder: boolean;
  notify_on_rejection: boolean;
};

export function NotificationSettingsForm() {
  const [settings, setSettings] = useState<Settings>({ notify_on_confirm: true, notify_on_reminder: true, notify_on_rejection: true });
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/profile')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.profile) {
          setSettings({
            notify_on_confirm: result.profile.notify_on_confirm,
            notify_on_reminder: result.profile.notify_on_reminder,
            notify_on_rejection: result.profile.notify_on_rejection,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  async function save() {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    setStatus(response.ok ? 'Notification settings saved.' : 'Settings could not be saved. Please try again.');
  }

  return (
    <div className="max-w-2xl space-y-5">
      <Toggle label="Email me when my booking is confirmed" checked={settings.notify_on_confirm} onChange={(value) => setSettings((current) => ({ ...current, notify_on_confirm: value }))} />
      <Toggle label="Email me a reminder the day before my visit" checked={settings.notify_on_reminder} onChange={(value) => setSettings((current) => ({ ...current, notify_on_reminder: value }))} />
      <Toggle label="Email me if my booking is rejected or cancelled" checked={settings.notify_on_rejection} onChange={(value) => setSettings((current) => ({ ...current, notify_on_rejection: value }))} />
      <button onClick={save} className="bg-brand-deep px-7 py-3 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary">Save Preferences</button>
      {status && <p className="text-sm text-brand-leaf">{status}</p>}
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 border border-farm-border bg-cream-warm p-4 text-brand-deep">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-5 w-5 accent-brand-leaf" />
      {label}
    </label>
  );
}
