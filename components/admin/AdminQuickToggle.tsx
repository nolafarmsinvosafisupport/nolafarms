'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

// One-click on/off switch for a single boolean field, used directly in admin list rows
// (products, categories) so toggling visibility/stock/active doesn't require opening the
// edit form. PATCHes immediately and refreshes the server-rendered list.
export function AdminQuickToggle({
  endpoint,
  field,
  value,
  label,
}: {
  endpoint: string;
  field: string;
  value: boolean;
  label: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleToggle() {
    setLoading(true);
    try {
      await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !value }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <label className="flex items-center gap-1.5">
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={loading}
        onClick={handleToggle}
        className={`relative h-5 w-9 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${value ? 'bg-brand-leaf' : 'bg-brand-deep/20'}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      <span className="text-[10px] font-medium text-brand-deep/50">{label}</span>
    </label>
  );
}
