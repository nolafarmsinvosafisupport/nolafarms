import { z } from 'zod';
import { parseJsonBody } from '@/lib/api-utils';
import { sendContactEmails } from '@/lib/email';
import { isRateLimited } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(6).max(40),
  subject: z.string().min(1).max(80),
  message: z.string().min(10).max(4000),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(`contact:${ip}`, 5, 10 * 60 * 1000)) {
    return Response.json(
      { success: false, message: 'Too many messages. Please try again in a few minutes.' },
      { status: 429 },
    );
  }

  const { data: body, error: parseError } = await parseJsonBody(request);
  if (parseError) return parseError;

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ success: false, errors: parsed.error.flatten() }, { status: 400 });
  }

  try {
    // Awaited on purpose: unlike a booking, there's nothing persisted here — the email
    // IS the delivery mechanism. If it fails we must tell the user, not silently drop
    // their message (which is exactly what this route used to do).
    await sendContactEmails(parsed.data);
    return Response.json({ success: true, message: 'Message received.' });
  } catch (err) {
    console.error('Contact form email failed:', err);
    return Response.json(
      { success: false, message: 'Your message could not be sent. Please WhatsApp us instead.' },
      { status: 502 },
    );
  }
}
