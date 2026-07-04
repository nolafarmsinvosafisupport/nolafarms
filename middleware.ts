import { clerkMiddleware, clerkClient, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAccountRoute = createRouteMatcher(['/account(.*)']);
const isAdminRoute = createRouteMatcher(['/admin(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAccountRoute(req)) {
    await auth.protect();
  }

  if (isAdminRoute(req)) {
    const { userId } = await auth.protect();

    // Cheap check first: matches the env var without any Clerk Dashboard configuration.
    let isAdmin = Boolean(process.env.CLERK_ADMIN_USER_ID && userId === process.env.CLERK_ADMIN_USER_ID);

    // Fall back to publicMetadata.role, fetched live from Clerk. This mirrors
    // lib/auth.ts's isCurrentUserAdmin() so the two checks can't disagree, and it
    // works without the custom `metadata` session-token claim that sessionClaims
    // would otherwise require to be configured in the Clerk Dashboard.
    if (!isAdmin) {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const meta = user.publicMetadata as { role?: string };
      isAdmin = meta?.role === 'admin';
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ico|ttf|woff2?|csv|docx?|xlsx?|zip|webmanifest)).*)', '/(api|trpc)(.*)'],
};
