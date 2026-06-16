'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Send } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@clerk/nextjs';
import { z } from 'zod';
import { minimumVisitDate, VISIT_PURPOSES } from '@/lib/booking-utils';

const schema = z.object({
  full_name: z.string().min(2, 'Enter your full name'),
  phone_number: z.string().min(6, 'Enter your phone number'),
  email: z.string().email('Enter a valid email address'),
  visit_date: z.string().min(1, 'Choose a preferred date'),
  visit_time: z.enum(['morning', 'afternoon'], { required_error: 'Choose a preferred time' }),
  group_size: z.coerce.number().int().min(1, 'Group size must be at least 1'),
  purpose: z.string().min(2, 'Choose a purpose'),
  special_requests: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function BookingForm() {
  const { user, isSignedIn } = useUser();
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [confirmation, setConfirmation] = useState<{ reference: string } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const minDate = useMemo(() => minimumVisitDate(), []);

  const { register, handleSubmit, setValue, reset, watch, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { visit_time: 'morning', group_size: 1, purpose: VISIT_PURPOSES[0] },
  });

  const visitDate = watch('visit_date');

  useEffect(() => {
    if (!isSignedIn || !user) return;
    setValue('full_name', user.fullName || '');
    setValue('email', user.primaryEmailAddress?.emailAddress || '');

    fetch('/api/profile')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => {
        if (result?.profile?.phone_number) setValue('phone_number', result.profile.phone_number);
      })
      .catch(() => undefined);
  }, [isSignedIn, setValue, user]);

  useEffect(() => {
    fetch('/api/bookings/availability')
      .then((response) => response.ok ? response.json() : null)
      .then((result) => setUnavailableDates(result?.unavailableDates || []))
      .catch(() => setUnavailableDates([]));
  }, []);

  async function onSubmit(data: FormData) {
    setSubmitError(null);
    if (unavailableDates.includes(data.visit_date)) {
      setSubmitError('That date is unavailable. Please choose another date.');
      return;
    }

    const response = await fetch('/api/bookings/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!response.ok) {
      setSubmitError(result.message || 'Booking could not be submitted.');
      return;
    }

    setConfirmation({ reference: result.booking.reference });
    reset({ visit_time: 'morning', group_size: 1, purpose: VISIT_PURPOSES[0] });
  }

  if (confirmation) {
    return (
      <div className="border border-brand-leaf bg-cream-warm p-8">
        <CheckCircle2 className="mb-5 text-brand-leaf" size={36} aria-hidden="true" />
        <h3 className="font-serif text-3xl text-brand-deep">Request submitted.</h3>
        <p className="mt-4 leading-7 text-brand-deep/75">
          Reference: <strong>{confirmation.reference}</strong>. We&apos;ll confirm within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-farm-border bg-cream-warm p-7 md:p-9">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full Name" error={errors.full_name?.message}><input {...register('full_name')} className="field" /></Field>
        <Field label="Phone Number" error={errors.phone_number?.message}><input {...register('phone_number')} className="field" /></Field>
        <Field label="Email Address" error={errors.email?.message}><input type="email" {...register('email')} className="field" /></Field>
        <Field label="Preferred Date" error={errors.visit_date?.message}>
          <input type="date" min={minDate} {...register('visit_date')} className="field" />
          {visitDate && unavailableDates.includes(visitDate) && <span className="mt-2 block text-xs text-red-700">This date is unavailable.</span>}
        </Field>
        <Field label="Preferred Time" error={errors.visit_time?.message}>
          <select {...register('visit_time')} className="field">
            <option value="morning">Morning (9:00 AM)</option>
            <option value="afternoon">Afternoon (1:00 PM)</option>
          </select>
        </Field>
        <Field label="Group Size" error={errors.group_size?.message}><input type="number" min="1" {...register('group_size')} className="field" /></Field>
      </div>
      <div className="mt-5">
        <Field label="Purpose of Visit" error={errors.purpose?.message}>
          <select {...register('purpose')} className="field">
            {VISIT_PURPOSES.map((purpose) => <option key={purpose}>{purpose}</option>)}
          </select>
        </Field>
      </div>
      <div className="mt-5">
        <Field label="Special Requests" error={errors.special_requests?.message}>
          <textarea rows={5} {...register('special_requests')} className="field" />
        </Field>
      </div>
      {submitError && <p className="mt-5 text-sm font-medium text-red-800">{submitError}</p>}
      <button type="submit" disabled={isSubmitting} className="mt-7 inline-flex items-center gap-2 bg-brand-deep px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary disabled:opacity-60">
        Submit Booking Request <Send size={14} aria-hidden="true" />
      </button>
      <style jsx>{`
        .field {
          width: 100%;
          border: 1px solid #d2c8b4;
          background: #faf5f0;
          padding: 0.8rem 1rem;
          color: #102818;
          outline: none;
        }
        .field:focus {
          border-color: #486018;
        }
      `}</style>
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
