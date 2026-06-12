import React, { useEffect, useState, useCallback } from 'react';
import { Users, Gift, Star, QrCode, ArrowUp, ArrowDown, Activity, UserPlus, Gamepad2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { getDashboardStatsEnhanced } from '../../services/admin';
import { useRealtimeTables } from '../../hooks/useRealtime';
import AdminLayout from './AdminLayout';
import { tr } from '../../lib/tr';

const miniData = [{ v: 20 }, { v: 40 }, { v: 30 }, { v: 50 }, { v: 45 }, { v: 70 }, { v: 65 }];

const StatCard: React.FC<{
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
}> = ({ label, value, change, up, icon: Icon, color, bg }) => (
  <div className="card p-5">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-2xl ${bg} flex items-center justify-center`}>
        <Icon size={18} className={color} />
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold ${up ? 'text-green-500' : 'text-red-500'}`}>
        {up ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {change}
      </div>
    </div>
    <p className="font-black text-2xl text-gray-900 dark:text-white">{value}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
  </div>
);

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0, activeToday: 0, totalRedemptions: 0,
    totalPointsIssued: 0, qrScansToday: 0, newUsersToday: 0,
  });

  const loadStats = useCallback(() => {
    getDashboardStatsEnhanced().then(setStats).catch(() => {});
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  /* realtime: refresh dashboard whenever core tables change */
  useRealtimeTables(['profiles', 'redemptions', 'points_transactions', 'qr_scans', 'activity_logs'], loadStats);

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Overview</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <StatCard label="Toplam Kullanıcı" value={stats.totalUsers.toLocaleString()} change="" up={true} icon={Users} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/30" />
          <StatCard label="Bugün Aktif" value={stats.activeToday.toLocaleString()} change="" up={true} icon={Activity} color="text-green-500" bg="bg-green-100 dark:bg-green-900/30" />
          <StatCard label="Toplam Puan" value={stats.totalPointsIssued.toLocaleString()} change="" up={true} icon={Star} color="text-amber-500" bg="bg-amber-100 dark:bg-amber-900/30" />
          <StatCard label="Ödül Kullanımı" value={stats.totalRedemptions.toLocaleString()} change="" up={true} icon={Gift} color="text-[#7B6EF6]" bg="bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20" />
          <StatCard label="Bugün QR Tarama" value={stats.qrScansToday.toLocaleString()} change="" up={true} icon={QrCode} color="text-cyan-500" bg="bg-cyan-100 dark:bg-cyan-900/30" />
          <StatCard label="Bugün Yeni Kayıt" value={stats.newUsersToday.toLocaleString()} change="" up={true} icon={UserPlus} color="text-purple-500" bg="bg-purple-100 dark:bg-purple-900/30" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5">
            <h3 className="font-black text-gray-900 dark:text-white mb-4">Activity This Week</h3>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={miniData}>
                <Line type="monotone" dataKey="v" stroke="#7B6EF6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <h3 className="font-black text-gray-900 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
              {[
                { label: 'QR Scans Today', value: '847', icon: QrCode },
                { label: 'Games Played Today', value: '2,103', icon: Gamepad2 },
                { label: 'New Signups Today', value: '64', icon: Users },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <s.icon size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{s.label}</span>
                  </div>
                  <span className="font-black text-sm text-gray-900 dark:text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent users link */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 dark:text-white">Recent Users</h3>
            <button onClick={() => navigate('/admin/users')} className="text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7]">View all</button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">View all users in the Users section.</p>
        </div>

        {/* Active rewards link */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 dark:text-white">Active Rewards</h3>
            <button onClick={() => navigate('/admin/rewards')} className="text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7]">Manage</button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage rewards in the Rewards section.</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
