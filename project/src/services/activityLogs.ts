import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

export type ActivityLog = Database['public']['Tables']['activity_logs']['Row'];

export async function getActivityLogs(
  options: {
    userId?: string;
    actionType?: string;
    riskLevel?: string;
    search?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<ActivityLog[]> {
  const { userId, actionType, riskLevel, search, page = 0, pageSize = 50 } = options;

  let query = supabase
    .from('activity_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (userId) query = query.eq('user_id', userId);
  if (actionType) query = query.eq('action_type', actionType);
  if (riskLevel) query = query.eq('risk_level', riskLevel);
  if (search) {
    query = query.or(`username.ilike.%${search}%,email.ilike.%${search}%,ip_address.ilike.%${search}%,city.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getLogStats(): Promise<{
  total: number;
  today: number;
  uniqueUsers: number;
  highRisk: number;
}> {
  const { data, error } = await supabase.rpc('get_log_stats');
  if (error) throw error;
  return data ?? { total: 0, today: 0, uniqueUsers: 0, highRisk: 0 };
}

export async function logActivity(log: Omit<ActivityLog, 'id' | 'created_at'>): Promise<void> {
  const { error } = await supabase.from('activity_logs').insert(log);
  if (error) console.error('Failed to log activity:', error);
}
