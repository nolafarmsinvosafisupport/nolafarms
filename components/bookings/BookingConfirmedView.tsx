'use client';

import { motion } from 'framer-motion';
import { ArrowRight, CalendarDays, Check, Clock, Image as ImageIcon, MapPin, MessageCircle, Package, Users } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Booking } from '@/lib/booking-types';
import { VISIT_TIMES } from '@/lib/booking-utils';
import { bookingWhatsAppMessage, whatsappHref } from '@/lib/whatsapp';

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(dateStr + 'T12:00:00'));
}

const exploreLinks = [
  {
    href: '/products',
    icon: Package,
    title: 'Our Livestock',
    desc: 'Browse our cattle, goats, sheep and pigs — vaccinated, farm-recorded and raised with trusted genetics.',
  },
  {
    href: '/gallery',
    icon: ImageIcon,
    title: 'Livestock Gallery',
    desc: 'A visual journey through the herds at Nola Ranches — the animals, the ranches, and the people behind them.',
  },
  {
    href: '/about',
    icon: MapPin,
    title: 'About the Ranch',
    desc: 'Learn our story — quality-first livestock farming and trusted genetics across Oloitoktok and Laikipia.',
  },
];

const timelineSteps = [
  { label: 'Request Submitted', sub: 'We have received your request', done: true, active: false },
  { label: 'Under Review', sub: 'Farm team reviewing your request', done: false, active: true },
  { label: 'Confirmation Sent', sub: 'Via email within 24 hours', done: false, active: false },
];

export function BookingConfirmedView({ booking, sendToWhatsapp = false }: { booking: Booking; sendToWhatsapp?: boolean }) {
  const [copied, setCopied] = useState(false);

  // Tell the NotificationBell to refresh immediately — the booking API
  // creates a notification at submission time so the badge + sound fire now.
  useEffect(() => {
    window.dispatchEvent(new Event('nola:notif:refresh'));
  }, []);

  function copyRef() {
    navigator.clipboard.writeText(booking.reference).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-cream-primary pt-16">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 section-y-sm text-center lg:px-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.1 }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-leaf"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Check size={36} strokeWidth={3} className="text-cream-primary" />
          </motion.div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-7 font-serif text-4xl text-brand-deep md:text-5xl"
        >
          Visit Request Submitted
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="mt-4 text-brand-deep/65 leading-7"
        >
          We&apos;ll review your request and confirm within 24 hours.
          A confirmation has been sent to <strong>{booking.email}</strong>.
        </motion.p>

        {/* Reference */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.4 }}
          className="mt-8 inline-flex items-center gap-4 border border-farm-border bg-cream-warm px-6 py-4"
        >
          <div className="text-left">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-deep/40">Your Reference</p>
            <p className="mt-0.5 font-serif text-2xl font-medium text-brand-deep">{booking.reference}</p>
          </div>
          <button
            type="button"
            onClick={copyRef}
            className="ml-2 border border-farm-border px-4 py-2 text-xs font-semibold uppercase tracking-widest text-brand-deep transition-colors hover:bg-brand-deep hover:text-cream-primary"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </motion.div>

        {/* The visitor ticked "also send to WhatsApp". This opens THEIR WhatsApp with the details
            pre-filled and addressed to the ranch — they still press send. The booking is already
            saved and the emails have already gone out, so this is a faster way to reach the team,
            never a step that completes the booking. The copy has to say so. */}
        {sendToWhatsapp && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.4 }}
            className="mt-8"
          >
            <a
              href={whatsappHref(bookingWhatsAppMessage(booking))}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-600 px-8 py-4 text-xs font-semibold uppercase tracking-widest text-white transition-colors hover:bg-green-700"
            >
              <MessageCircle size={16} aria-hidden="true" />
              Send Details on WhatsApp
            </a>
            <p className="mx-auto mt-3 max-w-sm text-xs leading-5 text-brand-deep/50">
              Your booking is already submitted and confirmed by email. This just opens WhatsApp with
              your details ready to send, so the team can reply to you there.
            </p>
          </motion.div>
        )}
      </section>

      {/* Details + Timeline */}
      <section className="border-t border-farm-border bg-cream-secondary">
        <div className="mx-auto grid max-w-5xl gap-8 px-6 py-16 md:grid-cols-2 lg:px-8">

          {/* Booking summary */}
          <div>
            <h2 className="font-serif text-2xl text-brand-deep">Booking Summary</h2>
            <dl className="mt-6 divide-y divide-farm-border border border-farm-border bg-cream-warm">
              {[
                { icon: CalendarDays, label: 'Date', value: formatDate(booking.visit_date) },
                { icon: Clock, label: 'Time', value: VISIT_TIMES[booking.visit_time] },
                { icon: Users, label: 'Group Size', value: `${booking.group_size} ${booking.group_size === 1 ? 'person' : 'people'}` },
                { icon: Package, label: 'Purpose', value: booking.purpose },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-4 px-5 py-4">
                  <Icon size={16} className="mt-0.5 flex-shrink-0 text-brand-leaf" />
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-widest text-brand-deep/40">{label}</dt>
                    <dd className="mt-0.5 text-sm text-brand-deep">{value}</dd>
                  </div>
                </div>
              ))}
              {booking.special_requests && (
                <div className="px-5 py-4">
                  <dt className="text-xs font-semibold uppercase tracking-widest text-brand-deep/40">Special Requests</dt>
                  <dd className="mt-1 text-sm text-brand-deep">{booking.special_requests}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* What happens next */}
          <div>
            <h2 className="font-serif text-2xl text-brand-deep">What Happens Next</h2>
            <ol className="mt-6 space-y-0">
              {timelineSteps.map((step, i) => (
                <li key={step.label} className="flex gap-4">
                  {/* Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                      step.done
                        ? 'border-brand-leaf bg-brand-leaf text-cream-primary'
                        : step.active
                        ? 'border-gold-warm bg-gold-warm/10 text-gold-warm'
                        : 'border-farm-border bg-cream-warm text-brand-deep/30'
                    }`}>
                      {step.done ? (
                        <Check size={14} strokeWidth={3} />
                      ) : (
                        <span className="text-xs font-bold">{i + 1}</span>
                      )}
                    </div>
                    {i < timelineSteps.length - 1 && (
                      <div className={`mt-1 w-0.5 flex-1 min-h-[2rem] ${step.done ? 'bg-brand-leaf' : 'bg-farm-border'}`} />
                    )}
                  </div>
                  {/* Content */}
                  <div className="pb-8">
                    <p className={`text-sm font-semibold ${step.done ? 'text-brand-leaf' : step.active ? 'text-brand-deep' : 'text-brand-deep/40'}`}>
                      {step.label}
                    </p>
                    <p className="mt-0.5 text-xs text-brand-deep/50">{step.sub}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* CTAs */}
      <section className="border-t border-farm-border bg-cream-primary">
        <div className="mx-auto max-w-3xl px-6 py-14 text-center lg:px-8">
          <p className="text-sm text-brand-deep/60">
            Check your booking status anytime in your account.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/account/bookings"
              className="inline-flex items-center gap-2 bg-brand-deep px-8 py-4 text-xs font-semibold uppercase tracking-widest text-cream-primary hover:bg-brand-primary"
            >
              View My Bookings <ArrowRight size={14} />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-farm-border px-8 py-4 text-xs font-semibold uppercase tracking-widest text-brand-deep hover:bg-farm-border"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </section>

      {/* Explore while you wait */}
      <section className="border-t border-farm-border bg-cream-secondary">
        <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8">
          <div className="text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-leaf">While You Wait</p>
            <h2 className="mt-2 font-serif text-3xl text-brand-deep">Discover More About Nola Ranches</h2>
            <p className="mt-3 text-sm text-brand-deep/60">Your visit is just the beginning. Explore what makes Nola Ranches special.</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {exploreLinks.map(({ href, icon: Icon, title, desc }) => (
              <Link
                key={href}
                href={href}
                className="group flex flex-col border border-farm-border bg-cream-warm p-6 transition-colors hover:border-brand-leaf hover:bg-cream-primary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-farm-border bg-cream-primary group-hover:border-brand-leaf">
                  <Icon size={18} className="text-brand-leaf" />
                </div>
                <h3 className="mt-5 font-serif text-xl text-brand-deep">{title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-brand-deep/60">{desc}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-brand-leaf">
                  Explore <ArrowRight size={12} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
