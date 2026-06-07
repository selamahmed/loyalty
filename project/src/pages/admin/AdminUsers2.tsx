import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Lock, Trash2, TrendingUp, Zap, Award, Mail, Shield, Globe, Smartphone, Monitor, MapPin, Clock, AlertTriangle, UserCheck, UserX, Key, Send, Ban, Unlock, DollarSign, Activity, Heart, Star, Calendar, Download, MoreVertical, RefreshCw } from 'lucide-react';
import AdminLayout from './AdminLayout';

interface UserSession {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
  browser: string;
  os: string;
  ip: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

interface UserTransaction {
  id: string;
  type: 'earned' | 'spent' | 'bonus' | 'adjusted';
  amount: number;
  description: string;
  date: string;
  source: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  emailVerified: boolean;
  phone?: string;
  phoneVerified: boolean;
  avatar?: string;
  level: number;
  totalPoints: number;
  lifetimePoints: number;
  spentPoints: number;
  joinDate: string;
  lastActive: string;
  lastLogin: string;
  status: 'active' | 'suspended' | 'banned' | 'inactive';
  twoFactorEnabled: boolean;
  subscription: 'free' | 'premium' | 'enterprise';
  country: string;
  city: string;
  timezone: string;
  language: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  os: string;
  browser: string;
  lastIP: string;
  isp: string;
  sessions: UserSession[];
  transactions: UserTransaction[];
  achievements: number;
  missionsCompleted: number;
  qrScans: number;
  rewardsRedeemed: number;
  streak: number;
  riskScore: number;
  notes?: string;
}

const mockUsers: UserData[] = [
  {
    id: 'user-1',
    username: 'PixelKing',
    email: 'pixelking@email.com',
    emailVerified: true,
    phone: '+1 (555) 123-4567',
    phoneVerified: true,
    level: 25,
    totalPoints: 28500,
    lifetimePoints: 156800,
    spentPoints: 128300,
    joinDate: 'Jan 15, 2024',
    lastActive: new Date().toISOString(),
    lastLogin: new Date(Date.now() - 300000).toISOString(),
    status: 'active',
    twoFactorEnabled: true,
    subscription: 'premium',
    country: 'United States',
    city: 'San Francisco',
    timezone: 'America/Los_Angeles',
    language: 'en-US',
    device: 'Dell XPS 15',
    deviceType: 'desktop',
    os: 'Windows 11',
    browser: 'Chrome 125.0',
    lastIP: '192.168.1.105',
    isp: 'Comcast Cable',
    sessions: [
      { id: 's1', device: 'Dell XPS 15', deviceType: 'desktop', deviceName: 'DESKTOP-WIN11', browser: 'Chrome 125.0', os: 'Windows 11', ip: '192.168.1.105', location: 'San Francisco, US', lastActive: '2 min ago', isCurrent: true, riskLevel: 'low' },
      { id: 's2', device: 'iPhone 15 Pro', deviceType: 'mobile', deviceName: 'iPhone15,3', browser: 'Safari 17.5', os: 'iOS 17.5', ip: '10.0.0.45', location: 'San Francisco, US', lastActive: '1 hour ago', isCurrent: false, riskLevel: 'low' },
    ],
    transactions: [
      { id: 't1', type: 'earned', amount: 75, description: 'QR Scan - Downtown Store', date: '5 min ago', source: 'qr_scan' },
      { id: 't2', type: 'earned', amount: 50, description: 'Daily Login Bonus', date: '2 hours ago', source: 'daily_login' },
      { id: 't3', type: 'spent', amount: 300, description: 'Iced Latte Redemption', date: '1 day ago', source: 'redemption' },
      { id: 't4', type: 'bonus', amount: 150, description: 'Weekend Promo 2x', date: '2 days ago', source: 'campaign' },
    ],
    achievements: 28,
    missionsCompleted: 145,
    qrScans: 892,
    rewardsRedeemed: 67,
    streak: 127,
    riskScore: 12,
    notes: 'VIP user, premium subscriber since Jan 2024',
  },
  {
    id: 'user-2',
    username: 'NeonGamer',
    email: 'neon@email.com',
    emailVerified: true,
    phone: '+1 (555) 234-5678',
    phoneVerified: true,
    level: 22,
    totalPoints: 24100,
    lifetimePoints: 98500,
    spentPoints: 74400,
    joinDate: 'Feb 20, 2024',
    lastActive: new Date(Date.now() - 86400000).toISOString(),
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    status: 'active',
    twoFactorEnabled: true,
    subscription: 'premium',
    country: 'Canada',
    city: 'Toronto',
    timezone: 'America/Toronto',
    language: 'en-CA',
    device: 'iPhone 15 Pro',
    deviceType: 'mobile',
    os: 'iOS 17.5',
    browser: 'Safari 17.5',
    lastIP: '172.16.0.88',
    isp: 'Bell Canada',
    sessions: [
      { id: 's3', device: 'iPhone 15 Pro', deviceType: 'mobile', deviceName: 'iPhone15,3', browser: 'Safari 17.5', os: 'iOS 17.5', ip: '172.16.0.88', location: 'Toronto, CA', lastActive: '1 day ago', isCurrent: true, riskLevel: 'low' },
    ],
    transactions: [
      { id: 't5', type: 'earned', amount: 100, description: 'Mission Complete', date: '1 day ago', source: 'mission' },
      { id: 't6', type: 'spent', amount: 450, description: 'Avocado Toast', date: '2 days ago', source: 'redemption' },
    ],
    achievements: 24,
    missionsCompleted: 132,
    qrScans: 445,
    rewardsRedeemed: 45,
    streak: 45,
    riskScore: 8,
  },
  {
    id: 'user-3',
    username: 'StarPlayer99',
    email: 'star@email.com',
    emailVerified: true,
    phone: '+44 20 7946 0958',
    phoneVerified: false,
    level: 12,
    totalPoints: 12840,
    lifetimePoints: 45200,
    spentPoints: 32360,
    joinDate: 'Mar 10, 2024',
    lastActive: new Date(Date.now() - 172800000).toISOString(),
    lastLogin: new Date(Date.now() - 172800000).toISOString(),
    status: 'active',
    twoFactorEnabled: false,
    subscription: 'free',
    country: 'United Kingdom',
    city: 'London',
    timezone: 'Europe/London',
    language: 'en-GB',
    device: 'MacBook Pro 14"',
    deviceType: 'desktop',
    os: 'macOS Sonoma 14.5',
    browser: 'Chrome 125.0',
    lastIP: '172.16.0.88',
    isp: 'BT Group',
    sessions: [
      { id: 's4', device: 'MacBook Pro 14"', deviceType: 'desktop', deviceName: 'MacBookPro14,3', browser: 'Chrome 125.0', os: 'macOS Sonoma', ip: '172.16.0.88', location: 'London, UK', lastActive: '2 days ago', isCurrent: true, riskLevel: 'low' },
    ],
    transactions: [
      { id: 't7', type: 'earned', amount: 25, description: 'Daily Login', date: '2 days ago', source: 'daily_login' },
    ],
    achievements: 12,
    missionsCompleted: 67,
    qrScans: 189,
    rewardsRedeemed: 23,
    streak: 7,
    riskScore: 25,
  },
  {
    id: 'user-4',
    username: 'CosmicQueen',
    email: 'cosmic@email.com',
    emailVerified: true,
    phone: '+61 2 9876 5432',
    phoneVerified: true,
    level: 10,
    totalPoints: 11250,
    lifetimePoints: 38900,
    spentPoints: 27650,
    joinDate: 'Apr 5, 2024',
    lastActive: new Date(Date.now() - 259200000).toISOString(),
    lastLogin: new Date(Date.now() - 259200000).toISOString(),
    status: 'inactive',
    twoFactorEnabled: false,
    subscription: 'free',
    country: 'Australia',
    city: 'Sydney',
    timezone: 'Australia/Sydney',
    language: 'en-AU',
    device: 'Samsung Galaxy S24 Ultra',
    deviceType: 'mobile',
    os: 'Android 14',
    browser: 'Chrome 125.0',
    lastIP: '192.168.0.201',
    isp: 'Telstra',
    sessions: [],
    transactions: [],
    achievements: 8,
    missionsCompleted: 45,
    qrScans: 123,
    rewardsRedeemed: 18,
    streak: 0,
    riskScore: 15,
  },
  {
    id: 'user-5',
    username: 'ThunderBlast',
    email: 'thunder@email.com',
    emailVerified: true,
    phone: '+49 30 12345678',
    phoneVerified: false,
    level: 8,
    totalPoints: 9800,
    lifetimePoints: 28500,
    spentPoints: 18700,
    joinDate: 'May 1, 2024',
    lastActive: new Date(Date.now() - 43200000).toISOString(),
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    status: 'active',
    twoFactorEnabled: true,
    subscription: 'premium',
    country: 'Germany',
    city: 'Berlin',
    timezone: 'Europe/Berlin',
    language: 'de-DE',
    device: 'Lenovo ThinkPad T480',
    deviceType: 'desktop',
    os: 'Windows 10',
    browser: 'Firefox 126.0',
    lastIP: '192.168.50.77',
    isp: 'Deutsche Telekom',
    sessions: [
      { id: 's5', device: 'Lenovo ThinkPad T480', deviceType: 'desktop', deviceName: 'THINKPAD-WIN10', browser: 'Firefox 126.0', os: 'Windows 10', ip: '192.168.50.77', location: 'Berlin, DE', lastActive: '1 hour ago', isCurrent: true, riskLevel: 'low' },
      { id: 's6', device: 'Unknown Device', deviceType: 'desktop', deviceName: 'Unknown', browser: 'Firefox 115.0', os: 'Windows 7', ip: '185.220.101.42', location: 'Moscow, RU', lastActive: '3 hours ago', isCurrent: false, riskLevel: 'high' },
    ],
    transactions: [
      { id: 't8', type: 'earned', amount: 100, description: 'Mission Complete', date: '1 hour ago', source: 'mission' },
    ],
    achievements: 6,
    missionsCompleted: 52,
    qrScans: 156,
    rewardsRedeemed: 12,
    streak: 21,
    riskScore: 65,
    notes: 'SECURITY ALERT: Suspicious login from Russia detected',
  },
  {
    id: 'user-6',
    username: 'ShadowRider',
    email: 'shadow@email.com',
    emailVerified: false,
    phone: undefined,
    phoneVerified: false,
    level: 15,
    totalPoints: 15600,
    lifetimePoints: 62000,
    spentPoints: 46400,
    joinDate: 'Dec 12, 2023',
    lastActive: new Date(Date.now() - 604800000).toISOString(),
    lastLogin: new Date(Date.now() - 604800000).toISOString(),
    status: 'suspended',
    twoFactorEnabled: false,
    subscription: 'free',
    country: 'Japan',
    city: 'Tokyo',
    timezone: 'Asia/Tokyo',
    language: 'ja-JP',
    device: 'Custom Linux PC',
    deviceType: 'desktop',
    os: 'Ubuntu 24.04 LTS',
    browser: 'Chromium 122.0',
    lastIP: '192.168.100.50',
    isp: 'NTT Communications',
    sessions: [],
    transactions: [],
    achievements: 15,
    missionsCompleted: 89,
    qrScans: 234,
    rewardsRedeemed: 28,
    streak: 0,
    riskScore: 85,
    notes: 'Account suspended for policy violation - multiple failed transactions',
  },
  {
    id: 'user-7',
    username: 'MysticWolf',
    email: 'mystic@email.com',
    emailVerified: true,
    phone: '+1 (555) 345-6789',
    phoneVerified: true,
    level: 18,
    totalPoints: 18900,
    lifetimePoints: 78000,
    spentPoints: 59100,
    joinDate: 'Nov 8, 2023',
    lastActive: new Date(Date.now() - 3600000).toISOString(),
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
    status: 'active',
    twoFactorEnabled: true,
    subscription: 'enterprise',
    country: 'United States',
    city: 'New York',
    timezone: 'America/New_York',
    language: 'en-US',
    device: 'HP Workstation Z8',
    deviceType: 'desktop',
    os: 'Windows 11 Enterprise',
    browser: 'Chrome 125.0',
    lastIP: '10.10.10.1',
    isp: 'AT&T Fiber',
    sessions: [
      { id: 's7', device: 'HP Workstation Z8', deviceType: 'desktop', deviceName: 'WORKSTATION-Z8', browser: 'Chrome 125.0', os: 'Windows 11', ip: '10.10.10.1', location: 'New York, US', lastActive: '1 hour ago', isCurrent: true, riskLevel: 'low' },
    ],
    transactions: [
      { id: 't9', type: 'earned', amount: 200, description: 'Referral Bonus', date: '3 hours ago', source: 'referral' },
    ],
    achievements: 19,
    missionsCompleted: 112,
    qrScans: 567,
    rewardsRedeemed: 34,
    streak: 89,
    riskScore: 5,
    notes: 'Enterprise subscriber - corporate account',
  },
  {
    id: 'user-8',
    username: 'CrystalMage',
    email: 'crystal@email.com',
    emailVerified: true,
    phone: '+33 1 23 45 67 89',
    phoneVerified: false,
    level: 6,
    totalPoints: 5200,
    lifetimePoints: 18500,
    spentPoints: 13300,
    joinDate: 'May 15, 2024',
    lastActive: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    status: 'active',
    twoFactorEnabled: false,
    subscription: 'free',
    country: 'France',
    city: 'Paris',
    timezone: 'Europe/Paris',
    language: 'fr-FR',
    device: 'iPad Pro 12.9"',
    deviceType: 'tablet',
    os: 'iPadOS 17.5',
    browser: 'Safari 17.5',
    lastIP: '172.20.10.5',
    isp: 'Orange S.A.',
    sessions: [
      { id: 's8', device: 'iPad Pro 12.9"', deviceType: 'tablet', deviceName: 'iPadPro12,9', browser: 'Safari 17.5', os: 'iPadOS 17.5', ip: '172.20.10.5', location: 'Paris, FR', lastActive: 'Now', isCurrent: true, riskLevel: 'low' },
    ],
    transactions: [
      { id: 't10', type: 'earned', amount: 75, description: 'QR Scan', date: '5 min ago', source: 'qr_scan' },
    ],
    achievements: 4,
    missionsCompleted: 28,
    qrScans: 45,
    rewardsRedeemed: 8,
    streak: 12,
    riskScore: 10,
  },
];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSubscription, setFilterSubscription] = useState('all');
  const [sortBy, setSortBy] = useState('lastActive');
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'sessions' | 'transactions' | 'activity' | 'actions'>('overview');
  const [adjustmentAmount, setAdjustmentAmount] = useState(0);
  const [adjustmentReason, setAdjustmentReason] = useState('');
  const [adminNote, setAdminNote] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterAndSortUsers();
  }, [users, searchQuery, filterStatus, filterSubscription, sortBy]);

  const loadUsers = async () => {
    setUsers(mockUsers);
    setLoading(false);
  };

  const filterAndSortUsers = () => {
    let filtered = users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.lastIP.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
      const matchesSubscription = filterSubscription === 'all' || user.subscription === filterSubscription;
      return matchesSearch && matchesStatus && matchesSubscription;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'points': return b.totalPoints - a.totalPoints;
        case 'level': return b.level - a.level;
        case 'joinDate': return new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime();
        case 'riskScore': return b.riskScore - a.riskScore;
        case 'lastActive':
        default: return new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime();
      }
    });

    setFilteredUsers(filtered);
  };

  const adjustUserPoints = (userId: string, amount: number, reason: string) => {
    setUsers(users.map(u => u.id === userId ? { ...u, totalPoints: u.totalPoints + amount } : u));
    alert(`Points adjusted: ${amount >= 0 ? '+' : ''}${amount} (demo mode)`);
    setAdjustmentAmount(0);
    setAdjustmentReason('');
  };

  const changeUserStatus = (userId: string, newStatus: 'active' | 'suspended' | 'banned') => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
    alert(`User status changed to: ${newStatus} (demo mode)`);
  };

  const resetPassword = (userId: string) => {
    alert(`Password reset email sent to user (demo mode)`);
  };

  const revokeAllSessions = (userId: string) => {
    if (window.confirm('Are you sure? This will log the user out of all devices.')) {
      setSelectedUser(prev => prev ? { ...prev, sessions: [] } : null);
      alert('All sessions revoked (demo mode)');
    }
  };

  const exportUsers = () => {
    const csv = [
      ['ID', 'Username', 'Email', 'Phone', 'Level', 'Points', 'Status', 'Subscription', 'Country', 'City', 'Last Active', 'Last IP', 'Risk Score', '2FA', 'Sessions', 'Join Date'],
      ...filteredUsers.map(u => [u.id, u.username, u.email, u.phone || 'N/A', u.level, u.totalPoints, u.status, u.subscription, u.country, u.city, u.lastActive, u.lastIP, u.riskScore, u.twoFactorEnabled ? 'Yes' : 'No', u.sessions.length, u.joinDate]),
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      suspended: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      banned: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
      inactive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400',
    };
    return colors[status] || 'bg-gray-100 text-gray-600';
  };

  const getRiskLevel = (score: number) => {
    if (score >= 70) return { level: 'high', color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' };
    if (score >= 40) return { level: 'medium', color: 'text-yellow-500', bg: 'bg-yellow-100 dark:bg-yellow-900/30' };
    return { level: 'low', color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' };
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    premium: users.filter(u => u.subscription === 'premium' || u.subscription === 'enterprise').length,
    highRisk: users.filter(u => u.riskScore >= 70).length,
  };

  if (loading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-[#7B6EF6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-bold">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 dark:text-white flex items-center gap-2 sm:gap-3">
            <Shield className="text-[#7B6EF6] flex-shrink-0" size={24} />
            User Management
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Complete SaaS admin control panel - manage all users, sessions, and data</p>
        </div>
        <div className="flex gap-2 sm:gap-3 flex-shrink-0">
          <button onClick={exportUsers} className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-2xl border-2 border-gray-300 dark:border-gray-600 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-all">
            <Download size={16} />
            Export
          </button>
          <button className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white rounded-2xl border-2 border-black font-bold text-sm hover:shadow-lg transition-all">
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <p className="text-xs text-gray-500">Total Users</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <p className="text-xs text-gray-500">Active Users</p>
          <p className="text-2xl font-black text-green-600">{stats.active}</p>
        </div>
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <p className="text-xs text-gray-500">Premium Users</p>
          <p className="text-2xl font-black text-purple-600">{stats.premium}</p>
        </div>
        <div className="card p-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <p className="text-xs text-gray-500">High Risk Users</p>
          <p className="text-2xl font-black text-red-600">{stats.highRisk}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by username, email, phone, or IP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="flex-1 min-w-[120px] px-3 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filterSubscription} onChange={(e) => setFilterSubscription(e.target.value)} className="flex-1 min-w-[120px] px-3 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm">
            <option value="all">All Plans</option>
            <option value="free">Free</option>
            <option value="premium">Premium</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="flex-1 min-w-[130px] px-3 py-2.5 rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-bold text-sm">
            <option value="lastActive">Last Active</option>
            <option value="points">Points</option>
            <option value="level">Level</option>
            <option value="riskScore">Risk Score</option>
            <option value="joinDate">Join Date</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b-2 border-black dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">User</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Device / Location</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Level</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Points</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Status</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Plan</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Risk</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">2FA</th>
                <th className="text-left py-3 px-4 font-black text-gray-900 dark:text-white text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] flex items-center justify-center text-white font-black">
                        {user.username.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{user.username}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                        {user.phone && <p className="text-xs text-gray-400">{user.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {user.deviceType === 'mobile' ? <Smartphone size={14} className="text-gray-400" /> : user.deviceType === 'tablet' ? <Monitor size={14} className="text-gray-400" /> : <Monitor size={14} className="text-gray-400" />}
                      <div>
                        <p className="text-sm text-gray-900 dark:text-white">{user.device}</p>
                        <p className="text-xs text-gray-500">{user.city}, {user.country}</p>
                      </div>
                    </div>
                    <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 rounded">{user.lastIP}</code>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-[#7B6EF6]">Lv.{user.level}</span>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-bold text-amber-600">{user.totalPoints.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">spent: {user.spentPoints.toLocaleString()}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(user.status)}`}>
                      {user.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${user.subscription === 'enterprise' ? 'bg-purple-100 text-purple-700' : user.subscription === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {user.subscription.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold w-fit ${getRiskLevel(user.riskScore).bg}`}>
                      <AlertTriangle size={12} className={getRiskLevel(user.riskScore).color} />
                      <span className={getRiskLevel(user.riskScore).color}>{user.riskScore}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {user.twoFactorEnabled ? (
                      <span className="flex items-center gap-1 text-xs text-green-600"><UserCheck size={14} /> ON</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-red-500"><UserX size={14} /> OFF</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setSelectedUser(user); setDetailTab('overview'); setShowDetail(true); }} className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600" title="Full Details">
                        <Eye size={16} />
                      </button>
                      <button onClick={() => resetPassword(user.id)} className="p-2 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-yellow-600" title="Reset Password">
                        <Key size={16} />
                      </button>
                      <button onClick={() => changeUserStatus(user.id, user.status === 'suspended' || user.status === 'banned' ? 'active' : 'suspended')} className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600" title={user.status === 'suspended' || user.status === 'banned' ? 'Unsuspend' : 'Suspend'}>
                        {user.status === 'suspended' || user.status === 'banned' ? <Unlock size={16} /> : <Lock size={16} />}
                      </button>
                      <button onClick={() => { if (window.confirm('Ban this user permanently?')) changeUserStatus(user.id, 'banned'); }} className="p-2 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700" title="Ban User">
                        <Ban size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-gray-500">No users found</div>
        )}
      </div>

      {/* User Detail Modal */}
      {showDetail && selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl border-2 border-black dark:border-gray-700 p-0 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7] flex items-center justify-center text-white font-black text-xl sm:text-2xl flex-shrink-0">
                  {selectedUser.username.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-black text-gray-900 dark:text-white truncate">{selectedUser.username}</h2>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{selectedUser.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${getStatusColor(selectedUser.status)}`}>
                      {selectedUser.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${selectedUser.subscription === 'enterprise' ? 'bg-purple-100 text-purple-700' : selectedUser.subscription === 'premium' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedUser.subscription.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">Lv.{selectedUser.level}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowDetail(false)} className="text-2xl text-gray-400 hover:text-gray-600">&times;</button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700 flex overflow-x-auto">
              {(['overview', 'sessions', 'transactions', 'activity', 'actions'] as const).map(tab => (
                <button key={tab} onClick={() => setDetailTab(tab)} className={`px-6 py-3 font-bold text-sm whitespace-nowrap border-b-2 transition-all ${detailTab === tab ? 'border-[#7B6EF6] text-[#7B6EF6]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              {detailTab === 'overview' && (
                <>
                  {/* Security Alert */}
                  {selectedUser.riskScore >= 65 && (
                    <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                        <AlertTriangle size={20} />
                        <span className="font-bold">HIGH RISK USER DETECTED</span>
                      </div>
                      <p className="text-sm text-red-600 dark:text-red-400 mt-2">This user has suspicious activity. Review sessions and take action.</p>
                    </div>
                  )}

                  {/* Identity */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={18} /> Identity Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">User ID</p>
                        <code className="text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{selectedUser.id}</code>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Email</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.email}</p>
                        <p className="text-xs">{selectedUser.emailVerified ? <span className="text-green-500">Verified</span> : <span className="text-red-500">Not Verified</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Phone</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.phone || 'N/A'}</p>
                        <p className="text-xs">{selectedUser.phoneVerified ? <span className="text-green-500">Verified</span> : <span className="text-red-500">Not Verified</span>}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">2FA Status</p>
                        <p className="text-sm font-bold">
                          {selectedUser.twoFactorEnabled ? <span className="text-green-600">Enabled</span> : <span className="text-red-500">Disabled</span>}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Location & Device */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Globe size={18} /> Location & Device</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Country</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.country}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">City</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.city}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Timezone</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.timezone}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Language</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.language}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Primary Device</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.device}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Device Type</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.deviceType}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">OS / Browser</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.os} / {selectedUser.browser}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">ISP</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.isp}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs text-gray-500">Last Known IP</p>
                        <code className="text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{selectedUser.lastIP}</code>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Login</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{new Date(selectedUser.lastLogin).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Join Date</p>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
                      </div>
                    </div>
                  </div>

                  {/* Points & Stats */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Zap size={18} /> Points & Activity</h3>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl">
                        <p className="text-2xl font-black text-amber-600">{selectedUser.totalPoints.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Current Points</p>
                      </div>
                      <div className="text-center p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <p className="text-2xl font-black text-green-600">{selectedUser.lifetimePoints.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Lifetime Earned</p>
                      </div>
                      <div className="text-center p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                        <p className="text-2xl font-black text-red-600">{selectedUser.spentPoints.toLocaleString()}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Total Spent</p>
                      </div>
                      <div className="text-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <p className="text-2xl font-black text-blue-600">{selectedUser.achievements}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Achievements</p>
                      </div>
                      <div className="text-center p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <p className="text-2xl font-black text-purple-600">{selectedUser.streak}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Day Streak</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{selectedUser.qrScans}</p><p className="text-xs text-gray-500">QR Scans</p></div>
                      <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{selectedUser.missionsCompleted}</p><p className="text-xs text-gray-500">Missions</p></div>
                      <div className="text-center"><p className="font-bold text-gray-900 dark:text-white">{selectedUser.rewardsRedeemed}</p><p className="text-xs text-gray-500">Redemptions</p></div>
                    </div>
                  </div>
                </>
              )}

              {detailTab === 'sessions' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Monitor size={18} /> Active Sessions ({selectedUser.sessions.length})</h3>
                    <button onClick={() => revokeAllSessions(selectedUser.id)} className="px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700">
                      Revoke All Sessions
                    </button>
                  </div>
                  {selectedUser.sessions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No active sessions</div>
                  ) : (
                    <div className="space-y-3">
                      {selectedUser.sessions.map(session => (
                        <div key={session.id} className={`p-4 rounded-2xl border-2 ${session.riskLevel === 'high' ? 'border-red-300 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                              {session.deviceType === 'mobile' ? <Smartphone size={24} className="text-gray-400" /> : <Monitor size={24} className="text-gray-400" />}
                              <div>
                                <p className="font-bold text-gray-900 dark:text-white">{session.device}</p>
                                <p className="text-sm text-gray-500">{session.browser} on {session.os}</p>
                                <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                                  <span className="flex items-center gap-1"><MapPin size={12} />{session.location}</span>
                                  <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">{session.ip}</code>
                                  <span className="flex items-center gap-1"><Clock size={12} />{session.lastActive}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {session.isCurrent && <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-bold">CURRENT</span>}
                              {session.riskLevel === 'high' && <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-bold flex items-center gap-1"><AlertTriangle size={12} />HIGH RISK</span>}
                              <button className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600" title="Revoke Session">
                                <Lock size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'transactions' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><DollarSign size={18} /> Recent Transactions</h3>
                  {selectedUser.transactions.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No transactions</div>
                  ) : (
                    <div className="space-y-2">
                      {selectedUser.transactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">{tx.description}</p>
                            <p className="text-xs text-gray-500">{tx.date} • {tx.source}</p>
                          </div>
                          <span className={`font-black ${tx.type === 'earned' || tx.type === 'bonus' ? 'text-green-600' : 'text-red-600'}`}>
                            {tx.type === 'earned' || tx.type === 'bonus' ? '+' : '-'}{tx.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'activity' && (
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Activity size={18} /> Activity Timeline</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <UserCheck size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Account Created</p>
                        <p className="text-sm text-gray-500">{selectedUser.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <Activity size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Last Active</p>
                        <p className="text-sm text-gray-500">{new Date(selectedUser.lastActive).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">Level Progress</p>
                        <p className="text-sm text-gray-500">Current: Level {selectedUser.level}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'actions' && (
                <div className="space-y-6">
                  {/* Adjust Points */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Zap size={18} /> Adjust Points</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <input type="number" placeholder="Amount (+/-)" value={adjustmentAmount || ''} onChange={(e) => setAdjustmentAmount(parseInt(e.target.value) || 0)} className="px-4 py-2 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                      <input type="text" placeholder="Reason" value={adjustmentReason} onChange={(e) => setAdjustmentReason(e.target.value)} className="px-4 py-2 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
                      <button onClick={() => adjustUserPoints(selectedUser.id, adjustmentAmount, adjustmentReason)} className="px-4 py-2 bg-[#7B6EF6] text-white font-bold rounded-xl hover:bg-[#6B5EE6]">
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Account Status */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Shield size={18} /> Account Status</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <button onClick={() => changeUserStatus(selectedUser.id, 'active')} className="px-4 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-bold rounded-xl hover:bg-green-200 dark:hover:bg-green-900/50">
                        <UserCheck size={18} className="inline mr-2" /> Activate
                      </button>
                      <button onClick={() => changeUserStatus(selectedUser.id, 'suspended')} className="px-4 py-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 font-bold rounded-xl hover:bg-yellow-200 dark:hover:bg-yellow-900/50">
                        <Lock size={18} className="inline mr-2" /> Suspend
                      </button>
                      <button onClick={() => { if (window.confirm('Ban this user permanently?')) changeUserStatus(selectedUser.id, 'banned'); }} className="px-4 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-bold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50">
                        <Ban size={18} className="inline mr-2" /> Ban
                      </button>
                      <button onClick={() => resetPassword(selectedUser.id)} className="px-4 py-3 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-bold rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50">
                        <Key size={18} className="inline mr-2" /> Reset Password
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Mail size={18} /> Communication</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                        <Send size={18} className="inline mr-2" /> Send Email
                      </button>
                      <button onClick={() => revokeAllSessions(selectedUser.id)} className="px-4 py-3 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 border-2 border-gray-300 dark:border-gray-600">
                        <Lock size={18} className="inline mr-2" /> Revoke All Sessions
                      </button>
                    </div>
                  </div>

                  {/* Admin Notes */}
                  <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-900 dark:text-white">Admin Notes</h3>
                    <textarea value={adminNote || selectedUser.notes || ''} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add notes about this user..." className="w-full px-4 py-3 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none h-24" />
                    <button className="px-4 py-2 bg-[#7B6EF6] text-white font-bold rounded-xl">Save Notes</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </AdminLayout>
  );
};

export default AdminUsers;