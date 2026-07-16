import { auth, currentUser, clerkClient } from '@clerk/nextjs/server';

export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}

export async function requireCurrentUserId() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return null;
  }
  return userId;
}

export async function isCurrentUserAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const meta = user.publicMetadata as { role?: string };
  if (meta?.role === 'admin') return true;
  // Fallback: env var for deployments where metadata isn't set yet
  return Boolean(process.env.CLERK_ADMIN_USER_ID && user.id === process.env.CLERK_ADMIN_USER_ID);
}

// All Clerk user ids that should receive admin notifications: the env-var admin (legacy,
// single-admin deployments) unioned with anyone granted admin via Clerk publicMetadata. Falls
// back to just the env-var admin if Clerk can't be reached, so a Clerk hiccup never drops
// notifications entirely. limit: 100 mirrors app/admin/users/page.tsx — would need pagination
// past that many users.
export async function getAdminUserIds(): Promise<string[]> {
  const envAdmin = process.env.CLERK_ADMIN_USER_ID;
  const ids = new Set<string>();
  if (envAdmin) ids.add(envAdmin);

  try {
    const client = await clerkClient();
    const { data: users } = await client.users.getUserList({ limit: 100 });
    for (const user of users) {
      if ((user.publicMetadata as { role?: string })?.role === 'admin') ids.add(user.id);
    }
  } catch {
    // Clerk unreachable — fall back to just the env-var admin above.
  }

  return Array.from(ids);
}

export async function currentUserSummary() {
  const user = await currentUser();
  if (!user) return null;
  return {
    id: user.id,
    fullName: user.fullName || [user.firstName, user.lastName].filter(Boolean).join(' '),
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.primaryEmailAddress?.emailAddress || '',
    imageUrl: user.imageUrl,
  };
}
