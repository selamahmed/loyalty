import React, { useState } from 'react';
import { Bell, Check, Trash2, Gift, Trophy, Star, Megaphone, Activity, AlertCircle, Zap, Heart, Sparkles } from 'lucide-react';
import { notifications as initialNotifs } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const typeIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  reward: Gift,
  achievement: Trophy,
  points: Star,
  event: Megaphone,
  system: Activity,
};

const typeColors: Record<string, { bg: string; icon: string; gradient: string; illustration: string }> = {
  reward: {
    bg: 'bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/5',
    icon: 'text-[#22c55e]',
    gradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
    illustration: '🎁',
  },
  achievement: {
    bg: 'bg-gradient-to-br from-[#f59e0b]/10 to-[#d97706]/5',
    icon: 'text-[#f59e0b]',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    illustration: '🏆',
  },
  points: {
    bg: 'bg-gradient-to-br from-[#7B6EF6]/10 to-[#4F8EF7]/5',
    icon: 'text-[#7B6EF6]',
    gradient: 'linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)',
    illustration: '⭐',
  },
  event: {
    bg: 'bg-gradient-to-br from-[#3b82f6]/10 to-[#1d4ed8]/5',
    icon: 'text-[#3b82f6]',
    gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    illustration: '🎉',
  },
  system: {
    bg: 'bg-gradient-to-br from-gray-200/10 to-gray-300/5 dark:from-gray-700/30 dark:to-gray-600/20',
    icon: 'text-gray-600 dark:text-gray-400',
    gradient: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)',
    illustration: '⚙️',
  },
};

const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id: string) => {
    playSound('click');
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    playSound('success');
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    playSound('click');
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-x-hidden">
      {/* Header with Animated Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative">
            <Bell
              size={32}
              className="sm:w-8 sm:h-8"
              style={{
                color: 'var(--gradient-start)',
                animation: unreadCount > 0 ? 'ring 2s ease-in-out infinite' : 'none',
              }}
            />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center animate-pulse shadow-lg">
                {unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{tr.notifications.title}</h1>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{unreadCount} {tr.notifications.unread || 'unread'}</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="flex items-center gap-1 text-xs sm:text-sm font-bold px-3 py-2 rounded-xl transition-all active:scale-95 hover:scale-105"
            style={{
              color: 'white',
              background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
              border: '2px solid var(--dark-border)',
              boxShadow: '0px 3px 0px var(--dark-border)',
            }}
          >
            <Check size={14} className="sm:w-4 sm:h-4" /> {tr.notifications.markAllAsRead}
          </button>
        )}
      </div>

      {/* Filters with Animations */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {['all', 'unread', 'reward', 'achievement', 'points', 'event', 'system'].map(f => {
          const filterLabels: Record<string, string> = {
            all: tr.notifications.all || 'All',
            unread: tr.notifications.unread || 'Unread',
            reward: tr.notifications.reward || 'Rewards',
            achievement: tr.notifications.achievement || 'Achievements',
            points: tr.notifications.points || 'Points',
            event: tr.notifications.event || 'Events',
            system: tr.notifications.system || 'System',
          };

          const isActive = filter === f;
          return (
            <button
              key={f}
              onClick={() => {
                playSound('click');
                setFilter(f);
              }}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0 active:scale-95 hover:scale-105 ${
                isActive
                  ? 'text-white border-black dark:border-gray-600 shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              style={
                isActive
                  ? {
                      background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
                      boxShadow: '0px 4px 0px var(--dark-border)',
                    }
                  : {
                      background: 'var(--card-bg)',
                      boxShadow: '0px 2px 0px var(--dark-border)',
                    }
              }
            >
              {filterLabels[f]}
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 ? (
        <div
          className="card p-8 sm:p-12 text-center"
          style={{
            background: 'var(--card-bg)',
            border: '3px dashed var(--dark-border)',
            boxShadow: '0px 6px 0px var(--dark-border)',
          }}
        >
          <div className="text-5xl sm:text-6xl mb-4 animate-bounce-in">🔔</div>
          <p className="font-black text-lg sm:text-xl text-gray-900 dark:text-white mb-2">{tr.notifications.empty}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">You're all caught up! Check back later for updates.</p>
        </div>
      ) : (
        <div className="space-y-3 animate-fadeIn">
          {filtered.map((notif, index) => {
            const IconComp = typeIcons[notif.type] || Bell;
            const typeConfig = typeColors[notif.type] || typeColors.system;
            const isPriority = notif.type === 'achievement' || notif.type === 'reward';

            return (
              <div
                key={notif.id}
                className={`card transition-all cursor-pointer hover:scale-102 active:scale-95 group ${typeConfig.bg} ${
                  !notif.read ? 'ring-2 ring-[#7B6EF6] dark:ring-[#4F8EF7]' : ''
                }`}
                style={{
                  background: notif.read ? 'var(--card-bg)' : typeConfig.bg,
                  border: !notif.read ? `2px solid ${typeConfig.icon.split('-')[1]}` : '2px solid var(--dark-border)',
                  boxShadow: `0px 4px 0px var(--dark-border)`,
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                  overflow: 'hidden',
                  position: 'relative',
                }}
                onClick={() => markRead(notif.id)}
              >
                {/* Animated Background Gradient */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300"
                  style={{
                    background: typeConfig.gradient,
                  }}
                />

                <div className="relative p-3 sm:p-4 flex items-start gap-3 sm:gap-4">
                  {/* Icon Container with Animation */}
                  <div
                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-transform"
                    style={{
                      background: typeConfig.gradient,
                      border: '2px solid var(--dark-border)',
                      boxShadow: '0px 3px 0px var(--dark-border)',
                    }}
                  >
                    <div className="text-xl sm:text-2xl">{typeConfig.illustration}</div>
                    {isPriority && (
                      <Sparkles
                        size={12}
                        className="absolute top-1 right-1 text-yellow-300 animate-pulse"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-black text-sm sm:text-base leading-tight ${
                              !notif.read
                                ? 'text-gray-900 dark:text-white'
                                : 'text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {notif.title}
                          </p>
                          {isPriority && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-black bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700">
                              Priority
                            </span>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{notif.time}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {!notif.read && (
                          <div
                            className="w-2.5 h-2.5 rounded-full animate-pulse flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)' }}
                          />
                        )}
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            deleteNotif(notif.id);
                            playSound('click');
                          }}
                          className="p-2 rounded-lg transition-all active:scale-90 hover:bg-red-100 dark:hover:bg-red-900/20"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = '#ef4444';
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                          }}
                        >
                          <Trash2 size={16} className="sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Stats Card */}
      {notifs.length > 0 && (
        <div
          className="card p-4 sm:p-6 grid grid-cols-3 gap-2 sm:gap-4"
          style={{
            background: 'linear-gradient(135deg, var(--tab-bg) 0%, var(--input-bg) 100%)',
            border: '2px solid var(--dark-border)',
            boxShadow: '0px 4px 0px var(--dark-border)',
          }}
        >
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
              {notifs.length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-bold mt-1">Total</p>
          </div>
          <div className="text-center border-l-2 border-r-2 border-var(--dark-border)">
            <div className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--gradient-start)' }}>
              {unreadCount}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-bold mt-1">Unread</p>
          </div>
          <div className="text-center">
            <div className="text-2xl sm:text-3xl font-black text-green-500">
              {notifs.filter(n => n.read).length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-bold mt-1">Read</p>
          </div>
        </div>
      )}

      {/* Animations */}
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

        @keyframes ring {
          0%, 100% {
            transform: rotate(0deg);
          }
          10% {
            transform: rotate(-15deg);
          }
          20% {
            transform: rotate(15deg);
          }
          30% {
            transform: rotate(-15deg);
          }
          40% {
            transform: rotate(15deg);
          }
          50% {
            transform: rotate(0deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .hover\:scale-102:hover {
          transform: scale(1.02);
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Notifications;
