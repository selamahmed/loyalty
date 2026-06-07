import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Gamepad2, Gift, ChevronRight, Bell, Zap, Target, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { rewards, missions, notifications } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';

const quickActions = [
  { icon: QrCode, label: tr.home.scanQr, path: '/qr', color: 'var(--gradient-start)' },
  { icon: Gamepad2, label: tr.home.playGames, path: '/games', color: '#22c55e' },
  { icon: Gift, label: tr.home.rewards, path: '/shop', color: '#f59e0b' },
  { icon: Target, label: tr.home.missions, path: '/missions', color: '#ef4444' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, points } = useApp();
  const [showParticles, setShowParticles] = useState(false);
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const dailyMissions = missions.filter(m => m.category === 'daily');
  const completedToday = dailyMissions.filter(m => m.completed).length;
  const featuredRewards = rewards.filter(r => r.featured).slice(0, 3);
  const unreadNotifs = notifications.filter(n => !n.read);

  const handleLevelUp = () => {
    setShowParticles(true);
    playSound('level-up');
    setTimeout(() => setShowParticles(false), 2000);
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-x-hidden">
      <WinningParticles trigger={showParticles} emoji="🌟" />
      {/* Hero Card */}
      <div
        className="card p-3 sm:p-4 lg:p-6"
        style={{
          background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
          color: 'white',
          border: '2px solid var(--dark-border)',
          boxShadow: '0px 6px 0px var(--dark-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="absolute -top-8 -right-8 w-24 sm:w-32 h-24 sm:h-32 rounded-full opacity-20" style={{ background: 'white' }} />
        <div className="relative">
          <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-white/80 text-xs sm:text-sm">{tr.home.welcomeBack}</p>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black truncate">{user.username}</h1>
              <div className="flex items-center gap-1 sm:gap-2 mt-1">
                <Zap size={12} className="sm:w-3.5 sm:h-3.5" />
                <span className="text-xs sm:text-sm">{user.streak} {tr.home.streak}</span>
              </div>
            </div>
            <div className="text-center flex-shrink-0">
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full overflow-hidden border-2 border-white/50"
                style={{ boxShadow: '0px 3px 0px rgba(255,255,255,0.3)' }}
              >
                <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
              </div>
              <div className="mt-1.5 sm:mt-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 rounded-full text-xs font-black border border-white/30">
                Lv.{user.level}
              </div>
            </div>
          </div>

          {/* Points */}
          <div
            className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl border-2 mb-3 sm:mb-4"
            style={{
              background: 'rgba(255,255,255,0.2)',
              borderColor: 'rgba(255,255,255,0.3)',
            }}
          >
            <Star size={20} className="sm:w-6 sm:h-6" fill="white" />
            <div className="flex-1 min-w-0">
              <p className="text-xs opacity-80">{tr.home.currentBalance}</p>
              <p className="text-xl sm:text-2xl lg:text-3xl font-black">{points.toLocaleString()}</p>
            </div>
            <button
              onClick={() => navigate('/redeem')}
              className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white text-[#7c3aed] rounded-xl font-black text-xs sm:text-sm border-2 border-white flex-shrink-0 transition-all active:scale-95 hover:shadow-md"
              style={{ boxShadow: '0px 2px 0px rgba(0,0,0,0.2)' }}
              onMouseEnter={() => playSound('click')}
            >
              {tr.home.redeem}
            </button>
          </div>

          {/* XP Bar */}
          <div>
            <div className="flex justify-between text-xs opacity-80 mb-1">
              <span>Lv.{user.level} → {user.level + 1}</span>
              <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
            </div>
            <div
              className="h-2 sm:h-3 rounded-full overflow-hidden border border-white/30"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <div className="h-full bg-white rounded-full transition-all duration-500" style={{ width: `${xpPercent}%` }} />
            </div>
            <p className="text-xs opacity-60 mt-1">{user.xpToNext - user.xp} XP sonraki seviye için</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 style={{ color: 'var(--text-dark)' }} className="text-base sm:text-lg font-black mb-2 sm:mb-3">{tr.home.quickActions}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {quickActions.map(action => (
            <button
              key={action.path}
              onClick={() => { playSound('click'); navigate(action.path); }}
              className="card p-2 sm:p-3 flex flex-col items-center gap-1.5 sm:gap-2 hover:scale-105 transition-all active:scale-95"
              style={{
                background: 'var(--card-bg)',
                border: '2px solid var(--dark-border)',
                boxShadow: '0px 4px 0px var(--dark-border)',
              }}
            >
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: action.color,
                  color: 'white',
                  border: '2px solid var(--dark-border)',
                }}
              >
                <action.icon size={16} className="sm:w-5 sm:h-5" />
              </div>
              <span style={{ color: 'var(--text-dark)' }} className="text-xs font-black text-center leading-tight">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Daily Missions */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 style={{ color: 'var(--text-dark)' }} className="font-black text-base sm:text-lg">{tr.home.dailyMissions}</h2>
          <button onClick={() => navigate('/missions')} className="flex items-center gap-1 text-xs sm:text-sm font-black" style={{ color: 'var(--primary-blue)' }}>
            {tr.home.seeAll} <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
        <div className="card p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3">
            <span style={{ color: 'var(--text-dark)' }} className="text-sm font-600">{completedToday}/{dailyMissions.length} {tr.home.completed}</span>
            <span
              className="badge text-xs"
              style={{
                background: 'var(--tab-bg)',
                borderColor: 'var(--dark-border)',
                color: 'var(--text-dark)',
              }}
            >
              <Star size={10} fill="currentColor" /> {dailyMissions.reduce((acc, m) => acc + m.points, 0)} pts total
            </span>
          </div>
          <div
            className="h-2 rounded-full overflow-hidden mb-3 border border-var(--divider-dash)"
            style={{
              background: 'var(--tab-bg)',
              borderColor: 'var(--divider-dash)',
            }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${(completedToday / dailyMissions.length) * 100}%`,
                background: 'linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
              }}
            />
          </div>
          <div className="space-y-2">
            {dailyMissions.slice(0, 3).map(mission => (
              <div key={mission.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-button flex items-center justify-center text-base flex-shrink-0 border-2"
                  style={{
                    background: mission.completed ? '#22c55e' : 'var(--tab-bg)',
                    borderColor: 'var(--dark-border)',
                    color: mission.completed ? 'white' : 'var(--text-dark)',
                  }}
                >
                  {mission.completed ? '✓' : mission.icon}
                </div>
                <div className="flex-1">
                  <p
                    className="text-sm font-600"
                    style={{
                      color: mission.completed ? 'var(--text-muted)' : 'var(--text-dark)',
                      textDecoration: mission.completed ? 'line-through' : 'none',
                    }}
                  >
                    {mission.title}
                  </p>
                </div>
                <span
                  className="text-xs font-black"
                  style={{
                    color: mission.completed ? '#22c55e' : '#f59e0b',
                  }}
                >
                  +{mission.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Rewards */}
      <div>
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h2 style={{ color: 'var(--text-dark)' }} className="font-black text-base sm:text-lg">{tr.home.featuredRewards}</h2>
          <button onClick={() => navigate('/shop')} className="flex items-center gap-1 text-xs sm:text-sm font-black" style={{ color: 'var(--primary-blue)' }}>
            {tr.home.shopAll} <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {featuredRewards.map(reward => (
            <div
              key={reward.id}
              className="card"
              style={{
                background: 'var(--card-bg)',
                border: '2px solid var(--dark-border)',
                boxShadow: '0px 4px 0px var(--dark-border)',
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              onClick={() => navigate('/shop')}
            >
              <div className="h-24 sm:h-28 lg:h-32 rounded-t-xl sm:rounded-t-2xl overflow-hidden border-b-2 border-var(--dark-border)">
                <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-2 sm:p-3">
                {reward.limited && (
                  <span
                    className="badge text-xs mb-2 inline-block"
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      borderColor: '#ef4444',
                    }}
                  >
                    {tr.shop.limited}
                  </span>
                )}
                <p style={{ color: 'var(--text-dark)' }} className="font-black text-sm leading-tight mb-1 truncate">{reward.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1">
                    <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#f59e0b' }} className="font-black text-sm">{reward.points.toLocaleString()}</span>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Preview */}
      {unreadNotifs.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-2">
              <h2 style={{ color: 'var(--text-dark)' }} className="font-black text-base sm:text-lg">{tr.notifications.title}</h2>
              <span
                className="badge text-xs px-2 py-0.5"
                style={{
                  background: '#ef4444',
                  color: 'white',
                  borderColor: '#ef4444',
                }}
              >
                {unreadNotifs.length}
              </span>
            </div>
            <button onClick={() => navigate('/notifications')} className="flex items-center gap-1 text-xs sm:text-sm font-black" style={{ color: 'var(--primary-blue)' }}>
              {tr.home.seeAll} <ChevronRight size={12} className="sm:w-3.5 sm:h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {unreadNotifs.slice(0, 2).map(notif => (
              <div
                key={notif.id}
                className="card p-3 sm:p-4 flex items-start gap-2 sm:gap-3"
                style={{
                  background: 'var(--card-bg)',
                  border: '2px solid var(--primary-blue)',
                  boxShadow: '0px 4px 0px var(--dark-border)',
                }}
              >
                <span className="text-lg sm:text-xl">{notif.icon}</span>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--text-dark)' }} className="font-black text-xs sm:text-sm">{notif.title}</p>
                  <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-0.5 line-clamp-2">{notif.message}</p>
                </div>
                <span style={{ color: 'var(--text-muted)' }} className="text-xs whitespace-nowrap flex-shrink-0">{notif.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="card p-3 sm:p-4 text-center" style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <Trophy size={16} className="sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2" style={{ color: '#f59e0b' }} />
          <p style={{ color: 'var(--text-dark)' }} className="font-black text-lg sm:text-xl">#{user.rank}</p>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs">{tr.home.rank}</p>
        </div>
        <div className="card p-3 sm:p-4 text-center" style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <TrendingUp size={16} className="sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2" style={{ color: '#22c55e' }} />
          <p style={{ color: 'var(--text-dark)' }} className="font-black text-lg sm:text-xl">{user.achievements}</p>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs">{tr.home.achievements}</p>
        </div>
        <div className="card p-3 sm:p-4 text-center" style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <Zap size={16} className="sm:w-5 sm:h-5 mx-auto mb-1.5 sm:mb-2" style={{ color: 'var(--primary-blue)' }} />
          <p style={{ color: 'var(--text-dark)' }} className="font-black text-lg sm:text-xl">{user.streak}</p>
          <p style={{ color: 'var(--text-muted)' }} className="text-xs">{tr.home.dayStreak}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
