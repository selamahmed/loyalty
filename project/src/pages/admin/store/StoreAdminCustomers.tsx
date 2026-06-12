import React, { useState, useEffect, useCallback } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { supabase } from '../../../lib/supabase';
import { adminAddPoints } from '../../../services/admin';
import { useRealtimeTable } from '../../../hooks/useRealtime';
import { Search, User, Star, TrendingUp, Loader2, X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Customer {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  total_points: number;
  level: number;
  phone?: string | null;
  created_at: string;
  status?: string | null;
}

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

const AdjustModal: React.FC<{
  customer: Customer;
  onClose: () => void;
  onDone: () => void;
}> = ({ customer, onClose, onDone }) => {
  const [points, setPoints]   = useState('');
  const [reason, setReason]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [done, setDone]       = useState(false);

  const handleSubmit = async () => {
    const p = parseInt(points);
    if (!p || p === 0) { setError('Geçerli bir puan girin'); return; }
    setLoading(true); setError('');
    try {
      await adminAddPoints(customer.id, p, reason || 'Mağaza yöneticisi ayarlaması');
      setDone(true);
      setTimeout(() => { onDone(); onClose(); }, 1500);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'İşlem başarısız');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ ...card, width: '100%', maxWidth: 420, padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Puan Ayarla</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{customer.username}</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="var(--text-muted)" />
          </button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>PUAN (pozitif veya negatif)</label>
          <input type="number" placeholder="ör: 100 veya -50" value={points} onChange={e => setPoints(e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: 12, fontSize: 15, fontWeight: 900, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none' }} />
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>AÇIKLAMA</label>
          <input type="text" placeholder="Neden?" value={reason} onChange={e => setReason(e.target.value)}
            style={{ width: '100%', padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none' }} />
        </div>

        {error && <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', fontSize: 12, color: '#ef4444', fontWeight: 700 }}>{error}</div>}
        {done && <div style={{ marginBottom: 14, padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,0.1)', border: '2px solid #22c55e', fontSize: 12, color: '#22c55e', fontWeight: 700 }}>✅ Başarıyla güncellendi!</div>}

        <button onClick={handleSubmit} disabled={loading || done || !points}
          style={{ width: '100%', padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading || done || !points ? 0.6 : 1 }}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : done ? <CheckCircle size={16} /> : <Star size={16} />}
          {loading ? 'Kaydediliyor…' : done ? 'Tamamlandı!' : 'Güncelle'}
        </button>
      </div>
    </div>
  );
};

const StoreAdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [adjustTarget, setAdjustTarget] = useState<Customer | null>(null);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase
        .from('profiles')
        .select('id, username, email, avatar_url, total_points, level, phone, created_at, status')
        .order('total_points', { ascending: false })
        .limit(100);

      if (search.trim()) {
        q = q.or(`username.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error } = await q;
      if (error) throw error;
      setCustomers((data ?? []) as Customer[]);
    } catch (e) { console.error('[StoreAdminCustomers]', e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(() => loadCustomers(), 300);
    return () => clearTimeout(t);
  }, [loadCustomers]);

  useRealtimeTable('profiles', loadCustomers);

  const levelColor = (l: number) => l >= 10 ? '#7B6EF6' : l >= 5 ? '#f59e0b' : '#22c55e';

  return (
    <StoreAdminLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {adjustTarget && <AdjustModal customer={adjustTarget} onClose={() => setAdjustTarget(null)} onDone={loadCustomers} />}

        {/* Header */}
        <div style={{ ...card, background: 'linear-gradient(135deg,#7B6EF6,#5b4dd1)', padding: 'clamp(18px,4vw,24px)' }}>
          <p style={{ fontWeight: 900, fontSize: 22, color: 'white', margin: '0 0 4px' }}>Müşteriler 👥</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>Tüm müşterileri görüntüle ve puan ayarla</p>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            {loading && <Loader2 size={13} className="animate-spin" style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />}
            <input
              type="text" placeholder="İsim, e-posta veya telefon ara..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 40, paddingRight: 36, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none', boxShadow: '0 3px 0 var(--dark-border)' }}
            />
          </div>
          <button onClick={loadCustomers} style={{ padding: '0 14px', borderRadius: 12, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={15} color="var(--text-muted)" />
          </button>
        </div>

        {/* Customer list */}
        <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
          {loading && customers.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Yükleniyor…</p>
            </div>
          ) : customers.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <User size={36} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Müşteri bulunamadı</p>
            </div>
          ) : customers.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < customers.length - 1 ? '1.5px solid var(--dark-border)' : 'none' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#7B6EF6,#4F8EF7)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '2px solid var(--dark-border)', overflow: 'hidden' }}>
                {c.avatar_url
                  ? <img src={c.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ fontWeight: 900, fontSize: 14, color: 'white' }}>{c.username?.substring(0, 2).toUpperCase()}</span>}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.username}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.email}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: 900, fontSize: 13, color: '#d97706' }}>{(c.total_points ?? 0).toLocaleString('tr-TR')}</span>
                  </div>
                  <p style={{ fontSize: 10, color: levelColor(c.level ?? 1), fontWeight: 900, margin: '2px 0 0' }}>Seviye {c.level ?? 1}</p>
                </div>
                <button onClick={() => setAdjustTarget(c)}
                  style={{ padding: '7px 12px', borderRadius: 10, fontWeight: 900, fontSize: 11, background: 'rgba(123,110,246,0.08)', color: '#7B6EF6', border: '1.5px solid rgba(123,110,246,0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <TrendingUp size={11} /> Puan
                </button>
              </div>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>{customers.length} müşteri listelendi</p>
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminCustomers;
