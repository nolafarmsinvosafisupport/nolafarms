'use client';

import { useRef, useState } from 'react';
import { Upload, X, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

type UploadingFile = {
  id: string;
  previewUrl: string;
  status: 'uploading' | 'error';
  errorMessage?: string;
};

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB — generous for farm photography, small enough to upload fast on mobile data

export function AdminImageUploader({ images, onChange, label = 'Product Images' }: { images: string[]; onChange: (images: string[]) => void; label?: string }) {
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [showManual, setShowManual] = useState(false);
  const [manualValue, setManualValue] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    const id = `${Date.now()}-${Math.random()}`;
    const previewUrl = URL.createObjectURL(file);

    if (file.size > MAX_FILE_SIZE) {
      setUploading((u) => [...u, { id, previewUrl, status: 'error', errorMessage: 'File too large (max 8MB).' }]);
      return;
    }

    setUploading((u) => [...u, { id, previewUrl, status: 'uploading' }]);

    try {
      const res = await fetch('/api/admin/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Upload failed.');

      const putRes = await fetch(data.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      if (!putRes.ok) throw new Error('Upload to storage failed.');

      onChange([...images, data.publicUrl]);
      setUploading((u) => u.filter((f) => f.id !== id));
      URL.revokeObjectURL(previewUrl);
    } catch (err) {
      setUploading((u) => u.map((f) => (f.id === id ? { ...f, status: 'error', errorMessage: err instanceof Error ? err.message : 'Upload failed.' } : f)));
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((f) => {
      if (f.type.startsWith('image/')) uploadFile(f);
    });
  }

  function removeImage(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  function dismissFailed(id: string) {
    setUploading((u) => u.filter((f) => f.id !== id));
  }

  function addManual() {
    if (manualValue.trim()) {
      onChange([...images, manualValue.trim()]);
      setManualValue('');
    }
  }

  return (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50">{label}</label>

      {(images.length > 0 || uploading.length > 0) && (
        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, i) => (
            // Plain <img>, not next/image — these previews render whatever host is
            // pasted/uploaded (including R2 before its domain is in next.config.js's
            // remotePatterns), so they can't depend on a build-time allow-list.
            <div key={img + i} className="group relative aspect-square overflow-hidden border border-farm-border bg-cream-secondary">
              <img src={img} alt="" className="h-full w-full object-cover object-top" />
              <button
                type="button"
                onClick={() => removeImage(i)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {uploading.map((f) => (
            <div key={f.id} className="relative aspect-square overflow-hidden border border-farm-border bg-cream-secondary">
              <img src={f.previewUrl} alt="" className="h-full w-full object-cover object-top opacity-50" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                {f.status === 'uploading' ? (
                  <Loader2 size={18} className="animate-spin text-white" />
                ) : (
                  <button
                    type="button"
                    onClick={() => dismissFailed(f.id)}
                    title={f.errorMessage}
                    className="flex flex-col items-center gap-1 text-white"
                  >
                    <AlertCircle size={16} />
                    <span className="text-[9px]">Failed — tap to dismiss</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 border-2 border-dashed px-4 py-6 text-center transition-colors ${
          dragOver ? 'border-brand-leaf bg-brand-leaf/5' : 'border-farm-border hover:border-brand-deep/30'
        }`}
      >
        <Upload size={20} className="text-brand-deep/40" />
        <p className="text-xs text-brand-deep/60">
          <span className="font-semibold text-brand-leaf">Click to upload</span> or drag and drop images here
        </p>
        <p className="text-[10px] text-brand-deep/35">JPEG, PNG, WebP, GIF, or AVIF — up to 8MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowManual((v) => !v)}
        className="mt-2 flex items-center gap-1 text-[11px] font-medium text-brand-deep/50 hover:text-brand-deep"
      >
        {showManual ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Advanced: paste an image URL or /public path manually
      </button>
      {showManual && (
        <div className="mt-2 flex gap-2">
          <input
            value={manualValue}
            onChange={(e) => setManualValue(e.target.value)}
            placeholder="/images/products/... or https://..."
            className="flex-1 border border-farm-border bg-cream-primary px-3 py-2 font-mono text-xs text-brand-deep outline-none focus:border-brand-leaf"
          />
          <button
            type="button"
            onClick={addManual}
            className="border border-farm-border px-3 py-2 text-xs font-semibold text-brand-deep hover:bg-cream-secondary"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}
