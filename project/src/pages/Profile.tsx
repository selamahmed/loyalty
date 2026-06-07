import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Zap, Target, CreditCard as Edit3, Settings, LogOut, ChevronRight, TrendingUp, Calendar, Package, Ticket, Tag, Gift, Check, Copy, Clock, Video as LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { achievements, inventory } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, points, setIsLoggedIn } = useApp();
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const completedAchievements = achievements.filter(a => a.completed);

  const typeConfig: Record<string, { color: string; bg: string; icon: LucideIcon }> = {
    coupon: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Tag },
    ticket: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Ticket },
    reward: { color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: Gift },
  };

  const handleCopy = (code: string) => {
    playSound('success');
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const activeInventory = inventory.filter(i => !i.used);
  const displayedInventory = showAllInventory ? activeInventory : activeInventory.slice(0, 3);

  const stats = [
    { label: tr.profile.totalPoints, value: user.totalPoints.toLocaleString(), icon: Star, color: 'text-amber-500' },
    { label: tr.profile.currentLevel, value: `Lv.${user.level}`, icon: TrendingUp, color: 'text-green-500' },
    { label: tr.profile.achievements, value: `${user.achievements}/${user.totalAchievements}`, icon: Trophy, color: 'text-[#7B6EF6]' },
    { label: tr.profile.dayStreak, value: `${user.streak} days`, icon: Zap, color: 'text-orange-500' },
  ];

  const recentAchievements = completedAchievements.slice(0, 4);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Profile header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-black dark:border-gray-600 overflow-hidden">
              <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#7B6EF6] dark:bg-[#4F8EF7] border-2 border-white dark:border-gray-800 flex items-center justify-center">
              <span className="text-white font-black text-xs">{user.level}</span>
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user.username}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <button
                onClick={() => { playSound('click'); navigate('/settings'); }}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <span className="badge bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 text-[#7B6EF6] dark:text-[#4F8EF7] border border-[#7B6EF6]/30">
                Seviye {user.level} • {tr.profile.champion}
              </span>
              <span className="badge bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                <Zap size={10} /> {user.streak}g serisi
              </span>
            </div>
          </div>
        </div>

        {/* XP progress */}
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-2xl">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span>Level {user.level}</span>
            <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
            <span>Level {user.level + 1}</span>
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7B6EF6] to-[#4F8EF7] rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1">{user.xpToNext - user.xp} XP to next level</p>
        </div>

        {/* Join date */}
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Calendar size={14} />
          <span>Member since {new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(stat => (
          <div key={stat.label} className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="font-black text-lg text-gray-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Current points */}
      <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">{tr.profile.availablePoints}</p>
            <div className="flex items-center gap-2">
              <Star size={24} className="text-amber-500" fill="currentColor" />
              <span className="text-4xl font-black text-amber-600 dark:text-amber-400">{points.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/redeem')}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl border-2 border-amber-700 transition-colors"
          >
            {tr.profile.redeem}
          </button>
        </div>
      </div>

      {/* Recent achievements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-black text-lg text-gray-900 dark:text-white">{tr.profile.recentAchievements}</h2>
          <button onClick={() => navigate('/achievements')} className="flex items-center gap-1 text-sm text-[#7B6EF6] dark:text-[#4F8EF7] font-bold">
            {tr.profile.seeAll} <ChevronRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {recentAchievements.map(ach => (
            <div key={ach.id} className="card p-3 text-center hover:scale-105 transition-transform">
              <div className="text-2xl mb-1">{ach.icon}</div>
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">{ach.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Section */}
      {activeInventory.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Package size={18} className="text-[#7B6EF6] dark:text-[#4F8EF7]" />
              {tr.profile.myInventory}
            </h2>
            {activeInventory.length > 3 && (
              <button
                onClick={() => setShowAllInventory(!showAllInventory)}
                className="flex items-center gap-1 text-sm text-[#7B6EF6] dark:text-[#4F8EF7] font-bold"
              >
                {showAllInventory ? 'Daha Az Gör' : `${tr.profile.seeAll} (${activeInventory.length})`} <ChevronRight size={14} className={showAllInventory ? 'rotate-90' : ''} />
              </button>
            )}
          </div>
          <div className="space-y-3">
            {displayedInventory.map(item => {
              const config = typeConfig[item.type];
              const IconComp = config.icon;
              const expired = isExpired(item.expires);

              return (
                <div key={item.id} className={`card p-4 flex items-start gap-4 ${expired ? 'opacity-60' : ''}`}>
                  <div className={`w-12 h-12 rounded-2xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                    <IconComp size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{item.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.description}</p>
                      </div>
                      {expired ? (
                        <span className="badge bg-red-100 dark:bg-red-900/30 text-red-500 text-xs flex-shrink-0">{tr.profile.expired}</span>
                      ) : (
                        <span className={`badge ${config.bg} ${config.color} text-xs flex-shrink-0 capitalize`}>{item.type}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <span className="font-mono text-sm font-bold text-gray-900 dark:text-white tracking-widest">{item.code}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(item.code)}
                        disabled={expired}
                        className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 active:scale-95"
                      >
                        {copiedCode === item.code ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock size={10} />
                      <span>{tr.profile.expires} {new Date(item.expires).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Activity summary */}
      <div className="card p-4">
        <h2 className="font-black text-lg text-gray-900 dark:text-white mb-3">{tr.profile.activitySummary}</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{tr.profile.qrScansThisMonth}</span>
            <span className="font-bold text-gray-900 dark:text-white">12</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{tr.profile.gamesPlayed}</span>
            <span className="font-bold text-gray-900 dark:text-white">47</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{tr.profile.rewardsRedeemed}</span>
            <span className="font-bold text-gray-900 dark:text-white">6</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">{tr.profile.missionsCompleted}</span>
            <span className="font-bold text-gray-900 dark:text-white">23</span>
          </div>
        </div>
      </div>

      {/* Action links */}
      <div className="space-y-2">
        {[
          { icon: Target, label: tr.profile.viewMissions, path: '/missions' },
          { icon: Trophy, label: tr.profile.viewAchievements, path: '/achievements' },
          { icon: Settings, label: tr.profile.accountSettings, path: '/settings' },
        ].map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="w-full card p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
              <item.icon size={17} className="text-gray-600 dark:text-gray-400" />
            </div>
            <span className="flex-1 font-medium text-gray-900 dark:text-white">{item.label}</span>
            <ChevronRight size={16} className="text-gray-400" />
          </button>
        ))}

        <button
          onClick={() => { setIsLoggedIn(false); playSound('click'); navigate('/login'); }}
          className="w-full p-4 flex items-center gap-3 rounded-xl font-black transition-all"
          style={{
            background: 'var(--card-bg)',
            color: 'var(--text-dark)',
            border: '2.5px solid var(--dark-border)',
            boxShadow: '0px 3px 0px var(--dark-border)',
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: '#ef4444',
              color: 'white',
              border: '2px solid var(--dark-border)',
            }}
          >
            <LogOut size={17} />
          </div>
          <span>{tr.profile.logout}</span>
          <ChevronRight size={14} className="ml-auto" />
        </button>
      </div>
    </div>
  );
};

export default Profile;
