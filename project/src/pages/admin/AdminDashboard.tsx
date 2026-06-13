import React, { useEffect, useState, useCallback } from 'react';
import {
  Users, Gift, Star, QrCode, Activity, UserPlus,
  Gamepad2, ArrowUp, ArrowDown, Trophy, Zap, Calendar,
  ChevronRight, RefreshCw, Loader,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts';
import {
  getDashboardStatsEnhanced,
  getWeeklyActivity,
  getRecentUsers,
  getRecentActivity,
  getDashboardExtras,
} from '../../services/admin';
import { useRealtimeTables } from '../../hooks/useRealtime';
import AdminLayout from './AdminLayout';

/* ── Helpers ── */
function fmtNum(n: number) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}
function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60)   return 'az önce';
  if (s < 3600) return Math.floor(s / 60) + 'dk';
  if (s < 86400)return Math.floor(s / 3600) + 'sa';
  return Math.floor(s / 86400) + 'g';
}
function userInitial(name: string) { return (name ?? '?').charAt(0).toUpperCase(); }
function deterministic(str: string) {
  const palettes = ['#7B6EF6','#22c55e','#f59e0b','#3b82f6','#ef4444','#06b6d4','#ec4899'];
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) & 0xffffff;
  return palettes[Math.abs(h) % palettes.length];
}

const ACTION_COLORS: Record<string, { bg: string; color: string; label: string; icon: string }> = {
  login:            { bg: 'rgba(34,197,94,0.12)',   color: '#22c55e', label: 'Giriş',     icon: '🔐' },
  logout:           { bg: 'rgba(99,102,241,0.12)',  color: '#6366f1', label: 'Çıkış',     icon: '🚪' },
  points_earned:    { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', label: 'Puan',       icon: '⭐' },
  points_spent:     { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'Harcama',   icon: '💸' },
  purchase:         { bg: 'rgba(123,110,246,0.12)', color: '#7B6EF6', label: 'Alım',       icon: '🛍️' },
  achievement:      { bg: 'rgba(245,158,11,0.12)',  color: '#f59e0b', label: 'Başarı',    icon: '🏆' },
  mission:          { bg: 'rgba(6,182,212,0.12)',   color: '#06b6d4', label: 'Görev',     icon: '🎯' },
  qr_scan:          { bg: 'rgba(59,130,246,0.12)',  color: '#3b82f6', label: 'QR',        icon: '📷' },
  admin_action:     { bg: 'rgba(239,68,68,0.12)',   color: '#ef4444', label: 'Admin',     icon: '⚙️' },
  security_alert:   { bg: 'rgba(239,68,68,0.18)',   color: '#dc2626', label: 'Güvenlik',  icon: '🚨' },
  profile_update:   { bg: 'rgba(107,114,128,0.12)', color: '#9ca3af', label: 'Profil',    icon: '✏️' },
};

/* ── Stat Card ── */
const StatCard: React.FC<{
  label: string; value: string; sub?: string;
  up?: boolean; change?: string;
  icon: React.ElementType; color: string; bg: string;
  onClick?: () => void;
}> = ({ label, value, sub, up, change, icon: Icon, color, bg, onClick }) => (
  <div className={`card p-5 ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`} onClick={onClick}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center flex-shrink-0`}>
        <Icon size={18} className={color} />
      </div>
      {change !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-green-500' : 'text-red-500'}`}>
          {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
          {change}
        </div>
      )}
    </div>
    <p className="font-black text-2xl text-gray-900 dark:text-white leading-none mb-1">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
    {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

/* ── Custom tooltip for chart ── */
const ChartTip = ({ active, payload, label }: {active?: boolean; payload?: {value: number; name: string}[]; label?: string}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-xl p-2 text-xs shadow-lg">
      <p className="font-black text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.name === 'points' ? '#7B6EF6' : '#06b6d4' }}>
          {p.name === 'points' ? '⭐' : '📷'} {p.value.toLocaleString()}
        </p>
      ))}
    </div>
  );
};

/* ════════════════════════════════════════════════════════════ */
const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats,     setStats]     = useState({ totalUsers: 0, activeToday: 0, totalRedemptions: 0, totalPointsIssued: 0, qrScansToday: 0, newUsersToday: 0 });
  const [extras,    setExtras]    = useState({ activeRewards: 0, activeMissions: 0, activeEvents: 0, totalQRCodes: 0 });
  const [weekly,    setWeekly]    = useState<{ day: string; points: number; scans: number }[]>([]);
  const [recentUsers, setRecentUsers] = useState<{id:string;username:string;email:string;avatar_url:string|null;role:string;status:string;total_points:number;created_at:string}[]>([]);
  const [recentAct, setRecentAct] = useState<{id:string;username:string;action:string;action_type:string;amount:number|null;risk_level:string|null;created_at:string}[]>([]);
  const [loading,   setLoading]   = useState(true);

  const load = useCallback(async () => {
    try {
      const [s, e, w, ru, ra] = await Promise.all([
        getDashboardStatsEnhanced(),
        getDashboardExtras(),
        getWeeklyActivity(),
        getRecentUsers(6),
        getRecentActivity(8),
      ]);
      setStats(s);
      setExtras(e);
      setWeekly(w);
      setRecentUsers(ru as typeof recentUsers);
      setRecentAct(ra as typeof recentAct);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { load(); }, [load]);
  useRealtimeTables(['profiles', 'redemptions', 'points_transactions', 'qr_scans', 'activity_logs'], load);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Loader className="mx-auto mb-3 text-[#7B6EF6] animate-spin" size={32} />
            <p className="font-bold text-gray-500 dark:text-gray-400">Yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">NexReward</p>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Genel Bakış</h1>
          </div>
          <button onClick={load} className="flex items-center gap-2 px-4 py-2 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:shadow-md transition-all">
            <RefreshCw size={14} />
            Yenile
          </button>
        </div>

        {/* ── KPI cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Toplam Kullanıcı"  value={fmtNum(stats.totalUsers)}          icon={Users}    color="text-blue-500"     bg="bg-blue-100 dark:bg-blue-900/30"       onClick={() => navigate('/admin/users')} />
          <StatCard label="Bugün Aktif"        value={fmtNum(stats.activeToday)}          icon={Activity} color="text-green-500"    bg="bg-green-100 dark:bg-green-900/30"     sub="oturumlar" />
          <StatCard label="Toplam Puan"        value={fmtNum(stats.totalPointsIssued)}    icon={Star}     color="text-amber-500"    bg="bg-amber-100 dark:bg-amber-900/30"     sub="kazanılan" />
          <StatCard label="Ödül Kullanımı"     value={fmtNum(stats.totalRedemptions)}     icon={Gift}     color="text-[#7B6EF6]"   bg="bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20" onClick={() => navigate('/admin/rewards')} />
          <StatCard label="Bugün QR Tarama"   value={fmtNum(stats.qrScansToday)}          icon={QrCode}   color="text-cyan-500"     bg="bg-cyan-100 dark:bg-cyan-900/30"       sub="tarama" />
          <StatCard label="Bugün Yeni Kayıt"  value={fmtNum(stats.newUsersToday)}         icon={UserPlus} color="text-purple-500"   bg="bg-purple-100 dark:bg-purple-900/30"   sub="kullanıcı" />
        </div>

        {/* ── Extra KPIs ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Aktif Ödüller',  val: extras.activeRewards,  icon: Gift,     color: '#7B6EF6', path: '/admin/rewards'  },
            { label: 'Aktif Görevler', val: extras.activeMissions, icon: Zap,      color: '#06b6d4', path: '/admin/games'   },
            { label: 'Aktif Etkinlik', val: extras.activeEvents,   icon: Calendar, color: '#f59e0b', path: '/admin/events'  },
            { label: 'Aktif QR Kod',   val: extras.totalQRCodes,   icon: QrCode,   color: '#22c55e', path: '/admin/qr'      },
          ].map(s => (
            <div key={s.label} onClick={() => navigate(s.path)} className="card p-4 cursor-pointer hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <s.icon size={18} style={{ color: s.color }} />
                <ChevronRight size={14} className="text-gray-400" />
              </div>
              <p className="font-black text-xl text-gray-900 dark:text-white mt-2">{fmtNum(s.val)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Charts row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Weekly activity chart */}
          <div className="card p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 dark:text-white">Bu Hafta Aktivitesi</h3>
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#7B6EF6] inline-block" />Puan</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />QR</span>
              </div>
            </div>
            {weekly.length > 0 ? (
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={36} />
                  <Tooltip content={<ChartTip />} />
                  <Line type="monotone" dataKey="points" stroke="#7B6EF6" strokeWidth={2.5} dot={false} name="points" />
                  <Line type="monotone" dataKey="scans"  stroke="#06b6d4" strokeWidth={2}   dot={false} name="scans"  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-36 text-gray-400 text-sm font-bold">Bu hafta veri yok</div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card p-5">
            <h3 className="font-black text-gray-900 dark:text-white mb-4">Bugün Özet</h3>
            <div className="space-y-3">
              {[
                { label: 'QR Tarama',    value: stats.qrScansToday,   icon: QrCode,   color: 'text-cyan-500'   },
                { label: 'Yeni Kayıt',   value: stats.newUsersToday,  icon: UserPlus, color: 'text-purple-500' },
                { label: 'Aktif Ödüller',value: extras.activeRewards, icon: Gift,     color: 'text-[#7B6EF6]' },
                { label: 'Aktif Görev',  value: extras.activeMissions,icon: Gamepad2, color: 'text-amber-500'  },
                { label: 'Etkinlik',     value: extras.activeEvents,  icon: Trophy,   color: 'text-green-500'  },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-2">
                    <s.icon size={14} className={`${s.color} flex-shrink-0`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{s.label}</span>
                  </div>
                  <span className="font-black text-sm text-gray-900 dark:text-white">{fmtNum(s.value)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Weekly bar chart ── */}
        {weekly.some(d => d.points > 0) && (
          <div className="card p-5">
            <h3 className="font-black text-gray-900 dark:text-white mb-4">Haftalık Puan Dağılımı</h3>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={weekly} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700 }} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="points" fill="#7B6EF6" radius={[6, 6, 0, 0]} name="points" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent Users */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 dark:text-white">Son Kayıtlar</h3>
              <button onClick={() => navigate('/admin/users')} className="text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7] flex items-center gap-1">
                Tümü <ChevronRight size={14} />
              </button>
            </div>
            {recentUsers.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">Henüz kullanıcı yok</p>
            ) : (
              <div className="space-y-2">
                {recentUsers.map(u => (
                  <div key={u.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer" onClick={() => navigate('/admin/users')}>
                    <div style={{ background: deterministic(u.username ?? '') }} className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                      {u.avatar_url ? (
                        <img src={u.avatar_url} alt={u.username} className="w-8 h-8 rounded-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                      ) : userInitial(u.username ?? '')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{u.username}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs font-black text-amber-500">⭐ {fmtNum(u.total_points ?? 0)}</p>
                      <p className="text-xs text-gray-400">{timeAgo(u.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity Feed */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 dark:text-white">Son Aktiviteler</h3>
              <button onClick={() => navigate('/admin/audit-logs')} className="text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7] flex items-center gap-1">
                Tümü <ChevronRight size={14} />
              </button>
            </div>
            {recentAct.length === 0 ? (
              <p className="text-sm text-gray-400 dark:text-gray-500 py-4 text-center">Henüz aktivite yok</p>
            ) : (
              <div className="space-y-2">
                {recentAct.map(a => {
                  const cfg = ACTION_COLORS[a.action_type] ?? { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', icon: '📋' };
                  return (
                    <div key={a.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <div style={{ background: cfg.bg, color: cfg.color }} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{a.username}</p>
                        <p className="text-xs text-gray-400 truncate">{a.action}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {a.amount ? <p className="text-xs font-black text-amber-500">+{a.amount}</p> : null}
                        {a.risk_level === 'high' && <p className="text-xs font-bold text-red-500">⚠️</p>}
                        <p className="text-xs text-gray-400">{timeAgo(a.created_at)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
