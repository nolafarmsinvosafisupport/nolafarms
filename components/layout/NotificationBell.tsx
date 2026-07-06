'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCircle2, XCircle } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { useNotifications } from '@/lib/notification-context';

function fmtDate(s: string) {
  const d = new Date(s);
  if (isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-KE', { day: 'numeric', month: 'short', timeZone: 'Africa/Nairobi' }).format(d);
}

export function NotificationBell() {
  const { isSignedIn } = useUser();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);

  // Mark all as read after the dropdown is opened for 800ms
  useEffect(() => {
    if (!open || unreadCount === 0) return;
    const t = setTimeout(markAllRead, 800);
    return () => clearTimeout(t);
  }, [open, unreadCount, markAllRead]);

  if (!isSignedIn) return null;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-cream-secondary transition-colors hover:text-cream-primary"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-1 ring-farm-dark">
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
              className="absolute right-0 z-40 mt-4 w-80 border border-white/10 bg-farm-dark shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-cream-secondary/50">
                  <Bell size={11} /> Notifications
                </p>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-red-500 px-2 py-0.5 text-[9px] font-bold text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="p-2">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-cream-secondary/40">No notifications yet.</p>
                ) : (
                  <div className="space-y-0.5">
                    {notifications.slice(0, 6).map((n) => (
                      <div
                        key={n.id}
                        className={`flex items-start gap-2.5 rounded px-2 py-2.5 ${!n.read ? 'bg-white/5' : ''}`}
                      >
                        {n.type === 'confirmed' ? (
                          <CheckCircle2 size={13} className="mt-0.5 flex-shrink-0 text-brand-leaf" />
                        ) : n.type === 'rejected' ? (
                          <XCircle size={13} className="mt-0.5 flex-shrink-0 text-red-400" />
                        ) : (
                          <Bell size={13} className="mt-0.5 flex-shrink-0 text-gold-warm" />
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium text-cream-primary">{n.title}</p>
                            <span className="flex-shrink-0 text-[10px] text-cream-secondary/40">
                              {fmtDate(n.created_at)}
                            </span>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[11px] leading-4 text-cream-secondary/55">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
