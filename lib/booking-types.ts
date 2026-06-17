export type BookingStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled' | 'completed';
export type VisitTime = 'morning' | 'afternoon';
export type CancellationBy = 'visitor' | 'admin';

export type Booking = {
  id: string;
  reference: string;
  user_id: string | null;
  full_name: string;
  phone_number: string;
  email: string;
  visit_date: string;
  visit_time: VisitTime;
  group_size: number;
  purpose: string;
  special_requests: string | null;
  status: BookingStatus;
  admin_note: string | null;
  confirmed_at: string | null;
  rejected_at: string | null;
  cancelled_at: string | null;
  cancellation_by: CancellationBy | null;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
};

export type BlockedDate = {
  id: string;
  date: string;
  reason: string | null;
  created_at: string;
};

export type UserProfile = {
  id: string;
  clerk_user_id: string;
  phone_number: string | null;
  notify_on_confirm: boolean;
  notify_on_reminder: boolean;
  notify_on_rejection: boolean;
  created_at: string;
  updated_at: string;
};

export type NotificationType = 'submitted' | 'confirmed' | 'rejected' | 'cancelled';

export type Notification = {
  id: string;
  user_id: string;
  booking_id: string | null;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type BookingInput = {
  full_name: string;
  phone_number: string;
  email: string;
  visit_date: string;
  visit_time: VisitTime;
  group_size: number;
  purpose: string;
  special_requests?: string;
};
