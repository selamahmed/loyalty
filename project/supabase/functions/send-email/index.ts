/**
 * Supabase Edge Function: send-email
 *
 * Deploy with:
 *   supabase functions deploy send-email --no-verify-jwt
 *
 * Required environment secrets (set in Supabase Dashboard → Edge Functions):
 *   RESEND_API_KEY   – get a free key at https://resend.com
 *   FROM_EMAIL       – verified sender address e.g. noreply@yourdomain.com
 *
 * If you prefer SendGrid or AWS SES, swap the fetch() call below with the
 * corresponding API. The request/response contract stays the same.
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

interface EmailRequest {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const fromEmail    = Deno.env.get('FROM_EMAIL') ?? 'noreply@yourdomain.com';

    if (!resendApiKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY secret is not configured in Edge Functions' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: EmailRequest = await req.json();
    const toList = Array.isArray(body.to) ? body.to : [body.to];

    // Resend supports up to 50 recipients per call; chunk larger lists.
    const CHUNK_SIZE = 50;
    const chunks: string[][] = [];
    for (let i = 0; i < toList.length; i += CHUNK_SIZE) {
      chunks.push(toList.slice(i, i + CHUNK_SIZE));
    }

    let totalSent = 0;
    for (const chunk of chunks) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromEmail,
          to: chunk,
          subject: body.subject,
          html: body.html,
          text: body.text,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[send-email] Resend error:', data);
        // Don't abort — continue with remaining chunks
      } else {
        totalSent += chunk.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, sent: totalSent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
