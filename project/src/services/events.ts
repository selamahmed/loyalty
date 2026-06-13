import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type EventStatus = 'draft' | 'active' | 'ended' | 'distributed';

export type RewardPrize = {
  rank: number;
  label: string;
  rewardName: string;
  rewardImage: string;
  quantity: number;
  pointsRequired: number;
};

// Extend the generated type with columns added by patch_new_tables.sql
export type AppEvent = Database['public']['Tables']['events']['Row'] & {
  published?:         boolean;
  win_count?:         number;
  rewards_json?:      RewardPrize[] | null;
  distribution_date?: string | null;
  status?:            EventStatus;
};

type EventInsert = Omit<AppEvent, 'id' | 'created_at'>;

/** Columns the app may write — `status` is DB-managed after migration is applied. */
function eventWritePayload(payload: Partial<AppEvent>): Record<string, unknown> {
  const { status: _status, ...rest } = payload;
  return rest;
}

/** Derive lifecycle status from existing columns when `events.status` is not migrated yet. */
export function deriveEventStatus(ev: AppEvent): EventStatus {
  if (ev.status) return ev.status;
  if (!ev.published) return 'draft';
  const now = Date.now();
  const end = ev.end_date ? new Date(ev.end_date).getTime() : 0;
  if (end && now > end) return 'ended';
  return 'active';
}

export async function getActiveEvents(): Promise<AppEvent[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('published', true)
    .eq('active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AppEvent[];
}

export async function getAllEvents(): Promise<AppEvent[]> {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('start_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as AppEvent[];
}

export async function createEvent(event: EventInsert): Promise<AppEvent> {
  const { data, error } = await supabase
    .from('events')
    .insert(eventWritePayload(event) as Parameters<ReturnType<typeof supabase.from>['insert']>[0])
    .select()
    .single();
  if (error) throw error;
  return data as unknown as AppEvent;
}

export async function updateEvent(id: string, updates: Partial<AppEvent>): Promise<AppEvent> {
  const { data, error } = await supabase
    .from('events')
    .update(eventWritePayload(updates) as Parameters<ReturnType<typeof supabase.from>['update']>[0])
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as AppEvent;
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
}
