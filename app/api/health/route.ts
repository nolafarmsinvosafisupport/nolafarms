// Deliberately checks only that the app process is responsive, not the database —
// a transient DB blip should surface via error boundaries, not restart the whole app.
export const dynamic = 'force-dynamic';

export async function GET() {
  return Response.json({ status: 'ok' });
}
