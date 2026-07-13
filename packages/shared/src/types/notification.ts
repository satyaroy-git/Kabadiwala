export interface AppNotification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, string>;
  is_read: boolean;
  created_at: string;
}

export type NotificationType =
  | 'booking_confirmed'
  | 'booking_accepted'
  | 'kabadiwala_en_route'
  | 'kabadiwala_arrived'
  | 'payment_received'
  | 'payment_sent'
  | 'rating_reminder'
  | 'new_pickup_request'
  | 'booking_cancelled'
  | 'rate_update';

export interface PushNotificationPayload {
  token: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface WhatsAppMessage {
  to: string; // phone number with country code
  template: WhatsAppTemplate;
  parameters: Record<string, string>;
}

export type WhatsAppTemplate =
  | 'booking_confirmation'
  | 'kabadiwala_arriving'
  | 'payment_receipt'
  | 'pickup_reminder';
