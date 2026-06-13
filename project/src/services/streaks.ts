import { supabase } from '../lib/supabase';

export type UserStreak = {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_claim_date: string | null;
};

export type StreakLike = Pick<UserStreak, 'current_streak' | 'longest_streak' | 'last_claim_date'> | null;

export async function getUserStreak(userId: string): Promise<UserStreak | null> {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function isStreakClaimedToday(streak: StreakLike): boolean {
  if (!streak?.last_claim_date) return false;
  const today = new Date().toISOString().slice(0, 10);
  return streak.last_claim_date === today;
}

export function nextStreakDay(streak: StreakLike): number {
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (!streak?.last_claim_date) return 1;
  if (streak.last_claim_date === today) return streak.current_streak || 1;
  if (streak.last_claim_date === yesterday) return Math.min((streak.current_streak || 0) + 1, 7);
  return 1;
}
