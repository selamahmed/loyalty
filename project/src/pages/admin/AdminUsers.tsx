import React, { useState, useCallback, useEffect } from 'react';
import {
  Search, Eye, Lock, Zap, Mail, Shield, Smartphone, Monitor,
  MapPin, Clock, AlertTriangle, UserCheck, Key, Send, Ban,
  Unlock, Activity, Star, Download, RefreshCw, X, Check,
  ChevronDown, Loader,
} from 'lucide-react';
import NeoAvatar from '../../components/NeoAvatar';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import {
  getAllUsersUnpaged, suspendUser, activateUser, deleteUser,
  adminAddPoints, getUserDetailStats, saveAdminNote,
  broadcastNotification, updateUserRole,
} from '../../services/admin';
import { getActivityLogs } from '../../services/activityLogs';
import { useRealtimeTable } from '../../hooks/useRealtime';
import { useAuth } from '../../context/AuthContext';
import { activityLogService } from '../../lib/activityLogger';
import type { Profile } from '../../services/admin';
import type { ActivityLog } from '../../services/activityLogs';

/* ── Types ── */
type RoleType = 'customer' | 'store_admin' | 'cashier' | 'super_admin';
type StatusFilter = 'all' | 'active' | 'suspended' | 'deleted';
type RoleFilter   = 'all' | RoleType;
type ModalTab     = 'overview' | 'sessions' | 'transactions' | 'activity' | 'actions';

interface UserTx {
  id: string; type: string; amount: number;
  description: string; date: string; category: string | null;
}
interface EnrichedUser extends Profile {
  achievementsCount: number; missionsCount: number;
  qrScansCount: number;    redemptionsCount: number;
  riskScore: number;       transactions: UserTx[];
  activityLogs: ActivityLog[]; detailLoaded: boolean;
}

/* ── Helpers ── */
function toEnriched(p: Profile): EnrichedUser {
  return { ...p, achievementsCount:0, missionsCount:0, qrScansCount:0, redemptionsCount:0, riskScore:0, transactions:[], activityLogs:[], detailLoaded:false };
}
function relTime(iso: string): string {
  const m = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return 'Şimdi'; if (m < 60) return `${m}dk önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}sa önce`;
  return `${Math.floor(h/24)}g önce`;
}
function fmtNum(n: number) { return n >= 1000 ? (n/1000).toFixed(1)+'K' : n.toLocaleString(); }

/* ── Config maps ── */
const ROLE_LABEL: Record<RoleType, string> = { customer:'Müşteri', store_admin:'Mağaza Yön.', cashier:'Kasiyer', super_admin:'Süper Admin' };
const ROLE_COLOR: Record<RoleType, string> = {
  customer:    'bg-gray-100  dark:bg-gray-700  text-gray-600   dark:text-gray-300',
  store_admin: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  cashier:     'bg-blue-100  dark:bg-blue-900/30  text-blue-700  dark:text-blue-400',
  super_admin: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
};
const STATUS_COLOR: Record<string, string> = {
  active:    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
  suspended: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  deleted:   'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
};
const ACTION_ICON: Record<string, string> = {
  login:'🔐', logout:'🚪', points_earned:'⭐', points_spent:'💸',
  purchase:'🛍️', achievement:'🏆', mission:'🎯', qr_scan:'📷',
  admin_action:'⚙️', security_alert:'🚨', profile_update:'✏️',
};
function riskBadge(score: number) {
  if (score >= 5) return { label:'YÜKSEK', cls:'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' };
  if (score >= 2) return { label:'ORTA',   cls:'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' };
  return               { label:'DÜŞÜK',   cls:'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' };
}

/* ══════════════════════════════════════════════════════════════ */
const AdminUsers: React.FC = () => {
  const { authUser: adminUser } = useAuth();
  const [users,        setUsers]       = useState<EnrichedUser[]>([]);
  const [filtered,     setFiltered]    = useState<EnrichedUser[]>([]);
  const [search,       setSearch]      = useState('');
  const [fStatus,      setFStatus]     = useState<StatusFilter>('all');
  const [fRole,        setFRole]       = useState<RoleFilter>('all');
  const [sortBy,       setSortBy]      = useState('updated_at');
  const [loading,      setLoading]     = useState(true);
  const [selected,     setSelected]    = useState<EnrichedUser | null>(null);
  const [tab,          setTab]         = useState<ModalTab>('overview');
  const [pointAmt,     setPointAmt]    = useState(0);
  const [pointReason,  setPointReason] = useState('');
  const [note,         setNote]        = useState('');
  const [notifText,    setNotifText]   = useState('');
  const [working,      setWorking]     = useState(false);
  const [feedback,     setFeedback]    = useState('');
  const [showRoleModal,setShowRoleModal] = useState(false);
  const [newRole,      setNewRole]     = useState<RoleType>('customer');

  /* ── Load ── */
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const profiles = await getAllUsersUnpaged(search || undefined);
      setUsers(profiles.map(toEnriched));
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { load(); }, [load]);
  useRealtimeTable('profiles', load);

  /* ── Filter + sort ── */
  useEffect(() => {
    let list = [...users];
    if (fStatus !== 'all') list = list.filter(u => u.status === fStatus);
    if (fRole   !== 'all') list = list.filter(u => u.role === fRole);
    list.sort((a, b) => {
      if (sortBy === 'total_points') return b.total_points - a.total_points;
      if (sortBy === 'level')        return b.level - a.level;
      if (sortBy === 'created_at')   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
    setFiltered(list);
  }, [users, fStatus, fRole, sortBy]);

  /* ── Load detail ── */
  const loadDetail = useCallback(async (user: EnrichedUser) => {
    setSelected(user); setTab('overview');
    if (user.detailLoaded) return;
    const [txRes, logsRes, stats] = await Promise.all([
      supabase.from('points_transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(30),
      getActivityLogs({ userId: user.id, pageSize: 50 }),
      getUserDetailStats(user.id),
    ]);
    const transactions: UserTx[] = (txRes.data ?? []).map(t => ({
      id: t.id, type: t.type, amount: t.amount, description: t.description,
      date: relTime(t.created_at), category: t.category,
    }));
    const enriched: EnrichedUser = { ...user, ...stats, riskScore: stats.highRiskLogs, transactions, activityLogs: logsRes, detailLoaded: true };
    setSelected(enriched);
    setUsers(prev => prev.map(u => u.id === enriched.id ? enriched : u));
    setNote(enriched.bio ?? '');
  }, []);

  /* ── Toast ── */
  const toast = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

  /* ── Helper: log admin action ── */
  const logAdminAction = (
    actionType: Parameters<typeof activityLogService.logActivity>[0]['actionType'],
    action: string,
    details?: Record<string, unknown>,
    riskLevel: 'low' | 'medium' | 'high' = 'medium',
  ) => {
    if (!adminUser) return;
    void activityLogService.logActivity({
      userId:     adminUser.id,
      username:   adminUser.username ?? adminUser.name ?? adminUser.email,
      email:      adminUser.email,
      role:       adminUser.role,
      action,
      actionType,
      riskLevel,
      details,
    });
  };

  /* ── Actions ── */
  const doStatus = async (userId: string, status: 'active' | 'suspended' | 'deleted') => {
    setWorking(true);
    const target = users.find(u => u.id === userId);
    try {
      if (status === 'active') await activateUser(userId);
      else if (status === 'suspended') await suspendUser(userId);
      else await deleteUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
      setSelected(prev => prev?.id === userId ? { ...prev, status } : prev);
      toast('Durum güncellendi');
      if (status !== 'active') {
        void broadcastNotification({
          type: 'system',
          title: status === 'suspended' ? 'Hesap Askıya Alındı' : 'Hesabınız Yasaklandı',
          message: status === 'suspended'
            ? 'Hesabınız geçici olarak askıya alındı. Puan kazanma ve oyunlar devre dışı. Destek ile iletişime geçin.'
            : 'Hesabınıza erişim kapatıldı. Destek ekibiyle iletişime geçin.',
          icon: status === 'suspended' ? '⏸️' : '🚫',
          userIds: [userId],
        }).catch(() => {});
      }
      const actionType = status === 'suspended' ? 'account_suspended' : status === 'deleted' ? 'account_deleted' : 'admin_action';
      const actionLabel = status === 'suspended' ? `Kullanıcı askıya alındı: ${target?.username ?? userId}`
        : status === 'deleted' ? `Kullanıcı yasaklandı: ${target?.username ?? userId}`
        : `Kullanıcı aktifleştirildi: ${target?.username ?? userId}`;
      logAdminAction(actionType, actionLabel, { targetUserId: userId, targetUsername: target?.username, newStatus: status }, status === 'deleted' ? 'high' : 'medium');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Durum güncellenemedi — patch_account_status.sql çalıştırın');
    }
    finally { setWorking(false); }
  };

  const doAdjustPoints = async () => {
    if (!selected || pointAmt === 0 || !pointReason.trim()) { toast('Miktar ve sebep gerekli'); return; }
    setWorking(true);
    try {
      await adminAddPoints(selected.id, pointAmt, pointReason);
      const u = { ...selected, current_points: Math.max(0, selected.current_points + pointAmt), total_points: selected.total_points + (pointAmt > 0 ? pointAmt : 0) };
      setSelected(u); setUsers(prev => prev.map(p => p.id === selected.id ? u : p));
      setPointAmt(0); setPointReason('');
      toast(`${pointAmt > 0 ? '+' : ''}${pointAmt} puan uygulandı`);
      logAdminAction('admin_action', `Admin puan ayarladı: ${pointAmt > 0 ? '+' : ''}${pointAmt} pts → ${selected.username ?? selected.email}`, { targetUserId: selected.id, amount: pointAmt, reason: pointReason });
    } catch { toast('Puan güncellenemedi'); }
    finally { setWorking(false); }
  };

  const doResetPassword = async (email?: string) => {
    const em = email ?? selected?.email; if (!em) return;
    setWorking(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(em, { redirectTo: `${window.location.origin}/#/reset-password` });
      if (error) throw error;
      toast('Şifre sıfırlama e-postası gönderildi');
      logAdminAction('admin_action', `Admin şifre sıfırlama gönderdi → ${em}`, { targetEmail: em }, 'medium');
    } catch { toast('E-posta gönderilemedi'); }
    finally { setWorking(false); }
  };

  const doSendNotification = async () => {
    if (!selected || !notifText.trim()) { toast('Mesaj gerekli'); return; }
    setWorking(true);
    try {
      await broadcastNotification({ type: 'system', title: 'Admin Mesajı', message: notifText, icon: '📨', userIds: [selected.id] });
      setNotifText('');
      toast('Bildirim gönderildi');
      logAdminAction('admin_action', `Admin bildirim gönderdi → ${selected.username ?? selected.email}`, { targetUserId: selected.id, message: notifText }, 'low');
    } catch { toast('Bildirim gönderilemedi'); }
    finally { setWorking(false); }
  };

  const doSaveNote = async () => {
    if (!selected) return; setWorking(true);
    try {
      await saveAdminNote(selected.id, note);
      setSelected(p => p ? { ...p, bio: note } : p);
      toast('Not kaydedildi');
      logAdminAction('admin_action', `Admin not ekledi → ${selected.username ?? selected.email}`, { targetUserId: selected.id }, 'low');
    }
    catch { toast('Not kaydedilemedi'); }
    finally { setWorking(false); }
  };

  const doChangeRole = async () => {
    if (!selected) return; setWorking(true);
    try {
      await updateUserRole(selected.id, newRole);
      const u = { ...selected, role: newRole };
      setSelected(u); setUsers(prev => prev.map(p => p.id === selected.id ? u : p));
      setShowRoleModal(false);
      toast('Rol güncellendi');
      logAdminAction('admin_action', `Admin rol değiştirdi: ${selected.username ?? selected.email} → ${newRole}`, { targetUserId: selected.id, oldRole: selected.role, newRole }, 'high');
    } catch { toast('Rol güncellenemedi'); }
    finally { setWorking(false); }
  };

  const exportCSV = () => {
    const rows = [
      ['ID','Kullanıcı','E-posta','Telefon','Seviye','Mevcut Puan','Toplam Puan','Durum','Rol','Streak','Kayıt','Son Aktif'],
      ...filtered.map(u => [u.id, u.username??'', u.email, u.phone??'', u.level, u.current_points, u.total_points, u.status, u.role, u.streak, u.created_at, u.updated_at]),
    ].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([rows], { type:'text/csv' }));
    a.download = `kullanicilar-${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  const stat = { total: users.length, active: users.filter(u=>u.status==='active').length, suspended: users.filter(u=>u.status==='suspended').length, deleted: users.filter(u=>u.status==='deleted').length };

  /* ── Render ── */
  return (
    <AdminLayout>
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 max-w-6xl mx-auto">

      {/* Toast */}
      {feedback && (
        <div className="fixed top-4 right-4 z-[9999] px-4 py-2 rounded-2xl font-bold text-sm shadow-xl bg-[#7B6EF6] text-white border-2 border-black flex items-center gap-2">
          <Check size={14} /> {feedback}
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">YÖNETİM</p>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
            <Shield className="text-[#7B6EF6]" size={22} /> Kullanıcı Yönetimi
          </h1>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:shadow-md transition-all">
            <Download size={14} /> CSV
          </button>
          <button onClick={load} className="flex items-center gap-2 px-3 py-2 rounded-xl font-bold text-sm border-2 border-black bg-[#7B6EF6] text-white hover:shadow-lg transition-all">
            <RefreshCw size={14} /> Yenile
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label:'Toplam',        val: stat.total,     color:'text-gray-900 dark:text-white',  emoji:'👥' },
          { label:'Aktif',         val: stat.active,    color:'text-green-600',                 emoji:'✅' },
          { label:'Askıya Alınmış',val: stat.suspended, color:'text-yellow-600',               emoji:'⏸️' },
          { label:'Yasaklı',       val: stat.deleted,   color:'text-red-600',                   emoji:'🚫' },
        ].map(s => (
          <div key={s.label} className="card p-3 sm:p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 text-center">
            <div className="text-lg sm:text-xl mb-1">{s.emoji}</div>
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.val}</p>
            <p className="text-xs text-gray-500 font-bold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load()}
            placeholder="Kullanıcı adı veya e-posta ara..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 text-sm font-medium"
          />
        </div>

        {/* Status pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          <p className="text-xs font-black text-gray-400 uppercase self-center flex-shrink-0">Durum:</p>
          {(['all','active','suspended','deleted'] as StatusFilter[]).map(s => (
            <button key={s} onClick={() => setFStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-black flex-shrink-0 border-2 transition-all ${fStatus === s ? 'bg-[#7B6EF6] text-white border-black' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400'}`}>
              {s === 'all' ? 'Tümü' : s === 'active' ? 'Aktif' : s === 'suspended' ? 'Askıda' : 'Yasaklı'}
            </button>
          ))}
        </div>

        {/* Role pills + sort */}
        <div className="flex gap-2 overflow-x-auto pb-1 items-center">
          <p className="text-xs font-black text-gray-400 uppercase self-center flex-shrink-0">Rol:</p>
          {(['all','customer','store_admin','cashier','super_admin'] as RoleFilter[]).map(r => (
            <button key={r} onClick={() => setFRole(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-black flex-shrink-0 border-2 transition-all ${fRole === r ? 'bg-[#7B6EF6] text-white border-black' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600'}`}>
              {r === 'all' ? 'Tümü' : ROLE_LABEL[r as RoleType]}
            </button>
          ))}
          <div className="ml-auto flex-shrink-0">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold">
              <option value="updated_at">Son Aktif</option>
              <option value="total_points">Puan</option>
              <option value="level">Seviye</option>
              <option value="created_at">Kayıt Tarihi</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── User Table ── */}
      {loading ? (
        <div className="card py-16 text-center bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <Loader className="mx-auto mb-3 text-[#7B6EF6] animate-spin" size={28} />
          <p className="font-bold text-gray-500">Yükleniyor...</p>
        </div>
      ) : (
        <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b-2 border-black dark:border-gray-700 bg-gray-50 dark:bg-gray-900/60">
                  {['Kullanıcı','Lv','Puan','Durum','Rol','Streak','Kayıt','İşlem'].map((h,i) => (
                    <th key={h} className={`py-2.5 px-3 text-left text-xs font-black text-gray-700 dark:text-gray-300 ${i >= 5 ? 'hidden md:table-cell' : i === 4 ? 'hidden sm:table-cell' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                    {/* User */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2.5">
                        <NeoAvatar
                          src={user.avatar_url}
                          name={user.username}
                          email={user.email}
                          size={32}
                          shape="rounded"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 dark:text-white text-xs truncate max-w-[90px]">{user.username ?? '—'}</p>
                          <p className="text-xs text-gray-400 truncate max-w-[90px]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    {/* Level */}
                    <td className="py-2.5 px-3">
                      <span className="text-xs font-black text-[#7B6EF6]">Lv.{user.level}</span>
                    </td>
                    {/* Points */}
                    <td className="py-2.5 px-3">
                      <p className="text-xs font-black text-amber-600">⭐ {fmtNum(user.current_points)}</p>
                      <p className="text-xs text-gray-400">/{fmtNum(user.total_points)}</p>
                    </td>
                    {/* Status */}
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[user.status] ?? 'bg-gray-100 text-gray-600'}`}>
                        {user.status === 'active' ? 'Aktif' : user.status === 'suspended' ? 'Askıda' : 'Yasaklı'}
                      </span>
                    </td>
                    {/* Role */}
                    <td className="py-2.5 px-3 hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${ROLE_COLOR[user.role as RoleType] ?? ''}`}>
                        {ROLE_LABEL[user.role as RoleType] ?? user.role}
                      </span>
                    </td>
                    {/* Streak */}
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className="text-xs font-bold text-orange-500">🔥 {user.streak}</span>
                    </td>
                    {/* Joined */}
                    <td className="py-2.5 px-3 hidden md:table-cell">
                      <span className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                    </td>
                    {/* Actions */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => loadDetail(user)} className="p-1.5 rounded-lg hover:bg-[#7B6EF6]/10 text-[#7B6EF6]" title="Detay">
                          <Eye size={13} />
                        </button>
                        <button onClick={() => doResetPassword(user.email)} className="p-1.5 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600" title="Şifre Sıfırla">
                          <Key size={13} />
                        </button>
                        <button onClick={() => doStatus(user.id, user.status === 'active' ? 'suspended' : 'active')} className={`p-1.5 rounded-lg transition-colors ${user.status === 'active' ? 'hover:bg-red-100 text-red-500' : 'hover:bg-green-100 text-green-500'}`} title={user.status === 'active' ? 'Askıya Al' : 'Aktifleştir'}>
                          {user.status === 'active' ? <Lock size={13}/> : <Unlock size={13}/>}
                        </button>
                        <button onClick={() => { if (window.confirm('Kullanıcı kalıcı olarak yasaklansın mı?')) doStatus(user.id, 'deleted'); }} className="p-1.5 rounded-lg hover:bg-red-100 text-red-700" title="Yasakla">
                          <Ban size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-bold text-gray-500">Kullanıcı bulunamadı</p>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════ DETAIL MODAL ══════════════════════════════ */}
      {selected && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-black dark:border-gray-700 max-w-3xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">

            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b-2 border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <NeoAvatar
                  src={selected.avatar_url}
                  name={selected.username}
                  email={selected.email}
                  size={52}
                  shape="rounded"
                />
                <div className="min-w-0">
                  <h2 className="text-lg font-black text-gray-900 dark:text-white truncate">{selected.username ?? selected.email}</h2>
                  <p className="text-xs text-gray-400 truncate">{selected.email}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_COLOR[selected.status] ?? ''}`}>
                      {selected.status === 'active' ? 'Aktif' : selected.status === 'suspended' ? 'Askıda' : 'Yasaklı'}
                    </span>
                    <button onClick={() => { setNewRole(selected.role as RoleType); setShowRoleModal(true); }} className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${ROLE_COLOR[selected.role as RoleType] ?? ''}`}>
                      {ROLE_LABEL[selected.role as RoleType] ?? selected.role} <ChevronDown size={10}/>
                    </button>
                    <span className="text-xs text-gray-400">Lv.{selected.level}</span>
                    {selected.riskScore >= 5 && <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700 flex items-center gap-1"><AlertTriangle size={10}/> Yüksek Risk</span>}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-500 hover:bg-gray-200 flex-shrink-0">
                <X size={16} />
              </button>
            </div>

            {/* Role Change Modal */}
            {showRoleModal && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10 rounded-3xl">
                <div className="bg-white dark:bg-gray-800 rounded-2xl border-2 border-black p-5 w-72 space-y-4">
                  <h3 className="font-black text-gray-900 dark:text-white">Rol Değiştir</h3>
                  {(['customer','cashier','store_admin','super_admin'] as RoleType[]).map(r => (
                    <button key={r} onClick={() => setNewRole(r)} className={`w-full text-left px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all ${newRole === r ? 'border-[#7B6EF6] bg-[#7B6EF6]/10 text-[#7B6EF6]' : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}>
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                  <div className="flex gap-2">
                    <button onClick={() => setShowRoleModal(false)} className="flex-1 py-2 rounded-xl border-2 border-gray-300 font-bold text-gray-600 text-sm">İptal</button>
                    <button onClick={doChangeRole} disabled={working} className="flex-1 py-2 rounded-xl bg-[#7B6EF6] text-white font-bold text-sm border-2 border-black disabled:opacity-50">
                      {working ? <Loader size={14} className="mx-auto animate-spin" /> : 'Kaydet'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex overflow-x-auto flex-shrink-0">
              {([
                { id:'overview',      label:'Genel' },
                { id:'sessions',      label:'Oturumlar' },
                { id:'transactions',  label:'İşlemler' },
                { id:'activity',      label:'Aktivite' },
                { id:'actions',       label:'Yönet' },
              ] as { id: ModalTab; label: string }[]).map(t => (
                <button key={t.id} onClick={() => setTab(t.id)}
                  className={`px-4 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all flex-shrink-0 ${tab === t.id ? 'border-[#7B6EF6] text-[#7B6EF6]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">

              {/* GENEL */}
              {tab === 'overview' && (
                <>
                  {selected.riskScore >= 5 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-4 flex items-center gap-3">
                      <AlertTriangle className="text-red-500 flex-shrink-0" size={20} />
                      <span className="font-bold text-red-700 dark:text-red-400 text-sm">Yüksek riskli kullanıcı — {selected.riskScore} risk olayı kaydedildi</span>
                    </div>
                  )}
                  {/* Identity grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label:'User ID',  val: selected.id.slice(0,8)+'…' },
                      { label:'E-posta',  val: selected.email },
                      { label:'Telefon',  val: selected.phone ?? 'Yok' },
                      { label:'Kullanıcı Adı', val: selected.username ?? '—' },
                    ].map(i => (
                      <div key={i.label} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <p className="text-xs text-gray-400 mb-0.5">{i.label}</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{i.val}</p>
                      </div>
                    ))}
                  </div>
                  {/* Points stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { val: selected.current_points, label:'Mevcut Puan',  cls:'text-amber-600',  bg:'bg-amber-50 dark:bg-amber-900/20' },
                      { val: selected.total_points,   label:'Toplam Puan',  cls:'text-green-600',  bg:'bg-green-50 dark:bg-green-900/20' },
                      { val: selected.achievementsCount, label:'Başarı',    cls:'text-blue-600',   bg:'bg-blue-50 dark:bg-blue-900/20' },
                      { val: selected.streak,         label:'Seri',         cls:'text-orange-500', bg:'bg-orange-50 dark:bg-orange-900/20' },
                    ].map(s => (
                      <div key={s.label} className={`p-3 rounded-xl text-center ${s.bg}`}>
                        <p className={`text-2xl font-black ${s.cls}`}>{fmtNum(s.val)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Activity counts */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: selected.qrScansCount,   label:'QR Tarama' },
                      { val: selected.missionsCount,  label:'Görev' },
                      { val: selected.redemptionsCount,label:'Ödül Kullanım' },
                    ].map(s => (
                      <div key={s.label} className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl text-center">
                        <p className="text-xl font-black text-gray-900 dark:text-white">{s.val}</p>
                        <p className="text-xs text-gray-500">{s.label}</p>
                      </div>
                    ))}
                  </div>
                  {/* Risk + dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <p className="text-xs text-gray-400 mb-2 font-bold">Risk Değerlendirmesi</p>
                      <span className={`px-3 py-1 rounded-full text-sm font-black ${riskBadge(selected.riskScore).cls}`}>{riskBadge(selected.riskScore).label} RİSK</span>
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1">
                      <p className="text-xs text-gray-400 font-bold">Hesap Bilgisi</p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">Kayıt: <strong>{new Date(selected.created_at).toLocaleDateString('tr-TR')}</strong></p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">Son aktif: <strong>{relTime(selected.updated_at)}</strong></p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">XP: <strong>{selected.xp} / {selected.xp_to_next}</strong></p>
                    </div>
                  </div>
                </>
              )}

              {/* OTURUMLAR */}
              {tab === 'sessions' && (
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Monitor size={16}/> Giriş Geçmişi</p>
                  {!selected.detailLoaded ? <div className="py-8 text-center text-gray-400">Yükleniyor…</div>
                  : selected.activityLogs.filter(l => l.action_type === 'login').length === 0 ? <div className="py-8 text-center text-gray-400">Kayıtlı oturum yok</div>
                  : (
                    <div className="space-y-3">
                      {selected.activityLogs.filter(l => l.action_type === 'login').map(log => (
                        <div key={log.id} className={`p-4 rounded-2xl border-2 ${log.risk_level === 'high' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {log.device_type === 'mobile' ? <Smartphone size={20} className="text-gray-400 flex-shrink-0"/> : <Monitor size={20} className="text-gray-400 flex-shrink-0"/>}
                              <div>
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{log.device_name ?? log.device_type ?? 'Bilinmeyen Cihaz'}</p>
                                <p className="text-xs text-gray-500">{log.browser} / {log.os}</p>
                                <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-400">
                                  {log.city && <span className="flex items-center gap-1"><MapPin size={10}/>{log.city}, {log.country}</span>}
                                  {log.ip_address && <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{log.ip_address}</code>}
                                  <span className="flex items-center gap-1"><Clock size={10}/>{relTime(log.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            {log.risk_level === 'high' && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold flex items-center gap-1 flex-shrink-0"><AlertTriangle size={10}/> Yüksek</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* İŞLEMLER */}
              {tab === 'transactions' && (
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Zap size={16}/> Puan İşlemleri ({selected.transactions.length})</p>
                  {!selected.detailLoaded ? <div className="py-8 text-center text-gray-400">Yükleniyor…</div>
                  : selected.transactions.length === 0 ? <div className="py-8 text-center text-gray-400">Henüz işlem yok</div>
                  : (
                    <div className="space-y-2">
                      {selected.transactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{tx.description}</p>
                            <p className="text-xs text-gray-400">{tx.date} · {tx.category ?? tx.type}</p>
                          </div>
                          <span className={`font-black ml-3 flex-shrink-0 ${tx.type === 'earned' || tx.type === 'adjusted' ? 'text-green-600' : 'text-red-500'}`}>
                            {tx.type === 'spent' || tx.type === 'expired' ? '-' : '+'}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* AKTİVİTE */}
              {tab === 'activity' && (
                <div>
                  <p className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2"><Activity size={16}/> Tüm Aktivite ({selected.activityLogs.length})</p>
                  {!selected.detailLoaded ? <div className="py-8 text-center text-gray-400">Yükleniyor…</div>
                  : selected.activityLogs.length === 0 ? <div className="py-8 text-center text-gray-400">Aktivite kaydı yok</div>
                  : (
                    <div className="space-y-2">
                      {selected.activityLogs.map(log => {
                        const isHigh = log.risk_level === 'high';
                        return (
                          <div key={log.id} className={`flex items-start gap-3 p-3 rounded-xl ${isHigh ? 'bg-red-50 dark:bg-red-900/20 border border-red-200' : 'bg-gray-50 dark:bg-gray-900/50'}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0 ${isHigh ? 'bg-red-100' : 'bg-gray-200 dark:bg-gray-700'}`}>
                              {ACTION_ICON[log.action_type] ?? '📋'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-xs text-gray-900 dark:text-white truncate">{log.action}</p>
                              <p className="text-xs text-gray-400">{log.action_type} · {relTime(log.created_at)}</p>
                            </div>
                            {isHigh && <span className="text-xs font-bold text-red-600 flex-shrink-0">⚠️ Risk</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* YÖNET */}
              {tab === 'actions' && (
                <div className="space-y-5">
                  {/* Puan Ayarla */}
                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-800 rounded-2xl space-y-3">
                    <h3 className="font-bold flex items-center gap-2 text-amber-700 dark:text-amber-400"><Zap size={16}/> Puan Ayarla</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input type="number" placeholder="Miktar (+/-)" value={pointAmt || ''} onChange={e => setPointAmt(parseInt(e.target.value)||0)} className="px-3 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                      <input type="text" placeholder="Sebep" value={pointReason} onChange={e => setPointReason(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                      <button onClick={doAdjustPoints} disabled={working} className="px-3 py-2 bg-amber-500 text-white font-bold rounded-xl disabled:opacity-50 text-sm">
                        {working ? <Loader size={14} className="mx-auto animate-spin"/> : 'Uygula'}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Mevcut: <strong>{fmtNum(selected.current_points)} puan</strong></p>
                  </div>

                  {/* Hesap Durumu */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-3">
                    <h3 className="font-bold flex items-center gap-2"><Shield size={16}/> Hesap Durumu</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => doStatus(selected.id, 'active')} disabled={working} className="py-2.5 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 font-bold text-sm hover:bg-green-200 disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <UserCheck size={15}/> Aktifleştir
                      </button>
                      <button onClick={() => doStatus(selected.id, 'suspended')} disabled={working} className="py-2.5 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 font-bold text-sm hover:bg-yellow-200 disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <Lock size={15}/> Askıya Al
                      </button>
                      <button onClick={() => doResetPassword()} disabled={working} className="py-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-700 font-bold text-sm hover:bg-blue-200 disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <Key size={15}/> Şifre Sıfırla
                      </button>
                      <button onClick={() => { if(window.confirm('Kalıcı olarak yasakla?')) doStatus(selected.id,'deleted'); }} disabled={working} className="py-2.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 font-bold text-sm hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-1.5">
                        <Ban size={15}/> Yasakla
                      </button>
                    </div>
                  </div>

                  {/* Bildirim Gönder */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-3">
                    <h3 className="font-bold flex items-center gap-2"><Mail size={16}/> Bildirim Gönder</h3>
                    <div className="flex gap-2">
                      <input type="text" placeholder="Bildirim mesajı..." value={notifText} onChange={e => setNotifText(e.target.value)} className="flex-1 px-3 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white" />
                      <button onClick={doSendNotification} disabled={working} className="px-3 py-2 bg-[#7B6EF6] text-white font-bold rounded-xl disabled:opacity-50">
                        <Send size={14}/>
                      </button>
                    </div>
                  </div>

                  {/* Admin Notu */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl space-y-3">
                    <h3 className="font-bold flex items-center gap-2"><Star size={16}/> Admin Notu</h3>
                    <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Bu kullanıcı hakkında not..." rows={3} className="w-full px-3 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white resize-none" />
                    <button onClick={doSaveNote} disabled={working} className="px-4 py-2 bg-[#7B6EF6] text-white font-bold rounded-xl text-sm disabled:opacity-50">
                      {working ? 'Kaydediliyor…' : 'Kaydet'}
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
};

export default AdminUsers;
