import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Redemption = Database['public']['Tables']['redemptions']['Row'];

type SupabaseServiceError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function purchaseRewardError(error: SupabaseServiceError): Error {
  const text = [error.message, error.details, error.hint].filter(Boolean).join(' ');
  const lower = text.toLowerCase();

  if (
    error.code === 'PGRST202' ||
    lower.includes('could not find the function') ||
    lower.includes('purchase_reward')
  ) {
    return new Error('Reward purchase is not connected yet. Run supabase/migrations/20260617000001_security_hardening.sql in Supabase, then refresh the app.');
  }

  if (lower.includes('insufficient points')) return new Error('Yeterli puanın yok.');
  if (lower.includes('reward out of stock')) return new Error('Bu ödülün stoğu kalmadı.');
  if (lower.includes('reward expired')) return new Error('Bu ödülün süresi dolmuş.');
  if (lower.includes('not authenticated')) return new Error('Satın almak için tekrar giriş yap.');
  if (lower.includes('account is not active')) return new Error('Hesabın aktif değil.');

  return new Error(text || 'Ödül satın alınamadı.');
}

export async function getUserRedemptions(userId: string, page = 0, pageSize = 20): Promise<Redemption[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, rewards(title, description, image, category, points)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return data ?? [];
}

export async function getActiveRedemptions(userId: string): Promise<Redemption[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, rewards(title, image, category, description, points)')
    .eq('user_id', userId)
    .eq('used', false)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getInventoryRedemptions(userId: string): Promise<Redemption[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, rewards(title, image, category, description, points)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function purchaseReward(rewardId: string): Promise<Redemption> {
  const { data, error } = await supabase.rpc('purchase_reward', {
    p_reward_id: rewardId,
  });
  if (error) throw purchaseRewardError(error);
  if (!data || typeof data !== 'object') throw new Error('Ödül satın alındı ama bilet bilgisi alınamadı. Lütfen envanteri yenile.');
  return data as unknown as Redemption;
}

export async function redeemReward(
  _userId: string,
  rewardId: string,
  _pointsCost: number,
  _expiresAt?: string
): Promise<Redemption> {
  return purchaseReward(rewardId);
}

export async function markRedemptionUsed(id: string, userId?: string): Promise<void> {
  const usedAt = new Date().toISOString();
  let q = supabase
    .from('redemptions')
    .update({ used: true, used_at: usedAt, expires_at: usedAt })
    .eq('id', id);
  if (userId) q = q.eq('user_id', userId);
  const { error } = await q;
  if (error) throw error;
}

/**
 * Look up any redemption by code.
 * Uses a security-definer RPC so cashiers/admins can read across all user redemptions.
 * Falls back to direct query (for the owner themselves).
 */
export async function getRedemptionByCode(code: string): Promise<Redemption | null> {
  // Try the security-definer RPC first (works for cashier/admin roles)
  const { data: rpcData, error: rpcError } = await supabase
    .rpc('lookup_redemption_by_code', { p_code: code.toUpperCase() });
  if (!rpcError && rpcData) return rpcData as unknown as Redemption;

  // Fallback: direct query (works if the caller is the redemption owner)
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, profiles(username, email), rewards(title, image)')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}

/**
 * Mark a redemption as used — uses a security-definer RPC so cashiers can update
 * redemptions that belong to other users.
 */
export async function markRedemptionUsedByCode(code: string): Promise<void> {
  const { error } = await supabase
    .rpc('mark_redemption_used_by_code', { p_code: code.toUpperCase() });
  if (error) throw error;
}
