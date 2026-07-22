export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn' | 'or';

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ' },
];

export interface TranslationKeys {
  // Common
  app_name: string;
  partner_app_name: string;
  back: string;
  save: string;
  cancel: string;
  done: string;
  loading: string;
  error: string;
  ok: string;
  sign_in: string;
  sign_up: string;
  sign_out: string;
  email: string;
  password: string;

  // Login
  login_subtitle: string;
  login_partner_subtitle: string;
  enter_email: string;
  enter_password: string;
  new_here: string;
  already_account: string;

  // Home
  hello: string;
  sell_scrap_best_rates: string;
  book_pickup: string;
  active_pickups: string;
  todays_rates: string;
  view_all: string;
  explore: string;

  // Rate Card
  live_rate_card: string;
  rates_per_kg: string;
  rates_locked_info: string;

  // Booking
  select_scrap: string;
  select_date_time: string;
  pick_date: string;
  pick_time_slot: string;
  pickup_address: string;
  review_booking: string;
  confirm_booking: string;
  confirm_pickup: string;
  booking_confirmed: string;
  cancel_pickup: string;

  // Profile
  saved_addresses: string;
  transaction_history: string;
  transactions: string;
  help_support: string;
  recurring_pickups: string;
  my_impact: string;
  rewards_badges: string;
  refer_earn: string;
  coming_soon: string;
  profile: string;
  home: string;

  // Booking Detail
  pickup_details: string;
  scheduled: string;
  items: string;
  amount_received: string;
  estimated_total: string;
  cancel_pickup_confirm: string;
  yes_cancel: string;
  rate_kabadiwala: string;

  // Tracking
  tracking: string;
  kabadiwala_on_way: string;
  kabadiwala_arrived: string;
  weighing_progress: string;

  // Rating
  submit_rating: string;
  thank_you: string;

  // Profile Setup
  welcome: string;
  enter_name: string;
  get_started: string;

  // Chat
  chat: string;
  send: string;
  type_message: string;
  no_messages: string;
  choose_scrap_subtitle: string;
  approx_weight: string;
  items_selected: string;
  next_select_time: string;

  // Filters & Status
  active: string;
  completed: string;
  all: string;
  pending: string;
  accepted: string;
  payment_pending: string;
  cancelled: string;
  en_route: string;
  arrived: string;

  // Home & Info
  why_kabadiwala: string;
  why_kabadiwala_points: string;
  auto_pickup: string;

  // Booking flow
  review_details: string;
  schedule: string;
  scrap_items: string;
  rates_locked_booking: string;
  add_new_address: string;
  save_address: string;
  full_address: string;
  pincode: string;
  city: string;
  landmark: string;

  // Alert messages
  booking_confirmed_msg: string;
  verified_kabadiwala_assigned: string;
  pickup_accepted: string;
  navigate_to_household: string;
  view_pickup: string;
  decline_pickup: string;
  are_you_sure: string;
  yes: string;
  no: string;
  schedule_saved: string;
  schedule_saved_msg: string;
  stop_recurring: string;
  copied: string;
  referral_copied: string;
  please_select_rating: string;
  rating_submitted: string;
  failed: string;

  // Partner app specific
  nearby_requests: string;
  accept: string;
  decline: string;
  est: string;
  your_total_spend: string;
  pickups_completed: string;
  paid_to_households: string;
  platform_fee: string;
  how_earnings_work: string;
  how_earnings_points: string;
  recent_transactions: string;
  scrap_value: string;
  total_paid: string;
  incl_platform_fee: string;
  verified: string;
  vehicle: string;
  phone: string;
  total_pickups: string;
  service_pincodes: string;
  settings: string;
  notifications: string;
  location_sharing: string;
  availability: string;
  language: string;
  tap_to_change: string;
  change_language: string;
  total_spent: string;
  on: string;
  while_online: string;

  // Partner app - Dashboard & Pickup flow
  online: string;
  offline: string;
  todays_pickups_value: string;
  this_week: string;
  this_month: string;
  insights: string;
  rating_badges: string;
  analytics: string;
  go_online_msg: string;
  navigation_active: string;
  broadcasting_location: string;
  navigating_to: string;
  ive_arrived: string;
  start_navigation: string;
  start_weighing: string;
  enter_weights: string;
  weigh_each_item: string;
  actual_weight_kg: string;
  generate_bill: string;
  total_amount: string;
  bill_generated: string;
  transaction_summary: string;
  your_total_cost: string;
  mark_complete: string;
  you_paid_msg: string;
  maximize_earnings: string;
  maximize_earnings_tips: string;

  // Time slots
  morning_slot: string;
  afternoon_slot: string;
  evening_slot: string;
  late_evening_slot: string;

  // Onboarding
  onboarding_title_1: string;
  onboarding_subtitle_1: string;
  onboarding_title_2: string;
  onboarding_subtitle_2: string;
  onboarding_title_3: string;
  onboarding_subtitle_3: string;
  skip: string;
  next: string;
}
