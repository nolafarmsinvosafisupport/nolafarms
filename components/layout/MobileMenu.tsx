'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ChevronRight, LayoutDashboard, LogOut, Package, Settings, User } from 'lucide-react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { NAV_LINKS } from '@/lib/constants';
import { useNotifications } from '@/lib/notification-context';

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isAdmin } = useNotifications();
  const pathname = usePathname();
  const [imgError, setImgError] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` ||
      user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() ||
      'NF'
    : '';
  const showImg = !!user?.imageUrl && !imgError;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'tween', duration: 0.22, ease: 'easeInOut' }}
          className="fixed inset-0 z-30 flex flex-col overflow-y-auto bg-farm-dark md:hidden"
        >
          {/* Spacer for fixed navbar */}
          <div className="h-16 flex-shrink-0" />

          {/* Navigation links */}
          <div className="px-5 pt-4 pb-2">
            <p className="mb-2 px-2 text-[9px] font-semibold uppercase tracking-widest text-cream-secondary/35">
              Navigation
            </p>
            {NAV_LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  className={`flex items-center justify-between rounded px-3 py-3 text-sm font-medium uppercase tracking-widest transition-colors ${
                    active
                      ? 'bg-white/8 text-gold-warm'
                      : 'text-cream-secondary hover:bg-white/5 hover:text-cream-primary'
                  }`}
                >
                  {link.label}
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-gold-warm" />}
                </Link>
              );
            })}
          </div>

          {/* Account section */}
          <div className="mt-auto border-t border-white/10 px-5 pb-8 pt-4">
            {isLoaded && isSignedIn && user ? (
              <>
                {/* User identity card */}
                <div className="mb-3 flex items-center gap-3 rounded bg-white/5 px-3 py-3">
                  <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-brand-leaf bg-brand-primary text-xs font-semibold uppercase text-cream-primary">
                    {showImg ? (
                      <Image
                        src={user.imageUrl!}
                        alt="Profile"
                        fill
                        sizes="40px"
                        className="object-cover"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-cream-primary">
                      {user.fullName || 'Nola Ranches visitor'}
                    </p>
                    <p className="truncate text-xs text-cream-secondary/55">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>

                {/* Account links */}
                <p className="mb-1.5 px-2 text-[9px] font-semibold uppercase tracking-widest text-cream-secondary/35">
                  My Account
                </p>
                {isAdmin ? (
                  <MobileAccountLink href="/admin" icon={LayoutDashboard} label="Admin Dashboard" onClick={onClose} />
                ) : (
                  <>
                    <MobileAccountLink href="/account/bookings" icon={CalendarDays} label="My Bookings" onClick={onClose} />
                    <MobileAccountLink href="/account/orders" icon={Package} label="My Orders" onClick={onClose} />
                  </>
                )}
                <MobileAccountLink href="/account/profile" icon={User} label="My Profile" onClick={onClose} />
                <MobileAccountLink href="/account/settings" icon={Settings} label="Settings" onClick={onClose} />

                <button
                  type="button"
                  onClick={() => { signOut({ redirectUrl: '/' }); onClose(); }}
                  className="mt-2 flex w-full items-center gap-3 rounded px-3 py-2.5 text-sm text-cream-secondary/60 transition-colors hover:bg-white/5 hover:text-cream-primary"
                >
                  <LogOut size={15} aria-hidden="true" />
                  Sign Out
                </button>
              </>
            ) : isLoaded && !isSignedIn ? (
              <Link
                href="/sign-in"
                onClick={onClose}
                className="block w-full border border-cream-secondary/30 px-4 py-3.5 text-center text-xs font-semibold uppercase tracking-widest text-cream-secondary transition-colors hover:border-cream-primary hover:text-cream-primary"
              >
                Sign In to Your Account
              </Link>
            ) : null}
          </div>

          {/* Footer brand */}
          <div className="flex items-center justify-center border-t border-white/5 py-4">
            <Image
              src="/images/logos/wordmark-light.png"
              alt="Nola Ranches"
              width={642}
              height={388}
              className="h-12 w-auto object-contain opacity-40"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileAccountLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string;
  icon: typeof User;
  label: string;
  onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded px-3 py-2.5 text-sm text-cream-secondary transition-colors hover:bg-white/5 hover:text-cream-primary"
    >
      <Icon size={15} className="flex-shrink-0 text-cream-secondary/60" aria-hidden="true" />
      {label}
      <ChevronRight size={13} className="ml-auto text-cream-secondary/30" aria-hidden="true" />
    </Link>
  );
}
