'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CalendarDays, CheckCircle2, LogOut, Settings, UserRound, XCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import type { Notification } from '@/lib/booking-types';

const PRIVATE_PATHS = ['/sign-in', '/sign-up', '/account', '/admin'];

export function AccountButton() {
  const { isSignedIn, user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [imgError, setImgError] = useState(false);

  const isPrivate = PRIVATE_PATHS.some((p) => pathname.startsWith(p));
  const signInHref = isPrivate
    ? '/sign-in'
    : `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;

  useEffect(() => {
    if (!isSignedIn) return;
    fetch('/api/notifications')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        setNotifications(data?.notifications ?? []);
        setUnreadCount(data?.unreadCount ?? 0);
      })
      .catch(() => undefined);
  }, [isSignedIn]);

  useEffect(() => {
    if (!open || !isSignedIn || unreadCount === 0) return;
    const t = setTimeout(() => {
      fetch('/api/notifications', { method: 'PATCH' })
        .then(() => setUnreadCount(0))
        .catch(() => undefined);
    }, 800);
    return () => clearTimeout(t);
  }, [open, isSignedIn, unreadCount]);

  if (!isLoaded) return <div className="h-9 w-16" />;

  if (!isSignedIn || !user) {
    return (
      <Link href={signInHref} className="text-xs font-medium uppercase tracking-widest text-cream-secondary hover:text-cream-primary">
        Sign In
      </Link>
    );
  }

  const initials = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}` || user.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'NF';
  const email = user.primaryEmailAddress?.emailAddress || '';
  const recentNotifications = notifications.slice(0, 4);
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
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-1 ring-farm-dark">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
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

              {/* Notifications */}
              {recentNotifications.length > 0 && (
                <div className="border-b border-white/10 py-3">
                  <div className="flex items-center justify-between px-1 pb-2">
                    <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-cream-secondary/40">
                      <Bell size={11} /> Notifications
                    </p>
                    {unreadCount > 0 && (
                      <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  <div className="space-y-2">
                    {recentNotifications.map((n) => (
                      <div key={n.id} className={`flex items-start gap-2.5 rounded px-1 py-1.5 ${!n.read ? 'bg-white/5' : ''}`}>
                        {n.type === 'confirmed' ? (
                          <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-brand-leaf" />
                        ) : n.type === 'rejected' ? (
                          <XCircle size={13} className="mt-0.5 flex-shrink-0 text-red-400" />
                        ) : (
                          <Bell size={13} className="mt-0.5 flex-shrink-0 text-gold-warm" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate text-xs font-medium text-cream-primary">{n.title}</p>
                          <p className="mt-0.5 text-[11px] leading-4 text-cream-secondary/55 line-clamp-2">{n.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu links */}
              <div className="space-y-0.5 border-b border-white/10 py-3 text-sm">
                <MenuLink href="/account/bookings" icon={CalendarDays} label="My Bookings" onClick={() => setOpen(false)} />
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
