import { SITE } from './constants';
import { VISIT_TIMES } from './booking-utils';
import type { Booking } from './booking-types';

/**
 * WhatsApp click-to-chat helpers.
 *
 * Everything here builds a `wa.me` deep link — a link that opens the VISITOR's WhatsApp with a
 * message pre-filled and addressed to the ranch. Nothing in this file sends anything: the app has
 * no WhatsApp Business API credentials, and a WhatsApp Business number cannot message itself
 * anyway, so an automatic server-side send would need a second sender number and an approved Meta
 * template. See the booking-confirmed CTA for how this is used.
 */

// The PLACEHOLDER guard was copy-pasted into ~6 components. It lives here now.
export function whatsappNumber(): string {
  return SITE.whatsapp !== 'PLACEHOLDER_WHATSAPP_NUMBER' ? SITE.whatsapp : '254750958780';
}

export function whatsappHref(message: string): string {
  return `https://wa.me/${whatsappNumber()}?text=${encodeURIComponent(message)}`;
}

function formatVisitDate(dateStr: string): string {
  // Noon avoids the date sliding a day either way across timezones.
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(`${dateStr}T12:00:00`));
}

/**
 * The message body a visitor sends to the ranch after booking.
 *
 * Mirrors detailsTable() in lib/email.ts so WhatsApp and the admin email carry the same facts —
 * if one gains a field, the other should too.
 */
export function bookingWhatsAppMessage(booking: Booking): string {
  const lines = [
    `Hello Nola Ranches, I've just submitted a visit booking.`,
    '',
    `Ref: ${booking.reference}`,
    `Name: ${booking.full_name}`,
    `Phone: ${booking.phone_number}`,
    `Date: ${formatVisitDate(booking.visit_date)}`,
    `Time: ${VISIT_TIMES[booking.visit_time]}`,
    `Group size: ${booking.group_size} ${booking.group_size === 1 ? 'person' : 'people'}`,
    `Purpose: ${booking.purpose}`,
  ];

  if (booking.special_requests) {
    lines.push(`Special requests: ${booking.special_requests}`);
  }

  return lines.join('\n');
}
