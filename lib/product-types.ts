export type ProductCategory = 'cattle' | 'goats' | 'sheep' | 'pigs' | 'poultry' | 'vegetables' | 'fruits' | 'grains';
export type Ranch = 'oloitoktok' | 'laikipia' | 'both';
export type OrderStatus = 'new' | 'contacted' | 'fulfilled' | 'cancelled';

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  ranch: Ranch;
  description: string | null;
  details: string[];
  price: string | null;
  compare_at_price: string | null;
  price_unit: string;
  bulk_info: string | null;
  images: string[];
  available: boolean;
  sort_order: number;
  is_service: boolean;
  in_stock: boolean;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  product_id: string;
  product_name: string;
  quantity: number;
  unit: string;
  price_at_time: string | null;
  note: string;
};

export type Order = {
  id: string;
  reference: string;
  user_id: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  items: OrderItem[];
  delivery_location: string | null;
  delivery_notes: string | null;
  status: OrderStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  product_id: string;
  product_name: string;
  slug: string;
  quantity: number;
  unit: string;
  price_at_time: string | null;
  image: string;
};

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  cattle: 'Cattle',
  goats: 'Goats',
  sheep: 'Sheep',
  pigs: 'Pigs',
  poultry: 'Poultry',
  vegetables: 'Vegetables',
  fruits: 'Fruits',
  grains: 'Grains',
};

export const RANCH_LABELS: Record<Ranch, string> = {
  oloitoktok: 'Oloitoktok Ranch',
  laikipia: 'Laikipia Ranch',
  both: 'Both Ranches',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  fulfilled: 'Fulfilled',
  cancelled: 'Cancelled',
};

// order.items is a JSONB column that postgres.js normally returns already parsed
// as an array. This defends against the rare case where it comes back as a raw
// string, without ever throwing on malformed data.
export function parseOrderItems(raw: unknown): OrderItem[] {
  if (Array.isArray(raw)) return raw as OrderItem[];
  if (typeof raw === 'string') {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
}

// A customer can cancel their own order online only while it's still 'new' or
// 'contacted' — once fulfilled (or already cancelled) there's nothing left to
// cancel. Mirrors canVisitorCancel() in lib/booking-utils.ts for bookings.
export function canCustomerCancelOrder(order: Pick<Order, 'status'>) {
  return order.status === 'new' || order.status === 'contacted';
}
