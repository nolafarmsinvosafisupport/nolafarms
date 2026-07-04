'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export function AdminProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.message || 'Delete failed. Please try again.');
        setLoading(false);
        return;
      }
      router.refresh();
    } catch {
      setError('Delete failed. Please try again.');
      setLoading(false);
    }
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">{error || `Delete "${productName}"?`}</span>
        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          className="px-2 py-1 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {loading ? 'Deleting…' : 'Yes'}
        </button>
        <button type="button" onClick={() => { setConfirm(false); setError(''); }} className="text-xs text-brand-deep/40 hover:text-brand-deep">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 border border-farm-border px-3 py-1.5 text-xs text-brand-deep/50 hover:border-red-300 hover:text-red-600 transition-colors"
    >
      <Trash2 size={11} /> Delete
    </button>
  );
}
