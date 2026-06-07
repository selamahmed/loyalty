import React, { useState } from 'react';
import { History as HistoryIcon, TrendingUp, TrendingDown, QrCode, Gamepad2, Target, Star, Gift, Users } from 'lucide-react';
import { pointsHistory } from '../data/mockData';
import { tr } from '../lib/tr';

const categoryIcons: Record<string, React.FC<{ size?: number; className?: string }>> = {
  qr: QrCode,
  game: Gamepad2,
  daily: Target,
  achievement: Star,
  redeem: Gift,
  referral: Users,
};

const categoryColors: Record<string, string> = {
  qr: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
  game: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
  daily: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
  achievement: 'bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 text-[#7B6EF6] dark:text-[#4F8EF7]',
  redeem: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  referral: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
};

const History: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'earned' | 'redeemed'>('all');

  const filtered = filter === 'all' ? pointsHistory : pointsHistory.filter(h => h.type === filter);
  const totalEarned = pointsHistory.filter(h => h.type === 'earned').reduce((s, h) => s + h.points, 0);
  const totalRedeemed = pointsHistory.filter(h => h.type === 'redeemed').reduce((s, h) => s + Math.abs(h.points), 0);

  // Group by date
  const grouped = filtered.reduce<Record<string, typeof filtered>>((acc, h) => {
    const date = new Date(h.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
    if (!acc[date]) acc[date] = [];
    acc[date].push(h);
    return acc;
  }, {});

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Points History</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} className="text-green-500" />
            <span className="text-xs font-bold text-green-600 dark:text-green-400">Total Earned</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-amber-500" fill="currentColor" />
            <span className="font-black text-xl text-green-700 dark:text-green-300">+{totalEarned.toLocaleString()}</span>
          </div>
        </div>
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown size={16} className="text-red-500" />
            <span className="text-xs font-bold text-red-600 dark:text-red-400">Total Redeemed</span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} className="text-amber-500" fill="currentColor" />
            <span className="font-black text-xl text-red-700 dark:text-red-300">-{totalRedeemed.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-black dark:border-gray-600 p-1">
        {(['all', 'earned', 'redeemed'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-sm capitalize transition-all duration-200 ${
              filter === f ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-black dark:border-gray-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {Object.entries(grouped).length === 0 ? (
        <div className="card p-12 text-center">
          <HistoryIcon size={48} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="font-bold text-gray-500">No history yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">{date}</p>
              <div className="space-y-2">
                {items.map(item => {
                  const IconComp = categoryIcons[item.category] || Star;
                  const colorClass = categoryColors[item.category] || '';
                  const isEarned = item.type === 'earned';
                  return (
                    <div key={item.id} className="card p-4 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl ${colorClass} flex items-center justify-center flex-shrink-0`}>
                        <IconComp size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm text-gray-900 dark:text-white">{item.description}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">{item.category}</p>
                      </div>
                      <div className={`flex items-center gap-1 font-black text-sm ${isEarned ? 'text-green-500' : 'text-red-500'}`}>
                        {isEarned ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {isEarned ? '+' : ''}{item.points}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
