'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

export function AdminProductDeleteButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/products/${productId}`, { method: 'DELETE' });
    router.refresh();
  }

  if (confirm) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-300">Delete &ldquo;{productName}&rdquo;?</span>
        <button
          type="button"
          disabled={loading}
          onClick={handleDelete}
          className="px-2 py-1 text-xs font-semibold text-red-400 hover:text-red-300 disabled:opacity-50"
        >
          Yes
        </button>
        <button type="button" onClick={() => setConfirm(false)} className="text-xs text-white/40 hover:text-white/70">
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirm(true)}
      className="flex items-center gap-1.5 border border-white/10 px-3 py-1.5 text-xs text-white/40 hover:text-red-400 hover:border-red-400/30 transition-colors"
    >
      <Trash2 size={12} /> Delete
    </button>
  );
}
