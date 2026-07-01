import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ScanLine, History, LayoutDashboard, Menu, X, Moon, Sun, LogOut, PackageCheck, ChevronRight, Wallet } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';

const cashierNavItems = [
  { path: '/cashier',         icon: LayoutDashboard, label: 'Kasa Ekranı',    desc: 'Bugünün özeti'     },
  { path: '/cashier/scan',    icon: ScanLine,        label: 'QR Tara & Puan', desc: 'Müşteri QR işlemi' },
  { path: '/cashier/redeem',  icon: PackageCheck,    label: 'Ürün Teslimi',   desc: 'Kod doğrulama'     },
  { path: '/cashier/history', icon: History,         label: 'İşlem Geçmişi',  desc: 'Tüm kayıtlar'      },
];

const AMBER = '#f59e0b';
const AMBER_DARK = '#d97706';

const CashierLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const { authUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout().finally(() => navigate('/login', { replace: true })); };
  const currentItem = cashierNavItems.find(n => n.path === location.pathname);
  const currentLabel = currentItem?.label || 'Kasa';

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
        style={{ width: 256, background: 'var(--card-bg)', borderRight: '3px solid var(--dark-border)' }}
      >
        {/* Brand header */}
        <div style={{ padding: '20px 20px 16px', background: `linear-gradient(135deg,${AMBER},${AMBER_DARK})`, borderBottom: '3px solid var(--dark-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={20} color="white" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 15, color: 'white', margin: 0, lineHeight: 1 }}>Kasa Paneli</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '2px 0 0', fontWeight: 600 }}>NexReward</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden"
              style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={16} color="white" />
            </button>
          </div>
        </div>

        {/* User card */}
        <div style={{ margin: '12px 12px 4px', padding: '10px 14px', borderRadius: 14, background: `${AMBER}15`, border: `2.5px solid ${AMBER}`, boxShadow: `0px 3px 0px ${AMBER}40` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: AMBER, border: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: 'white', flexShrink: 0 }}>
              {(authUser?.name?.[0] ?? 'K').toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{authUser?.name ?? 'Kasiyer'}</p>
              <p style={{ fontSize: 11, color: AMBER, fontWeight: 700, margin: 0 }}>● Aktif</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {cashierNavItems.map(item => {
            const active = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'left',
                  background: active ? `linear-gradient(135deg,${AMBER},${AMBER_DARK})` : 'transparent',
                  border: active ? '2.5px solid var(--dark-border)' : '2.5px solid transparent',
                  boxShadow: active ? '0px 3px 0px var(--dark-border)' : 'none',
                  transition: 'all 0.12s',
                }}
              >
                <div style={{ width: 32, height: 32, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(255,255,255,0.2)' : `${AMBER}12`, border: `2px solid ${active ? 'rgba(255,255,255,0.3)' : AMBER + '30'}` }}>
                  <item.icon size={15} color={active ? 'white' : AMBER} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: 13, margin: 0, lineHeight: 1.2, color: active ? 'white' : 'var(--text-dark)' }}>{item.label}</p>
                  <p style={{ fontSize: 10, margin: '2px 0 0', color: active ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', fontWeight: 600 }}>{item.desc}</p>
                </div>
                {active && <ChevronRight size={14} color="rgba(255,255,255,0.7)" />}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: '10px', borderTop: '2.5px dashed var(--divider-dash)', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <button
            onClick={toggleTheme}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, cursor: 'pointer', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}
          >
            {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
            {theme === 'light' ? 'Karanlık Mod' : 'Açık Mod'}
          </button>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 12, cursor: 'pointer', background: 'rgba(239,68,68,0.06)', border: '2px solid #fca5a5', boxShadow: '0px 2px 0px #fca5a5', fontSize: 12, fontWeight: 900, color: '#ef4444' }}
          >
            <LogOut size={15} /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* ── Content ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header style={{ position: 'sticky', top: 0, zIndex: 30, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', background: 'var(--card-bg)', borderBottom: '3px solid var(--dark-border)' }}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden"
            style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dark)', flexShrink: 0 }}
          >
            <Menu size={18} />
          </button>

          {/* Breadcrumb */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: AMBER, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>KASA PANELİ</p>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentLabel}</p>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)', flexShrink: 0 }}
          >
            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hidden sm:flex"
            style={{ alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 900, color: '#ef4444', background: 'rgba(239,68,68,0.06)', border: '2.5px solid #fca5a5', boxShadow: '0px 3px 0px #fca5a5', cursor: 'pointer', flexShrink: 0 }}
          >
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

export default CashierLayout;
