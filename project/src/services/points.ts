import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type PointsTransaction = Database['public']['Tables']['points_transactions']['Row'];

export async function getPointsHistory(userId: string, page = 0, pageSize = 20): Promise<PointsTransaction[]> {
  const { data, error } = await supabase
    .from('points_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return data ?? [];
}

export async function addPoints(
  userId: string,
  amount: number,
  description: string,
  category: string,
  referenceId?: string
): Promise<void> {
  const { error } = await supabase.rpc('add_points', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_category: category,
    p_reference_id: referenceId ?? null,
  });
  if (error) throw error;
}

export async function spendPoints(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<void> {
  const { error } = await supabase.rpc('spend_points', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_reference_id: referenceId ?? null,
  });
  if (error) throw error;
}

export type LeaderboardEntry = { rank: number; username: string; total_points: number; level: number; avatar_url: string | null; id: string };

export async function getLeaderboard(limit = 50, period: 'alltime' | 'weekly' | 'monthly' = 'alltime'): Promise<LeaderboardEntry[]> {
  // All-time: directly from profiles.total_points (always up to date via add_points RPC)
  if (period === 'alltime') {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, total_points, level, avatar_url')
      .eq('status', 'active')
      .order('total_points', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map((u, i) => ({ rank: i + 1, ...u }));
  }

  // Weekly / Monthly — try the pre-built view first (requires patch_new_tables.sql)
  const view = period === 'weekly' ? 'leaderboard_weekly' : 'leaderboard_monthly';
  const { data, error } = await supabase
    .from(view)
    .select('id, username, avatar_url, level, period_points, rank')
    .order('period_points', { ascending: false })
    .limit(limit);

  if (!error && data && data.length > 0) {
    return data.map((u, i) => ({
      id: u.id,
      username: u.username,
      avatar_url: u.avatar_url,
      level: u.level,
      total_points: u.period_points,
      rank: i + 1,
    }));
  }

  // View not created yet — compute inline from points_transactions
  const days = period === 'weekly' ? 7 : 30;
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data: txData, error: txError } = await supabase
    .from('points_transactions')
    .select('user_id, amount')
    .gte('created_at', since)
    .gt('amount', 0);

  if (txError || !txData) {
    // Last resort: fall back to all-time
    const { data: fb } = await supabase
      .from('profiles')
      .select('id, username, total_points, level, avatar_url')
      .eq('status', 'active')
      .order('total_points', { ascending: false })
      .limit(limit);
    return (fb ?? []).map((u, i) => ({ rank: i + 1, ...u }));
  }

  // Aggregate per user
  const totals: Record<string, number> = {};
  txData.forEach(r => { totals[r.user_id] = (totals[r.user_id] ?? 0) + (r.amount ?? 0); });
  const topIds = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topIds.length === 0) {
    const { data: fb } = await supabase
      .from('profiles')
      .select('id, username, total_points, level, avatar_url')
      .eq('status', 'active')
      .order('total_points', { ascending: false })
      .limit(limit);
    return (fb ?? []).map((u, i) => ({ rank: i + 1, ...u }));
  }

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, total_points, level, avatar_url')
    .in('id', topIds);

  return (profiles ?? [])
    .map(u => ({ ...u, period_total: totals[u.id] ?? 0 }))
    .sort((a, b) => b.period_total - a.period_total)
    .map((u, i) => ({ rank: i + 1, id: u.id, username: u.username, avatar_url: u.avatar_url, level: u.level, total_points: u.period_total }));
}

export async function getUserStats(userId: string): Promise<{
  pointsOverTime: { month: string; points: number }[];
  activityBreakdown: { name: string; value: number }[];
  rewardUsage: { month: string; redeemed: number }[];
} | null> {
  const { data, error } = await supabase.rpc('get_user_stats', { p_user_id: userId });
  if (error) {
    console.warn('[getUserStats] RPC error (run patch_new_tables.sql in Supabase):', error.message);
    return null;
  }
  return data;
}
