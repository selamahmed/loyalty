import React, { useState, useEffect, useCallback } from 'react';
import CashierLayout from './CashierLayout';
import { getCashierHistory } from '../../../services/admin';
import { useRealtimeTables } from '../../../hooks/useRealtime';
import { Search, Download, Star, Loader2, RefreshCw, QrCode, User, Zap } from 'lucide-react';

interface TxRow {
  id: string;
  created_at: string;
  amount: number;
  description: string | null;
  category: string | null;
  user_id: string | null;
  profiles: { username: string; email: string; avatar_url?: string } | null;
}

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

const categoryLabel: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  qr_scan:           { label: 'QR Tarama',     color: '#7B6EF6', icon: QrCode },
  admin_adjustment:  { label: 'Yönetici',      color: '#f59e0b', icon: Zap    },
  cashier_manual:    { label: 'Kasa Manuel',   color: '#22c55e', icon: User   },
  purchase:          { label: 'Alışveriş',     color: '#3b82f6', icon: Star   },
};

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'az önce';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} dk`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} sa`;
  return new Date(iso).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

const CashierHistory: React.FC = () => {
  const [rows, setRows]       = useState<TxRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const PAGE_SIZE = 30;

  const load = useCallback(async (pg = 0) => {
    setLoading(true);
    try {
      const data = await getCashierHistory(pg, PAGE_SIZE + 1);
      setHasMore(data.length > PAGE_SIZE);
      setRows(pg === 0 ? (data.slice(0, PAGE_SIZE) as TxRow[]) : prev => [...prev, ...data.slice(0, PAGE_SIZE) as TxRow[]]);
    } catch (e: unknown) {
      console.error('[CashierHistory]', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(0); }, [load]);
  useRealtimeTables(['points_transactions', 'qr_scans', 'profiles'], () => { setPage(0); void load(0); });

  const filtered = rows.filter(r => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      (r.profiles?.username ?? '').toLowerCase().includes(q) ||
      (r.profiles?.email ?? '').toLowerCase().includes(q) ||
      (r.description ?? '').toLowerCase().includes(q) ||
      (r.category ?? '').toLowerCase().includes(q)
    );
  });

  const totalPts    = rows.reduce((s, r) => s + (r.amount ?? 0), 0);
  const uniqueUsers = new Set(rows.map(r => r.user_id)).size;
  const qrScans     = rows.filter(r => r.category === 'qr_scan').length;

  const exportCSV = () => {
    const header = 'Tarih,Kullanıcı,E-posta,Puan,Tür,Açıklama';
    const lines = filtered.map(r =>
      [
        new Date(r.created_at).toLocaleString('tr-TR'),
        r.profiles?.username ?? '-',
        r.profiles?.email ?? '-',
        r.amount,
        r.category ?? '-',
        (r.description ?? '').replace(/,/g, ' '),
      ].join(',')
    );
    const blob = new Blob([header + '\n' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'kasa_gecmisi.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <CashierLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ ...card, background: 'linear-gradient(135deg,#1e293b,#0f172a)', padding: 'clamp(18px,4vw,28px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(123,110,246,0.15)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>KASA GEÇMİŞİ</p>
            <p style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'white', margin: '0 0 4px', lineHeight: 1.1 }}>İşlem Geçmişi 📋</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', margin: 0, fontWeight: 600 }}>Tüm puan işlemleri ve QR taramalar</p>
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'İşlem', value: rows.length.toString(), color: '#7B6EF6' },
            { label: 'Toplam Puan', value: totalPts.toLocaleString('tr-TR'), color: '#f59e0b' },
            { label: 'Müşteri', value: uniqueUsers.toString(), color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: '16px 10px', textAlign: 'center', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <p style={{ fontWeight: 900, fontSize: 22, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text" placeholder="Kullanıcı, açıklama veya tür ara..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 36, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none' }}
            />
          </div>
          <button onClick={() => load(0)} style={{ padding: '0 14px', borderRadius: 12, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: 'var(--text-muted)' }}>
            <RefreshCw size={14} />
          </button>
          <button onClick={exportCSV} style={{ padding: '0 16px', borderRadius: 12, background: 'var(--card-bg)', border: '2px solid var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 12, color: 'var(--text-muted)', boxShadow: '0 3px 0 var(--dark-border)' }}>
            <Download size={14} /> CSV
          </button>
        </div>

        {/* Table */}
        <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
          {loading && rows.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Loader2 size={32} color="var(--text-muted)" className="animate-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>Yükleniyor…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>📋</p>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-muted)' }}>İşlem bulunamadı</p>
            </div>
          ) : filtered.map((r, i) => {
            const cat = categoryLabel[r.category ?? ''] ?? { label: r.category ?? '—', color: 'var(--text-muted)', icon: Star };
            const CatIcon = cat.icon;
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1.5px solid var(--dark-border)' : 'none' }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${cat.color}15`, border: `2px solid ${cat.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CatIcon size={16} style={{ color: cat.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.profiles?.username ?? 'Kullanıcı'}
                    </p>
                    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 900, background: `${cat.color}15`, color: cat.color, flexShrink: 0 }}>{cat.label}</span>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.description ?? r.profiles?.email ?? ''}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: 15, color: (r.amount ?? 0) >= 0 ? '#22c55e' : '#ef4444', margin: '0 0 2px' }}>
                    {(r.amount ?? 0) >= 0 ? '+' : ''}{(r.amount ?? 0).toLocaleString('tr-TR')}
                  </p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{relTime(r.created_at)}</p>
                </div>
              </div>
            );
          })}
        </div>

        {hasMore && !loading && (
          <button onClick={() => { const next = page + 1; setPage(next); load(next); }}
            style={{ ...card, padding: '14px', textAlign: 'center', fontWeight: 900, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', boxShadow: '0 3px 0 var(--dark-border)' }}>
            Daha Fazla Yükle
          </button>
        )}
      </div>
    </CashierLayout>
  );
};

export default CashierHistory;
