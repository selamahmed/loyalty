import React, { useState, useMemo } from 'react';
import CashierLayout from './CashierLayout';
import {
  History, Search, Filter, Star, CheckCircle, XCircle,
  Download, TrendingUp, Users, ScanLine, ChevronDown, ChevronUp
} from 'lucide-react';

const ACCENT = '#f59e0b';

type TxType = 'qr_scan' | 'manual_issue' | 'redemption';

interface Transaction {
  id: string;
  customerName: string;
  customerId: string;
  type: TxType;
  points: number;
  timestamp: string;
  date: string;
  cashier: string;
  status: 'success' | 'failed';
  note?: string;
}

const generateHistory = (): Transaction[] => {
  const names = ['Ayşe Kaya', 'Mehmet Türk', 'Zeynep Arslan', 'Ali Rıza Demir', 'Fatma Şahin', 'Can Yıldız', 'Elif Demir', 'Burak Aydın'];
  const cashiers = ['Kasiyer 1', 'Kasiyer 2'];
  const types: TxType[] = ['qr_scan', 'manual_issue', 'redemption'];
  const items: Transaction[] = [];
  for (let i = 0; i < 30; i++) {
    const type = types[i % 3];
    const pts = type === 'redemption' ? -(50 + (i % 8) * 50) : 50 + (i % 10) * 25;
    const hour = 8 + (i % 10);
    const min = (i * 7) % 60;
    const day = i < 10 ? '10 Haz' : i < 20 ? '09 Haz' : '08 Haz';
    items.push({
      id: `TX${1000 + i}`,
      customerName: names[i % names.length],
      customerId: `USR00${(i % 5) + 1}`,
      type,
      points: pts,
      timestamp: `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      date: day,
      cashier: cashiers[i % 2],
      status: i % 9 === 0 ? 'failed' : 'success',
      note: type === 'manual_issue' ? 'Manuel ödül' : undefined,
    });
  }
  return items;
};

const TX_TYPE_LABELS: Record<TxType, { label: string; color: string }> = {
  qr_scan:      { label: 'QR Tarama',    color: '#7B6EF6' },
  manual_issue: { label: 'Manuel Puan',  color: ACCENT    },
  redemption:   { label: 'Kullanım',     color: '#ef4444' },
};

const ALL_TX = generateHistory();

const CashierHistory: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TxType | 'all'>('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => ALL_TX.filter(tx => {
    const matchSearch = tx.customerName.toLowerCase().includes(search.toLowerCase()) ||
      tx.customerId.toLowerCase().includes(search.toLowerCase()) ||
      tx.id.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || tx.type === typeFilter;
    const matchDate = dateFilter === 'all' || tx.date === dateFilter;
    return matchSearch && matchType && matchDate;
  }), [search, typeFilter, dateFilter]);

  const totals = useMemo(() => ({
    issued:   ALL_TX.filter(t => t.points > 0 && t.status === 'success').reduce((s, t) => s + t.points, 0),
    redeemed: Math.abs(ALL_TX.filter(t => t.points < 0 && t.status === 'success').reduce((s, t) => s + t.points, 0)),
    scans:    ALL_TX.filter(t => t.type === 'qr_scan').length,
    customers: new Set(ALL_TX.map(t => t.customerId)).size,
  }), []);

  const dates = useMemo(() => ['all', ...Array.from(new Set(ALL_TX.map(t => t.date)))], []);

  return (
    <CashierLayout>
      <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">

        {/* Header */}
        <div className="p-5 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, ${ACCENT} 0%, #d97706 100%)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <History size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl">İşlem Geçmişi</p>
              <p className="text-white/70 text-sm mt-0.5">Tüm kasa işlemlerini görüntüle ve filtrele</p>
            </div>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Verilen Puan',   value: totals.issued.toLocaleString('tr-TR'),   icon: TrendingUp, color: '#22c55e' },
            { label: 'Kullanılan',     value: totals.redeemed.toLocaleString('tr-TR'), icon: Star,       color: '#ef4444' },
            { label: 'QR Tarama',      value: totals.scans.toString(),                 icon: ScanLine,   color: '#7B6EF6' },
            { label: 'Farklı Müşteri', value: totals.customers.toString(),             icon: Users,      color: ACCENT    },
          ].map((s, i) => (
            <div key={i} className="p-4 rounded-2xl text-center"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: `${s.color}18`, border: `2px solid ${s.color}` }}>
                <s.icon size={16} style={{ color: s.color }} />
              </div>
              <p className="font-black text-lg leading-tight" style={{ color: 'var(--text-dark)' }}>{s.value}</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Search & filter bar */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Müşteri adı, ID veya işlem no ara..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl font-medium text-sm outline-none"
                style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}
              />
            </div>
            <button onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-sm transition-all"
              style={{ background: showFilters ? ACCENT : 'var(--card-bg)', color: showFilters ? 'white' : 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
              <Filter size={14} /> Filtre
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-black text-sm"
              style={{ background: 'var(--card-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
              <Download size={14} />
            </button>
          </div>

          {showFilters && (
            <div className="p-4 rounded-2xl space-y-3" style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)' }}>
              <div>
                <p className="text-xs font-black mb-2" style={{ color: 'var(--text-muted)' }}>İŞLEM TÜRÜ</p>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'qr_scan', 'manual_issue', 'redemption'] as const).map(t => (
                    <button key={t}
                      onClick={() => setTypeFilter(t)}
                      className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                      style={{
                        background: typeFilter === t ? ACCENT : 'var(--tab-bg)',
                        color: typeFilter === t ? 'white' : 'var(--text-muted)',
                        border: '2px solid var(--dark-border)',
                      }}>
                      {t === 'all' ? 'Tümü' : TX_TYPE_LABELS[t].label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-black mb-2" style={{ color: 'var(--text-muted)' }}>TARİH</p>
                <div className="flex flex-wrap gap-2">
                  {dates.map(d => (
                    <button key={d}
                      onClick={() => setDateFilter(d)}
                      className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                      style={{
                        background: dateFilter === d ? '#7B6EF6' : 'var(--tab-bg)',
                        color: dateFilter === d ? 'white' : 'var(--text-muted)',
                        border: '2px solid var(--dark-border)',
                      }}>
                      {d === 'all' ? 'Tüm Tarihler' : d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Transaction list */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="px-5 py-3" style={{ borderBottom: '2px solid var(--dark-border)' }}>
            <p className="font-black text-sm" style={{ color: 'var(--text-muted)' }}>
              {filtered.length} işlem gösteriliyor
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center">
              <History size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
              <p className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>İşlem bulunamadı</p>
            </div>
          ) : (
            <div>
              {filtered.map(tx => {
                const typeInfo = TX_TYPE_LABELS[tx.type];
                const isExpanded = expandedId === tx.id;
                return (
                  <div key={tx.id} style={{ borderBottom: '1px solid var(--dark-border)' }}>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : tx.id)}
                      className="w-full flex items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-black/5"
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center font-black text-sm text-white flex-shrink-0"
                        style={{ background: typeInfo.color }}>
                        {tx.customerName[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{tx.customerName}</p>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: `${typeInfo.color}18`, color: typeInfo.color, border: `1px solid ${typeInfo.color}` }}>
                            {typeInfo.label}
                          </span>
                          {tx.status === 'failed' && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>
                              Başarısız
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx.date} {tx.timestamp}</span>
                          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>• #{tx.id}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="font-black text-sm"
                          style={{ color: tx.points > 0 ? '#22c55e' : '#ef4444' }}>
                          {tx.points > 0 ? '+' : ''}{tx.points} pts
                        </span>
                        {tx.status === 'success'
                          ? <CheckCircle size={14} style={{ color: '#22c55e' }} />
                          : <XCircle size={14} style={{ color: '#ef4444' }} />
                        }
                        {isExpanded ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-5 pb-4" style={{ background: 'var(--tab-bg)' }}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3">
                          {[
                            { label: 'Müşteri ID', value: tx.customerId },
                            { label: 'Kasiyer',    value: tx.cashier    },
                            { label: 'Saat',       value: tx.timestamp  },
                            { label: 'Tarih',      value: tx.date       },
                            { label: 'Durum',      value: tx.status === 'success' ? '✅ Başarılı' : '❌ Başarısız' },
                            ...(tx.note ? [{ label: 'Not', value: tx.note }] : []),
                          ].map((d, i) => (
                            <div key={i} className="p-2 rounded-xl" style={{ background: 'var(--card-bg)', border: '1.5px solid var(--dark-border)' }}>
                              <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>{d.label}</p>
                              <p className="text-xs font-black mt-0.5" style={{ color: 'var(--text-dark)' }}>{d.value}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </CashierLayout>
  );
};

export default CashierHistory;
