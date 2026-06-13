import { supabase } from '../lib/supabase';

export type AccountStatus = 'active' | 'suspended' | 'deleted';

export function isRestrictedStatus(status: string | null | undefined): status is 'suspended' | 'deleted' {
  return status === 'suspended' || status === 'deleted';
}

let inflight: Promise<AccountStatus | null> | null = null;
let inflightUserId: string | null = null;

/** Fetch current user's account status (profile read; RPC only when needed). */
export async function fetchMyAccountStatus(userId?: string): Promise<AccountStatus | null> {
  let uid = userId;
  if (!uid) {
    const { data: { user } } = await supabase.auth.getUser();
    uid = user?.id;
  }
  if (!uid) return null;

  if (inflight && inflightUserId === uid) return inflight;

  inflightUserId = uid;
  inflight = (async () => {
    const { data: prof, error: profErr } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', uid)
      .maybeSingle();

    if (!profErr && prof?.status) {
      return prof.status as AccountStatus;
    }

    const { data: rpcStatus, error: rpcErr } = await supabase.rpc('get_my_account_status');
    if (!rpcErr && rpcStatus) return rpcStatus as AccountStatus;

    if (profErr) {
      console.error('[fetchMyAccountStatus]', profErr.message);
    }
    return (prof?.status as AccountStatus) ?? null;
  })().finally(() => {
    inflight = null;
    inflightUserId = null;
  });

  return inflight;
}
