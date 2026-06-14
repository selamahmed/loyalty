import { supabase } from '../lib/supabase';
import { getUserStats as fetchUserStatsRpc } from './points';

export type UserStatsSummary = {
  totalEarned: number;
  gamesPlayed: number;
  qrScans: number;
  missionsCompleted: number;
  pointsTrendPct: number | null;
};

export type UserStatsCharts = {
  pointsOverTime: { month: string; points: number }[];
  activityBreakdown: { name: string; value: number; color: string }[];
  rewardUsage: { month: string; redeemed: number }[];
};

export type UserStatsData = UserStatsSummary & UserStatsCharts;

const CATEGORY_META: Record<string, { label: string; color: string }> = {
  qr_scan: { label: 'QR Tarama', color: '#3b82f6' },
  game_win: { label: 'Mini Oyun', color: '#22c55e' },
  mission_complete: { label: 'Görev', color: '#7B6EF6' },
  daily_login: { label: 'Günlük Giriş', color: '#f59e0b' },
  achievement: { label: 'Başarı', color: '#ec4899' },
  referral: { label: 'Referans', color: '#06b6d4' },
  other: { label: 'Diğer', color: '#94a3b8' },
};

const MONTH_TR: Record<string, string> = {
  Jan: 'Oca', Feb: 'Şub', Mar: 'Mar', Apr: 'Nis', May: 'May', Jun: 'Haz',
  Jul: 'Tem', Aug: 'Ağu', Sep: 'Eyl', Oct: 'Eki', Nov: 'Kas', Dec: 'Ara',
};

function localizeMonth(label: string): string {
  return MONTH_TR[label] ?? label;
}

function trendPct(current: number, previous: number): number | null {
  if (previous <= 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function breakdownToPercent(items: { name: string; value: number }[]): UserStatsCharts['activityBreakdown'] {
  const total = items.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return [];
  return items.map(item => {
    const key = item.name?.toLowerCase() ?? 'other';
    const meta = CATEGORY_META[key] ?? CATEGORY_META.other;
    return {
      name: meta.label,
      value: Math.max(1, Math.round((item.value / total) * 100)),
      color: meta.color,
    };
  });
}

function normalizeRpcCharts(raw: {
  pointsOverTime?: { month: string; points: number }[];
  activityBreakdown?: { name: string; value: number }[];
  rewardUsage?: { month: string; redeemed: number }[];
} | null): Pick<UserStatsCharts, 'pointsOverTime' | 'activityBreakdown' | 'rewardUsage'> {
  const pointsOverTime = (raw?.pointsOverTime ?? []).map(row => ({
    month: localizeMonth(row.month),
    points: Number(row.points) || 0,
  }));

  const rewardUsage = (raw?.rewardUsage ?? []).map(row => ({
    month: localizeMonth(row.month),
    redeemed: Number(row.redeemed) || 0,
  }));

  const activityBreakdown = breakdownToPercent(
    (raw?.activityBreakdown ?? []).map(row => ({
      name: row.name ?? 'other',
      value: Number(row.value) || 0,
    })),
  );

  return { pointsOverTime, activityBreakdown, rewardUsage };
}

async function fetchChartsFallback(userId: string): Promise<Pick<UserStatsCharts, 'pointsOverTime' | 'activityBreakdown' | 'rewardUsage'>> {
  const since = new Date();
  since.setMonth(since.getMonth() - 6);

  const [txRes, redRes] = await Promise.all([
    supabase
      .from('points_transactions')
      .select('amount, category, created_at, type')
      .eq('user_id', userId)
      .eq('type', 'earned')
      .gte('created_at', since.toISOString()),
    supabase
      .from('redemptions')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString()),
  ]);

  const txs = txRes.data ?? [];
  const reds = redRes.data ?? [];

  const monthKeys = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const pointsByMonth = new Map<string, number>();
  const redeemsByMonth = new Map<string, number>();
  const categoryCounts = new Map<string, number>();

  for (const tx of txs) {
    const d = new Date(tx.created_at);
    const key = monthKeys[d.getUTCMonth()];
    pointsByMonth.set(key, (pointsByMonth.get(key) ?? 0) + (tx.amount ?? 0));
    const cat = (tx.category ?? 'other').toLowerCase();
    categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
  }

  for (const r of reds) {
    const d = new Date(r.created_at);
    const key = monthKeys[d.getUTCMonth()];
    redeemsByMonth.set(key, (redeemsByMonth.get(key) ?? 0) + 1);
  }

  const orderedMonths = Array.from(pointsByMonth.entries())
    .map(([month, points]) => ({ month: localizeMonth(month), points, sort: monthKeys.indexOf(month) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ month, points }) => ({ month, points }));

  const orderedRedeems = Array.from(redeemsByMonth.entries())
    .map(([month, redeemed]) => ({ month: localizeMonth(month), redeemed, sort: monthKeys.indexOf(month) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ month, redeemed }) => ({ month, redeemed }));

  return {
    pointsOverTime: orderedMonths,
    activityBreakdown: breakdownToPercent(
      Array.from(categoryCounts.entries()).map(([name, value]) => ({ name, value })),
    ),
    rewardUsage: orderedRedeems,
  };
}

async function fetchSummary(userId: string): Promise<UserStatsSummary> {
  const now = new Date();
  const thisMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const lastMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));

  const [
    profileRes,
    gamesRes,
    qrRes,
    missionsRes,
    ptsThisMonth,
    ptsLastMonth,
  ] = await Promise.all([
    supabase.from('profiles').select('total_points').eq('id', userId).maybeSingle(),
    supabase.from('points_transactions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('type', 'earned').eq('category', 'game_win'),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('user_missions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', true),
    supabase.from('points_transactions').select('amount').eq('user_id', userId).eq('type', 'earned').gte('created_at', thisMonthStart.toISOString()),
    supabase.from('points_transactions').select('amount').eq('user_id', userId).eq('type', 'earned').gte('created_at', lastMonthStart.toISOString()).lt('created_at', thisMonthStart.toISOString()),
  ]);

  const totalEarned = profileRes.data?.total_points ?? 0;
  const earnedThisMonth = (ptsThisMonth.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);
  const earnedLastMonth = (ptsLastMonth.data ?? []).reduce((s, r) => s + (r.amount ?? 0), 0);

  return {
    totalEarned,
    gamesPlayed: gamesRes.count ?? 0,
    qrScans: qrRes.count ?? 0,
    missionsCompleted: missionsRes.count ?? 0,
    pointsTrendPct: trendPct(earnedThisMonth, earnedLastMonth),
  };
}

/** Load full user statistics from Supabase (RPC + direct counts). */
export async function loadUserStats(userId: string): Promise<UserStatsData> {
  const [summary, rpcCharts] = await Promise.all([
    fetchSummary(userId),
    fetchUserStatsRpc(userId),
  ]);

  const charts = rpcCharts
    ? normalizeRpcCharts(rpcCharts)
    : await fetchChartsFallback(userId);

  return { ...summary, ...charts };
}

export const STAT_CARD_CONFIG = [
  { key: 'totalEarned' as const, label: 'Toplam Kazanılan', emoji: '⭐', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b', format: (v: number) => v.toLocaleString('tr-TR') },
  { key: 'gamesPlayed' as const, label: 'Oynanan Oyun', emoji: '🎮', color: '#22c55e', bg: 'rgba(34,197,94,0.12)', accent: '#22c55e', format: (v: number) => v.toLocaleString('tr-TR') },
  { key: 'qrScans' as const, label: 'QR Tarama', emoji: '📱', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', accent: '#3b82f6', format: (v: number) => v.toLocaleString('tr-TR') },
  { key: 'missionsCompleted' as const, label: 'Görev Tamamlandı', emoji: '🎯', color: '#7B6EF6', bg: 'rgba(123,110,246,0.12)', accent: '#7B6EF6', format: (v: number) => v.toLocaleString('tr-TR') },
];
