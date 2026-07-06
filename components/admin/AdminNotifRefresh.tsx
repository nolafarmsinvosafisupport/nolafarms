'use client';

import { useEffect } from 'react';

// The page that renders this has already marked the relevant notifications read
// server-side (see markAdminNotificationsRead in lib/admin-data.ts). This just
// tells the already-polling NotificationProvider to re-fetch immediately, so the
// sidebar badge clears right away instead of waiting for the next poll tick.
export function AdminNotifRefresh() {
  useEffect(() => {
    window.dispatchEvent(new Event('nola:notif:refresh'));
  }, []);
  return null;
}
