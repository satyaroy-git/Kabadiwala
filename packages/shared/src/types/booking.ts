import { Address } from './user';

export interface Booking {
  id: string;
  household_id: string;
  kabadiwala_id: string | null;
  status: BookingStatus;
  scrap_items: BookingItem[];
  address: Address;
  scheduled_date: string; // ISO date
  time_slot: BookingTimeSlot;
  locked_rates: LockedRate[];
  total_estimated_amount: number;
  actual_amount: number | null;
  notes: string | null;
  cancellation_reason: string | null;
  created_at: string;
  accepted_at: string | null;
  started_at: string | null;
  arrived_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
}

export type BookingStatus =
  | 'pending'           // Waiting for kabadiwala assignment
  | 'assigned'          // Kabadiwala assigned, waiting for acceptance
  | 'accepted'          // Kabadiwala accepted
  | 'en_route'          // Kabadiwala on the way
  | 'arrived'           // Kabadiwala at location
  | 'weighing'          // Weighing in progress
  | 'weight_verification' // Waiting for household to confirm weights
  | 'payment_pending'   // Bill generated, payment processing
  | 'completed'         // Pickup done, payment received
  | 'cancelled'         // Cancelled by either party
  | 'disputed'          // Household disputed the weight
  | 'no_show';          // Kabadiwala didn't show up

export interface BookingItem {
  category_id: string;
  category_name: string;
  estimated_weight_kg: number;
  actual_weight_kg: number | null;
  locked_rate_per_kg: number;
  estimated_amount: number;
  actual_amount: number | null;
}

export interface BookingTimeSlot {
  start: string; // "09:00"
  end: string;   // "12:00"
  label: string; // "Morning (9 AM - 12 PM)"
}

export interface LockedRate {
  category_id: string;
  category_name: string;
  rate_per_kg: number;
  locked_at: string; // ISO timestamp
}

export interface CreateBookingRequest {
  scrap_items: {
    category_id: string;
    estimated_weight_kg: number;
  }[];
  address_id: string;
  scheduled_date: string;
  time_slot_id: string;
  notes?: string;
}

export interface WeightEntryRequest {
  booking_id: string;
  items: {
    category_id: string;
    actual_weight_kg: number;
  }[];
}

// Available time slots for booking
export const BOOKING_TIME_SLOTS: BookingTimeSlot[] = [
  { start: '09:00', end: '12:00', label: 'Morning (9 AM - 12 PM)' },
  { start: '12:00', end: '15:00', label: 'Afternoon (12 PM - 3 PM)' },
  { start: '15:00', end: '18:00', label: 'Evening (3 PM - 6 PM)' },
  { start: '18:00', end: '20:00', label: 'Late Evening (6 PM - 8 PM)' },
];
