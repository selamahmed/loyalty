import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoreAdminLayout from './StoreAdminLayout';
import { Users, Star, ShoppingBag, Gift, QrCode, BarChart2, ArrowRight, TrendingUp, Package, Tag } from 'lucide-react';

const GREEN = '#22c55e';
const GREEN_DARK = '#16a34a';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

const kpis = [
  { label: 'Bugünkü Müşteri', value: '124',   sub: '+12%', icon: Users,       color: GREEN     },
  { label: 'Verilen Puan',     value: '5,420', sub: '+8%',  icon: Star,        color: '#f59e0b' },
  { label: 'Yapılan İşlem',    value: '89',    sub: '+5%',  icon: ShoppingBag, color: '#7B6EF6' },
  { label: 'Ödül Kullanımı',   value: '34',    sub: '+20%', icon: Gift,        color: '#06b6d4' },
];

const recentTransactions = [
  { name: 'Ayşe K.',   action: 'Puan Kazandı',  pts: '+150', positive: true  },
  { name: 'Mehmet T.', action: 'Ödül Kullandı', pts: '-250', positive: false },
  { name: 'Zeynep A.', action: 'Puan Kazandı',  pts: '+300', positive: true  },
  { name: 'Ali R.',    action: 'QR Tarandı',     pts: '+50',  positive: true  },
  { name: 'Fatma S.',  action: 'Ödül Kullandı',  pts: '-180', positive: false },
];

const activeRewards = [
  { title: 'Classic Espresso', stock: 48, points: 150, limited: false },
  { title: 'Cappuccino',       stock: 12, points: 250, limited: true  },
  { title: 'Avocado Toast',    stock: 6,  points: 450, limited: true  },
  { title: 'Matcha Latte',     stock: 30, points: 350, limited: false },
];

const StoreAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <StoreAdminLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 960, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Welcome banner ── */}
        <div style={{ ...card, background: `linear-gradient(135deg,${GREEN} 0%,${GREEN_DARK} 100%)`, padding: 'clamp(18px,4vw,28px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>HOŞGELDİNİZ</p>
            <p style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'white', margin: '0 0 4px', lineHeight: 1.1 }}>Mağaza Paneli 🏪</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 600 }}>Bugünkü mağaza performansına genel bakış</p>
          </div>
        </div>

        {/* ── KPI cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {kpis.map((k, i) => (
            <div key={i} style={{ ...card, padding: '18px 16px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: `${k.color}15`, border: `2.5px solid ${k.color}`, boxShadow: `0 3px 0 ${k.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <k.icon size={20} style={{ color: k.color }} />
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 999, background: `${k.color}15`, border: `1.5px solid ${k.color}`, fontSize: 11, fontWeight: 900, color: k.color }}>{k.sub}</span>
              </div>
              <p style={{ fontWeight: 900, fontSize: 28, color: 'var(--text-dark)', margin: '0 0 3px', lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* ── Quick actions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {[
            { label: 'QR Tara',      icon: QrCode,    color: '#7B6EF6', path: '/store-admin/qr'           },
            { label: 'Müşteri Ara',  icon: Users,     color: GREEN,     path: '/store-admin/customers'     },
            { label: 'Ödüller',      icon: Gift,      color: '#f59e0b', path: '/store-admin/rewards'       },
            { label: 'Promosyonlar', icon: Tag,       color: '#ec4899', path: '/store-admin/promotions'    },
            { label: 'Stok Takibi',  icon: Package,   color: '#06b6d4', path: '/store-admin/inventory'    },
            { label: 'Raporlar',     icon: BarChart2, color: '#8b5cf6', path: '/store-admin/analytics'    },
          ].map((a, i) => (
            <button
              key={i}
              onClick={() => navigate(a.path)}
              style={{ ...card, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left', boxShadow: '0px 4px 0px var(--dark-border)', transition: 'transform 0.1s, box-shadow 0.1s' }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 1px 0px var(--dark-border)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 4px 0px var(--dark-border)'; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: `${a.color}15`, border: `2.5px solid ${a.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <a.icon size={18} style={{ color: a.color }} />
              </div>
              <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', flex: 1 }}>{a.label}</span>
              <ArrowRight size={14} color="var(--text-muted)" />
            </button>
          ))}
        </div>

        {/* ── Two columns: transactions + rewards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>

          {/* Recent transactions */}
          <div style={{ ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '2.5px solid var(--dark-border)' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>BUGÜN</p>
                <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Son İşlemler</p>
              </div>
              <button onClick={() => navigate('/store-admin/customers')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: GREEN, background: `${GREEN}12`, border: `2px solid ${GREEN}`, borderRadius: 10, padding: '5px 10px', cursor: 'pointer' }}>
                Tümü <ArrowRight size={12} />
              </button>
            </div>
            <div>
              {recentTransactions.map((t, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < recentTransactions.length - 1 ? '1.5px dashed var(--divider-dash)' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: `linear-gradient(135deg,${GREEN},${GREEN_DARK})`, border: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 14, color: 'white', flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0 }}>{t.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: 600 }}>{t.action}</p>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 14, color: t.positive ? '#22c55e' : '#ef4444', flexShrink: 0 }}>{t.pts} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active rewards */}
          <div style={{ ...card }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '2.5px solid var(--dark-border)' }}>
              <div>
                <p style={{ fontSize: 10, fontWeight: 900, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>MAĞAZA</p>
                <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Aktif Ödüller</p>
              </div>
              <button onClick={() => navigate('/store-admin/rewards')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: '#f59e0b', background: 'rgba(245,158,11,0.12)', border: '2px solid #f59e0b', borderRadius: 10, padding: '5px 10px', cursor: 'pointer' }}>
                <TrendingUp size={12} /> Yönet
              </button>
            </div>
            <div>
              {activeRewards.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < activeRewards.length - 1 ? '1.5px dashed var(--divider-dash)' : 'none' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(245,158,11,0.12)', border: '2.5px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Gift size={16} style={{ color: '#f59e0b' }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0 }}>{r.title}</p>
                      {r.limited && <span style={{ padding: '1px 7px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', border: '1.5px solid #ef4444', fontSize: 9, fontWeight: 900, color: '#ef4444' }}>SINIRLI</span>}
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>Stok: {r.stock}</p>
                  </div>
                  <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b', flexShrink: 0 }}>{r.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Today summary bar ── */}
        <div style={{ ...card, padding: '20px' }}>
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: GREEN, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>GÜNLÜK ÖZET</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Bugünün Performansı</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {[
              { label: 'QR Tarama', value: '67',   color: '#7B6EF6', emoji: '📱' },
              { label: 'Yeni Üye',  value: '8',    color: GREEN,     emoji: '👤' },
              { label: 'İade',      value: '2',    color: '#ef4444', emoji: '↩️' },
              { label: 'Ciro (₺)',  value: '3,240', color: '#f59e0b', emoji: '💰' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '14px', borderRadius: 14, background: `${s.color}10`, border: `2px solid ${s.color}30`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>{s.emoji}</span>
                <div>
                  <p style={{ fontWeight: 900, fontSize: 22, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 600 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminDashboard;
