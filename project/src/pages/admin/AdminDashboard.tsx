import React from 'react';
import { Users, Gift, Star, TrendingUp, QrCode, Gamepad2, ArrowUp, ArrowDown, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { statsData, adminUsers, rewards } from '../../data/mockData';
import AdminLayout from './AdminLayout';
import { tr } from '../../lib/tr';

const miniData = [{ v: 20 }, { v: 40 }, { v: 30 }, { v: 50 }, { v: 45 }, { v: 70 }, { v: 65 }];

const StatCard: React.FC<{
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: React.FC<{ size?: number; className?: string }>;
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

  return (
    <AdminLayout>
      <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Overview</h1>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="Total Users" value="12,481" change="+8%" up={true} icon={Users} color="text-blue-500" bg="bg-blue-100 dark:bg-blue-900/30" />
          <StatCard label="Active Today" value="2,340" change="+12%" up={true} icon={Activity} color="text-green-500" bg="bg-green-100 dark:bg-green-900/30" />
          <StatCard label="Points Issued" value="1.2M" change="+5%" up={true} icon={Star} color="text-amber-500" bg="bg-amber-100 dark:bg-amber-900/30" />
          <StatCard label="Rewards Claimed" value="3,892" change="-2%" up={false} icon={Gift} color="text-[#7B6EF6]" bg="bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20" />
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

        {/* Recent users */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 dark:text-white">Recent Users</h3>
            <button onClick={() => navigate('/admin/users')} className="text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7]">View all</button>
          </div>
          <div className="space-y-2">
            {adminUsers.slice(0, 4).map(user => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <img src={user.avatar} alt={user.username} className="w-9 h-9 rounded-full border-2 border-black dark:border-gray-600 object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{user.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Lv.{user.level} • {user.points.toLocaleString()} pts</p>
                </div>
                <span className={`badge text-xs ${user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                  {user.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent rewards */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-gray-900 dark:text-white">Active Rewards</h3>
            <button onClick={() => navigate('/admin/rewards')} className="text-sm font-bold text-[#7B6EF6] dark:text-[#4F8EF7]">Manage</button>
          </div>
          <div className="space-y-2">
            {rewards.slice(0, 4).map(r => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <img src={r.image} alt={r.title} className="w-10 h-10 rounded-xl border-2 border-black dark:border-gray-600 object-cover" />
                <div className="flex-1">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{r.title}</p>
                  <div className="flex items-center gap-1">
                    <Star size={10} className="text-amber-500" fill="currentColor" />
                    <span className="text-xs text-amber-600 dark:text-amber-400">{r.points} pts</span>
                  </div>
                </div>
                {r.limited && <span className="badge bg-red-100 dark:bg-red-900/30 text-red-500 text-xs">Limited</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
