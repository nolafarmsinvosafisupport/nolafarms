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
        <div className="space-y-2">
          {users.map((user) => {
            const name = [user.firstName, user.lastName].filter(Boolean).join(' ') || '—';
            const email = user.emailAddresses[0]?.emailAddress ?? '—';
            const phone = user.phoneNumbers[0]?.phoneNumber ?? null;
            const isAdmin = user.id === adminId || (user.publicMetadata as { role?: string })?.role === 'admin';

            return (
              <div key={user.id} className="flex items-center gap-4 border border-white/10 bg-white/5 px-4 py-3">
                {/* Avatar */}
                <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-white/10">
                  {user.imageUrl ? (
                    <Image src={user.imageUrl} alt={name} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-white/40">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-cream-primary">{name}</span>
                    {isAdmin && (
                      <span className="rounded-full bg-gold-warm/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-gold-warm">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    <span className="text-xs text-white/50">{email}</span>
                    {phone && <span className="text-xs text-white/30">{phone}</span>}
                  </div>
                </div>

                {/* Dates */}
                <div className="hidden flex-shrink-0 text-right sm:block">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-white/25">Joined</p>
                  <p className="mt-0.5 text-xs text-white/50">{fmtDate(user.createdAt)}</p>
                  {user.lastSignInAt && (
                    <>
                      <p className="mt-1.5 text-[9px] font-semibold uppercase tracking-widest text-white/25">Last sign in</p>
                      <p className="mt-0.5 text-xs text-white/40">{fmtDate(user.lastSignInAt)}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
