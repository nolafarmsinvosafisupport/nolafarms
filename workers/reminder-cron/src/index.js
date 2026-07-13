/**
 * Daily booking-reminder trigger.
 *
 * This exists because GitHub Actions' scheduled workflows are best-effort: they queue behind
 * paid workloads and were consistently firing 5-9 hours late (an 08:00 EAT reminder landing
 * mid-afternoon), and under load they can be skipped entirely. Cloudflare's cron triggers are
 * punctual, so the schedule lives here instead. The GitHub workflow is kept for manual runs only.
 *
 * All this does is call the app's already-secured endpoint. No business logic lives here — the
 * app owns which bookings get a reminder and marks reminder_sent.
 */
export default {
  async scheduled(event, env, ctx) {
    const url = `${env.SITE_URL}/api/cron/send-reminders`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.CRON_SECRET}` },
    });

    const body = await res.text();

    if (!res.ok) {
      // Throwing marks the invocation as failed, so it shows up red in the Worker's
      // observability tab instead of disappearing silently — a reminder job that quietly
      // stops working is the whole failure mode we're trying to design out.
      throw new Error(`Reminder trigger failed: HTTP ${res.status} — ${body.slice(0, 200)}`);
    }

    console.log(`Reminder trigger OK (HTTP ${res.status}): ${body.slice(0, 200)}`);
  },
};
