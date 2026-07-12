import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Gamepad2,
  Plus,
  RefreshCw,
  Save,
  Star,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import {
  createGameConfig,
  deleteGameConfig,
  getGamesConfig,
  updateGameConfig,
  type GameConfig,
} from '../../services/config';
import { useRealtimeTable } from '../../hooks/useRealtime';

const GAME_TYPES = [
  { id: 'spin', label: 'Spin Wheel', emoji: '🎰' },
  { id: 'memory', label: 'Memory Game', emoji: '🧩' },
  { id: 'catch', label: 'Catch Game', emoji: '🎁' },
  { id: 'flappy', label: 'Flappy Bird', emoji: '🐦' },
  { id: 'snake', label: 'Snake', emoji: '🐍' },
];

type GameForm = {
  name: string;
  description: string;
  gameId: string;
  icon: string;
  color: string;
  enabled: boolean;
  maxPlays: string;
  maxPoints: string;
  spinPrizes: SpinPrizeForm[];
  baseConfig: Record<string, unknown>;
};

type SpinPrizeForm = {
  value: string;
  color: string;
};

const DEFAULT_SPIN_PRIZES: SpinPrizeForm[] = [
  { value: '10', color: '#7B6EF6' },
  { value: '50', color: '#4F8EF7' },
  { value: '5', color: '#22c55e' },
  { value: '100', color: '#f59e0b' },
  { value: '25', color: '#ef4444' },
  { value: '75', color: '#8b5cf6' },
  { value: '0', color: '#6b7280' },
  { value: '200', color: '#ec4899' },
];

const emptyForm: GameForm = {
  name: '',
  description: '',
  gameId: 'spin',
  icon: '🎮',
  color: '#7B6EF6',
  enabled: true,
  maxPlays: '3',
  maxPoints: '100',
  spinPrizes: DEFAULT_SPIN_PRIZES,
  baseConfig: {},
};

function getSpinPrizes(config: Record<string, unknown>): SpinPrizeForm[] {
  if (!Array.isArray(config.prizes)) return DEFAULT_SPIN_PRIZES.map(prize => ({ ...prize }));

  const prizes = config.prizes.flatMap((item): SpinPrizeForm[] => {
    if (typeof item === 'number' && Number.isFinite(item)) {
      return [{ value: String(Math.max(0, Math.round(item))), color: '#7B6EF6' }];
    }
    if (!item || typeof item !== 'object') return [];
    const prize = item as Record<string, unknown>;
    const value = Number(prize.value);
    if (!Number.isFinite(value)) return [];
    return [{
      value: String(Math.max(0, Math.round(value))),
      color: typeof prize.color === 'string' ? prize.color : '#7B6EF6',
    }];
  });

  return prizes.length >= 2 ? prizes : DEFAULT_SPIN_PRIZES.map(prize => ({ ...prize }));
}

function spinPrizeValue(prize: SpinPrizeForm): number {
  return Math.max(0, Number.parseInt(prize.value, 10) || 0);
}

function getGameId(game: GameConfig): string {
  const raw = game.config?.game_id;
  if (typeof raw === 'string' && GAME_TYPES.some(g => g.id === raw)) return raw;
  const name = game.name.toLowerCase();
  if (name.includes('memory') || name.includes('haf')) return 'memory';
  if (name.includes('catch') || name.includes('gift')) return 'catch';
  if (name.includes('flappy') || name.includes('bird')) return 'flappy';
  if (name.includes('snake') || name.includes('yilan') || name.includes('yılan')) return 'snake';
  return 'spin';
}

function dedupeGamesByType(games: GameConfig[]): GameConfig[] {
  const seen = new Set<string>();
  return games.filter(game => {
    const gameId = getGameId(game);
    if (seen.has(gameId)) return false;
    seen.add(gameId);
    return true;
  });
}

function toForm(game: GameConfig): GameForm {
  return {
    name: game.name,
    description: game.description ?? '',
    gameId: getGameId(game),
    icon: game.icon ?? GAME_TYPES.find(g => g.id === getGameId(game))?.emoji ?? '🎮',
    color: game.color ?? '#7B6EF6',
    enabled: game.enabled,
    maxPlays: String(game.max_plays_per_day),
    maxPoints: String(game.max_points_per_play),
    spinPrizes: getSpinPrizes(game.config ?? {}),
    baseConfig: game.config ?? {},
  };
}

function toPayload(form: GameForm) {
  const type = GAME_TYPES.find(g => g.id === form.gameId) ?? GAME_TYPES[0];
  const spinPrizes = form.spinPrizes.map(prize => ({
    value: spinPrizeValue(prize),
    color: prize.color,
  }));
  const maxPoints = form.gameId === 'spin'
    ? Math.max(...spinPrizes.map(prize => prize.value), 0)
    : Math.max(0, Number.parseInt(form.maxPoints, 10) || 0);
  const config: Record<string, unknown> = { ...form.baseConfig, game_id: form.gameId };
  if (form.gameId === 'spin') {
    config.prizes = spinPrizes;
  } else {
    delete config.prizes;
  }

  return {
    name: form.name.trim() || type.label,
    description: form.description.trim() || null,
    enabled: form.enabled,
    max_plays_per_day: Math.max(0, Number.parseInt(form.maxPlays, 10) || 0),
    max_points_per_play: maxPoints,
    icon: form.icon.trim() || type.emoji,
    color: form.color.trim() || '#7B6EF6',
    config,
  };
}

const AdminGames: React.FC = () => {
  const [games, setGames] = useState<GameConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GameForm>(emptyForm);
  const [feedback, setFeedback] = useState('');

  const loadGames = useCallback(async () => {
    try {
      setGames(dedupeGamesByType(await getGamesConfig()));
    } catch (err) {
      console.error(err);
      setFeedback('Oyunlar yüklenemedi. Supabase RLS / games_config kontrol edin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadGames(); }, [loadGames]);
  useRealtimeTable('games_config', loadGames);

  const stats = useMemo(() => {
    const active = games.filter(g => g.enabled);
    const avg = games.length ? Math.round(games.reduce((s, g) => s + g.max_points_per_play, 0) / games.length) : 0;
    return { total: games.length, active: active.length, disabled: games.length - active.length, avg };
  }, [games]);

  const beginCreate = () => {
    setEditingId('new');
    setForm({ ...emptyForm, spinPrizes: DEFAULT_SPIN_PRIZES.map(prize => ({ ...prize })) });
    setFeedback('');
  };

  const beginEdit = (game: GameConfig) => {
    setEditingId(game.id);
    setForm(toForm(game));
    setFeedback('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const saveGame = async () => {
    setSaving(true);
    setFeedback('');
    try {
      if (form.gameId === 'spin' && form.spinPrizes.length < 2) {
        throw new Error('Spin Wheel en az 2 ödül dilimine sahip olmalı.');
      }
      const payload = toPayload(form);
      if (editingId === 'new') {
        await createGameConfig(payload);
      } else if (editingId) {
        await updateGameConfig(editingId, payload);
      }
      await loadGames();
      cancelEdit();
      setFeedback('Oyun ayarları kaydedildi. Kullanıcı sayfası realtime güncellenecek.');
    } catch (err) {
      console.error(err);
      setFeedback(err instanceof Error ? err.message : 'Kaydedilemedi.');
    } finally {
      setSaving(false);
    }
  };

  const toggleGame = async (game: GameConfig) => {
    await updateGameConfig(game.id, { enabled: !game.enabled });
    setGames(prev => prev.map(g => g.id === game.id ? { ...g, enabled: !g.enabled } : g));
  };

  const removeGame = async (game: GameConfig) => {
    if (!window.confirm(`${game.name} silinsin mi? Kullanıcı oyun listesinden kalkacak.`)) return;
    await deleteGameConfig(game.id);
    await loadGames();
  };

  if (loading) return (
    <AdminLayout>
      <div className="p-6 flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-5 max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7B6EF6]">Oyun Kontrol Merkezi</p>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white">Oyun Yönetimi</h1>
            <p className="text-sm font-bold text-gray-500">Admin değişiklikleri Supabase realtime ile kullanıcı oyun sayfasına düşer.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => void loadGames()} className="btn-secondary flex items-center gap-2">
              <RefreshCw size={16} /> Yenile
            </button>
            <button onClick={beginCreate} className="btn-primary flex items-center gap-2">
              <Plus size={16} /> Yeni Oyun
            </button>
          </div>
        </div>

        {feedback && (
          <div className="card p-3 text-sm font-black text-gray-900 dark:text-white">
            {feedback}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            ['Toplam', stats.total, Gamepad2, '#7B6EF6'],
            ['Aktif', stats.active, ToggleRight, '#22c55e'],
            ['Kapalı', stats.disabled, ToggleLeft, '#ef4444'],
            ['Ort. Ödül', stats.avg, Star, '#f59e0b'],
          ].map(([label, value, Icon, color]) => (
            <div key={String(label)} className="card p-4">
              {React.createElement(Icon as typeof Gamepad2, { size: 22, color: String(color), className: 'mb-3' })}
              <p className="font-black text-2xl text-gray-900 dark:text-white">{String(value)}</p>
              <p className="text-xs font-bold text-gray-500">{String(label)}</p>
            </div>
          ))}
        </div>

        {editingId && (
          <div className="card p-4 lg:p-5 space-y-4 border-[#7B6EF6]">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-xl text-gray-900 dark:text-white">{editingId === 'new' ? 'Yeni oyun ekle' : 'Oyunu düzenle'}</h2>
              <button onClick={cancelEdit} className="p-2 rounded-xl border-2 border-black dark:border-gray-600">
                <X size={16} />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">Oyun adı</span>
                <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">Oynanacak oyun tipi</span>
                <select className="input-field" value={form.gameId} onChange={e => {
                  const type = GAME_TYPES.find(g => g.id === e.target.value) ?? GAME_TYPES[0];
                  setForm(f => ({ ...f, gameId: type.id, icon: f.icon || type.emoji }));
                }}>
                  {GAME_TYPES.map(type => <option key={type.id} value={type.id}>{type.emoji} {type.label}</option>)}
                </select>
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
                <span className="text-xs font-black text-gray-500 uppercase">Renk</span>
                <input className="input-field" type="color" value={form.color} onChange={e => setForm(f => ({ ...f, color: e.target.value }))} />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-black text-gray-500 uppercase">Günlük oynama</span>
                <input className="input-field" type="number" min={0} value={form.maxPlays} onChange={e => setForm(f => ({ ...f, maxPlays: e.target.value }))} />
              </label>
              {form.gameId !== 'spin' && (
                <label className="space-y-1">
                  <span className="text-xs font-black text-gray-500 uppercase">Oyun ödülü</span>
                  <input className="input-field" type="number" min={0} value={form.maxPoints} onChange={e => setForm(f => ({ ...f, maxPoints: e.target.value }))} />
                </label>
              )}
              <button
                onClick={() => setForm(f => ({ ...f, enabled: !f.enabled }))}
                className={`rounded-2xl border-3 border-black px-4 py-3 font-black ${form.enabled ? 'bg-green-400 text-black' : 'bg-gray-200 text-gray-600'}`}
              >
                {form.enabled ? 'Aktif' : 'Kapalı'}
              </button>

              {form.gameId === 'spin' && (
                <div className="sm:col-span-2 lg:col-span-3 rounded-2xl border-2 border-[#7B6EF6]/40 bg-[#7B6EF6]/5 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-black text-gray-900 dark:text-white">Spin Wheel ödülleri</p>
                      <p className="text-xs font-bold text-gray-500">Her satır çarktaki bir ödül dilimidir.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setForm(f => ({
                        ...f,
                        spinPrizes: [...f.spinPrizes, { value: '0', color: '#7B6EF6' }],
                      }))}
                      className="btn-secondary flex items-center gap-2 shrink-0"
                    >
                      <Plus size={15} /> Ödül ekle
                    </button>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2">
                    {form.spinPrizes.map((prize, index) => (
                      <div key={index} className="flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 p-2 border border-gray-200 dark:border-gray-700">
                        <span className="w-7 text-center text-xs font-black text-gray-400">{index + 1}</span>
                        <input
                          aria-label={`Ödül ${index + 1} puanı`}
                          className="input-field min-w-0 flex-1"
                          type="number"
                          min={0}
                          value={prize.value}
                          onChange={e => setForm(f => ({
                            ...f,
                            spinPrizes: f.spinPrizes.map((item, itemIndex) => itemIndex === index ? { ...item, value: e.target.value } : item),
                          }))}
                        />
                        <span className="text-xs font-black text-gray-500">puan</span>
                        <input
                          aria-label={`Ödül ${index + 1} rengi`}
                          className="h-10 w-10 shrink-0 rounded-lg border-0 bg-transparent p-0"
                          type="color"
                          value={prize.color}
                          onChange={e => setForm(f => ({
                            ...f,
                            spinPrizes: f.spinPrizes.map((item, itemIndex) => itemIndex === index ? { ...item, color: e.target.value } : item),
                          }))}
                        />
                        <button
                          type="button"
                          aria-label={`Ödül ${index + 1} sil`}
                          disabled={form.spinPrizes.length <= 2}
                          onClick={() => setForm(f => ({ ...f, spinPrizes: f.spinPrizes.filter((_, itemIndex) => itemIndex !== index) }))}
                          className="p-2 text-red-500 disabled:opacity-30"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs font-black text-[#7B6EF6]">
                    Kartta gösterilecek maksimum: {Math.max(...form.spinPrizes.map(spinPrizeValue), 0)} puan
                  </p>
                </div>
              )}
            </div>

            <button disabled={saving} onClick={() => void saveGame()} className="btn-primary w-full flex items-center justify-center gap-2">
              <Save size={16} /> {saving ? 'Kaydediliyor...' : 'Kaydet ve yayınla'}
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {games.map(game => {
            const type = GAME_TYPES.find(g => g.id === getGameId(game)) ?? GAME_TYPES[0];
            const isSpin = type.id === 'spin';
            const spinPrizes = isSpin ? getSpinPrizes(game.config ?? {}) : [];
            const spinMax = Math.max(...spinPrizes.map(spinPrizeValue), 0);
            return (
              <div key={game.id} className="card p-4 flex gap-4 items-start">
                <div
                  className="w-16 h-16 rounded-2xl border-3 border-black flex items-center justify-center text-3xl shadow-[0_4px_0_#000]"
                  style={{ background: game.color ?? '#7B6EF6' }}
                >
                  {game.icon ?? type.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-black text-lg text-gray-900 dark:text-white">{game.name}</p>
                      <p className="text-xs font-bold text-gray-500">{type.label} · {game.description || 'Açıklama yok'}</p>
                    </div>
                    <button onClick={() => void toggleGame(game)} className={game.enabled ? 'text-green-500' : 'text-gray-400'}>
                      {game.enabled ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 my-3">
                    <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-2">
                      <p className="text-xs font-bold text-gray-500">Günlük</p>
                      <p className="font-black text-gray-900 dark:text-white">{game.max_plays_per_day} oyun</p>
                    </div>
                    <div className="rounded-xl bg-gray-100 dark:bg-gray-800 p-2">
                      <p className="text-xs font-bold text-gray-500">{isSpin ? 'Çark ödülleri' : 'Oyun ödülü'}</p>
                      <p className="font-black text-amber-500">
                        {isSpin ? `${spinPrizes.length} dilim · max ${spinMax}` : `${game.max_points_per_play} puan`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => beginEdit(game)} className="btn-secondary flex-1">Düzenle</button>
                    <button onClick={() => void removeGame(game)} className="px-4 rounded-xl border-3 border-black bg-red-500 text-white shadow-[0_4px_0_#000]">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGames;
