import type { Booking, BookingStatus, VisitTime } from './booking-types';
import { getSupabaseAdmin } from './supabase';

export const VISIT_PURPOSES = [
  'Guided Ranch Tour (General)',
  'Livestock Viewing',
  'Educational / School Group',
  'Photography / Media',
  'Corporate / Investor Visit',
  'Other',
];

export const VISIT_TIMES: Record<VisitTime, string> = {
  morning: 'Morning (9:00 AM)',
  afternoon: 'Afternoon (1:00 PM)',
};

export const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Awaiting confirmation',
  confirmed: 'Confirmed',
  rejected: 'Unable to accommodate',
  cancelled: 'Cancelled',
  completed: 'Visit completed',
};

export function minimumVisitDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function canVisitorCancel(booking: Pick<Booking, 'status' | 'visit_date'>) {
  if (!['pending', 'confirmed'].includes(booking.status)) return false;
  const visitTime = new Date(`${booking.visit_date}T00:00:00`).getTime();
  return visitTime - Date.now() > 24 * 60 * 60 * 1000;
}

export function statusBadgeClass(status: BookingStatus) {
  const classes: Record<BookingStatus, string> = {
    pending: 'bg-gold-warm/20 text-brand-deep border-gold-warm',
    confirmed: 'bg-brand-leaf/20 text-brand-deep border-brand-leaf',
    rejected: 'bg-red-400/20 text-red-900 border-red-400',
    cancelled: 'bg-farm-muted/20 text-brand-deep border-farm-muted',
    completed: 'bg-cream-secondary text-brand-deep border-farm-border',
  };
  return classes[status];
}

export async function generateBookingReference() {
  const year = new Date().getFullYear();
  const prefix = `NF-${year}-`;
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01T00:00:00.000Z`)
    .lt('created_at', `${year + 1}-01-01T00:00:00.000Z`);

  if (error) throw error;
  return `${prefix}${String((count ?? 0) + 1).padStart(4, '0')}`;
}

export function bookingReferenceFromCount(count: number) {
  return `NF-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
}
