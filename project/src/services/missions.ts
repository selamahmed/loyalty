import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Mission = Database['public']['Tables']['missions']['Row'];
export type UserMission = Database['public']['Tables']['user_missions']['Row'];

export interface MissionWithStatus extends Mission {
  completed: boolean;
  completed_at: string | null;
  user_mission_id: string | null;
}

export async function getMissionsWithStatus(userId: string): Promise<MissionWithStatus[]> {
  const { data, error } = await supabase
    .from('missions')
    .select(`
      *,
      user_missions!left(id, completed, completed_at, reset_at, user_id)
    `)
    .eq('active', true)
    .order('category')
    .order('created_at');

  if (error) throw error;

  return (data ?? []).map(m => {
    const userMission = Array.isArray(m.user_missions)
      ? m.user_missions.find((um: { user_id: string; completed: boolean; completed_at: string | null; id: string }) => um.user_id === userId)
      : null;
    return {
      ...m,
      user_missions: undefined,
      completed: userMission?.completed ?? false,
      completed_at: userMission?.completed_at ?? null,
      user_mission_id: userMission?.id ?? null,
    };
  });
}

export async function completeMission(userId: string, missionId: string): Promise<void> {
  const { error } = await supabase
    .from('user_missions')
    .upsert({
      user_id: userId,
      mission_id: missionId,
      completed: true,
      completed_at: new Date().toISOString(),
    }, { onConflict: 'user_id,mission_id' });
  if (error) throw error;
}
