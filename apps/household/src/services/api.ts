import { supabase } from './supabase';
import {
  Booking,
  CreateBookingRequest,
  RateCard,
  HouseholdProfile,
  Address,
  Transaction,
} from '@kabadiwala/shared';

// ========== Auth ==========

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
}

export async function signInWithPhone(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });
  if (error) throw error;
  return data;
}

export async function verifyOTP(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ========== Profile ==========

export async function getHouseholdProfile(): Promise<HouseholdProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('household_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  return data;
}

export async function createHouseholdProfile(profile: {
  name: string;
  phone: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('household_profiles')
    .insert({
      user_id: user.id,
      name: profile.name,
      phone: profile.phone,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHouseholdProfile(updates: Partial<HouseholdProfile>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('household_profiles')
    .update(updates)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== Addresses ==========

export async function getAddresses(): Promise<Address[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addAddress(address: Omit<Address, 'id'>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('addresses')
    .insert({ ...address, user_id: user.id })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== Rate Card ==========

export async function getRateCards(): Promise<RateCard[]> {
  const { data, error } = await supabase
    .from('rate_cards')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ========== Bookings ==========

export async function createBooking(request: CreateBookingRequest): Promise<Booking> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get current rates for the selected items
  const { data: rates } = await supabase
    .from('rate_cards')
    .select('*')
    .eq('is_active', true);

  // Build scrap items with locked rates
  const scrapItems = request.scrap_items.map((item) => {
    const rate = rates?.find((r: any) => r.category_id === item.category_id);
    const ratePerKg = rate?.rate_per_kg || 0;
    return {
      category_id: item.category_id,
      category_name: rate?.category_name || item.category_id,
      estimated_weight_kg: item.estimated_weight_kg,
      actual_weight_kg: null,
      locked_rate_per_kg: ratePerKg,
      estimated_amount: item.estimated_weight_kg * ratePerKg,
      actual_amount: null,
    };
  });

  const totalEstimated = scrapItems.reduce((sum, item) => sum + item.estimated_amount, 0);

  const timeSlotMap: Record<string, any> = {
    '09:00': { start: '09:00', end: '12:00', label: 'Morning (9 AM - 12 PM)' },
    '12:00': { start: '12:00', end: '15:00', label: 'Afternoon (12 PM - 3 PM)' },
    '15:00': { start: '15:00', end: '18:00', label: 'Evening (3 PM - 6 PM)' },
    '18:00': { start: '18:00', end: '20:00', label: 'Late Evening (6 PM - 8 PM)' },
  };

  const { data, error } = await supabase
    .from('bookings')
    .insert({
      household_id: user.id,
      status: 'pending',
      scrap_items: scrapItems,
      address_id: request.address_id,
      scheduled_date: request.scheduled_date,
      time_slot: timeSlotMap[request.time_slot_id] || timeSlotMap['09:00'],
      locked_rates: scrapItems.map((i) => ({
        category_id: i.category_id,
        category_name: i.category_name,
        rate_per_kg: i.locked_rate_per_kg,
        locked_at: new Date().toISOString(),
      })),
      total_estimated_amount: totalEstimated,
      notes: request.notes || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBookings(status?: string): Promise<Booking[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('bookings')
    .select('*')
    .eq('household_id', user.id)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getBookingById(bookingId: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data;
}

export async function cancelBooking(bookingId: string, reason: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'cancelled',
      cancellation_reason: reason,
      cancelled_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== Weight Verification ==========

export async function confirmWeight(bookingId: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'payment_pending',
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function disputeWeight(bookingId: string, reason: string) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'disputed',
      cancellation_reason: `Weight dispute: ${reason}`,
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== Tracking ==========

export function subscribeToKabadiwalaLocation(
  bookingId: string,
  callback: (location: { lat: number; lng: number }) => void
) {
  const channel = supabase
    .channel(`tracking:${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_updates',
        filter: `booking_id=eq.${bookingId}`,
      },
      (payload) => {
        callback({
          lat: payload.new.lat,
          lng: payload.new.lng,
        });
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToBookingStatus(
  bookingId: string,
  callback: (status: string) => void
) {
  const channel = supabase
    .channel(`booking-status:${bookingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
        filter: `id=eq.${bookingId}`,
      },
      (payload) => {
        callback(payload.new.status);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// ========== Transactions ==========

export async function getTransactions(): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('household_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ========== Ratings ==========

export async function rateKabadiwala(
  bookingId: string,
  rating: number,
  comment?: string
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('ratings')
    .insert({
      booking_id: bookingId,
      household_id: user.id,
      rating,
      comment: comment || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
