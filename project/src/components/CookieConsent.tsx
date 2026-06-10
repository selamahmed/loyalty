import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield, ExternalLink } from 'lucide-react';

const LS_KEY = 'nexreward_cookie_consent';

const CookieConsent: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hiding, setHiding]   = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(LS_KEY)) {
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (accept: boolean) => {
    if (accept) localStorage.setItem(LS_KEY, 'accepted');
    setHiding(true);
    setTimeout(() => setVisible(false), 400);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop blur on mobile */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.25)',
          backdropFilter: 'blur(2px)',
          animation: hiding ? 'ccFadeOut 0.4s ease forwards' : 'ccFadeIn 0.35s ease forwards',
        }}
        onClick={() => dismiss(false)}
      />

      {/* Banner */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          padding: '0 12px 12px',
          pointerEvents: 'none',
          animation: hiding ? 'ccSlideDown 0.4s cubic-bezier(0.4,0,1,1) forwards' : 'ccSlideUp 0.45s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 600,
            background: 'var(--card-bg)',
            border: '3px solid var(--dark-border)',
            boxShadow: '0px 8px 0px var(--dark-border)',
            borderRadius: 24,
            overflow: 'hidden',
            pointerEvents: 'all',
          }}
        >
          {/* Top accent strip */}
          <div style={{ height: 4, background: 'linear-gradient(90deg,#7B6EF6,#4F8EF7,#22c55e)' }} />

          <div style={{ padding: '20px 20px 20px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg,#7B6EF6,#4F8EF7)',
                border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Cookie size={20} color="white" />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 5px', lineHeight: 1.2 }}>
                  🍪 Çerezler & Gizlilik
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  Deneyiminizi kişiselleştirmek, oturum bilgilerinizi saklamak ve uygulama performansını iyileştirmek için <strong style={{ color: 'var(--text-dark)' }}>çerezler</strong> ve <strong style={{ color: 'var(--text-dark)' }}>yerel depolama</strong> kullanıyoruz.
                  Devam ederek <span style={{ color: '#7B6EF6', fontWeight: 700, cursor: 'pointer' }}>Gizlilik Politikamızı</span> ve <span style={{ color: '#7B6EF6', fontWeight: 700, cursor: 'pointer' }}>Kullanım Koşullarımızı</span> kabul etmiş olursunuz.
                </p>
              </div>

              <button
                onClick={() => dismiss(false)}
                style={{
                  flexShrink: 0, width: 32, height: 32, borderRadius: 10,
                  background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  color: 'var(--text-muted)',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Info chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              {[
                { icon: '🔒', label: 'Güvenli Depolama' },
                { icon: '🚫', label: 'Üçüncü Taraf Yok' },
                { icon: '🔄', label: 'Oturum Yönetimi' },
              ].map(chip => (
                <span
                  key={chip.label}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 999,
                    background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)',
                    fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  }}
                >
                  {chip.icon} {chip.label}
                </span>
              ))}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => dismiss(false)}
                style={{
                  flex: 1, padding: '11px 0', borderRadius: 14,
                  background: 'var(--tab-bg)',
                  border: '2.5px solid var(--dark-border)',
                  boxShadow: '0px 3px 0px var(--dark-border)',
                  fontWeight: 900, fontSize: 13, cursor: 'pointer',
                  color: 'var(--text-muted)',
                  transition: 'all 0.12s',
                }}
              >
                Reddet
              </button>
              <button
                onClick={() => dismiss(true)}
                style={{
                  flex: 2, padding: '11px 0', borderRadius: 14,
                  background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)',
                  border: '2.5px solid var(--dark-border)',
                  boxShadow: '0px 4px 0px var(--dark-border)',
                  fontWeight: 900, fontSize: 14, cursor: 'pointer',
                  color: 'white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.12s',
                }}
              >
                <Shield size={16} /> Tümünü Kabul Et
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ccFadeIn    { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ccFadeOut   { from { opacity: 1 } to { opacity: 0 } }
        @keyframes ccSlideUp   { from { transform: translateY(120%) } to { transform: translateY(0) } }
        @keyframes ccSlideDown { from { transform: translateY(0) }     to { transform: translateY(120%) } }
      `}</style>
    </>
  );
};

export default CookieConsent;
