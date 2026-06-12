import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Achievement = Database['public']['Tables']['achievements']['Row'];
export type UserAchievement = Database['public']['Tables']['user_achievements']['Row'];

export interface AchievementWithProgress extends Achievement {
  progress: number;
  completed: boolean;
  completed_at: string | null;
}

export async function getAchievementsWithProgress(userId: string): Promise<AchievementWithProgress[]> {
  const { data, error } = await supabase
    .from('achievements')
    .select(`
      *,
      user_achievements!left(progress, completed, completed_at, user_id)
    `)
    .order('rarity')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(a => {
    const userAch = Array.isArray(a.user_achievements)
      ? a.user_achievements.find((ua: { user_id: string; progress: number; completed: boolean; completed_at: string | null }) => ua.user_id === userId)
      : null;
    return {
      ...a,
      user_achievements: undefined,
      progress: userAch?.progress ?? 0,
      completed: userAch?.completed ?? false,
      completed_at: userAch?.completed_at ?? null,
    };
  });
}
