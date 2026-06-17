// Supabase Edge Function: send-reminders
// Schedule: daily at 08:00 EAT (05:00 UTC)
// Cron expression (set in Supabase dashboard): 0 5 * * *
//
// Queries confirmed bookings for tomorrow, sends reminder emails,
// and marks reminder_sent = true to prevent duplicate sends.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') ?? '';
const FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'bookings@nolafarms.co.ke';
const SITE_URL = Deno.env.get('NEXT_PUBLIC_SITE_URL') ?? 'https://nolafarms.co.ke';
const WHATSAPP = '+254 700 000000'; // update to match SITE.whatsapp

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function reminderHtml(booking: {
  reference: string;
  full_name: string;
  visit_date: string;
  visit_time: string;
  group_size: number;
  purpose: string;
}) {
  const timeLabel = booking.visit_time === 'morning' ? 'Morning (9:00 AM)' : 'Afternoon (1:00 PM)';
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FAF5F0;font-family:Inter,Arial,sans-serif;color:#102818">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF5F0">
    <tr><td align="center" style="padding:40px 16px">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
        <tr>
          <td style="background:#1E3C28;padding:32px 40px">
            <p style="margin:0;font-family:Georgia,serif;font-size:28px;color:#FAF5F0;letter-spacing:0.04em">Nola Farms</p>
            <p style="margin:8px 0 0;font-size:12px;color:#D4A76A;letter-spacing:0.15em;text-transform:uppercase">Laikipia County, Kenya</p>
          </td>
        </tr>
        <tr>
          <td style="background:#ffffff;padding:40px">
            <h1 style="margin:0 0 8px;font-family:Georgia,serif;font-size:26px;color:#1E3C28">Your Nola Farms visit is tomorrow</h1>
            <p style="margin:0;font-size:13px;color:#486018;letter-spacing:0.1em;text-transform:uppercase;font-weight:600">Reminder</p>
            <p style="margin:24px 0 0;font-size:15px;line-height:1.7">
              This is a friendly reminder that your visit to Nola Farms is scheduled for <strong>tomorrow, ${booking.visit_date}</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:24px;border-collapse:collapse">
              ${[
                ['Reference', booking.reference],
                ['Name', booking.full_name],
                ['Date', booking.visit_date],
                ['Time', timeLabel],
                ['Group size', `${booking.group_size} ${booking.group_size === 1 ? 'person' : 'people'}`],
                ['Purpose', booking.purpose],
              ].map(([label, value]) => `
                <tr>
                  <td style="padding:10px 14px;border:1px solid #E8E0D4;background:#FAF5F0;width:38%;font-size:13px;font-weight:600;color:#1E3C28">${label}</td>
                  <td style="padding:10px 14px;border:1px solid #E8E0D4;font-size:13px;color:#1E3C28">${value}</td>
                </tr>`).join('')}
            </table>
            <p style="margin:28px 0 0;font-size:14px;line-height:1.7">
              Please arrive a few minutes before your time slot. If you need to cancel or make changes, contact us immediately on WhatsApp at <strong>${WHATSAPP}</strong>.
            </p>
            <p style="margin:16px 0 0;font-size:14px;line-height:1.7">We look forward to seeing you!</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1E3C28;padding:24px 40px;text-align:center">
            <p style="margin:0;font-size:12px;color:#7A8C7E">
              Nola Farms &bull; ${SITE_URL}
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

async function sendReminderEmail(booking: {
  id: string;
  reference: string;
  full_name: string;
  email: string;
  visit_date: string;
  visit_time: string;
  group_size: number;
  purpose: string;
  user_id: string | null;
}) {
  if (!RESEND_API_KEY) {
    console.log('Resend not configured, skipping email for', booking.reference);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: booking.email,
      subject: `Your Nola Farms visit is tomorrow — ${booking.visit_date}`,
      html: reminderHtml(booking),
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to send reminder for ${booking.reference}:`, text);
  }
}

Deno.serve(async () => {
  const tomorrowStr = tomorrow();
  console.log(`Running reminder job for ${tomorrowStr}`);

  // Fetch confirmed bookings for tomorrow where reminder not yet sent
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('id, reference, full_name, email, visit_date, visit_time, group_size, purpose, user_id')
    .eq('visit_date', tomorrowStr)
    .eq('status', 'confirmed')
    .eq('reminder_sent', false);

  if (error) {
    console.error('Supabase query error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  if (!bookings || bookings.length === 0) {
    console.log('No reminders to send.');
    return new Response(JSON.stringify({ sent: 0 }), { status: 200 });
  }

  let sent = 0;

  for (const booking of bookings) {
    // Check visitor's notification preference if they have an account
    if (booking.user_id) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('notify_on_reminder')
        .eq('clerk_user_id', booking.user_id)
        .maybeSingle();
      if (profile && profile.notify_on_reminder === false) {
        console.log(`Skipping reminder for ${booking.reference} — visitor opted out`);
        continue;
      }
    }

    // Check farm-level reminder toggle
    const { data: farmSettings } = await supabase
      .from('farm_settings')
      .select('reminder_emails_enabled')
      .eq('id', 1)
      .maybeSingle();
    if (farmSettings && farmSettings.reminder_emails_enabled === false) {
      console.log('Reminder emails disabled in farm settings, stopping job.');
      break;
    }

    await sendReminderEmail(booking);

    // Mark as sent
    await supabase
      .from('bookings')
      .update({ reminder_sent: true, updated_at: new Date().toISOString() })
      .eq('id', booking.id);

    sent++;
    console.log(`Sent reminder for ${booking.reference}`);
  }

  return new Response(JSON.stringify({ sent, date: tomorrowStr }), { status: 200 });
});
