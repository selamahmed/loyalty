import React, { useState, useEffect, useCallback } from 'react';
import { Gamepad2, CreditCard as Edit3, ToggleLeft, ToggleRight, Star, Save, X } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getGamesConfig, updateGameConfig, type GameConfig } from '../../services/config';
import { useRealtimeTable } from '../../hooks/useRealtime';

const AdminGames: React.FC = () => {
  const [games, setGames] = useState<GameConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editMax, setEditMax] = useState('');
  const [editPlays, setEditPlays] = useState('');

  const loadGames = useCallback(async () => {
    try {
      const data = await getGamesConfig();
      setGames(data);
    } catch { setGames([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadGames(); }, [loadGames]);
  useRealtimeTable('games_config', loadGames);

  const toggleGame = async (id: string, current: boolean) => {
    try {
      await updateGameConfig(id, { enabled: !current });
      setGames(prev => prev.map(g => g.id === id ? { ...g, enabled: !current } : g));
    } catch (e) { console.error(e); }
  };

  const handleSaveMax = async (id: string) => {
    const maxPts = parseInt(editMax);
    const maxPlays = parseInt(editPlays);
    if (isNaN(maxPts) && isNaN(maxPlays)) { setEditing(null); return; }
    try {
      const updates: Partial<GameConfig> = {};
      if (!isNaN(maxPts)) updates.max_points_per_play = maxPts;
      if (!isNaN(maxPlays)) updates.max_plays_per_day = maxPlays;
      await updateGameConfig(id, updates);
      setGames(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    } catch (e) { console.error(e); }
    setEditing(null);
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
      <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Oyun Yönetimi</h1>

        {/* Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <Gamepad2 size={20} className="text-[#7B6EF6] dark:text-[#4F8EF7] mx-auto mb-2" />
            <p className="font-black text-xl text-gray-900 dark:text-white">{games.length}</p>
            <p className="text-xs text-gray-500">Toplam Oyun</p>
          </div>
          <div className="card p-4 text-center">
            <ToggleRight size={20} className="text-green-500 mx-auto mb-2" />
            <p className="font-black text-xl text-gray-900 dark:text-white">{games.filter(g => g.enabled).length}</p>
            <p className="text-xs text-gray-500">Aktif Oyun</p>
          </div>
          <div className="card p-4 text-center">
            <Star size={20} className="text-amber-500 mx-auto mb-2" />
            <p className="font-black text-xl text-gray-900 dark:text-white">
              {games.length > 0 ? Math.round(games.reduce((s, g) => s + g.max_points_per_play, 0) / games.length) : 0}
            </p>
            <p className="text-xs text-gray-500">Ort. Maks. Puan</p>
          </div>
        </div>

        {/* Games list */}
        <div className="space-y-3">
          {games.map(game => (
            <div key={game.id} className="card p-4 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl flex-shrink-0"
                style={{ background: `${game.color ?? '#7B6EF6'}15` }}>
                {game.icon ?? '🎮'}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-black text-gray-900 dark:text-white">{game.name}</p>
                  <button onClick={() => toggleGame(game.id, game.enabled)}
                    className={`transition-colors ${game.enabled ? 'text-green-500' : 'text-gray-400'}`}>
                    {game.enabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
                {game.description && <p className="text-xs text-gray-500 mb-2">{game.description}</p>}
                <div className="grid grid-cols-2 gap-3 text-center mt-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    {editing === game.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editPlays} onChange={e => setEditPlays(e.target.value)}
                          className="w-full text-xs font-black bg-transparent border-b-2 border-[#7B6EF6] outline-none text-center"
                          placeholder={game.max_plays_per_day.toString()} />
                      </div>
                    ) : (
                      <div>
                        <p className="font-black text-sm text-gray-900 dark:text-white">{game.max_plays_per_day}</p>
                        <p className="text-xs text-gray-500">Günlük Oyn.</p>
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl relative">
                    {editing === game.id ? (
                      <div className="flex items-center gap-1">
                        <input type="number" value={editMax} onChange={e => setEditMax(e.target.value)}
                          className="w-full text-xs font-black bg-transparent border-b-2 border-[#7B6EF6] outline-none text-center"
                          placeholder={game.max_points_per_play.toString()} />
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(game.id); setEditMax(game.max_points_per_play.toString()); setEditPlays(game.max_plays_per_day.toString()); }}
                        className="w-full text-left flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm text-[#7B6EF6] dark:text-[#4F8EF7]">{game.max_points_per_play}</p>
                          <p className="text-xs text-gray-500">Maks. Puan</p>
                        </div>
                        <Edit3 size={10} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
                {editing === game.id && (
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => handleSaveMax(game.id)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-green-500 text-white font-bold text-xs border-2 border-green-700">
                      <Save size={11} /> Kaydet
                    </button>
                    <button onClick={() => setEditing(null)}
                      className="px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-gray-700 font-bold text-xs border-2 border-black dark:border-gray-600">
                      <X size={11} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGames;
