// Deploy: supabase functions deploy ban-user --no-verify-jwt
// Requires SUPABASE_SERVICE_ROLE_KEY secret

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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Unauthorized');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: { user: caller }, error: authErr } = await supabaseAdmin.auth.getUser(token);
    if (authErr || !caller) throw new Error('Unauthorized');

    const { data: callerProfile } = await supabaseAdmin
      .from('profiles')
      .select('role,status')
      .eq('id', caller.id)
      .maybeSingle();

    if (
      !callerProfile ||
      callerProfile.status !== 'active' ||
      !['super_admin', 'store_admin'].includes(callerProfile.role)
    ) {
      throw new Error('Forbidden');
    }

    const { userId, status } = await req.json() as { userId: string; status?: 'deleted' | 'suspended' | 'active' };
    if (!userId) throw new Error('userId required');

    const targetStatus = status ?? 'deleted';
    if (!['deleted', 'suspended', 'active'].includes(targetStatus)) throw new Error('Invalid status');
    if (userId === caller.id) throw new Error('Cannot change your own account status');

    const { data: targetProfile } = await supabaseAdmin
      .from('profiles')
      .select('role,status')
      .eq('id', userId)
      .maybeSingle();

    if (!targetProfile) throw new Error('Target user not found');
    if (callerProfile.role !== 'super_admin') {
      if (targetStatus === 'deleted') throw new Error('Only super admins can delete users');
      if (!['customer', 'cashier'].includes(targetProfile.role)) {
        throw new Error('Store admins cannot modify admin accounts');
      }
    }

    await supabaseAdmin.rpc('admin_set_user_status', {
      p_user_id: userId,
      p_status: targetStatus,
    });

    if (targetStatus === 'deleted') {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876600h',
      });
    } else if (targetStatus === 'active') {
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      });
    }

    return new Response(JSON.stringify({ ok: true, userId, status: targetStatus }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
