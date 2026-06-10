import React, { useState } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { Search, Filter, Star, Gift, ChevronDown, ChevronUp, Plus, Minus, CheckCircle, X, User, TrendingUp, Calendar, ShoppingBag } from 'lucide-react';

const ACCENT = '#22c55e';

type CustomerStatus = 'active' | 'inactive' | 'vip';

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  totalPoints: number;
  level: number;
  joinDate: string;
  lastVisit: string;
  visitCount: number;
  totalSpend: number;
  status: CustomerStatus;
  recentTransactions: { action: string; points: number; date: string }[];
}

const MOCK_CUSTOMERS: Customer[] = [
  {
    id: '1', name: 'Ayşe Kaya', phone: '0532 111 22 33', email: 'ayse@mail.com',
    points: 4250, totalPoints: 12800, level: 8, joinDate: '2024-03-10', lastVisit: '2026-06-10',
    visitCount: 47, totalSpend: 3200, status: 'vip',
    recentTransactions: [
      { action: 'Espresso Ödülü', points: -150, date: '10 Haz' },
      { action: 'Alışveriş Puanı', points: +300, date: '10 Haz' },
      { action: 'Cappuccino Ödülü', points: -250, date: '08 Haz' },
    ],
  },
  {
    id: '2', name: 'Mehmet Türk', phone: '0541 444 55 66', email: 'mehmet@mail.com',
    points: 1820, totalPoints: 5640, level: 4, joinDate: '2024-09-01', lastVisit: '2026-06-09',
    visitCount: 22, totalSpend: 1450, status: 'active',
    recentTransactions: [
      { action: 'QR Tarama', points: +50, date: '09 Haz' },
      { action: 'Alışveriş Puanı', points: +200, date: '07 Haz' },
    ],
  },
  {
    id: '3', name: 'Zeynep Arslan', phone: '0555 777 88 99', email: 'zeynep@mail.com',
    points: 960, totalPoints: 2300, level: 2, joinDate: '2025-01-15', lastVisit: '2026-05-28',
    visitCount: 9, totalSpend: 620, status: 'inactive',
    recentTransactions: [
      { action: 'Alışveriş Puanı', points: +150, date: '28 May' },
    ],
  },
  {
    id: '4', name: 'Ali Rıza Demir', phone: '0507 333 44 55', email: 'ali@mail.com',
    points: 3100, totalPoints: 9750, level: 6, joinDate: '2024-06-20', lastVisit: '2026-06-10',
    visitCount: 38, totalSpend: 2800, status: 'vip',
    recentTransactions: [
      { action: 'Matcha Latte Ödülü', points: -350, date: '10 Haz' },
      { action: 'Alışveriş Puanı', points: +400, date: '10 Haz' },
      { action: 'Görev Bonusu', points: +100, date: '09 Haz' },
    ],
  },
  {
    id: '5', name: 'Fatma Şahin', phone: '0543 222 11 00', email: 'fatma@mail.com',
    points: 2450, totalPoints: 7100, level: 5, joinDate: '2024-08-05', lastVisit: '2026-06-08',
    visitCount: 31, totalSpend: 2100, status: 'active',
    recentTransactions: [
      { action: 'Alışveriş Puanı', points: +250, date: '08 Haz' },
      { action: 'Soğuk Kahve Ödülü', points: -280, date: '06 Haz' },
    ],
  },
  {
    id: '6', name: 'Can Yıldız', phone: '0531 888 99 00', email: 'can@mail.com',
    points: 580, totalPoints: 1200, level: 1, joinDate: '2026-05-01', lastVisit: '2026-06-05',
    visitCount: 4, totalSpend: 320, status: 'active',
    recentTransactions: [
      { action: 'Alışveriş Puanı', points: +150, date: '05 Haz' },
    ],
  },
];

const STATUS_LABELS: Record<CustomerStatus, { label: string; color: string; bg: string }> = {
  vip:      { label: 'VIP',      color: '#f59e0b', bg: '#fffbeb' },
  active:   { label: 'Aktif',    color: ACCENT,    bg: '#f0fdf4' },
  inactive: { label: 'Pasif',    color: '#9ca3af', bg: '#f9fafb' },
};

const AdjustModal: React.FC<{
  customer: Customer;
  onClose: () => void;
  onSave: (id: string, delta: number, reason: string) => void;
}> = ({ customer, onClose, onSave }) => {
  const [mode, setMode] = useState<'add' | 'subtract'>('add');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [done, setDone] = useState(false);

  const handle = () => {
    if (!amount || !reason) return;
    const delta = mode === 'add' ? +Number(amount) : -Number(amount);
    onSave(customer.id, delta, reason);
    setDone(true);
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-sm rounded-2xl overflow-hidden" style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 8px 0px #1e1b4b' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid #f3f4f6' }}>
          <div>
            <p className="font-black" style={{ color: '#1e1b4b' }}>Puan Düzenle</p>
            <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>{customer.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100"><X size={18} /></button>
        </div>

        {done ? (
          <div className="p-6 flex flex-col items-center gap-3">
            <CheckCircle size={40} style={{ color: ACCENT }} />
            <p className="font-black text-lg" style={{ color: '#1e1b4b' }}>Puan güncellendi!</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setMode('add')}
                className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
                style={{ background: mode === 'add' ? ACCENT : '#f9fafb', color: mode === 'add' ? 'white' : '#374151', border: `2px solid ${mode === 'add' ? '#1e1b4b' : '#e5e7eb'}`, boxShadow: mode === 'add' ? '0px 2px 0px #1e1b4b' : 'none' }}>
                <Plus size={14} className="inline mr-1" /> Puan Ekle
              </button>
              <button onClick={() => setMode('subtract')}
                className="flex-1 py-2.5 rounded-xl font-black text-sm transition-all"
                style={{ background: mode === 'subtract' ? '#ef4444' : '#f9fafb', color: mode === 'subtract' ? 'white' : '#374151', border: `2px solid ${mode === 'subtract' ? '#1e1b4b' : '#e5e7eb'}`, boxShadow: mode === 'subtract' ? '0px 2px 0px #1e1b4b' : 'none' }}>
                <Minus size={14} className="inline mr-1" /> Puan Düş
              </button>
            </div>

            <div className="p-3 rounded-xl flex items-center justify-between" style={{ background: '#f0fdf4', border: `2px solid ${ACCENT}` }}>
              <span className="text-sm font-medium" style={{ color: '#6b7280' }}>Mevcut Puan</span>
              <span className="font-black" style={{ color: ACCENT }}>{customer.points.toLocaleString('tr-TR')} pts</span>
            </div>

            <div>
              <label className="text-xs font-black block mb-1" style={{ color: '#6b7280' }}>MİKTAR</label>
              <input type="number" placeholder="150" value={amount} onChange={e => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                style={{ background: '#f9fafb', border: '2px solid #1e1b4b', color: '#1e1b4b' }} />
            </div>

            <div>
              <label className="text-xs font-black block mb-1" style={{ color: '#6b7280' }}>AÇIKLAMA</label>
              <input type="text" placeholder="Manuel düzeltme, özel kampanya..." value={reason} onChange={e => setReason(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                style={{ background: '#f9fafb', border: '2px solid #1e1b4b', color: '#1e1b4b' }} />
            </div>

            <button onClick={handle}
              className="w-full py-3 rounded-xl font-black text-white transition-all active:translate-y-0.5"
              style={{ background: mode === 'add' ? ACCENT : '#ef4444', border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b' }}>
              {mode === 'add' ? 'Puan Ekle' : 'Puan Düş'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerRow: React.FC<{
  customer: Customer;
  onAdjust: (c: Customer) => void;
}> = ({ customer, onAdjust }) => {
  const [expanded, setExpanded] = useState(false);
  const st = STATUS_LABELS[customer.status];

  return (
    <>
      <tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-white text-sm flex-shrink-0"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #16a34a)` }}>
              {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <p className="font-black text-sm" style={{ color: '#1e1b4b' }}>{customer.name}</p>
              <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>{customer.phone}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="px-2.5 py-1 rounded-full text-xs font-black" style={{ background: st.bg, color: st.color, border: `1.5px solid ${st.color}` }}>
            {st.label}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <p className="font-black text-sm" style={{ color: ACCENT }}>{customer.points.toLocaleString('tr-TR')}</p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>Toplam: {customer.totalPoints.toLocaleString('tr-TR')}</p>
        </td>
        <td className="px-4 py-3 text-center hidden sm:table-cell">
          <p className="font-black text-sm" style={{ color: '#1e1b4b' }}>Seviye {customer.level}</p>
          <p className="text-xs" style={{ color: '#9ca3af' }}>{customer.visitCount} ziyaret</p>
        </td>
        <td className="px-4 py-3 text-center hidden md:table-cell">
          <p className="text-sm font-bold" style={{ color: '#6b7280' }}>{customer.lastVisit}</p>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center justify-end gap-2">
            <button onClick={() => onAdjust(customer)}
              className="px-3 py-1.5 rounded-lg text-xs font-black transition-all active:translate-y-0.5"
              style={{ background: ACCENT, color: 'white', border: '2px solid #1e1b4b', boxShadow: '0px 2px 0px #1e1b4b' }}>
              Puan
            </button>
            <button onClick={() => setExpanded(e => !e)}
              className="p-1.5 rounded-lg transition-all hover:bg-gray-100">
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr style={{ background: '#f8fafc' }}>
          <td colSpan={6} className="px-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stats */}
              <div className="space-y-2">
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Müşteri Detayları</p>
                {[
                  { icon: User,        label: 'E-posta',      value: customer.email },
                  { icon: Calendar,    label: 'Üyelik',       value: customer.joinDate },
                  { icon: ShoppingBag, label: 'Harcama',      value: `₺${customer.totalSpend.toLocaleString('tr-TR')}` },
                  { icon: TrendingUp,  label: 'Toplam Puan',  value: customer.totalPoints.toLocaleString('tr-TR') },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <d.icon size={14} style={{ color: ACCENT }} />
                    <span className="text-xs font-medium" style={{ color: '#6b7280' }}>{d.label}:</span>
                    <span className="text-xs font-black" style={{ color: '#1e1b4b' }}>{d.value}</span>
                  </div>
                ))}
              </div>

              {/* Transaction history */}
              <div className="sm:col-span-2">
                <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: '#9ca3af' }}>Son İşlemler</p>
                <div className="space-y-2">
                  {customer.recentTransactions.map((t, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl"
                      style={{ background: 'white', border: '1.5px solid #e5e7eb' }}>
                      <span className="text-xs font-bold" style={{ color: '#374151' }}>{t.action}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black" style={{ color: t.points > 0 ? ACCENT : '#ef4444' }}>
                          {t.points > 0 ? '+' : ''}{t.points} pts
                        </span>
                        <span className="text-xs" style={{ color: '#9ca3af' }}>{t.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

const StoreAdminCustomers: React.FC = () => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | 'all'>('all');
  const [adjustingCustomer, setAdjustingCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState(MOCK_CUSTOMERS);

  const filtered = customers.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) || c.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleAdjust = (id: string, delta: number, _reason: string) => {
    setCustomers(cs => cs.map(c => c.id === id ? { ...c, points: Math.max(0, c.points + delta) } : c));
  };

  const totals = {
    total:    customers.length,
    vip:      customers.filter(c => c.status === 'vip').length,
    active:   customers.filter(c => c.status === 'active').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
  };

  return (
    <StoreAdminLayout>
      {adjustingCustomer && (
        <AdjustModal
          customer={adjustingCustomer}
          onClose={() => setAdjustingCustomer(null)}
          onSave={handleAdjust}
        />
      )}

      <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="p-6 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #16a34a 100%)`, border: '2.5px solid #1e1b4b', boxShadow: '0px 5px 0px #1e1b4b' }}>
          <p className="font-black text-2xl">Müşteri Yönetimi 👥</p>
          <p className="text-white/80 text-sm mt-1">Müşteri profillerini görüntüle, puan düzenle ve satın alma geçmişini takip et</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Toplam',  value: totals.total,    color: '#7B6EF6' },
            { label: 'VIP',     value: totals.vip,      color: '#f59e0b' },
            { label: 'Aktif',   value: totals.active,   color: ACCENT    },
            { label: 'Pasif',   value: totals.inactive, color: '#9ca3af' },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl text-center"
              style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 3px 0px #1e1b4b' }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#9ca3af' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="İsim, telefon veya e-posta ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl font-medium text-sm outline-none"
              style={{ background: 'white', border: '2px solid #1e1b4b', color: '#1e1b4b' }}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'vip', 'active', 'inactive'] as const).map(f => (
              <button key={f}
                onClick={() => setStatusFilter(f)}
                className="px-4 py-2.5 rounded-xl text-sm font-black transition-all"
                style={{
                  background: statusFilter === f ? '#1e1b4b' : 'white',
                  color: statusFilter === f ? 'white' : '#374151',
                  border: '2px solid #1e1b4b',
                  boxShadow: statusFilter === f ? '0px 2px 0px #1e1b4b' : 'none',
                }}>
                {f === 'all' ? 'Tümü' : STATUS_LABELS[f as CustomerStatus].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'white', border: '2.5px solid #1e1b4b', boxShadow: '0px 4px 0px #1e1b4b' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
                  {['Müşteri', 'Durum', 'Puanlar', 'Seviye', 'Son Ziyaret', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-left text-xs font-black uppercase tracking-widest ${i === 3 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'hidden md:table-cell' : ''}`}
                      style={{ color: '#9ca3af' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center">
                      <User size={32} className="mx-auto mb-2" style={{ color: '#e5e7eb' }} />
                      <p className="font-bold text-sm" style={{ color: '#9ca3af' }}>Müşteri bulunamadı</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(c => (
                    <CustomerRow key={c.id} customer={c} onAdjust={setAdjustingCustomer} />
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3" style={{ borderTop: '2px solid #f3f4f6' }}>
            <p className="text-xs font-medium" style={{ color: '#9ca3af' }}>
              {filtered.length} müşteri gösteriliyor (toplam {customers.length})
            </p>
          </div>
        </div>

      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminCustomers;
