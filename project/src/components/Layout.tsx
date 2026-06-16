import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, QrCode, Trophy, User,
  Sun, Moon, Star, Bell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import RewardPopup from './RewardPopup';
import { playSound } from '../lib/sounds';
import { prefetchRoute } from '../lib/routePrefetch';
import AppLogo from './AppLogo';
import DesktopFooter from './DesktopFooter';

const navItems = [
  { path: '/home',         icon: Home,        label: 'Sayfa'     },
  { path: '/shop',         icon: ShoppingBag, label: 'Mağaza'    },
  { path: '/leaderboard',  icon: Trophy,      label: 'Liderlik'  },
  { path: '/profile',      icon: User,        label: 'Profil'    },
];

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav }) => {
  const { theme, toggleTheme, points, rewardPopup, dismissRewardPopup, soundEnabled } = useApp();
  const location = useLocation();
  const navigate  = useNavigate();

  const playClick = React.useCallback(() => {
    if (soundEnabled) playSound('click');
  }, [soundEnabled]);

  const navigateTo = React.useCallback((path: string) => {
    playClick();
    navigate(path);
  }, [navigate, playClick]);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);

  if (isAuthPage) {
    return (
      <div className="page-container">
        {rewardPopup && <RewardPopup data={rewardPopup} onDismiss={dismissRewardPopup} />}
        {children}
        <button onClick={toggleTheme} aria-label={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'} className="btn-primary fixed top-4 right-4 p-3 z-50 rounded-button">
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>
      </div>
    );
  }

  return (
    <div className="page-container customer-shell flex overflow-x-hidden" style={{ position: 'relative' }}>
      {rewardPopup && <RewardPopup data={rewardPopup} onDismiss={dismissRewardPopup} />}

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header
          className="customer-app-header sticky top-0 z-30 flex items-center gap-3"
          style={{
            padding: '10px 16px',
            background: 'var(--card-bg)',
            borderBottom: '3px solid var(--dark-border)',
          }}
        >
          <button
            type="button"
            onClick={() => navigateTo('/home')}
            className="app-header-logo flex items-center flex-1 min-w-0"
            aria-label="NexReward ana sayfa"
          >
            <AppLogo size={64} priority className="app-header-logo__mark" />
          </button>

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
            aria-label={theme === 'light' ? 'Koyu temaya geç' : 'Açık temaya geç'}
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
              boxShadow: '0px 3px 0px var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
              transition: 'color 0.12s, background-color 0.12s',
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
              position: 'relative', transition: 'color 0.12s, background-color 0.12s',
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

        <main className="customer-main flex-1 overflow-x-hidden overflow-y-auto app-main-with-nav" style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>

        {!hideNav && <DesktopFooter onNavigate={navigateTo} />}

        {/* ── Bottom nav (mobile) ── */}
        {!hideNav && (
          <nav
            className="customer-bottom-nav fixed bottom-0 left-0 right-0 lg:hidden z-30 safe-bottom"
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
                    onClick={() => navigateTo(item.path)}
                    onMouseEnter={() => prefetchRoute(item.path)}
                    onFocus={() => prefetchRoute(item.path)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, padding: '4px 0', minHeight: 52, cursor: 'pointer',
                      background: 'none', border: 'none',
                    }}
                  >
                    <div
                      className={`customer-bottom-nav__icon-pill ${active ? 'customer-bottom-nav__icon-pill--active' : ''}`}
                      style={{
                      padding: '6px 16px', borderRadius: 12,
                      background: active ? `var(--primary-blue)18` : 'transparent',
                      border: active ? '3px solid var(--dark-border)' : '3px solid transparent',
                      transition: 'background-color 0.15s, border-color 0.15s',
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
                      lineHeight: 1, transition: 'color 0.15s, font-weight 0.15s',
                    }}>{item.label}</span>
                  </button>
                );
              })}

              {/* Center QR button */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, marginTop: -22 }}>
                <button
                  onClick={() => navigateTo('/qr')}
                  onMouseEnter={() => prefetchRoute('/qr')}
                  onFocus={() => prefetchRoute('/qr')}
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
                    onClick={() => navigateTo(item.path)}
                    onMouseEnter={() => prefetchRoute(item.path)}
                    onFocus={() => prefetchRoute(item.path)}
                    style={{
                      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                      gap: 3, padding: '4px 0', minHeight: 52, cursor: 'pointer',
                      background: 'none', border: 'none',
                    }}
                  >
                    <div
                      className={`customer-bottom-nav__icon-pill ${active ? 'customer-bottom-nav__icon-pill--active' : ''}`}
                      style={{
                      padding: '6px 16px', borderRadius: 12,
                      background: active ? `var(--primary-blue)18` : 'transparent',
                      border: active ? '3px solid var(--dark-border)' : '3px solid transparent',
                      transition: 'background-color 0.15s, border-color 0.15s',
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
                      lineHeight: 1, transition: 'color 0.15s, font-weight 0.15s',
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
