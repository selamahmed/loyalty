import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Target,
  Plus,
  RefreshCw,
  Save,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
  Users,
  Calendar,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  MISSION_BEHAVIORS,
  createMission,
  deleteMission,
  getMissionAdminStats,
  getMissionsAdmin,
  resolveMissionSlug,
  updateMission,
  type Mission,
  type MissionCategory,
  type MissionPayload,
} from '../../services/missions';
import { useRealtimeTable } from '../../hooks/useRealtime';

const CATEGORIES: { id: MissionCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'Tümü' },
  { id: 'daily', label: 'Günlük' },
  { id: 'weekly', label: 'Haftalık' },
  { id: 'special', label: 'Özel' },
];

type MissionForm = {
  title: string;
  description: string;
  icon: string;
  points: string;
  category: MissionCategory;
  slug: string;
  sortOrder: string;
  active: boolean;
};

const emptyForm: MissionForm = {
  title: '',
  description: '',
  icon: '🎯',
  points: '20',
  category: 'daily',
  slug: 'daily_visit',
  sortOrder: '0',
  active: true,
};

function toForm(mission: Mission): MissionForm {
  return {
    title: mission.title,
    description: mission.description,
    icon: mission.icon,
    points: String(mission.points),
    category: mission.category,
    slug: resolveMissionSlug(mission) ?? '',
    sortOrder: String(mission.sort_order ?? 0),
    active: mission.active,
  };
}

function toPayload(form: MissionForm): MissionPayload {
  return {
    title: form.title,
    description: form.description,
    icon: form.icon,
    points: Math.max(0, Number.parseInt(form.points, 10) || 0),
    category: form.category,
    active: form.active,
    slug: form.slug.trim() || null,
    sort_order: Math.max(0, Number.parseInt(form.sortOrder, 10) || 0),
  };
}

function behaviorLabel(slug: string | null): string {
  if (!slug) return 'Manuel';
  return MISSION_BEHAVIORS.find(b => b.slug === slug)?.label ?? slug;
}

const AdminMissions: React.FC = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [stats, setStats] = useState({ totalCompletionsToday: 0, totalCompletionsWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MissionForm>(emptyForm);
  const [feedback, setFeedback] = useState('');
  const [filter, setFilter] = useState<MissionCategory | 'all'>('all');

  const loadMissions = useCallback(async () => {
    try {
      const [rows, completionStats] = await Promise.all([
        getMissionsAdmin(),
        getMissionAdminStats(),
      ]);
      setMissions(rows);
      setStats(completionStats);
    } catch (err) {
      console.error(err);
      setFeedback('Görevler yüklenemedi. Supabase RLS / missions tablosunu kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadMissions(); }, [loadMissions]);
  useRealtimeTable('missions', loadMissions);

  const filtered = useMemo(
    () => (filter === 'all' ? missions : missions.filter(m => m.category === filter)),
    [missions, filter],
  );

  const summary = useMemo(() => {
    const active = missions.filter(m => m.active);
    const avg = missions.length
      ? Math.round(missions.reduce((s, m) => s + m.points, 0) / missions.length)
      : 0;
    return { total: missions.length, active: active.length, disabled: missions.length - active.length, avg };
  }, [missions]);

  const availableBehaviors = useMemo(
    () => MISSION_BEHAVIORS.filter(b => b.categories.includes(form.category)),
    [form.category],
  );

  const beginCreate = () => {
    setEditingId('new');
    const defaultBehavior = MISSION_BEHAVIORS.find(b => b.categories.includes('daily'));
    setForm({
      ...emptyForm,
      slug: defaultBehavior?.slug ?? '',
      sortOrder: String(missions.filter(m => m.category === 'daily').length),
    });
    setFeedback('');
  };

  const beginEdit = (mission: Mission) => {
    setEditingId(mission.id);
    setForm(toForm(mission));
    setFeedback('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveMission = async () => {
    if (!form.title.trim()) {
      setFeedback('Görev başlığı zorunludur.');
      return;
    }
    setSaving(true);
    setFeedback('');
    try {
      const payload = toPayload(form);
      if (editingId === 'new') {
        await createMission(payload);
      } else if (editingId) {
        await updateMission(editingId, payload);
      }
      await loadMissions();
      cancelEdit();
      setFeedback('Görev kaydedildi. Kullanıcı sayfası realtime güncellenecek.');
    } catch (err) {
      console.error(err);
      setFeedback(err instanceof Error ? err.message : 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const toggleMission = async (mission: Mission) => {
    await updateMission(mission.id, { active: !mission.active });
    setMissions(prev => prev.map(m => m.id === mission.id ? { ...m, active: !m.active } : m));
  };

  const removeMission = async (mission: Mission) => {
    if (!window.confirm(`${mission.title} silinsin mi? Kullanıcı ilerlemeleri de silinebilir.`)) return;
    await deleteMission(mission.id);
    await loadMissions();
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="p-6 flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-5 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#06b6d4]">Görev Kontrol Merkezi</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Görev Yönetimi</h1>
            <p className="text-sm font-bold text-gray-500">
              Günlük ve haftalık görevleri Supabase üzerinden yönetin. Puanlar görev başına uygulanır.
            </p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => void loadMissions()} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={16} /> Yenile
            </button>
            <button type="button" onClick={beginCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Yeni Görev
            </button>
          </div>
        </div>

        {feedback && (
          <div className="card p-3 text-sm font-black text-gray-900 dark:text-white">{feedback}</div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          {[
            ['Toplam', summary.total, Target, '#06b6d4'],
            ['Aktif', summary.active, ToggleRight, '#22c55e'],
            ['Kapalı', summary.disabled, ToggleLeft, '#ef4444'],
            ['Ort. Puan', summary.avg, Star, '#f59e0b'],
            ['Bugün Tamamlanan', stats.totalCompletionsToday, Calendar, '#7B6EF6'],
            ['Haftalık Tamamlanan', stats.totalCompletionsWeek, Users, '#ec4899'],
          ].map(([label, value, Icon, color]) => (
            <div key={String(label)} className="card p-4">
              {React.createElement(Icon as typeof Target, { size: 22, color: String(color), className: 'mb-3' })}
              <p className="font-black text-2xl text-gray-900 dark:text-white">{String(value)}</p>
              <p className="text-xs font-bold text-gray-500">{String(label)}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-xl font-black text-sm border-2 ${
                filter === cat.id
                  ? 'bg-[#06b6d4] text-white border-black'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {editingId && (
          <div className="card p-4 lg:p-5 space-y-4 border-[#06b6d4]">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-xl text-gray-900 dark:text-white">
                {editingId === 'new' ? 'Yeni görev ekle' : 'Görevi düzenle'}
              </h2>
              <button type="button" onClick={cancelEdit} className="p-2 rounded-xl border-2 border-black dark:border-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-black text-gray-500 uppercase">Başlık</span>
                <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">İkon</span>
                <input className="input-field" value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
              </label>
              <label className="space-y-1 sm:col-span-2">
                <span className="text-xs font-black text-gray-500 uppercase">Açıklama</span>
                <input className="input-field" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">Kategori</span>
                <select
                  className="input-field"
                  value={form.category}
                  onChange={e => {
                    const category = e.target.value as MissionCategory;
                    const behavior = MISSION_BEHAVIORS.find(b => b.categories.includes(category));
                    setForm(f => ({
                      ...f,
                      category,
                      slug: behavior && behavior.categories.includes(category) ? behavior.slug : f.slug,
                    }));
                  }}
                >
                  <option value="daily">Günlük</option>
                  <option value="weekly">Haftalık</option>
                  <option value="special">Özel</option>
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">Otomatik takip</span>
                <select className="input-field" value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}>
                  <option value="">Manuel (otomatik takip yok)</option>
                  {availableBehaviors.map(b => (
                    <option key={b.slug} value={b.slug}>{b.emoji} {b.label}</option>
                  ))}
                </select>
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">Puan</span>
                <input className="input-field" type="number" min={0} value={form.points} onChange={e => setForm(f => ({ ...f, points: e.target.value }))} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">Sıra</span>
                <input className="input-field" type="number" min={0} value={form.sortOrder} onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))} />
              </label>
              <button
                type="button"
                onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                className={`rounded-2xl border-3 border-black px-4 py-3 font-black ${form.active ? 'bg-green-400 text-black' : 'bg-gray-200 text-gray-600'}`}
              >
                {form.active ? 'Aktif' : 'Kapalı'}
              </button>
            </div>

            <p className="text-xs font-bold text-gray-500">
              Otomatik takip seçilirse kullanıcı ilgili aksiyonu yaptığında &quot;Ödülü Al&quot; aktif olur. Puan, burada girilen değerden verilir.
            </p>

            <button type="button" disabled={saving} onClick={() => void saveMission()} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} /> {saving ? 'Kaydediliyor...' : 'Kaydet ve yayınla'}
            </button>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-4xl mb-2">🎯</p>
            <p className="font-black text-gray-900 dark:text-white">Bu kategoride görev yok</p>
            <p className="text-sm text-gray-500 mt-1">Yeni görev ekleyerek başlayın.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-4">
            {filtered.map(mission => {
              const slug = resolveMissionSlug(mission);
              return (
                <div key={mission.id} className="card p-4 flex gap-4 items-start">
                  <div className="w-16 h-16 rounded-2xl border-3 border-black flex items-center justify-center text-3xl shadow-[0_4px_0_#000] bg-cyan-100 dark:bg-cyan-900/30">
                    {mission.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-black text-lg text-gray-900 dark:text-white">{mission.title}</p>
                        <p className="text-xs font-bold text-gray-500">
                          {mission.category === 'daily' ? 'Günlük' : mission.category === 'weekly' ? 'Haftalık' : 'Özel'}
                          {' · '}{behaviorLabel(slug)}
                        </p>
                      </div>
                      <button type="button" onClick={() => void toggleMission(mission)} className={mission.active ? 'text-green-500' : 'text-gray-400'}>
                        {mission.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 my-2 line-clamp-2">{mission.description}</p>
                    <div className="grid grid-cols-2 gap-2 my-3">
                      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-2">
                        <p className="text-xs font-bold text-gray-500">Puan</p>
                        <p className="font-black text-amber-500">{mission.points} pts</p>
                      </div>
                      <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-2">
                        <p className="text-xs font-bold text-gray-500">Sıra</p>
                        <p className="font-black text-gray-900 dark:text-white">{mission.sort_order}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => beginEdit(mission)} className="btn-secondary flex-1">Düzenle</button>
                      <button type="button" onClick={() => void removeMission(mission)} className="px-4 rounded-xl border-3 border-black bg-red-500 text-white shadow-[0_4px_0_#000]">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMissions;
