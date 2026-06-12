import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CashierLayout from './CashierLayout';
import { useAuth } from '../../../context/AuthContext';
import { getCashierTodayStats, getRecentPointsTransactions } from '../../../services/admin';
import { ScanLine, Star, Users, CheckCircle, Clock, ArrowRight, PackageCheck, History, Loader2, QrCode, Zap, User } from 'lucide-react';

const AMBER      = '#f59e0b';
const AMBER_DARK = '#d97706';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

interface ScanRow {
  id: string;
  created_at: string;
  amount: number;
  category: string | null;
  description: string | null;
  profiles: { username: string } | null;
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return 'az önce';
  if (diff < 3600000) return `${Math.floor(diff / 60000)} dk`;
  return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const CashierDashboard: React.FC = () => {
  const navigate   = useNavigate();
  const { authUser } = useAuth();
  const [stats, setStats] = useState({ scans: 0, pointsGiven: 0, customers: 0 });
  const [recentScans, setRecentScans] = useState<ScanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!authUser?.id) return;
    setLoading(true);
    try {
      const [s, recent] = await Promise.all([
        getCashierTodayStats(authUser.id),
        getRecentPointsTransactions(5),
      ]);
      setStats(s);
      setRecentScans(recent as ScanRow[]);
    } catch (e) {
      console.error('[CashierDashboard]', e);
    } finally {
      setLoading(false);
    }
  }, [authUser?.id]);

  useEffect(() => { loadData(); }, [loadData]);

  const catIcon = (cat: string | null) => {
    if (cat === 'qr_scan') return <QrCode size={14} style={{ color: '#7B6EF6' }} />;
    if (cat === 'cashier_manual') return <User size={14} style={{ color: '#22c55e' }} />;
    return <Zap size={14} style={{ color: AMBER }} />;
  };

  return (
    <CashierLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Welcome banner */}
        <div style={{ ...card, background: `linear-gradient(135deg,${AMBER} 0%,${AMBER_DARK} 100%)`, padding: 'clamp(18px,4vw,28px)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>HOŞGELDİNİZ</p>
            <p style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'white', margin: '0 0 4px', lineHeight: 1.1 }}>Kasa Ekranı 🧾</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 600 }}>Müşterilere puan ver ve QR işlemlerini yönet</p>
          </div>
        </div>

        {/* Today stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Tarama',       value: loading ? '…' : stats.scans.toString(),                      icon: ScanLine, color: AMBER    },
            { label: 'Verilen Puan', value: loading ? '…' : stats.pointsGiven.toLocaleString('tr-TR'),   icon: Star,   color: '#7B6EF6' },
            { label: 'Müşteri',      value: loading ? '…' : stats.customers.toString(),                   icon: Users,  color: '#22c55e' },
          ].map((s, i) => (
            <div key={i} style={{ ...card, padding: '16px 10px', textAlign: 'center', boxShadow: '0px 4px 0px var(--dark-border)' }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', background: `${s.color}15`, border: `2.5px solid ${s.color}`, boxShadow: `0 3px 0 ${s.color}40` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button onClick={() => navigate('/cashier/scan')} style={{ ...card, background: 'linear-gradient(135deg,#7B6EF6,#4F46E5)', padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', textAlign: 'left', transition: 'transform 0.1s, box-shadow 0.1s', gridColumn: '1 / -1' }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 1px 0px var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 5px 0px var(--dark-border)'; }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ScanLine size={24} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: 18, color: 'white', margin: '0 0 3px' }}>Puan İşlemleri</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>Tutar gir → QR oluştur veya müşteri ara</p>
            </div>
            <ArrowRight size={20} color="rgba(255,255,255,0.7)" />
          </button>

          {[
            { label: 'Ödül İşlet', icon: PackageCheck, path: '/cashier/redeem', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
            { label: 'İşlem Geçmişi', icon: History, path: '/cashier/history', color: '#7B6EF6', bg: 'rgba(123,110,246,0.1)' },
          ].map((a, i) => (
            <button key={i} onClick={() => navigate(a.path)} style={{ ...card, padding: '18px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s' }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 1px 0px var(--dark-border)'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 5px 0px var(--dark-border)'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: a.bg, border: `2.5px solid ${a.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <a.icon size={20} style={{ color: a.color }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{a.label}</p>
              </div>
              <ArrowRight size={16} style={{ color: 'var(--text-muted)' }} />
            </button>
          ))}
        </div>

        {/* Recent scans */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '2.5px solid var(--dark-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} style={{ color: AMBER }} />
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Son İşlemler</p>
            </div>
            <button onClick={() => navigate('/cashier/history')} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 10, fontWeight: 700, fontSize: 12, color: '#7B6EF6', background: 'rgba(123,110,246,0.08)', border: '1.5px solid rgba(123,110,246,0.3)', cursor: 'pointer' }}>
              Tümü <ArrowRight size={12} />
            </button>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto', color: 'var(--text-muted)' }} />
            </div>
          ) : recentScans.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>
              Henüz işlem yok
            </div>
          ) : recentScans.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 20px', borderBottom: i < recentScans.length - 1 ? '1px solid var(--dark-border)' : 'none' }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {catIcon(s.category)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.profiles?.username ?? 'Müşteri'}
                </p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{s.description ?? s.category ?? '—'}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 14, color: '#22c55e', margin: '0 0 2px' }}>+{s.amount}</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>{relTime(s.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CashierLayout>
  );
};

export default CashierDashboard;
