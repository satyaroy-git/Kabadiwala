import { supabase } from './supabase';
import {
  KabadiwalaProfile,
  KabadiwalaOnboardingData,
  Booking,
  WeightEntryRequest,
  EarningsSummary,
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

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ========== Profile & Onboarding ==========

export async function getKabadiwalaProfile(): Promise<KabadiwalaProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('kabadiwala_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data;
}

export async function createKabadiwalaProfile(
  onboardingData: KabadiwalaOnboardingData
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Upload selfie
  const selfieUrl = await uploadFile(
    onboardingData.selfie_uri,
    `kabadiwala/${user.id}/selfie.jpg`
  );

  // Upload vehicle photo
  const vehiclePhotoUrl = await uploadFile(
    onboardingData.vehicle_photo_uri,
    `kabadiwala/${user.id}/vehicle.jpg`
  );

  const { data, error } = await supabase
    .from('kabadiwala_profiles')
    .insert({
      user_id: user.id,
      name: onboardingData.name,
      phone: onboardingData.phone,
      selfie_url: selfieUrl,
      vehicle_photo_url: vehiclePhotoUrl,
      vehicle_type: onboardingData.vehicle_type,
      service_pincodes: onboardingData.service_pincodes,
      availability: onboardingData.availability,
      status: 'pending_verification',
      rating: 0,
      total_pickups: 0,
      total_earnings: 0,
      is_online: false,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function uploadFile(uri: string, path: string): Promise<string> {
  // Skip upload if URI is empty (demo/testing mode)
  if (!uri || uri === 'placeholder' || uri === '') {
    return '';
  }

  const response = await fetch(uri);
  const blob = await response.blob();

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(path, blob, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

// ========== Online Status ==========

export async function setOnlineStatus(isOnline: boolean) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('kabadiwala_profiles')
    .update({ is_online: isOnline })
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function updateLocation(lat: number, lng: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('kabadiwala_profiles')
    .update({ current_lat: lat, current_lng: lng })
    .eq('user_id', user.id);

  if (error) throw error;
}

// ========== Pickup Requests ==========

export async function getPickupRequests(): Promise<Booking[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get profile to check service pincodes
  const profile = await getKabadiwalaProfile();
  if (!profile) return [];

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      household:household_profiles (name, phone),
      address:addresses (*)
    `)
    .in('status', ['pending', 'assigned'])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getMyActivePickups(): Promise<Booking[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      household:household_profiles (name, phone),
      address:addresses (*)
    `)
    .eq('kabadiwala_id', user.id)
    .in('status', ['accepted', 'en_route', 'arrived', 'weighing'])
    .order('scheduled_date', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function acceptPickup(bookingId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('bookings')
    .update({
      kabadiwala_id: user.id,
      status: 'accepted',
      accepted_at: new Date().toISOString(),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function rejectPickup(bookingId: string, reason: string) {
  const { data, error } = await supabase
    .from('booking_rejections')
    .insert({
      booking_id: bookingId,
      reason,
    });

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(
  bookingId: string,
  status: string
) {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
      ...(status === 'arrived' && { arrived_at: new Date().toISOString() }),
      ...(status === 'en_route' && { started_at: new Date().toISOString() }),
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ========== Weight Entry & Billing ==========

export async function submitWeightEntry(request: WeightEntryRequest) {
  const { data, error } = await supabase.rpc('submit_weight_entry', {
    p_booking_id: request.booking_id,
    p_items: request.items,
  });

  if (error) throw error;
  return data;
}

// ========== Location Broadcasting ==========

export async function broadcastLocation(
  bookingId: string,
  lat: number,
  lng: number
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('location_updates')
    .insert({
      booking_id: bookingId,
      kabadiwala_id: user.id,
      lat,
      lng,
      timestamp: new Date().toISOString(),
    });

  if (error) console.error('Location broadcast error:', error);
}

// ========== Earnings ==========

export async function getEarningsSummary(): Promise<EarningsSummary> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_earnings_summary', {
    p_kabadiwala_id: user.id,
  });

  if (error) throw error;
  return data || {
    today: 0,
    this_week: 0,
    this_month: 0,
    total: 0,
    total_pickups: 0,
    total_commission_paid: 0,
    pending_payout: 0,
  };
}

export async function getTransactionHistory(): Promise<Transaction[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      transaction_items (*),
      booking:bookings (scheduled_date, address)
    `)
    .eq('kabadiwala_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ========== Realtime Subscriptions ==========

export function subscribeToNewRequests(
  pincodes: string[],
  callback: (booking: any) => void
) {
  const channel = supabase
    .channel('new-requests')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
        filter: `status=eq.pending`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
