'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import type { Notification } from './booking-types';

// Admin pages poll faster so new orders/bookings appear within 10s
const ADMIN_POLL = 10_000;
const USER_POLL = 30_000;

type NotificationContextType = {
  notifications: Notification[];
  unreadCount: number;
  unreadOrderCount: number;
  unreadBookingCount: number;
  isAdmin: boolean;
  markAllRead: () => void;
};

const NotificationContext = createContext<NotificationContextType | null>(null);

function playGoatSound() {
  try {
    const audio = new Audio('/sounds/Goat-noise.mp3');
    audio.volume = 0.55;
    audio.play().catch(() => undefined);
  } catch {
    // Ignore — browser may block autoplay before first user interaction
  }
}

// Single shared poll of /api/notifications, consumed by both NotificationBell
// (top-right) and AdminSidebar (per-section badges) so they don't each run their
// own independent polling loop against the same endpoint.
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const pollInterval = pathname.startsWith('/admin') ? ADMIN_POLL : USER_POLL;

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadOrderCount, setUnreadOrderCount] = useState(0);
  const [unreadBookingCount, setUnreadBookingCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const prevUnreadRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSignedIn) return;

    function doFetch() {
      fetch('/api/notifications')
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          setNotifications(d?.notifications ?? []);
          setUnreadCount(d?.unreadCount ?? 0);
          setUnreadOrderCount(d?.unreadOrderCount ?? 0);
          setUnreadBookingCount(d?.unreadBookingCount ?? 0);
          setIsAdmin(Boolean(d?.isAdmin));
        })
        .catch(() => undefined);
    }

    let t: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (t) return;
      doFetch();
      t = setInterval(doFetch, pollInterval);
    }
    function stopPolling() {
      if (t) { clearInterval(t); t = null; }
    }
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') stopPolling();
      else startPolling();
    }

    startPolling();
    window.addEventListener('nola:notif:refresh', doFetch);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      window.removeEventListener('nola:notif:refresh', doFetch);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isSignedIn, pollInterval]);

  // Play goat sound when unread count increases (new notification arrived)
  useEffect(() => {
    if (prevUnreadRef.current !== null && unreadCount > prevUnreadRef.current) {
      playGoatSound();
    }
    prevUnreadRef.current = unreadCount;
  }, [unreadCount]);

  function markAllRead() {
    fetch('/api/notifications', { method: 'PATCH' })
      .then(() => {
        setUnreadCount(0);
        setUnreadOrderCount(0);
        setUnreadBookingCount(0);
      })
      .catch(() => undefined);
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, unreadOrderCount, unreadBookingCount, isAdmin, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
