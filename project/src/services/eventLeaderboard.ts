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

export type LeaderboardDbStatus = {
  ready: boolean;
  missing: string[];
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
  'id, title, description, start_date, end_date, active, color, emoji, win_count, rewards_json, published, multiplier, status';

const RECENT_EVENT_MS = 14 * 24 * 60 * 60 * 1000;

const RPC_MISSING = 'PGRST202';
const TABLE_MISSING = '42P01';
const EVENT_LEADERBOARD_CACHE_MS = 10_000;
const EVENT_PARTICIPATION_CACHE_MS = 10_000;
const EVENT_LIST_CACHE_MS = 30_000;

type CachedValue<T> = { expiresAt: number; value: T };

const leaderboardCache = new Map<string, CachedValue<EventLeaderboardEntry[]>>();
const leaderboardInFlight = new Map<string, Promise<EventLeaderboardEntry[]>>();
const participationCache = new Map<string, CachedValue<EventParticipation>>();
const participationInFlight = new Map<string, Promise<EventParticipation>>();
const eventListCache = new Map<string, CachedValue<AppEvent[]>>();
const eventListInFlight = new Map<string, Promise<AppEvent[]>>();

function cacheKey(parts: Array<string | number | null | undefined>): string {
  return parts.map(part => String(part ?? '')).join(':');
}

function readCache<T>(cache: Map<string, CachedValue<T>>, key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.value;
}

function writeCache<T>(cache: Map<string, CachedValue<T>>, key: string, value: T, ttlMs: number): T {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

function isMissingRpc(error: { code?: string; message?: string }): boolean {
  return error.code === RPC_MISSING
    || Boolean(error.message?.includes('Could not find the function'));
}

function isMissingTable(error: { code?: string; message?: string }): boolean {
  return error.code === TABLE_MISSING
    || Boolean(error.message?.includes('event_participants'));
}

function parseEventBoard(data: unknown): EventLeaderboardEntry[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as EventLeaderboardEntry[];
  if (typeof data === 'string') {
    try {
      const parsed = JSON.parse(data) as unknown;
      return Array.isArray(parsed) ? parsed as EventLeaderboardEntry[] : [];
    } catch {
      return [];
    }
  }
  return [];
}

function parseParticipation(data: unknown): EventParticipation {
  if (!data || typeof data !== 'object') return { joined: false };
  const row = data as Record<string, unknown>;
  return {
    joined: Boolean(row.joined),
    points: row.points != null ? Number(row.points) : undefined,
    rank: row.rank != null ? Number(row.rank) : null,
    gap_to_next_rank: row.gap_to_next_rank != null ? Number(row.gap_to_next_rank) : null,
  };
}

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

/** Verify event leaderboard tables/RPCs exist on Supabase. */
export async function checkLeaderboardDb(): Promise<LeaderboardDbStatus> {
  const missing: string[] = [];

  const table = await supabase.from('event_participants').select('id', { head: true, count: 'exact' });
  if (isMissingTable(table.error ?? {})) missing.push('event_participants');

  return { ready: missing.length === 0, missing };
}

/**
 * Prize events shown on the user leaderboard.
 * Includes live, upcoming, and recently ended events with a prize pool.
 */
export async function getLeaderboardPrizeEvents(): Promise<AppEvent[]> {
  const key = 'leaderboard-prize-events';
  const cached = readCache(eventListCache, key);
  if (cached) return cached;

  const existing = eventListInFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    const recentCutoff = new Date(Date.now() - RECENT_EVENT_MS).toISOString();
    let { data, error } = await queryActiveEvents(true, recentCutoff);
    if (error && isMissingPublishedColumn(error)) {
      ({ data, error } = await queryActiveEvents(false, recentCutoff));
    }
    if (error) throw error;

    return writeCache(
      eventListCache,
      key,
      (data ?? [])
        .filter(hasPrizePool)
        .map(row => row as unknown as AppEvent),
      EVENT_LIST_CACHE_MS,
    );
  })().finally(() => {
    eventListInFlight.delete(key);
  });

  eventListInFlight.set(key, request);
  return request;
}

/** Published prize-pool events visible to users (events page). */
export async function getPublishedPrizeEvents(): Promise<AppEvent[]> {
  const key = 'published-prize-events';
  const cached = readCache(eventListCache, key);
  if (cached) return cached;

  const existing = eventListInFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    let { data, error } = await queryActiveEvents(true);
    if (error && isMissingPublishedColumn(error)) {
      ({ data, error } = await queryActiveEvents(false));
    }
    if (error) throw error;

    return writeCache(
      eventListCache,
      key,
      (data ?? [])
        .filter(e => e.published !== false)
        .filter(hasPrizePool)
        .map(row => row as unknown as AppEvent),
      EVENT_LIST_CACHE_MS,
    );
  })().finally(() => {
    eventListInFlight.delete(key);
  });

  eventListInFlight.set(key, request);
  return request;
}

async function getEventLeaderboardFallback(
  eventId: string,
  limit: number,
): Promise<EventLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from('event_participants')
    .select(`
      points, rank, updated_at, created_at,
      profiles!inner ( id, username, avatar_url, level, status )
    `)
    .eq('event_id', eventId)
    .order('points', { ascending: false })
    .order('updated_at', { ascending: true })
    .limit(limit);

  if (error) throw error;

  return (data ?? [])
    .filter(row => {
      const raw = row.profiles;
      const p = (Array.isArray(raw) ? raw[0] : raw) as { status?: string } | null | undefined;
      return p?.status !== 'suspended';
    })
    .map((row, i) => {
      const raw = row.profiles;
      const p = (Array.isArray(raw) ? raw[0] : raw) as {
        id: string; username: string; avatar_url: string | null; level: number;
      };
      return {
        id: p.id,
        username: p.username,
        avatar_url: p.avatar_url,
        level: p.level,
        points: row.points,
        rank: row.rank ?? i + 1,
        updated_at: row.updated_at,
      };
    });
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
  if (!eventId) return [];
  const safeLimit = Math.min(Math.max(Math.floor(limit) || 20, 1), 50);
  const key = cacheKey(['event-board', eventId, safeLimit]);
  const cached = readCache(leaderboardCache, key);
  if (cached) return cached;

  const existing = leaderboardInFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    const { data, error } = await supabase.rpc('get_event_leaderboard', {
      p_event_id: eventId,
      p_limit: safeLimit,
    });

    if (!error) return writeCache(leaderboardCache, key, parseEventBoard(data), EVENT_LEADERBOARD_CACHE_MS);

    if (isMissingRpc(error) || error.code === 'PGRST202' || error.code?.startsWith('P')) {
      console.warn('[eventLeaderboard] RPC failed; using table fallback:', error.message);
      const fallback = await getEventLeaderboardFallback(eventId, safeLimit);
      return writeCache(leaderboardCache, key, fallback, EVENT_LEADERBOARD_CACHE_MS);
    }

    throw error;
  })().finally(() => {
    leaderboardInFlight.delete(key);
  });

  leaderboardInFlight.set(key, request);
  return request;
}

async function getMyEventParticipationFallback(eventId: string): Promise<EventParticipation> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { joined: false };

  const { data, error } = await supabase
    .from('event_participants')
    .select('points, rank')
    .eq('event_id', eventId)
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return { joined: false };

  return {
    joined: true,
    points: data.points,
    rank: data.rank,
  };
}

export async function getMyEventParticipation(eventId: string): Promise<EventParticipation> {
  if (!eventId) return { joined: false };
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;
  if (!userId) return { joined: false };
  const key = cacheKey(['event-participation', eventId, userId]);
  const cached = readCache(participationCache, key);
  if (cached) return cached;

  const existing = participationInFlight.get(key);
  if (existing) return existing;

  const request = (async () => {
    const { data, error } = await supabase.rpc('get_my_event_participation', {
      p_event_id: eventId,
    });

    if (!error) return writeCache(participationCache, key, parseParticipation(data), EVENT_PARTICIPATION_CACHE_MS);

    if (isMissingRpc(error)) {
      const fallback = await getMyEventParticipationFallback(eventId);
      return writeCache(participationCache, key, fallback, EVENT_PARTICIPATION_CACHE_MS);
    }

    throw error;
  })().finally(() => {
    participationInFlight.delete(key);
  });

  participationInFlight.set(key, request);
  return request;
}

export async function joinEvent(eventId: string): Promise<EventParticipation> {
  const { data, error } = await supabase.rpc('join_event', { p_event_id: eventId });
  if (error) {
    if (isMissingRpc(error)) {
      throw new Error('Etkinlik sistemi kurulmamış. Yönetici: supabase/apply_event_leaderboard.sql dosyasını çalıştırın.');
    }
    throw error;
  }
  const participation = {
    joined: true,
    points: (data as { points?: number })?.points ?? 0,
    rank: (data as { rank?: number | null })?.rank ?? null,
  };
  const { data: { session } } = await supabase.auth.getSession();
  participationCache.delete(cacheKey(['event-participation', eventId, session?.user?.id]));
  leaderboardCache.delete(cacheKey(['event-board', eventId, 50]));
  return participation;
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
  if (error) {
    if (isMissingTable(error)) return [];
    throw error;
  }
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
  if (error && !isMissingRpc(error)) throw error;
}
