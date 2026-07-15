'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import { AdminImageUploader } from './AdminImageUploader';
import type { ProductCategoryPage } from '@/lib/category-types';
import type { ProductCategory } from '@/lib/product-types';
import { CATEGORY_LABELS } from '@/lib/product-types';

const CATEGORY_VALUE_OPTIONS = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const labelCls = 'mb-1 block text-[10px] font-semibold uppercase tracking-widest text-brand-deep/50';
const inputCls = 'w-full border border-farm-border bg-cream-primary px-3 py-2 text-sm text-brand-deep outline-none focus:border-brand-leaf placeholder:text-brand-deep/30';

// Hoisted to module scope, not defined inside AdminCategoryForm — a component defined inside
// another component's body is a new function identity every render, so React remounted the
// underlying <input>/<textarea> (and lost focus/cursor) after every single keystroke.
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => e.key === 'Enter' && onChange(!checked)}
        className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors ${checked ? 'bg-brand-leaf' : 'bg-brand-deep/20'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="text-sm font-medium text-brand-deep">
        {label}
        {hint && <span className="block text-xs font-normal text-brand-deep/50">{hint}</span>}
      </span>
    </label>
  );
}

type Props = { category?: ProductCategoryPage; mainCategories: ProductCategoryPage[] };

export function AdminCategoryForm({ category, mainCategories }: Props) {
  const router = useRouter();
  const isEdit = Boolean(category);

  const [name, setName] = useState(category?.name ?? '');
  const [slug, setSlug] = useState(category?.slug ?? '');
  const [subtitle, setSubtitle] = useState(category?.subtitle ?? '');
  const [heroDescription, setHeroDescription] = useState(category?.hero_description ?? '');
  const [heroImage, setHeroImage] = useState<string[]>(category?.hero_image ? [category.hero_image] : []);
  const [categoryValues, setCategoryValues] = useState<ProductCategory[]>(
    (category?.category_values as ProductCategory[]) ?? [],
  );
  const [ctaLabel, setCtaLabel] = useState(category?.cta_label ?? '');
  const [whatsappMessage, setWhatsappMessage] = useState(category?.whatsapp_message ?? '');
  const [details, setDetails] = useState<string[]>(category?.details?.length ? category.details : ['']);
  const [sortOrder, setSortOrder] = useState(String(category?.sort_order ?? '0'));
  const [parentId, setParentId] = useState(category?.parent_id ?? '');
  const [active, setActive] = useState(category?.active ?? true);
  const [comingSoon, setComingSoon] = useState(category?.coming_soon ?? false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isMain = parentId === '';
  // A main category can't be parented to itself.
  const parentOptions = mainCategories.filter((c) => c.id !== category?.id);

  function handleNameChange(v: string) {
    setName(v);
    if (!isEdit) setSlug(slugify(v));
  }

  function toggleCategoryValue(value: ProductCategory) {
    setCategoryValues((vals) => (vals.includes(value) ? vals.filter((v) => v !== value) : [...vals, value]));
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
        subtitle: subtitle || null,
        hero_image: heroImage[0] || null,
        hero_description: heroDescription || null,
        category_values: categoryValues,
        cta_label: ctaLabel || null,
        whatsapp_message: whatsappMessage || null,
        details: details.filter(Boolean),
        sort_order: parseInt(sortOrder) || 0,
        parent_id: parentId || null,
        active,
        coming_soon: isMain ? comingSoon : false,
      };
      const url = isEdit ? `/api/categories/${category!.id}` : '/api/categories';
      const method = isEdit ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Save failed.');
      router.push('/admin/categories');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      {error && (
        <div className="border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {/* Name + Slug */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Category Name *">
          <input
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            className={inputCls}
            placeholder="e.g. Goats & Sheep"
          />
        </Field>
        <Field label="Slug (URL) *">
          <input
            required
            value={slug}
            onChange={(e) => setSlug(slugify(e.target.value))}
            className={`${inputCls} font-mono text-xs`}
            placeholder="e.g. goats-sheep"
          />
        </Field>
      </div>

      {/* Parent category */}
      <Field label="Parent Category">
        <select value={parentId} onChange={(e) => setParentId(e.target.value)} className={inputCls}>
          <option value="">— None (this is a main category on /products) —</option>
          {parentOptions.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </Field>

      <Field label="Subtitle">
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className={inputCls}
          placeholder="e.g. Premium Meat Breeds Adapted for Kajiado"
        />
      </Field>

      {/* Underlying product categories this page groups */}
      <div>
        <label className={labelCls}>Includes Products From *</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORY_VALUE_OPTIONS.map(([val, lbl]) => (
            <button
              key={val}
              type="button"
              onClick={() => toggleCategoryValue(val)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                categoryValues.includes(val)
                  ? 'bg-brand-leaf text-white'
                  : 'border border-farm-border bg-cream-primary text-brand-deep/60 hover:border-brand-deep/30'
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Hero description */}
      <Field label="Hero Description">
        <textarea
          value={heroDescription}
          onChange={(e) => setHeroDescription(e.target.value)}
          rows={3}
          className={`${inputCls} resize-none`}
          placeholder="Main description shown under the category hero photo..."
        />
      </Field>

      {/* Details / bullet points */}
      <div>
        <label className={labelCls}>Key Points (bullet points)</label>
        <div className="space-y-2">
          {details.map((d, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={d}
                onChange={(e) => updateDetail(i, e.target.value)}
                placeholder={`Point ${i + 1}`}
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
          <Plus size={12} /> Add Point
        </button>
      </div>

      {/* WhatsApp CTA */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="CTA Button Label">
          <input
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
            className={inputCls}
            placeholder="e.g. View Available Sales Stock"
          />
        </Field>
        <Field label="WhatsApp Message">
          <input
            value={whatsappMessage}
            onChange={(e) => setWhatsappMessage(e.target.value)}
            className={inputCls}
            placeholder="Pre-filled enquiry text"
          />
        </Field>
      </div>

      {/* Hero image */}
      <AdminImageUploader images={heroImage.filter(Boolean)} onChange={(imgs) => setHeroImage(imgs.slice(-1))} label="Hero Image" />

      {/* Active + Coming Soon toggles */}
      <div className="space-y-4 border border-farm-border bg-cream-secondary p-4">
        <Toggle
          checked={active}
          onChange={setActive}
          label={active ? 'Visible to customers' : 'Hidden from customers'}
          hint="Turning this off also hides every product in it, everywhere on the site."
        />
        {isMain && (
          <Toggle
            checked={comingSoon}
            onChange={setComingSoon}
            label="Coming Soon"
            hint="Shows the tile on /products (non-clickable) without listing its products yet — useful for seasonal categories."
          />
        )}
      </div>

      {/* Sort order */}
      <Field label="Sort Order">
        <input
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className={inputCls}
        />
      </Field>

      {/* Submit */}
      <div className="flex gap-3 border-t border-farm-border pt-5">
        <button
          type="submit"
          disabled={loading || categoryValues.length === 0}
          className="flex items-center gap-2 bg-brand-leaf px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-brand-deep disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <><Loader2 size={13} className="animate-spin" /> Saving...</>
          ) : (
            isEdit ? 'Save Changes' : 'Create Category'
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
