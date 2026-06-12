import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, X, Check, Calendar, Trophy, Eye, Edit3,
  Power, Send, Image, ChevronDown, ChevronUp, Star, Gift,
  Clock, Zap, Loader2, AlertCircle,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  getAllEvents, createEvent, updateEvent, deleteEvent,
  type AppEvent, type RewardPrize,
} from '../../services/events';
import { useRealtimeTable } from '../../hooks/useRealtime';
import { getLeaderboard } from '../../services/points';

/* ─── Helpers ─────────────────────────────────────────────── */
const EMOJI_OPTIONS = ['📱','🎧','🖱️','🎮','🕹️','💳','💡','🏆','🎁','💎','👟','👜','✈️','🍕','🎬','📷','⌚','💻','🖥️','🎵'];
const COLOR_OPTIONS = [
  { label: 'Sunset',  value: '#FF6B35', text: '#000' },
  { label: 'Ocean',   value: '#00D1FF', text: '#000' },
  { label: 'Forest',  value: '#BFFF00', text: '#000' },
  { label: 'Fire',    value: '#FFE500', text: '#000' },
  { label: 'Galaxy',  value: '#7B6EF6', text: '#fff' },
  { label: 'Rose',    value: '#FF3CAC', text: '#fff' },
];

const pad = (n: number) => String(n).padStart(2, '0');
const todayStr = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };

const getRankLabel = (rank: number) => rank === 1 ? '🥇 1st Place' : rank === 2 ? '🥈 2nd Place' : rank === 3 ? '🥉 3rd Place' : `🏅 ${rank}th Place`;
const medal = (rank: number) => rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

const blankPrize = (rank: number): RewardPrize => ({
  rank, label: getRankLabel(rank), rewardName: '', rewardImage: '🏆', quantity: 1, pointsRequired: 1000,
});

interface FormState {
  title: string; description: string; banner: string;
  startDate: string; endDate: string; distributionDate: string;
  active: boolean; published: boolean; winnerCount: number;
  rewards: RewardPrize[];
}

const blankForm = (): FormState => ({
  title: '', description: '', banner: COLOR_OPTIONS[0].value,
  startDate: todayStr(), endDate: '', distributionDate: '',
  active: false, published: false, winnerCount: 3,
  rewards: [blankPrize(1), blankPrize(2), blankPrize(3)],
});

const eventToForm = (ev: AppEvent): FormState => ({
  title:            ev.title,
  description:      ev.description,
  banner:           ev.color ?? COLOR_OPTIONS[0].value,
  startDate:        ev.start_date?.split('T')[0] ?? '',
  endDate:          ev.end_date?.split('T')[0]   ?? '',
  distributionDate: ev.distribution_date          ?? '',
  active:           ev.active,
  published:        ev.published                  ?? false,
  winnerCount:      ev.win_count                  ?? 3,
  rewards:          (ev.rewards_json as RewardPrize[] | null)?.length
    ? (ev.rewards_json as RewardPrize[])
    : [blankPrize(1), blankPrize(2), blankPrize(3)],
});

const formToPayload = (f: FormState) => ({
  title:              f.title,
  description:        f.description,
  color:              f.banner,
  start_date:         f.startDate   ? new Date(f.startDate).toISOString()   : null,
  end_date:           f.endDate     ? new Date(f.endDate).toISOString()     : null,
  distribution_date:  f.distributionDate || null,
  active:             f.active,
  published:          f.published,
  win_count:          f.winnerCount,
  rewards_json:       f.rewards,
  image:              null,
  multiplier:         null,
  emoji:              null,
});

type Tab = 'list' | 'form' | 'preview';

/* ─── Component ───────────────────────────────────────────── */
const AdminRewardEvents: React.FC = () => {
  const [events,        setEvents]        = useState<AppEvent[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [saving,        setSaving]        = useState(false);
  const [saved,         setSaved]         = useState(false);
  const [error,         setError]         = useState('');
  const [tab,           setTab]           = useState<Tab>('list');
  const [editingId,     setEditingId]     = useState<string | null>(null);
  const [form,          setForm]          = useState<FormState>(blankForm());
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedReward, setExpandedReward] = useState<number | null>(null);
  const [emojiPicker,   setEmojiPicker]   = useState<number | null>(null);
  const [togglingId,    setTogglingId]    = useState<string | null>(null);
  // Winners from real leaderboard data
  const [winners, setWinners] = useState<{ id: string; username: string; avatar_url: string | null; total_points: number; rank: number }[]>([]);

  /* ── Load ── */
  const load = useCallback(async () => {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch {
      setError('Etkinlikler yüklenemedi');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtimeTable('events', load);

  /* Load top leaderboard players for winners display */
  useEffect(() => {
    getLeaderboard(10)
      .then(setWinners)
      .catch(() => {});
  }, []);

  /* ── Navigation ── */
  const openNew = () => {
    setEditingId(null);
    setForm(blankForm());
    setError('');
    setTab('form');
  };

  const openEdit = (ev: AppEvent) => {
    setEditingId(ev.id);
    setForm(eventToForm(ev));
    setError('');
    setTab('form');
  };

  /* ── CRUD ── */
  const handleSave = async () => {
    if (!form.title.trim() || !form.endDate) return;
    setSaving(true);
    setError('');
    try {
      const payload = formToPayload(form);
      if (editingId) {
        const updated = await updateEvent(editingId, payload);
        setEvents(prev => prev.map(e => e.id === editingId ? updated : e));
      } else {
        const created = await createEvent(payload as Parameters<typeof createEvent>[0]);
        setEvents(prev => [created, ...prev]);
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); setTab('list'); }, 900);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      setDeleteConfirm(null);
    } catch { /**/ }
  };

  const handleToggle = async (id: string, field: 'active' | 'published', current: boolean) => {
    setTogglingId(id);
    try {
      const updated = await updateEvent(id, { [field]: !current });
      setEvents(prev => prev.map(e => e.id === id ? updated : e));
    } catch { /**/ } finally {
      setTogglingId(null);
    }
  };

  /* ── Reward prize helpers ── */
  const syncRewards = (count: number) => {
    const updated = Array.from({ length: count }, (_, i) => {
      const existing = form.rewards.find(r => r.rank === i + 1);
      return existing ?? blankPrize(i + 1);
    });
    setForm(f => ({ ...f, winnerCount: count, rewards: updated }));
  };

  const updateReward = (rank: number, patch: Partial<RewardPrize>) =>
    setForm(f => ({ ...f, rewards: f.rewards.map(r => r.rank === rank ? { ...r, ...patch } : r) }));

  /* ── Preview ── */
  const previewEvent: AppEvent = {
    id: editingId ?? '__preview__',
    title: form.title,
    description: form.description,
    image: null,
    start_date: form.startDate,
    end_date: form.endDate,
    active: form.active,
    multiplier: null,
    color: form.banner,
    emoji: null,
    created_at: todayStr(),
    published: form.published,
    win_count: form.winnerCount,
    rewards_json: form.rewards,
    distribution_date: form.distributionDate || null,
  };

  const isEnded = (ev: AppEvent) => new Date(ev.end_date) < new Date();

  /* ═══ RENDER ═══════════════════════════════════════════════ */
  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Trophy size={22} className="text-amber-500" /> Reward Events
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Manage leaderboard reward events and prize distributions</p>
          </div>
          <div className="flex gap-2">
            {tab === 'list' ? (
              <button onClick={openNew} className="btn-primary flex items-center gap-1.5 py-2 px-4 text-sm">
                <Plus size={14} /> New Event
              </button>
            ) : (
              <button onClick={() => setTab('list')} className="btn-secondary flex items-center gap-1.5 py-2 px-4 text-sm">
                <X size={14} /> Cancel
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* ─── EVENT LIST ─────────────────────────────────── */}
        {tab === 'list' && (
          <div className="space-y-3">
            {loading && (
              <div className="card p-10 text-center">
                <Loader2 size={32} className="mx-auto text-violet-500 animate-spin mb-3" />
                <p className="font-bold text-gray-500">Yükleniyor...</p>
              </div>
            )}

            {!loading && events.length === 0 && (
              <div className="card p-10 text-center">
                <Trophy size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="font-bold text-gray-500 dark:text-gray-400">Henüz etkinlik yok</p>
                <p className="text-sm text-gray-400 mt-1">İlk liderlik ödül etkinliğini oluşturun</p>
                <button onClick={openNew} className="btn-primary mt-4 inline-flex items-center gap-2 text-sm py-2 px-4">
                  <Plus size={14} /> Etkinlik Oluştur
                </button>
              </div>
            )}

            {events.map(ev => {
              const ended = isEnded(ev);
              const prizes = (ev.rewards_json as RewardPrize[] | null) ?? [];
              return (
                <div key={ev.id} className={`card p-4 border-2 transition-all ${ev.active ? 'border-violet-400 dark:border-violet-600' : 'border-gray-200 dark:border-gray-700'}`}>
                  <div className="flex items-start gap-3">
                    {/* Colour swatch */}
                    <div
                      style={{ background: ev.color ?? '#FFE500' }}
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 border-black dark:border-gray-600 flex-shrink-0 shadow-[0_3px_0_#000]"
                    >
                      {ev.emoji ?? '🏆'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <p className="font-black text-base text-gray-900 dark:text-white">{ev.title}</p>
                        {ev.active    && <span className="badge bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs">Active</span>}
                        {ev.published && <span className="badge bg-blue-100  dark:bg-blue-900/30  text-blue-600  dark:text-blue-400  text-xs">Published</span>}
                        {ended        && <span className="badge bg-red-100   dark:bg-red-900/30   text-red-600   dark:text-red-400   text-xs">Ended</span>}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">{ev.description}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><Calendar size={10} />{ev.start_date?.split('T')[0]} → {ev.end_date?.split('T')[0]}</span>
                        <span className="flex items-center gap-1"><Trophy size={10} />{ev.win_count ?? 3} winners</span>
                        {prizes.length > 0 && <span className="flex items-center gap-1"><Gift size={10} />{prizes.length} prizes</span>}
                        {ev.multiplier && <span className="flex items-center gap-1"><Zap size={10} />{ev.multiplier} multiplier</span>}
                      </div>

                      {prizes.length > 0 && (
                        <div className="flex gap-1.5 mt-2 flex-wrap">
                          {prizes.slice(0, 3).map(r => (
                            <span key={r.rank} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs font-medium">
                              {medal(r.rank)} {r.rewardName || '—'}
                            </span>
                          ))}
                          {prizes.length > 3 && (
                            <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs text-gray-500">
                              +{prizes.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <button onClick={() => openEdit(ev)} className="p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-violet-500 transition-colors" title="Edit">
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleToggle(ev.id, 'active', ev.active)}
                        disabled={togglingId === ev.id}
                        className={`p-1.5 rounded-xl transition-colors ${ev.active ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title={ev.active ? 'Deactivate' : 'Activate'}>
                        {togglingId === ev.id ? <Loader2 size={15} className="animate-spin" /> : <Power size={15} />}
                      </button>
                      <button
                        onClick={() => handleToggle(ev.id, 'published', ev.published ?? false)}
                        disabled={togglingId === ev.id}
                        className={`p-1.5 rounded-xl transition-colors ${ev.published ? 'text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        title={ev.published ? 'Unpublish' : 'Publish'}>
                        <Send size={15} />
                      </button>
                      {deleteConfirm === ev.id ? (
                        <div className="flex gap-0.5">
                          <button onClick={() => handleDelete(ev.id)} className="p-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-500">
                            <Check size={13} />
                          </button>
                          <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-500">
                            <X size={13} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(ev.id)} className="p-1.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Winners section — real leaderboard data */}
                  {ended && winners.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs font-black text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                        <Star size={11} fill="currentColor" /> Liderlik Kazananları (Gerçek Veri)
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                        {winners.slice(0, ev.win_count ?? 3).map(w => (
                          <div key={w.id} className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 rounded-xl p-2 border border-amber-200 dark:border-amber-800">
                            <span className="text-lg">{medal(w.rank)}</span>
                            {w.avatar_url
                              ? <img src={w.avatar_url} alt={w.username} className="w-7 h-7 rounded-full object-cover border border-gray-300 flex-shrink-0" />
                              : <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 text-sm">👤</div>
                            }
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{w.username}</p>
                              <p className="text-[10px] text-amber-600 font-medium">{w.total_points.toLocaleString()} puan</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ─── FORM ───────────────────────────────────────── */}
        {tab === 'form' && (
          <div className="space-y-5">
            {/* Basic Info */}
            <div className="card p-5 space-y-4">
              <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <Zap size={16} className="text-violet-500" /> Etkinlik Detayları
              </h2>
              <div>
                <label className="block font-bold text-sm mb-1.5">Etkinlik Adı *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="örn. Yaz Şampiyonlar Kupası" />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1.5">Açıklama</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={3} placeholder="Etkinliği ve katılım koşullarını açıklayın..." />
              </div>

              {/* Banner color */}
              <div>
                <label className="block font-bold text-sm mb-1.5">Banner Rengi</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button key={c.value} onClick={() => setForm(f => ({ ...f, banner: c.value }))} title={c.label}
                      style={{ background: c.value }}
                      className={`h-10 rounded-xl border-2 transition-all flex items-center justify-center font-black text-xs ${form.banner === c.value ? 'border-black scale-105 shadow-[0_3px_0_#000]' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                      <span style={{ color: c.text, fontSize: 9, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-sm mb-1.5">Başlangıç Tarihi *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1.5">Bitiş Tarihi *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="block font-bold text-sm mb-1.5 flex items-center gap-1"><Clock size={12} /> Dağıtım Tarihi</label>
                  <input type="date" value={form.distributionDate} onChange={e => setForm(f => ({ ...f, distributionDate: e.target.value }))} className="input-field" />
                </div>
              </div>

              {/* Status toggles */}
              <div className="flex gap-3 flex-wrap">
                <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${form.active ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  <Power size={14} /> {form.active ? '✅ Aktif' : 'Aktif Et'}
                </button>
                <button type="button" onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${form.published ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  <Send size={14} /> {form.published ? '✅ Yayında' : 'Yayınla'}
                </button>
              </div>
            </div>

            {/* Winners & Prizes */}
            <div className="card p-5 space-y-4">
              <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 text-base">
                <Trophy size={16} className="text-amber-500" /> Kazananlar & Ödüller
              </h2>
              <div>
                <label className="block font-bold text-sm mb-1.5">Kazanan Sayısı</label>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 5, 10].map(n => (
                    <button key={n} onClick={() => syncRewards(n)}
                      className={`w-12 h-10 rounded-xl font-black text-sm border-2 transition-all ${form.winnerCount === n ? 'bg-violet-500 dark:bg-violet-600 text-white border-black dark:border-gray-600' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black dark:border-gray-600 hover:bg-gray-50'}`}>
                      {n}
                    </button>
                  ))}
                  <input type="number" min={1} max={20} value={form.winnerCount}
                    onChange={e => syncRewards(Math.max(1, Math.min(20, Number(e.target.value))))}
                    className="w-20 input-field text-center font-black" />
                </div>
              </div>

              <div className="space-y-2">
                {form.rewards.map((reward, idx) => (
                  <div key={reward.rank} className="border-2 border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
                    <button onClick={() => setExpandedReward(expandedReward === idx ? null : idx)}
                      className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors">
                      <span className="text-xl">{medal(reward.rank)}</span>
                      <div className="flex-1 text-left">
                        <p className="font-black text-sm text-gray-900 dark:text-white">{reward.label}</p>
                        <p className="text-xs text-gray-500">{reward.rewardName || 'Ödül atanmadı'}</p>
                      </div>
                      <span className="text-2xl mr-1">{reward.rewardImage}</span>
                      {expandedReward === idx ? <ChevronUp size={16} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-gray-400 flex-shrink-0" />}
                    </button>
                    {expandedReward === idx && (
                      <div className="p-4 space-y-3 border-t-2 border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-bold text-xs mb-1.5">Ödül Adı *</label>
                            <input value={reward.rewardName} onChange={e => updateReward(reward.rank, { rewardName: e.target.value })} className="input-field text-sm" placeholder="örn. iPhone 17 Pro Max" />
                          </div>
                          <div>
                            <label className="block font-bold text-xs mb-1.5">Miktar</label>
                            <input type="number" min={1} value={reward.quantity} onChange={e => updateReward(reward.rank, { quantity: Number(e.target.value) })} className="input-field text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block font-bold text-xs mb-1.5">Gerekli Min. Puan</label>
                          <input type="number" min={0} step={100} value={reward.pointsRequired} onChange={e => updateReward(reward.rank, { pointsRequired: Number(e.target.value) })} className="input-field text-sm" />
                        </div>
                        <div>
                          <label className="block font-bold text-xs mb-1.5 flex items-center gap-1"><Image size={11} /> Emoji İkon</label>
                          <div className="relative">
                            <button onClick={() => setEmojiPicker(emojiPicker === idx ? null : idx)}
                              className="flex items-center gap-2 border-2 border-black dark:border-gray-600 rounded-xl px-3 py-2 text-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              {reward.rewardImage}
                              <span className="text-xs font-bold text-gray-500">Değiştir</span>
                            </button>
                            {emojiPicker === idx && (
                              <div className="absolute top-full mt-1 left-0 z-20 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-2xl p-3 shadow-xl grid grid-cols-5 gap-1.5">
                                {EMOJI_OPTIONS.map(em => (
                                  <button key={em} onClick={() => { updateReward(reward.rank, { rewardImage: em }); setEmojiPicker(null); }}
                                    className="text-2xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    {em}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button onClick={() => setTab('list')} className="btn-secondary flex-1">İptal</button>
              <button onClick={() => setTab('preview')} className="btn-secondary flex-1 flex items-center justify-center gap-2">
                <Eye size={15} /> Önizle
              </button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.endDate}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Kaydedildi!</> : editingId ? 'Kaydet' : 'Oluştur'}
              </button>
            </div>
          </div>
        )}

        {/* ─── PREVIEW ────────────────────────────────────── */}
        {tab === 'preview' && (
          <div className="space-y-5">
            <div className="card overflow-hidden border-2 border-black dark:border-gray-700">
              {(() => {
                const bannerColor = previewEvent.color ?? '#FFE500';
                const isDark = bannerColor === '#7B6EF6' || bannerColor === '#FF3CAC';
                const textColor = isDark ? '#fff' : '#000';
                const sub = isDark ? 'rgba(255,255,255,0.75)' : 'rgba(0,0,0,0.6)';
                return (
                  <div style={{ background: bannerColor, padding: 24, position: 'relative', borderBottom: '3px solid #000' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,0,0,0.15)', border: '1.5px solid rgba(0,0,0,0.2)', borderRadius: 999, padding: '3px 10px', fontSize: 10, fontWeight: 900, color: textColor, marginBottom: 8, letterSpacing: '0.08em' }}>
                          <Trophy size={11} /> LEADERBOARD EVENT
                        </div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, margin: '0 0 4px', color: textColor, letterSpacing: '-0.03em' }}>{previewEvent.title || 'Etkinlik Adı'}</h2>
                        <p style={{ fontSize: 13, margin: 0, color: sub, maxWidth: 380, fontWeight: 600 }}>{previewEvent.description || 'Etkinlik açıklaması.'}</p>
                      </div>
                      <div style={{ flexShrink: 0, background: 'rgba(0,0,0,0.18)', border: '2px solid rgba(0,0,0,0.2)', borderRadius: 16, padding: '10px 16px', textAlign: 'right' }}>
                        <p style={{ fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', color: sub, margin: '0 0 2px', textTransform: 'uppercase' }}>Bitiş</p>
                        <p style={{ fontWeight: 900, fontSize: 18, color: textColor, margin: 0 }}>{previewEvent.end_date || '—'}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12, fontSize: 11, color: sub, fontWeight: 700 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={11} />{previewEvent.start_date} → {previewEvent.end_date}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Trophy size={11} />{previewEvent.win_count} winners</span>
                      {previewEvent.published && <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#00D1FF' }}>✅ Yayında</span>}
                    </div>
                  </div>
                );
              })()}

              <div className="p-5">
                <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Gift size={16} className="text-purple-500" /> Ödül Havuzu
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(previewEvent.rewards_json as RewardPrize[] | null)?.slice(0, 3).map(r => (
                    <div key={r.rank}
                      className={`rounded-2xl p-4 border-2 text-center ${r.rank === 1 ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20' : r.rank === 2 ? 'border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-800' : 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'}`}>
                      <div className="text-4xl mb-2">{r.rewardImage}</div>
                      <div className={`inline-block text-sm font-black mb-1 ${r.rank === 1 ? 'text-amber-600' : r.rank === 2 ? 'text-gray-500' : 'text-orange-500'}`}>{r.label}</div>
                      <p className="font-black text-gray-900 dark:text-white text-sm">{r.rewardName || '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">Adet: {r.quantity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setTab('form')} className="btn-secondary flex-1">← Düzenle</button>
              <button onClick={handleSave} disabled={saving || !form.title.trim() || !form.endDate}
                className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <Loader2 size={15} className="animate-spin" /> : saved ? <><Check size={15} /> Kaydedildi!</> : editingId ? 'Kaydet' : 'Oluştur'}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRewardEvents;
