'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import type { Product, ProductCategory, Ranch } from '@/lib/product-types';
import { CATEGORY_LABELS } from '@/lib/product-types';

const RANCH_OPTIONS: { value: Ranch; label: string }[] = [
  { value: 'oloitoktok', label: 'Oloitoktok Ranch' },
  { value: 'laikipia', label: 'Laikipia Ranch' },
  { value: 'both', label: 'Both Ranches' },
];

const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

type Props = { product?: Product };

export function AdminProductForm({ product }: Props) {
  const router = useRouter();
  const isEdit = Boolean(product);

  const [name, setName] = useState(product?.name ?? '');
  const [slug, setSlug] = useState(product?.slug ?? '');
  const [category, setCategory] = useState<ProductCategory>(product?.category ?? 'vegetables');
  const [ranch, setRanch] = useState<Ranch>(product?.ranch ?? 'oloitoktok');
  const [description, setDescription] = useState(product?.description ?? '');
  const [details, setDetails] = useState<string[]>(product?.details ?? ['']);
  const [hasPrice, setHasPrice] = useState(product ? product.price !== null : false);
  const [price, setPrice] = useState(product?.price ?? '');
  const [compareAt, setCompareAt] = useState(product?.compare_at_price ?? '');
  const [priceUnit, setPriceUnit] = useState(product?.price_unit ?? 'per kg');
  const [bulkInfo, setBulkInfo] = useState(product?.bulk_info ?? '');
  const [images, setImages] = useState<string[]>(product?.images?.length ? product.images : ['']);
  const [available, setAvailable] = useState(product?.available ?? true);
  const [sortOrder, setSortOrder] = useState(String(product?.sort_order ?? '0'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function handleNameChange(v: string) {
    setName(v);
    if (!isEdit) setSlug(slugify(v));
  }

  function addDetail() { setDetails((d) => [...d, '']); }
  function removeDetail(i: number) { setDetails((d) => d.filter((_, idx) => idx !== i)); }
  function updateDetail(i: number, v: string) { setDetails((d) => d.map((x, idx) => idx === i ? v : x)); }

  function addImage() { setImages((imgs) => [...imgs, '']); }
  function removeImage(i: number) { setImages((imgs) => imgs.filter((_, idx) => idx !== i)); }
  function updateImage(i: number, v: string) { setImages((imgs) => imgs.map((x, idx) => idx === i ? v : x)); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = {
        name,
        slug,
        category,
        ranch,
        description: description || null,
        details: details.filter(Boolean),
        price: hasPrice && price ? parseFloat(price) : null,
        compare_at_price: hasPrice && compareAt ? parseFloat(compareAt) : null,
        price_unit: priceUnit,
        bulk_info: bulkInfo || null,
        images: images.filter(Boolean),
        available,
        sort_order: parseInt(sortOrder) || 0,
      };
      const url = isEdit ? `/api/products/${product!.id}` : '/api/products';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Save failed.');
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-white/40">{label}</label>
      {children}
    </div>
  );

  const inputCls = 'w-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-cream-primary outline-none focus:border-brand-leaf placeholder:text-white/20';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {error && (
        <div className="border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product Name *">
          <input required value={name} onChange={(e) => handleNameChange(e.target.value)} className={inputCls} placeholder="e.g. Broad Leaf Swiss Spinach" />
        </Field>
        <Field label="Slug (URL) *">
          <input required value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className={inputCls} placeholder="e.g. swiss-spinach" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category *">
          <select value={category} onChange={(e) => setCategory(e.target.value as ProductCategory)} className={inputCls}>
            {CATEGORY_OPTIONS.map(([val, lbl]) => <option key={val} value={val}>{lbl}</option>)}
          </select>
        </Field>
        <Field label="Ranch *">
          <select value={ranch} onChange={(e) => setRanch(e.target.value as Ranch)} className={inputCls}>
            {RANCH_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Description">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} placeholder="Short description of the product..." />
      </Field>

      {/* Details / bullet points */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/40">Product Details (bullet points)</label>
        <div className="space-y-2">
          {details.map((d, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={d}
                onChange={(e) => updateDetail(i, e.target.value)}
                placeholder={`Feature ${i + 1}`}
                className={`${inputCls} flex-1`}
              />
              {details.length > 1 && (
                <button type="button" onClick={() => removeDetail(i)} className="text-white/30 hover:text-red-400 transition-colors px-2">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addDetail} className="mt-2 flex items-center gap-1 text-xs text-brand-leaf hover:text-cream-primary">
          <Plus size={12} /> Add Detail
        </button>
      </div>

      {/* Pricing */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/40">Pricing</label>
        <div className="flex items-center gap-3 mb-3">
          <button
            type="button"
            onClick={() => setHasPrice(false)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${!hasPrice ? 'bg-gold-warm text-brand-deep' : 'border border-white/10 text-white/40 hover:text-white/70'}`}
          >
            Contact for Price
          </button>
          <button
            type="button"
            onClick={() => setHasPrice(true)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${hasPrice ? 'bg-brand-leaf text-white' : 'border border-white/10 text-white/40 hover:text-white/70'}`}
          >
            Set Price
          </button>
        </div>
        {hasPrice && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (KES)">
              <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="75.00" />
            </Field>
            <Field label="Compare-at Price (KES)">
              <input type="number" step="0.01" value={compareAt} onChange={(e) => setCompareAt(e.target.value)} className={inputCls} placeholder="80.00 (optional)" />
            </Field>
            <Field label="Price Unit">
              <input value={priceUnit} onChange={(e) => setPriceUnit(e.target.value)} className={inputCls} placeholder="per kg" />
            </Field>
          </div>
        )}
      </div>

      <Field label="Bulk Pricing Info (optional)">
        <input value={bulkInfo} onChange={(e) => setBulkInfo(e.target.value)} className={inputCls} placeholder="e.g. 10kg+ @ KES 70/kg" />
      </Field>

      {/* Images */}
      <div>
        <label className="mb-2 block text-[10px] font-semibold uppercase tracking-widest text-white/40">Image Paths</label>
        <div className="space-y-2">
          {images.map((img, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={img}
                onChange={(e) => updateImage(i, e.target.value)}
                placeholder="/images/products/..."
                className={`${inputCls} flex-1 font-mono text-xs`}
              />
              {images.length > 1 && (
                <button type="button" onClick={() => removeImage(i)} className="text-white/30 hover:text-red-400 transition-colors px-2">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={addImage} className="mt-2 flex items-center gap-1 text-xs text-brand-leaf hover:text-cream-primary">
          <Plus size={12} /> Add Image
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Sort Order">
          <input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className={inputCls} />
        </Field>
        <div className="flex items-end pb-1">
          <label className="flex cursor-pointer items-center gap-3">
            <div
              role="checkbox"
              aria-checked={available}
              tabIndex={0}
              onClick={() => setAvailable((v) => !v)}
              onKeyDown={(e) => e.key === 'Enter' && setAvailable((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors ${available ? 'bg-brand-leaf' : 'bg-white/10'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${available ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-cream-secondary">Available for sale</span>
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2 border-t border-white/10">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand-leaf px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-mid disabled:opacity-60 transition-colors"
        >
          {loading ? <><Loader2 size={13} className="animate-spin" /> Saving...</> : (isEdit ? 'Save Changes' : 'Create Product')}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white/40 hover:text-cream-primary transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}
