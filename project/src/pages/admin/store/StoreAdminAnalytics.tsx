import React, { useState } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import {
  BarChart2, TrendingUp, Users, Star, Gift,
  ArrowUp, ArrowDown, ShoppingBag
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';

const ACCENT = '#22c55e';

const DAILY_DATA = [
  { day: 'Pzt', points: 1200, customers: 24, transactions: 38 },
  { day: 'Sal', points: 1850, customers: 31, transactions: 52 },
  { day: 'Çar', points: 1400, customers: 28, transactions: 44 },
  { day: 'Per', points: 2100, customers: 42, transactions: 67 },
  { day: 'Cum', points: 2800, customers: 54, transactions: 89 },
  { day: 'Cmt', points: 3200, customers: 68, transactions: 102 },
  { day: 'Paz', points: 2600, customers: 55, transactions: 91 },
];

const REWARD_DATA = [
  { name: 'Espresso',      count: 142, color: '#7B6EF6' },
  { name: 'Cappuccino',    count: 98,  color: '#f59e0b' },
  { name: 'Matcha Latte',  count: 76,  color: ACCENT    },
  { name: 'Avocado Toast', count: 45,  color: '#06b6d4' },
  { name: 'Diğer',         count: 34,  color: '#9ca3af' },
];

const CUSTOMER_TIERS = [
  { name: 'VIP',   value: 18, color: '#f59e0b' },
  { name: 'Aktif', value: 67, color: ACCENT    },
  { name: 'Pasif', value: 15, color: '#9ca3af' },
];

type Period = '7d' | '30d' | '90d';

const PERIOD_LABELS: Record<Period, string> = { '7d': 'Bu Hafta', '30d': 'Bu Ay', '90d': 'Son 3 Ay' };

const StoreAdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<Period>('7d');

  const totals = DAILY_DATA.reduce((a, d) => ({
    points: a.points + d.points,
    customers: a.customers + d.customers,
    transactions: a.transactions + d.transactions,
  }), { points: 0, customers: 0, transactions: 0 });

  return (
    <StoreAdminLayout>
      <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-dark)' }}>Mağaza Raporları</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Performans ve müşteri analitiği</p>
          </div>
          <div className="flex gap-2">
            {(Object.keys(PERIOD_LABELS) as Period[]).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className="px-4 py-2 rounded-xl font-black text-sm transition-all"
                style={{
                  background: period === p ? ACCENT : 'var(--card-bg)',
                  color: period === p ? 'white' : 'var(--text-muted)',
                  border: '2px solid var(--dark-border)',
                  boxShadow: period === p ? '0px 2px 0px var(--dark-border)' : 'none',
                }}>
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Toplam Puan Verildi', value: totals.points.toLocaleString('tr-TR'), icon: Star,        color: '#f59e0b', trend: '+12%', up: true  },
            { label: 'Tekil Müşteri',       value: totals.customers.toString(),           icon: Users,       color: '#7B6EF6', trend: '+8%',  up: true  },
            { label: 'Toplam İşlem',        value: totals.transactions.toString(),        icon: ShoppingBag, color: ACCENT,    trend: '+15%', up: true  },
            { label: 'Ödül Kullanımı',      value: '395',                                icon: Gift,        color: '#06b6d4', trend: '-3%',  up: false },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: `${s.color}18`, border: `2px solid ${s.color}` }}>
                  <s.icon size={16} style={{ color: s.color }} />
                </div>
                <span className="text-xs font-black flex items-center gap-0.5" style={{ color: s.up ? '#22c55e' : '#ef4444' }}>
                  {s.up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}{s.trend}
                </span>
              </div>
              <p className="font-black text-xl" style={{ color: 'var(--text-dark)' }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Puan & Müşteri chart */}
        <div className="p-5 rounded-2xl"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} style={{ color: ACCENT }} />
            <h3 className="font-black" style={{ color: 'var(--text-dark)' }}>Günlük Puan Dağılımı</h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={DAILY_DATA} barSize={28}>
              <XAxis dataKey="day" tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', borderRadius: 12, fontWeight: 700, color: 'var(--text-dark)' }}
                formatter={(v: unknown) => [`${(v as number).toLocaleString('tr-TR')} puan`, 'Puan']}
              />
              <Bar dataKey="points" fill={ACCENT} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Customer trend */}
          <div className="p-5 rounded-2xl"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <Users size={16} style={{ color: '#7B6EF6' }} />
              <h3 className="font-black" style={{ color: 'var(--text-dark)' }}>Günlük Müşteri</h3>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={DAILY_DATA}>
                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip
                  contentStyle={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', borderRadius: 12, fontWeight: 700, color: 'var(--text-dark)' }}
                  formatter={(v: unknown) => [String(v), 'Müşteri']}
                />
                <Line type="monotone" dataKey="customers" stroke="#7B6EF6" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Customer tiers pie */}
          <div className="p-5 rounded-2xl"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={16} style={{ color: '#f59e0b' }} />
              <h3 className="font-black" style={{ color: 'var(--text-dark)' }}>Müşteri Segmentleri</h3>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={CUSTOMER_TIERS} dataKey="value" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                    {CUSTOMER_TIERS.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 flex-1">
                {CUSTOMER_TIERS.map(t => (
                  <div key={t.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: t.color }} />
                      <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{t.name}</span>
                    </div>
                    <span className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{t.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top rewards */}
        <div className="p-5 rounded-2xl"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Gift size={16} style={{ color: '#06b6d4' }} />
            <h3 className="font-black" style={{ color: 'var(--text-dark)' }}>En Çok Kullanılan Ödüller</h3>
          </div>
          <div className="space-y-3">
            {REWARD_DATA.map((r, i) => {
              const max = REWARD_DATA[0].count;
              return (
                <div key={r.name} className="flex items-center gap-3">
                  <span className="w-5 text-xs font-black text-right flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-black" style={{ color: 'var(--text-dark)' }}>{r.name}</span>
                      <span className="text-sm font-black" style={{ color: r.color }}>{r.count}x</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--tab-bg)' }}>
                      <div className="h-full rounded-full" style={{ width: `${(r.count / max) * 100}%`, background: r.color }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminAnalytics;


