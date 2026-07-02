import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Reward = Database['public']['Tables']['rewards']['Row'];
type RewardInsert = Omit<Reward, 'id' | 'created_at' | 'updated_at'>;
type RewardUpdate = Partial<Omit<Reward, 'id' | 'created_at'>>;
type RewardWriteInput = Partial<Reward> & {
  available?: boolean | null;
  imageUrl?: string | null;
  limited_quantity?: unknown;
};

const hasOwn = (value: object, key: string): boolean =>
  Object.prototype.hasOwnProperty.call(value, key);

const nullableText = (value: unknown): string | null => {
  if (value === null || value === undefined) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
};

const rewardWritePayload = (input: RewardWriteInput): RewardUpdate => {
  const payload: RewardUpdate = {};

  if (hasOwn(input, 'title')) payload.title = String(input.title ?? '').trim();
  if (hasOwn(input, 'description')) payload.description = String(input.description ?? '');
  if (hasOwn(input, 'points')) payload.points = Math.max(1, Number(input.points) || 1);
  if (hasOwn(input, 'category')) payload.category = String(input.category ?? 'other').trim() || 'other';
  if (hasOwn(input, 'featured')) payload.featured = Boolean(input.featured);
  if (hasOwn(input, 'limited')) payload.limited = Boolean(input.limited);
  if (hasOwn(input, 'stock')) payload.stock = Math.max(0, Number(input.stock) || 0);
  if (hasOwn(input, 'expires_at')) payload.expires_at = input.expires_at ?? null;
  if (hasOwn(input, 'active')) payload.active = Boolean(input.active);
  if (hasOwn(input, 'available')) payload.active = input.available !== false;
  if (hasOwn(input, 'imageUrl')) payload.image = nullableText(input.imageUrl);
  else if (hasOwn(input, 'image')) payload.image = nullableText(input.image);

  return payload;
};

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

/** All rewards for admin screens (includes inactive). */
export async function getAdminRewards(): Promise<Reward[]> {
  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getAdminRewardsPage(options: {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
} = {}): Promise<{ rows: Reward[]; count: number }> {
  const page = Math.max(0, options.page ?? 0);
  const pageSize = Math.min(100, Math.max(10, options.pageSize ?? 50));
  let query = supabase
    .from('rewards')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  const search = options.search?.trim();
  if (search) query = query.ilike('title', `%${search.replaceAll('%', '\\%')}%`);
  if (options.category && options.category !== 'all') query = query.eq('category', options.category);

  const { data, error, count } = await query;
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
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

export async function createReward(reward: RewardInsert & RewardWriteInput): Promise<Reward> {
  const { data, error } = await supabase
    .from('rewards')
    .insert(rewardWritePayload(reward) as RewardInsert)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function bulkCreateRewards(
  rewards: RewardInsert[],
): Promise<Reward[]> {
  if (rewards.length === 0) return [];
  const { data, error } = await supabase
    .from('rewards')
    .insert(rewards.map(reward => rewardWritePayload(reward) as RewardInsert))
    .select();
  if (error) throw error;
  return data ?? [];
}

export async function updateReward(id: string, updates: RewardWriteInput): Promise<Reward> {
  const payload = {
    ...rewardWritePayload(updates),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('rewards')
    .update(payload)
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
