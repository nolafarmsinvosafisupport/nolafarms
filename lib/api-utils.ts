import { z } from 'zod';
import { isCurrentUserAdmin, getCurrentUserId } from './auth';
import { isDbConfigured, dbNotConfiguredResponse } from './db';

export const bookingSchema = z.object({
  full_name: z.string().min(2),
  phone_number: z.string().min(6),
  email: z.string().email(),
  visit_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  visit_time: z.enum(['morning', 'afternoon']),
  group_size: z.coerce.number().int().min(1),
  purpose: z.string().min(2),
  special_requests: z.string().optional().nullable(),
});

export const profileSchema = z.object({
  phone_number: z.string().optional().nullable(),
  notify_on_confirm: z.boolean().optional(),
  notify_on_reminder: z.boolean().optional(),
  notify_on_rejection: z.boolean().optional(),
});

export function requireDb(feature: string) {
  if (!isDbConfigured()) return dbNotConfiguredResponse(feature);
  return null;
}

export async function requireUserResponse() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return {
      userId: null,
      response: Response.json({ success: false, message: 'Authentication required.' }, { status: 401 }),
    };
  }
  return { userId, response: null };
}

export async function requireAdminResponse() {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) return Response.json({ success: false, message: 'Admin access required.' }, { status: 403 });
  return null;
}
