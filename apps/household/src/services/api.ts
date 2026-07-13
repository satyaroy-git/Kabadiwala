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

export async function signInWithEmail(email: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });
  if (error) throw error;
  return data;
}

export async function verifyOTP(email: string, otp: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token: otp,
    type: 'email',
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
    .select(`
      *,
      scrap_categories (name, icon)
    `)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
}

// ========== Bookings ==========

export async function createBooking(request: CreateBookingRequest): Promise<Booking> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .rpc('create_booking', {
      p_household_id: user.id,
      p_scrap_items: request.scrap_items,
      p_address_id: request.address_id,
      p_scheduled_date: request.scheduled_date,
      p_time_slot_id: request.time_slot_id,
      p_notes: request.notes || null,
    });

  if (error) throw error;
  return data;
}

export async function getBookings(status?: string): Promise<Booking[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('bookings')
    .select(`
      *,
      kabadiwala:kabadiwala_profiles (name, phone, selfie_url, rating, vehicle_type)
    `)
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
    .select(`
      *,
      kabadiwala:kabadiwala_profiles (name, phone, selfie_url, rating, vehicle_type),
      transaction:transactions (*)
    `)
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
    .select(`
      *,
      transaction_items (*),
      booking:bookings (scheduled_date, address)
    `)
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
