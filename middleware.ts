import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAccountRoute = createRouteMatcher(['/account(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAccountRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const { userId, sessionClaims } = await auth.protect();
    const meta = (sessionClaims as { metadata?: { role?: string } })?.metadata;
    const isAdmin =
      meta?.role === 'admin' ||
      (process.env.CLERK_ADMIN_USER_ID && userId === process.env.CLERK_ADMIN_USER_ID);
    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
