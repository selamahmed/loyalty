import React, { useState } from 'react';
import { Trophy, Lock, Star, Filter } from 'lucide-react';
import { achievements } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';

const rarityConfig = {
  common: { label: tr.achievements.common, bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-600' },
  rare: { label: tr.achievements.rare, bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300 dark:border-blue-700' },
  epic: { label: tr.achievements.epic, bg: 'bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20', text: 'text-[#7B6EF6] dark:text-[#4F8EF7]', border: 'border-[#7B6EF6]/40 dark:border-[#4F8EF7]/40' },
  legendary: { label: tr.achievements.legendary, bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-700' },
};

const Achievements: React.FC = () => {
  const { user } = useApp();
  const [filter, setFilter] = useState<'all' | 'completed' | 'locked'>('all');
  const [category, setCategory] = useState('all');
  const [showParticles, setShowParticles] = useState(false);

  const categories = ['all', ...Array.from(new Set(achievements.map(a => a.category)))];

  const filtered = achievements.filter(a => {
    const matchFilter = filter === 'all' || (filter === 'completed' ? a.completed : !a.completed);
    const matchCat = category === 'all' || a.category === category;
    return matchFilter && matchCat;
  });

  const completedCount = achievements.filter(a => a.completed).length;
  const totalPoints = achievements.filter(a => a.completed).reduce((s, a) => s + a.points, 0);

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto overflow-x-hidden">
      <WinningParticles trigger={showParticles} emoji="⭐" />

      <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{tr.achievements.title}</h1>

      {/* Summary card */}
      <div className="card p-3 sm:p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700 hover:shadow-lg transition-shadow">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-500 border-2 border-black dark:border-gray-600 flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform">
            <Trophy size={20} className="sm:w-7 sm:h-7 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-black text-lg sm:text-xl text-gray-900 dark:text-white">{completedCount} / {achievements.length}</h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{tr.achievements.earned}</p>
            <div className="mt-1.5 sm:mt-2 h-1.5 sm:h-2 bg-amber-200 dark:bg-amber-800 rounded-full overflow-hidden border border-amber-300 dark:border-amber-700">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${(completedCount / achievements.length) * 100}%` }}
              />
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1">
              <Star size={12} className="sm:w-3.5 sm:h-3.5 text-amber-500" fill="currentColor" />
              <span className="font-black text-sm sm:text-base text-amber-600 dark:text-amber-400">{totalPoints.toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-500">{tr.missions.ptsEarned}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'completed', 'locked'] as const).map(f => {
          const filterLabels: Record<string, string> = {
            all: tr.achievements.title,
            completed: tr.home.completed,
            locked: tr.achievements.locked
          };
          return (
          <button
            key={f}
            onClick={() => { playSound('click'); setFilter(f); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm transition-all active:scale-95 hover:shadow-md ${
              filter === f
                ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-black dark:border-gray-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black dark:border-gray-600 hover:bg-gray-50'
            }`}
          >
            {filterLabels[f]}
          </button>
          );
        })}
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { playSound('click'); setCategory(cat); }}
            className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border font-medium text-xs capitalize whitespace-nowrap transition-all flex-shrink-0 active:scale-95 hover:shadow-md ${
              category === cat
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Achievement grid */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <Trophy size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-bold text-gray-500">{tr.common.noData}</p>
        </div>
      ) : (
        <div className="space-y-2 sm:grid sm:grid-cols-2 sm:gap-3 sm:space-y-0 animate-fadeIn">
          {filtered.map((ach, index) => {
            const rarity = rarityConfig[ach.rarity as keyof typeof rarityConfig];
            const progress = Math.round((ach.progress / ach.total) * 100);
            return (
              <div
                key={ach.id}
                className={`card p-3 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 transform active:scale-95 cursor-pointer ${ach.completed ? '' : 'opacity-75'}`}
                style={{ animation: `slideIn 0.3s ease-out ${index * 0.05}s both` }}
                onClick={() => {
                  if (ach.completed) {
                    playSound('success');
                    setShowParticles(true);
                    setTimeout(() => setShowParticles(false), 2000);
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${rarity.bg} border-2 ${rarity.border} flex items-center justify-center flex-shrink-0 relative`}>
                    <span className="text-xl">{ach.icon}</span>
                    {!ach.completed && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gray-400 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <Lock size={9} className="text-white" />
                      </div>
                    )}
                    {ach.completed && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <svg viewBox="0 0 10 10" className="w-3 h-3" fill="none">
                          <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                      <p className="font-black text-gray-900 dark:text-white text-sm leading-tight">{ach.title}</p>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${rarity.bg} ${rarity.text}`}>{rarity.label}</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{ach.description}</p>

                    {!ach.completed && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{ach.progress}/{ach.total}</span>
                          <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#7B6EF6] to-[#4F8EF7] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-1 mt-2">
                      <Star size={10} className="text-amber-500" fill="currentColor" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">+{ach.points} pts</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Achievements;
