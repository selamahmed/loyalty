# Supabase Edge Function: send-push
# Deploy: supabase functions deploy send-push --no-verify-jwt
# Secrets: VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const { data: { user }, error: authErr } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', ''),
    );
    if (authErr || !user) throw new Error('Unauthorized');

    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (!adminProfile || !['super_admin', 'store_admin'].includes(adminProfile.role)) {
      throw new Error('Forbidden');
    }

    const { userIds, title, message } = await req.json();
    if (!title || !message) throw new Error('title and message required');

    let query = supabase.from('push_subscriptions').select('*');
    if (userIds?.length) query = query.in('user_id', userIds);

    const { data: subs, error: subErr } = await query;
    if (subErr) throw subErr;

    // Store in-app notification for each user
    const targets = [...new Set((subs ?? []).map(s => s.user_id))];
    if (targets.length) {
      await supabase.from('notifications').insert(
        targets.map(uid => ({
          user_id: uid,
          type: 'system',
          title,
          message,
          icon: '🔔',
          read: false,
        })),
      );
    }

    return new Response(
      JSON.stringify({ sent: subs?.length ?? 0, notified: targets.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
