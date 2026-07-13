export const BOOKING_STATUSES = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  ACCEPTED: 'accepted',
  EN_ROUTE: 'en_route',
  ARRIVED: 'arrived',
  WEIGHING: 'weighing',
  PAYMENT_PENDING: 'payment_pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show',
} as const;

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const KABADIWALA_STATUSES = {
  PENDING_VERIFICATION: 'pending_verification',
  VERIFIED: 'verified',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
} as const;

export const VEHICLE_TYPES = {
  BICYCLE: 'bicycle',
  CART: 'cart',
  AUTO_RICKSHAW: 'auto_rickshaw',
  MINI_TRUCK: 'mini_truck',
  TRUCK: 'truck',
} as const;

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  bicycle: 'Bicycle',
  cart: 'Hand Cart',
  auto_rickshaw: 'Auto Rickshaw',
  mini_truck: 'Mini Truck',
  truck: 'Truck',
};

export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_ACCEPTED: 'booking_accepted',
  KABADIWALA_EN_ROUTE: 'kabadiwala_en_route',
  KABADIWALA_ARRIVED: 'kabadiwala_arrived',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_SENT: 'payment_sent',
  RATING_REMINDER: 'rating_reminder',
  NEW_PICKUP_REQUEST: 'new_pickup_request',
  BOOKING_CANCELLED: 'booking_cancelled',
  RATE_UPDATE: 'rate_update',
} as const;

export const USER_ROLES = {
  HOUSEHOLD: 'household',
  KABADIWALA: 'kabadiwala',
  ADMIN: 'admin',
} as const;
