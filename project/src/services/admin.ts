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

export async function deleteQRCode(id: string): Promise<void> {
  const { error } = await supabase.from('qr_codes').delete().eq('id', id);
  if (error) throw error;
}

export async function getQRScans(qrCodeId?: string, page = 0, pageSize = 50) {
  let q = supabase
    .from('qr_scans')
    .select('*, profiles(username, email)')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (qrCodeId) q = q.eq('qr_code_id', qrCodeId);
  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function updateUserRole(userId: string, role: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role: role as Profile['role'], updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function adminAddPoints(
  userId: string,
  amount: number,
  description: string
): Promise<void> {
  const { error } = await supabase.rpc('add_points', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_category: 'admin_adjustment',
  });
  if (error) throw error;
}

export async function getAllNotifications(page = 0, pageSize = 50) {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, profiles(username, email)')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return data ?? [];
}

export async function broadcastNotification(payload: {
  type: string;
  title: string;
  message: string;
  icon?: string;
  userIds?: string[];
}): Promise<void> {
  // If specific users, send to them; otherwise send to all active users
  let targets: string[] = payload.userIds ?? [];
  if (targets.length === 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('status', 'active');
    targets = (data ?? []).map(p => p.id);
  }

  if (targets.length === 0) return;

  const rows = targets.map(uid => ({
    user_id: uid,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    icon: payload.icon ?? null,
    read: false,
  }));

  const { error } = await supabase.from('notifications').insert(rows);
  if (error) throw error;
}

export async function getDashboardStatsEnhanced(): Promise<{
  totalUsers: number;
  activeToday: number;
  totalRedemptions: number;
  totalPointsIssued: number;
  qrScansToday: number;
  newUsersToday: number;
}> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const iso = todayStart.toISOString();

  const [
    { count: totalUsers },
    { count: totalRedemptions },
    { data: pointsData },
    { count: activeToday },
    { count: qrScansToday },
    { count: newUsersToday },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('redemptions').select('id', { count: 'exact', head: true }),
    supabase.from('points_transactions').select('amount').eq('type', 'earned'),
    supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', iso),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).gte('created_at', iso),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', iso),
  ]);

  const totalPointsIssued = (pointsData ?? []).reduce((sum, t) => sum + (t.amount ?? 0), 0);

  return {
    totalUsers: totalUsers ?? 0,
    activeToday: activeToday ?? 0,
    totalRedemptions: totalRedemptions ?? 0,
    totalPointsIssued,
    qrScansToday: qrScansToday ?? 0,
    newUsersToday: newUsersToday ?? 0,
  };
}

export async function getRecentPointsTransactions(limit = 100) {
  const { data, error } = await supabase
    .from('points_transactions')
    .select('*, profiles(username, email)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
