'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { AdminImageUploader } from './AdminImageUploader';
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
  const [details, setDetails] = useState<string[]>(product?.details?.length ? product.details : ['']);
  const [hasPrice, setHasPrice] = useState(product ? product.price !== null : false);
  const [price, setPrice] = useState(product?.price ?? '');
  const [compareAt, setCompareAt] = useState(product?.compare_at_price ?? '');
  const [priceUnit, setPriceUnit] = useState(product?.price_unit ?? 'per kg');
  const [bulkInfo, setBulkInfo] = useState(product?.bulk_info ?? '');
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [isService, setIsService] = useState(product?.is_service ?? false);
  const [available, setAvailable] = useState(product?.available ?? true);
  const [inStock, setInStock] = useState(product?.in_stock ?? true);
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
        price: hasPrice && price ? parseFloat(String(price)) : null,
        compare_at_price: hasPrice && compareAt ? parseFloat(String(compareAt)) : null,
        price_unit: priceUnit,
        bulk_info: bulkInfo || null,
        images: images.filter(Boolean),
        available,
        sort_order: parseInt(sortOrder) || 0,
        is_service: isService,
        in_stock: inStock,
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

  const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50';
  const inputCls = 'w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf placeholder:text-brand-deep/30';

  const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Name + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Product Name *">
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputCls}
            placeholder="e.g. Broad Leaf Swiss Spinach"
          />
        </Field>
        <Field label="Slug (URL) *">
          <input
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={`${inputCls} font-mono text-xs`}
            placeholder="e.g. swiss-spinach"
          />
        </Field>
      </div>

      {/* Category + Ranch */}
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

      {/* Description */}
      <Field label="Description">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Short description of the product..."
        />
      </Field>

      {/* Details / bullet points */}
      <div>
        <label className={labelCls}>Product Details (bullet points)</label>
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
                <button
                  type="button"
                  onClick={() => removeDetail(i)}
                  className="px-2 text-brand-deep/30 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addDetail}
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-leaf hover:text-brand-deep transition-colors"
        >
          <Plus size={12} /> Add Detail
        </button>
      </div>

      {/* Pricing */}
      <div className="border border-farm-border bg-cream-secondary p-4">
        <label className={labelCls}>Pricing</label>
        <div className="mb-4 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHasPrice(false)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              !hasPrice
                ? 'bg-amber-600 text-white'
                : 'border border-farm-border bg-cream-primary text-brand-deep/60 hover:border-brand-deep/30'
            }`}
          >
            Contact for Price
          </button>
          <button
            type="button"
            onClick={() => setHasPrice(true)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              hasPrice
                ? 'bg-brand-leaf text-white'
                : 'border border-farm-border bg-cream-primary text-brand-deep/60 hover:border-brand-deep/30'
            }`}
          >
            Set a Price
          </button>
        </div>
        {hasPrice && (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Price (KES)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className={inputCls}
                placeholder="75.00"
              />
            </Field>
            <Field label="Compare-at Price (KES)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
                className={inputCls}
                placeholder="80.00 (for sale price)"
              />
            </Field>
            <Field label="Price Unit">
              <input
                value={priceUnit}
                onChange={(e) => setPriceUnit(e.target.value)}
                className={inputCls}
                placeholder="per kg"
              />
            </Field>
          </div>
        )}
      </div>

      {/* Bulk info */}
      <Field label="Bulk Pricing Info (optional)">
        <input
          value={bulkInfo}
          onChange={(e) => setBulkInfo(e.target.value)}
          className={inputCls}
          placeholder="e.g. 10kg+ @ KES 70/kg"
        />
      </Field>

      {/* Images */}
      <AdminImageUploader images={images.filter(Boolean)} onChange={setImages} />

      {/* Service toggle */}
      <div className="flex items-center pb-1">
        <label className="flex cursor-pointer items-center gap-3">
          <div
            role="checkbox"
            aria-checked={isService}
            tabIndex={0}
            onClick={() => setIsService((v) => !v)}
            onKeyDown={(e) => e.key === 'Enter' && setIsService((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition-colors ${isService ? 'bg-brand-leaf' : 'bg-brand-deep/20'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                isService ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-brand-deep">
            This is a service, not a physical item
            <span className="block text-xs font-normal text-brand-deep/50">
              Replaces Add-to-Cart with a &quot;Request This Service&quot; WhatsApp button (e.g. boar hire).
            </span>
          </span>
        </label>
      </div>

      {/* Sort order */}
      <Field label="Sort Order">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={`${inputCls} max-w-xs`}
        />
      </Field>

      {/* Available + In Stock toggles */}
      <div className="grid gap-4 border border-farm-border bg-cream-secondary p-4 sm:grid-cols-2">
        <label className="flex cursor-pointer items-center gap-3">
          <div
            role="checkbox"
            aria-checked={available}
            tabIndex={0}
            onClick={() => setAvailable((v) => !v)}
            onKeyDown={(e) => e.key === 'Enter' && setAvailable((v) => !v)}
            className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${available ? 'bg-brand-leaf' : 'bg-brand-deep/20'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                available ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-brand-deep">
            {available ? 'Visible to customers' : 'Hidden from customers'}
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-3">
          <div
            role="checkbox"
            aria-checked={inStock}
            tabIndex={0}
            onClick={() => setInStock((v) => !v)}
            onKeyDown={(e) => e.key === 'Enter' && setInStock((v) => !v)}
            className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${inStock ? 'bg-brand-leaf' : 'bg-brand-deep/20'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                inStock ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </div>
          <span className="text-sm font-medium text-brand-deep">
            {inStock ? 'In stock' : 'Out of stock'}
            <span className="block text-xs font-normal text-brand-deep/50">Stays visible, but Add-to-Cart is replaced with an Out of Stock badge.</span>
          </span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-3 border-t border-farm-border pt-5">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-brand-leaf px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-deep disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <><Loader2 size={13} className="animate-spin" /> Saving...</>
          ) : (
            isEdit ? 'Save Changes' : 'Create Product'
          )}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-brand-deep/50 hover:text-brand-deep transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
