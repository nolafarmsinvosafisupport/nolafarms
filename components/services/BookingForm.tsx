'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Send, UserRound } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useUser } from '@clerk/nextjs';
import { z } from 'zod';
import { minimumVisitDate, VISIT_PURPOSES } from '@/lib/booking-utils';
import { useNotifications } from '@/lib/notification-context';

const field = 'w-full border border-farm-border bg-cream-primary px-4 py-3 text-sm text-brand-deep outline-none focus:border-brand-leaf';

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
  const { user, isSignedIn, isLoaded } = useUser();
  const { isAdmin } = useNotifications();
  const pathname = usePathname();
  const router = useRouter();
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
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
      .then((r) => r.ok ? r.json() : null)
      .then((result) => { if (result?.profile?.phone_number) setValue('phone_number', result.profile.phone_number); })
      .catch(() => undefined);
  }, [isSignedIn, setValue, user]);

  useEffect(() => {
    fetch('/api/bookings/availability')
      .then((r) => r.ok ? r.json() : null)
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
    reset({ visit_time: 'morning', group_size: 1, purpose: VISIT_PURPOSES[0] });
    router.push(`/booking-confirmed?ref=${encodeURIComponent(result.booking.reference)}`);
  }

  if (!isLoaded) {
    return <div className="border border-farm-border bg-cream-warm p-10 animate-pulse h-40" />;
  }

  // Admin accounts browse the storefront but don't submit bookings themselves —
  // they view what visitors have booked instead (see /admin/bookings).
  if (isAdmin) return null;

  if (!isSignedIn) {
    return (
      <div className="border border-farm-border bg-cream-warm p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-farm-border bg-cream-primary">
          <UserRound size={24} className="text-brand-deep/50" />
        </div>
        <h3 className="mt-5 font-serif text-2xl text-brand-deep">Sign in to Book a Visit</h3>
        <p className="mt-3 max-w-sm mx-auto text-sm leading-6 text-brand-deep/65">
          You&apos;ll need an account to submit a visit request so we can track your bookings and notify you of updates.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/sign-in?redirect_url=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 bg-brand-deep px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary"
          >
            Sign In to Continue
          </Link>
          <Link
            href={`/sign-up?redirect_url=${encodeURIComponent(pathname)}`}
            className="inline-flex items-center gap-2 border border-farm-border px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-farm-border"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="border border-farm-border bg-cream-warm p-7 md:p-9">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Full Name" error={errors.full_name?.message}><input {...register('full_name')} className={field} /></Field>
        <Field label="Phone Number" error={errors.phone_number?.message}><input {...register('phone_number')} className={field} /></Field>
        <Field label="Email Address" error={errors.email?.message}><input type="email" {...register('email')} className={field} /></Field>
        <Field label="Preferred Date" error={errors.visit_date?.message}>
          <input type="date" min={minDate} {...register('visit_date')} className={field} />
          {visitDate && unavailableDates.includes(visitDate) && (
            <span className="mt-2 block text-xs text-red-700">This date is unavailable.</span>
          )}
        </Field>
        <Field label="Preferred Time" error={errors.visit_time?.message}>
          <select {...register('visit_time')} className={field}>
            <option value="morning">Morning (9:00 AM)</option>
            <option value="afternoon">Afternoon (1:00 PM)</option>
          </select>
        </Field>
        <Field label="Group Size" error={errors.group_size?.message}>
          <input type="number" min="1" {...register('group_size')} className={field} />
        </Field>
      </div>
      <div className="mt-5">
        <Field label="Purpose of Visit" error={errors.purpose?.message}>
          <select {...register('purpose')} className={field}>
            {VISIT_PURPOSES.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
      </div>
      <div className="mt-5">
        <Field label="Special Requests" error={errors.special_requests?.message}>
          <textarea rows={4} {...register('special_requests')} className={field} />
        </Field>
      </div>
      {submitError && <p className="mt-5 text-sm font-medium text-red-800">{submitError}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-7 inline-flex items-center gap-2 bg-brand-deep px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary disabled:opacity-60"
      >
        {isSubmitting ? 'Submitting…' : 'Submit Booking Request'} <Send size={14} aria-hidden="true" />
      </button>
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
