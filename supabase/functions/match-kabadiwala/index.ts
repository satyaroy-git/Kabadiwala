// Edge Function: Match Kabadiwala
// Finds and assigns the nearest verified kabadiwala to a booking

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { booking_id } = await req.json();

    if (!booking_id) {
      return new Response(
        JSON.stringify({ error: 'booking_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, address:addresses(*)')
      .eq('id', booking_id)
      .single();

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (booking.status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Booking is not in pending state' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const address = booking.address || {};
    const pincode = address.pincode;
    const lat = address.lat;
    const lng = address.lng;

    // Find nearest kabadiwalas using the database function
    const { data: matches, error: matchError } = await supabase
      .rpc('find_nearest_kabadiwala', {
        p_pincode: pincode,
        p_lat: lat,
        p_lng: lng,
        p_booking_id: booking_id,
      });

    if (matchError || !matches || matches.length === 0) {
      return new Response(
        JSON.stringify({
          matched: false,
          message: 'No available kabadiwalas found in this area',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Assign the top match
    const bestMatch = matches[0];

    // Update booking with assigned kabadiwala
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        kabadiwala_id: bestMatch.kabadiwala_id,
        status: 'assigned',
      })
      .eq('id', booking_id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: 'Failed to assign kabadiwala' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notification to kabadiwala
    await supabase.from('notifications').insert({
      user_id: bestMatch.kabadiwala_id,
      type: 'new_pickup_request',
      title: 'New Pickup Request!',
      body: `Pickup request nearby - ${booking.scrap_items?.length || 0} items`,
      data: { booking_id },
    });

    // Send notification to household
    await supabase.from('notifications').insert({
      user_id: booking.household_id,
      type: 'booking_confirmed',
      title: 'Kabadiwala Assigned!',
      body: `${bestMatch.name} has been assigned to your pickup.`,
      data: { booking_id, kabadiwala_name: bestMatch.name },
    });

    return new Response(
      JSON.stringify({
        matched: true,
        kabadiwala: {
          id: bestMatch.kabadiwala_id,
          name: bestMatch.name,
          distance_km: bestMatch.distance_km,
          rating: bestMatch.rating,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
