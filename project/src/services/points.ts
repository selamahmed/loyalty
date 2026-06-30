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
  const { error } = await supabase.rpc('admin_adjust_points', {
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
  void userId;
  void amount;
  void description;
  void referenceId;
  throw new Error('Use purchaseReward for customer reward purchases; direct point spending is disabled.');
}

export type LeaderboardEntry = {
  rank: number;
  username: string;
  total_points: number;
  level: number;
  avatar_url: string | null;
  id: string;
};

export const LEADERBOARD_TOP_LIMIT = 20;
const LEADERBOARD_CACHE_MS = 10_000;
const MY_RANK_CACHE_MS = 10_000;

type CachedValue<T> = { expiresAt: number; value: T };

const leaderboardCache = new Map<string, CachedValue<LeaderboardEntry[]>>();
const leaderboardInFlight = new Map<string, Promise<LeaderboardEntry[]>>();
const myRankCache = new Map<string, CachedValue<LeaderboardEntry | null>>();
const myRankInFlight = new Map<string, Promise<LeaderboardEntry | null>>();

function readCache<T>(cache: Map<string, CachedValue<T>>, key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function writeCache<T>(cache: Map<string, CachedValue<T>>, key: string, value: T, ttlMs: number): T {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

type AlltimeRow = {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  total_points: number;
  rank: number;
};

function mapLeaderboardRow(u: AlltimeRow): LeaderboardEntry {
  return {
    id: u.id,
    username: u.username ?? 'Oyuncu',
    total_points: u.total_points ?? 0,
    level: u.level ?? 1,
    avatar_url: u.avatar_url,
    rank: u.rank,
  };
}

async function getLeaderboardFallback(limit: number): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, total_points, level, avatar_url')
    .eq('status', 'active')
    .gt('total_points', 0)
    .order('total_points', { ascending: false })
    .order('username', { ascending: true })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((u, i) => ({
    rank: i + 1,
    id: u.id,
    username: u.username ?? 'Oyuncu',
    total_points: u.total_points ?? 0,
    level: u.level ?? 1,
    avatar_url: u.avatar_url,
  }));
}

export async function getLeaderboard(limit = LEADERBOARD_TOP_LIMIT): Promise<LeaderboardEntry[]> {
  const safeLimit = Math.min(Math.max(Math.floor(limit) || LEADERBOARD_TOP_LIMIT, 1), 50);
  const key = `alltime:${safeLimit}`;
  const cached = readCache(leaderboardCache, key);
  if (cached) return cached;

  const existing = leaderboardInFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    const { data, error } = await supabase.rpc('get_alltime_leaderboard', { p_limit: safeLimit });

    if (error) {
      if (error.code === 'PGRST202') {
        console.warn('[getLeaderboard] RPC missing — run apply_alltime_leaderboard.sql');
        return writeCache(leaderboardCache, key, await getLeaderboardFallback(safeLimit), LEADERBOARD_CACHE_MS);
      }
      throw error;
    }

    const rows = (Array.isArray(data) ? data : []) as AlltimeRow[];
    return writeCache(leaderboardCache, key, rows.map(mapLeaderboardRow).filter(u => u.total_points > 0), LEADERBOARD_CACHE_MS);
  })().finally(() => {
    leaderboardInFlight.delete(key);
  });

  leaderboardInFlight.set(key, request);
  return request;
}

export async function getMyAlltimeRank(): Promise<LeaderboardEntry | null> {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return null;

  const key = `my-rank:${userId}`;
  const cached = readCache(myRankCache, key);
  if (cached !== undefined) return cached;

  const existing = myRankInFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    const { data, error } = await supabase.rpc('get_my_alltime_rank');
    if (error) {
      if (error.code === 'PGRST202') return writeCache(myRankCache, key, null, MY_RANK_CACHE_MS);
      throw error;
    }
    if (!data || typeof data !== 'object') return writeCache(myRankCache, key, null, MY_RANK_CACHE_MS);
    return writeCache(myRankCache, key, mapLeaderboardRow(data as AlltimeRow), MY_RANK_CACHE_MS);
  })().finally(() => {
    myRankInFlight.delete(key);
  });

  myRankInFlight.set(key, request);
  return request;
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
