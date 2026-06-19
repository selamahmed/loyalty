import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { ilikeOrFilter } from '../lib/postgrestSearch';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export async function getAllUsers(page = 0, pageSize = 20, search?: string): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  const searchFilter = search ? ilikeOrFilter(['username', 'email'], search) : null;
  if (searchFilter) {
    query = query.or(searchFilter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function suspendUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_user_status', {
    p_user_id: userId,
    p_status: 'suspended',
  });
  if (!error) return;

  const { error: fb, data } = await supabase
    .from('profiles')
    .update({ status: 'suspended', updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id');

  if (fb || !data?.length) {
    throw new Error(error.message || fb?.message || 'Askıya alma başarısız — patch_account_status.sql çalıştırın');
  }
}

export async function activateUser(userId: string): Promise<void> {
  const { error } = await supabase.rpc('admin_set_user_status', {
    p_user_id: userId,
    p_status: 'active',
  });
  if (!error) return;

  const { error: fb, data } = await supabase
    .from('profiles')
    .update({ status: 'active', updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id');

  if (fb || !data?.length) {
    throw new Error(error.message || fb?.message || 'Aktifleştirme başarısız — patch_account_status.sql çalıştırın');
  }
}

export async function deleteUser(userId: string): Promise<void> {
  const { error: fnErr } = await supabase.functions.invoke('ban-user', {
    body: { userId, status: 'deleted' },
  });
  if (!fnErr) return;

  const { error } = await supabase.rpc('admin_set_user_status', {
    p_user_id: userId,
    p_status: 'deleted',
  });
  if (!error) return;

  const { error: fb, data } = await supabase
    .from('profiles')
    .update({ status: 'deleted', updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select('id');

  if (fb || !data?.length) {
    throw new Error(error.message || fb?.message || 'Yasaklama başarısız — migration çalıştırın');
  }
}

export async function suspendUserViaEdge(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('ban-user', {
    body: { userId, status: 'suspended' },
  });
  if (error) await suspendUser(userId);
}

export async function activateUserViaEdge(userId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('ban-user', {
    body: { userId, status: 'active' },
  });
  if (error) await activateUser(userId);
}

export async function saveAdminNote(userId: string, note: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ bio: note, updated_at: new Date().toISOString() })
    .eq('id', userId);
  if (error) throw error;
}

export async function getAllUsersUnpaged(search?: string): Promise<Profile[]> {
  let query = supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false });
  const searchFilter = search ? ilikeOrFilter(['username', 'email', 'phone'], search) : null;
  if (searchFilter) {
    query = query.or(searchFilter);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getUserDetailStats(userId: string): Promise<{
  achievementsCount: number;
  missionsCount: number;
  qrScansCount: number;
  redemptionsCount: number;
  highRiskLogs: number;
}> {
  const [ach, mis, qr, red, risk] = await Promise.all([
    supabase.from('user_achievements').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', true),
    supabase.from('user_missions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('completed', true),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('redemptions').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('risk_level', 'high'),
  ]);
  return {
    achievementsCount: ach.count ?? 0,
    missionsCount: mis.count ?? 0,
    qrScansCount: qr.count ?? 0,
    redemptionsCount: red.count ?? 0,
    highRiskLogs: risk.count ?? 0,
  };
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

export async function updateRedemptionCode(id: string, code: string) {
  const normalizedCode = code.trim().toUpperCase();
  if (!normalizedCode) throw new Error('Redemption code cannot be empty.');

  const { data, error } = await supabase
    .from('redemptions')
    .update({ code: normalizedCode })
    .eq('id', id)
    .select('*, profiles(username, email), rewards(title, category)')
    .single();
  if (error) throw error;
  return data;
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

export async function updateUserRole(userId: string, role: string, innerPassword?: string): Promise<void> {
  const roleAliases: Record<string, Profile['role']> = {
    user: 'customer',
    admin: 'store_admin',
    customer: 'customer',
    cashier: 'cashier',
    store_admin: 'store_admin',
    super_admin: 'super_admin',
  };
  const normalizedRole = roleAliases[role];
  if (!normalizedRole) throw new Error('Invalid role.');

  const args = innerPassword
    ? { p_user_id: userId, p_role: normalizedRole, p_inner_password: innerPassword }
    : { p_user_id: userId, p_role: normalizedRole };

  const { error } = await supabase.rpc('admin_set_user_role', args);
  if (error) throw error;
}

export async function setSuperAdminInnerPassword(password: string): Promise<void> {
  if (password.length < 8 || password.length > 128) {
    throw new Error('Inner password must be between 8 and 128 characters.');
  }

  const { error } = await supabase.rpc('super_admin_set_inner_password', {
    p_password: password,
  });
  if (error) throw error;
}

export async function adminAddPoints(
  userId: string,
  amount: number,
  description: string,
  category = 'admin_adjustment',
  referenceId?: string,
): Promise<void> {
  if (!Number.isFinite(amount) || !Number.isInteger(amount) || amount === 0) {
    throw new Error('Point adjustment must be a non-zero integer.');
  }

  const { error } = await supabase.rpc('admin_adjust_points', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_category: category,
    p_reference_id: referenceId ?? null,
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

/* ── Dashboard: weekly activity chart data ─────────────────────── */
export async function getWeeklyActivity(): Promise<{ day: string; points: number; scans: number }[]> {
  const days: { day: string; points: number; scans: number }[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();

  // Build 7-day buckets
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ day: dayNames[d.getDay()], points: 0, scans: 0 });
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const [{ data: pts }, { data: scans }] = await Promise.all([
    supabase.from('points_transactions').select('amount,created_at').gte('created_at', weekAgo.toISOString()).eq('type', 'earned'),
    supabase.from('qr_scans').select('created_at').gte('created_at', weekAgo.toISOString()),
  ]);

  (pts ?? []).forEach(t => {
    const d = new Date(t.created_at);
    const idx = Math.round((d.getTime() - weekAgo.getTime()) / 86400000);
    if (idx >= 0 && idx < 7) days[idx].points += t.amount ?? 0;
  });

  (scans ?? []).forEach(s => {
    const d = new Date(s.created_at);
    const idx = Math.round((d.getTime() - weekAgo.getTime()) / 86400000);
    if (idx >= 0 && idx < 7) days[idx].scans += 1;
  });

  return days;
}

/* ── Dashboard: recent users ─────────────────────────────────────── */
export async function getRecentUsers(limit = 6) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,username,email,avatar_url,role,status,total_points,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/* ── Dashboard: recent activity feed ─────────────────────────────── */
export async function getRecentActivity(limit = 8) {
  const { data, error } = await supabase
    .from('activity_logs')
    .select('id,username,email,action,action_type,amount,risk_level,created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

/* ── Dashboard: top stats (rewards, missions counts) ──────────────── */
export async function getDashboardExtras(): Promise<{
  activeRewards: number;
  activeMissions: number;
  activeEvents: number;
  totalQRCodes: number;
}> {
  const [
    { count: activeRewards },
    { count: activeMissions },
    { count: activeEvents },
    { count: totalQRCodes },
  ] = await Promise.all([
    supabase.from('rewards').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('missions').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('events').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('qr_codes').select('id', { count: 'exact', head: true }).eq('active', true),
  ]);
  return {
    activeRewards:  activeRewards  ?? 0,
    activeMissions: activeMissions ?? 0,
    activeEvents:   activeEvents   ?? 0,
    totalQRCodes:   totalQRCodes   ?? 0,
  };
}

/* ── AdminDashboard2: full analytics data ──────────────────────── */
export async function getAnalyticsData(days: number) {
  const now = new Date();
  const periodStart = new Date(now);
  periodStart.setDate(periodStart.getDate() - (days - 1));
  periodStart.setHours(0, 0, 0, 0);
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const iso = periodStart.toISOString();
  const todayIso = todayStart.toISOString();

  const [
    { count: totalUsers },
    { count: newUsersToday },
    { count: activeToday },
    { count: activeMonthly },
    { count: redemptionCount },
    { count: qrScansToday },
    { count: highRiskAlerts },
    { count: activeSessions },
    { data: profilesPoints },
    { data: pointsTx },
    { data: activityLogs },
    { data: topUsersData },
    { data: redemptionsData },
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('activity_logs').select('user_id', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 30 * 86400000).toISOString()),
    supabase.from('redemptions').select('id', { count: 'exact', head: true }),
    supabase.from('qr_scans').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).eq('risk_level', 'high').gte('created_at', new Date(Date.now() - 86400000).toISOString()),
    supabase.from('activity_logs').select('id', { count: 'exact', head: true }).gte('created_at', todayIso),
    supabase.from('profiles').select('total_points'),
    supabase.from('points_transactions').select('amount,type,created_at').gte('created_at', iso),
    supabase.from('activity_logs').select('created_at,user_id,device_type,country,username,action,action_type,device_name,amount').gte('created_at', iso).order('created_at', { ascending: false }),
    supabase.from('profiles').select('username,total_points,level').order('total_points', { ascending: false }).limit(5),
    supabase.from('redemptions').select('reward_id,rewards(title,points_cost)').limit(200),
  ]);

  // Total points in system
  const totalPoints = (profilesPoints ?? []).reduce((s, p) => s + (p.total_points ?? 0), 0);

  // Points earned/spent in period
  const earned = (pointsTx ?? []).filter(t => t.type === 'earned').reduce((s, t) => s + (t.amount ?? 0), 0);
  const spent  = (pointsTx ?? []).filter(t => t.type === 'spent').reduce((s, t) => s + (t.amount ?? 0), 0);

  // Build daily chart arrays (activity + points flow)
  const dayCount = days;
  const activityChart: { date: string; value: number; users: number }[] = [];
  const pointsFlow: { date: string; earned: number; spent: number }[] = [];

  for (let i = dayCount - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayStr = d.toISOString().slice(0, 10);

    const dayLogs = (activityLogs ?? []).filter(l => l.created_at.slice(0, 10) === dayStr);
    const dayTx   = (pointsTx ?? []).filter(t => t.created_at.slice(0, 10) === dayStr);

    activityChart.push({
      date: label,
      value: dayLogs.length,
      users: new Set(dayLogs.map(l => l.user_id)).size,
    });
    pointsFlow.push({
      date: label,
      earned: dayTx.filter(t => t.type === 'earned').reduce((s, t) => s + (t.amount ?? 0), 0),
      spent:  dayTx.filter(t => t.type === 'spent').reduce((s, t) => s + (t.amount ?? 0), 0),
    });
  }

  // Device distribution
  const deviceMap: Record<string, number> = {};
  (activityLogs ?? []).forEach(l => {
    const d = l.device_type ?? 'desktop';
    deviceMap[d] = (deviceMap[d] ?? 0) + 1;
  });
  const deviceStats = Object.entries(deviceMap).map(([device, users]) => ({ device: device.charAt(0).toUpperCase() + device.slice(1), users })).sort((a, b) => b.users - a.users);

  // Country distribution
  const countryMap: Record<string, number> = {};
  (activityLogs ?? []).forEach(l => {
    if (!l.country || l.country === 'Unknown') return;
    countryMap[l.country] = (countryMap[l.country] ?? 0) + 1;
  });
  const geoStats = Object.entries(countryMap).map(([country, users]) => ({ country, users })).sort((a, b) => b.users - a.users).slice(0, 6);

  // Recent activity
  const recentActivity = (activityLogs ?? []).slice(0, 8).map(l => ({
    user: l.username,
    action: l.action,
    action_type: l.action_type,
    time: l.created_at,
    device: l.device_name ?? l.device_type ?? 'Unknown',
    amount: l.amount,
  }));

  // Top users
  const topUsers = (topUsersData ?? []).map(u => ({
    username: u.username,
    points: u.total_points ?? 0,
    level: u.level ?? 1,
  }));

  // Top redeemed rewards
  const rewardCountMap: Record<string, { name: string; redeemed: number; points: number }> = {};
  (redemptionsData ?? []).forEach((row) => {
    const r = row as { reward_id: string; rewards: { title: string; points_cost: number } | { title: string; points_cost: number }[] | null };
    const rewards = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
    if (!rewards) return;
    const id = r.reward_id;
    if (!rewardCountMap[id]) rewardCountMap[id] = { name: rewards.title, redeemed: 0, points: rewards.points_cost ?? 0 };
    rewardCountMap[id].redeemed += 1;
  });
  const topProducts = Object.values(rewardCountMap).sort((a, b) => b.redeemed - a.redeemed).slice(0, 5);

  return {
    stats: {
      totalUsers:       totalUsers ?? 0,
      newUsersToday:    newUsersToday ?? 0,
      activeUsersDaily: activeToday ?? 0,
      activeUsersMonthly: activeMonthly ?? 0,
      totalPoints,
      pointsEarned: earned,
      pointsSpent:  spent,
      dailyQRScans: qrScansToday ?? 0,
      redemptionCount: redemptionCount ?? 0,
      security: {
        alerts:         highRiskAlerts ?? 0,
        activeSessions: activeSessions ?? 0,
        blockedIPs:     0,
      },
      topUsers,
      topProducts,
      recentActivity,
      deviceStats: deviceStats.length > 0 ? deviceStats : [{ device: 'Desktop', users: 0 }],
      geoStats: geoStats.length > 0 ? geoStats : [],
    },
    activityChart,
    pointsFlow,
  };
}

/* ── AdminAnalytics: advanced analytics data ──────────────────── */
export async function getAdvancedAnalytics() {
  const now = new Date();

  const todayStart  = new Date(now); todayStart.setHours(0,0,0,0);
  const monthStart  = new Date(now); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const day30Ago    = new Date(now); day30Ago.setDate(day30Ago.getDate()-30);
  const day7Ago     = new Date(now); day7Ago.setDate(day7Ago.getDate()-7);
  const day90Ago    = new Date(now); day90Ago.setDate(day90Ago.getDate()-90);

  const [
    { count: totalUsers },
    { count: activeToday },
    { count: redemptionsMonth },
    { count: achievementsMonth },
    { count: qrToday },
    { count: highRiskLogs },
    { count: totalLogs },
    { data: pointsTx },
    { data: allLogs },
    { data: profiles6mo },
    { data: redemptions },
    { data: qrUsers },
    { data: redemUsers },
    { data: active30 },
  ] = await Promise.all([
    supabase.from('profiles').select('id',{count:'exact',head:true}).eq('status','active'),
    supabase.from('activity_logs').select('user_id',{count:'exact',head:true}).gte('created_at',todayStart.toISOString()),
    supabase.from('redemptions').select('id',{count:'exact',head:true}).gte('created_at',monthStart.toISOString()),
    supabase.from('user_achievements').select('id',{count:'exact',head:true}).gte('created_at',monthStart.toISOString()),
    supabase.from('qr_scans').select('id',{count:'exact',head:true}).gte('created_at',todayStart.toISOString()),
    supabase.from('activity_logs').select('id',{count:'exact',head:true}).eq('risk_level','high'),
    supabase.from('activity_logs').select('id',{count:'exact',head:true}),
    // Points transactions (last 90 days — for all charts)
    supabase.from('points_transactions').select('amount,type,created_at').gte('created_at',day90Ago.toISOString()),
    // All activity logs (last 90 days) — for hourly, weekly, device, geo
    supabase.from('activity_logs').select('created_at,user_id,device_type,country,action_type').gte('created_at',day90Ago.toISOString()),
    // Profiles for last 6 months growth chart
    supabase.from('profiles').select('created_at').gte('created_at',new Date(now.getFullYear(), now.getMonth()-5, 1).toISOString()),
    // Redemptions with reward info
    supabase.from('redemptions').select('created_at,reward_id,rewards(title,category)').gte('created_at',monthStart.toISOString()),
    // Distinct users with QR scan
    supabase.from('qr_scans').select('user_id').limit(5000),
    // Distinct users with redemption
    supabase.from('redemptions').select('user_id').limit(5000),
    // Active users last 30d
    supabase.from('activity_logs').select('user_id',{count:'exact',head:true}).gte('created_at',day30Ago.toISOString()),
  ]);

  // ── KPI values ──
  const pointsToday   = (pointsTx??[]).filter(t=>t.created_at>=todayStart.toISOString()&&t.type==='earned').reduce((s,t)=>s+(t.amount??0),0);
  const pointsMonth   = (pointsTx??[]).filter(t=>t.created_at>=monthStart.toISOString()&&t.type==='earned').reduce((s,t)=>s+(t.amount??0),0);
  const pointsSpentMo = (pointsTx??[]).filter(t=>t.created_at>=monthStart.toISOString()&&t.type==='spent').reduce((s,t)=>s+(t.amount??0),0);
  const secScore      = totalLogs && totalLogs > 0 ? Math.min(100, Math.round((1-(highRiskLogs??0)/(totalLogs??1))*100*0.98+2)) : 100;

  // ── Monthly growth chart (last 6 months) ──
  const monthlyMap: Record<string,{month:string;new:number;active:number;pointsEarned:number}> = {};
  for (let i=5; i>=0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth()-i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const label = d.toLocaleDateString('en-US',{month:'short'});
    monthlyMap[key] = { month: label, new: 0, active: 0, pointsEarned: 0 };
  }
  (profiles6mo??[]).forEach(p => {
    const k = p.created_at.slice(0,7);
    if (monthlyMap[k]) monthlyMap[k].new++;
  });
  (allLogs??[]).forEach(l => {
    const k = l.created_at.slice(0,7);
    if (monthlyMap[k]) monthlyMap[k].active++;
  });
  (pointsTx??[]).filter(t=>t.type==='earned').forEach(t => {
    const k = t.created_at.slice(0,7);
    if (monthlyMap[k]) monthlyMap[k].pointsEarned += t.amount??0;
  });
  const monthlyActive = Object.values(monthlyMap);

  // ── Weekly engagement by day (last 7 days) ──
  const dayLabels = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const weekMap: Record<number,{day:string;qr:number;missions:number;sessions:number;points:number}> = {};
  for (let i=0;i<7;i++) weekMap[i] = { day:dayLabels[i], qr:0, missions:0, sessions:0, points:0 };
  (allLogs??[]).filter(l=>l.created_at>=day7Ago.toISOString()).forEach(l => {
    const dow = new Date(l.created_at).getDay();
    weekMap[dow].sessions++;
    if (l.action_type==='qr_scan')  weekMap[dow].qr++;
    if (l.action_type==='mission')  weekMap[dow].missions++;
  });
  (pointsTx??[]).filter(t=>t.type==='earned'&&t.created_at>=day7Ago.toISOString()).forEach(t => {
    const dow = new Date(t.created_at).getDay();
    weekMap[dow].points += t.amount??0;
  });
  // Order starting from the oldest day of the week relative to today
  const todayDow = now.getDay();
  const weekEngagement = Array.from({length:7},(_,i)=>weekMap[(todayDow-6+i+7)%7]);

  // ── Hourly activity (last 30 days avg) ──
  const hourMap: Record<number,{count:number;days:Set<string>}> = {};
  for (let h=0;h<24;h++) hourMap[h] = {count:0,days:new Set()};
  (allLogs??[]).filter(l=>l.created_at>=day30Ago.toISOString()).forEach(l => {
    const h = new Date(l.created_at).getHours();
    hourMap[h].count++;
    hourMap[h].days.add(l.created_at.slice(0,10));
  });
  const hourlyActivity = Array.from({length:12},(_,i)=>{
    const h = i*2;
    const days = Math.max(hourMap[h].days.size,1);
    return { hour: String(h).padStart(2,'0'), users: Math.round(hourMap[h].count/days) };
  });
  const peakHour = hourlyActivity.reduce((a,b)=>a.users>b.users?a:b,hourlyActivity[0]);
  const lowHour  = hourlyActivity.reduce((a,b)=>a.users<b.users?a:b,hourlyActivity[0]);

  // ── Retention (approximate from activity_logs) ──
  const allUserIds  = new Set((allLogs??[]).map(l=>l.user_id).filter(Boolean));
  const d7Users     = new Set((allLogs??[]).filter(l=>l.created_at>=day7Ago.toISOString()).map(l=>l.user_id).filter(Boolean));
  const d30Users    = new Set((allLogs??[]).filter(l=>l.created_at>=day30Ago.toISOString()).map(l=>l.user_id).filter(Boolean));
  const d90Users    = allUserIds;
  const pct = (a:Set<string|null>,b:number) => b>0 ? Math.round(a.size/b*100) : 0;
  const total = totalUsers??1;
  const retentionData = [
    { day:'D1',  rate: Math.min(100,pct(new Set((allLogs??[]).filter(l=>l.created_at>=todayStart.toISOString()).map(l=>l.user_id)),total)) },
    { day:'D7',  rate: Math.min(100,pct(d7Users,total))  },
    { day:'D14', rate: Math.min(100,Math.round(d7Users.size/Math.max(total,1)*80)) },
    { day:'D30', rate: Math.min(100,pct(d30Users,total)) },
    { day:'D60', rate: Math.min(100,Math.round(d30Users.size/Math.max(total,1)*80)) },
    { day:'D90', rate: Math.min(100,pct(d90Users,total)) },
  ];
  const d90Rate = retentionData[5].rate;

  // ── Device distribution ──
  const devMap: Record<string,number> = {};
  (allLogs??[]).filter(l=>l.created_at>=day30Ago.toISOString()).forEach(l => {
    const d = (l.device_type??'desktop').charAt(0).toUpperCase()+(l.device_type??'desktop').slice(1);
    devMap[d] = (devMap[d]??0)+1;
  });
  const devTotal = Object.values(devMap).reduce((s,v)=>s+v,1);
  const DEVICE_COLORS: Record<string,string> = { Desktop:'#7B6EF6', Mobile:'#4F8EF7', Tablet:'#22c55e' };
  const deviceDistribution = Object.entries(devMap).map(([name,v])=>({
    name, value: Math.round(v/devTotal*100), devices: v, color: DEVICE_COLORS[name]??'#f59e0b',
  })).sort((a,b)=>b.value-a.value);

  // ── Geo distribution ──
  const geoMap: Record<string,number> = {};
  (allLogs??[]).filter(l=>l.created_at>=day30Ago.toISOString()&&l.country&&l.country!=='Unknown').forEach(l => {
    geoMap[l.country!] = (geoMap[l.country!]??0)+1;
  });
  const geoData = Object.entries(geoMap).map(([country,users])=>({country,users,flag:'🌍',growth:0})).sort((a,b)=>b.users-a.users).slice(0,8);

  // ── Funnel ──
  const qrUids  = new Set((qrUsers??[]).map(r=>r.user_id));
  const redUids = new Set((redemUsers??[]).map(r=>r.user_id));
  const funnelData: { stage: string; count: number; fill: string }[] = [
    { stage: 'Kayıt', count: totalUsers ?? 0, fill: '#7B6EF6' },
    { stage: 'QR Tarama', count: qrUids.size, fill: '#4F8EF7' },
    { stage: 'Ödül Kullandı', count: redUids.size, fill: '#22c55e' },
    { stage: '30g Aktif', count: typeof active30 === 'number' ? active30 : 0, fill: '#f59e0b' },
  ];

  // ── Reward performance (by name) ──
  const rwMap: Record<string,{name:string;count:number}> = {};
  (redemptions ?? []).forEach((row) => {
    const r = row as { reward_id: string; rewards: { title: string; category: string } | { title: string; category: string }[] | null };
    const rewards = Array.isArray(r.rewards) ? r.rewards[0] : r.rewards;
    const name = rewards?.title ?? 'Bilinmeyen';
    rwMap[name] = rwMap[name] ?? { name, count: 0 };
    rwMap[name].count++;
  });
  const rewardPerformance = Object.values(rwMap).sort((a,b)=>b.count-a.count).slice(0,5);
  const rpTotal = rewardPerformance.reduce((s,r)=>s+r.count,1);
  const rewardPopularity = rewardPerformance.map(r=>({ name:r.name, value:Math.round(r.count/rpTotal*100), count:r.count }));

  return {
    kpis: {
      activeUsers:   activeToday ?? 0,
      pointsPerDay:  pointsToday,
      securityScore: secScore,
      redemptionsMonth: redemptionsMonth ?? 0,
      achievementsMonth: achievementsMonth ?? 0,
      qrToday: qrToday ?? 0,
      pointsMonth,
      pointsSpentMonth: pointsSpentMo,
    },
    monthlyActive,
    weekEngagement,
    hourlyActivity,
    peakHour, lowHour,
    retentionData, d90Rate,
    deviceDistribution: deviceDistribution.length>0 ? deviceDistribution : [{name:'Desktop',value:100,devices:0,color:'#7B6EF6'}],
    geoData,
    funnelData,
    rewardPopularity: rewardPopularity.length>0 ? rewardPopularity : [],
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

/* ── QR / Cashier helpers ──────────────────────────────────────── */

/** Look up a store QR code by its raw code string. */
export async function lookupStoreQR(code: string) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('code', code.trim().toUpperCase())
    .eq('active', true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getQRCodeById(id: string) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getCashierQRCodes(limit = 20) {
  const { data, error } = await supabase
    .from('qr_codes')
    .select('*')
    .eq('max_uses', 1)
    .not('expires_at', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

type SupabaseServiceError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

type QRCodeRow = Database['public']['Tables']['qr_codes']['Row'];

function supabaseErrorText(error: SupabaseServiceError | null): string {
  if (!error) return '';
  return [error.message, error.details, error.hint].filter(Boolean).join(' ');
}

function isMissingCashierQRFunction(error: SupabaseServiceError | null): boolean {
  const text = supabaseErrorText(error).toLowerCase();
  return Boolean(
    error &&
    (error.code === 'PGRST202' ||
      text.includes('could not find the function') ||
      text.includes('function public.create_cashier_qr')),
  );
}

function normalizeCashierQRRow(value: unknown): QRCodeRow | null {
  const row = Array.isArray(value) ? value[0] : value;
  if (!row || typeof row !== 'object') return null;
  const candidate = row as Partial<QRCodeRow>;
  return candidate.id && candidate.code ? (candidate as QRCodeRow) : null;
}

function cashierQRError(error: SupabaseServiceError): Error {
  const text = supabaseErrorText(error);
  const lower = text.toLowerCase();

  if (error.code === '42501' || lower.includes('row-level security')) {
    return new Error(
      'Cashier QR is blocked by Supabase RLS. Run supabase/migrations/20260615000002_realtime_cashier_qr_ranking.sql in the Supabase SQL Editor, then refresh the app.',
    );
  }

  if (lower.includes('only active cashiers and admins')) {
    return new Error(
      'This account is not an active cashier/admin in Supabase profiles. Set the profile role to cashier, store_admin, or super_admin and status to active.',
    );
  }

  if (isMissingCashierQRFunction(error)) {
    return new Error(
      'Supabase is missing create_cashier_qr. Run supabase/migrations/20260615000002_realtime_cashier_qr_ranking.sql in the Supabase SQL Editor.',
    );
  }

  return new Error(text || 'Cashier QR could not be created.');
}

/** @deprecated Use claimQrScan from earn.ts — server validates QR */
export async function recordQRScan(
  _userId: string,
  qrCodeId: string,
  _pointsEarned: number,
  _description: string,
): Promise<void> {
  const { data: qr } = await supabase.from('qr_codes').select('code').eq('id', qrCodeId).maybeSingle();
  if (!qr?.code) throw new Error('QR not found');
  const { error } = await supabase.rpc('claim_qr_scan', { p_code: qr.code });
  if (error) throw error;
}

/** Create a temporary cashier-purchase QR in the database. */
export async function createCashierQR(payload: {
  code: string;
  points: number;
  amount: number;
  cashierUserId: string;
  expiresAt: string;
}) {
  const normalizedCode = payload.code.trim().toUpperCase();
  const { data: rpcData, error: rpcError } = await supabase.rpc('create_cashier_qr', {
    p_code: normalizedCode,
    p_points: payload.points,
    p_amount: payload.amount,
    p_expires_at: payload.expiresAt,
  });

  if (!rpcError) {
    const row = normalizeCashierQRRow(rpcData);
    if (row) return row;
    throw new Error('Supabase created the cashier QR but did not return a valid qr_codes row.');
  }

  if (rpcError && !isMissingCashierQRFunction(rpcError)) {
    throw cashierQRError(rpcError);
  }

  const { data, error } = await supabase
    .from('qr_codes')
    .insert({
      code: normalizedCode,
      store_id: payload.cashierUserId,
      points: payload.points,
      label: `Cashier QR - TRY ${payload.amount}`,
      active: true,
      max_uses: 1,
      uses_count: 0,
      expires_at: payload.expiresAt,
    })
    .select()
    .single();
  if (error && rpcError && isMissingCashierQRFunction(rpcError)) {
    throw new Error(
      'Supabase cannot see create_cashier_qr yet, and the direct qr_codes fallback is blocked by RLS. Run supabase/migrations/20260615000002_realtime_cashier_qr_ranking.sql in Supabase SQL Editor, then refresh the Supabase schema cache/app.',
    );
  }
  if (error) throw cashierQRError(error);
  return data;
}

/** Mark a cashier QR as used (increment uses_count to max). */
export async function markCashierQRUsedDB(qrCodeId: string): Promise<void> {
  const { error } = await supabase
    .from('qr_codes')
    .update({ uses_count: 9999, active: false })
    .eq('id', qrCodeId);
  if (error) throw error;
}

/** Get today's cashier stats. */
export async function getCashierTodayStats(cashierUserId: string): Promise<{
  scans: number;
  pointsGiven: number;
  customers: number;
}> {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const iso = todayStart.toISOString();

  const [scansRes, ptsRes] = await Promise.all([
    supabase
      .from('qr_scans')
      .select('id, user_id', { count: 'exact' })
      .gte('created_at', iso),
    supabase
      .from('points_transactions')
      .select('amount')
      .eq('category', 'qr_scan')
      .gte('created_at', iso),
  ]);

  const pointsGiven = (ptsRes.data ?? []).reduce((s, t) => s + (t.amount ?? 0), 0);
  const uniqueCustomers = new Set((scansRes.data ?? []).map(s => s.user_id)).size;

  return {
    scans: scansRes.count ?? 0,
    pointsGiven,
    customers: uniqueCustomers,
  };
}

/** Get recent transactions for cashier history page. */
export async function getCashierHistory(page = 0, pageSize = 30) {
  const { data, error } = await supabase
    .from('points_transactions')
    .select('*, profiles(username, email, avatar_url)')
    .in('category', ['qr_scan', 'admin_adjustment', 'cashier_manual'])
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);
  if (error) throw error;
  return data ?? [];
}
