import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, UserCog, Gift, QrCode, Gamepad2, BarChart2,
  Megaphone, Menu, X, Shield, Bell, Moon, Sun, Settings,
  Activity, Zap, FileText, Trophy, Package, ScanLine, Calendar, LogOut, MessageSquare
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const adminNavItems = [
  { path: '/admin',               icon: LayoutDashboard, label: 'Kontrol Paneli'       },
  { path: '/admin/dashboard-v2',  icon: Activity,        label: 'Panel V2'              },
  { path: '/admin/analytics',     icon: BarChart2,       label: 'Analitik'              },
  { path: '/admin/users',         icon: Users,           label: 'Kullanıcı Yönetimi'    },
  { path: '/admin/roles',         icon: UserCog,         label: 'Rol Yönetimi'          },
  { path: '/admin/rewards',       icon: Gift,            label: 'Ürün Mağazası'         },
  { path: '/admin/reward-events', icon: Trophy,          label: 'Ödül Etkinlikleri'     },
  { path: '/admin/events',        icon: Bell,            label: 'Etkinlikler'           },
  { path: '/admin/notifications', icon: Megaphone,       label: 'Bildirimler'           },
  { path: '/admin/inventory',     icon: Package,         label: 'Envanter Yönetimi'     },
  { path: '/admin/checkout',      icon: ScanLine,        label: 'Checkout Tarayıcı'     },
  { path: '/admin/qr',            icon: QrCode,          label: 'QR Kodları'            },
  { path: '/admin/games',         icon: Gamepad2,        label: 'Oyunlar'               },
  { path: '/admin/daily-rewards', icon: Calendar,        label: 'Günlük Ödüller'        },
  { path: '/admin/points-economy',icon: Zap,             label: 'Puan Ekonomisi'        },
  { path: '/admin/audit-logs',    icon: FileText,        label: 'Denetim Günlüğü'       },
  { path: '/admin/support',       icon: MessageSquare,   label: 'Destek Talepleri'       },
  { path: '/admin/settings',      icon: Settings,        label: 'Ayarlar'               },
];

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useApp();
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout().finally(() => navigate('/login', { replace: true }));
  };

  const isActivePath = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin' || location.pathname === '/admin/';
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const currentNavItem = adminNavItems.find(item => isActivePath(item.path));

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

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

        {/* Logged-in user badge */}
        {authUser && (
          <div className="mx-3 mt-4 mb-1 px-3 py-2.5 rounded-xl flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border-2 border-[#7B6EF6]">
            <div className="w-8 h-8 rounded-full bg-[#7B6EF6] flex items-center justify-center font-black text-white text-sm flex-shrink-0">
              {authUser.name?.[0] ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="font-black text-xs truncate text-gray-900 dark:text-white">{authUser.name}</p>
              <p className="text-xs font-medium text-[#7B6EF6]">Süper Admin</p>
            </div>
          </div>
        )}

        <nav className="flex-1 p-3 space-y-1">
          {adminNavItems.map(item => (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left text-sm font-medium ${
                isActivePath(item.path)
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
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-bold text-red-500 transition-colors"
          >
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b-2 border-black dark:border-gray-700 px-4 py-3 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Süper Admin</span>
            <p className="font-black text-gray-900 dark:text-white text-sm truncate">
              {currentNavItem?.label || 'Dashboard'}
            </p>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex-shrink-0">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-black transition-all active:translate-y-0.5"
            style={{ background: '#fee2e2', color: '#ef4444', border: '2px solid #fca5a5', boxShadow: '0px 2px 0px #fca5a5' }}
          >
            <LogOut size={14} />
            Çıkış
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
