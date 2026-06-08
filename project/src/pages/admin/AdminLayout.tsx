import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Gift, QrCode, Gamepad2, BarChart2,
  Megaphone, Menu, X, Shield, Bell, Moon, Sun, ArrowLeft, Settings,
  Activity, Zap, FileText, Trophy, Package, ScanLine
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { tr } from '../../lib/tr';

const adminNavItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/admin/dashboard-v2', icon: Activity, label: 'Dashboard V2' },
  { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/users-v2', icon: Shield, label: 'Users V2 (Full)' },
  { path: '/admin/rewards', icon: Gift, label: 'Rewards' },
  { path: '/admin/reward-events', icon: Trophy, label: 'Reward Events' },
  { path: '/admin/events', icon: Bell, label: 'Events' },
  { path: '/admin/notifications', icon: Megaphone, label: 'Notifications' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/checkout', icon: ScanLine, label: 'Checkout Scanner' },
  { path: '/admin/qr', icon: QrCode, label: 'QR Codes' },
  { path: '/admin/games', icon: Gamepad2, label: 'Games' },
  { path: '/admin/points-economy', icon: Zap, label: 'Points Economy' },
  { path: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Admin sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-gray-900 border-r-2 border-black dark:border-gray-700 z-50 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex lg:flex-col overflow-y-auto`}>
        <div className="p-5 border-b-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black dark:bg-white flex items-center justify-center">
              <Shield size={16} className="text-white dark:text-black" />
            </div>
            <div>
              <h1 className="font-black text-gray-900 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">NexReward</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-medium ${
                location.pathname === item.path
                  ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-2 border-black dark:border-gray-600'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t-2 border-black dark:border-gray-700">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 transition-colors"
          >
            <ArrowLeft size={16} />
            Back to App
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b-2 border-black dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Admin</span>
            <p className="font-black text-gray-900 dark:text-white text-sm truncate">{adminNavItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}</p>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
