import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Users, Zap, ShoppingBag, Activity, Download, DollarSign, Globe, Shield, AlertTriangle, TrendingUp, TrendingDown, Clock, Monitor, Smartphone, Mail, Server, Database, Cpu, HardDrive, Wifi, Bell, Eye, Lock, Unlock, UserCheck, UserX } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsersDaily: number;
  activeUsersMonthly: number;
  totalPoints: number;
  pointsEarned: number;
  pointsSpent: number;
  dailyQRScans: number;
  redemptionCount: number;
  revenue: {
    today: number;
    week: number;
    month: number;
    trend: number;
  };
  security: {
    alerts: number;
    blockedIPs: number;
    activeSessions: number;
  };
  topUsers: Array<{ username: string; points: number; level: number; country: string }>;
  topProducts: Array<{ name: string; redeemed: number; points: number; revenue: number }>;
  recentActivity: Array<{ user: string; action: string; time: string; device: string }>;
  deviceStats: { device: string; users: number }[];
  geoStats: { country: string; users: number; code: string }[];
}

interface ChartData {
  date: string;
  value: number;
  earned?: number;
  spent?: number;
  users?: number;
}

const COLORS = ['#7B6EF6', '#4F8EF7', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activityChart, setActivityChart] = useState<ChartData[]>([]);
  const [pointsFlow, setPointsFlow] = useState<ChartData[]>([]);
  const [revenueChart, setRevenueChart] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    setStats({
      totalUsers: 2847,
      newUsersToday: 43,
      activeUsersDaily: 1281,
      activeUsersMonthly: 2050,
      totalPoints: 156840,
      pointsEarned: 89420,
      pointsSpent: 68420,
      dailyQRScans: 342,
      redemptionCount: 312,
      revenue: {
        today: 2847.50,
        week: 18459.20,
        month: 78243.80,
        trend: 12.4,
      },
      security: {
        alerts: 3,
        blockedIPs: 12,
        activeSessions: 847,
      },
      topUsers: [
        { username: 'PixelKing', points: 28500, level: 25, country: 'United States' },
        { username: 'NeonGamer', points: 24100, level: 22, country: 'Canada' },
        { username: 'StarPlayer99', points: 12840, level: 12, country: 'United Kingdom' },
        { username: 'CosmicQueen', points: 11250, level: 10, country: 'Australia' },
        { username: 'ThunderBlast', points: 9800, level: 8, country: 'Germany' },
      ],
      topProducts: [
        { name: 'Iced Latte', redeemed: 156, points: 300, revenue: 4680 },
        { name: 'Avocado Toast', redeemed: 89, points: 450, revenue: 4005 },
        { name: 'Caesar Salad', redeemed: 67, points: 400, revenue: 2680 },
        { name: 'Green Smoothie', redeemed: 54, points: 350, revenue: 1890 },
        { name: 'Chocolate Muffin', redeemed: 43, points: 200, revenue: 860 },
      ],
      recentActivity: [
        { user: 'PixelKing', action: 'Earned 75 pts', time: '2 min ago', device: 'Desktop' },
        { user: 'NeonGamer', action: 'Redeemed reward', time: '5 min ago', device: 'Mobile' },
        { user: 'StarPlayer99', action: 'QR Scan', time: '8 min ago', device: 'Tablet' },
        { user: 'CosmicQueen', action: 'Level Up!', time: '12 min ago', device: 'Mobile' },
        { user: 'ThunderBlast', action: 'Login', time: '15 min ago', device: 'Desktop' },
      ],
      deviceStats: [
        { device: 'Desktop', users: 1452 },
        { device: 'Mobile', users: 1108 },
        { device: 'Tablet', users: 287 },
      ],
      geoStats: [
        { country: 'United States', users: 1267, code: 'US' },
        { country: 'Canada', users: 543, code: 'CA' },
        { country: 'United Kingdom', users: 421, code: 'UK' },
        { country: 'Australia', users: 312, code: 'AU' },
        { country: 'Germany', users: 245, code: 'DE' },
        { country: 'Japan', users: 189, code: 'JP' },
      ],
    });

    const last7Days = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: [850, 1240, 980, 1450, 1100, 1320, 1180][i],
      users: [245, 312, 287, 398, 301, 356, 334][i],
    }));
    setActivityChart(last7Days);

    const flowData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      earned: [12000, 14500, 13200, 15800, 14100, 16200, 15500][i],
      spent: [8500, 9200, 8800, 10200, 9500, 11800, 10400][i],
    }));
    setPointsFlow(flowData);

    const revData = Array.from({ length: 7 }, (_, i) => ({
      date: new Date(Date.now() - (6 - i) * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: [2845, 3920, 3150, 4520, 3680, 4890, 2847][i],
    }));
    setRevenueChart(revData);

    setLoading(false);
  };

  const exportReport = () => {
    const report = {
      generated: new Date().toISOString(),
      stats,
      timeRange,
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-bold text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white">Admin Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Real-time platform overview and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
            {(['7d', '30d', '90d'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${timeRange === range ? 'bg-[#7B6EF6] text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {range}
              </button>
            ))}
          </div>
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white rounded-2xl border-2 border-black font-bold hover:shadow-lg transition-all">
            <Download size={18} />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Banner */}
      <div className="card p-6 bg-gradient-to-r from-[#7B6EF6] to-[#4F8EF7] text-white border-2 border-black">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-white/80 font-bold">Total Revenue This Month</p>
            <p className="text-4xl font-black mt-1">${stats.revenue.month.toLocaleString()}</p>
            <p className="text-white/80 mt-1">+{stats.revenue.trend}% from last month</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-white/80 text-sm">Today</p>
              <p className="text-xl font-black">${stats.revenue.today.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm">This Week</p>
              <p className="text-xl font-black">${stats.revenue.week.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-white/80 text-sm">Trend</p>
              <p className="text-xl font-black flex items-center justify-center gap-1">
                <TrendingUp size={20} /> +{stats.revenue.trend}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard icon={Users} title="Total Users" value={stats.totalUsers} change={`+${stats.newUsersToday} today`} positive color="blue" />
        <KPICard icon={Activity} title="Daily Active" value={stats.activeUsersDaily} change="+8.2%" positive color="green" />
        <KPICard icon={Zap} title="Total Points" value={stats.totalPoints} change="+12.1%" positive color="amber" />
        <KPICard icon={ShoppingBag} title="Redemptions" value={stats.redemptionCount} change="+5.4%" positive color="purple" />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Security Alerts" value={stats.security.alerts} icon={Shield} color={`${stats.security.alerts > 0 ? 'red' : 'green'}`} />
        <StatCard title="Active Sessions" value={stats.security.activeSessions} icon={Wifi} color="blue" />
        <StatCard title="Blocked IPs" value={stats.security.blockedIPs} icon={Lock} color="gray" />
        <StatCard title="QR Scans Today" value={stats.dailyQRScans} icon={Activity} color="indigo" />
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity Chart */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-[#7B6EF6]" />
            User Activity Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={activityChart}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7B6EF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7B6EF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} />
              <Area type="monotone" dataKey="value" stroke="#7B6EF6" fill="url(#colorValue)" strokeWidth={2} name="Sessions" />
              <Line type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2} name="New Users" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Points Flow Chart */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            Points Flow (Earned vs Spent)
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={pointsFlow}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} />
              <Legend />
              <Bar dataKey="earned" name="Earned" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="spent" name="Spent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Device & Geo Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Monitor size={20} className="text-blue-500" />
            Device Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={stats.deviceStats} innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="users">
                {stats.deviceStats.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {stats.deviceStats.map((item, i) => (
              <div key={item.device} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{item.device}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Countries */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-green-500" />
            Users by Country
          </h3>
          <div className="space-y-3">
            {stats.geoStats.map((item, i) => (
              <div key={item.country} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold">{FLAG_EMOJI[item.code] || '🌍'}</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{item.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-[#7B6EF6] rounded-full" style={{ width: `${(item.users / stats.geoStats[0].users) * 100}%` }} />
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white w-12 text-right">{item.users}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-lg text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-purple-500" />
            Live Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-xl bg-gray-50 dark:bg-gray-700">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] flex items-center justify-center text-white font-bold text-xs">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{activity.user}</p>
                  <p className="text-xs text-gray-500">{activity.action}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{activity.time}</p>
                  <div className="flex items-center justify-end gap-1">
                    {activity.device === 'Mobile' ? <Smartphone size={10} className="text-gray-400" /> : <Monitor size={10} className="text-gray-400" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Users */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <Users size={20} className="text-amber-500" />
              Top Power Users
            </h3>
            <button className="text-sm text-[#7B6EF6] font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {stats.topUsers.map((user, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-sm">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
                  <p className="text-xs text-gray-500">Level {user.level} • {user.country}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-[#7B6EF6]">{user.points.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-green-500" />
              Top Redeemed Products
            </h3>
            <button className="text-sm text-[#7B6EF6] font-bold hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {stats.topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-2xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm">
                  #{i + 1}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900 dark:text-white">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.points} pts • ${product.revenue} revenue</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-green-600">{product.redeemed}</p>
                  <p className="text-xs text-gray-500">redemptions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card p-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
        <div className="flex items-start justify-between mb-6">
          <h3 className="font-black text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Server size={20} className="text-blue-500" />
            System Health & Infrastructure
          </h3>
          <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            All Systems Operational
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <HealthItem name="Database" icon={Database} status="healthy" uptime="99.98%" load={23} />
          <HealthItem name="API Server" icon={Server} status="healthy" uptime="99.95%" load={45} />
          <HealthItem name="Cache" icon={Cpu} status="healthy" uptime="99.99%" load={67} />
          <HealthItem name="Storage" icon={HardDrive} status="healthy" uptime="99.97%" load={34} />
          <HealthItem name="CDN" icon={Globe} status="healthy" uptime="100%" load={12} />
          <HealthItem name="Auth" icon={Shield} status="healthy" uptime="99.99%" load={28} />
        </div>
      </div>

      {/* Security Alerts */}
      {stats.security.alerts > 0 && (
        <div className="card p-6 bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-300 dark:border-orange-700">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-orange-500" size={24} />
            <h3 className="font-black text-lg text-orange-700 dark:text-orange-400">Security Alerts Requiring Attention</h3>
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border-2 border-orange-200 dark:border-orange-800">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <Lock size={20} className="text-red-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900 dark:text-white">Suspicious login attempt detected</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">IP: 185.220.101.42 (Russia) - User: ThunderBlast</p>
              </div>
              <button className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700">
                Block IP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

const FLAG_EMOJI: Record<string, string> = {
  US: '🇺🇸',
  CA: '🇨🇦',
  UK: '🇬🇧',
  AU: '🇦🇺',
  DE: '🇩🇪',
  JP: '🇯🇵',
};

const KPICard: React.FC<{
  icon: React.ElementType;
  title: string;
  value: number;
  change: string;
  positive: boolean;
  color: string;
}> = ({ icon: Icon, title, value, change, positive, color }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
  };

  return (
    <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
      <div className="flex items-start justify-between">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color] || colors.blue}`}>
          <Icon size={24} />
        </div>
        {positive ? (
          <TrendingUp size={18} className="text-green-500" />
        ) : (
          <TrendingDown size={18} className="text-red-500" />
        )}
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 font-bold">{title}</p>
        <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{value.toLocaleString()}</p>
        <p className={`text-xs font-bold mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>{change}</p>
      </div>
    </div>
  );
};

const StatCard: React.FC<{
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}> = ({ title, value, icon: Icon, color }) => {
  const colors: Record<string, string> = {
    red: 'text-red-600 bg-red-100 dark:bg-red-900/30',
    green: 'text-green-600 bg-green-100 dark:bg-green-900/30',
    blue: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30',
    gray: 'text-gray-600 bg-gray-100 dark:bg-gray-900/30',
    indigo: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
  };

  return (
    <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color] || colors.blue}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-xs text-gray-500">{title}</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">{value}</p>
        </div>
      </div>
    </div>
  );
};

const HealthItem: React.FC<{
  name: string;
  icon: React.ElementType;
  status: string;
  uptime: string;
  load: number;
}> = ({ name, icon: Icon, status, uptime, load }) => (
  <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 space-y-2">
    <div className="flex items-center gap-2">
      <Icon size={16} className="text-gray-600 dark:text-gray-400" />
      <p className="font-bold text-sm text-gray-900 dark:text-white">{name}</p>
    </div>
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status === 'healthy' ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-xs text-gray-600 dark:text-gray-400">{uptime}</span>
    </div>
    <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${load > 80 ? 'bg-red-500' : load > 60 ? 'bg-amber-500' : 'bg-green-500'}`} style={{ width: `${load}%` }} />
    </div>
    <p className="text-xs text-gray-500">{load}% load</p>
  </div>
);

export default AdminDashboard;
