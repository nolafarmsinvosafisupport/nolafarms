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
        <h1 className="font-serif text-2xl text-cream-primary">Users</h1>
        <p className="mt-1 text-xs text-white/40">{totalCount} registered user{totalCount !== 1 ? 's' : ''}</p>
      </div>

      {users.length === 0 ? (
        <p className="py-12 text-center text-sm text-white/30">No registered users yet.</p>
      ) : (
        <div className="overflow-hidden border border-white/10">
          {/* Table header */}
          <div className="hidden grid-cols-[2fr_2fr_1fr_1fr] gap-4 border-b border-white/10 bg-white/5 px-5 py-2.5 sm:grid">
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">User</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">Email</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">Joined</p>
            <p className="text-[9px] font-semibold uppercase tracking-widest text-white/30">Last Sign In</p>
          </div>

          {users.map((user, idx) => {
            const firstName = user.firstName ?? '';
            const lastName = user.lastName ?? '';
            const fullName = [firstName, lastName].filter(Boolean).join(' ');
            const displayName = fullName || user.username || 'No name';
            const email = user.emailAddresses[0]?.emailAddress ?? 'No email';
            const isAdmin = user.id === adminId || (user.publicMetadata as { role?: string })?.role === 'admin';

            return (
              <div
                key={user.id}
                className={`grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[2fr_2fr_1fr_1fr] sm:items-center sm:gap-4 ${idx > 0 ? 'border-t border-white/10' : ''} hover:bg-white/5`}
              >
                {/* Name + avatar */}
                <div className="flex items-center gap-3">
                  <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-white/10">
                    {user.imageUrl ? (
                      <Image src={user.imageUrl} alt={displayName} fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/60">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-sm font-semibold text-cream-primary">{displayName}</span>
                      {isAdmin && (
                        <span className="rounded bg-gold-warm/25 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-gold-warm">
                          Admin
                        </span>
                      )}
                    </div>
                    {/* Show email inline on mobile */}
                    <p className="mt-0.5 truncate text-xs text-white/50 sm:hidden">{email}</p>
                  </div>
                </div>

                {/* Email (desktop) */}
                <p className="hidden truncate text-sm text-white/60 sm:block">{email}</p>

                {/* Joined */}
                <p className="text-xs text-white/50">
                  <span className="mr-1 text-white/25 sm:hidden">Joined:</span>
                  {fmtDate(user.createdAt)}
                </p>

                {/* Last sign in */}
                <p className="text-xs text-white/40">
                  <span className="mr-1 text-white/25 sm:hidden">Last seen:</span>
                  {fmtDate(user.lastSignInAt)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
