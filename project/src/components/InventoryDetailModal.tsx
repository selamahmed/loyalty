import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Clock, Tag, Ticket, Gift, Package, AlertCircle } from 'lucide-react';
import { InventoryItem, useInventory } from '../context/InventoryContext';
import { createInventoryQRPayload } from '../lib/qrUtils';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const typeConfig: Record<string, { color: string; bg: string; icon: React.FC<{ size?: number; color?: string }>; label: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: Tag,    label: 'Kupon' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', icon: Ticket, label: 'Bilet' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  icon: Gift,   label: 'Ödül'  },
};

interface Countdown { days: number; hours: number; minutes: number; seconds: number; expired: boolean; }

function getCountdown(expiresStr: string): Countdown {
  const diff = new Date(expiresStr).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    expired: false,
  };
}

interface Props { item: InventoryItem; onClose: () => void; }

const InventoryDetailModal: React.FC<Props> = ({ item, onClose }) => {
  const { markUsed } = useInventory();
  const cfg      = typeConfig[item.type] || typeConfig.reward;
  const IconComp = cfg.icon;

  const [copied, setCopied]       = useState(false);
  const [countdown, setCountdown] = useState<Countdown>(getCountdown(item.expires));
  const [showQR, setShowQR]       = useState(false);
  const [confirmUse, setConfirmUse] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCountdown(getCountdown(item.expires)), 1000);
    return () => clearInterval(timer);
  }, [item.expires]);

  const handleCopy = () => {
    navigator.clipboard.writeText(item.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleMarkUsed = () => { markUsed(item.id); onClose(); };

  const isExpired = countdown.expired;
  const isUsed    = item.used;

  const qrPayload = createInventoryQRPayload({
    id: item.id, code: item.code, title: item.title, type: item.type, expires: item.expires,
  });
  const qrData = encodeURIComponent(JSON.stringify(qrPayload));

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.80)', backdropFilter: 'blur(10px)', padding: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        ...card,
        width: '100%', maxWidth: 500, maxHeight: '95vh', overflowY: 'auto',
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none',
        animation: 'detailSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* Pull bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--dark-border)', opacity: 0.3 }} />
        </div>

        <div style={{ padding: '16px 20px 36px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── HERO: Ticket-style code card ── */}
          <div style={{ borderRadius: 20, overflow: 'visible', background: 'var(--card-bg)', border: `3px solid ${isExpired || isUsed ? '#ef4444' : cfg.color}`, boxShadow: `0px 6px 0px ${isExpired || isUsed ? '#dc2626' : cfg.color}`, position: 'relative' }}>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{ position: 'absolute', top: -12, right: -12, width: 32, height: 32, borderRadius: '50%', background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 5 }}
            >
              <X size={14} color="var(--text-muted)" />
            </button>

            {/* Ticket image + header */}
            <div style={{ position: 'relative', height: 160, borderTopLeftRadius: 17, borderTopRightRadius: 17, overflow: 'hidden', borderBottom: `2.5px dashed ${isExpired || isUsed ? '#ef4444' : cfg.color}` }}>
              {item.image ? (
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isExpired || isUsed ? 0.45 : 1 }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
                  {isExpired || isUsed ? <Package size={56} color="var(--text-muted)" /> : <span style={{ fontSize: 56 }}>🎫</span>}
                </div>
              )}
              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }} />
              {/* Title overlay */}
              <div style={{ position: 'absolute', bottom: 12, left: 14, right: 14 }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: 'white', margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{item.title}</p>
              </div>
              {/* Type badge */}
              <span style={{ position: 'absolute', top: 10, left: 10, padding: '3px 10px', borderRadius: 999, background: cfg.color, color: 'white', fontSize: 10, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 3 }}>
                <IconComp size={9} color="white" /> {cfg.label}
              </span>
              {(isExpired || isUsed) && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ background: '#ef4444', color: 'white', padding: '6px 18px', borderRadius: 999, fontSize: 14, fontWeight: 900, boxShadow: '0 3px 0 #dc2626' }}>
                    {isUsed ? '✓ KULLANILDI' : '✗ SÜRESİ DOLDU'}
                  </span>
                </div>
              )}
            </div>

            {/* Notches at divider */}
            <div style={{ position: 'relative', height: 0, overflow: 'visible', zIndex: 3 }}>
              <div style={{ position: 'absolute', left: -13, top: -13, width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-color)', border: `2.5px solid ${isExpired || isUsed ? '#ef4444' : cfg.color}` }} />
              <div style={{ position: 'absolute', right: -13, top: -13, width: 26, height: 26, borderRadius: '50%', background: 'var(--bg-color)', border: `2.5px solid ${isExpired || isUsed ? '#ef4444' : cfg.color}` }} />
            </div>

            {/* CODE area */}
            <div style={{ padding: '18px 16px 16px' }}>
              <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', margin: '0 0 10px' }}>
                {isUsed ? 'Kullanıldı' : isExpired ? 'Süresi Doldu' : '📲 Kasiyere Bu Kodu Göster'}
              </p>

              {/* Big code display */}
              <div
                onClick={!isUsed && !isExpired ? handleCopy : undefined}
                style={{
                  padding: '16px 18px', borderRadius: 14,
                  background: isExpired || isUsed ? 'var(--tab-bg)' : `${cfg.color}10`,
                  border: `2.5px dashed ${isExpired || isUsed ? 'var(--dark-border)' : cfg.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  cursor: isExpired || isUsed ? 'default' : 'pointer',
                }}
              >
                <span style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: isExpired || isUsed ? 'var(--text-muted)' : 'var(--text-dark)', letterSpacing: '0.12em', flex: 1, textAlign: 'center' }}>
                  {item.code}
                </span>
                {!isUsed && !isExpired && (
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: copied ? 'rgba(34,197,94,0.12)' : cfg.bg, border: `2px solid ${copied ? '#22c55e' : cfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s' }}>
                    {copied ? <Check size={16} color="#22c55e" /> : <Copy size={16} color={cfg.color} />}
                  </div>
                )}
              </div>

              {!isUsed && !isExpired && (
                <p style={{ fontSize: 11, color: cfg.color, fontWeight: 700, textAlign: 'center', margin: '8px 0 0' }}>
                  👆 Koda dokunarak kopyala
                </p>
              )}
            </div>
          </div>

          {/* ── Description ── */}
          {item.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{item.description}</p>
          )}

          {/* ── Countdown ── */}
          {!isExpired && !isUsed ? (
            <div style={{ ...card, padding: '14px 16px', background: `${countdown.days < 3 ? 'rgba(239,68,68,0.04)' : 'rgba(34,197,94,0.04)'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Clock size={14} color={countdown.days < 3 ? '#ef4444' : '#22c55e'} />
                <span style={{ fontSize: 11, fontWeight: 900, color: countdown.days < 3 ? '#ef4444' : '#22c55e', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {countdown.days < 3 ? '⚠️ Yakında Bitiyor!' : '⏰ Kalan Süre'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {[
                  { val: countdown.days,    label: 'Gün' },
                  { val: countdown.hours,   label: 'Saat' },
                  { val: countdown.minutes, label: 'Dakika' },
                  { val: countdown.seconds, label: 'Saniye' },
                ].map(({ val, label }) => (
                  <div key={label} style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', borderRadius: 12, padding: '10px 6px', textAlign: 'center' }}>
                    <p style={{ fontWeight: 900, fontSize: 22, color: countdown.days < 3 ? '#ef4444' : 'var(--primary-blue)', margin: '0 0 2px', lineHeight: 1, fontFamily: 'monospace' }}>
                      {String(val).padStart(2, '0')}
                    </p>
                    <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '10px 0 0', textAlign: 'center', fontWeight: 600 }}>
                Son kullanım: {new Date(item.expires).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ) : (
            <div style={{ ...card, padding: '14px 16px', background: 'rgba(239,68,68,0.06)', border: '3px solid #ef4444', boxShadow: '0 6px 0 #dc2626', display: 'flex', alignItems: 'center', gap: 10 }}>
              <AlertCircle size={20} color="#ef4444" />
              <p style={{ fontWeight: 900, fontSize: 14, color: '#ef4444', margin: 0 }}>
                {isUsed ? 'Bu bilet zaten kullanıldı.' : 'Bu biletin süresi doldu.'}
              </p>
            </div>
          )}

          {/* ── QR code toggle ── */}
          {!isUsed && !isExpired && (
            <div>
              <button
                onClick={() => setShowQR(s => !s)}
                style={{ width: '100%', padding: '12px', borderRadius: 14, background: showQR ? `linear-gradient(180deg,${cfg.color},${cfg.color}cc)` : 'var(--card-bg)', color: showQR ? 'white' : 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)', fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}
              >
                🔲 {showQR ? 'QR Kodu Gizle' : 'QR Kod Olarak Göster'}
              </button>

              {showQR && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, animation: 'qrFadeIn 0.25s ease-out' }}>
                  <div style={{ background: 'white', padding: 16, borderRadius: 20, border: '3px solid var(--dark-border)', boxShadow: '0 6px 0 var(--dark-border)' }}>
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?data=${qrData}&size=240x240&margin=10&color=000000&bgcolor=ffffff`}
                      alt={`QR: ${item.code}`}
                      style={{ width: 240, height: 240, display: 'block', borderRadius: 8 }}
                    />
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 600, textAlign: 'center' }}>
                    Kasada bu QR kodu tarat veya kodu elle gir
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ── Action buttons ── */}
          {!isUsed && !isExpired && (
            !confirmUse ? (
              <button
                onClick={() => setConfirmUse(true)}
                style={{ width: '100%', padding: '14px', borderRadius: 16, background: 'var(--card-bg)', color: 'var(--text-muted)', border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)', fontWeight: 900, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
              >
                <Check size={18} /> Kullanıldı Olarak İşaretle
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setConfirmUse(false)}
                  style={{ flex: 1, padding: '12px', borderRadius: 14, background: 'var(--card-bg)', color: 'var(--text-muted)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', fontWeight: 900, fontSize: 13, cursor: 'pointer' }}
                >
                  İptal
                </button>
                <button
                  onClick={handleMarkUsed}
                  style={{ flex: 2, padding: '12px', borderRadius: 14, background: '#22c55e', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 #16a34a', fontWeight: 900, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                >
                  <Check size={16} /> Evet, Kullanıldı
                </button>
              </div>
            )
          )}
        </div>
      </div>

      <style>{`
        @keyframes detailSlideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes qrFadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default InventoryDetailModal;
