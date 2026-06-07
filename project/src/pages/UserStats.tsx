import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Star, Gamepad2, QrCode, Target, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { statsData } from '../data/mockData';
import { tr } from '../lib/tr';

const statCards = [
  { label: 'Total Earned', value: '4,250', icon: Star, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30', trend: '+12%' },
  { label: 'Games Played', value: '47', icon: Gamepad2, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30', trend: '+8%' },
  { label: 'QR Scans', value: '23', icon: QrCode, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30', trend: '+5%' },
  { label: 'Missions Done', value: '31', icon: Target, color: 'text-[#7B6EF6]', bg: 'bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20', trend: '+15%' },
];

const UserStats: React.FC = () => {
  const { user, points } = useApp();

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">My Statistics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map(card => (
          <div key={card.label} className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon size={16} className={card.color} />
              </div>
              <span className="text-xs font-bold text-green-500">{card.trend}</span>
            </div>
            <p className="font-black text-2xl text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Points growth chart */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-black text-gray-900 dark:text-white">Points Growth</h2>
          <div className="flex items-center gap-1 text-green-500">
            <TrendingUp size={14} />
            <span className="text-xs font-bold">+23% this month</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={statsData.pointsOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#fff', border: '2px solid #000', borderRadius: '12px', fontSize: '12px' }}
            />
            <Line type="monotone" dataKey="points" stroke="#7B6EF6" strokeWidth={2.5} dot={{ fill: '#7B6EF6', strokeWidth: 2 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Activity breakdown */}
      <div className="card p-5">
        <h2 className="font-black text-gray-900 dark:text-white mb-4">Activity Breakdown</h2>
        <div className="flex items-center justify-between gap-4">
          <ResponsiveContainer width="50%" height={180}>
            <PieChart>
              <Pie data={statsData.activityBreakdown} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {statsData.activityBreakdown.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(val: number) => `${val}%`} contentStyle={{ border: '2px solid #000', borderRadius: '12px', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex-1 space-y-2">
            {statsData.activityBreakdown.map(item => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: item.color }} />
                <span className="text-xs text-gray-600 dark:text-gray-400 flex-1">{item.name}</span>
                <span className="text-xs font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward usage chart */}
      <div className="card p-5">
        <h2 className="font-black text-gray-900 dark:text-white mb-4">Rewards Redeemed</h2>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={statsData.rewardUsage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: '#fff', border: '2px solid #000', borderRadius: '12px', fontSize: '12px' }} />
            <Bar dataKey="redeemed" fill="#4F8EF7" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Achievements summary */}
      <div className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <Trophy size={20} className="text-amber-500" />
          <h2 className="font-black text-gray-900 dark:text-white">Achievement Progress</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f59e0b" strokeWidth="2.5"
                strokeDasharray={`${(user.achievements / user.totalAchievements) * 100} 100`}
                strokeDashoffset="0" strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-base font-black text-gray-900 dark:text-white">{user.achievements}</span>
            </div>
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">{user.achievements} of {user.totalAchievements}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">achievements unlocked</p>
            <p className="text-sm font-bold text-amber-500 mt-1">{Math.round((user.achievements / user.totalAchievements) * 100)}% complete</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
