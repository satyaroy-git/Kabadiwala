// Edge Function: Process Payment
// Handles UPI payment via Razorpay after weight entry

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

    const razorpayKeyId = Deno.env.get('RAZORPAY_KEY_ID') ?? '';
    const razorpaySecret = Deno.env.get('RAZORPAY_KEY_SECRET') ?? '';

    const { transaction_id } = await req.json();

    if (!transaction_id) {
      return new Response(
        JSON.stringify({ error: 'transaction_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get transaction details
    const { data: transaction, error: txnError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transaction_id)
      .single();

    if (txnError || !transaction) {
      return new Response(
        JSON.stringify({ error: 'Transaction not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (transaction.payment_status !== 'pending') {
      return new Response(
        JSON.stringify({ error: 'Payment already processed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Razorpay order for household payment
    const orderPayload = {
      amount: Math.round(transaction.household_payment * 100), // Razorpay uses paise
      currency: 'INR',
      receipt: transaction.receipt_number,
      notes: {
        booking_id: transaction.booking_id,
        transaction_id: transaction.id,
        type: 'household_payment',
      },
    };

    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpaySecret}`)}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!razorpayResponse.ok) {
      const errorData = await razorpayResponse.json();
      throw new Error(`Razorpay error: ${JSON.stringify(errorData)}`);
    }

    const order = await razorpayResponse.json();

    // Update transaction with Razorpay order ID
    await supabase
      .from('transactions')
      .update({
        razorpay_order_id: order.id,
        payment_status: 'processing',
      })
      .eq('id', transaction_id);

    // Notify household about payment
    await supabase.from('notifications').insert({
      user_id: transaction.household_id,
      type: 'payment_received',
      title: 'Payment Incoming!',
      body: `₹${transaction.household_payment} will be credited to your UPI.`,
      data: { transaction_id, amount: String(transaction.household_payment) },
    });

    return new Response(
      JSON.stringify({
        success: true,
        razorpay_order_id: order.id,
        amount: transaction.household_payment,
        currency: 'INR',
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
