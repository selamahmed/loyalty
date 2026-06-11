import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CashierLayout from './CashierLayout';
import { ScanLine, Star, Users, CheckCircle, Clock, ArrowRight, PackageCheck, History } from 'lucide-react';

const AMBER = '#f59e0b';
const AMBER_DARK = '#d97706';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

const initialScans = [
  { id: 1, name: 'Ayşe K.',    points: 150, time: '09:14', type: 'qr'     },
  { id: 2, name: 'Mehmet T.',  points: 300, time: '09:02', type: 'manual' },
  { id: 3, name: 'Zeynep A.', points: 150, time: '08:55', type: 'qr'     },
  { id: 4, name: 'Ali R.',     points: 200, time: '08:41', type: 'qr'     },
  { id: 5, name: 'Fatma S.',  points: 150, time: '08:30', type: 'manual' },
];

const CashierDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentScans] = useState(initialScans);
  const totalToday = { scans: 34, points: 5120, customers: 34 };

  return (
    <CashierLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* ── Welcome banner ── */}
        <div style={{
          ...card,
          background: `linear-gradient(135deg,${AMBER} 0%,${AMBER_DARK} 100%)`,
          padding: 'clamp(18px,4vw,28px)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 130, height: 130, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'relative' }}>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 4px' }}>HOŞGELDINIZ</p>
            <p style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', color: 'white', margin: '0 0 4px', lineHeight: 1.1 }}>Kasa Ekranı 🧾</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, fontWeight: 600 }}>Müşterilere puan ver ve QR işlemlerini yönet</p>
          </div>
        </div>

        {/* ── Today stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { label: 'Tarama',       value: totalToday.scans.toString(),            icon: ScanLine, color: AMBER    },
            { label: 'Verilen Puan', value: totalToday.points.toLocaleString('tr-TR'), icon: Star,   color: '#7B6EF6' },
            { label: 'Müşteri',      value: totalToday.customers.toString(),          icon: Users,  color: '#22c55e' },
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

        {/* ── Action buttons ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* QR Scan */}
          <button
            onClick={() => navigate('/cashier/scan')}
            style={{
              ...card,
              background: 'linear-gradient(135deg,#7B6EF6,#4F46E5)',
              padding: '20px 18px', display: 'flex', alignItems: 'center', gap: 14,
              cursor: 'pointer', textAlign: 'left', transition: 'transform 0.1s, box-shadow 0.1s',
              gridColumn: '1 / -1',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 1px 0px var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 5px 0px var(--dark-border)'; }}
          >
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <ScanLine size={26} color="white" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 900, fontSize: 17, color: 'white', margin: '0 0 3px' }}>QR Kod Tara</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>Müşteri QR'ini okut, puan işlemi yap</p>
            </div>
            <ArrowRight size={20} color="rgba(255,255,255,0.6)" />
          </button>

          {/* Redeem */}
          <button
            onClick={() => navigate('/cashier/redeem')}
            style={{
              ...card,
              background: 'linear-gradient(135deg,#22c55e,#16a34a)',
              padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
              cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 1px 0px var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 5px 0px var(--dark-border)'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PackageCheck size={22} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'white', margin: '0 0 2px' }}>Ürün Teslimi</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>Kod doğrulama</p>
            </div>
          </button>

          {/* History */}
          <button
            onClick={() => navigate('/cashier/history')}
            style={{
              ...card,
              background: `linear-gradient(135deg,${AMBER},${AMBER_DARK})`,
              padding: '16px 14px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8,
              cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 1px 0px var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 5px 0px var(--dark-border)'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(255,255,255,0.2)', border: '2.5px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={22} color="white" />
            </div>
            <div>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'white', margin: '0 0 2px' }}>İşlem Geçmişi</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600 }}>Tüm kayıtlar</p>
            </div>
          </button>
        </div>

        {/* ── Recent scans ── */}
        <div style={{ ...card }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '2.5px solid var(--dark-border)' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, color: AMBER, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>BUGÜN</p>
              <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>Son Taramalar</p>
            </div>
            <button
              onClick={() => navigate('/cashier/history')}
              style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: AMBER, background: `${AMBER}12`, border: `2px solid ${AMBER}`, borderRadius: 10, padding: '5px 10px', cursor: 'pointer' }}
            >
              Tümü <ArrowRight size={12} />
            </button>
          </div>
          <div>
            {recentScans.map((s, i) => (
              <div
                key={s.id}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: i < recentScans.length - 1 ? '1.5px dashed var(--divider-dash)' : 'none' }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${AMBER},${AMBER_DARK})`, border: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: 15, color: 'white', flexShrink: 0 }}>
                  {(s.name[0] ?? '?').toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: 600 }}>{s.time} · {s.type === 'qr' ? 'QR Tarama' : 'Manuel'}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontWeight: 900, fontSize: 14, color: '#22c55e' }}>+{s.points}</span>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '1px 0 0', fontWeight: 600 }}>puan</p>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
              </div>
            ))}
          </div>
        </div>

      </div>
    </CashierLayout>
  );
};

export default CashierDashboard;
