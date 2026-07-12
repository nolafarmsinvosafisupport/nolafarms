import { Webhook } from 'svix';
import { sendWelcomeEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

// Clerk calls this endpoint on account lifecycle events. We verify the svix
// signature so only genuine Clerk requests are honoured. Graceful no-op if the
// signing secret isn't configured yet, so nothing breaks before the one-time
// Clerk dashboard setup is done (mirrors the R2 "not configured" pattern).
type ClerkUserCreatedEvent = {
  type: string;
  data: {
    first_name?: string | null;
    email_addresses?: { id: string; email_address: string }[];
    primary_email_address_id?: string | null;
  };
};

export async function POST(request: Request) {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    // Accept and ignore — avoids Clerk retrying/erroring before setup is complete.
    return Response.json({ success: true, message: 'Webhook secret not configured; ignored.' });
  }

  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');
  if (!svixId || !svixTimestamp || !svixSignature) {
    return Response.json({ success: false, message: 'Missing svix headers.' }, { status: 400 });
  }

  const body = await request.text();
  let event: ClerkUserCreatedEvent;
  try {
    const wh = new Webhook(secret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkUserCreatedEvent;
  } catch {
    return Response.json({ success: false, message: 'Invalid signature.' }, { status: 400 });
  }

  if (event.type === 'user.created') {
    const { first_name, email_addresses, primary_email_address_id } = event.data;
    const primary = email_addresses?.find((e) => e.id === primary_email_address_id) ?? email_addresses?.[0];
    if (primary?.email_address) {
      // Don't let a mail failure make Clerk think the webhook failed (it would retry).
      await sendWelcomeEmail({ email: primary.email_address, firstName: first_name ?? undefined }).catch(() => undefined);
    }
  }

  return Response.json({ success: true });
}
