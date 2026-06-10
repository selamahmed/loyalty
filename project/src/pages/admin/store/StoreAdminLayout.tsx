import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Gift, QrCode, BarChart2,
  Menu, X, Moon, Sun, LogOut, Store, Package, Tag, Bell
} from 'lucide-react';
import { useApp } from '../../../context/AppContext';
import { useAuth } from '../../../context/AuthContext';

const storeNavItems = [
  { path: '/store-admin',               icon: LayoutDashboard, label: 'Kontrol Paneli' },
  { path: '/store-admin/customers',     icon: Users,           label: 'Müşteriler'      },
  { path: '/store-admin/rewards',       icon: Gift,            label: 'Ödüller'          },
  { path: '/store-admin/inventory',     icon: Package,         label: 'Envanter'         },
  { path: '/store-admin/promotions',    icon: Tag,             label: 'Promosyonlar'     },
  { path: '/store-admin/qr',            icon: QrCode,          label: 'QR İşlemleri'    },
  { path: '/store-admin/analytics',     icon: BarChart2,       label: 'Raporlar'         },
  { path: '/store-admin/notifications', icon: Bell,            label: 'Bildirimler'      },
];

const ACCENT = '#22c55e';

const StoreAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useApp();
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const currentLabel = storeNavItems.find(n => n.path === location.pathname)?.label || 'Mağaza Paneli';

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-color)' }}>
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 h-full w-64 z-50 flex flex-col overflow-y-auto transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static`}
        style={{ background: 'var(--card-bg)', borderRight: '2.5px solid var(--dark-border)' }}
      >
        <div className="p-5" style={{ borderBottom: '2.5px solid var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <Store size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Mağaza Paneli</h1>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>NexReward</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="mx-3 mt-4 mb-2 px-3 py-2.5 rounded-xl flex items-center gap-2"
          style={{ background: `${ACCENT}15`, border: `2px solid ${ACCENT}` }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
            style={{ background: ACCENT }}>
            {authUser?.name?.[0] ?? 'S'}
          </div>
          <div className="min-w-0">
            <p className="font-black text-xs truncate" style={{ color: 'var(--text-dark)' }}>{authUser?.name}</p>
            <p className="text-xs font-medium" style={{ color: ACCENT }}>Mağaza Yöneticisi</p>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {storeNavItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-bold transition-all"
                style={{
                  background: active ? ACCENT : 'transparent',
                  color: active ? 'white' : 'var(--text-muted)',
                  border: active ? '2px solid var(--dark-border)' : '2px solid transparent',
                  boxShadow: active ? '0px 2px 0px var(--dark-border)' : 'none',
                }}>
                <item.icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3" style={{ borderTop: '2px solid var(--dark-border)' }}>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{ color: '#ef4444' }}>
            <LogOut size={16} />
            Çıkış Yap
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--card-bg)', borderBottom: '2.5px solid var(--dark-border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl transition-colors" style={{ color: 'var(--text-muted)' }}>
            <Menu size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: ACCENT }}>Mağaza Paneli</span>
            <p className="font-black text-sm truncate" style={{ color: 'var(--text-dark)' }}>{currentLabel}</p>
          </div>
          <button onClick={toggleTheme} className="p-2 rounded-xl transition-colors flex-shrink-0"
            style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)' }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={handleLogout}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-black transition-all active:translate-y-0.5"
            style={{ background: '#fee2e2', color: '#ef4444', border: '2px solid #fca5a5', boxShadow: '0px 2px 0px #fca5a5' }}>
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

export default StoreAdminLayout;
