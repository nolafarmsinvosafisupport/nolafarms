import { Resend } from 'resend';
import type { Booking } from './booking-types';
import { SITE } from './constants';
import { VISIT_TIMES } from './booking-utils';
import { getDb, isDbConfigured } from './db';
import type { Order, OrderStatus } from './product-types';
import { parseOrderItems } from './product-types';

let resend: Resend | null = null;

function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

// The mailbox is a no-reply sender — must be on the Resend-verified domain
// (nolaranches.co.ke). Wrapped in a friendly display name for deliverability.
function fromEmail() {
  const address = process.env.RESEND_FROM_EMAIL || 'notifications@nolaranches.co.ke';
  return `Nola Ranches <${address}>`;
}

// Resolution order, most specific first: the admin-editable farm_settings row (self-service,
// no redeploy needed) → the ADMIN_NOTIFICATION_EMAIL env var (ops-controlled) → SITE.email
// (the public contact address, as a last-resort default).
async function adminEmail(): Promise<string> {
  if (isDbConfigured()) {
    try {
      const sql = getDb();
      const [settings] = await sql<[{ admin_notification_email: string | null }]>`
        SELECT admin_notification_email FROM farm_settings WHERE id = 1
      `;
      if (settings?.admin_notification_email) return settings.admin_notification_email;
    } catch {
      // Fall through to the env var / constant below — a farm_settings lookup failure
      // must never be the reason an admin notification silently goes nowhere.
    }
  }
  return process.env.ADMIN_NOTIFICATION_EMAIL || SITE.email;
}

async function sendEmail({ to, subject, html, replyTo }: { to: string; subject: string; html: string; replyTo?: string }) {
  const client = getResend();
  if (!client || !to || to.includes('PLACEHOLDER')) {
    console.log('Email skipped (Resend not configured):', { to, subject });
    return;
  }
  // The sender is a no-reply mailbox, but for contact enquiries we set reply-to to the
  // customer so the admin can just hit Reply and reach them directly.
  await client.emails.send({ from: fromEmail(), to, subject, html, ...(replyTo ? { replyTo } : {}) });
}

async function getNotifyPrefs(userId: string | null) {
  if (!userId || !isDbConfigured()) return { confirm: true, reminder: true, rejection: true };
  try {
    const sql = getDb();
    const [profile] = await sql<[{ notify_on_confirm: boolean; notify_on_reminder: boolean; notify_on_rejection: boolean }]>`
      SELECT notify_on_confirm, notify_on_reminder, notify_on_rejection
      FROM user_profiles
      WHERE clerk_user_id = ${userId}
    `;
    return {
      confirm: profile?.notify_on_confirm ?? true,
      reminder: profile?.notify_on_reminder ?? true,
      rejection: profile?.notify_on_rejection ?? true,
    };
  } catch {
    return { confirm: true, reminder: true, rejection: true };
  }
}

// ---------------------------------------------------------------------------
// HTML builders
// ---------------------------------------------------------------------------

const brand = {
  green: '#1E3C28', leaf: '#486018', cream: '#FAF5F0', gold: '#D4A76A', muted: '#7A8C7E',
};

const displayWhatsapp = `+${SITE.whatsapp}`;

function baseLayout(content: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${brand.cream};font-family:Inter,Arial,sans-serif;color:${brand.green}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${brand.cream}">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="background:${brand.green};padding:36px 40px;text-align:center">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin:0 auto">
            <tr><td width="130" height="130" align="center" valign="middle" style="background:#ffffff;border-radius:65px;width:130px;height:130px">
              <img src="${SITE.url}/images/logos/email-logo.png" width="100" height="61" alt="Nola Ranches" style="display:block;border:0;outline:none;text-decoration:none" />
            </td></tr>
          </table>
          <p style="margin:16px 0 0;font-size:12px;color:${brand.gold};letter-spacing:0.15em;text-transform:uppercase">2 Ranches 1 Home</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:40px">${content}</td></tr>
        <tr><td style="background:${brand.green};padding:24px 40px;text-align:center">
          <p style="margin:0 0 8px;font-size:12px;color:${brand.muted}">WhatsApp <a href="https://wa.me/${SITE.whatsapp}" style="color:${brand.gold};text-decoration:underline">${displayWhatsapp}</a> &bull; <a href="${SITE.url}" style="color:${brand.gold};text-decoration:underline">${SITE.url.replace(/^https?:\/\//, '')}</a></p>
          <p style="margin:0;font-size:11px;color:${brand.muted};line-height:1.6">This is an automated, no-reply message — please don't reply to this email. For help, WhatsApp us or use the contact form on our website.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function detailsTable(booking: Booking) {
  const rows = [
    ['Reference', booking.reference], ['Name', booking.full_name],
    ['Phone', booking.phone_number],
    ['Date', booking.visit_date], ['Time', VISIT_TIMES[booking.visit_time]],
    ['Group size', `${booking.group_size} ${booking.group_size === 1 ? 'person' : 'people'}`],
    ['Purpose', booking.purpose],
    ...(booking.special_requests ? [['Special requests', booking.special_requests]] : []),
  ];
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse">
    ${rows.map(([l, v]) => `<tr>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;width:38%;font-size:13px;font-weight:600;color:${brand.green}">${l}</td>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green}">${escapeHtml(String(v))}</td>
    </tr>`).join('')}
  </table>`;
}

function ctaRow(buttons: { label: string; href: string }[]) {
  const cell = (b: { label: string; href: string }) => `<td width="${Math.floor(100 / buttons.length)}%" align="center">
      <a href="${b.href}" style="display:block;background:${brand.green};color:${brand.cream};padding:12px 8px;font-size:10.5px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;text-decoration:none;text-align:center">${b.label}</a>
    </td>`;
  return `<table width="100%" cellpadding="0" cellspacing="0" border="0" role="presentation" style="margin-top:32px">
    <tr>${buttons.map((b, i) => (i === 0 ? '' : '<td width="8"></td>') + cell(b)).join('')}</tr>
  </table>`;
}

function noteBlock(note?: string | null) {
  if (!note) return '';
  return `<div style="margin-top:24px;border-left:3px solid ${brand.gold};padding:12px 16px;background:#FBF6ED">
    <p style="margin:0;font-size:13px;color:${brand.green}"><strong>Note from Nola Ranches:</strong> ${note}</p>
  </div>`;
}

function buildReceivedVisitorHtml(booking: Booking) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">We've received your booking request</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">Reference: ${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Thank you for your interest in visiting Nola Ranches. We will confirm within <strong>24 hours</strong>.</p>
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Questions? WhatsApp us at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

function buildReceivedAdminHtml(booking: Booking) {
  const url = `${SITE.url}/admin/bookings/${booking.id}`;
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">New Booking — Action Required</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">A new booking request is awaiting your approval.</p>
    ${detailsTable(booking)}
    <div style="margin-top:32px"><a href="${url}" style="display:inline-block;background:${brand.green};color:${brand.cream};padding:14px 28px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;text-decoration:none">View in Dashboard →</a></div>
  `);
}

function buildApprovedHtml(booking: Booking) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Your visit is confirmed</h1>
    <p style="margin:0;font-size:13px;color:${brand.leaf};letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Confirmed</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">We're looking forward to welcoming you on <strong>${booking.visit_date}</strong>. Please arrive a few minutes early.</p>
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Need to make changes? Contact us at least 24 hours in advance via WhatsApp at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

function buildRejectedHtml(booking: Booking, note?: string | null) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Update on your booking request</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Unfortunately we are unable to accommodate your visit on <strong>${booking.visit_date}</strong>.</p>
    ${noteBlock(note)}
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">We'd love to host you another time. Visit our website or WhatsApp us at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

function buildCancelledHtml(booking: Booking, note?: string | null) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Booking cancelled</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Your booking for <strong>${booking.visit_date}</strong> has been cancelled.</p>
    ${noteBlock(note)}
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">To rebook, visit our website or WhatsApp us at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

function buildReminderHtml(booking: Booking) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Your Nola Ranches visit is tomorrow</h1>
    <p style="margin:0;font-size:13px;color:${brand.leaf};letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Reminder</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Your visit is scheduled for <strong>tomorrow, ${booking.visit_date}</strong>.</p>
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Please arrive a few minutes early. To cancel, contact us immediately at <strong>${displayWhatsapp}</strong>.</p>
    <p style="margin:16px 0 0;font-size:14px">We look forward to seeing you!</p>
  `);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendBookingReceivedEmails(booking: Booking) {
  const admin = await adminEmail();
  await Promise.all([
    sendEmail({ to: booking.email, subject: `We've received your booking request — ${booking.reference}`, html: buildReceivedVisitorHtml(booking) }),
    sendEmail({ to: admin, subject: `New booking — ${booking.full_name} on ${booking.visit_date} ${booking.reference}`, html: buildReceivedAdminHtml(booking) }),
  ]);
}

export async function sendStatusEmail(booking: Booking, action: 'approved' | 'rejected' | 'cancelled' | 'completed', note?: string | null) {
  const prefs = await getNotifyPrefs(booking.user_id);
  let visitorSubject = '';
  let visitorHtml = '';
  let sendToVisitor = true;

  switch (action) {
    case 'approved':
      visitorSubject = `Your Nola Ranches visit is confirmed — ${booking.visit_date}`;
      visitorHtml = buildApprovedHtml(booking);
      sendToVisitor = prefs.confirm;
      break;
    case 'rejected':
      visitorSubject = `Update on your booking request ${booking.reference}`;
      visitorHtml = buildRejectedHtml(booking, note);
      sendToVisitor = prefs.rejection;
      break;
    case 'cancelled':
      visitorSubject = `Your booking has been cancelled — ${booking.reference}`;
      visitorHtml = buildCancelledHtml(booking, note);
      sendToVisitor = prefs.rejection;
      break;
    case 'completed':
      sendToVisitor = false;
      break;
  }

  const tasks: Promise<void>[] = [];
  if (sendToVisitor && visitorSubject) tasks.push(sendEmail({ to: booking.email, subject: visitorSubject, html: visitorHtml }));
  if (action !== 'completed') {
    const admin = await adminEmail();
    tasks.push(sendEmail({ to: admin, subject: `[Admin copy] ${visitorSubject}`, html: visitorHtml }));
  }
  await Promise.all(tasks);
}

export async function sendReminderEmail(booking: Booking) {
  const prefs = await getNotifyPrefs(booking.user_id);
  if (!prefs.reminder) return;
  await sendEmail({ to: booking.email, subject: `Your Nola Ranches visit is tomorrow — ${booking.visit_date}`, html: buildReminderHtml(booking) });
}

// ---------------------------------------------------------------------------
// Welcome (new account)
// ---------------------------------------------------------------------------

function buildWelcomeHtml(firstName?: string) {
  const greeting = firstName ? `Welcome, ${firstName}!` : 'Welcome to Nola Ranches!';
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">${greeting}</h1>
    <p style="margin:0;font-size:13px;color:${brand.leaf};letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Account created</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Thank you for creating an account with Nola Ranches — a working agricultural estate in Kenya. Your account lets you:</p>
    <ul style="margin:16px 0 0;padding-left:20px;font-size:14px;line-height:1.9;color:${brand.green}">
      <li>Order fresh produce, grain, and livestock from our farm shop</li>
      <li>Request and track guided ranch visits</li>
      <li>Get updates on your bookings and orders by email</li>
    </ul>
    ${ctaRow([
      { label: 'The Homestead', href: `${SITE.url}/` },
      { label: 'Ranch Market', href: `${SITE.url}/products` },
      { label: 'Visit the Ranch', href: `${SITE.url}/services` },
    ])}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Questions? WhatsApp us at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

export async function sendWelcomeEmail({ email, firstName }: { email: string; firstName?: string }) {
  if (!email) return;
  await sendEmail({ to: email, subject: 'Welcome to Nola Ranches', html: buildWelcomeHtml(firstName) });
}

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------

export type ContactMessage = {
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildContactAdminHtml(m: ContactMessage) {
  const rows: [string, string][] = [
    ['Name', m.fullName],
    ['Email', m.email],
    ['Phone', m.phone],
    ['Subject', m.subject],
  ];
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">New Contact Enquiry</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${escapeHtml(m.subject)}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse">
      ${rows.map(([l, v]) => `<tr>
        <td style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;width:30%;font-size:13px;font-weight:600;color:${brand.green}">${l}</td>
        <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green}">${escapeHtml(v)}</td>
      </tr>`).join('')}
    </table>
    <div style="margin-top:24px;border-left:3px solid ${brand.gold};padding:12px 16px;background:#FBF6ED">
      <p style="margin:0;font-size:13px;line-height:1.7;color:${brand.green};white-space:pre-wrap">${escapeHtml(m.message)}</p>
    </div>
    <p style="margin:24px 0 0;font-size:13px;color:${brand.muted}">Just hit Reply to respond directly to ${escapeHtml(m.fullName)}.</p>
  `);
}

function buildContactAckHtml(m: ContactMessage) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Thanks for getting in touch</h1>
    <p style="margin:0;font-size:13px;color:${brand.leaf};letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Message received</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Hi ${escapeHtml(m.fullName)}, we've received your message and will get back to you within <strong>24 hours</strong> by phone, email, or WhatsApp.</p>
    <div style="margin-top:24px;border-left:3px solid ${brand.gold};padding:12px 16px;background:#FBF6ED">
      <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:${brand.green}">Your message (${escapeHtml(m.subject)})</p>
      <p style="margin:0;font-size:13px;line-height:1.7;color:${brand.green};white-space:pre-wrap">${escapeHtml(m.message)}</p>
    </div>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Need us sooner? WhatsApp us at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

export async function sendContactEmails(m: ContactMessage) {
  const admin = await adminEmail();
  await Promise.all([
    // To the farm — reply-to is the customer so admin can reply straight back.
    sendEmail({
      to: admin,
      subject: `New enquiry: ${m.subject} — ${m.fullName}`,
      html: buildContactAdminHtml(m),
      replyTo: m.email,
    }),
    // Acknowledgement to the customer.
    sendEmail({
      to: m.email,
      subject: 'We received your message — Nola Ranches',
      html: buildContactAckHtml(m),
    }),
  ]);
}

// ---------------------------------------------------------------------------
// Orders (farm shop)
// ---------------------------------------------------------------------------

function orderItemsTable(order: Order) {
  const items = parseOrderItems(order.items);
  const rows = items.map((it) => {
    const priceNum = it.price_at_time ? parseFloat(it.price_at_time) : null;
    const lineTotal = priceNum !== null ? `KES ${(priceNum * it.quantity).toLocaleString()}` : 'Contact for price';
    // product_name/unit come from order.items, which the checkout API stores verbatim from the
    // request body — they are attacker-controlled strings, not trusted catalogue data.
    return `<tr>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green}">${escapeHtml(String(it.product_name))}</td>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green};text-align:center">${escapeHtml(String(it.quantity))} ${escapeHtml(String(it.unit))}</td>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green};text-align:right">${lineTotal}</td>
    </tr>`;
  }).join('');

  const allPriced = items.length > 0 && items.every((it) => it.price_at_time);
  const total = allPriced
    ? items.reduce((sum, it) => sum + parseFloat(it.price_at_time as string) * it.quantity, 0)
    : null;
  const totalRow = total !== null
    ? `<tr>
        <td colspan="2" style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;font-size:13px;font-weight:600;color:${brand.green};text-align:right">Total</td>
        <td style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;font-size:13px;font-weight:600;color:${brand.green};text-align:right">KES ${total.toLocaleString()}</td>
      </tr>`
    : `<tr><td colspan="3" style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;font-size:12px;color:${brand.muted}">Final pricing confirmed when we contact you.</td></tr>`;

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse">
    <tr>
      <td style="padding:8px 14px;border:1px solid #E8E0D4;background:${brand.green};font-size:11px;font-weight:600;color:${brand.cream};text-transform:uppercase;letter-spacing:0.06em">Item</td>
      <td style="padding:8px 14px;border:1px solid #E8E0D4;background:${brand.green};font-size:11px;font-weight:600;color:${brand.cream};text-transform:uppercase;letter-spacing:0.06em;text-align:center">Qty</td>
      <td style="padding:8px 14px;border:1px solid #E8E0D4;background:${brand.green};font-size:11px;font-weight:600;color:${brand.cream};text-transform:uppercase;letter-spacing:0.06em;text-align:right">Price</td>
    </tr>
    ${rows}
    ${totalRow}
  </table>`;
}

function orderMetaTable(order: Order) {
  const rows: [string, string][] = [
    ['Name', order.customer_name],
    ['Phone', order.customer_phone],
    ...(order.delivery_location ? [['Delivery to', order.delivery_location] as [string, string]] : []),
    ...(order.delivery_notes ? [['Delivery notes', order.delivery_notes] as [string, string]] : []),
  ];
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse">
    ${rows.map(([l, v]) => `<tr>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;width:38%;font-size:13px;font-weight:600;color:${brand.green}">${l}</td>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green}">${escapeHtml(String(v))}</td>
    </tr>`).join('')}
  </table>`;
}

function buildOrderReceivedHtml(order: Order) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">We've received your order</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">Order ${order.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Thank you, ${order.customer_name}. We've received your order and will contact you within <strong>24 hours</strong> to confirm availability, final pricing, and arrange payment and delivery.</p>
    ${orderMetaTable(order)}
    ${orderItemsTable(order)}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.7">No payment is required now. Questions? WhatsApp us at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

function buildOrderReceivedAdminHtml(order: Order) {
  const url = `${SITE.url}/admin/orders/${order.id}`;
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">New Order — Action Required</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${order.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">A new order has been placed and is awaiting your review.</p>
    ${orderMetaTable(order)}
    ${orderItemsTable(order)}
    <div style="margin-top:32px"><a href="${url}" style="display:inline-block;background:${brand.green};color:${brand.cream};padding:14px 28px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;text-decoration:none">View in Dashboard →</a></div>
  `);
}

function buildOrderStatusHtml(order: Order, status: OrderStatus) {
  const copy: Record<string, { heading: string; body: string }> = {
    contacted: {
      heading: 'Update on your order',
      body: `We've reviewed your order <strong>${order.reference}</strong> and our team is reaching out to arrange the details. Please keep an eye on your phone.`,
    },
    fulfilled: {
      heading: 'Your order is complete',
      body: `Your order <strong>${order.reference}</strong> has been fulfilled. Thank you for choosing Nola Ranches — we hope to serve you again.`,
    },
    cancelled: {
      heading: 'Your order was cancelled',
      body: `Your order <strong>${order.reference}</strong> has been cancelled. If this wasn't expected or you'd like to reorder, please get in touch.`,
    },
  };
  const c = copy[status] ?? { heading: 'Order update', body: `There's an update on your order <strong>${order.reference}</strong>.` };
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">${c.heading}</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">Order ${order.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">${c.body}</p>
    ${orderMetaTable(order)}
    ${orderItemsTable(order)}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.7">Questions? WhatsApp us at <strong>${displayWhatsapp}</strong>.</p>
  `);
}

export async function sendOrderReceivedEmails(order: Order) {
  const admin = await adminEmail();
  const tasks: Promise<void>[] = [
    sendEmail({ to: admin, subject: `New order — ${order.customer_name} ${order.reference}`, html: buildOrderReceivedAdminHtml(order) }),
  ];
  if (order.customer_email) {
    tasks.push(sendEmail({ to: order.customer_email, subject: `We've received your order — ${order.reference}`, html: buildOrderReceivedHtml(order) }));
  }
  await Promise.all(tasks);
}

export async function sendOrderStatusEmail(order: Order, status: OrderStatus) {
  // 'new' is covered by the confirmation email; only later transitions are emailed.
  if (!order.customer_email || status === 'new') return;
  const subjects: Record<string, string> = {
    contacted: `Update on your order — ${order.reference}`,
    fulfilled: `Your order is complete — ${order.reference}`,
    cancelled: `Your order was cancelled — ${order.reference}`,
  };
  await sendEmail({
    to: order.customer_email,
    subject: subjects[status] ?? `Order update — ${order.reference}`,
    html: buildOrderStatusHtml(order, status),
  });
}
