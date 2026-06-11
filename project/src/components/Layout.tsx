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
      { path: '/shop',      icon: ShoppingBag, label: 'Ürün Mağazası' },
      { path: '/inventory', icon: Package,     label: 'Envanterim'    },
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
      { path: '/leaderboard', icon: Trophy,    label: 'Lider Tablosu' },
      { path: '/stats',       icon: BarChart2, label: 'İstatistikler' },
      { path: '/history',     icon: History,   label: 'Geçmiş'        },
      { path: '/events',      icon: Zap,       label: 'Etkinlikler'   },
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
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: 'rgba(11,12,16,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 lg:static lg:flex lg:flex-col overflow-y-auto z-50 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{
          background: 'var(--card-bg)',
          borderRight: '3px solid var(--dark-border)',
          boxShadow: 'none',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '2.5px dashed var(--divider-dash)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src="/logo.png" alt="NexReward" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-2 rounded-xl"
              style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Points pill */}
        <div style={{ padding: '12px 16px 4px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: 'linear-gradient(135deg,rgba(123,110,246,0.12),rgba(167,139,250,0.06))',
            border: '2.5px solid var(--primary-blue)',
            boxShadow: '0px 3px 0px var(--dark-border)',
            borderRadius: 14,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))',
              border: '2px solid var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={14} fill="white" color="white" />
            </div>
            <div>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Puanlarım</p>
              <p style={{ fontSize: 16, fontWeight: 900, color: 'var(--text-dark)', margin: 0, lineHeight: 1.1 }}>{points.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* Nav groups */}
        <nav style={{ flex: 1, padding: '8px 12px 12px', overflowY: 'auto' }} className="space-y-4">
          {sidebarGroups.map((group) => (
            <div key={group.category}>
              <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', padding: '8px 8px 4px', margin: 0 }}>
                {group.category}
              </p>
              <div className="space-y-1">
                {group.items.map(item => {
                  const active = location.pathname === item.path;
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                        fontSize: 13, fontWeight: active ? 900 : 700,
                        background: active ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'transparent',
                        color: active ? 'white' : 'var(--text-dark)',
                        border: active ? '2px solid var(--dark-border)' : '2px solid transparent',
                        boxShadow: active ? '0px 3px 0px var(--dark-border)' : 'none',
                        transition: 'all 0.12s',
                      }}
                    >
                      <item.icon size={16} />
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {active && <ChevronRight size={13} />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Theme toggle */}
        <div style={{ padding: '12px', borderTop: '2.5px dashed var(--divider-dash)' }}>
          <button
            onClick={toggleTheme}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
              background: 'var(--tab-bg)', color: 'var(--text-dark)',
              border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)',
              fontSize: 13, fontWeight: 700, transition: 'all 0.12s',
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            <span>{theme === 'light' ? 'Karanlık Mod' : 'Açık Mod'}</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header
          className="sticky top-0 z-30 flex items-center gap-3"
          style={{
            padding: '10px 16px',
            background: 'var(--card-bg)',
            borderBottom: '3px solid var(--dark-border)',
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
              boxShadow: '0px 3px 0px var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-dark)',
            }}
          >
            <Menu size={18} />
          </button>

          <div className="hidden lg:flex items-center gap-2 flex-1 min-w-0">
            <span style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 600 }}>Hoşgeldiniz,</span>
            <span style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 14 }}>StarPlayer99</span>
          </div>
          <div className="flex-1 min-w-0 lg:hidden" />

          {/* Points badge */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '7px 12px',
            background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(251,191,36,0.06))',
            border: '2.5px solid #f59e0b', boxShadow: '0px 3px 0px var(--dark-border)',
            borderRadius: 12, flexShrink: 0,
          }}>
            <Star size={13} fill="#f59e0b" color="#f59e0b" />
            <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}>{points.toLocaleString()}</span>
          </div>

          {/* Theme */}
          <button
            onClick={toggleTheme}
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
              boxShadow: '0px 3px 0px var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
              transition: 'all 0.12s',
            }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Notifications */}
          <button
            onClick={() => navigate('/notifications')}
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
              boxShadow: '0px 3px 0px var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
              position: 'relative', transition: 'all 0.12s',
            }}
          >
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 8, height: 8, borderRadius: '50%',
              background: '#ef4444', border: '1.5px solid var(--card-bg)',
            }} />
          </button>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ paddingBottom: 88 }}>
          {children}
        </main>

        {/* ── Bottom nav (mobile) ── */}
        {!hideNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 lg:hidden z-30 safe-bottom"
            style={{
              background: 'var(--card-bg)',
              borderTop: '3px solid var(--dark-border)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '6px 8px 8px' }}>

              {/* Left two items */}
              {navItems.slice(0, 2).map(item => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, padding: '4px 0', minHeight: 52, cursor: 'pointer',
                      background: 'none', border: 'none',
                    }}
                  >
                    <div style={{
                      padding: '6px 16px', borderRadius: 12,
                      background: active ? `var(--primary-blue)18` : 'transparent',
                      border: active ? '2px solid rgba(123,110,246,0.3)' : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}>
                      <item.icon
                        size={22}
                        strokeWidth={active ? 2.5 : 1.8}
                        color={active ? 'var(--primary-blue)' : 'var(--text-muted)'}
                      />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: active ? 900 : 600,
                      color: active ? 'var(--primary-blue)' : 'var(--text-muted)',
                      lineHeight: 1, transition: 'all 0.15s',
                    }}>{item.label}</span>
                  </button>
                );
              })}

              {/* Center QR button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, marginTop: -22 }}>
                <button
                  onClick={() => navigate('/qr')}
                  style={{
                    width: 56, height: 56, borderRadius: 16, cursor: 'pointer',
                    background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))',
                    border: '3px solid var(--dark-border)',
                    boxShadow: '0px 5px 0px var(--dark-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', transition: 'transform 0.1s, box-shadow 0.1s',
                  }}
                  onMouseDown={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0px 1px 0px var(--dark-border)';
                  }}
                  onMouseUp={e => {
                    (e.currentTarget as HTMLElement).style.transform = '';
                    (e.currentTarget as HTMLElement).style.boxShadow = '0px 5px 0px var(--dark-border)';
                  }}
                >
                  <QrCode size={24} />
                </button>
                <span style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: 'var(--text-muted)', lineHeight: 1 }}>Tara</span>
              </div>

              {/* Right two items */}
              {navItems.slice(2).map(item => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, padding: '4px 0', minHeight: 52, cursor: 'pointer',
                      background: 'none', border: 'none',
                    }}
                  >
                    <div style={{
                      padding: '6px 16px', borderRadius: 12,
                      background: active ? `var(--primary-blue)18` : 'transparent',
                      border: active ? '2px solid rgba(123,110,246,0.3)' : '2px solid transparent',
                      transition: 'all 0.15s',
                    }}>
                      <item.icon
                        size={22}
                        strokeWidth={active ? 2.5 : 1.8}
                        color={active ? 'var(--primary-blue)' : 'var(--text-muted)'}
                      />
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: active ? 900 : 600,
                      color: active ? 'var(--primary-blue)' : 'var(--text-muted)',
                      lineHeight: 1, transition: 'all 0.15s',
                    }}>{item.label}</span>
                  </button>
                );
              })}

            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default Layout;
