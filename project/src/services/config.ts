import { supabase } from '../lib/supabase';

/* ── Maintenance Mode helpers ── */
export interface MaintenanceStatus {
  enabled: boolean;
  message: string;
  estimated_time: string;
  activated_at: string | null;
}

export async function getMaintenanceStatus(): Promise<MaintenanceStatus> {
  const { data } = await supabase
    .from('app_settings')
    .select('key, value')
    .in('key', ['maintenance_mode', 'maintenance_message', 'maintenance_estimated_time', 'maintenance_activated_at']);
  const map: Record<string, unknown> = {};
  (data ?? []).forEach((r: { key: string; value: unknown }) => { map[r.key] = r.value; });
  return {
    enabled:        map['maintenance_mode']           === true || map['maintenance_mode'] === 'true',
    message:        String(map['maintenance_message'] ?? 'Siteyi daha iyi hale getirmek için çalışıyoruz.'),
    estimated_time: String(map['maintenance_estimated_time'] ?? ''),
    activated_at:   map['maintenance_activated_at'] ? String(map['maintenance_activated_at']) : null,
  };
}

export async function setMaintenanceMode(
  enabled: boolean,
  message = '',
  estimatedTime = '',
): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabase.from('app_settings').upsert([
    { key: 'maintenance_mode',           value: enabled,                                                        updated_at: now },
    { key: 'maintenance_message',        value: message || 'Siteyi daha iyi hale getirmek için çalışıyoruz.', updated_at: now },
    { key: 'maintenance_estimated_time', value: estimatedTime,                                                  updated_at: now },
    { key: 'maintenance_activated_at',   value: enabled ? now : null,                                          updated_at: now },
  ], { onConflict: 'key' });
  if (error) throw error;
}

/* ── App Settings ── */
export type AppSetting = { id: string; key: string; value: unknown; description: string | null; category: string; updated_at: string };

export async function getAppSettings(): Promise<AppSetting[]> {
  const { data, error } = await supabase.from('app_settings').select('*').order('category').order('key');
  if (error) throw error;
  return data ?? [];
}

export async function upsertAppSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value: value as Record<string, unknown>, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  if (error) throw error;
}

export async function updateAppSettings(settings: Record<string, unknown>): Promise<void> {
  const updates = Object.entries(settings).map(([key, value]) => ({
    key,
    value: value as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  }));
  const { error } = await supabase.from('app_settings').upsert(updates, { onConflict: 'key' });
  if (error) throw error;
}

/* ── Daily Reward Config ── */
export type DailyRewardConfig = {
  id: string;
  day_number: number;
  points: number;
  bonus_type: 'points' | 'multiplier' | 'item';
  bonus_value: Record<string, unknown>;
  is_special: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export async function getDailyRewardConfig(): Promise<DailyRewardConfig[]> {
  const { data, error } = await supabase
    .from('daily_reward_config')
    .select('*')
    .order('day_number');
  if (error) throw error;
  return data ?? [];
}

export async function upsertDailyRewardDay(day: Partial<DailyRewardConfig> & { day_number: number }): Promise<DailyRewardConfig> {
  const { data, error } = await supabase
    .from('daily_reward_config')
    .upsert({ ...day, updated_at: new Date().toISOString() }, { onConflict: 'day_number' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ── Games Config ── */
export type GameConfig = {
  id: string;
  name: string;
  description: string | null;
  enabled: boolean;
  max_plays_per_day: number;
  max_points_per_play: number;
  icon: string | null;
  color: string | null;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export async function getGamesConfig(): Promise<GameConfig[]> {
  const { data, error } = await supabase.from('games_config').select('*').order('name');
  if (error) throw error;
  return data ?? [];
}

export async function updateGameConfig(id: string, updates: Partial<GameConfig>): Promise<void> {
  const { error } = await supabase
    .from('games_config')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}
