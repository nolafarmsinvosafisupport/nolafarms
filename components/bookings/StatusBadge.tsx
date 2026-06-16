import type { BookingStatus } from '@/lib/booking-types';
import { statusBadgeClass, STATUS_LABELS } from '@/lib/booking-utils';

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={`inline-flex border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${statusBadgeClass(status)}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
