'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, LayoutDashboard, LogOut, Package, Settings, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState } from 'react';
import { useNotifications } from '@/lib/notification-context';

const PRIVATE_PATHS = ['/sign-in', '/sign-up', '/account', '/admin'];

export function AccountButton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useNotifications();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isPrivate = PRIVATE_PATHS.some((p) => pathname.startsWith(p));
  const signInHref = isPrivate
    ? '/sign-in'
    : `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;

  if (!isLoaded) return <div className="h-9 w-16" />;

  if (!isSignedIn || !user) {
    return (
      <Link href={signInHref} className="border border-cream-secondary/40 px-4 py-2 text-xs font-medium uppercase tracking-widest text-cream-secondary transition-colors hover:border-cream-primary hover:text-cream-primary">
        Sign In
      </Link>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'NF';
  const email = user.primaryEmailAddress?.emailAddress || '';
  const showImg = !!user.imageUrl && !imgError;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-brand-leaf bg-brand-primary text-xs font-semibold uppercase text-cream-primary"
      >
        {showImg ? (
          <Image src={user.imageUrl!} alt={`${user.fullName || 'Account'} photo`} fill sizes="36px" className="object-cover" onError={() => setImgError(true)} />
        ) : initials}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="absolute right-0 z-40 mt-4 w-80 border border-white/10 bg-farm-dark p-4 text-cream-secondary shadow-2xl"
            >
              {/* User info */}
              <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-leaf bg-brand-primary text-xs uppercase text-cream-primary">
                  {showImg ? (
                    <Image src={user.imageUrl!} alt="Profile" fill sizes="40px" className="object-cover" onError={() => setImgError(true)} />
                  ) : initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-cream-primary">{user.fullName || 'Nola Farms visitor'}</p>
                  <p className="truncate text-xs text-cream-secondary/60">{email}</p>
                </div>
              </div>

              {/* Menu links — admin gets a Dashboard shortcut instead of the customer
                  booking/order links, since the admin account doesn't act as a customer */}
              <div className="space-y-0.5 border-b border-white/10 py-3 text-sm">
                {isAdmin ? (
                  <MenuLink href="/admin" icon={LayoutDashboard} label="Admin Dashboard" onClick={() => setOpen(false)} />
                ) : (
                  <>
                    <MenuLink href="/account/bookings" icon={CalendarDays} label="My Bookings" onClick={() => setOpen(false)} />
                    <MenuLink href="/account/orders" icon={Package} label="My Orders" onClick={() => setOpen(false)} />
                  </>
                )}
                <MenuLink href="/account/profile" icon={UserRound} label="My Profile" onClick={() => setOpen(false)} />
                <MenuLink href="/account/settings" icon={Settings} label="Settings" onClick={() => setOpen(false)} />
              </div>

              <button
                type="button"
                onClick={() => signOut({ redirectUrl: '/' })}
                className="mt-3 flex w-full items-center gap-3 px-3 py-2 text-left text-sm text-cream-secondary transition-colors hover:bg-white/5 hover:text-cream-primary"
              >
                <LogOut size={16} aria-hidden="true" /> Sign Out
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({ href, icon: Icon, label, onClick }: { href: string; icon: typeof UserRound; label: string; onClick: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-3 px-3 py-2 transition-colors hover:bg-white/5 hover:text-cream-primary">
      <Icon size={16} aria-hidden="true" />
      {label}
    </Link>
  );
}
