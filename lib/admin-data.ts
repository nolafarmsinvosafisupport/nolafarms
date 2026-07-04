import type { BlockedDate, Booking } from './booking-types';
import type { Order, Product } from './product-types';
import { getDb, isDbConfigured, ensureMigrated } from './db';

export async function getAdminBookings() {
  if (!isDbConfigured()) return { bookings: [] as Booking[], setupMessage: setupMsg() };
  try {
    await ensureMigrated();
    const sql = getDb();
    const bookings = await sql<Booking[]>`SELECT * FROM bookings ORDER BY created_at DESC`;
    return { bookings, setupMessage: null };
  } catch (e) {
    return { bookings: [] as Booking[], setupMessage: String(e) };
  }
}

export async function getAdminBooking(id: string) {
  if (!isDbConfigured()) return { booking: null as Booking | null, setupMessage: setupMsg() };
  try {
    await ensureMigrated();
    const sql = getDb();
    const [booking] = await sql<Booking[]>`SELECT * FROM bookings WHERE id = ${id}`;
    return { booking: booking ?? null, setupMessage: null };
  } catch (e) {
    return { booking: null as Booking | null, setupMessage: String(e) };
  }
}

export async function getBlockedDates() {
  if (!isDbConfigured()) return { blockedDates: [] as BlockedDate[], setupMessage: setupMsg() };
  try {
    await ensureMigrated();
    const sql = getDb();
    const blockedDates = await sql<BlockedDate[]>`SELECT * FROM blocked_dates ORDER BY date`;
    return { blockedDates, setupMessage: null };
  } catch (e) {
    return { blockedDates: [] as BlockedDate[], setupMessage: String(e) };
  }
}

export function bookingStats(bookings: Booking[]) {
  const today = new Date().toISOString().slice(0, 10);
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const monthStart = today.slice(0, 7);

  return {
    pending: bookings.filter((b) => b.status === 'pending').length,
    confirmed: bookings.filter((b) => b.status === 'confirmed').length,
    thisWeek: bookings.filter((b) => b.visit_date >= today && b.visit_date <= weekFromNow).length,
    thisMonth: bookings.filter((b) => b.visit_date.startsWith(monthStart)).length,
    todayVisits: bookings.filter((b) => b.visit_date === today && b.status === 'confirmed'),
    pendingBookings: bookings.filter((b) => b.status === 'pending'),
  };
}

export async function getOrderStats() {
  if (!isDbConfigured()) return { total: 0, newOrders: 0, recent: [] as Order[] };
  try {
    await ensureMigrated();
    const sql = getDb();
    const [totals] = await sql<[{ total: string; new_count: string }]>`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE status = 'new') as new_count FROM orders
    `;
    const recent = await sql<Order[]>`SELECT * FROM orders ORDER BY created_at DESC LIMIT 5`;
    return { total: parseInt(totals.total), newOrders: parseInt(totals.new_count), recent };
  } catch {
    return { total: 0, newOrders: 0, recent: [] as Order[] };
  }
}

export async function getProductStats() {
  if (!isDbConfigured()) return { total: 0, available: 0 };
  try {
    await ensureMigrated();
    const sql = getDb();
    const [counts] = await sql<[{ total: string; available_count: string }]>`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE available = TRUE) as available_count FROM products
    `;
    return { total: parseInt(counts.total), available: parseInt(counts.available_count) };
  } catch {
    return { total: 0, available: 0 };
  }
}

function setupMsg() {
  return 'DATABASE_URL is not configured. Add it in Railway and redeploy.';
}
