// Edge Function: Send Push Notification
// Sends FCM push notifications and optional WhatsApp messages

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

    const { user_id, title, body, data, send_whatsapp, phone } = await req.json();

    if (!user_id || !title || !body) {
      return new Response(
        JSON.stringify({ error: 'user_id, title, and body are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store notification in database
    await supabase.from('notifications').insert({
      user_id,
      type: data?.type || 'general',
      title,
      body,
      data: data || {},
    });

    // Get user's push tokens
    const { data: tokens } = await supabase
      .from('push_tokens')
      .select('token, platform')
      .eq('user_id', user_id)
      .eq('is_active', true);

    // Send FCM push notifications
    if (tokens && tokens.length > 0) {
      const fcmServerKey = Deno.env.get('FCM_SERVER_KEY') ?? '';

      for (const tokenRecord of tokens) {
        try {
          await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `key=${fcmServerKey}`,
            },
            body: JSON.stringify({
              to: tokenRecord.token,
              notification: { title, body },
              data: data || {},
              android: {
                priority: 'high',
                notification: {
                  sound: 'default',
                  channel_id: 'kabadiwala_notifications',
                },
              },
              apns: {
                payload: {
                  aps: { sound: 'default', badge: 1 },
                },
              },
            }),
          });
        } catch (err) {
          console.error(`FCM send error for token ${tokenRecord.token}:`, err);
          // Mark token as inactive if it fails
          await supabase
            .from('push_tokens')
            .update({ is_active: false })
            .eq('token', tokenRecord.token);
        }
      }
    }

    // Send WhatsApp message if requested
    if (send_whatsapp && phone) {
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID') ?? '';
      const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
      const twilioFrom = Deno.env.get('TWILIO_WHATSAPP_NUMBER') ?? '';

      if (twilioSid && twilioToken) {
        try {
          const formData = new URLSearchParams();
          formData.append('From', twilioFrom);
          formData.append('To', `whatsapp:+91${phone}`);
          formData.append('Body', `*${title}*\n\n${body}`);

          await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
              },
              body: formData.toString(),
            }
          );
        } catch (err) {
          console.error('WhatsApp send error:', err);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, notifications_sent: tokens?.length || 0 }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
