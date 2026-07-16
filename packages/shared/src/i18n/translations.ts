export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'te' | 'kn';

export const LANGUAGES: { code: Language; name: string; nativeName: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
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
  help_support: string;
  recurring_pickups: string;
  my_impact: string;
  rewards_badges: string;
  refer_earn: string;
  coming_soon: string;
  profile: string;
  home: string;
}
