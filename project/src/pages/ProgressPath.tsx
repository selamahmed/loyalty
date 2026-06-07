import React from 'react';
import { Lock, Unlock, Star, ChevronRight, Zap, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { progressLevels } from '../data/mockData';
import { tr } from '../lib/tr';

const rarityColors: Record<string, string> = {
  1: 'from-gray-400 to-gray-500',
  2: 'from-green-400 to-emerald-500',
  5: 'from-blue-400 to-cyan-500',
  8: 'from-amber-400 to-orange-500',
  10: 'from-[#7B6EF6] to-[#4F8EF7]',
  15: 'from-pink-500 to-rose-500',
  20: 'from-yellow-400 to-amber-500',
};

const ProgressPath: React.FC = () => {
  const { user, points } = useApp();
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Progress Path</h1>

      {/* Current level card */}
      <div className="card p-5 bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] text-white border-black">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white/80 text-sm">Current Level</p>
            <h2 className="text-3xl font-black">Level {user.level}</h2>
            <p className="text-white/90 font-medium">Champion</p>
          </div>
          <div className="w-20 h-20 rounded-full border-4 border-white/30 bg-white/20 flex items-center justify-center">
            <span className="text-4xl font-black">{user.level}</span>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex justify-between text-xs text-white/70 mb-1">
            <span>{user.xp.toLocaleString()} XP</span>
            <span>{user.xpToNext.toLocaleString()} XP</span>
          </div>
          <div className="h-3 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${xpPercent}%` }} />
          </div>
          <p className="text-xs text-white/60 mt-1 text-center">{user.xpToNext - user.xp} XP to Level {user.level + 1}</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <Zap size={18} className="text-amber-500 mx-auto mb-1" />
          <p className="font-black text-gray-900 dark:text-white">{user.xp.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total XP</p>
        </div>
        <div className="card p-3 text-center">
          <Star size={18} className="text-[#7B6EF6] dark:text-[#4F8EF7] mx-auto mb-1" />
          <p className="font-black text-gray-900 dark:text-white">{points.toLocaleString()}</p>
          <p className="text-xs text-gray-500">Points</p>
        </div>
        <div className="card p-3 text-center">
          <Trophy size={18} className="text-green-500 mx-auto mb-1" />
          <p className="font-black text-gray-900 dark:text-white">{progressLevels.filter(l => l.unlocked).length}</p>
          <p className="text-xs text-gray-500">Levels Done</p>
        </div>
      </div>

      {/* Progress path */}
      <div>
        <h2 className="font-black text-lg text-gray-900 dark:text-white mb-4">Level Rewards</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-4">
            {progressLevels.map((lvl, i) => {
              const isCurrentLevel = lvl.level === user.level;
              const gradKey = Object.keys(rarityColors).find(k => parseInt(k) <= lvl.level) || '1';
              const gradClass = rarityColors[gradKey] || 'from-gray-400 to-gray-500';

              return (
                <div key={lvl.level} className={`relative flex items-center gap-4 pl-4 transition-all duration-200 ${!lvl.unlocked ? 'opacity-60' : ''}`}>
                  {/* Node */}
                  <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center border-2 border-black dark:border-gray-600 flex-shrink-0 ${
                    isCurrentLevel ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] animate-pulse-glow'
                    : lvl.unlocked ? `bg-gradient-to-br ${gradClass}` : 'bg-gray-200 dark:bg-gray-700'
                  }`}>
                    {lvl.unlocked ? (
                      <span className="text-white text-xs font-black">{lvl.level}</span>
                    ) : (
                      <Lock size={14} className="text-gray-500" />
                    )}
                  </div>

                  {/* Content */}
                  <div className={`flex-1 card p-3 ${isCurrentLevel ? 'border-[#7B6EF6] dark:border-[#4F8EF7] shadow-md' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-black text-gray-900 dark:text-white">Lv.{lvl.level} — {lvl.title}</p>
                          {isCurrentLevel && <span className="badge bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white text-xs">Current</span>}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {lvl.unlocked ? (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Unlock size={10} /> Reward: {lvl.reward}
                            </span>
                          ) : (
                            <span>Requires {lvl.xpRequired.toLocaleString()} XP to unlock</span>
                          )}
                        </p>
                      </div>
                      {lvl.rewardPoints > 0 && (
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Star size={12} className="text-amber-500" fill="currentColor" />
                          <span className="text-sm font-black text-amber-600 dark:text-amber-400">+{lvl.rewardPoints}</span>
                        </div>
                      )}
                    </div>

                    {!lvl.unlocked && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{Math.min(100, Math.round((user.xp / lvl.xpRequired) * 100))}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#7B6EF6] dark:bg-[#4F8EF7] rounded-full"
                            style={{ width: `${Math.min(100, (user.xp / lvl.xpRequired) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPath;
