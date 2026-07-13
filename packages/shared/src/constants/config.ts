// Platform configuration
export const PLATFORM_CONFIG = {
  // Commission
  COMMISSION_PERCENTAGE: 10,        // 10% platform commission
  MIN_COMMISSION_AMOUNT: 5,         // Minimum ₹5 commission

  // Matching
  MAX_MATCHING_RADIUS_KM: 5,        // Max radius to find kabadiwala
  MATCHING_TIMEOUT_MINUTES: 5,      // Time before reassigning
  MAX_CONCURRENT_PICKUPS: 3,        // Max pickups a kabadiwala can handle

  // Booking
  MIN_BOOKING_ADVANCE_HOURS: 2,     // Minimum 2 hours advance booking
  MAX_BOOKING_ADVANCE_DAYS: 7,      // Maximum 7 days advance booking
  CANCELLATION_WINDOW_MINUTES: 30,  // Free cancellation within 30 min

  // Tracking
  LOCATION_UPDATE_INTERVAL_MS: 5000, // Every 5 seconds
  NEARBY_THRESHOLD_METERS: 200,     // "Nearby" when within 200m
  ETA_REFRESH_INTERVAL_MS: 30000,   // Refresh ETA every 30 seconds

  // Rating
  MIN_RATING: 1,
  MAX_RATING: 5,
  MIN_RATING_FOR_PREMIUM: 4.0,      // Minimum rating for premium bookings

  // Payments
  MIN_TRANSACTION_AMOUNT: 10,       // Minimum ₹10 transaction
  PAYMENT_TIMEOUT_SECONDS: 300,     // 5 min payment timeout

  // Rate Card
  RATE_UPDATE_FREQUENCY_DAYS: 7,    // Rates updated weekly

  // KYC
  AADHAAR_VERIFICATION_TIMEOUT_MS: 120000, // 2 min timeout for Aadhaar

  // Notifications
  REMINDER_BEFORE_PICKUP_MINUTES: 30, // Remind 30 min before scheduled time
} as const;

// App Info
export const APP_INFO = {
  name: 'Kabadiwala',
  version: '1.0.0',
  supportEmail: 'support@kabadiwala.app',
  supportPhone: '+91-XXXXXXXXXX',
  playStoreUrl: '',
  appStoreUrl: '',
} as const;
