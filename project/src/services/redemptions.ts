import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Redemption = Database['public']['Tables']['redemptions']['Row'];

export async function getUserRedemptions(userId: string, page = 0, pageSize = 20): Promise<Redemption[]> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, rewards(title, image, category)')
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

function generateCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function generateBarcode(): string {
  return Array.from({ length: 13 }, () => Math.floor(Math.random() * 10)).join('');
}

export async function redeemReward(
  userId: string,
  rewardId: string,
  pointsCost: number,
  expiresAt?: string
): Promise<Redemption> {
  const { data, error } = await supabase
    .from('redemptions')
    .insert({
      user_id: userId,
      reward_id: rewardId,
      points_spent: pointsCost,
      code: generateCode(),
      barcode: generateBarcode(),
      used: false,
      expires_at: expiresAt ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markRedemptionUsed(id: string, userId?: string): Promise<void> {
  let q = supabase
    .from('redemptions')
    .update({ used: true, used_at: new Date().toISOString() })
    .eq('id', id);
  if (userId) q = q.eq('user_id', userId);
  const { error } = await q;
  if (error) throw error;
}

export async function getRedemptionByCode(code: string): Promise<Redemption | null> {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, profiles(username, email), rewards(title, image)')
    .eq('code', code.toUpperCase())
    .maybeSingle();
  if (error) throw error;
  return data;
}
