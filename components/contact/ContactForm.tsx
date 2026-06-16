'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  fullName: z.string().min(2, 'Enter your full name'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Enter a phone number'),
  subject: z.string().min(1, 'Select a subject'),
  message: z.string().min(10, 'Tell us a little more'),
});

type FormData = z.infer<typeof schema>;

export function ContactForm() {
  const [status, setStatus] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { subject: '' },
  });

  async function onSubmit(data: FormData) {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setStatus('Message received. We will respond via phone, email, or WhatsApp.');
      reset();
      return;
    }

    window.location.href = `mailto:PLACEHOLDER_EMAIL?subject=${encodeURIComponent(data.subject)}&body=${encodeURIComponent(data.message)}`;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full Name" error={errors.fullName?.message}><input {...register('fullName')} className="w-full border border-farm-border bg-cream-warm px-4 py-3 outline-none focus:border-brand-leaf" /></Field>
        <Field label="Email" error={errors.email?.message}><input type="email" {...register('email')} className="w-full border border-farm-border bg-cream-warm px-4 py-3 outline-none focus:border-brand-leaf" /></Field>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Phone" error={errors.phone?.message}><input {...register('phone')} className="w-full border border-farm-border bg-cream-warm px-4 py-3 outline-none focus:border-brand-leaf" /></Field>
        <Field label="Subject" error={errors.subject?.message}>
          <select {...register('subject')} className="w-full border border-farm-border bg-cream-warm px-4 py-3 outline-none focus:border-brand-leaf">
            <option value="">Select subject</option>
            <option>General Enquiry</option>
            <option>Ranch Visit</option>
            <option>Livestock</option>
            <option>Wholesale</option>
            <option>Other</option>
          </select>
        </Field>
      </div>
      <Field label="Message" error={errors.message?.message}>
        <textarea {...register('message')} rows={6} className="w-full border border-farm-border bg-cream-warm px-4 py-3 outline-none focus:border-brand-leaf" />
      </Field>
      <button type="submit" disabled={isSubmitting} className="inline-flex items-center gap-2 bg-brand-deep px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary disabled:opacity-60">
        Send Message <Send size={14} aria-hidden="true" />
      </button>
      {status && <p className="text-sm font-medium text-brand-leaf">{status}</p>}
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-brand-deep">
      <span className="mb-2 block">{label}</span>
      {children}
      {error && <span className="mt-2 block text-xs text-red-700">{error}</span>}
    </label>
  );
}
