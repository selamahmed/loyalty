import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, ShoppingBag, Gamepad2, BarChart2, QrCode, Trophy,
  Target, Bell, History, Settings, User, Package,
  Sun, Moon, Menu, X, Star, Zap, Shield, HelpCircle, ChevronDown,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import RewardPopup from './RewardPopup';
import { playSound } from '../lib/sounds';

const navItems = [
  { path: '/home',     icon: Home,        label: 'Sayfa'    },
  { path: '/shop',     icon: ShoppingBag, label: 'Mağaza'   },
  { path: '/progress', icon: BarChart2,   label: 'İlerleme' },
  { path: '/profile',  icon: User,        label: 'Profil'   },
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
      { path: '/history',     icon: History,   label: 'Geçmiş',        iconColor: '#6b7280', iconBg: 'rgba(107,114,128,0.14)' },
      { path: '/events',      icon: Zap,       label: 'Etkinlikler',   iconColor: '#ec4899', iconBg: 'rgba(236,72,153,0.14)' },
    ],
  },
  {
    category: 'Ayarlar',
    emoji: '⚙️',
    items: [
      { path: '/settings', icon: Settings,    label: 'Ayarlar',   iconColor: '#7B6EF6', iconBg: 'rgba(123,110,246,0.14)' },
      { path: '/support',  icon: HelpCircle,  label: 'Destek',    iconColor: '#22c55e', iconBg: 'rgba(34,197,94,0.14)' },
      { path: '/admin',    icon: Shield,      label: 'Yönetici',  iconColor: '#ef4444', iconBg: 'rgba(239,68,68,0.14)' },
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
  const { theme, toggleTheme, points, user, rewardPopup, dismissRewardPopup } = useApp();
  const location = useLocation();
  const navigate  = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [collapsedGroups, setCollapsedGroups] = React.useState<Record<string, boolean>>({});
  const navRef = React.useRef<HTMLElement>(null);
  const [canScrollDown, setCanScrollDown] = React.useState(false);

  const toggleGroup = (category: string) => {
    setCollapsedGroups(prev => ({ ...prev, [category]: !prev[category] }));
  };

  const updateScrollHint = React.useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollDown(el.scrollHeight - el.scrollTop - el.clientHeight > 8);
  }, []);

  React.useEffect(() => {
    setCollapsedGroups(prev => {
      const next = { ...prev };
      sidebarGroups.forEach(g => {
        if (g.items.some(item => isNavActive(location.pathname, item.path))) {
          next[g.category] = false;
        }
      });
      return next;
    });
  }, [location.pathname]);

  React.useEffect(() => {
    updateScrollHint();
    const el = navRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollHint, { passive: true });
    window.addEventListener('resize', updateScrollHint);
    return () => {
      el.removeEventListener('scroll', updateScrollHint);
      window.removeEventListener('resize', updateScrollHint);
    };
  }, [updateScrollHint, sidebarOpen, collapsedGroups]);

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
        className={`fixed inset-y-0 left-0 z-50 flex w-[min(288px,92vw)] flex-col transition-transform duration-300 lg:sticky lg:top-0 lg:h-svh lg:w-60 lg:shrink-0 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--surface)',
          borderRight: '2px solid var(--border)',
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
            onClick={() => { playSound('click'); navigate('/profile'); setSidebarOpen(false); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
              background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
              borderRadius: 12, cursor: 'pointer', textAlign: 'left',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: '50%', overflow: 'hidden',
              border: '2px solid var(--dark-border)', flexShrink: 0,
            }}>
              <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.username}
              </p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>Lv.{user.level}</p>
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 3, padding: '4px 7px', borderRadius: 8,
              background: '#FFE500', border: '1.5px solid var(--dark-border)', flexShrink: 0,
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
                <div key={group.category} style={{ marginBottom: 4 }}>
                  <button
                    type="button"
                    onClick={() => { playSound('click'); toggleGroup(group.category); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 8px', background: 'none', border: 'none', cursor: 'pointer',
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ fontSize: 11 }}>{group.emoji}</span>
                    <span style={{
                      flex: 1, textAlign: 'left', fontSize: 9, fontWeight: 900,
                      color: hasActive ? 'var(--primary-blue)' : 'var(--text-muted)',
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>
                      {group.category}
                    </span>
                    <span style={{
                      fontSize: 9, fontWeight: 800, color: 'var(--text-muted)',
                      background: 'var(--tab-bg)', padding: '1px 6px', borderRadius: 999,
                      border: '1px solid var(--divider-dash)',
                    }}>
                      {group.items.length}
                    </span>
                    <ChevronDown
                      size={13}
                      color="var(--text-muted)"
                      style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
                    />
                  </button>

                  {!collapsed && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1, paddingLeft: 2 }}>
                      {group.items.map(item => {
                        const active = isNavActive(location.pathname, item.path);
                        return (
                          <button
                            key={item.path}
                            onClick={() => { playSound('click'); navigate(item.path); setSidebarOpen(false); }}
                            style={{
                              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                              padding: '7px 8px', borderRadius: 10, cursor: 'pointer', textAlign: 'left',
                              fontSize: 12, fontWeight: active ? 900 : 600,
                              background: active ? 'rgba(123,110,246,0.12)' : 'transparent',
                              color: active ? 'var(--primary-blue)' : 'var(--text-dark)',
                              border: 'none',
                              transition: 'background 0.12s',
                            }}
                            onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--tab-bg)'; }}
                            onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = active ? 'rgba(123,110,246,0.12)' : 'transparent'; }}
                          >
                            <div style={{
                              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                              background: active ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : item.iconBg,
                              border: `1.5px solid ${active ? 'var(--dark-border)' : `${item.iconColor}33`}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <item.icon size={13} color={active ? 'white' : item.iconColor} strokeWidth={active ? 2.5 : 2} />
                            </div>
                            <span style={{ flex: 1, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Theme toggle inside scroll area footer */}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1.5px dashed var(--divider-dash)' }}>
              <button
                onClick={() => { playSound('click'); toggleTheme(); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  padding: '8px 12px', borderRadius: 10, cursor: 'pointer',
                  background: 'var(--tab-bg)', color: 'var(--text-dark)',
                  border: '2px solid var(--dark-border)', fontSize: 11, fontWeight: 800,
                }}
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

        <style>{`
          .sidebar-nav { scrollbar-width: thin; scrollbar-color: var(--primary-blue) transparent; }
          .sidebar-nav::-webkit-scrollbar { width: 5px; }
          .sidebar-nav::-webkit-scrollbar-thumb { background: var(--divider-dash); border-radius: 999px; }
          .sidebar-nav::-webkit-scrollbar-thumb:hover { background: var(--primary-blue); }
        `}</style>
      </aside>

      {/* ── Main content ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Header ── */}
        <header
          className="sticky top-0 z-30 flex items-center gap-2"
          style={{
            padding: '8px 14px',
            background: 'var(--surface)',
            borderBottom: '2px solid var(--border)',
          }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden header-icon-btn"
            aria-label="Menüyü aç"
          >
            <Menu size={17} />
          </button>

          {/* Welcome text (desktop) */}
          <div className="hidden lg:flex items-center gap-1.5 flex-1 min-w-0">
            <span style={{ color: 'var(--text-secondary)', fontSize: 13, fontWeight: 500 }}>Hoş geldin,</span>
            <span style={{ color: 'var(--text)', fontWeight: 800, fontSize: 13 }}>{user.username}</span>
          </div>
          <div className="flex-1 min-w-0 lg:hidden" />

          {/* Points badge — clean, no gradient */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
            background: 'var(--surface-raised)',
            border: '1.5px solid var(--border)', borderRadius: 'var(--r-sm)',
            flexShrink: 0,
          }}>
            <Star size={12} fill="var(--amber)" color="var(--amber)" />
            <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{points.toLocaleString()}</span>
          </div>

          {/* Theme toggle */}
          <button onClick={toggleTheme} className="header-icon-btn" aria-label="Tema değiştir">
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Notifications */}
          <button onClick={() => navigate('/notifications')} className="header-icon-btn" style={{ position: 'relative' }} aria-label="Bildirimler">
            <Bell size={16} />
            <span style={{
              position: 'absolute', top: 5, right: 5,
              width: 7, height: 7, borderRadius: '50%',
              background: 'var(--red)', border: '1.5px solid var(--surface)',
            }} />
          </button>

          <style>{`
            .header-icon-btn {
              width: 36px; height: 36px; border-radius: var(--r-sm);
              background: var(--surface-raised); border: 1.5px solid var(--border);
              display: flex; align-items: center; justify-content: center;
              cursor: pointer; color: var(--text-secondary);
              transition: background 0.12s, color 0.12s;
              flex-shrink: 0;
            }
            .header-icon-btn:hover { background: var(--surface-raised); color: var(--text); }
          `}</style>
        </header>

        <main className="flex-1 overflow-x-hidden overflow-y-auto" style={{ paddingBottom: 88 }}>
          {children}
        </main>

        {/* ── Bottom nav (mobile) ── */}
        {!hideNav && (
          <nav
            className="fixed bottom-0 left-0 right-0 lg:hidden z-30 safe-bottom"
            style={{
              background: 'var(--surface)',
              borderTop: '2px solid var(--border)',
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
