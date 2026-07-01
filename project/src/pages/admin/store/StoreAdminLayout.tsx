import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Moon, Sun, LogOut, Store, LayoutDashboard, Users, Gift, BarChart2, QrCode, Bell, Tag, ChevronRight, Package } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

const GREEN = '#22c55e';
const GREEN_DARK = '#16a34a';

const navGroups = [
  {
    label: 'ANA',
    items: [
      { path: '/store-admin',           icon: LayoutDashboard, label: 'Dashboard',       desc: 'Genel bakış'       },
    ],
  },
  {
    label: 'MAĞAZA',
    items: [
      { path: '/store-admin/items',     icon: ShoppingBag, label: 'Mağaza Ürünleri',  desc: 'Ürün yönetimi'     },
      { path: '/store-admin/rewards',   icon: Gift,        label: 'Ödüller',           desc: 'Puan ödülleri'     },
      { path: '/store-admin/inventory', icon: Package,     label: 'Stok & Envanter',   desc: 'Stok takibi'       },
      { path: '/store-admin/promotions',icon: Tag,         label: 'Promosyonlar',      desc: 'Kampanyalar'       },
    ],
  },
  {
    label: 'MÜŞTERİLER',
    items: [
      { path: '/store-admin/customers', icon: Users,       label: 'Müşteriler',        desc: 'Üye listesi'       },
      { path: '/store-admin/qr',        icon: QrCode,      label: 'QR Yönetimi',       desc: 'QR üret & izle'    },
      { path: '/store-admin/notifications', icon: Bell,    label: 'Bildirimler',       desc: 'Push mesajları'    },
    ],
  },
  {
    label: 'ANALİTİK',
    items: [
      { path: '/store-admin/analytics', icon: BarChart2,   label: 'Raporlar',          desc: 'Performans verileri' },
    ],
  },
];

const StoreAdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout().finally(() => navigate('/login', { replace: true })); };

  const allItems = navGroups.flatMap(g => g.items);
  const currentItem = allItems.find(n => {
    if (n.path === '/store-admin') return location.pathname === '/store-admin' || location.pathname === '/store-admin/';
    return location.pathname.startsWith(n.path);
  });
  const currentLabel = currentItem?.label || 'Mağaza Paneli';

  const isActive = (path: string) => {
    if (path === '/store-admin') return location.pathname === '/store-admin' || location.pathname === '/store-admin/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-color)' }}>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-0 h-full z-50 flex flex-col overflow-y-auto transform transition-transform duration-300 lg:translate-x-0 lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 260, background: 'var(--card-bg)', borderRight: '3px solid var(--dark-border)' }}
      >
        {/* Brand header */}
        <div style={{ padding: '20px 20px 16px', background: `linear-gradient(135deg,${GREEN},${GREEN_DARK})`, borderBottom: '3px solid var(--dark-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Store size={20} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 15, color: 'white', margin: 0, lineHeight: 1 }}>Mağaza Paneli</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0', fontWeight: 600 }}>NexReward</p>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden" style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="white" />
            </button>
          </div>
        </div>

        {/* User card */}
        <div style={{ margin: '12px 12px 4px', padding: '10px 14px', borderRadius: 14, background: `${GREEN}12`, border: `2.5px solid ${GREEN}`, boxShadow: `0px 3px 0px ${GREEN}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: GREEN, border: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: 'white', flexShrink: 0 }}>
              {(authUser?.name?.[0] ?? 'M').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authUser?.name ?? 'Mağaza Yöneticisi'}</p>
              <p style={{ fontSize: 11, color: GREEN, fontWeight: 700, margin: 0 }}>● Mağaza Yöneticisi</p>
            </div>
          </div>
        </div>

        {/* Navigation groups */}
        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
          {navGroups.map(group => (
            <div key={group.label} style={{ marginBottom: 6 }}>
              <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.14em', padding: '8px 8px 4px', margin: 0 }}>{group.label}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {group.items.map(item => {
                  const active = isActive(item.path);
                  return (
                    <button
                      key={item.path}
                      onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                        background: active ? `linear-gradient(135deg,${GREEN},${GREEN_DARK})` : 'transparent',
                        border: active ? '2.5px solid var(--dark-border)' : '2.5px solid transparent',
                        boxShadow: active ? '0px 3px 0px var(--dark-border)' : 'none',
                        transition: 'all 0.12s',
                      }}
                    >
                      <div style={{ width: 30, height: 30, borderRadius: 9, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(255,255,255,0.2)' : `${GREEN}12`, border: `2px solid ${active ? 'rgba(255,255,255,0.3)' : GREEN + '30'}` }}>
                        <item.icon size={14} color={active ? 'white' : GREEN} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 900, fontSize: 12, margin: 0, lineHeight: 1.2, color: active ? 'white' : 'var(--text-dark)' }}>{item.label}</p>
                        <p style={{ fontSize: 10, margin: '1px 0 0', color: active ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)', fontWeight: 600 }}>{item.desc}</p>
                      </div>
                      {active && <ChevronRight size={12} color="rgba(255,255,255,0.6)" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '10px', borderTop: '2.5px dashed var(--divider-dash)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button onClick={toggleTheme} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, cursor: 'pointer', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            {theme === 'light' ? 'Karanlık Mod' : 'Açık Mod'}
          </button>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, cursor: 'pointer', background: 'rgba(239,68,68,0.06)', border: '2px solid #fca5a5', boxShadow: '0px 2px 0px #fca5a5', fontSize: 12, fontWeight: 900, color: '#ef4444' }}>
            <LogOut size={15} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--card-bg)', borderBottom: '3px solid var(--dark-border)' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dark)', flexShrink: 0 }}>
            <Menu size={18} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>MAĞAZA PANELİ</p>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentLabel}</p>
          </div>
          <button onClick={toggleTheme} style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}>
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button onClick={handleLogout} className="hidden sm:flex" style={{ alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 900, color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '2.5px solid #fca5a5', boxShadow: '0px 3px 0px #fca5a5', cursor: 'pointer', flexShrink: 0 }}>
            <LogOut size={14} /> Çıkış
          </button>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StoreAdminLayout;
