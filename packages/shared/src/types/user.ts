export interface User {
  id: string;
  phone: string;
  role: UserRole;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type UserRole = 'household' | 'kabadiwala' | 'admin';

export interface HouseholdProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  addresses: Address[];
  default_address_id: string | null;
  total_pickups: number;
  total_recycled_kg: number;
  created_at: string;
}

export interface KabadiwalaProfile {
  id: string;
  user_id: string;
  name: string;
  phone: string;
  aadhaar_verified: boolean;
  aadhaar_number_masked: string | null; // Last 4 digits only
  selfie_url: string | null;
  vehicle_photo_url: string | null;
  vehicle_type: VehicleType;
  service_pincodes: string[];
  availability: AvailabilitySchedule;
  rating: number;
  total_pickups: number;
  total_earnings: number;
  status: KabadiwalaStatus;
  is_online: boolean;
  current_lat: number | null;
  current_lng: number | null;
  created_at: string;
}

export type VehicleType = 'bicycle' | 'cart' | 'auto_rickshaw' | 'mini_truck' | 'truck';

export type KabadiwalaStatus = 'pending_verification' | 'verified' | 'suspended' | 'inactive';

export interface Address {
  id: string;
  label: string; // "Home", "Office", etc.
  full_address: string;
  landmark: string | null;
  pincode: string;
  city: string;
  state: string;
  lat: number;
  lng: number;
}

export interface AvailabilitySchedule {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // "09:00"
  end: string;   // "12:00"
}

export interface KabadiwalaOnboardingData {
  name: string;
  phone: string;
  aadhaar_consent: boolean;
  selfie_uri: string;
  vehicle_photo_uri: string;
  vehicle_type: VehicleType;
  service_pincodes: string[];
  availability: AvailabilitySchedule;
}
