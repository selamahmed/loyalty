import React, { useState } from 'react';
import { Bell, Check, Trash2, Gift, Trophy, Star, Megaphone, Activity, AlertCircle } from 'lucide-react';
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

const typeColors: Record<string, string> = {
  reward: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  achievement: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  points: 'bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 text-[#7B6EF6] dark:text-[#4F8EF7]',
  event: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  system: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
};

const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? notifs : filter === 'unread' ? notifs.filter(n => !n.read) : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id: string) => { playSound('click'); setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); };
  const markAllRead = () => { playSound('success'); setNotifs(prev => prev.map(n => ({ ...n, read: true }))); };
  const deleteNotif = (id: string) => { playSound('click'); setNotifs(prev => prev.filter(n => n.id !== id)); };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-2xl mx-auto overflow-x-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{tr.notifications.title}</h1>
          {unreadCount > 0 && (
            <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500 text-white text-xs font-black flex items-center justify-center animate-pulse shadow-lg">{unreadCount}</span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7] hover:underline transition-all active:scale-95">
            <Check size={12} className="sm:w-3.5 sm:h-3.5" /> {tr.notifications.markAllAsRead}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0 scrollbar-hide">
        {['all', 'unread', 'reward', 'achievement', 'points', 'event'].map(f => {
          const filterLabels: Record<string, string> = {
            all: tr.notifications.all || 'Tüm',
            unread: tr.notifications.unread || 'Okunmamış',
            reward: tr.notifications.reward || 'Ödül',
            achievement: tr.notifications.achievement || 'Başarı',
            points: tr.notifications.points || 'Puanlar',
            event: tr.notifications.event || 'Etkinlik'
          };
          return (
          <button
            key={f}
            onClick={() => { playSound('click'); setFilter(f); }}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0 active:scale-95 hover:shadow-md ${
              filter === f
                ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-black dark:border-gray-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {filterLabels[f]}
          </button>
          );
        })}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="card p-8 sm:p-12 text-center hover:shadow-md transition-shadow">
          <Bell size={36} className="sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-bold text-gray-500">{tr.notifications.empty}</p>
        </div>
      ) : (
        <div className="space-y-2 animate-fadeIn">
          {filtered.map((notif, index) => {
            const IconComp = typeIcons[notif.type] || Bell;
            const colorClass = typeColors[notif.type] || typeColors.system;
            const isPriority = notif.type === 'achievement' || notif.type === 'reward';
            return (
              <div
                key={notif.id}
                className={`card p-3 sm:p-4 flex items-start gap-2 sm:gap-3 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-0.5 transform active:scale-95 ${
                  !notif.read ? 'border-l-4 border-[#7B6EF6] dark:border-[#4F8EF7] bg-gradient-to-r from-[#7B6EF6]/5 dark:from-[#4F8EF7]/5 to-transparent' : ''
                } ${isPriority ? 'ring-2 ring-amber-300 dark:ring-amber-600' : ''}`}
                style={{
                  animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                }}
                onClick={() => markRead(notif.id)}
              >
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl ${colorClass} flex items-center justify-center flex-shrink-0 hover:scale-110 transition-transform`}>
                  <IconComp size={16} className="sm:w-[18px] sm:h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`font-bold text-xs sm:text-sm ${!notif.read ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                      {notif.title}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {isPriority && <AlertCircle size={14} className="text-amber-500 animate-pulse" />}
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-[#7B6EF6] dark:bg-[#4F8EF7] animate-pulse" />}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">{notif.time}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); deleteNotif(notif.id); playSound('click'); }}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all active:scale-90 flex-shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

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

export default Notifications;
