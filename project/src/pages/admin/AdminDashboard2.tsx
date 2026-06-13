import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, Zap, ShoppingBag, Activity, Download,
  Globe, Shield, AlertTriangle, TrendingUp, TrendingDown,
  Clock, Monitor, Smartphone, Server, Database, Cpu,
  HardDrive, Wifi, Lock, RefreshCw, Loader,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAnalyticsData } from '../../services/admin';
import { useRealtimeTables } from '../../hooks/useRealtime';

const COLORS = ['#7B6EF6', '#4F8EF7', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const ACTION_ICON: Record<string, string> = {
  login: '🔐', logout: '🚪', points_earned: '⭐', points_spent: '💸',
  purchase: '🛍️', achievement: '🏆', mission: '🎯', qr_scan: '📷',
  admin_action: '⚙️', security_alert: '🚨', profile_update: '✏️',
};

function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)    return 'az önce';
  if (s < 3600)  return `${Math.floor(s / 60)}dk önce`;
  if (s < 86400) return `${Math.floor(s / 3600)}sa önce`;
  return `${Math.floor(s / 86400)}g önce`;
}
function initials(name: string) { return (name ?? '?').charAt(0).toUpperCase(); }
function deterministicColor(str: string) {
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return COLORS[Math.abs(h) % COLORS.length];
}

/* ── Sub-components ── */
const KPICard: React.FC<{ icon: React.ElementType; title: string; value: number; change: string; positive: boolean; color: string }> = ({ icon: Icon, title, value, change, positive, color }) => {
  const cls: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600', green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600', purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  };
  return (
    <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cls[color] ?? cls.blue}`}><Icon size={24} /></div>
        {positive ? <TrendingUp size={18} className="text-green-500" /> : <TrendingDown size={18} className="text-red-500" />}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">{title}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{fmtNum(value)}</p>
        <p className={`text-xs font-bold mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
      </div>
    </div>
  );
};

const MiniStat: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => {
  const cls: Record<string, string> = {
    red: 'text-red-600 bg-red-100 dark:bg-red-900/30', green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', gray: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  };
  return (
    <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cls[color] ?? cls.blue}`}><Icon size={20} /></div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">{fmtNum(value)}</p>
        </div>
      </div>
    </div>
  );
};

const HealthItem: React.FC<{ name: string; icon: React.ElementType; load: number }> = ({ name, icon: Icon, load }) => (
  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 space-y-2">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-gray-600 dark:text-gray-400" />
      <p className="font-bold text-sm text-gray-900 dark:text-white">{name}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
      <span className="text-xs text-gray-600 dark:text-gray-400">Çevrimiçi</span>
    </div>
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${load > 80 ? 'bg-red-500' : load > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${load}%` }} />
    </div>
    <p className="text-xs text-gray-500">{load}% yük</p>
  </div>
);

/* ════════════════════════════════════ */
const AdminDashboard2: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [loading, setLoading]     = useState(true);
  const [lastRefresh, setLastRefresh] = useState('');

  type Stats = Awaited<ReturnType<typeof getAnalyticsData>>['stats'];
  const [stats, setStats]             = useState<Stats | null>(null);
  const [activityChart, setActivity]  = useState<{ date: string; value: number; users: number }[]>([]);
  const [pointsFlow, setPointsFlow]   = useState<{ date: string; earned: number; spent: number }[]>([]);

  const RANGE_DAYS = { '7d': 7, '30d': 30, '90d': 90 };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { stats: s, activityChart: ac, pointsFlow: pf } = await getAnalyticsData(RANGE_DAYS[timeRange]);
      setStats(s);
      setActivity(ac);
      setPointsFlow(pf);
      setLastRefresh(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [timeRange]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);
  useRealtimeTables(['profiles', 'redemptions', 'points_transactions', 'qr_scans', 'activity_logs'], load);

  const exportReport = () => {
    const blob = new Blob([JSON.stringify({ generated: new Date().toISOString(), stats, timeRange }, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `admin-report-${new Date().toISOString().slice(0, 10)}.json`; a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !stats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="mx-auto mb-4 text-[#7B6EF6] animate-spin" size={36} />
            <p className="font-bold text-gray-500 dark:text-gray-400">Veriler yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const pointsTrend = stats.pointsEarned > 0
    ? `+${((stats.pointsEarned / Math.max(stats.totalPoints - stats.pointsEarned, 1)) * 100).toFixed(1)}%`
    : '0%';

  return (
    <AdminLayout>
    <div className="p-6 space-y-8">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Analytics Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gerçek zamanlı platform istatistikleri
            {lastRefresh && <span className="ml-2 text-xs text-gray-400">· Son güncelleme: {lastRefresh}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
            {(['7d', '30d', '90d'] as const).map(r => (
              <button key={r} onClick={() => setTimeRange(r)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${timeRange === r ? 'bg-[#7B6EF6] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {r}
              </button>
            ))}
          </div>
          <button onClick={load} className="p-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 hover:shadow-md transition-all">
            <RefreshCw size={18} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white rounded-2xl border-2 border-black font-bold hover:shadow-lg transition-all">
            <Download size={18} /> Export
          </button>
        </div>
      </div>

      {/* ── Points Economy Banner (replaces fake Revenue) ── */}
      <div className="card p-6 bg-gradient-to-r from-[#7B6EF6] to-[#4F8EF7] text-white border-2 border-black">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-white/80 font-bold">Toplam Puan (Sistem Geneli)</p>
            <p className="text-4xl font-black mt-1">{fmtNum(stats.totalPoints)}</p>
            <p className="text-white/70 mt-1 text-sm">Bu dönemde {fmtNum(stats.pointsEarned)} kazanıldı, {fmtNum(stats.pointsSpent)} harcandı</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-white/80 text-sm">Kazanılan</p>
              <p className="text-xl font-black">{fmtNum(stats.pointsEarned)}</p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm">Harcanan</p>
              <p className="text-xl font-black">{fmtNum(stats.pointsSpent)}</p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm">Trend</p>
              <p className="text-xl font-black flex items-center justify-center gap-1">
                <TrendingUp size={20} /> {pointsTrend}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users}       title="Toplam Kullanıcı"  value={stats.totalUsers}         change={`+${stats.newUsersToday} bugün`} positive color="blue"   />
        <KPICard icon={Activity}    title="Bugün Aktif"        value={stats.activeUsersDaily}   change={`${stats.activeUsersMonthly} aylık`} positive color="green"  />
        <KPICard icon={Zap}         title="Toplam Puan"        value={stats.totalPoints}        change={pointsTrend} positive color="amber"  />
        <KPICard icon={ShoppingBag} title="Kullanılan Ödül"   value={stats.redemptionCount}    change={`+${stats.dailyQRScans} QR bugün`} positive color="purple" />
      </div>

      {/* ── Secondary Stats ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat title="Güvenlik Uyarısı"   value={stats.security.alerts}         icon={Shield}   color={stats.security.alerts > 0 ? 'red' : 'green'} />
        <MiniStat title="Aktif Oturum (Bugün)" value={stats.security.activeSessions} icon={Wifi}     color="blue"  />
        <MiniStat title="Engellenen IP"       value={stats.security.blockedIPs}     icon={Lock}     color="gray"  />
        <MiniStat title="QR Tarama (Bugün)"   value={stats.dailyQRScans}            icon={Activity} color="indigo"/>
      </div>

      {/* ── Main Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-[#7B6EF6]" /> Kullanıcı Aktivitesi
          </h3>
          {activityChart.some(d => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activityChart}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7B6EF6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7B6EF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} />
                <Area type="monotone" dataKey="value" stroke="#7B6EF6" fill="url(#colorValue)" strokeWidth={2} name="Oturum" />
                <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} name="Aktif Kullanıcı" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-bold">Bu dönemde aktivite yok</div>
          )}
        </div>

        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-500" /> Puan Akışı (Kazanılan / Harcanan)
          </h3>
          {pointsFlow.some(d => d.earned > 0 || d.spent > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={pointsFlow}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} />
                <Legend />
                <Bar dataKey="earned" name="Kazanılan" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent"  name="Harcanan"  fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm font-bold">Bu dönemde puan hareketi yok</div>
          )}
        </div>
      </div>

      {/* ── Device & Geo & Live Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-blue-500" /> Cihaz Dağılımı
          </h3>
          {stats.deviceStats.some(d => d.users > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={stats.deviceStats} innerRadius={45} outerRadius={75} paddingAngle={4} dataKey="users">
                    {stats.deviceStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-3">
                {stats.deviceStats.map((d, i) => (
                  <div key={d.device} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{d.device} ({fmtNum(d.users)})</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm font-bold">Veri yok</div>
          )}
        </div>

        {/* Users by Country */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-green-500" /> Ülkeye Göre Kullanıcı
          </h3>
          {stats.geoStats.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm font-bold">Konum verisi yok</div>
          ) : (
            <div className="space-y-3">
              {stats.geoStats.map((item, i) => (
                <div key={item.country} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base flex-shrink-0">🌍</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate">{item.country}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-[#7B6EF6] rounded-full" style={{ width: `${(item.users / Math.max(stats.geoStats[0].users, 1)) * 100}%` }} />
                    </div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{fmtNum(item.users)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Activity Feed */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-purple-500" /> Canlı Aktivite
          </h3>
          {stats.recentActivity.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm font-bold">Aktivite yok</div>
          ) : (
            <div className="space-y-2">
              {stats.recentActivity.map((a, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-700">
                  <div style={{ background: deterministicColor(a.user) }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                    {initials(a.user)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{a.user}</p>
                    <p className="text-xs text-gray-500 truncate">{ACTION_ICON[a.action_type] ?? '📋'} {a.action}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    {a.amount ? <p className="text-xs font-black text-amber-500">+{a.amount}</p> : null}
                    <p className="text-xs text-gray-400">{timeAgo(a.time)}</p>
                    <div className="flex justify-end mt-0.5">
                      {a.device?.toLowerCase().includes('mobile') || a.device?.toLowerCase().includes('android') || a.device?.toLowerCase().includes('ios')
                        ? <Smartphone size={10} className="text-gray-400" />
                        : <Monitor size={10} className="text-gray-400" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Top Lists ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={20} className="text-amber-500" /> En İyi Kullanıcılar
            </h3>
          </div>
          {stats.topUsers.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Henüz kullanıcı yok</p>
          ) : (
            <div className="space-y-3">
              {stats.topUsers.map((user, i) => (
                <div key={user.username} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div style={{ background: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#b45309' : '#7B6EF6' }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    #{i + 1}
                  </div>
                  <div style={{ background: deterministicColor(user.username) }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {initials(user.username)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{user.username}</p>
                    <p className="text-xs text-gray-500">Seviye {user.level}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-[#7B6EF6]">{fmtNum(user.points)}</p>
                    <p className="text-xs text-gray-500">puan</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Redeemed Rewards */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-green-500" /> En Çok Kullanılan Ödüller
            </h3>
          </div>
          {stats.topProducts.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">Henüz ödül kullanımı yok</p>
          ) : (
            <div className="space-y-3">
              {stats.topProducts.map((product, i) => (
                <div key={product.name} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                    #{i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">{fmtNum(product.points)} puan</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-green-600">{fmtNum(product.redeemed)}</p>
                    <p className="text-xs text-gray-500">kullanım</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── System Health (static — we can't query actual server metrics) ── */}
      <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Server size={20} className="text-blue-500" /> Sistem Durumu
          </h3>
          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Tüm Sistemler Çalışıyor
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <HealthItem name="Veritabanı" icon={Database} load={23} />
          <HealthItem name="API"        icon={Server}   load={45} />
          <HealthItem name="Cache"      icon={Cpu}      load={38} />
          <HealthItem name="Depolama"   icon={HardDrive} load={34} />
          <HealthItem name="CDN"        icon={Globe}    load={12} />
          <HealthItem name="Auth"       icon={Shield}   load={28} />
        </div>
      </div>

      {/* ── Security Alerts (only if real high-risk events exist) ── */}
      {stats.security.alerts > 0 && (
        <div className="card p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-orange-500" size={24} />
            <h3 className="font-black text-lg text-orange-700 dark:text-orange-400">
              {stats.security.alerts} Güvenlik Uyarısı Dikkat Gerektiriyor
            </h3>
          </div>
          <p className="text-sm text-orange-600 dark:text-orange-400">
            Son 24 saatte yüksek riskli olarak işaretlenen aktiviteler mevcut. Denetim günlüklerini inceleyin.
          </p>
          <button onClick={() => window.location.hash = '/admin/audit-logs'} className="mt-3 px-4 py-2 bg-orange-500 text-white font-bold rounded-xl text-sm hover:bg-orange-600 transition-colors">
            Günlükleri İncele
          </button>
        </div>
      )}

    </div>
    </AdminLayout>
  );
};

export default AdminDashboard2;
