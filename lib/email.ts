import { Resend } from 'resend';
import type { Booking } from './booking-types';
import { SITE } from './constants';
import { VISIT_TIMES } from './booking-utils';

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

function fromEmail() {
  return process.env.RESEND_FROM_EMAIL || 'bookings@nolafarms.co.ke';
}

function adminEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || SITE.email;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const client = getResend();
  if (!client || !to || to.includes('PLACEHOLDER')) {
    console.log('Email skipped until Resend is configured:', { to, subject });
    return;
  }

  await client.emails.send({ from: fromEmail(), to, subject, html });
}

function bookingHtml(booking: Booking, intro: string, note?: string | null) {
  return `
    <div style="font-family:Inter,Arial,sans-serif;color:#102818;line-height:1.6">
      <h1 style="font-family:Georgia,serif;color:#102818">Nola Farms</h1>
      <p>${intro}</p>
      <ul>
        <li><strong>Reference:</strong> ${booking.reference}</li>
        <li><strong>Name:</strong> ${booking.full_name}</li>
        <li><strong>Date:</strong> ${booking.visit_date}</li>
        <li><strong>Time:</strong> ${VISIT_TIMES[booking.visit_time]}</li>
        <li><strong>Group size:</strong> ${booking.group_size}</li>
        <li><strong>Purpose:</strong> ${booking.purpose}</li>
      </ul>
      ${note ? `<p><strong>Note:</strong> ${note}</p>` : ''}
    </div>
  `;
}

export async function sendBookingReceivedEmails(booking: Booking) {
  await Promise.all([
    sendEmail({
      to: booking.email,
      subject: `We've received your booking request - ${booking.reference}`,
      html: bookingHtml(booking, `Request submitted. We'll confirm within 24 hours.`),
    }),
    sendEmail({
      to: adminEmail(),
      subject: `New booking - ${booking.full_name} on ${booking.visit_date} ${booking.reference}`,
      html: bookingHtml(booking, 'A new booking requires review in the admin dashboard.'),
    }),
  ]);
}

export async function sendStatusEmail(booking: Booking, action: 'approved' | 'rejected' | 'cancelled' | 'completed', note?: string | null) {
  const subject = {
    approved: `Your Nola Farms visit is confirmed - ${booking.visit_date}`,
    rejected: `Update on your booking request ${booking.reference}`,
    cancelled: `Your booking has been cancelled ${booking.reference}`,
    completed: `Nola Farms visit completed ${booking.reference}`,
  }[action];

  const intro = {
    approved: `Your visit to Nola Farms is confirmed for ${booking.visit_date}.`,
    rejected: `Unfortunately we cannot accommodate your visit on ${booking.visit_date}.`,
    cancelled: `Your booking has been cancelled.`,
    completed: `This booking has been marked completed.`,
  }[action];

  await Promise.all([
    sendEmail({ to: booking.email, subject, html: bookingHtml(booking, intro, note) }),
    sendEmail({ to: adminEmail(), subject: `Admin copy - ${subject}`, html: bookingHtml(booking, intro, note) }),
  ]);
}
