import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, Gamepad2, BarChart2, QrCode, Trophy,
  Target, Bell, History, Settings, User, Package, ChevronRight,
  Sun, Moon, Menu, X, Star, Zap, Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import RewardPopup from './RewardPopup';

const navItems = [
  { path: '/home',     icon: Home,        label: 'Sayfa'    },
  { path: '/shop',     icon: ShoppingBag, label: 'Mağaza'   },
  { path: '/progress', icon: BarChart2,   label: 'İlerleme' },
  { path: '/profile',  icon: User,        label: 'Profil'   },
];

const sidebarGroups = [
  {
    category: 'Genel',
    items: [
      { path: '/home',          icon: Home,         label: 'Ana Sayfa'    },
      { path: '/profile',       icon: User,         label: 'Profil'       },
      { path: '/notifications', icon: Bell,         label: 'Bildirimler'  },
    ],
  },
  {
    category: 'Mağaza & Ödüller',
    items: [
      { path: '/shop',      icon: ShoppingBag, label: 'Ürün Mağazası'   },
      { path: '/inventory', icon: Package,     label: 'Envanterim'       },
      { path: '/redeem',    icon: Star,        label: 'Puanları Kullan'  },
    ],
  },
  {
    category: 'Aktiviteler & Oyun',
    items: [
      { path: '/games',        icon: Gamepad2, label: 'Mini Oyunlar'    },
      { path: '/missions',     icon: Target,   label: 'Günlük Görevler' },
      { path: '/progress',     icon: BarChart2,label: 'İlerleme Yolu'   },
      { path: '/achievements', icon: Trophy,   label: 'Başarılar'       },
    ],
  },
  {
    category: 'Analitik & Geçmiş',
    items: [
      { path: '/leaderboard', icon: Trophy,    label: 'Lider Tablosu'  },
      { path: '/stats',       icon: BarChart2, label: 'İstatistikler'  },
      { path: '/history',     icon: History,   label: 'Geçmiş'         },
      { path: '/events',      icon: Zap,       label: 'Etkinlikler'    },
    ],
  },
  {
    category: 'Ayarlar',
    items: [
      { path: '/settings', icon: Settings,     label: 'Ayarlar'  },
      { path: '/support',  icon: ChevronRight, label: 'Destek'   },
      { path: '/admin',    icon: Shield,       label: 'Yönetici' },
    ],
  },
];

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav }) => {
  const { theme, toggleTheme, points, rewardPopup, dismissRewardPopup } = useApp();
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="page-container">
        {rewardPopup && <RewardPopup data={rewardPopup} onDismiss={dismissRewardPopup} />}
        {children}
        <button onClick={toggleTheme} className="btn-primary fixed top-4 right-4 p-3 z-50 rounded-button">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div className="page-container flex overflow-x-hidden">
      {rewardPopup && <RewardPopup data={rewardPopup} onDismiss={dismissRewardPopup} />}

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(11,12,16,0.7)' }}
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 card rounded-0 lg:static lg:flex lg:flex-col overflow-y-auto z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 border-r-4 border-b-0`}
        style={{ background: 'var(--card-bg)', borderRadius: 0, boxShadow: 'none' }}
      >
        {/* Logo */}
        <div className="p-6 divider-dashed">
          <div className="flex items-center">
            <img src="/logo.png" alt="NexReward" style={{ height: 48, width: 'auto', objectFit: 'contain' }} />
            <button onClick={() => setSidebarOpen(false)} className="ml-auto p-2 rounded-button lg:hidden btn-secondary">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Points card */}
        <div className="p-4">
          <div className="card p-4 flex items-center gap-3"
            style={{ background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
            <div className="w-9 h-9 rounded-button flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(180deg,var(--gradient-start) 0%,var(--gradient-end) 100%)', color: 'white', border: '2px solid var(--dark-border)' }}>
              <Star size={14} fill="white" />
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)' }} className="text-xs font-600">Puanlarım</p>
              <p style={{ color: 'var(--text-dark)' }} className="font-black text-lg">{points.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {sidebarGroups.map((group) => (
            <div key={group.category}>
              <p style={{ color: 'var(--text-muted)' }} className="px-4 py-2 text-xs font-black uppercase tracking-wider mb-2">
                {group.category}
              </p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-button transition-all text-left text-sm font-600"
                      style={{
                        background: active ? 'linear-gradient(180deg,var(--gradient-start) 0%,var(--gradient-end) 100%)' : 'var(--card-bg)',
                        color: active ? 'white' : 'var(--text-dark)',
                        border: '2.5px solid var(--dark-border)',
                        boxShadow: active ? '0px 4px 0px var(--dark-border)' : '0px 3px 0px var(--dark-border)',
                      }}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                      {active && <ChevronRight size={14} className="ml-auto" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Theme toggle */}
        <div className="p-3 divider-dashed">
          <button onClick={toggleTheme} className="w-full flex items-center gap-3 px-4 py-3 rounded-button btn-secondary">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            <span className="text-sm">{theme === 'light' ? 'Karanlık Mod' : 'Açık Mod'}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col">
        <header className="sticky top-0 z-30 px-4 py-3 flex items-center gap-3 border-b-4"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--dark-border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden btn-secondary p-2 rounded-button">
            <Menu size={18} />
          </button>
          <div className="hidden lg:flex items-center gap-2 flex-1">
            <span style={{ color: 'var(--text-muted)' }} className="text-sm font-600">Hoşgeldiniz,</span>
            <span style={{ color: 'var(--text-dark)' }} className="font-black">StarPlayer99</span>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 rounded-button"
            style={{ background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)' }}>
            <Star size={14} style={{ color: '#f59e0b' }} fill="currentColor" />
            <span style={{ color: 'var(--text-dark)' }} className="font-black text-sm">{points.toLocaleString()}</span>
          </div>

          <button onClick={toggleTheme} className="btn-secondary p-3 rounded-button">
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button onClick={() => navigate('/notifications')} className="btn-secondary p-3 rounded-button relative">
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto pb-20 lg:pb-6">
          {children}
        </main>

        {/* Bottom nav (mobile) */}
        {!hideNav && (
          <nav className="fixed bottom-0 left-0 right-0 lg:hidden z-30 border-t-4"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--dark-border)' }}>
            <div className="flex items-end justify-around px-1 pb-2 pt-1">
              {navItems.slice(0, 2).map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-button transition-all flex-1"
                  style={{ color: location.pathname === item.path ? 'var(--gradient-start)' : 'var(--text-muted)' }}>
                  <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 1.8} />
                  <span className="text-xs font-600">{item.label}</span>
                </button>
              ))}

              <div className="flex flex-col items-center flex-1" style={{ marginTop: '-20px' }}>
                <button onClick={() => navigate('/qr')}
                  className="flex items-center justify-center rounded-button transition-all active:scale-95"
                  style={{
                    background: 'linear-gradient(180deg,var(--gradient-start) 0%,var(--gradient-end) 100%)',
                    color: 'white', border: '2.5px solid var(--dark-border)',
                    boxShadow: '0px 5px 0px var(--dark-border)', width: 54, height: 54,
                  }}>
                  <QrCode size={24} />
                </button>
                <span className="text-xs font-600 mt-1" style={{ color: 'var(--text-muted)' }}>Tara</span>
              </div>

              {navItems.slice(2).map(item => (
                <button key={item.path} onClick={() => navigate(item.path)}
                  className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-button transition-all flex-1"
                  style={{ color: location.pathname === item.path ? 'var(--gradient-start)' : 'var(--text-muted)' }}>
                  <item.icon size={22} strokeWidth={location.pathname === item.path ? 2.5 : 1.8} />
                  <span className="text-xs font-600">{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;
