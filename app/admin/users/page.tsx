import Image from 'next/image';
import { clerkClient } from '@clerk/nextjs/server';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Users | Nola Farms Admin' };

function fmtDate(ts: number | null | undefined) {
  if (!ts) return '—';
  return new Intl.DateTimeFormat('en-KE', {
    day: 'numeric', month: 'short', year: 'numeric',
    timeZone: 'Africa/Nairobi',
  }).format(new Date(ts));
}

export default async function AdminUsersPage() {
  const client = await clerkClient();
  const { data: users, totalCount } = await client.users.getUserList({
    limit: 100,
    orderBy: '-created_at',
  });

  const adminId = process.env.CLERK_ADMIN_USER_ID;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl text-brand-deep">Users</h1>
        <p className="mt-1 text-xs text-brand-deep/50">{totalCount} registered user{totalCount !== 1 ? 's' : ''}</p>
      </div>

      {users.length === 0 ? (
        <div className="border border-farm-border bg-cream-warm p-12 text-center">
          <p className="text-sm text-brand-deep/50">No registered users yet.</p>
        </div>
      ) : (
        <div className="border border-farm-border bg-cream-warm">
          {/* Table header — desktop */}
          <div className="hidden grid-cols-[2fr_2fr_1fr_1fr] gap-4 border-b border-farm-border bg-cream-secondary px-5 py-2.5 sm:grid">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">User</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Email</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Joined</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-brand-deep/40">Last Sign In</p>
          </div>

          {users.map((user, idx) => {
            const firstName = user.firstName ?? '';
            const lastName = user.lastName ?? '';
            const fullName = [firstName, lastName].filter(Boolean).join(' ');
            const displayName = fullName || user.username || 'No name set';
            const email = user.emailAddresses[0]?.emailAddress ?? 'No email';
            const isAdmin = user.id === adminId || (user.publicMetadata as { role?: string })?.role === 'admin';

            return (
              <div
                key={user.id}
                className={`grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[2fr_2fr_1fr_1fr] sm:items-center sm:gap-4 ${idx > 0 ? 'border-t border-farm-border' : ''} hover:bg-cream-secondary transition-colors`}
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-cream-secondary border border-farm-border">
                    {user.imageUrl ? (
                      <Image src={user.imageUrl} alt={displayName} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-brand-deep/60">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-brand-deep">{displayName}</span>
                      {isAdmin && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-amber-700">
                          Admin
                        </span>
                      )}
                    </div>
                    {/* Email shown inline on mobile */}
                    <p className="mt-0.5 truncate text-xs text-brand-deep/55 sm:hidden">{email}</p>
                  </div>
                </div>

                {/* Email — desktop */}
                <p className="hidden truncate text-sm text-brand-deep/65 sm:block">{email}</p>

                {/* Joined */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-deep/30 sm:hidden">Joined</p>
                  <p className="text-sm text-brand-deep/65">{fmtDate(user.createdAt)}</p>
                </div>

                {/* Last sign in */}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-brand-deep/30 sm:hidden">Last Seen</p>
                  <p className="text-sm text-brand-deep/50">{fmtDate(user.lastSignInAt)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
