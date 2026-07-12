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
  return `Nola Farms <${address}>`;
}

function adminEmail() {
  return process.env.ADMIN_NOTIFICATION_EMAIL || SITE.email;
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const client = getResend();
  if (!client || !to || to.includes('PLACEHOLDER')) {
    console.log('Email skipped (Resend not configured):', { to, subject });
    return;
  }
  await client.emails.send({ from: fromEmail(), to, subject, html });
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

function baseLayout(content: string) {
  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:${brand.cream};font-family:Inter,Arial,sans-serif;color:${brand.green}">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${brand.cream}">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr><td style="background:${brand.green};padding:32px 40px">
          <p style="margin:0;font-family:Georgia,serif;font-size:28px;color:${brand.cream};letter-spacing:0.04em">Nola Farms</p>
          <p style="margin:8px 0 0;font-size:12px;color:${brand.gold};letter-spacing:0.15em;text-transform:uppercase">Oloitoktok &amp; Laikipia, Kenya</p>
        </td></tr>
        <tr><td style="background:#ffffff;padding:40px">${content}</td></tr>
        <tr><td style="background:${brand.green};padding:24px 40px;text-align:center">
          <p style="margin:0 0 8px;font-size:12px;color:${brand.muted}">WhatsApp ${SITE.whatsapp} &bull; ${SITE.url.replace(/^https?:\/\//, '')}</p>
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
    ['Date', booking.visit_date], ['Time', VISIT_TIMES[booking.visit_time]],
    ['Group size', `${booking.group_size} ${booking.group_size === 1 ? 'person' : 'people'}`],
    ['Purpose', booking.purpose],
  ];
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse">
    ${rows.map(([l, v]) => `<tr>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;width:38%;font-size:13px;font-weight:600;color:${brand.green}">${l}</td>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green}">${v}</td>
    </tr>`).join('')}
  </table>`;
}

function noteBlock(note?: string | null) {
  if (!note) return '';
  return `<div style="margin-top:24px;border-left:3px solid ${brand.gold};padding:12px 16px;background:#FBF6ED">
    <p style="margin:0;font-size:13px;color:${brand.green}"><strong>Note from Nola Farms:</strong> ${note}</p>
  </div>`;
}

function buildReceivedVisitorHtml(booking: Booking) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">We've received your booking request</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">Reference: ${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Thank you for your interest in visiting Nola Farms. We will confirm within <strong>24 hours</strong>.</p>
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Questions? WhatsApp us at <strong>${SITE.whatsapp}</strong>.</p>
  `);
}

function buildReceivedAdminHtml(booking: Booking) {
  const url = `${SITE.url}/admin/bookings/${booking.id}`;
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">New Booking — Action Required</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">A new booking request is awaiting your approval.</p>
    ${detailsTable(booking)}
    ${booking.special_requests ? `<p style="margin:16px 0 0;font-size:13px"><strong>Special requests:</strong> ${booking.special_requests}</p>` : ''}
    <div style="margin-top:32px"><a href="${url}" style="display:inline-block;background:${brand.green};color:${brand.cream};padding:14px 28px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;text-decoration:none">View in Dashboard →</a></div>
  `);
}

function buildApprovedHtml(booking: Booking) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Your visit is confirmed</h1>
    <p style="margin:0;font-size:13px;color:${brand.leaf};letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Confirmed</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">We're looking forward to welcoming you on <strong>${booking.visit_date}</strong>. Please arrive a few minutes early.</p>
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Need to make changes? Contact us at least 24 hours in advance via WhatsApp at <strong>${SITE.whatsapp}</strong>.</p>
  `);
}

function buildRejectedHtml(booking: Booking, note?: string | null) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Update on your booking request</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Unfortunately we are unable to accommodate your visit on <strong>${booking.visit_date}</strong>.</p>
    ${noteBlock(note)}
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">We'd love to host you another time. Visit our website or WhatsApp us at <strong>${SITE.whatsapp}</strong>.</p>
  `);
}

function buildCancelledHtml(booking: Booking, note?: string | null) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Booking cancelled</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">${booking.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Your booking for <strong>${booking.visit_date}</strong> has been cancelled.</p>
    ${noteBlock(note)}
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">To rebook, visit our website or WhatsApp us at <strong>${SITE.whatsapp}</strong>.</p>
  `);
}

function buildReminderHtml(booking: Booking) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">Your Nola Farms visit is tomorrow</h1>
    <p style="margin:0;font-size:13px;color:${brand.leaf};letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Reminder</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Your visit is scheduled for <strong>tomorrow, ${booking.visit_date}</strong>.</p>
    ${detailsTable(booking)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Please arrive a few minutes early. To cancel, contact us immediately at <strong>${SITE.whatsapp}</strong>.</p>
    <p style="margin:16px 0 0;font-size:14px">We look forward to seeing you!</p>
  `);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function sendBookingReceivedEmails(booking: Booking) {
  await Promise.all([
    sendEmail({ to: booking.email, subject: `We've received your booking request — ${booking.reference}`, html: buildReceivedVisitorHtml(booking) }),
    sendEmail({ to: adminEmail(), subject: `New booking — ${booking.full_name} on ${booking.visit_date} ${booking.reference}`, html: buildReceivedAdminHtml(booking) }),
  ]);
}

export async function sendStatusEmail(booking: Booking, action: 'approved' | 'rejected' | 'cancelled' | 'completed', note?: string | null) {
  const prefs = await getNotifyPrefs(booking.user_id);
  let visitorSubject = '';
  let visitorHtml = '';
  let sendToVisitor = true;

  switch (action) {
    case 'approved':
      visitorSubject = `Your Nola Farms visit is confirmed — ${booking.visit_date}`;
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
  if (action !== 'completed') tasks.push(sendEmail({ to: adminEmail(), subject: `[Admin copy] ${visitorSubject}`, html: visitorHtml }));
  await Promise.all(tasks);
}

export async function sendReminderEmail(booking: Booking) {
  const prefs = await getNotifyPrefs(booking.user_id);
  if (!prefs.reminder) return;
  await sendEmail({ to: booking.email, subject: `Your Nola Farms visit is tomorrow — ${booking.visit_date}`, html: buildReminderHtml(booking) });
}

// ---------------------------------------------------------------------------
// Welcome (new account)
// ---------------------------------------------------------------------------

function buildWelcomeHtml(firstName?: string) {
  const greeting = firstName ? `Welcome, ${firstName}!` : 'Welcome to Nola Farms!';
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">${greeting}</h1>
    <p style="margin:0;font-size:13px;color:${brand.leaf};letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Account created</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Thank you for creating an account with Nola Farms — a working agricultural estate across two ranches in Oloitoktok and Laikipia, Kenya. Your account lets you:</p>
    <ul style="margin:16px 0 0;padding-left:20px;font-size:14px;line-height:1.9;color:${brand.green}">
      <li>Order fresh produce, grain, and livestock from our farm shop</li>
      <li>Request and track guided ranch visits</li>
      <li>Get updates on your bookings and orders by email</li>
    </ul>
    <div style="margin-top:32px">
      <a href="${SITE.url}/products" style="display:inline-block;background:${brand.green};color:${brand.cream};padding:14px 28px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.12em;text-decoration:none">Explore the Farm Shop →</a>
    </div>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.7">Questions? WhatsApp us at <strong>${SITE.whatsapp}</strong>.</p>
  `);
}

export async function sendWelcomeEmail({ email, firstName }: { email: string; firstName?: string }) {
  if (!email) return;
  await sendEmail({ to: email, subject: 'Welcome to Nola Farms', html: buildWelcomeHtml(firstName) });
}

// ---------------------------------------------------------------------------
// Orders (farm shop)
// ---------------------------------------------------------------------------

function orderItemsTable(order: Order) {
  const items = parseOrderItems(order.items);
  const rows = items.map((it) => {
    const priceNum = it.price_at_time ? parseFloat(it.price_at_time) : null;
    const lineTotal = priceNum !== null ? `KES ${(priceNum * it.quantity).toLocaleString()}` : 'Contact for price';
    return `<tr>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green}">${it.product_name}</td>
      <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:${brand.green};text-align:center">${it.quantity} ${it.unit}</td>
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

function buildOrderReceivedHtml(order: Order) {
  return baseLayout(`
    <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:${brand.green}">We've received your order</h1>
    <p style="margin:0;font-size:13px;color:${brand.muted};letter-spacing:0.1em;text-transform:uppercase">Order ${order.reference}</p>
    <p style="margin:24px 0 0;font-size:15px;line-height:1.7">Thank you, ${order.customer_name}. We've received your order and will contact you within <strong>24 hours</strong> to confirm availability, final pricing, and arrange payment and delivery.</p>
    ${orderItemsTable(order)}
    ${order.delivery_location ? `<p style="margin:20px 0 0;font-size:14px"><strong>Delivery to:</strong> ${order.delivery_location}</p>` : ''}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.7">No payment is required now. Questions? WhatsApp us at <strong>${SITE.whatsapp}</strong>.</p>
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
      body: `Your order <strong>${order.reference}</strong> has been fulfilled. Thank you for choosing Nola Farms — we hope to serve you again.`,
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
    ${orderItemsTable(order)}
    <p style="margin:24px 0 0;font-size:14px;line-height:1.7">Questions? WhatsApp us at <strong>${SITE.whatsapp}</strong>.</p>
  `);
}

export async function sendOrderReceivedEmail(order: Order) {
  if (!order.customer_email) return;
  await sendEmail({
    to: order.customer_email,
    subject: `We've received your order — ${order.reference}`,
    html: buildOrderReceivedHtml(order),
  });
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
