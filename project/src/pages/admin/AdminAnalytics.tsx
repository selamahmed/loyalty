import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ComposedChart, Scatter, RadialBarChart, RadialBar } from 'recharts';
import { TrendingUp, Users, Star, Activity, DollarSign, Zap, MapPin, Globe, Smartphone, Monitor, Tablet, Clock, ShoppingBag, Award, Shield, Heart, Target, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import AdminLayout from './AdminLayout';

const monthlyActive = [
  { month: 'Jan', users: 8200, new: 420, churned: 180, revenue: 12450 },
  { month: 'Feb', users: 9100, new: 510, churned: 210, revenue: 14820 },
  { month: 'Mar', users: 10400, new: 680, churned: 290, revenue: 18560 },
  { month: 'Apr', users: 9800, new: 390, churned: 450, revenue: 16420 },
  { month: 'May', users: 11200, new: 720, churned: 220, revenue: 21350 },
  { month: 'Jun', users: 12480, new: 850, churned: 170, revenue: 28470 },
];

const rewardPopularity = [
  { name: 'Gift Cards', value: 35, revenue: 12500 },
  { name: 'Food & Drink', value: 28, revenue: 9840 },
  { name: 'Entertainment', value: 18, revenue: 6320 },
  { name: 'Coupons', value: 12, revenue: 4220 },
  { name: 'Electronics', value: 7, revenue: 2460 },
];

const engagement = [
  { day: 'Mon', qr: 840, games: 1200, missions: 600, sessions: 2450 },
  { day: 'Tue', qr: 920, games: 1400, missions: 700, sessions: 2780 },
  { day: 'Wed', qr: 760, games: 980, missions: 520, sessions: 2340 },
  { day: 'Thu', qr: 1100, games: 1600, missions: 800, sessions: 3120 },
  { day: 'Fri', qr: 1300, games: 1900, missions: 950, sessions: 3840 },
  { day: 'Sat', qr: 1800, games: 2400, missions: 1200, sessions: 4850 },
  { day: 'Sun', qr: 1600, games: 2100, missions: 1050, sessions: 4280 },
];

const hourlyActivity = [
  { hour: '00', users: 120 }, { hour: '02', users: 85 }, { hour: '04', users: 45 }, { hour: '06', users: 180 },
  { hour: '08', users: 420 }, { hour: '10', users: 780 }, { hour: '12', users: 1100 }, { hour: '14', users: 950 },
  { hour: '16', users: 890 }, { hour: '18', users: 1200 }, { hour: '20', users: 1450 }, { hour: '22', users: 580 },
];

const deviceDistribution = [
  { name: 'Desktop', value: 52, devices: 1480, color: '#7B6EF6' },
  { name: 'Mobile', value: 39, devices: 980, color: '#4F8EF7' },
  { name: 'Tablet', value: 9, devices: 287, color: '#22c55e' },
];

const retentionData = [
  { day: 'D1', rate: 100 }, { day: 'D7', rate: 72 }, { day: 'D14', rate: 58 }, { day: 'D30', rate: 45 }, { day: 'D60', rate: 38 }, { day: 'D90', rate: 32 },
];

const geoData = [
  { country: 'United States', users: 1267, flag: '🇺🇸', growth: 12.4 },
  { country: 'Canada', users: 543, flag: '🇨🇦', growth: 8.2 },
  { country: 'United Kingdom', users: 421, flag: '🇬🇧', growth: 15.8 },
  { country: 'Australia', users: 312, flag: '🇦🇺', growth: 6.5 },
  { country: 'Germany', users: 245, flag: '🇩🇪', growth: -2.1 },
  { country: 'Japan', users: 189, flag: '🇯🇵', growth: 22.3 },
  { country: 'France', users: 156, flag: '🇫🇷', growth: 4.8 },
  { country: 'Other', users: 714, flag: '🌍', growth: 5.2 },
];

const funnelData = [
  { stage: 'Sign Up', count: 10000, fill: '#7B6EF6' },
  { stage: 'Onboarding', count: 7800, fill: '#4F8EF7' },
  { stage: 'First QR', count: 4200, fill: '#22c55e' },
  { stage: 'First Reward', count: 2100, fill: '#f59e0b' },
  { stage: 'Active User', count: 1248, fill: '#ef4444' },
];

const COLORS = ['#7B6EF6', '#4F8EF7', '#22c55e', '#f59e0b', '#ef4444'];

const AdminAnalytics: React.FC = () => {
  const stats = [
    { label: 'Active Users', value: '12,480', change: '+8.2%', icon: Users, color: 'text-blue-500', trend: 'up' },
    { label: 'Avg. Session', value: '8.4 min', change: '+1.2m', icon: Activity, color: 'text-green-500', trend: 'up' },
    { label: 'Points/Day', value: '48,200', change: '+5.1%', icon: Star, color: 'text-amber-500', trend: 'up' },
    { label: 'Retention', value: '72%', change: '+2.4%', icon: Heart, color: 'text-purple-500', trend: 'up' },
    { label: 'Revenue', value: '$28.4K', change: '+12.8%', icon: DollarSign, color: 'text-emerald-500', trend: 'up' },
    { label: 'Security Score', value: '97.5', change: '+0.3', icon: Shield, color: 'text-cyan-500', trend: 'up' },
  ];

  return (
    <AdminLayout>
    <div className="p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-[#7B6EF6]" size={28} />
            Advanced Analytics
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Comprehensive platform insights and user behavior analysis</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Last updated: {new Date().toLocaleString()}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stats.map(kpi => (
          <div key={kpi.label} className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
            <kpi.icon size={18} className={`${kpi.color} mb-2`} />
            <p className="font-black text-xl text-gray-900 dark:text-white">{kpi.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{kpi.label}</p>
            <p className={`text-xs font-bold mt-1 ${kpi.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {kpi.trend === 'up' ? '↑' : '↓'} {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users size={20} className="text-[#7B6EF6]" />
            Monthly Active Users Growth
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={monthlyActive}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: '12px', fontSize: '12px' }} />
              <Legend />
              <Area yAxisId="left" type="monotone" dataKey="users" fill="#7B6EF6" fillOpacity={0.2} stroke="#7B6EF6" name="Total Users" />
              <Bar yAxisId="left" dataKey="new" fill="#22c55e" name="New Users" radius={[4, 4, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#f59e0b" strokeWidth={2} name="Revenue ($)" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement by Type */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity size={20} className="text-green-500" />
            Weekly Engagement by Type
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={engagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '2px solid #000', borderRadius: '12px', fontSize: '12px' }} />
              <Legend />
              <Bar dataKey="qr" name="QR Scans" fill="#4F8EF7" radius={[2, 2, 0, 0]} />
              <Bar dataKey="games" name="Games" fill="#7B6EF6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="missions" name="Missions" fill="#22c55e" radius={[2, 2, 0, 0]} />
              <Bar dataKey="sessions" name="Sessions" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hourly Activity + Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hourly Distribution */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 lg:col-span-2">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Hourly Activity Distribution
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={hourlyActivity}>
              <defs>
                <linearGradient id="hourGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} />
              <Area type="monotone" dataKey="users" stroke="#f59e0b" fill="url(#hourGradient)" name="Active Users" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex justify-between mt-4 text-xs">
            <div className="text-center"><p className="font-bold">Peak Hours</p><p className="text-[#7B6EF6]">8-10 PM</p></div>
            <div className="text-center"><p className="font-bold">Low Hours</p><p className="text-gray-400">4-6 AM</p></div>
            <div className="text-center"><p className="font-bold">Avg Session</p><p className="text-green-600">8.4 min</p></div>
          </div>
        </div>

        {/* Retention Rate */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-purple-500" />
            User Retention
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} formatter={(value) => [`${value}%`, 'Retention']} />
              <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: '#8b5cf6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
            <p className="text-xs text-gray-600 dark:text-gray-400">90-day retention</p>
            <p className="text-lg font-black text-purple-600">32%</p>
          </div>
        </div>
      </div>

      {/* Device, Geo, Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Distribution */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Smartphone size={20} className="text-blue-500" />
            Device Distribution
          </h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={deviceDistribution} innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {deviceDistribution.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            {deviceDistribution.map(item => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: item.color }} />
                  <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Geographic Distribution */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Globe size={20} className="text-green-500" />
            Top Regions
          </h2>
          <div className="space-y-3">
            {geoData.map((item, i) => (
              <div key={item.country} className="flex items-center gap-3">
                <span className="text-lg">{item.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 dark:text-white">{item.country}</span>
                    <span className="font-bold text-gray-900 dark:text-white">{item.users.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-gradient-to-r from-[#7B6EF6] to-[#4F8EF7] rounded-full" style={{ width: `${(item.users / geoData[0].users) * 100}%` }} />
                  </div>
                </div>
                <span className={`text-xs font-bold ${item.growth >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.growth >= 0 ? '+' : ''}{item.growth}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* User Funnel */}
        <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Target size={20} className="text-red-500" />
            Conversion Funnel
          </h2>
          <div className="space-y-2">
            {funnelData.map((stage, i) => (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{stage.stage}</span>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{stage.count.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-gray-100 dark:bg-gray-700 rounded-r-full overflow-hidden" style={{ width: `${(stage.count / funnelData[0].count) * 100}%`, marginLeft: `${((funnelData[0].count - stage.count) / funnelData[0].count) * 50}%` }}>
                  <div className="h-full rounded-r-full" style={{ background: stage.fill }} />
                </div>
                {i < funnelData.length - 1 && (
                  <p className="text-xs text-gray-500 text-right mt-0.5">
                    {Math.round((funnelData[i + 1].count / stage.count) * 100)}% →
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward Popularity */}
      <div className="card p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
        <h2 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShoppingBag size={20} className="text-amber-500" />
          Reward Category Performance
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={rewardPopularity} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: '2px solid #000' }} />
            <Bar dataKey="value" name="Redemptions %" fill="#7B6EF6" radius={[0, 4, 4, 0]}>
              {rewardPopularity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-5 gap-4 mt-4">
          {rewardPopularity.map(item => (
            <div key={item.name} className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <p className="text-lg font-black text-gray-900 dark:text-white">{item.value}%</p>
              <p className="text-xs text-gray-500 truncate">{item.name}</p>
              <p className="text-xs font-bold text-green-600">${item.revenue.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 bg-gradient-to-br from-[#7B6EF6]/10 to-[#4F8EF7]/10 border-2 border-[#7B6EF6]/30">
          <Zap size={24} className="text-[#7B6EF6] mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">847K</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Points Earned (Month)</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-red-500/10 to-orange-500/10 border-2 border-red-500/30">
          <ShoppingBag size={24} className="text-red-500 mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">4.2K</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Rewards Redeemed (Month)</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30">
          <Award size={24} className="text-green-500 mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">12.8K</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Achievements Unlocked</p>
        </div>
        <div className="card p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/30">
          <Target size={24} className="text-amber-500 mb-2" />
          <p className="text-2xl font-black text-gray-900 dark:text-white">89.4%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">KPI Target Reached</p>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
};

export default AdminAnalytics;
