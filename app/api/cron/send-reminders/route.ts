import { requireDb } from '@/lib/api-utils';
import { getDb, ensureMigrated } from '@/lib/db';
import { sendReminderEmail } from '@/lib/email';
import type { Booking } from '@/lib/booking-types';

export const dynamic = 'force-dynamic';

function tomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

// Triggered daily by an external scheduler (see .github/workflows/send-reminders.yml)
// since Railway has no built-in "call this URL on a cron" primitive. Replaces the
// old Supabase Edge Function, which queried a database this project no longer uses.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get('authorization');
  if (!secret || auth !== `Bearer ${secret}`) {
    return Response.json({ success: false, message: 'Unauthorized.' }, { status: 401 });
  }

  const setup = requireDb('Send reminders');
  if (setup) return setup;
  await ensureMigrated();

  const sql = getDb();
  const [settings] = await sql<[{ reminder_emails_enabled: boolean }]>`
    SELECT reminder_emails_enabled FROM farm_settings WHERE id = 1
  `;
  if (settings && settings.reminder_emails_enabled === false) {
    return Response.json({ success: true, sent: 0, message: 'Reminder emails are disabled in farm settings.' });
  }

  const visitDate = tomorrow();
  const bookings = await sql<Booking[]>`
    SELECT * FROM bookings
    WHERE visit_date = ${visitDate} AND status = 'confirmed' AND reminder_sent = FALSE
  `;

  // Each booking is isolated: one failing email must not abort the whole batch and
  // rob everyone else of their reminder. reminder_sent is only stamped on success, so
  // a failed send is naturally retried on the next run.
  let sent = 0;
  let failed = 0;
  for (const booking of bookings) {
    try {
      await sendReminderEmail(booking);
      await sql`UPDATE bookings SET reminder_sent = TRUE, updated_at = NOW() WHERE id = ${booking.id}`;
      sent += 1;
    } catch (err) {
      failed += 1;
      console.error('Reminder email failed (will retry next run):', booking.reference, err);
    }
  }

  return Response.json({ success: true, sent, failed, date: visitDate });
}
