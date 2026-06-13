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
    { key: 'maintenance_activated_at',   value: enabled ? now : false,                                         updated_at: now },
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

/* ── System settings (AdminSettings page) ── */

export interface SystemSettings {
  economy: {
    spend_to_points: number;
    points_to_tl: number;
    referral_bonus: number;
    welcome_bonus: number;
  };
  multipliers: {
    qr_base_points: number;
    game_multiplier: number;
    daily_mission_bonus: number;
    streak_bonus: number;
  };
  limits: {
    daily_earn_cap: number;
    max_balance: number;
    min_redeem_threshold: number;
    transaction_cooldown_min: number;
  };
  flags: {
    qr_enabled: boolean;
    games_enabled: boolean;
    referral_enabled: boolean;
    streak_enabled: boolean;
    push_notifications: boolean;
    double_points_events: boolean;
  };
}

export const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  economy: { spend_to_points: 10, points_to_tl: 100, referral_bonus: 250, welcome_bonus: 100 },
  multipliers: { qr_base_points: 75, game_multiplier: 1.5, daily_mission_bonus: 50, streak_bonus: 30 },
  limits: { daily_earn_cap: 1000, max_balance: 50000, min_redeem_threshold: 500, transaction_cooldown_min: 30 },
  flags: {
    qr_enabled: true,
    games_enabled: true,
    referral_enabled: true,
    streak_enabled: true,
    push_notifications: true,
    double_points_events: false,
  },
};

export function parseSettingNumber(val: unknown, fallback: number): number {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const n = parseFloat(val.replace(',', '.'));
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

export function parseSettingBool(val: unknown, fallback: boolean): boolean {
  if (val === true || val === 'true') return true;
  if (val === false || val === 'false') return false;
  return fallback;
}

export function appSettingsToSystem(rows: AppSetting[]): SystemSettings {
  const map: Record<string, unknown> = {};
  rows.forEach(r => { map[r.key] = r.value; });
  const d = DEFAULT_SYSTEM_SETTINGS;

  return {
    economy: {
      spend_to_points: parseSettingNumber(map.points_per_currency, d.economy.spend_to_points),
      points_to_tl:    parseSettingNumber(map.points_to_tl, d.economy.points_to_tl),
      referral_bonus:  parseSettingNumber(map.referral_bonus, d.economy.referral_bonus),
      welcome_bonus:   parseSettingNumber(map.welcome_bonus, d.economy.welcome_bonus),
    },
    multipliers: {
      qr_base_points:      parseSettingNumber(map.qr_scan_bonus, d.multipliers.qr_base_points),
      game_multiplier:     parseSettingNumber(map.game_multiplier, d.multipliers.game_multiplier),
      daily_mission_bonus: parseSettingNumber(
        map.daily_mission_bonus ?? map.daily_login_bonus,
        d.multipliers.daily_mission_bonus,
      ),
      streak_bonus: parseSettingNumber(map.streak_bonus, d.multipliers.streak_bonus),
    },
    limits: {
      daily_earn_cap:           parseSettingNumber(map.max_daily_points, d.limits.daily_earn_cap),
      max_balance:              parseSettingNumber(map.max_balance, d.limits.max_balance),
      min_redeem_threshold:     parseSettingNumber(map.min_redeem_threshold, d.limits.min_redeem_threshold),
      transaction_cooldown_min: parseSettingNumber(map.transaction_cooldown_min, d.limits.transaction_cooldown_min),
    },
    flags: {
      qr_enabled:           parseSettingBool(map.qr_enabled, d.flags.qr_enabled),
      games_enabled:        parseSettingBool(map.games_enabled, d.flags.games_enabled),
      referral_enabled:     parseSettingBool(map.referral_enabled, d.flags.referral_enabled),
      streak_enabled:       parseSettingBool(map.streak_enabled, d.flags.streak_enabled),
      push_notifications:   parseSettingBool(map.push_notifications, d.flags.push_notifications),
      double_points_events: parseSettingBool(map.double_points_enabled, d.flags.double_points_events),
    },
  };
}

export function systemToAppSettingsPayload(s: SystemSettings): Record<string, unknown> {
  return {
    points_per_currency:      s.economy.spend_to_points,
    points_to_tl:             s.economy.points_to_tl,
    referral_bonus:           s.economy.referral_bonus,
    welcome_bonus:            s.economy.welcome_bonus,
    qr_scan_bonus:            s.multipliers.qr_base_points,
    game_multiplier:          s.multipliers.game_multiplier,
    daily_mission_bonus:      s.multipliers.daily_mission_bonus,
    daily_login_bonus:        s.multipliers.daily_mission_bonus,
    streak_bonus:             s.multipliers.streak_bonus,
    max_daily_points:         s.limits.daily_earn_cap,
    max_balance:              s.limits.max_balance,
    min_redeem_threshold:     s.limits.min_redeem_threshold,
    transaction_cooldown_min: s.limits.transaction_cooldown_min,
    qr_enabled:               s.flags.qr_enabled,
    games_enabled:            s.flags.games_enabled,
    referral_enabled:         s.flags.referral_enabled,
    streak_enabled:           s.flags.streak_enabled,
    push_notifications:       s.flags.push_notifications,
    double_points_enabled:    s.flags.double_points_events,
  };
}

export async function getSystemSettings(): Promise<SystemSettings> {
  const rows = await getAppSettings();
  return appSettingsToSystem(rows);
}

export async function saveSystemSettings(settings: SystemSettings): Promise<void> {
  await updateAppSettings(systemToAppSettingsPayload(settings));
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
