import React from 'react';
import { useNavigate } from 'react-router-dom';
import StoreAdminLayout from './StoreAdminLayout';
import { Users, Star, ShoppingBag, TrendingUp, QrCode, Gift, ArrowRight } from 'lucide-react';

const ACCENT = '#22c55e';

const KPI: React.FC<{ label: string; value: string; sub: string; icon: React.ElementType; color: string }> =
  ({ label, value, sub, icon: Icon, color }) => (
    <div className="p-5 rounded-2xl relative overflow-hidden"
      style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center"
          style={{ background: `${color}18`, border: `2px solid ${color}` }}>
          <Icon size={20} style={{ color }} />
        </div>
        <span className="text-xs font-black px-2 py-1 rounded-full" style={{ background: `${color}18`, color }}>{sub}</span>
      </div>
      <p className="text-3xl font-black mb-1" style={{ color: 'var(--text-dark)' }}>{value}</p>
      <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>{label}</p>
    </div>
  );

const recentTransactions = [
  { name: 'Ayşe K.',   action: 'Puan Kazandı',   points: '+150', color: '#22c55e' },
  { name: 'Mehmet T.', action: 'Ödül Kullandı',   points: '-250', color: '#ef4444' },
  { name: 'Zeynep A.', action: 'Puan Kazandı',   points: '+300', color: '#22c55e' },
  { name: 'Ali R.',    action: 'QR Tarandı',      points: '+50',  color: '#22c55e' },
  { name: 'Fatma S.',  action: 'Ödül Kullandı',   points: '-180', color: '#ef4444' },
];

const activeRewards = [
  { title: 'Espresso',      stock: 48, points: 150, limited: false },
  { title: 'Cappuccino',    stock: 12, points: 250, limited: true  },
  { title: 'Avocado Toast', stock: 6,  points: 450, limited: true  },
  { title: 'Matcha Latte',  stock: 30, points: 350, limited: false },
];

const StoreAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <StoreAdminLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">

        {/* Welcome */}
        <div className="p-6 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #16a34a 100%)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <p className="font-black text-2xl">Mağaza Paneli 🏪</p>
          <p className="text-white/80 text-sm mt-1">Bugünkü mağaza performansına genel bakış</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPI label="Bugünkü Müşteri"  value="124"   sub="+12%" icon={Users}       color={ACCENT}   />
          <KPI label="Verilen Puan"      value="5,420" sub="+8%"  icon={Star}        color="#f59e0b" />
          <KPI label="Yapılan İşlem"     value="89"    sub="+5%"  icon={ShoppingBag} color="#7B6EF6" />
          <KPI label="Ödül Kullanımı"    value="34"    sub="+20%" icon={Gift}        color="#06b6d4" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
              <p className="font-black" style={{ color: 'var(--text-dark)' }}>Son İşlemler</p>
              <button onClick={() => navigate('/store-admin/customers')}
                className="text-xs font-black flex items-center gap-1" style={{ color: ACCENT }}>
                Tümü <ArrowRight size={12} />
              </button>
            </div>
            <div>
              {recentTransactions.map((t, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
                    style={{ background: ACCENT }}>{t.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{t.name}</p>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t.action}</p>
                  </div>
                  <span className="font-black text-sm flex-shrink-0" style={{ color: t.color }}>{t.points} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Active Rewards */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
              <p className="font-black" style={{ color: 'var(--text-dark)' }}>Aktif Ödüller</p>
              <button onClick={() => navigate('/store-admin/rewards')} style={{ color: ACCENT }}>
                <TrendingUp size={16} />
              </button>
            </div>
            <div>
              {activeRewards.map((r, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3" style={{ borderBottom: '1px solid var(--dark-border)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${ACCENT}15`, border: `2px solid ${ACCENT}` }}>
                    <Gift size={16} style={{ color: ACCENT }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{r.title}</p>
                      {r.limited && (
                        <span className="text-xs font-black px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Sınırlı</span>
                      )}
                    </div>
                    <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Stok: {r.stock}</p>
                  </div>
                  <span className="font-black text-sm flex-shrink-0" style={{ color: '#f59e0b' }}>{r.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'QR Tara',     icon: QrCode, color: '#7B6EF6', path: '/store-admin/qr'          },
            { label: 'Müşteri Ara', icon: Users,  color: ACCENT,    path: '/store-admin/customers'    },
            { label: 'Ödüller',     icon: Gift,   color: '#f59e0b', path: '/store-admin/rewards'      },
            { label: 'Raporlar',    icon: BarChart2, color: '#06b6d4', path: '/store-admin/analytics' },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)}
              className="p-4 rounded-2xl flex flex-col items-center gap-2 transition-all hover:scale-105 active:scale-95"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ background: `${a.color}18`, border: `2px solid ${a.color}` }}>
                <a.icon size={22} style={{ color: a.color }} />
              </div>
              <span className="font-black text-xs text-center" style={{ color: 'var(--text-dark)' }}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Today's Summary */}
        <div className="p-5 rounded-2xl" style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <p className="font-black mb-4" style={{ color: 'var(--text-dark)' }}>Bugünün Özeti</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'QR Tarama', value: '67'    },
              { label: 'Yeni Üye',  value: '8'     },
              { label: 'İade',      value: '2'     },
              { label: 'Ciro (₺)', value: '3,240' },
            ].map((s, i) => (
              <div key={i} className="text-center p-3 rounded-xl"
                style={{ background: `${ACCENT}10` }}>
                <p className="text-2xl font-black" style={{ color: ACCENT }}>{s.value}</p>
                <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminDashboard;
