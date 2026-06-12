import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Reward = Database['public']['Tables']['rewards']['Row'];

export async function getRewards(category?: string): Promise<Reward[]> {
  let query = supabase
    .from('rewards')
    .select('*')
    .eq('active', true)
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getFeaturedRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('active', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(6);
  if (error) throw error;
  return data ?? [];
}

export async function getRewardById(id: string): Promise<Reward | null> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function createReward(reward: Omit<Reward, 'id' | 'created_at' | 'updated_at'>): Promise<Reward> {
  const { data, error } = await supabase
    .from('rewards')
    .insert(reward)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateReward(id: string, updates: Partial<Reward>): Promise<Reward> {
  const { data, error } = await supabase
    .from('rewards')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteReward(id: string): Promise<void> {
  const { error } = await supabase
    .from('rewards')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
