import { supabase } from '../lib/supabase';

export type UserSettings = {
  user_id: string;
  public_profile: boolean;
  show_on_leaderboard: boolean;
  share_activity: boolean;
  login_alerts: boolean;
  two_factor_enabled: boolean;
};

export const DEFAULT_USER_SETTINGS: Omit<UserSettings, 'user_id'> = {
  public_profile: true,
  show_on_leaderboard: true,
  share_activity: false,
  login_alerts: true,
  two_factor_enabled: false,
};

export async function getUserSettings(userId: string): Promise<UserSettings> {
  if (!userId) return { user_id: '', ...DEFAULT_USER_SETTINGS };

  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as UserSettings;
  return { user_id: userId, ...DEFAULT_USER_SETTINGS };
}

export async function updateUserSettings(
  userId: string,
  updates: Partial<Omit<UserSettings, 'user_id'>>,
): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as UserSettings;
}
