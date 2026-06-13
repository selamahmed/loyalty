import { supabase } from '../lib/supabase';

/** Event-specific leaderboard entry — points are NOT global profile points. */
export type EventLeaderboardEntry = {
  id: string;
  username: string;
  avatar_url: string | null;
  level: number;
  points: number;
  rank: number;
  updated_at?: string;
};

export type EventParticipation = {
  joined: boolean;
  points?: number;
  rank?: number | null;
};

export type EventWinner = {
  id: string;
  event_id: string;
  user_id: string;
  final_rank: number;
  final_points: number;
  prize_title: string;
  prize_description: string | null;
  prize_value: string | null;
  distributed: boolean;
  distributed_at: string | null;
  created_at: string;
  profiles?: { username: string; avatar_url: string | null };
};

/**
 * Ranking tie-break (matches DB):
 * 1. Higher event points rank higher
 * 2. Equal points → earlier updated_at wins (reached score first)
 * 3. Equal updated_at → earlier created_at (join time)
 */
export async function getEventLeaderboard(
  eventId: string,
  limit = 50,
): Promise<EventLeaderboardEntry[]> {
  const { data, error } = await supabase.rpc('get_event_leaderboard', {
    p_event_id: eventId,
    p_limit: limit,
  });
  if (error) throw error;
  return (data ?? []) as EventLeaderboardEntry[];
}

export async function getMyEventParticipation(eventId: string): Promise<EventParticipation> {
  const { data, error } = await supabase.rpc('get_my_event_participation', {
    p_event_id: eventId,
  });
  if (error) throw error;
  return (data ?? { joined: false }) as EventParticipation;
}

export async function joinEvent(eventId: string): Promise<EventParticipation> {
  const { data, error } = await supabase.rpc('join_event', { p_event_id: eventId });
  if (error) throw error;
  return {
    joined: true,
    points: (data as { points?: number })?.points ?? 0,
    rank: (data as { rank?: number | null })?.rank ?? null,
  };
}

export async function getEventWinners(eventId: string): Promise<EventWinner[]> {
  const { data, error } = await supabase
    .from('event_winners')
    .select(`
      id, event_id, user_id, final_rank, final_points,
      prize_title, prize_description, prize_value,
      distributed, distributed_at, created_at,
      profiles ( username, avatar_url )
    `)
    .eq('event_id', eventId)
    .order('final_rank', { ascending: true });
  if (error) throw error;
  return (data ?? []) as unknown as EventWinner[];
}

export async function markWinnerDistributed(winnerId: string): Promise<void> {
  const { error } = await supabase.rpc('mark_winner_distributed', {
    p_winner_id: winnerId,
  });
  if (error) throw error;
}

export async function finalizeEvent(eventId: string): Promise<void> {
  const { error } = await supabase.rpc('finalize_event', { p_event_id: eventId });
  if (error) throw error;
}

export async function syncEventStatuses(): Promise<void> {
  const { error } = await supabase.rpc('sync_event_status', { p_event_id: null });
  if (error) throw error;
}

/** Published prize-pool events visible to users. */
export async function getPublishedPrizeEvents() {
  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, start_date, end_date, active, color, emoji, win_count, rewards_json, status, published')
    .eq('published', true)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []).filter(e => {
    const rewards = e.rewards_json;
    return Array.isArray(rewards) ? rewards.length > 0 : false;
  });
}

export async function getActivePrizeEvents() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('id, title, description, start_date, end_date, active, color, emoji, win_count, rewards_json, status, published')
    .eq('status', 'active')
    .lte('start_date', now)
    .gte('end_date', now)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
