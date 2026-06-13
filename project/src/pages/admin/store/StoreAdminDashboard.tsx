import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StoreAdminLayout from './StoreAdminLayout';
import { supabase } from '../../../lib/supabase';
import { Users, Star, ShoppingBag, QrCode, TrendingUp, ArrowRight, Loader2 } from 'lucide-react';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

interface KPI { label: string; value: string; icon: React.ElementType; color: string }
interface TxRow { id: string; created_at: string; amount: number; description: string | null; profiles: { username: string } | null }
interface RewardRow { id: string; title: string; points: number; active: boolean; category: string | null }

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'az önce';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} dk`;
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const StoreAdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [kpis, setKpis]           = useState<KPI[]>([]);
  const [recentTx, setRecentTx]   = useState<TxRow[]>([]);
  const [rewards, setRewards]     = useState<RewardRow[]>([]);
  const [loading, setLoading]     = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profilesRes, txRes, rewardsRes] = await Promise.all([
        supabase.from('profiles').select('id, total_points', { count: 'exact' }),
        supabase.from('points_transactions').select('id, created_at, amount, description, profiles(username)').order('created_at', { ascending: false }).limit(5),
        supabase.from('rewards').select('id, title, points, active, category').eq('active', true).order('created_at', { ascending: false }).limit(4),
      ]);

      const totalUsers   = profilesRes.count ?? 0;
      const allPts       = (profilesRes.data ?? []).reduce((s, p) => s + ((p as { total_points?: number }).total_points ?? 0), 0);
      const activeRewards = (rewardsRes.data ?? []).length;

      setKpis([
        { label: 'Toplam Kullanıcı', value: totalUsers.toLocaleString('tr-TR'), icon: Users, color: '#7B6EF6' },
        { label: 'Toplam Puan', value: allPts.toLocaleString('tr-TR'), icon: Star, color: '#f59e0b' },
        { label: 'Aktif Ödül', value: activeRewards.toString(), icon: ShoppingBag, color: '#22c55e' },
        { label: 'İşlem (bugün)', value: (txRes.data ?? []).length.toString(), icon: TrendingUp, color: '#3b82f6' },
      ]);
      setRecentTx((txRes.data ?? []).map(row => {
        const r = row as { id: string; created_at: string; amount: number; description: string | null; profiles: { username: string } | { username: string }[] | null };
        const profiles = Array.isArray(r.profiles) ? r.profiles[0] ?? null : r.profiles;
        return { ...r, profiles };
      }));
      setRewards((rewardsRes.data ?? []) as RewardRow[]);
    } catch (e) { console.error('[StoreAdminDashboard]', e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <StoreAdminLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Header */}
        <div style={{ ...card, background: 'linear-gradient(135deg,#7B6EF6,#4F8EF7)', padding: 'clamp(18px,4vw,28px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>MAĞAZA YÖNETİMİ</p>
            <p style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'white', margin: '0 0 4px', lineHeight: 1.1 }}>Kontrol Paneli 🏪</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>Mağazanızın canlı istatistikleri</p>
          </div>
        </div>

        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {loading ? Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ ...card, padding: 20, textAlign: 'center', boxShadow: '0 3px 0 var(--dark-border)' }}>
              <Loader2 size={20} className="animate-spin" style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
            </div>
          )) : kpis.map((k, i) => (
            <div key={i} style={{ ...card, padding: '18px 14px', textAlign: 'center', boxShadow: '0 4px 0 var(--dark-border)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${k.color}15`, border: `2.5px solid ${k.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', boxShadow: `0 3px 0 ${k.color}40` }}>
                <k.icon size={20} style={{ color: k.color }} />
              </div>
              <p style={{ fontWeight: 900, fontSize: 24, color: 'var(--text-dark)', margin: 0, lineHeight: 1 }}>{k.value}</p>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{k.label}</p>
            </div>
          ))}
        </div>

        {/* Action cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { label: 'Müşteriler',  icon: Users,      path: '/store-admin/customers', color: '#7B6EF6' },
            { label: 'Ödüller',     icon: ShoppingBag, path: '/store-admin/rewards', color: '#f59e0b' },
            { label: 'QR Kodlar',  icon: QrCode,       path: '/store-admin/qr',      color: '#22c55e' },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} style={{ ...card, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 0.1s', gridColumn: i === 2 ? '1 / -1' : undefined }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: `${a.color}15`, border: `2.5px solid ${a.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <a.icon size={20} style={{ color: a.color }} />
              </div>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0, flex: 1 }}>{a.label}</p>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>

        {/* Recent transactions */}
        <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
          <div style={{ padding: '14px 20px', borderBottom: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={16} style={{ color: '#7B6EF6' }} />
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Son İşlemler</p>
          </div>
          {loading ? (
            <div style={{ padding: 28, textAlign: 'center' }}>
              <Loader2 size={22} className="animate-spin" style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
            </div>
          ) : recentTx.length === 0 ? (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>Henüz işlem yok</div>
          ) : recentTx.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < recentTx.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Star size={14} style={{ color: '#f59e0b' }} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.profiles?.username ?? 'Müşteri'}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{t.description ?? '—'}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 14, color: '#22c55e', margin: '0 0 2px' }}>+{t.amount}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{relTime(t.created_at)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Active rewards */}
        {rewards.length > 0 && (
          <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '14px 20px', borderBottom: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShoppingBag size={16} style={{ color: '#f59e0b' }} />
                <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Aktif Ödüller</p>
              </div>
              <button onClick={() => navigate('/store-admin/rewards')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#7B6EF6', background: 'none', border: 'none', cursor: 'pointer' }}>
                Tümü <ArrowRight size={12} />
              </button>
            </div>
            {rewards.map((r, i) => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < rewards.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px' }}>{r.title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{r.category ?? 'Genel'}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1.5px solid #f59e0b' }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontWeight: 900, fontSize: 12, color: '#d97706' }}>{r.points}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminDashboard;
