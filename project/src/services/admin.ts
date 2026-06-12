import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export async function getAllUsers(page = 0, pageSize = 20, search?: string): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function suspendUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function activateUser(userId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function getDashboardStats(): Promise<{
  totalUsers: number;
  activeToday: number;
  totalRedemptions: number;
  totalPointsIssued: number;
}> {
  const [
    { count: totalUsers },
    { count: totalRedemptions },
    { data: pointsData },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('redemptions').select('id', { count: 'exact', head: true }),
    supabase.from('points_transactions').select('amount').eq('type', 'earned'),
  ]);

  const totalPointsIssued = (pointsData ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0);

  return {
    totalUsers: totalUsers ?? 0,
    activeToday: 0,
    totalRedemptions: totalRedemptions ?? 0,
    totalPointsIssued,
  };
}

export async function getQRCodes() {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createQRCode(code: {
  code: string;
  points: number;
  label?: string;
  max_uses?: number;
  expires_at?: string;
  store_id?: string;
}) {
  const { data, error } = await supabase
    .from('qr_codes')
    .insert({ ...code, active: true, uses_count: 0 })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function toggleQRCode(id: string, active: boolean): Promise<void> {
  const { error } = await supabase.from('qr_codes').update({ active }).eq('id', id);
  if (error) throw error;
}

export async function getRedemptionsAdmin(page = 0, pageSize = 20) {
  const { data, error } = await supabase
    .from('redemptions')
    .select('*, profiles(username, email), rewards(title, category)')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return data ?? [];
}
