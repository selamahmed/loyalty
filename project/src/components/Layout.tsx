import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, Gamepad2, BarChart2, QrCode, Trophy,
  Target, Bell, History, Settings, User, Package,
  Sun, Moon, Menu, X, Star, Zap, HelpCircle, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import RewardPopup from './RewardPopup';
import { playSound } from '../lib/sounds';
import { prefetchRoute } from '../lib/routePrefetch';
import NeoAvatar from './NeoAvatar';

const navItems = [
  { path: '/home',         icon: Home,        label: 'Sayfa'     },
  { path: '/shop',         icon: ShoppingBag, label: 'Mağaza'    },
  { path: '/leaderboard',  icon: Trophy,      label: 'Liderlik'  },
  { path: '/profile',      icon: User,        label: 'Profil'    },
];

type NavItem = { path: string; icon: LucideIcon; label: string; iconColor: string; iconBg: string };

const sidebarGroups: { category: string; emoji: string; items: NavItem[] }[] = [
  {
    category: 'Genel',
    emoji: '🏠',
    items: [
      { path: '/home',          icon: Home,   label: 'Ana Sayfa',   iconColor: '#7B6EF6', iconBg: 'rgba(123,110,246,0.14)' },
      { path: '/profile',       icon: User,   label: 'Profil',      iconColor: '#3b82f6', iconBg: 'rgba(59,130,246,0.14)' },
      { path: '/qr',            icon: QrCode, label: 'QR Tara',     iconColor: '#a78bfa', iconBg: 'rgba(167,139,250,0.18)' },
      { path: '/notifications', icon: Bell,   label: 'Bildirimler', iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.14)' },
    ],
  },
  {
    category: 'Mağaza & Ödüller',
    emoji: '🎁',
    items: [
      { path: '/shop',      icon: ShoppingBag, label: 'Ürün Mağazası', iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.14)' },
      { path: '/inventory', icon: Package,     label: 'Envanterim',    iconColor: '#06b6d4', iconBg: 'rgba(6,182,212,0.14)' },
    ],
  },
  {
    category: 'Aktiviteler & Oyun',
    emoji: '🎮',
    items: [
      { path: '/games',        icon: Gamepad2,  label: 'Mini Oyunlar',    iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.14)' },
      { path: '/missions',     icon: Target,    label: 'Günlük Görevler', iconColor: '#ef4444', iconBg: 'rgba(239,68,68,0.14)' },
      { path: '/progress',     icon: BarChart2, label: 'İlerleme Yolu',   iconColor: '#7B6EF6', iconBg: 'rgba(123,110,246,0.14)' },
      { path: '/achievements', icon: Trophy,    label: 'Başarılar',       iconColor: '#f59e0b', iconBg: 'rgba(245,158,11,0.14)' },
    ],
  },
  {
    category: 'Analitik & Geçmiş',
    emoji: '📊',
    items: [
      { path: '/leaderboard', icon: Trophy,    label: 'Lider Tablosu', iconColor: '#FFE500', iconBg: 'rgba(255,229,0,0.18)' },
      { path: '/stats',       icon: BarChart2, label: 'İstatistikler', iconColor: '#3b82f6', iconBg: 'rgba(59,130,246,0.14)' },
      { path: '/history',     icon: History,   label: 'Geçmiş',        iconColor: '#56C8FF', iconBg: 'rgba(86,200,255,0.14)' },
      { path: '/events',      icon: Zap,       label: 'Etkinlikler',   iconColor: '#ec4899', iconBg: 'rgba(236,72,153,0.14)' },
    ],
  },
  {
    category: 'Ayarlar',
    emoji: '⚙️',
    items: [
      { path: '/settings', icon: Settings,    label: 'Ayarlar',   iconColor: '#7B6EF6', iconBg: 'rgba(123,110,246,0.14)' },
      { path: '/support',  icon: HelpCircle,  label: 'Destek',    iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.14)' },
    ],
  },
];

const isNavActive = (pathname: string, path: string) =>
  pathname === path || pathname.startsWith(`${path}/`);

interface LayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, hideNav }) => {
  const { theme, toggleTheme, points, user, rewardPopup, dismissRewardPopup, soundEnabled } = useApp();
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});
  const navRef = React.useRef<HTMLElement>(null);
  const [canScrollDown, setCanScrollDown] = React.useState(false);

  const playClick = React.useCallback(() => {
    if (soundEnabled) playSound('click');
  }, [soundEnabled]);

  const navigateTo = React.useCallback((path: string) => {
    playClick();
    navigate(path);
    setSidebarOpen(false);
  }, [navigate, playClick]);

  const toggleGroup = (category: string) => {
    setCollapsedGroups(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const updateScrollHint = React.useCallback(() => {
    window.requestAnimationFrame(() => {
      const el = navRef.current;
      if (!el) return;
      setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
    });
  }, []);

  React.useEffect(() => {
    setCollapsedGroups(prev => {
      let changed = false;
      const next = { ...prev };
      sidebarGroups.forEach(g => {
        if (g.items.some(item => isNavActive(location.pathname, item.path)) && next[g.category]) {
          next[g.category] = false;
          changed = true;
        }
      });
      return changed ? next : prev;
    });
    updateScrollHint();
  }, [location.pathname, updateScrollHint]);

  React.useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollHint, { passive: true });
    const ro = new ResizeObserver(() => updateScrollHint());
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', updateScrollHint);
      ro.disconnect();
    };
  }, [updateScrollHint]);

  React.useEffect(() => {
    updateScrollHint();
  }, [collapsedGroups, sidebarOpen, updateScrollHint]);

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
    <div className="page-container flex overflow-x-hidden" style={{ position: 'relative' }}>
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(288px,92vw)] flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-svh lg:w-60 lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--card-bg)',
          borderRight: '3px solid var(--dark-border)',
          boxShadow: sidebarOpen ? '8px 0 24px rgba(0,0,0,0.15)' : 'none',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '12px 14px', borderBottom: '2px solid var(--dark-border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))',
              border: '2px solid var(--dark-border)', boxShadow: '0 2px 0 var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>⭐</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0, lineHeight: 1.1 }}>NexReward</p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, margin: '1px 0 0' }}>Sadakat Platformu</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              aria-label="Menüyü kapat"
              style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* User + points */}
        <div style={{ padding: '8px 12px', borderBottom: '2px solid var(--dark-border)', flexShrink: 0 }}>
          <button
            type="button"
            className="sidebar-nav-btn"
            style={{ ['--nav-accent' as string]: '#C8FF00' } as React.CSSProperties}
            onClick={() => { playClick(); navigate('/profile'); setSidebarOpen(false); }}
          >
            <NeoAvatar
              src={user.avatar}
              name={user.username}
              email={user.email}
              size={30}
              shape="circle"
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.username}
              </p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>Lv.{user.level}</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3, padding: '4px 7px', borderRadius: 8,
              background: '#FFE500', border: '2px solid var(--dark-border)', boxShadow: '1px 1px 0 var(--dark-border)', flexShrink: 0,
            }}>
              <Star size={10} fill="#000" color="#000" />
              <span style={{ fontSize: 11, fontWeight: 900, color: '#000' }}>{points.toLocaleString()}</span>
            </div>
          </button>
        </div>

        {/* Scrollable nav */}
        <div style={{ flex: 1, minHeight: 0, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          <nav
            ref={navRef}
            className="sidebar-nav"
            style={{
              flex: 1, minHeight: 0, overflowY: 'auto', overflowX: 'hidden',
              padding: '6px 10px 12px',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {sidebarGroups.map((group) => {
              const hasActive = group.items.some(item => isNavActive(location.pathname, item.path));
              const collapsed = collapsedGroups[group.category] ?? false;

              return (
                <div key={group.category} className="sidebar-group">
                  <button
                    type="button"
                    className={`sidebar-group-btn${hasActive ? ' sidebar-group-btn--active' : ''}`}
                    onClick={() => { playClick(); toggleGroup(group.category); }}
                  >
                    <span style={{ fontSize: 12 }}>{group.emoji}</span>
                    <span className="sidebar-group-btn__label">{group.category}</span>
                    <span className="sidebar-group-btn__count">{group.items.length}</span>
                    <ChevronDown
                      size={13}
                      color="var(--text-dark)"
                      style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                    />
                  </button>

                  {!collapsed && (
                    <div className="sidebar-nav-items">
                      {group.items.map(item => {
                        const active = isNavActive(location.pathname, item.path);
                        return (
                          <button
                            key={item.path}
                            type="button"
                            className={`sidebar-nav-btn${active ? ' sidebar-nav-btn--active' : ''}`}
                            style={{ ['--nav-accent' as string]: item.iconColor } as React.CSSProperties}
                            onClick={() => navigateTo(item.path)}
                            onMouseEnter={() => prefetchRoute(item.path)}
                            onFocus={() => prefetchRoute(item.path)}
                          >
                            <div className="sidebar-nav-btn__icon">
                              <item.icon size={14} color={active ? '#000' : item.iconColor} strokeWidth={2.5} />
                            </div>
                            <span className="sidebar-nav-btn__label">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Theme toggle inside scroll area footer */}
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '2px dashed var(--dark-border)' }}>
              <button
                type="button"
                className="sidebar-theme-btn"
                onClick={() => { playClick(); toggleTheme(); }}
              >
                {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
                <span>{theme === 'light' ? 'Karanlık Mod' : 'Açık Mod'}</span>
              </button>
            </div>
          </nav>

          {canScrollDown && (
            <div
              aria-hidden
              style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, pointerEvents: 'none',
                background: 'linear-gradient(to top, var(--card-bg), transparent)',
                display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 4,
              }}
            >
              <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>↓ KAYDIR</span>
            </div>
          )}
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
            <span style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 14 }}>{user.username}</span>
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

        <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ paddingBottom: 88, position: 'relative', zIndex: 1 }}>
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
                    onClick={() => navigateTo(item.path)}
                    onMouseEnter={() => prefetchRoute(item.path)}
                    onFocus={() => prefetchRoute(item.path)}
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
                    <div style={{
                      padding: '6px 16px', borderRadius: 12,
                      background: active ? `var(--primary-blue)18` : 'transparent',
                      border: active ? '2px solid rgba(123,110,246,0.3)' : '2px solid transparent',
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
