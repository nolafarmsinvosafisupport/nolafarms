import { auth, currentUser } from '@clerk/nextjs/server';

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
