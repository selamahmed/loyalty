import React, { useState } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, TrendingUp, ShoppingBag, QrCode, Gamepad2, Bell, TicketCheck, Settings, LogOut, Menu, X, ChevronDown, BarChart2, Activity, Shield, Zap, FileText } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { authUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Activity, label: 'Dashboard V2', path: '/admin/dashboard-v2' },
    { icon: BarChart2, label: 'Analytics', path: '/admin/analytics' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: Shield, label: 'Users V2 (Full)', path: '/admin/users-v2' },
    { icon: TrendingUp, label: 'Points Economy', path: '/admin/points-economy' },
    { icon: ShoppingBag, label: 'Rewards Store', path: '/admin/rewards' },
    { icon: QrCode, label: 'QR System', path: '/admin/qr' },
    { icon: Gamepad2, label: 'Gamification', path: '/admin/games' },
    { icon: Bell, label: 'Notifications', path: '/admin/notifications' },
    { icon: FileText, label: 'Audit Logs', path: '/admin/audit-logs' },
    { icon: TicketCheck, label: 'Support Tickets', path: '/admin/support' },
    { icon: Settings, label: 'System Settings', path: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const isActive = (path: string) => location.pathname.includes(path.split('/')[2]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 border-r-2 border-black dark:border-gray-700 transform transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b-2 border-black dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#7B6EF6] dark:bg-[#4F8EF7] flex items-center justify-center">
              <LayoutDashboard size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-gray-900 dark:text-white text-sm">Admin</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Console</p>
            </div>
          </div>
        </div>

        {/* Menu */}
        <div className="flex-1 overflow-y-auto">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-bold transition-all ${
                    active
                      ? 'bg-[#7B6EF6]/20 dark:bg-[#4F8EF7]/20 text-[#7B6EF6] dark:text-[#4F8EF7] border-2 border-[#7B6EF6] dark:border-[#4F8EF7]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Info */}
        <div className="p-4 border-t-2 border-black dark:border-gray-700 space-y-3">
          <div className="p-3 rounded-2xl bg-gray-100 dark:bg-gray-700">
            <p className="text-xs text-gray-600 dark:text-gray-400">Admin</p>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{authUser?.username ?? authUser?.email}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{authUser?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 rounded-2xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-bold hover:shadow-lg transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Header */}
        <div className="h-20 bg-white dark:bg-gray-800 border-b-2 border-black dark:border-gray-700 flex items-center justify-between px-6">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7B6EF6] to-[#4F8EF7]" />
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
