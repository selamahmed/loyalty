import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Clock, RefreshCw, Shield } from 'lucide-react';
import type { MaintenanceStatus } from '../services/config';

interface Props {
  status: MaintenanceStatus;
}

const MaintenancePage: React.FC<Props> = ({ status }) => {
  const navigate = useNavigate();
  const [dots, setDots] = useState('');

  /* Animated dots */
  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(id);
  }, []);

  /* Format activation time */
  const since = status.activated_at
    ? new Date(status.activated_at).toLocaleString('tr-TR', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0c0c0e 0%, #1a0a2e 50%, #0c0c0e 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Background grid decoration */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(123,110,246,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(123,110,246,0.04) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Glow blobs */}
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(123,110,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: 250, height: 250, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,229,0,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: 480, width: '100%',
        background: 'rgba(255,255,255,0.04)',
        border: '3px solid rgba(255,255,255,0.08)',
        borderRadius: 28,
        padding: 40,
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
        backdropFilter: 'blur(20px)',
        textAlign: 'center',
      }}>

        {/* Icon */}
        <div style={{
          width: 90, height: 90, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,229,0,0.15), rgba(255,107,53,0.15))',
          border: '3px solid rgba(255,229,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px',
          boxShadow: '0 0 40px rgba(255,229,0,0.1)',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          <Wrench size={40} color="#FFE500" strokeWidth={2.5} />
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,229,0,0.12)', border: '1.5px solid rgba(255,229,0,0.3)',
          borderRadius: 999, padding: '4px 12px',
          fontSize: 10, fontWeight: 900, letterSpacing: '0.12em',
          color: '#FFE500', textTransform: 'uppercase', marginBottom: 16,
        }}>
          🔧 BAKIM ÇALIŞMASI
        </div>

        <h1 style={{
          fontSize: 'clamp(22px,5vw,30px)', fontWeight: 900, color: '#fff',
          margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.2,
        }}>
          Site Şu An Bakımda
        </h1>

        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.6)', fontWeight: 500,
          lineHeight: 1.6, margin: '0 0 28px',
        }}>
          {status.message || 'Siteyi sizin için daha iyi hale getirmek üzere çalışıyoruz. Kısa süre içinde geri döneceğiz.'}
        </p>

        {/* Info boxes */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
          {status.estimated_time && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(0,209,255,0.08)', border: '1.5px solid rgba(0,209,255,0.2)',
              borderRadius: 14, padding: '12px 16px',
            }}>
              <Clock size={16} color="#00D1FF" />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,209,255,0.7)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Tahmini Süre</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#fff', margin: 0 }}>{status.estimated_time}</p>
              </div>
            </div>
          )}
          {since && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(255,255,255,0.04)', border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: 14, padding: '12px 16px',
            }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF6B35', boxShadow: '0 0 8px #FF6B35', flexShrink: 0, marginLeft: 4 }} />
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Bakım Başladı</p>
                <p style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{since}</p>
              </div>
            </div>
          )}
        </div>

        {/* Animated working indicator */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          marginBottom: 28, color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 600,
        }}>
          <div style={{ display: 'flex', gap: 4 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%', background: '#7B6EF6',
                animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          Çalışıyor{dots}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 0', borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: 'pointer',
              background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)',
              border: '2px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; }}
          >
            <RefreshCw size={14} /> Yenile
          </button>
          <button
            onClick={() => navigate('/admin-login')}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px 0', borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: 'pointer',
              background: 'linear-gradient(135deg, #7B6EF6, #4F46E5)',
              color: '#fff', border: '2px solid rgba(123,110,246,0.4)',
              boxShadow: '0 4px 20px rgba(123,110,246,0.3)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          >
            <Shield size={14} /> Yönetici
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(255,229,0,0.1); }
          50% { box-shadow: 0 0 60px rgba(255,229,0,0.25); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;
