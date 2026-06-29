import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { hasMissionPageVisit } from '../lib/missionVisitTracker';
import { isMissionCompletedInPeriod } from '../lib/missionPeriod';
import { performAction, type EarnResult } from './earn';

export type Mission = Database['public']['Tables']['missions']['Row'];
export type UserMission = Database['public']['Tables']['user_missions']['Row'];
export type MissionCategory = Mission['category'];

export type MissionPayload = {
  title: string;
  description: string;
  icon: string;
  points: number;
  category: MissionCategory;
  active: boolean;
  slug: string | null;
  sort_order: number;
};

export interface MissionWithStatus extends Mission {
  completed: boolean;
  completed_at: string | null;
  user_mission_id: string | null;
  readyToClaim: boolean;
  actionPath: string | null;
}

export type MissionBehavior = {
  slug: string;
  label: string;
  emoji: string;
  categories: MissionCategory[];
};

/** Admin: selectable auto-tracking behaviors. */
export const MISSION_BEHAVIORS: MissionBehavior[] = [
  { slug: 'daily_visit', label: 'Günlük uygulama ziyareti', emoji: '📅', categories: ['daily'] },
  { slug: 'qr_scan', label: 'QR kod tarama', emoji: '📱', categories: ['daily'] },
  { slug: 'shop_visit', label: 'Mağaza ziyareti', emoji: '🛍️', categories: ['daily'] },
  { slug: 'achievements_visit', label: 'Başarımlar sayfası', emoji: '🏆', categories: ['daily'] },
  { slug: 'refer_friend', label: 'Arkadaş daveti', emoji: '👥', categories: ['weekly'] },
  { slug: 'leaderboard_top10', label: 'Liderlik tablosu top 10', emoji: '📊', categories: ['weekly'] },
];

/** Legacy title fallback before slug column backfill. */
const MISSION_SLUG_BY_TITLE: Record<string, string> = {
  'Günlük Ziyaret': 'daily_visit',
  'QR Kod Tara': 'qr_scan',
  'Ödüllere Göz At': 'shop_visit',
  'Başarımları Gör': 'achievements_visit',
  'Arkadaşını Davet Et': 'refer_friend',
  'Liderlik Tablosuna Gir': 'leaderboard_top10',
};

const MISSION_ACTION_PATH: Record<string, string> = {
  daily_visit: '/missions',
  qr_scan: '/qr',
  shop_visit: '/shop',
  achievements_visit: '/achievements',
  refer_friend: '/profile',
  leaderboard_top10: '/leaderboard',
};

export function resolveMissionSlug(mission: Pick<Mission, 'slug' | 'title'>): string | null {
  if (mission.slug) return mission.slug;
  return MISSION_SLUG_BY_TITLE[mission.title] ?? null;
}

export type MissionAutoProgress = {
  dailyVisit: boolean;
  qrScanToday: boolean;
  shopVisitToday: boolean;
  achievementsVisitToday: boolean;
  referFriend: boolean;
  leaderboardTop10: boolean;
};

async function fetchMissionAutoProgress(userId: string): Promise<MissionAutoProgress> {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const dayStartIso = dayStart.toISOString();

  const weekStart = new Date(dayStart);
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() + (dow === 0 ? -6 : 1 - dow));

  const [qrRes, referralRes] = await Promise.all([
    supabase
      .from('qr_scans')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', dayStartIso),
    supabase
      .from('point_transactions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'referral')
      .gte('created_at', weekStart.toISOString()),
  ]);

  let leaderboardTop10 = false;
  const { data: topRows } = await supabase
    .from('profiles')
    .select('id')
    .order('points', { ascending: false })
    .limit(10);
  if (topRows?.some(row => row.id === userId)) {
    leaderboardTop10 = true;
  }

  return {
    dailyVisit: hasMissionPageVisit('daily_visit', userId),
    qrScanToday: (qrRes.count ?? 0) > 0,
    shopVisitToday: hasMissionPageVisit('shop_visit', userId),
    achievementsVisitToday: hasMissionPageVisit('achievements_visit', userId),
    referFriend: (referralRes.count ?? 0) > 0,
    leaderboardTop10,
  };
}

function isMissionReady(slug: string | null, progress: MissionAutoProgress, category: MissionCategory): boolean {
  if (!slug) return false;
  switch (slug) {
    case 'daily_visit':
      return progress.dailyVisit;
    case 'qr_scan':
      return progress.qrScanToday;
    case 'shop_visit':
      return progress.shopVisitToday;
    case 'achievements_visit':
      return progress.achievementsVisitToday;
    case 'refer_friend':
      return category === 'weekly' && progress.referFriend;
    case 'leaderboard_top10':
      return category === 'weekly' && progress.leaderboardTop10;
    default:
      return false;
  }
}

function mapMissionWithStatus(
  m: Mission & { user_missions?: Array<{ id: string; completed: boolean; completed_at: string | null; user_id: string }> },
  userId: string,
  progress: MissionAutoProgress,
): MissionWithStatus {
  const userMission = Array.isArray(m.user_missions)
    ? m.user_missions.find(um => um.user_id === userId)
    : null;

  const completed = isMissionCompletedInPeriod(userMission?.completed_at, m.category)
    && Boolean(userMission?.completed);

  const slug = resolveMissionSlug(m);
  const readyToClaim = !completed && isMissionReady(slug, progress, m.category);

  return {
    ...m,
    completed,
    completed_at: completed ? userMission?.completed_at ?? null : null,
    user_mission_id: userMission?.id ?? null,
    readyToClaim,
    actionPath: slug ? MISSION_ACTION_PATH[slug] ?? null : null,
  };
}

export async function getMissionsWithStatus(userId: string): Promise<MissionWithStatus[]> {
  const [{ data, error }, progress] = await Promise.all([
    supabase
      .from('missions')
      .select(`
        *,
        user_missions!left(id, completed, completed_at, reset_at, user_id)
      `)
      .eq('active', true)
      .order('category')
      .order('sort_order')
      .order('created_at'),
    fetchMissionAutoProgress(userId),
  ]);

  if (error) throw error;

  return (data ?? []).map(m => mapMissionWithStatus(m, userId, progress));
}

export async function claimMissionReward(missionId: string): Promise<EarnResult> {
  return performAction('mission_complete', { referenceId: missionId });
}

/* ── Admin CRUD ── */

export async function getMissionsAdmin(): Promise<Mission[]> {
  const { data, error } = await supabase
    .from('missions')
    .select('*')
    .order('category')
    .order('sort_order')
    .order('created_at');
  if (error) throw error;
  return data ?? [];
}

export async function createMission(payload: MissionPayload): Promise<Mission> {
  const { data, error } = await supabase
    .from('missions')
    .insert({
      title: payload.title.trim(),
      description: payload.description.trim(),
      icon: payload.icon.trim() || '🎯',
      points: Math.max(0, payload.points),
      category: payload.category,
      active: payload.active,
      slug: payload.slug?.trim() || null,
      sort_order: payload.sort_order,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function updateMission(id: string, payload: Partial<MissionPayload>): Promise<Mission> {
  const patch: Record<string, unknown> = {};
  if (payload.title != null) patch.title = payload.title.trim();
  if (payload.description != null) patch.description = payload.description.trim();
  if (payload.icon != null) patch.icon = payload.icon.trim() || '🎯';
  if (payload.points != null) patch.points = Math.max(0, payload.points);
  if (payload.category != null) patch.category = payload.category;
  if (payload.active != null) patch.active = payload.active;
  if (payload.slug !== undefined) patch.slug = payload.slug?.trim() || null;
  if (payload.sort_order != null) patch.sort_order = payload.sort_order;

  const { data, error } = await supabase
    .from('missions')
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return data;
}

export async function deleteMission(id: string): Promise<void> {
  const { error } = await supabase.from('missions').delete().eq('id', id);
  if (error) throw error;
}

export type MissionAdminStats = {
  totalCompletionsToday: number;
  totalCompletionsWeek: number;
};

export async function getMissionAdminStats(): Promise<MissionAdminStats> {
  const dayStart = new Date();
  dayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(dayStart);
  const dow = weekStart.getDay();
  weekStart.setDate(weekStart.getDate() + (dow === 0 ? -6 : 1 - dow));

  const [todayRes, weekRes] = await Promise.all([
    supabase
      .from('user_missions')
      .select('id', { count: 'exact', head: true })
      .eq('completed', true)
      .gte('completed_at', dayStart.toISOString()),
    supabase
      .from('user_missions')
      .select('id', { count: 'exact', head: true })
      .eq('completed', true)
      .gte('completed_at', weekStart.toISOString()),
  ]);

  return {
    totalCompletionsToday: todayRes.count ?? 0,
    totalCompletionsWeek: weekRes.count ?? 0,
  };
}

/** @deprecated Use claimMissionReward */
export async function completeMission(userId: string, missionId: string): Promise<void> {
  await claimMissionReward(missionId);
  void userId;
}
