# Shared layouts

## Layout

- File: `src/components/Layout.tsx`
- Authenticated customer application shell with sticky header, responsive content area, desktop footer, and mobile bottom navigation.

```tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, QrCode, Trophy, User,
  Sun, Moon, Star, Bell,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useFeatureFlags } from '../context/SystemSettingsContext';
import RewardPopup from './RewardPopup';
import { playSound } from '../lib/sounds';
import { prefetchRoute } from '../lib/routePrefetch';
import AppLogo from './AppLogo';
import DesktopFooter from './DesktopFooter';

const navItems = [
  { path: '/home',         icon: Home,        label: 'Sayfa'     },
  { path: '/shop',         icon: ShoppingBag, label: 'MaÄŸaza'    },
  { path: '/leaderboard',  icon: Trophy,      label: 'Liderlik'  },
  { path: '/profile',      icon: User,        label: 'Profil'    },
];

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav }) => {
  const { theme, toggleTheme, points, rewardPopup, dismissRewardPopup, soundEnabled } = useApp();
  const flags = useFeatureFlags();
  const location = useLocation();
  const navigate  = useNavigate();

  const playClick = React.useCallback(() => {
    if (soundEnabled) playSound('click');
  }, [soundEnabled]);

  const navigateTo = React.useCallback((path: string) => {
    playClick();
    navigate(path);
  }, [navigate, playClick]);

  return (
    <div className="page-container customer-shell flex overflow-x-hidden" style={{ position: 'relative' }}>
      {rewardPopup && <RewardPopup data={rewardPopup} onDismiss={dismissRewardPopup} />}

      {/* â”€â”€ Main content â”€â”€ */}
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
          <div className="customer-header-points" role="status" aria-label={`Mevcut bakiye: ${points.toLocaleString()} puan`} style={{
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
            aria-label={theme === 'light' ? 'Koyu temaya geÃ§' : 'AÃ§Ä±k temaya geÃ§'}
            className="customer-header-icon-button"
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
            onClick={() => navigateTo('/notifications')}
            aria-label="Bildirimleri aÃ§"
            className="customer-header-icon-button"
            style={{
              width: 40, height: 40, borderRadius: 12, flexShrink: 0,
              background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)',
              boxShadow: '0px 3px 0px var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
              position: 'relative', transition: 'color 0.12s, background-color 0.12s',
            }}
          >
            <Bell size={17} aria-hidden="true" />
          </button>
        </header>

        <main className="customer-main flex-1 overflow-x-hidden overflow-y-auto app-main-with-nav" style={{ position: 'relative', zIndex: 1 }}>
          {children}
        </main>

        {!hideNav && <DesktopFooter onNavigate={navigateTo} />}

        {/* â”€â”€ Bottom nav (mobile) â”€â”€ */}
        {!hideNav && (
          <nav
            className="customer-bottom-nav fixed bottom-0 left-0 right-0 lg:hidden z-30 safe-bottom"
            aria-label="Ana navigasyon"
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
                    className="customer-bottom-nav__item"
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
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
                    <span className="customer-bottom-nav__label" style={{
                      fontSize: 10, fontWeight: active ? 900 : 600,
                      color: active ? 'var(--primary-blue)' : 'var(--text-muted)',
                      lineHeight: 1, transition: 'color 0.15s, font-weight 0.15s',
                    }}>{item.label}</span>
                  </button>
                );
              })}

              {/* Center QR button â€” hidden when QR module disabled */}
              {flags.qr_enabled ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, marginTop: -22 }}>
                <button
                  className="customer-bottom-nav__scan"
                  aria-label="QR kod tara"
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
                  <QrCode size={24} aria-hidden="true" />
                </button>
                <span className="customer-bottom-nav__label" style={{ fontSize: 10, fontWeight: 700, marginTop: 4, color: 'var(--text-muted)', lineHeight: 1 }}>Tara</span>
              </div>
              ) : null}

              {/* Right two items */}
              {navItems.slice(2).map(item => {
                const active = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className="customer-bottom-nav__item"
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
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
                    <span className="customer-bottom-nav__label" style={{
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

```

## DesktopFooter

- File: `src/components/DesktopFooter.tsx`
- Desktop-only footer/navigation used by Layout.

```tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Home, QrCode, ShoppingBag, Trophy, User, Gamepad2, Target, Zap,
  Package, BarChart2, History, Bell, Settings, HelpCircle, TrendingUp,
} from 'lucide-react';
import { prefetchRoute } from '../lib/routePrefetch';
import AppLogo from './AppLogo';
import { useFeatureFlags } from '../context/SystemSettingsContext';

type FooterLink = {
  path: string;
  label: string;
  icon: LucideIcon;
};

const FOOTER_SECTIONS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Ana',
    links: [
      { path: '/home', label: 'Ana Sayfa', icon: Home },
      { path: '/qr', label: 'QR Tara', icon: QrCode },
      { path: '/shop', label: 'MaÄŸaza', icon: ShoppingBag },
      { path: '/leaderboard', label: 'Liderlik', icon: Trophy },
      { path: '/profile', label: 'Profil', icon: User },
    ],
  },
  {
    title: 'KeÅŸfet',
    links: [
      { path: '/games', label: 'Oyunlar', icon: Gamepad2 },
      { path: '/missions', label: 'GÃ¶revler', icon: Target },
      { path: '/events', label: 'Etkinlikler', icon: Zap },
      { path: '/inventory', label: 'Envanter', icon: Package },
      { path: '/progress', label: 'Ä°lerleme', icon: TrendingUp },
    ],
  },
  {
    title: 'Hesap',
    links: [
      { path: '/achievements', label: 'BaÅŸarÄ±lar', icon: Trophy },
      { path: '/stats', label: 'Ä°statistikler', icon: BarChart2 },
      { path: '/history', label: 'GeÃ§miÅŸ', icon: History },
      { path: '/notifications', label: 'Bildirimler', icon: Bell },
      { path: '/settings', label: 'Ayarlar', icon: Settings },
      { path: '/support', label: 'Destek', icon: HelpCircle },
    ],
  },
];

function isActivePath(pathname: string, path: string): boolean {
  if (path === '/home') return pathname === '/home' || pathname === '/app';
  return pathname === path || pathname.startsWith(`${path}/`);
}

type DesktopFooterProps = {
  onNavigate: (path: string) => void;
};

const DesktopFooter: React.FC<DesktopFooterProps> = ({ onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const flags = useFeatureFlags();

  const filterLinks = (links: FooterLink[]) =>
    links.filter(link => {
      if (link.path === '/qr') return flags.qr_enabled;
      if (link.path === '/games') return flags.games_enabled;
      if (link.path === '/missions') return flags.missions_enabled;
      return true;
    });

  const sections = FOOTER_SECTIONS.map(section => ({
    ...section,
    links: filterLinks(section.links),
  })).filter(section => section.links.length > 0);

  return (
    <footer className="app-desktop-footer hidden lg:block">
      <div className="app-desktop-footer__inner">
        <div className="app-desktop-footer__brand">
          <button
            type="button"
            className="app-desktop-footer__logo"
            onClick={() => onNavigate('/home')}
            aria-label="NexReward ana sayfa"
          >
            <AppLogo size={36} className="app-desktop-footer__logo-mark" />
            <div>
              <p className="app-desktop-footer__logo-title">NexReward</p>
              <p className="app-desktop-footer__logo-sub">Puan kazan, Ã¶dÃ¼l topla</p>
            </div>
          </button>
        </div>

        {sections.map(section => (
          <div key={section.title} className="app-desktop-footer__col">
            <p className="app-desktop-footer__col-title">{section.title}</p>
            <ul className="app-desktop-footer__links">
              {section.links.map(link => {
                const active = isActivePath(location.pathname, link.path);
                const Icon = link.icon;
                return (
                  <li key={link.path}>
                    <button
                      type="button"
                      className={`app-desktop-footer__link${active ? ' app-desktop-footer__link--active' : ''}`}
                      onClick={() => onNavigate(link.path)}
                      onMouseEnter={() => prefetchRoute(link.path)}
                      onFocus={() => prefetchRoute(link.path)}
                    >
                      <Icon size={14} strokeWidth={active ? 2.5 : 2} />
                      <span>{link.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

        <div className="app-desktop-footer__cta">
          {flags.qr_enabled && (
          <button
            type="button"
            className="app-desktop-footer__qr-btn"
            onClick={() => onNavigate('/qr')}
            onMouseEnter={() => prefetchRoute('/qr')}
          >
            <QrCode size={20} />
            QR Tara
          </button>
          )}
          <button
            type="button"
            className="app-desktop-footer__shop-btn"
            onClick={() => onNavigate('/shop')}
            onMouseEnter={() => prefetchRoute('/shop')}
          >
            <ShoppingBag size={18} />
            MaÄŸazaya Git
          </button>
        </div>
      </div>

      <div className="app-desktop-footer__bar">
        <span>Â© {new Date().getFullYear()} NexReward</span>
        <div className="app-desktop-footer__legal">
          <button type="button" onClick={() => navigate('/terms')}>KullanÄ±m</button>
          <button type="button" onClick={() => navigate('/privacy')}>Gizlilik</button>
        </div>
      </div>
    </footer>
  );
};

export default DesktopFooter;

```

## AppLogo

- File: `src/components/AppLogo.tsx`
- Shared brand mark used in the shell header.

```tsx
import React from 'react';

export type AppLogoSize = 32 | 36 | 64 | 72;

type AppLogoProps = {
  size?: AppLogoSize;
  className?: string;
  style?: React.CSSProperties;
  inverted?: boolean;
  priority?: boolean;
};

const LOGO_FILES: Record<AppLogoSize, string> = {
  32: 'logo-wordmark-32',
  36: 'logo-wordmark-36',
  64: 'logo-wordmark-64',
  72: 'logo-wordmark-72',
};

const LOGO_DIMENSIONS: Record<AppLogoSize, { width: number; height: number }> = {
  32: { width: 99, height: 32 },
  36: { width: 114, height: 36 },
  64: { width: 206, height: 64 },
  72: { width: 228, height: 72 },
};

/** Responsive logo â€” serves WebP at the exact display size to avoid oversized downloads. */
const AppLogo: React.FC<AppLogoProps> = ({
  size = 36,
  className = '',
  style,
  inverted = false,
  priority = false,
}) => {
  const base = LOGO_FILES[size];
  const dimensions = LOGO_DIMENSIONS[size];

  return (
    <picture>
      <source type="image/webp" srcSet={`/assets/icons/${base}.webp`} />
      <img
        src={`/assets/icons/${base}.png`}
        alt="Nesve Next"
        width={dimensions.width}
        height={dimensions.height}
        className={className}
        decoding={priority ? 'sync' : 'async'}
        loading={priority ? 'eager' : 'lazy'}
        {...({ fetchpriority: priority ? 'high' : 'auto' } as any)}
        style={{
          width: dimensions.width,
          height: dimensions.height,
          objectFit: 'contain',
          display: 'block',
          filter: inverted ? 'brightness(0) invert(1)' : undefined,
          ...style,
        }}
      />
    </picture>
  );
};

export default AppLogo;

```


