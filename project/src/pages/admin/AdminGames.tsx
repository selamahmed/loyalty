import React, { useState } from 'react';
import { Gamepad2, CreditCard as Edit3, ToggleLeft, ToggleRight, Star, Users } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { tr } from '../../lib/tr';

const gamesData = [
  { id: '1', name: 'Spin Wheel', emoji: '🎰', active: true, plays: 8420, avgPoints: 42, maxPoints: 200 },
  { id: '2', name: 'Memory Game', emoji: '🧩', active: true, plays: 6210, avgPoints: 95, maxPoints: 200 },
  { id: '3', name: 'Quiz', emoji: '🧠', active: true, plays: 9840, avgPoints: 75, maxPoints: 125 },
  { id: '4', name: 'Catch Game', emoji: '🎁', active: true, plays: 5670, avgPoints: 35, maxPoints: 100 },
  { id: '5', name: 'Daily Challenge', emoji: '⚡', active: true, plays: 4210, avgPoints: 120, maxPoints: 150 },
];

const AdminGames: React.FC = () => {
  const [games, setGames] = useState(gamesData);
  const [editing, setEditing] = useState<string | null>(null);
  const [editMax, setEditMax] = useState('');

  const toggleGame = (id: string) => setGames(prev => prev.map(g => g.id === id ? { ...g, active: !g.active } : g));

  const handleSaveMax = (id: string) => {
    setGames(prev => prev.map(g => g.id === id ? { ...g, maxPoints: parseInt(editMax) || g.maxPoints } : g));
    setEditing(null);
  };

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Games Management</h1>

        {/* Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card p-4 text-center">
            <Gamepad2 size={20} className="text-[#7B6EF6] dark:text-[#4F8EF7] mx-auto mb-2" />
            <p className="font-black text-xl text-gray-900 dark:text-white">{games.length}</p>
            <p className="text-xs text-gray-500">Total Games</p>
          </div>
          <div className="card p-4 text-center">
            <Users size={20} className="text-green-500 mx-auto mb-2" />
            <p className="font-black text-xl text-gray-900 dark:text-white">{games.reduce((s, g) => s + g.plays, 0).toLocaleString()}</p>
            <p className="text-xs text-gray-500">Total Plays</p>
          </div>
          <div className="card p-4 text-center">
            <Star size={20} className="text-amber-500 mx-auto mb-2" />
            <p className="font-black text-xl text-gray-900 dark:text-white">{Math.round(games.reduce((s, g) => s + g.avgPoints, 0) / games.length)}</p>
            <p className="text-xs text-gray-500">Avg Pts/Play</p>
          </div>
        </div>

        {/* Games list */}
        <div className="space-y-3">
          {games.map(game => (
            <div key={game.id} className="card p-4 flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 border-2 border-black dark:border-gray-600 flex items-center justify-center text-2xl flex-shrink-0">
                {game.emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-black text-gray-900 dark:text-white">{game.name}</p>
                  <button onClick={() => toggleGame(game.id)} className={`transition-colors ${game.active ? 'text-green-500' : 'text-gray-400'}`}>
                    {game.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center mt-2">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="font-black text-sm text-gray-900 dark:text-white">{game.plays.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Plays</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl">
                    <p className="font-black text-sm text-amber-600 dark:text-amber-400">~{game.avgPoints}</p>
                    <p className="text-xs text-gray-500">Avg Pts</p>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-xl relative">
                    {editing === game.id ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editMax}
                          onChange={e => setEditMax(e.target.value)}
                          className="w-full text-xs font-black bg-transparent border-b-2 border-[#7B6EF6] outline-none text-center"
                          onKeyDown={e => e.key === 'Enter' && handleSaveMax(game.id)}
                          autoFocus
                        />
                        <button onClick={() => handleSaveMax(game.id)} className="text-green-500">
                          <Star size={10} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditing(game.id); setEditMax(game.maxPoints.toString()); }} className="w-full text-left flex items-center justify-between">
                        <div>
                          <p className="font-black text-sm text-[#7B6EF6] dark:text-[#4F8EF7]">{game.maxPoints}</p>
                          <p className="text-xs text-gray-500">Max Pts</p>
                        </div>
                        <Edit3 size={10} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-full"
                      style={{ width: `${(game.plays / Math.max(...games.map(g => g.plays))) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGames;
