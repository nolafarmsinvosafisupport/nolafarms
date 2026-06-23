'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Order, OrderStatus } from '@/lib/product-types';
import { ORDER_STATUS_LABELS } from '@/lib/product-types';

const ALL_STATUSES: OrderStatus[] = ['new', 'contacted', 'fulfilled', 'cancelled'];

export function AdminOrderActions({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [note, setNote] = useState(order.admin_note ?? '');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    setLoading(true);
    await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_note: note || null }),
    });
    setLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    router.refresh();
  }

  return (
    <div className="border border-farm-border bg-cream-warm p-5 space-y-4">
      <h2 className="text-[10px] font-semibold uppercase tracking-widest text-brand-deep/40">Admin Actions</h2>

      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50">
          Update Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf"
        >
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50">
          Internal Note
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Internal note about this order (not visible to customer)..."
          className="w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf resize-none placeholder:text-brand-deep/30"
        />
      </div>

      <button
        type="button"
        disabled={loading}
        onClick={handleSave}
        className="flex items-center gap-2 bg-brand-leaf px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-deep disabled:opacity-60 transition-colors"
      >
        {loading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : saved ? 'Saved!' : 'Save Changes'}
      </button>
    </div>
  );
}
