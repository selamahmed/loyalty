import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Clock, Tag, Ticket, Gift, Package, QrCode, AlertCircle } from 'lucide-react';
import { InventoryItem, useInventory } from '../context/InventoryContext';
import { createInventoryQRPayload } from '../lib/qrUtils';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const typeConfig: Record<string, { color: string; bg: string; accent: string; icon: React.FC<{ size?: number; color?: string }>; label: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  accent: '#3b82f6', icon: Tag,    label: 'Kupon' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  accent: '#f59e0b', icon: Ticket, label: 'Bilet' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   accent: '#22c55e', icon: Gift,   label: 'Ödül'  },
};

interface Countdown {
  days: number; hours: number; minutes: number; seconds: number; expired: boolean;
}

function getCountdown(expiresStr: string): Countdown {
  const diff = new Date(expiresStr).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  const days    = Math.floor(diff / 86400000);
  const hours   = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds, expired: false };
}

interface Props {
  item: InventoryItem;
  onClose: () => void;
}

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

  const handleMarkUsed = () => {
    markUsed(item.id);
    onClose();
  };

  const isExpired = countdown.expired;
  const isUsed    = item.used;

  /* Full JSON payload encoded into QR — cashier's scanner parses this */
  const qrPayload = createInventoryQRPayload({
    id: item.id, code: item.code, title: item.title, type: item.type, expires: item.expires,
  });
  const qrData = encodeURIComponent(JSON.stringify(qrPayload));

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', padding: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        ...card,
        width: '100%', maxWidth: 500, maxHeight: '95vh', overflowY: 'auto',
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none',
        animation: 'detailSlideUp 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}>

        {/* ── Pull bar ── */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 0' }}>
          <div style={{ width: 40, height: 4, borderRadius: 999, background: 'var(--dark-border)', opacity: 0.3 }} />
        </div>

        {/* ── Header image ── */}
        <div style={{ position: 'relative', margin: '12px 16px 0', borderRadius: 18, overflow: 'hidden', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', height: 200 }}>
          {item.image ? (
            <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>
              <Package size={64} color="var(--text-muted)" />
            </div>
          )}
          {/* Overlay badges */}
          <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
            <span style={{ padding: '4px 10px', borderRadius: 999, background: cfg.color, color: 'white', fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4, backdropFilter: 'blur(4px)' }}>
              <IconComp size={10} color="white" /> {cfg.label}
            </span>
            {isExpired && (
              <span style={{ padding: '4px 10px', borderRadius: 999, background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 900 }}>Süresi Doldu</span>
            )}
            {isUsed && (
              <span style={{ padding: '4px 10px', borderRadius: 999, background: '#6b7280', color: 'white', fontSize: 11, fontWeight: 900 }}>Kullanıldı</span>
            )}
          </div>
          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
          >
            <X size={16} color="white" />
          </button>
          {/* Quantity badge */}
          {(item.quantity ?? 1) > 1 && !isUsed && (
            <div style={{ position: 'absolute', bottom: 12, right: 12, padding: '4px 10px', background: 'rgba(0,0,0,0.7)', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}>
              <span style={{ fontSize: 12, fontWeight: 900, color: 'white' }}>×{item.quantity}</span>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Title + description */}
          <div>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 22, margin: '0 0 8px', lineHeight: 1.2 }}>{item.title}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{item.description}</p>
          </div>

          {/* ── Countdown timer ── */}
          {!isExpired && !isUsed ? (
            <div style={{ ...card, padding: '14px 16px', background: 'rgba(34,197,94,0.04)' }}>
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
                    <p style={{ fontWeight: 900, fontSize: 22, color: countdown.days < 3 ? '#ef4444' : 'var(--primary-blue)', margin: '0 0 2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums', fontFamily: 'monospace' }}>
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
                {isUsed ? 'Bu kupon zaten kullanıldı.' : 'Bu kuponun süresi doldu.'}
              </p>
            </div>
          )}

          {/* ── Code display ── */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>Kupon Kodu</p>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ flex: 1, padding: '12px 16px', borderRadius: 14, background: 'var(--tab-bg)', border: '2.5px dashed var(--dark-border)' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '0.12em' }}>{item.code}</span>
              </div>
              <button
                onClick={handleCopy}
                style={{
                  width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                  background: copied ? 'rgba(34,197,94,0.12)' : 'var(--card-bg)',
                  border: `3px solid ${copied ? '#22c55e' : 'var(--dark-border)'}`,
                  boxShadow: `0 4px 0 ${copied ? '#16a34a' : 'var(--dark-border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {copied ? <Check size={20} color="#22c55e" /> : <Copy size={20} color="var(--text-muted)" />}
              </button>
            </div>
          </div>

          {/* ── QR Code toggle ── */}
          <div>
            <button
              onClick={() => setShowQR(s => !s)}
              style={{
                width: '100%', padding: '12px', borderRadius: 14,
                background: showQR ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
                color: showQR ? 'white' : 'var(--text-dark)',
                border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)',
                fontWeight: 900, fontSize: 14, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              <QrCode size={18} /> {showQR ? 'QR Kodu Gizle' : 'QR Kodu Göster'}
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
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 4px', fontWeight: 600 }}>
                    Kasada bu QR kodu tarat
                  </p>
                  {/* Metadata chips */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: `${cfg.color}18`, border: `1.5px solid ${cfg.color}`, fontSize: 10, fontWeight: 900, color: cfg.color }}>
                      {cfg.label}
                    </span>
                    {item.points > 0 && (
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1.5px solid #f59e0b', fontSize: 10, fontWeight: 900, color: '#d97706' }}>
                        {item.points} puan
                      </span>
                    )}
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(107,114,128,0.1)', border: '1.5px solid #9ca3af', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {item.code}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Action buttons ── */}
          {!isUsed && !isExpired && (
            !confirmUse ? (
              <button
                onClick={() => setConfirmUse(true)}
                style={{
                  width: '100%', padding: '14px', borderRadius: 16,
                  background: 'var(--card-bg)', color: 'var(--text-muted)',
                  border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)',
                  fontWeight: 900, fontSize: 14, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
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
