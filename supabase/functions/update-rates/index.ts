// Edge Function: Update Rate Card
// Admin function to update scrap rates (can be triggered weekly via cron)

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

    const { updates } = await req.json();
    // updates: [{ category_id: string, new_rate: number }]

    if (!updates || !Array.isArray(updates)) {
      return new Response(
        JSON.stringify({ error: 'updates array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = [];

    for (const update of updates) {
      // Get current rate
      const { data: currentRate } = await supabase
        .from('rate_cards')
        .select('rate_per_kg')
        .eq('category_id', update.category_id)
        .eq('is_active', true)
        .single();

      const previousRate = currentRate?.rate_per_kg || 0;
      const rateChange = previousRate > 0
        ? ((update.new_rate - previousRate) / previousRate) * 100
        : 0;

      // Update rate card
      const { data, error } = await supabase
        .from('rate_cards')
        .update({
          rate_per_kg: update.new_rate,
          previous_rate: previousRate,
          rate_change: Math.round(rateChange * 100) / 100,
          updated_at: new Date().toISOString(),
        })
        .eq('category_id', update.category_id)
        .eq('is_active', true)
        .select()
        .single();

      if (!error) {
        results.push({
          category_id: update.category_id,
          old_rate: previousRate,
          new_rate: update.new_rate,
          change_percent: rateChange,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, updated: results.length, results }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
