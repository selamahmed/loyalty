import React, { useState } from 'react';
import { Target, Star, Check, Clock, Zap, Calendar, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { missions } from '../data/mockData';
import { tr } from '../lib/tr';
import { playSound } from '../lib/sounds';
import { WinningParticles } from '../components/WinningParticles';

const Missions: React.FC = () => {
  const { addPoints, showRewardPopup } = useApp();
  const [missionState, setMissionState] = useState(missions.map(m => ({ ...m })));
  const [tab, setTab] = useState<'daily' | 'weekly'>('daily');
  const [showParticles, setShowParticles] = useState(false);

  const filtered = missionState.filter(m => m.category === tab);
  const completed = filtered.filter(m => m.completed).length;
  const totalPts = filtered.reduce((s, m) => s + m.points, 0);
  const earnedPts = filtered.filter(m => m.completed).reduce((s, m) => s + m.points, 0);

  const handleComplete = (id: string) => {
    setMissionState(prev => prev.map(m => {
      if (m.id === id && !m.completed) {
        addPoints(m.points);
        playSound('level-up');
        showRewardPopup({ type: 'reward', title: 'Mission Complete!', subtitle: m.title, points: m.points });

        // Check if all missions are completed
        const allAfterCompletion = prev.map(ms => ms.id === id ? { ...ms, completed: true } : ms);
        const allCompleted = allAfterCompletion.filter(ms => ms.category === tab && ms.completed).length === filtered.length;

        if (allCompleted) {
          setShowParticles(true);
          playSound('success');
          setTimeout(() => setShowParticles(false), 2000);
        }

        return { ...m, completed: true };
      }
      return m;
    }));
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <WinningParticles trigger={showParticles} emoji="🏆" />

      <h1 className="text-2xl font-black text-gray-900 dark:text-white">{tr.missions.title}</h1>

      {/* Tab */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-black dark:border-gray-600 p-1 hover:shadow-md transition-shadow">
        {(['daily', 'weekly'] as const).map(t => (
          <button
            key={t}
            onClick={() => { playSound('click'); setTab(t); }}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-200 active:scale-95 ${
              tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-black dark:border-gray-500 shadow-md' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t === 'daily' ? `📅 ${tr.missions.daily}` : `📆 ${tr.missions.weekly}`}
          </button>
        ))}
      </div>

      {/* Progress summary */}
      <div className="card p-5 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tr.missions.progress}</p>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">{completed}/{filtered.length} {tr.missions.completed}</h2>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Star size={14} className="text-amber-500" fill="currentColor" />
              <span className="font-black text-amber-600 dark:text-amber-400">{earnedPts}/{totalPts}</span>
            </div>
            <p className="text-xs text-gray-500">{tr.missions.ptsEarned}</p>
          </div>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
          <div
            className="h-full bg-gradient-to-r from-[#7B6EF6] to-[#4F8EF7] rounded-full transition-all duration-500"
            style={{ width: `${filtered.length > 0 ? (completed / filtered.length) * 100 : 0}%` }}
          />
        </div>
        {completed === filtered.length && filtered.length > 0 && (
          <div className="mt-3 flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700 animate-pulse">
            <Trophy size={14} className="text-green-500" />
            <span className="text-sm font-bold text-green-600 dark:text-green-400">{tr.missions.allComplete || 'All'} {tab} {tr.missions.complete || 'missions'} {tr.missions.allCompleteMsg || 'complete! Great job!'}</span>
          </div>
        )}
      </div>

      {/* Missions list */}
      <div className="space-y-3 animate-fadeIn">
        {filtered.map((mission, index) => (
          <div
            key={mission.id}
            className={`card p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 transform active:scale-95 ${mission.completed ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' : ''}`}
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
            }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border-2 transition-all hover:scale-110 ${
                mission.completed
                  ? 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                  : 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              }`}>
                {mission.completed ? '✓' : mission.icon}
              </div>
              <div className="flex-1">
                <p className={`font-bold text-gray-900 dark:text-white ${mission.completed ? 'line-through text-gray-400 dark:text-gray-500' : ''}`}>
                  {mission.title}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{mission.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{mission.points} pts</span>
                  </div>
                  {mission.completed && (
                    <span className="badge bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold">{tr.missions.completed}</span>
                  )}
                </div>
              </div>
              {!mission.completed ? (
                <button
                  onClick={() => handleComplete(mission.id)}
                  className="flex-shrink-0 px-4 py-2 rounded-2xl bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white font-bold text-sm border-2 border-black dark:border-gray-600 hover:opacity-90 transition-all active:scale-95 hover:shadow-md"
                >
                  {tr.missions.complete}
                </button>
              ) : (
                <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-green-700 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Check size={16} className="text-white" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Reset notice */}
      <div className="card p-3 flex items-center gap-2 bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
        <Clock size={14} className="text-gray-400" />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {tab === 'daily' ? tr.missions.dailyReset : tr.missions.weeklyReset}
        </p>
      </div>

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
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

export default Missions;
