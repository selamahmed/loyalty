import { supabase } from '../lib/supabase';
import type { AppEvent } from './events';

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
  /** Points needed to pass the user one rank above (0 if #1). */
  gap_to_next_rank?: number | null;
};

/** Client fallback when RPC omits gap_to_next_rank. */
export function gapToNextRank(
  board: EventLeaderboardEntry[],
  myPoints: number,
  myRank: number | null | undefined,
): number | null {
  if (myRank == null) return null;
  if (myRank <= 1) return 0;
  const above = board.find(p => p.rank === myRank - 1);
  if (!above) return null;
  return Math.max(1, above.points - myPoints + 1);
}

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

const EVENT_LIST_COLUMNS =
  'id, title, description, start_date, end_date, active, color, emoji, win_count, rewards_json, published, multiplier';

const RECENT_EVENT_MS = 14 * 24 * 60 * 60 * 1000;

/** True when the event has a configured prize pool (leaderboard reward event). */
export function hasPrizePool(ev: { rewards_json?: unknown }): boolean {
  const rewards = ev.rewards_json;
  return Array.isArray(rewards) && rewards.length > 0;
}

function isMissingPublishedColumn(error: { message?: string; code?: string }): boolean {
  return Boolean(
    error.message?.includes('published')
    || error.message?.includes('schema cache')
    || error.code === '42703',
  );
}

async function queryActiveEvents(withPublished: boolean, recentCutoff?: string) {
  let q = supabase
    .from('events')
    .select(EVENT_LIST_COLUMNS)
    .eq('active', true)
    .order('start_date', { ascending: false });
  if (recentCutoff) q = q.gte('end_date', recentCutoff);
  if (withPublished) q = q.eq('published', true);
  return q;
}

/**
 * Prize events shown on the user leaderboard.
 * Includes live, upcoming, and recently ended events with a prize pool.
 */
export async function getLeaderboardPrizeEvents(): Promise<AppEvent[]> {
  const recentCutoff = new Date(Date.now() - RECENT_EVENT_MS).toISOString();

  let { data, error } = await queryActiveEvents(true, recentCutoff);
  if (error && isMissingPublishedColumn(error)) {
    ({ data, error } = await queryActiveEvents(false, recentCutoff));
  }
  if (error) throw error;

  return (data ?? [])
    .filter(hasPrizePool)
    .map(row => row as unknown as AppEvent);
}

/** Published prize-pool events visible to users (events page). */
export async function getPublishedPrizeEvents(): Promise<AppEvent[]> {
  let { data, error } = await queryActiveEvents(true);
  if (error && isMissingPublishedColumn(error)) {
    ({ data, error } = await queryActiveEvents(false));
  }
  if (error) throw error;

  return (data ?? [])
    .filter(e => e.published !== false)
    .filter(hasPrizePool)
    .map(row => row as unknown as AppEvent);
}

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
