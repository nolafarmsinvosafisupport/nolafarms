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

const PRODUCT_CATEGORIES = ['cattle', 'goats', 'sheep', 'pigs', 'poultry', 'vegetables', 'fruits', 'grains'] as const;
const RANCHES = ['oloitoktok', 'laikipia', 'both'] as const;
const ORDER_STATUSES = ['new', 'contacted', 'fulfilled', 'cancelled'] as const;

export const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens only.'),
  category: z.enum(PRODUCT_CATEGORIES),
  ranch: z.enum(RANCHES),
  description: z.string().optional().nullable(),
  details: z.array(z.string()).optional(),
  price: z.coerce.number().nonnegative().optional().nullable(),
  compare_at_price: z.coerce.number().nonnegative().optional().nullable(),
  price_unit: z.string().optional(),
  bulk_info: z.string().optional().nullable(),
  images: z.array(z.string()).optional(),
  available: z.boolean().optional(),
  sort_order: z.coerce.number().int().optional(),
});

export const productUpdateSchema = productCreateSchema.partial();

export const orderUpdateSchema = z.object({
  status: z.enum(ORDER_STATUSES).optional(),
  admin_note: z.string().optional().nullable(),
});

// Parses the request body as JSON, returning a clean 400 instead of an unhandled
// exception if the body is missing or malformed.
export async function parseJsonBody(request: Request): Promise<{ data: unknown; error: Response | null }> {
  try {
    return { data: await request.json(), error: null };
  } catch {
    return { data: null, error: Response.json({ success: false, message: 'Invalid JSON in request body.' }, { status: 400 }) };
  }
}

// Maps a thrown DB error to a clean JSON response instead of letting it surface as a raw 500.
export function dbErrorResponse(e: unknown, fallback = 'Something went wrong. Please try again.') {
  const err = e as { code?: string };
  if (err?.code === '23505') {
    return Response.json({ success: false, message: 'That value is already in use — please choose a different one.' }, { status: 409 });
  }
  console.error(err);
  return Response.json({ success: false, message: fallback }, { status: 500 });
}

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
