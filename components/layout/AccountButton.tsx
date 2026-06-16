'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, LogOut, Settings, UserRound } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState } from 'react';

export function AccountButton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);

  if (!isLoaded) return <div className="h-9 w-16" />;

  if (!isSignedIn || !user) {
    return (
      <Link href="/sign-in" className="text-xs font-medium uppercase tracking-widest text-cream-secondary hover:text-cream-primary">
        Sign In
      </Link>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'NF';
  const email = user.primaryEmailAddress?.emailAddress || '';

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Open account menu"
        onClick={() => setOpen((value) => !value)}
        className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border-2 border-brand-leaf bg-brand-primary text-xs font-semibold uppercase text-cream-primary"
      >
        {user.imageUrl ? <Image src={user.imageUrl} alt={`${user.fullName || 'Nola Farms account'} profile photo`} fill sizes="36px" className="object-cover" /> : initials}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute right-0 mt-4 w-72 border border-white/10 bg-farm-dark p-4 text-cream-secondary shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-brand-leaf bg-brand-primary text-xs uppercase text-cream-primary">
                {user.imageUrl ? <Image src={user.imageUrl} alt={`${user.fullName || 'Nola Farms account'} profile photo`} fill sizes="40px" className="object-cover" /> : initials}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cream-primary">{user.fullName || 'Nola Farms visitor'}</p>
                <p className="truncate text-xs text-cream-secondary/65">{email}</p>
              </div>
            </div>

            <div className="space-y-1 border-b border-white/10 py-3 text-sm">
              <MenuLink href="/account/profile" icon={UserRound} label="My Profile" onClick={() => setOpen(false)} />
              <MenuLink href="/account/bookings" icon={CalendarDays} label="My Bookings" onClick={() => setOpen(false)} />
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
