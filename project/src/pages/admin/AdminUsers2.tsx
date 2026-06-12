import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Eye, Lock, TrendingUp, Zap, Mail, Shield, Globe, Smartphone,
  Monitor, MapPin, Clock, AlertTriangle, UserCheck, UserX, Key, Send,
  Ban, Unlock, DollarSign, Activity, Star, Download, RefreshCw,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import {
  getAllUsersUnpaged, suspendUser, activateUser, deleteUser,
  adminAddPoints, getUserDetailStats, saveAdminNote, broadcastNotification,
} from '../../services/admin';
import { getActivityLogs } from '../../services/activityLogs';
import { useRealtimeTable } from '../../hooks/useRealtime';
import type { Profile } from '../../services/admin';
import type { ActivityLog } from '../../services/activityLogs';

/* ────────────────────────────────────────────────────────────
   Local types
──────────────────────────────────────────────────────────── */
interface UserTransaction {
  id: string;
  type: 'earned' | 'spent' | 'adjusted' | 'expired';
  amount: number;
  description: string;
  date: string;
  category: string | null;
}

interface EnrichedUser extends Profile {
  achievementsCount: number;
  missionsCount: number;
  qrScansCount: number;
  redemptionsCount: number;
  riskScore: number;
  transactions: UserTransaction[];
  activityLogs: ActivityLog[];
  detailLoaded: boolean;
}

/* ────────────────────────────────────────────────────────────
   Helpers
──────────────────────────────────────────────────────────── */
function toEnriched(p: Profile): EnrichedUser {
  return {
    ...p,
    achievementsCount: 0,
    missionsCount: 0,
    qrScansCount: 0,
    redemptionsCount: 0,
    riskScore: 0,
    transactions: [],
    activityLogs: [],
    detailLoaded: false,
  };
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return 'Şimdi';
  if (mins < 60) return `${mins} dk önce`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} sa önce`;
  return `${Math.floor(hrs / 24)} gün önce`;
}

const statusColor: Record<string, string> = {
  active:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  suspended: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  deleted:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};

function riskLevel(score: number) {
  if (score >= 5)  return { label: 'HIGH',   color: 'text-red-500',    bg: 'bg-red-100 dark:bg-red-900/30' };
  if (score >= 2)  return { label: 'MED',    color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
  return             { label: 'LOW',    color: 'text-green-500',  bg: 'bg-green-100 dark:bg-green-900/30' };
}

/* ────────────────────────────────────────────────────────────
   Component
──────────────────────────────────────────────────────────── */
const AdminUsers2: React.FC = () => {
  const [users,         setUsers]         = useState<EnrichedUser[]>([]);
  const [filtered,      setFiltered]      = useState<EnrichedUser[]>([]);
  const [search,        setSearch]        = useState('');
  const [filterStatus,  setFilterStatus]  = useState('all');
  const [sortBy,        setSortBy]        = useState('updated_at');
  const [loading,       setLoading]       = useState(true);
  const [selected,      setSelected]      = useState<EnrichedUser | null>(null);
  const [tab,           setTab]           = useState<'overview'|'sessions'|'transactions'|'activity'|'actions'>('overview');
  const [pointAmt,      setPointAmt]      = useState(0);
  const [pointReason,   setPointReason]   = useState('');
  const [note,          setNote]          = useState('');
  const [notifText,     setNotifText]     = useState('');
  const [working,       setWorking]       = useState(false);
  const [feedback,      setFeedback]      = useState('');

  /* ── load all users ─────────────────────────────────────── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = await getAllUsersUnpaged(search || undefined);
      setUsers(profiles.map(toEnriched));
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { load(); }, [load]);
  useRealtimeTable('profiles', load);

  /* ── filter + sort ──────────────────────────────────────── */
  useEffect(() => {
    let list = [...users];
    if (filterStatus !== 'all') list = list.filter(u => u.status === filterStatus);
    list.sort((a, b) => {
      if (sortBy === 'total_points')  return b.total_points - a.total_points;
      if (sortBy === 'level')         return b.level - a.level;
      if (sortBy === 'created_at')    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    setFiltered(list);
  }, [users, filterStatus, sortBy]);

  /* ── load detail for selected user ─────────────────────── */
  const loadDetail = useCallback(async (user: EnrichedUser) => {
    if (user.detailLoaded) { setSelected(user); return; }
    setSelected(user);

    const [txRes, logsRes, stats] = await Promise.all([
      supabase.from('points_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      getActivityLogs({ userId: user.id, pageSize: 50 }),
      getUserDetailStats(user.id),
    ]);

    const transactions: UserTransaction[] = (txRes.data ?? []).map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      description: t.description,
      date: relativeTime(t.created_at),
      category: t.category,
    }));

    const enriched: EnrichedUser = {
      ...user,
      ...stats,
      riskScore: stats.highRiskLogs,
      transactions,
      activityLogs: logsRes,
      detailLoaded: true,
    };
    setSelected(enriched);
    setUsers(prev => prev.map(u => u.id === enriched.id ? enriched : u));
    setNote(enriched.bio ?? '');
  }, []);

  /* ── actions ────────────────────────────────────────────── */
  const toast = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

  const doStatus = async (userId: string, status: 'active' | 'suspended' | 'deleted') => {
    setWorking(true);
    try {
      if (status === 'active')    await activateUser(userId);
      else if (status === 'suspended') await suspendUser(userId);
      else                        await deleteUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
      setSelected(prev => prev?.id === userId ? { ...prev, status } : prev);
      toast(`Status updated to ${status}`);
    } catch { toast('Failed to update status'); }
    finally { setWorking(false); }
  };

  const doAdjustPoints = async () => {
    if (!selected || pointAmt === 0 || !pointReason.trim()) { toast('Amount and reason required'); return; }
    setWorking(true);
    try {
      await adminAddPoints(selected.id, pointAmt, pointReason);
      const newPts = Math.max(0, selected.current_points + pointAmt);
      const newTotal = selected.total_points + (pointAmt > 0 ? pointAmt : 0);
      const updated = { ...selected, current_points: newPts, total_points: newTotal };
      setSelected(updated);
      setUsers(prev => prev.map(u => u.id === selected.id ? updated : u));
      setPointAmt(0); setPointReason('');
      toast(`${pointAmt > 0 ? '+' : ''}${pointAmt} points applied`);
    } catch { toast('Failed to adjust points'); }
    finally { setWorking(false); }
  };

  const doResetPassword = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(selected.email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });
      if (error) throw error;
      toast('Password reset email sent!');
    } catch { toast('Failed to send reset email'); }
    finally { setWorking(false); }
  };

  const doSendNotification = async () => {
    if (!selected || !notifText.trim()) { toast('Notification text required'); return; }
    setWorking(true);
    try {
      await broadcastNotification({
        type: 'system', title: 'Admin Mesajı',
        message: notifText, icon: '📨',
        userIds: [selected.id],
      });
      setNotifText('');
      toast('Notification sent!');
    } catch { toast('Failed to send notification'); }
    finally { setWorking(false); }
  };

  const doSaveNote = async () => {
    if (!selected) return;
    setWorking(true);
    try {
      await saveAdminNote(selected.id, note);
      setSelected(prev => prev ? { ...prev, bio: note } : prev);
      toast('Note saved');
    } catch { toast('Failed to save note'); }
    finally { setWorking(false); }
  };

  const exportCSV = () => {
    const rows = [
      ['ID','Username','Email','Phone','Level','Current Points','Total Points','Status','Role','Streak','Joined','Last Active'],
      ...filtered.map(u => [u.id, u.username ?? '', u.email, u.phone ?? '', u.level, u.current_points, u.total_points, u.status, u.role, u.streak, u.created_at, u.updated_at]),
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([rows], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `users-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ── stats ──────────────────────────────────────────────── */
  const stats = {
    total:    users.length,
    active:   users.filter(u => u.status === 'active').length,
    suspended:users.filter(u => u.status === 'suspended').length,
    deleted:  users.filter(u => u.status === 'deleted').length,
  };

  /* ── render ─────────────────────────────────────────────── */
  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold">Kullanıcılar yükleniyor…</p>
        </div>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">

      {/* ── Toast ── */}
      {feedback && (
        <div className="fixed top-4 right-4 z-[200] bg-[#7B6EF6] text-white px-4 py-2 rounded-xl font-bold shadow-lg">
          {feedback}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Shield className="text-[#7B6EF6]" size={24} />
            User Management V2
          </h1>
          <p className="text-sm text-gray-500 mt-1">Full database — manage users, points, status & notifications</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl border-2 border-gray-300 dark:border-gray-600 font-bold text-sm hover:bg-gray-200 transition-all">
            <Download size={16} /> Export
          </button>
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 bg-[#7B6EF6] text-white rounded-2xl border-2 border-black font-bold text-sm hover:shadow-lg transition-all">
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users',     val: stats.total,     color: 'text-gray-900 dark:text-white' },
          { label: 'Active',          val: stats.active,    color: 'text-green-600' },
          { label: 'Suspended',       val: stats.suspended, color: 'text-yellow-600' },
          { label: 'Deleted/Banned',  val: stats.deleted,   color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by username or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="flex-1 min-w-[120px] px-3 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="deleted">Deleted/Banned</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-1 min-w-[130px] px-3 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm">
            <option value="updated_at">Last Active</option>
            <option value="total_points">Points</option>
            <option value="level">Level</option>
            <option value="created_at">Join Date</option>
          </select>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b-2 border-black dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-2 px-2 font-black text-xs">User</th>
                <th className="text-left py-2 px-2 font-black text-xs">Lv</th>
                <th className="text-left py-2 px-2 font-black text-xs">Points</th>
                <th className="text-left py-2 px-2 font-black text-xs">Status</th>
                <th className="text-left py-2 px-2 font-black text-xs hidden sm:table-cell">Role</th>
                <th className="text-left py-2 px-2 font-black text-xs hidden md:table-cell">Streak</th>
                <th className="text-left py-2 px-2 font-black text-xs hidden md:table-cell">Joined</th>
                <th className="text-left py-2 px-2 font-black text-xs">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      {user.avatar_url
                        ? <img src={user.avatar_url} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />
                        : <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] flex items-center justify-center text-white font-black text-xs flex-shrink-0">{(user.username ?? user.email).charAt(0).toUpperCase()}</div>
                      }
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-xs truncate">{user.username ?? '—'}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-2 px-2"><span className="font-bold text-[#7B6EF6] text-xs">Lv.{user.level}</span></td>
                  <td className="py-2 px-2">
                    <p className="font-bold text-amber-600 text-xs">{user.current_points.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">/{user.total_points.toLocaleString()}</p>
                  </td>
                  <td className="py-2 px-2">
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${statusColor[user.status] ?? 'bg-gray-100 text-gray-600'}`}>{user.status.toUpperCase()}</span>
                  </td>
                  <td className="py-2 px-2 hidden sm:table-cell">
                    <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${user.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : user.role === 'store_admin' ? 'bg-amber-100 text-amber-700' : user.role === 'cashier' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{user.role.replace('_', ' ').toUpperCase()}</span>
                  </td>
                  <td className="py-2 px-2 hidden md:table-cell">
                    <span className="text-xs font-bold text-orange-500">🔥 {user.streak}</span>
                  </td>
                  <td className="py-2 px-2 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                  </td>
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-0.5">
                      <button onClick={() => { loadDetail(user); setTab('overview'); }} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Details">
                        <Eye size={14} />
                      </button>
                      <button onClick={() => doResetPasswordFromRow(user.email)} className="p-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600" title="Reset Password">
                        <Key size={14} />
                      </button>
                      <button onClick={() => doStatus(user.id, user.status === 'suspended' || user.status === 'deleted' ? 'active' : 'suspended')} className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title={user.status === 'active' ? 'Suspend' : 'Activate'}>
                        {user.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                      </button>
                      <button onClick={() => { if (window.confirm('Ban this user permanently?')) doStatus(user.id, 'deleted'); }} className="p-1.5 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700" title="Ban">
                        <Ban size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="text-center py-12 text-gray-500">No users found</div>}
      </div>

      {/* ── Detail Modal ── */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-black dark:border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">

            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {selected.avatar_url
                  ? <img src={selected.avatar_url} className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] flex items-center justify-center text-white font-black text-xl flex-shrink-0">{(selected.username ?? selected.email).charAt(0).toUpperCase()}</div>
                }
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white truncate">{selected.username ?? selected.email}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{selected.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${statusColor[selected.status] ?? 'bg-gray-100 text-gray-600'}`}>{selected.status.toUpperCase()}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selected.role === 'super_admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{selected.role.replace('_', ' ').toUpperCase()}</span>
                    <span className="text-xs text-gray-500">Lv.{selected.level}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="text-2xl text-gray-400 hover:text-gray-600 flex-shrink-0">&times;</button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex overflow-x-auto">
              {(['overview','sessions','transactions','activity','actions'] as const).map(t => (
                <button key={t} onClick={() => setTab(t)} className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${tab === t ? 'border-[#7B6EF6] text-[#7B6EF6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">

              {/* OVERVIEW */}
              {tab === 'overview' && (
                <>
                  {selected.riskScore >= 5 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle size={20} />
                        <span className="font-bold">HIGH RISK USER — {selected.riskScore} high-risk activity logs</span>
                      </div>
                    </div>
                  )}

                  {/* Identity */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Shield size={18}/> Identity</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">User ID</p>
                        <code className="text-xs text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded block truncate">{selected.id}</code>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-bold">{selected.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-bold">{selected.phone ?? 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Username</p>
                        <p className="text-sm font-bold">{selected.username ?? '—'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Points & Stats */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Zap size={18}/> Points & Activity</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                        <p className="text-2xl font-black text-amber-600">{selected.current_points.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Current Points</p>
                      </div>
                      <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <p className="text-2xl font-black text-green-600">{selected.total_points.toLocaleString()}</p>
                        <p className="text-xs text-gray-500">Lifetime Earned</p>
                      </div>
                      <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <p className="text-2xl font-black text-blue-600">{selected.achievementsCount}</p>
                        <p className="text-xs text-gray-500">Achievements</p>
                      </div>
                      <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <p className="text-2xl font-black text-purple-600">{selected.streak}</p>
                        <p className="text-xs text-gray-500">Day Streak</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{selected.qrScansCount}</p><p className="text-xs text-gray-500">QR Scans</p></div>
                      <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{selected.missionsCount}</p><p className="text-xs text-gray-500">Missions Done</p></div>
                      <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{selected.redemptionsCount}</p><p className="text-xs text-gray-500">Redemptions</p></div>
                    </div>
                  </div>

                  {/* Risk */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4">
                    <h3 className="font-bold flex items-center gap-2 mb-3"><AlertTriangle size={18}/> Risk Assessment</h3>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full font-black text-sm ${riskLevel(selected.riskScore).bg} ${riskLevel(selected.riskScore).color}`}>
                        {riskLevel(selected.riskScore).label} RISK
                      </div>
                      <p className="text-sm text-gray-500">{selected.riskScore} high-risk events logged</p>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4">
                    <h3 className="font-bold flex items-center gap-2 mb-3"><Globe size={18}/> Account Info</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div><p className="text-xs text-gray-500">Joined</p><p className="text-sm font-bold">{new Date(selected.created_at).toLocaleString('tr-TR')}</p></div>
                      <div><p className="text-xs text-gray-500">Last Active</p><p className="text-sm font-bold">{relativeTime(selected.updated_at)}</p></div>
                      <div><p className="text-xs text-gray-500">XP</p><p className="text-sm font-bold">{selected.xp} / {selected.xp_to_next}</p></div>
                    </div>
                  </div>
                </>
              )}

              {/* SESSIONS — show latest activity_logs as session proxies */}
              {tab === 'sessions' && (
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><Monitor size={18}/> Recent Login Activity ({selected.activityLogs.filter(l => l.action_type === 'login').length})</h3>
                  {!selected.detailLoaded ? (
                    <div className="text-center py-8 text-gray-500">Loading…</div>
                  ) : selected.activityLogs.filter(l => l.action_type === 'login').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No login sessions recorded</div>
                  ) : (
                    <div className="space-y-3">
                      {selected.activityLogs.filter(l => l.action_type === 'login').map(log => (
                        <div key={log.id} className={`p-4 rounded-2xl border-2 ${log.risk_level === 'high' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              {log.device_type === 'mobile' ? <Smartphone size={24} className="text-gray-400" /> : <Monitor size={24} className="text-gray-400" />}
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{log.device_name ?? log.device_type ?? 'Unknown Device'}</p>
                                <p className="text-sm text-gray-500">{log.browser ?? '—'} on {log.os ?? '—'}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 flex-wrap">
                                  {log.city && <span className="flex items-center gap-1"><MapPin size={12}/>{log.city}, {log.country ?? '?'}</span>}
                                  {log.ip_address && <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{log.ip_address}</code>}
                                  <span className="flex items-center gap-1"><Clock size={12}/>{relativeTime(log.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            {log.risk_level === 'high' && (
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-bold flex items-center gap-1">
                                <AlertTriangle size={12}/> HIGH RISK
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TRANSACTIONS */}
              {tab === 'transactions' && (
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><DollarSign size={18}/> Points Transactions ({selected.transactions.length})</h3>
                  {!selected.detailLoaded ? (
                    <div className="text-center py-8 text-gray-500">Loading…</div>
                  ) : selected.transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No transactions yet</div>
                  ) : (
                    <div className="space-y-2">
                      {selected.transactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{tx.description}</p>
                            <p className="text-xs text-gray-500">{tx.date} • {tx.category ?? tx.type}</p>
                          </div>
                          <span className={`font-black ${tx.type === 'earned' || tx.type === 'adjusted' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'spent' || tx.type === 'expired' ? '-' : '+'}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ACTIVITY */}
              {tab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2"><Activity size={18}/> Activity Logs ({selected.activityLogs.length})</h3>
                  {!selected.detailLoaded ? (
                    <div className="text-center py-8 text-gray-500">Loading…</div>
                  ) : selected.activityLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No activity recorded</div>
                  ) : (
                    <div className="space-y-3">
                      {selected.activityLogs.map(log => {
                        const isHigh = log.risk_level === 'high';
                        const isMed  = log.risk_level === 'medium';
                        return (
                          <div key={log.id} className={`flex items-start gap-4 p-4 rounded-xl ${isHigh ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : isMed ? 'bg-yellow-50 dark:bg-yellow-900/20' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${isHigh ? 'bg-red-100 text-red-600' : isMed ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}>
                              <Activity size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-900 dark:text-white text-sm">{log.action}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{log.action_type} • {relativeTime(log.created_at)}</p>
                              {log.ip_address && <p className="text-xs text-gray-400 mt-0.5">{log.ip_address} {log.city ? `• ${log.city}` : ''}</p>}
                            </div>
                            {isHigh && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-bold flex-shrink-0">HIGH RISK</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ACTIONS */}
              {tab === 'actions' && (
                <div className="space-y-6">

                  {/* Adjust Points */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Zap size={18}/> Adjust Points</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input type="number" placeholder="Amount (+/-)" value={pointAmt || ''} onChange={e => setPointAmt(parseInt(e.target.value) || 0)} className="px-4 py-2 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                      <input type="text" placeholder="Reason" value={pointReason} onChange={e => setPointReason(e.target.value)} className="px-4 py-2 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                      <button onClick={doAdjustPoints} disabled={working} className="px-4 py-2 bg-[#7B6EF6] text-white font-bold rounded-xl hover:bg-[#6B5EE6] disabled:opacity-50">
                        {working ? '…' : 'Apply'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Current balance: <strong>{selected.current_points.toLocaleString()}</strong> pts</p>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Shield size={18}/> Account Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button onClick={() => doStatus(selected.id, 'active')} disabled={working} className="px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded-xl hover:bg-green-200 disabled:opacity-50">
                        <UserCheck size={18} className="inline mr-2"/>Activate
                      </button>
                      <button onClick={() => doStatus(selected.id, 'suspended')} disabled={working} className="px-4 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-bold rounded-xl hover:bg-yellow-200 disabled:opacity-50">
                        <Lock size={18} className="inline mr-2"/>Suspend
                      </button>
                      <button onClick={() => { if (window.confirm('Ban permanently?')) doStatus(selected.id, 'deleted'); }} disabled={working} className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 disabled:opacity-50">
                        <Ban size={18} className="inline mr-2"/>Ban
                      </button>
                      <button onClick={doResetPassword} disabled={working} className="px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 disabled:opacity-50">
                        <Key size={18} className="inline mr-2"/>Reset Password
                      </button>
                    </div>
                  </div>

                  {/* Send Notification */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Mail size={18}/> Send Notification</h3>
                    <div className="flex gap-3">
                      <input type="text" placeholder="Notification message…" value={notifText} onChange={e => setNotifText(e.target.value)} className="flex-1 px-4 py-2 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                      <button onClick={doSendNotification} disabled={working} className="px-4 py-2 bg-[#7B6EF6] text-white font-bold rounded-xl hover:bg-[#6B5EE6] disabled:opacity-50">
                        <Send size={18} className="inline mr-1"/>Send
                      </button>
                    </div>
                  </div>

                  {/* Admin Notes (stored in bio) */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold flex items-center gap-2"><Star size={18}/> Admin Notes</h3>
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Notes about this user…" className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none h-24" />
                    <button onClick={doSaveNote} disabled={working} className="px-4 py-2 bg-[#7B6EF6] text-white font-bold rounded-xl disabled:opacity-50">
                      {working ? 'Saving…' : 'Save Note'}
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
    </AdminLayout>
  );

  // helper used in table row (no closure issue because it has its own arg)
  async function doResetPasswordFromRow(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#/reset-password`,
      });
      if (error) throw error;
      toast('Password reset email sent!');
    } catch { toast('Failed to send reset email'); }
  }
};

export default AdminUsers2;
