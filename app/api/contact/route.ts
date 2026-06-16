export async function POST(request: Request) {
  const body = await request.json();
  // TODO: Connect to email service after client provides email and preferred provider.
  console.log('Contact form submission:', body);
  return Response.json({ success: true, message: 'Message received.' });
}
