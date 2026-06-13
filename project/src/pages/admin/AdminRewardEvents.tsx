import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, X, Check, Calendar, Trophy, Eye, Edit3,
  Power, Send, Clock, Zap, Loader2, AlertCircle, ArrowLeft,
  ChevronDown, ChevronUp, Gift, Star, Users, Sparkles,
  RefreshCw, Image as ImageIcon,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  getAllEvents, createEvent, updateEvent, deleteEvent,
  type AppEvent, type RewardPrize, type EventStatus,
} from '../../services/events';
import { getEventWinners, markWinnerDistributed, syncEventStatuses, finalizeEvent,
  type EventWinner,
} from '../../services/eventLeaderboard';
import { useRealtimeTable } from '../../hooks/useRealtime';
import NeoAvatar from '../../components/NeoAvatar';

/* ─── Constants ───────────────────────────────────────────── */
const EMOJI_OPTIONS = [
  '📱','🎧','🖱️','🎮','🕹️','💳','💡','🏆','🎁','💎',
  '👟','👜','✈️','🍕','🎬','📷','⌚','💻','🖥️','🎵',
  '🏅','⭐','🔥','💰','🎯','🎪','🎨','🛍️','🎀','🚀',
];

const BANNERS = [
  { label:'SUNSET',  value:'#FF6B35', text:'#000', glow:'rgba(255,107,53,0.35)'  },
  { label:'OCEAN',   value:'#00D1FF', text:'#000', glow:'rgba(0,209,255,0.35)'   },
  { label:'FOREST',  value:'#BFFF00', text:'#000', glow:'rgba(191,255,0,0.35)'   },
  { label:'FIRE',    value:'#FFE500', text:'#000', glow:'rgba(255,229,0,0.35)'   },
  { label:'GALAXY',  value:'#6C63FF', text:'#fff', glow:'rgba(108,99,255,0.35)'  },
  { label:'ROSE',    value:'#FF3CAC', text:'#fff', glow:'rgba(255,60,172,0.35)'  },
];

const pad  = (n: number) => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; };
const fmtDate = (iso?: string | null) => iso ? iso.split('T')[0] : '—';

const medal = (rank: number) =>
  rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;

const rankLabel = (rank: number) =>
  rank === 1 ? '🥇 Birinci' : rank === 2 ? '🥈 İkinci' : rank === 3 ? '🥉 Üçüncü' : `🏅 ${rank}. Sıra`;

const blankPrize = (rank: number): RewardPrize => ({
  rank, label: rankLabel(rank), rewardName: '', rewardImage: '🏆', quantity: 1, pointsRequired: 1000,
});

/* ─── Form types ──────────────────────────────────────────── */
interface FormState {
  title: string; description: string; banner: string;
  startDateTime: string; endDateTime: string; distributionDate: string;
  active: boolean; published: boolean; winnerCount: number;
  rewards: RewardPrize[];
}

const toLocalDatetime = (iso?: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const blankForm = (): FormState => ({
  title: '', description: '', banner: BANNERS[0].value,
  startDateTime: `${today()}T00:00`, endDateTime: '', distributionDate: '',
  active: false, published: false, winnerCount: 3,
  rewards: [blankPrize(1), blankPrize(2), blankPrize(3)],
});

const eventToForm = (ev: AppEvent): FormState => ({
  title:            ev.title,
  description:      ev.description ?? '',
  banner:           ev.color ?? BANNERS[0].value,
  startDateTime:    toLocalDatetime(ev.start_date),
  endDateTime:      toLocalDatetime(ev.end_date),
  distributionDate: ev.distribution_date ?? '',
  active:           ev.active,
  published:        ev.published ?? false,
  winnerCount:      ev.win_count ?? 3,
  rewards:          Array.isArray(ev.rewards_json) && (ev.rewards_json as RewardPrize[]).length > 0
    ? ev.rewards_json as RewardPrize[]
    : [blankPrize(1), blankPrize(2), blankPrize(3)],
});

const formToPayload = (f: FormState) => ({
  title:             f.title,
  description:       f.description,
  color:             f.banner,
  start_date:        f.startDateTime ? new Date(f.startDateTime).toISOString() : undefined,
  end_date:          f.endDateTime   ? new Date(f.endDateTime).toISOString()   : undefined,
  distribution_date: f.distributionDate ? new Date(f.distributionDate).toISOString() : undefined,
  active:            f.active,
  published:         f.published,
  status:            (f.published ? 'active' : 'draft') as EventStatus,
  win_count:         f.winnerCount,
  rewards_json:      f.rewards,
  image:             null,
  multiplier:        null,
  emoji:             null,
});

/* ─── Status helpers ──────────────────────────────────────── */
function eventStatus(ev: AppEvent): 'live' | 'upcoming' | 'ended' | 'draft' | 'distributed' {
  if (ev.status === 'distributed') return 'distributed';
  if (ev.status === 'ended') return 'ended';
  if (ev.status === 'draft' || !ev.published) return 'draft';
  const now = Date.now();
  const start = ev.start_date ? new Date(ev.start_date).getTime() : 0;
  const end   = ev.end_date   ? new Date(ev.end_date).getTime()   : 0;
  if (now > end) return 'ended';
  if (now < start) return 'upcoming';
  return 'live';
}

const STATUS_META = {
  live:        { label:'Canlı',      cls:'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',   dot:'bg-green-500' },
  upcoming:    { label:'Yaklaşan',   cls:'bg-blue-100  dark:bg-blue-900/30  text-blue-700  dark:text-blue-400',    dot:'bg-blue-500'  },
  ended:       { label:'Bitti',      cls:'bg-gray-100  dark:bg-gray-700     text-gray-500  dark:text-gray-400',    dot:'bg-gray-400'  },
  draft:       { label:'Taslak',     cls:'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400', dot:'bg-yellow-500' },
  distributed: { label:'Dağıtıldı',  cls:'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400', dot:'bg-purple-500' },
};

/* ─── Countdown hook ──────────────────────────────────────── */
function useCountdown(end?: string | null) {
  const calc = () => {
    if (!end) return null;
    const diff = new Date(end).getTime() - Date.now();
    if (diff <= 0) return null;
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
    };
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setCd(calc()), 60000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [end]);
  return cd;
}

type View = 'list' | 'form' | 'preview';

/* ══════════════════════════════════════════════════════════ */
const AdminRewardEvents: React.FC = () => {
  const [events,       setEvents]       = useState<AppEvent[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState('');
  const [view,         setView]         = useState<View>('list');
  const [editingId,    setEditingId]    = useState<string | null>(null);
  const [form,         setForm]         = useState<FormState>(blankForm());
  const [deletingId,   setDeletingId]   = useState<string | null>(null);
  const [expanded,     setExpanded]     = useState<number | null>(null);
  const [emojiIdx,     setEmojiIdx]     = useState<number | null>(null);
  const [togglingId,   setTogglingId]   = useState<string | null>(null);
  const [winnersByEvent, setWinnersByEvent] = useState<Record<string, EventWinner[]>>({});
  const [distributingId, setDistributingId] = useState<string | null>(null);

  /* Load */
  const load = useCallback(async () => {
    try {
      await syncEventStatuses().catch(() => {});
      const evs = await getAllEvents();
      setEvents(evs);
      const ended = evs.filter(e => ['ended', 'distributed'].includes(e.status ?? '') || eventStatus(e) === 'ended' || eventStatus(e) === 'distributed');
      for (const e of ended) {
        if (new Date(e.end_date) < new Date() && e.status === 'active') {
          await finalizeEvent(e.id).catch(() => {});
        }
      }
      const refreshed = ended.length ? await getAllEvents() : evs;
      if (ended.length) setEvents(refreshed);
      const winnerEntries = await Promise.all(
        (ended.length ? refreshed : evs)
          .filter(e => eventStatus(e) === 'ended' || eventStatus(e) === 'distributed')
          .map(async e => [e.id, await getEventWinners(e.id).catch(() => [])] as const),
      );
      setWinnersByEvent(Object.fromEntries(winnerEntries));
    } catch { setError('Etkinlikler yüklenemedi'); }
    finally   { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtimeTable('events', load);

  const handleMarkDistributed = async (winnerId: string, eventId: string) => {
    setDistributingId(winnerId);
    try {
      await markWinnerDistributed(winnerId);
      const updated = await getEventWinners(eventId);
      setWinnersByEvent(prev => ({ ...prev, [eventId]: updated }));
      setEvents(prev => prev.map(e => {
        if (e.id !== eventId) return e;
        if (updated.every(w => w.distributed)) return { ...e, status: 'distributed' as EventStatus };
        return e;
      }));
    } catch { setError('Dağıtım işaretlenemedi'); }
    finally { setDistributingId(null); }
  };

  /* Navigation */
  const openNew = () => { setEditingId(null); setForm(blankForm()); setError(''); setView('form'); };
  const openEdit = (ev: AppEvent) => { setEditingId(ev.id); setForm(eventToForm(ev)); setError(''); setView('form'); };
  const backToList = () => { setView('list'); setError(''); };

  /* CRUD */
  const handleSave = async () => {
    if (!form.title.trim() || !form.endDateTime) return;
    if (form.rewards.length !== form.winnerCount) {
      setError(`Ödül sayısı (${form.rewards.length}) kazanan sayısı (${form.winnerCount}) ile eşleşmeli`);
      return;
    }
    if (form.rewards.some(r => !r.rewardName.trim())) {
      setError('Tüm sıralar için ödül adı girilmeli');
      return;
    }
    setSaving(true); setError('');
    try {
      const payload = formToPayload(form);
      if (editingId) {
        const u = await updateEvent(editingId, payload);
        setEvents(prev => prev.map(e => e.id === editingId ? u : e));
      } else {
        const c = await createEvent(payload as Parameters<typeof createEvent>[0]);
        setEvents(prev => [c, ...prev]);
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); backToList(); }, 900);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Kaydedilemedi');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      setDeletingId(null);
    } catch { /**/ }
  };

  const handleToggle = async (id: string, field: 'active' | 'published', cur: boolean) => {
    setTogglingId(id + field);
    try {
      const updates: Partial<AppEvent> = { [field]: !cur };
      if (field === 'published') {
        updates.status = !cur ? 'active' : 'draft';
        if (!cur) updates.active = true;
      }
      const u = await updateEvent(id, updates);
      setEvents(prev => prev.map(e => e.id === id ? u : e));
    } catch { /**/ }
    finally { setTogglingId(null); }
  };

  /* Reward helpers */
  const syncRewards = (n: number) => {
    const rewards = Array.from({ length: n }, (_, i) =>
      form.rewards.find(r => r.rank === i + 1) ?? blankPrize(i + 1)
    );
    setForm(f => ({ ...f, winnerCount: n, rewards }));
  };
  const updateReward = (rank: number, patch: Partial<RewardPrize>) =>
    setForm(f => ({ ...f, rewards: f.rewards.map(r => r.rank === rank ? { ...r, ...patch } : r) }));

  /* Preview event obj */
  const previewEv: AppEvent = {
    id: editingId ?? '__preview__', title: form.title, description: form.description,
    image: null, start_date: form.startDateTime, end_date: form.endDateTime,
    active: form.active, multiplier: null, color: form.banner, emoji: null,
    created_at: today(), published: form.published, win_count: form.winnerCount,
    rewards_json: form.rewards, distribution_date: form.distributionDate || null,
    status: form.published ? 'active' : 'draft',
  };

  /* Stats */
  const stats = {
    total:    events.length,
    live:     events.filter(e => eventStatus(e) === 'live').length,
    upcoming: events.filter(e => eventStatus(e) === 'upcoming').length,
    ended:    events.filter(e => eventStatus(e) === 'ended').length,
  };

  /* ════════════════════════════════════════════════════════ */
  return (
    <AdminLayout>
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-5 max-w-4xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          {view !== 'list' && (
            <button onClick={backToList} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-1.5 transition-colors">
              <ArrowLeft size={12} /> Etkinliklere Dön
            </button>
          )}
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">ÖDÜL YÖNETİMİ</p>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2 mt-0.5">
            <Trophy className="text-amber-500" size={22} />
            {view === 'list' ? 'Ödül Etkinlikleri' : view === 'form' ? (editingId ? 'Etkinliği Düzenle' : 'Yeni Etkinlik') : 'Önizleme'}
          </h1>
        </div>
        <div className="flex gap-2">
          {view === 'list' ? (
            <>
              <button onClick={load} className="p-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white transition-all">
                <RefreshCw size={15} />
              </button>
              <button onClick={openNew} className="flex items-center gap-2 px-4 py-2 bg-[#7B6EF6] text-white rounded-xl border-2 border-black font-black text-sm hover:shadow-lg transition-all">
                <Plus size={15} /> Yeni Etkinlik
              </button>
            </>
          ) : view === 'form' ? (
            <button onClick={() => setView('preview')} className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-bold text-sm text-gray-700 dark:text-gray-300 hover:shadow-md transition-all">
              <Eye size={14} /> Önizle
            </button>
          ) : (
            <button onClick={() => setView('form')} className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 font-bold text-sm text-gray-700 dark:text-gray-300">
              <Edit3 size={14} /> Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 p-3 rounded-2xl text-sm font-bold text-red-600 bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700">
          <AlertCircle size={16} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* ════════════════ LIST VIEW ════════════════ */}
      {view === 'list' && (
        <>
          {/* Stats strip */}
          {!loading && events.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label:'Toplam',    val: stats.total,    color:'text-gray-900 dark:text-white',  emoji:'🏆' },
                { label:'Canlı',     val: stats.live,     color:'text-green-600',                 emoji:'🔴' },
                { label:'Yaklaşan', val: stats.upcoming, color:'text-blue-600',                  emoji:'⏳' },
                { label:'Bitti',     val: stats.ended,    color:'text-gray-500',                  emoji:'✅' },
              ].map(s => (
                <div key={s.label} className="card p-3 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 text-center">
                  <div className="text-lg mb-0.5">{s.emoji}</div>
                  <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                  <p className="text-xs text-gray-500 font-bold">{s.label}</p>
                </div>
              ))}
            </div>
          )}

          {loading && (
            <div className="card py-16 text-center bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
              <Loader2 size={32} className="mx-auto text-amber-500 animate-spin mb-3" />
              <p className="font-bold text-gray-500">Yükleniyor...</p>
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="card py-16 text-center bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
              <div className="text-6xl mb-4">🏆</div>
              <p className="font-black text-gray-700 dark:text-white text-lg">Henüz etkinlik yok</p>
              <p className="text-sm text-gray-400 mt-1 mb-5">İlk ödül etkinliğini oluşturun</p>
              <button onClick={openNew} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#7B6EF6] text-white rounded-xl border-2 border-black font-black text-sm hover:shadow-lg transition-all">
                <Plus size={15} /> Etkinlik Oluştur
              </button>
            </div>
          )}

          <div className="space-y-4">
            {events.map(ev => {
              const status = eventStatus(ev);
              const meta   = STATUS_META[status];
              const prizes = Array.isArray(ev.rewards_json) ? ev.rewards_json as RewardPrize[] : [];
              const banner = BANNERS.find(b => b.value === ev.color) ?? BANNERS[0];
              const eventWinners = winnersByEvent[ev.id] ?? [];
              return (
                <EventCard
                  key={ev.id}
                  ev={ev} prizes={prizes} status={status} meta={meta}
                  banner={banner} eventWinners={eventWinners}
                  deletingId={deletingId} togglingId={togglingId}
                  distributingId={distributingId}
                  onEdit={() => openEdit(ev)}
                  onToggleActive={() => handleToggle(ev.id, 'active', ev.active)}
                  onTogglePublish={() => handleToggle(ev.id, 'published', ev.published ?? false)}
                  onDeleteConfirm={() => setDeletingId(ev.id)}
                  onDeleteCancel={() => setDeletingId(null)}
                  onDeleteExecute={() => handleDelete(ev.id)}
                  onMarkDistributed={(winnerId) => void handleMarkDistributed(winnerId, ev.id)}
                />
              );
            })}
          </div>
        </>
      )}

      {/* ════════════════ FORM VIEW ════════════════ */}
      {view === 'form' && (
        <div className="space-y-5">

          {/* Section: Temel Bilgiler */}
          <FormSection icon={<Sparkles size={16} className="text-[#7B6EF6]"/>} title="Temel Bilgiler">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="label">Etkinlik Adı *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="örn. Yaz Şampiyonlar Kupası 2026"
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Açıklama</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Etkinlik hakkında katılımcılara ne gösterilsin?"
                  rows={3}
                  className="input-field resize-none"
                />
              </div>

              {/* Banner color picker */}
              <div>
                <label className="label">Banner Rengi</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {BANNERS.map(b => (
                    <button
                      key={b.value}
                      onClick={() => setForm(f => ({ ...f, banner: b.value }))}
                      style={{ background: b.value, boxShadow: form.banner === b.value ? `0 0 0 3px #000, 0 0 12px ${b.glow}` : undefined }}
                      className={`h-11 rounded-xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${form.banner === b.value ? 'border-black scale-105' : 'border-transparent opacity-60 hover:opacity-90 hover:scale-105'}`}
                      title={b.label}
                    >
                      <span style={{ color: b.text }}>{b.label}</span>
                    </button>
                  ))}
                </div>
                {/* Live mini-preview of banner */}
                <div
                  style={{ background: form.banner }}
                  className="mt-3 h-14 rounded-xl border-2 border-black flex items-center px-4 gap-3"
                >
                  <Trophy size={20} style={{ color: BANNERS.find(b=>b.value===form.banner)?.text ?? '#000' }} />
                  <span style={{ color: BANNERS.find(b=>b.value===form.banner)?.text ?? '#000', fontWeight: 900, fontSize: 14 }}>
                    {form.title || 'Etkinlik Adı'}
                  </span>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Section: Tarihler */}
          <FormSection icon={<Calendar size={16} className="text-[#7B6EF6]"/>} title="Tarihler & Durum">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="label">Başlangıç *</label>
                <input type="datetime-local" value={form.startDateTime} onChange={e => setForm(f => ({ ...f, startDateTime: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label">Bitiş *</label>
                <input type="datetime-local" value={form.endDateTime} onChange={e => setForm(f => ({ ...f, endDateTime: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label flex items-center gap-1"><Clock size={11}/> Dağıtım Tarihi</label>
                <input type="date" value={form.distributionDate} onChange={e => setForm(f => ({ ...f, distributionDate: e.target.value }))} className="input-field" />
              </div>
            </div>
            <div className="flex gap-3 flex-wrap mt-1">
              <ToggleButton
                active={form.active}
                label={form.active ? '✅ Aktif' : 'Aktif Et'}
                activeClass="border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700"
                icon={<Power size={13}/>}
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
              />
              <ToggleButton
                active={form.published}
                label={form.published ? '✅ Yayında' : 'Yayınla'}
                activeClass="border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700"
                icon={<Send size={13}/>}
                onClick={() => setForm(f => ({ ...f, published: !f.published }))}
              />
            </div>
          </FormSection>

          {/* Section: Kazananlar & Ödüller */}
          <FormSection icon={<Trophy size={16} className="text-amber-500"/>} title="Kazananlar & Ödüller">
            <div>
              <label className="label">Kazanan Sayısı</label>
              <div className="flex gap-2 flex-wrap items-center">
                {[1,2,3,5,10].map(n => (
                  <button key={n} onClick={() => syncRewards(n)}
                    className={`w-11 h-10 rounded-xl font-black text-sm border-2 transition-all ${form.winnerCount === n ? 'bg-[#7B6EF6] text-white border-black' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-gray-500'}`}>
                    {n}
                  </button>
                ))}
                <input
                  type="number" min={1} max={20} value={form.winnerCount}
                  onChange={e => syncRewards(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className="w-20 input-field text-center font-black"
                />
                <span className="text-xs text-gray-400 font-medium">kazanan</span>
              </div>
            </div>

            <div className="space-y-2 mt-1">
              {form.rewards.map((rw, idx) => (
                <RewardRow
                  key={rw.rank}
                  reward={rw} idx={idx}
                  expanded={expanded === idx}
                  emojiOpen={emojiIdx === idx}
                  onToggle={() => setExpanded(expanded === idx ? null : idx)}
                  onEmojiToggle={() => setEmojiIdx(emojiIdx === idx ? null : idx)}
                  onEmojiPick={em => { updateReward(rw.rank, { rewardImage: em }); setEmojiIdx(null); }}
                  onChange={patch => updateReward(rw.rank, patch)}
                />
              ))}
            </div>
          </FormSection>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={backToList} className="flex-1 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:shadow-md transition-all">
              İptal
            </button>
            <button onClick={() => setView('preview')} className="flex-1 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 flex items-center justify-center gap-2 hover:shadow-md transition-all">
              <Eye size={15}/> Önizle
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.title.trim() || !form.endDateTime || form.rewards.length !== form.winnerCount}
              className="flex-1 py-3 rounded-xl border-2 border-black bg-[#7B6EF6] text-white font-black flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {saving ? <Loader2 size={15} className="animate-spin"/> : saved ? <><Check size={15}/> Kaydedildi!</> : editingId ? '💾 Kaydet' : '✨ Oluştur'}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════ PREVIEW VIEW ════════════════ */}
      {view === 'preview' && <PreviewView ev={previewEv} onBack={() => setView('form')} onSave={handleSave} saving={saving} saved={saved} isEdit={!!editingId} />}

    </div>
    </AdminLayout>
  );
};

/* ══════════════════════════════════════════════════════════
   Sub-components
══════════════════════════════════════════════════════════ */

/* ── FormSection ── */
const FormSection: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
  <div className="card p-5 space-y-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
    <h2 className="font-black text-gray-900 dark:text-white flex items-center gap-2 text-sm">
      {icon} {title}
    </h2>
    {children}
  </div>
);

/* ── ToggleButton ── */
const ToggleButton: React.FC<{ active: boolean; label: string; activeClass: string; icon: React.ReactNode; onClick: () => void }> = ({ active, label, activeClass, icon, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-bold text-sm transition-all ${active ? activeClass : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-400'}`}
  >
    {icon} {label}
  </button>
);

/* ── RewardRow ── */
interface RewardRowProps {
  reward: RewardPrize; idx: number;
  expanded: boolean; emojiOpen: boolean;
  onToggle: () => void; onEmojiToggle: () => void;
  onEmojiPick: (em: string) => void;
  onChange: (patch: Partial<RewardPrize>) => void;
}
const RewardRow: React.FC<RewardRowProps> = ({ reward, expanded, emojiOpen, onToggle, onEmojiToggle, onEmojiPick, onChange }) => {
  const medalColors: Record<number, string> = {
    1: 'border-amber-400 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/10',
    2: 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800',
    3: 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10',
  };
  const cardCls = medalColors[reward.rank] ?? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800';
  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${cardCls}`}>
      <button onClick={onToggle} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
        <span className="text-2xl w-8 text-center flex-shrink-0">{medal(reward.rank)}</span>
        <div className="flex-1 text-left">
          <p className="font-black text-sm text-gray-900 dark:text-white">{reward.label}</p>
          <p className="text-xs text-gray-400">{reward.rewardName || <span className="text-amber-500">Ödül atanmadı</span>}</p>
        </div>
        <span className="text-2xl mr-1">{reward.rewardImage}</span>
        {expanded ? <ChevronUp size={15} className="text-gray-400 flex-shrink-0"/> : <ChevronDown size={15} className="text-gray-400 flex-shrink-0"/>}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t-2 border-black/10 dark:border-white/10 space-y-3 bg-white dark:bg-gray-900/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Ödül Adı *</label>
              <input value={reward.rewardName} onChange={e => onChange({ rewardName: e.target.value })} className="input-field text-sm" placeholder="örn. iPhone 16 Pro" />
            </div>
            <div>
              <label className="label">Miktar</label>
              <input type="number" min={1} value={reward.quantity} onChange={e => onChange({ quantity: Number(e.target.value) })} className="input-field text-sm" />
            </div>
          </div>
          <div>
            <label className="label">Gerekli Min. Puan</label>
            <input type="number" min={0} step={100} value={reward.pointsRequired} onChange={e => onChange({ pointsRequired: Number(e.target.value) })} className="input-field text-sm" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><ImageIcon size={11}/> Emoji İkon</label>
            <div className="relative">
              <button onClick={onEmojiToggle} className="flex items-center gap-2 border-2 border-black dark:border-gray-600 rounded-xl px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="text-2xl">{reward.rewardImage}</span>
                <span className="text-xs font-bold text-gray-500">Değiştir</span>
              </button>
              {emojiOpen && (
                <div className="absolute top-full mt-1.5 left-0 z-30 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-2xl p-3 shadow-2xl grid grid-cols-6 gap-1">
                  {EMOJI_OPTIONS.map(em => (
                    <button key={em} onClick={() => onEmojiPick(em)} className="text-2xl p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
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
  );
};

/* ── EventCard ── */
interface EventCardProps {
  ev: AppEvent; prizes: RewardPrize[];
  status: 'live' | 'upcoming' | 'ended' | 'draft' | 'distributed';
  meta: typeof STATUS_META['live'];
  banner: typeof BANNERS[number];
  eventWinners: EventWinner[];
  deletingId: string | null; togglingId: string | null; distributingId: string | null;
  onEdit: () => void;
  onToggleActive: () => void; onTogglePublish: () => void;
  onDeleteConfirm: () => void; onDeleteCancel: () => void; onDeleteExecute: () => void;
  onMarkDistributed: (winnerId: string) => void;
}
const EventCard: React.FC<EventCardProps> = ({
  ev, prizes, status, meta, banner, eventWinners,
  deletingId, togglingId, distributingId, onEdit, onToggleActive, onTogglePublish,
  onDeleteConfirm, onDeleteCancel, onDeleteExecute, onMarkDistributed,
}) => {
  const cd = useCountdown(status === 'live' ? ev.end_date : null);

  return (
    <div className={`card overflow-hidden border-2 transition-all ${status === 'live' ? 'border-[#7B6EF6]' : 'border-black dark:border-gray-700'} bg-white dark:bg-gray-800`}>

      {/* Banner stripe */}
      <div style={{ background: banner.value, borderBottom: '2.5px solid #000' }} className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div style={{ background: 'rgba(0,0,0,0.18)', border: '2px solid rgba(0,0,0,0.15)' }} className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
            {ev.emoji ?? '🏆'}
          </div>
          <div className="min-w-0">
            <p style={{ color: banner.text }} className="font-black text-base truncate">{ev.title}</p>
            <p style={{ color: banner.text, opacity: 0.7 }} className="text-xs font-medium truncate">{ev.description}</p>
          </div>
        </div>
        {/* Countdown badge for live events */}
        {cd && (
          <div style={{ background:'rgba(0,0,0,0.2)', border:'1.5px solid rgba(0,0,0,0.15)' }} className="rounded-xl px-3 py-1.5 text-right flex-shrink-0">
            <p style={{ color: banner.text, opacity: 0.7 }} className="text-[9px] font-black uppercase tracking-widest">Bitiş</p>
            <p style={{ color: banner.text }} className="font-black text-sm">{cd.d}g {pad(cd.h)}:{pad(cd.m)}</p>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            {/* Status + dates */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black ${meta.cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${status === 'live' ? 'animate-pulse' : ''}`} />
                {meta.label}
              </span>
              {ev.active && status !== 'live' &&
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Aktif</span>}
            </div>
            {/* Meta info */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-400 font-medium">
              <span className="flex items-center gap-1"><Calendar size={10}/>{fmtDate(ev.start_date)} → {fmtDate(ev.end_date)}</span>
              <span className="flex items-center gap-1"><Users size={10}/>{ev.win_count ?? 3} kazanan</span>
              {prizes.length > 0 && <span className="flex items-center gap-1"><Gift size={10}/>{prizes.length} ödül</span>}
            </div>
            {/* Prize chips */}
            {prizes.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {prizes.slice(0, 4).map(r => (
                  <span key={r.rank} className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs font-bold border border-gray-200 dark:border-gray-600">
                    {r.rewardImage} {r.rewardName || '—'}
                  </span>
                ))}
                {prizes.length > 4 && (
                  <span className="inline-flex items-center bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-lg text-xs text-gray-400 border border-gray-200 dark:border-gray-600">
                    +{prizes.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action column */}
          <div className="flex flex-col gap-1 flex-shrink-0">
            <button onClick={onEdit} title="Düzenle" className="p-2 rounded-xl hover:bg-[#7B6EF6]/10 text-gray-400 hover:text-[#7B6EF6] transition-colors border border-transparent hover:border-[#7B6EF6]/30">
              <Edit3 size={14}/>
            </button>
            <button
              onClick={onToggleActive} title={ev.active ? 'Devre Dışı' : 'Aktifleştir'}
              disabled={togglingId === ev.id + 'active'}
              className={`p-2 rounded-xl border transition-colors ${ev.active ? 'text-green-500 bg-green-50 dark:bg-green-900/20 border-green-200' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'}`}>
              {togglingId === ev.id + 'active' ? <Loader2 size={14} className="animate-spin"/> : <Power size={14}/>}
            </button>
            <button
              onClick={onTogglePublish} title={ev.published ? 'Yayından Kaldır' : 'Yayınla'}
              disabled={togglingId === ev.id + 'published'}
              className={`p-2 rounded-xl border transition-colors ${ev.published ? 'text-blue-500 bg-blue-50 dark:bg-blue-900/20 border-blue-200' : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border-transparent'}`}>
              <Send size={14}/>
            </button>
            {deletingId === ev.id ? (
              <div className="flex gap-1">
                <button onClick={onDeleteExecute} className="p-1.5 rounded-lg bg-red-500 text-white"><Check size={12}/></button>
                <button onClick={onDeleteCancel}  className="p-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"><X size={12}/></button>
              </div>
            ) : (
              <button onClick={onDeleteConfirm} title="Sil" className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-200">
                <Trash2 size={14}/>
              </button>
            )}
          </div>
        </div>

        {/* Final winners — event-specific points, locked at end time */}
        {(status === 'ended' || status === 'distributed') && eventWinners.length > 0 && (
          <div className="mt-4 pt-4 border-t-2 border-gray-100 dark:border-gray-700">
            <p className="text-xs font-black text-amber-600 dark:text-amber-400 mb-3 flex items-center gap-1.5">
              <Star size={11} fill="currentColor"/> Kesin Kazananlar (etkinlik puanı)
            </p>
            <div className="space-y-2">
              {eventWinners.map(w => (
                <div key={w.id} className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${w.final_rank === 1 ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700'}`}>
                  <span className="text-lg">{medal(w.final_rank)}</span>
                  <NeoAvatar src={w.profiles?.avatar_url ?? null} name={w.profiles?.username ?? '?'} size={28} shape="circle"/>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{w.profiles?.username ?? '—'}</p>
                    <p className="text-[10px] text-amber-600 font-bold">{w.final_points.toLocaleString()} etkinlik puanı</p>
                    <p className="text-[10px] text-gray-500 truncate">{w.prize_title}</p>
                  </div>
                  {w.distributed ? (
                    <span className="text-[10px] font-black text-green-600 flex-shrink-0">✓ Dağıtıldı</span>
                  ) : (
                    <button
                      onClick={() => onMarkDistributed(w.id)}
                      disabled={distributingId === w.id}
                      className="text-[10px] font-black px-2 py-1 rounded-lg bg-[#7B6EF6] text-white border border-black flex-shrink-0 disabled:opacity-50"
                    >
                      {distributingId === w.id ? '...' : 'Dağıtıldı İşaretle'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── PreviewView ── */
const PreviewView: React.FC<{
  ev: AppEvent; onBack: () => void; onSave: () => void;
  saving: boolean; saved: boolean; isEdit: boolean;
}> = ({ ev, onBack, onSave, saving, saved, isEdit }) => {
  const banner = BANNERS.find(b => b.value === ev.color) ?? BANNERS[0];
  const prizes = Array.isArray(ev.rewards_json) ? ev.rewards_json as RewardPrize[] : [];

  const rankBg: Record<number, string> = {
    1: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20',
    2: 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800',
    3: 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10',
  };

  return (
    <div className="space-y-5">
      <p className="text-xs font-bold text-gray-400 text-center">Kullanıcıların göreceği görünüm</p>

      <div className="card overflow-hidden border-2 border-black dark:border-gray-700 bg-white dark:bg-gray-800">
        {/* Banner */}
        <div style={{ background: banner.value, borderBottom: '3px solid #000', padding: '24px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position:'absolute', top:-40, right:-40, width:130, height:130, borderRadius:'50%', background:'rgba(0,0,0,0.08)' }}/>
          <div style={{ position:'absolute', bottom:-30, left:-20, width:100, height:100, borderRadius:'50%', background:'rgba(0,0,0,0.06)' }}/>
          <div style={{ position:'relative' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(0,0,0,0.15)', border:'1.5px solid rgba(0,0,0,0.15)', borderRadius:999, padding:'3px 10px', fontSize:10, fontWeight:900, color:banner.text, marginBottom:10, letterSpacing:'0.08em' }}>
              <Trophy size={10}/> LEADERBOARD EVENT
            </div>
            <h2 style={{ fontSize:22, fontWeight:900, margin:'0 0 6px', color:banner.text, letterSpacing:'-0.02em' }}>{ev.title || 'Etkinlik Adı'}</h2>
            <p style={{ fontSize:13, margin:0, color:banner.text, opacity:0.75, fontWeight:600 }}>{ev.description || 'Etkinlik açıklaması burada görünür.'}</p>
            <div style={{ display:'flex', gap:16, marginTop:12, fontSize:11, color:banner.text, opacity:0.75, fontWeight:700 }}>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><Calendar size={11}/>{fmtDate(ev.start_date)} → {fmtDate(ev.end_date)}</span>
              <span style={{ display:'flex', alignItems:'center', gap:4 }}><Users size={11}/>{ev.win_count} kazanan</span>
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div className="p-5">
          <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2 text-sm">
            <Gift size={16} className="text-[#7B6EF6]"/> Ödül Havuzu
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {prizes.slice(0, 3).map(r => (
              <div key={r.rank} className={`rounded-2xl p-4 border-2 text-center ${rankBg[r.rank] ?? 'border-gray-200 bg-gray-50'}`}>
                <div className="text-4xl mb-2">{r.rewardImage}</div>
                <p className={`font-black text-sm mb-1 ${r.rank===1?'text-amber-600':r.rank===2?'text-gray-500':'text-orange-500'}`}>{r.label}</p>
                <p className="font-black text-gray-900 dark:text-white text-sm">{r.rewardName || '—'}</p>
                <p className="text-xs text-gray-400 mt-1">×{r.quantity} adet</p>
                {r.pointsRequired > 0 && <p className="text-xs text-[#7B6EF6] font-bold mt-0.5">Min. {r.pointsRequired.toLocaleString()} puan</p>}
              </div>
            ))}
          </div>
          {prizes.length > 3 && (
            <p className="text-xs text-center text-gray-400 mt-3">+{prizes.length - 3} daha fazla ödül</p>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 font-black text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 flex items-center justify-center gap-2">
          <ArrowLeft size={15}/> Düzenle
        </button>
        <button onClick={onSave} disabled={saving} className="flex-1 py-3 rounded-xl border-2 border-black bg-[#7B6EF6] text-white font-black flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50 transition-all">
          {saving ? <Loader2 size={15} className="animate-spin"/> : saved ? <><Check size={15}/> Kaydedildi!</> : isEdit ? '💾 Kaydet' : '✨ Oluştur'}
        </button>
      </div>
    </div>
  );
};

export default AdminRewardEvents;
