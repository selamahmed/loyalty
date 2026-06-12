import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Clock, Tag, Ticket, Gift, Package, AlertCircle, QrCode } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { InventoryItem, useInventory } from '../context/InventoryContext';
import { InventoryQRCode } from './QRCodeDisplay';

const brutal = {
  border: '3px solid var(--dark-border)',
  shadow: '6px 6px 0 var(--dark-border)',
  shadowSm: '3px 3px 0 var(--dark-border)',
  radius: 20,
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Space Grotesk', system-ui, sans-serif",
};

const typeConfig: Record<string, { color: string; bg: string; icon: LucideIcon; label: string }> = {
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
  const isActive  = !isExpired && !isUsed;
  const accent    = isActive ? cfg.color : '#ef4444';
  const urgent    = countdown.days < 3;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px) saturate(1.3)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.3)',
        padding: 0,
        fontFamily: brutal.font,
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'var(--card-bg)',
        border: brutal.border,
        boxShadow: brutal.shadow,
        borderRadius: `${brutal.radius}px ${brutal.radius}px 0 0`,
        width: '100%', maxWidth: 500, maxHeight: '92vh', overflowY: 'auto',
        borderBottom: 'none',
        animation: 'detailSlideUp 0.38s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Pull bar */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
          <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--dark-border)', opacity: 0.2 }} />
        </div>

        <div style={{ padding: '12px 18px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* ── Ticket card ── */}
          <div style={{
            borderRadius: brutal.radius, overflow: 'visible',
            background: 'var(--card-bg)',
            border: `3px solid ${accent}`,
            boxShadow: `0 6px 0 ${isActive ? accent : '#dc2626'}`,
            position: 'relative',
          }}>
            <button
              onClick={onClose}
              aria-label="Kapat"
              style={{
                position: 'absolute', top: -10, right: -10,
                width: 32, height: 32, borderRadius: 10,
                background: 'var(--card-bg)', border: brutal.border,
                boxShadow: brutal.shadowSm,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', zIndex: 5,
              }}
            >
              <X size={14} color="var(--text-dark)" strokeWidth={2.5} />
            </button>

            {/* Hero image */}
            <div style={{
              position: 'relative', height: 148,
              borderTopLeftRadius: 17, borderTopRightRadius: 17, overflow: 'hidden',
              borderBottom: `2px dashed ${accent}`,
            }}>
              {item.image ? (
                <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isActive ? 1 : 0.4 }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {isActive ? <span style={{ fontSize: 52 }}>🎫</span> : <Package size={48} color="var(--text-muted)" />}
                </div>
              )}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 50%)' }} />
              <span style={{
                position: 'absolute', top: 10, left: 10,
                padding: '4px 10px', borderRadius: 99,
                background: accent, color: '#fff',
                fontSize: 10, fontWeight: 800,
                display: 'flex', alignItems: 'center', gap: 4,
                border: '2px solid var(--dark-border)', boxShadow: '2px 2px 0 var(--dark-border)',
              }}>
                <IconComp size={10} color="#fff" /> {cfg.label}
              </span>
              <p className="font-display" style={{
                position: 'absolute', bottom: 12, left: 14, right: 14,
                fontWeight: 900, fontSize: 19, color: '#fff', margin: 0, lineHeight: 1.15,
              }}>
                {item.title}
              </p>
              {!isActive && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{
                    background: '#ef4444', color: '#fff', padding: '6px 16px',
                    borderRadius: 99, fontSize: 13, fontWeight: 800,
                    border: '2px solid var(--dark-border)', boxShadow: '3px 3px 0 var(--dark-border)',
                  }}>
                    {isUsed ? '✓ Kullanıldı' : '✗ Süresi Doldu'}
                  </span>
                </div>
              )}
            </div>

            {/* Ticket notches */}
            <div style={{ position: 'relative', height: 0, overflow: 'visible', zIndex: 3 }}>
              <div style={{ position: 'absolute', left: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-color)', border: `2px solid ${accent}` }} />
              <div style={{ position: 'absolute', right: -12, top: -12, width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-color)', border: `2px solid ${accent}` }} />
            </div>

            {/* QR + Code redeem area */}
            <div style={{ padding: '16px 14px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 12, justifyContent: 'center' }}>
                <QrCode size={13} color={accent} />
                <p style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>
                  {isActive ? 'Kasiyere Göster' : isUsed ? 'Kullanıldı' : 'Süresi Doldu'}
                </p>
              </div>

              <div style={{
                display: 'flex', gap: 12, alignItems: 'stretch',
                flexDirection: 'row',
              }}>
                {/* QR — always visible when active */}
                {isActive && (
                  <div style={{
                    flexShrink: 0, background: '#fff', padding: 8,
                    borderRadius: 14, border: brutal.border, boxShadow: brutal.shadowSm,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <InventoryQRCode item={item} size={120} />
                  </div>
                )}

                {/* Code */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div
                    onClick={isActive ? handleCopy : undefined}
                    style={{
                      padding: '14px 12px', borderRadius: 14,
                      background: isActive ? 'var(--tab-bg)' : 'var(--card-bg)',
                      border: isActive ? `2.5px dashed ${accent}` : `2px solid var(--dark-border)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
                      cursor: isActive ? 'pointer' : 'default',
                      transition: 'transform 0.12s',
                    }}
                    onMouseDown={e => { if (isActive) e.currentTarget.style.transform = 'translateY(1px)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = ''; }}
                  >
                    <span style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                      fontSize: 16, fontWeight: 800,
                      color: isActive ? 'var(--text-dark)' : 'var(--text-muted)',
                      letterSpacing: '0.08em', flex: 1, textAlign: 'center',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {item.code}
                    </span>
                    {isActive && (
                      <div style={{
                        width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                        background: copied ? 'rgba(34,197,94,0.15)' : cfg.bg,
                        border: `2px solid ${copied ? '#22c55e' : accent}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}>
                        {copied ? <Check size={15} color="#22c55e" strokeWidth={2.5} /> : <Copy size={15} color={accent} />}
                      </div>
                    )}
                  </div>
                  {isActive && (
                    <p style={{ fontSize: 10, color: accent, fontWeight: 600, textAlign: 'center', margin: '8px 0 0', lineHeight: 1.4 }}>
                      QR tara veya koda dokunarak kopyala
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {item.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0, lineHeight: 1.55, padding: '0 2px' }}>
              {item.description}
            </p>
          )}

          {/* Countdown */}
          {isActive ? (
            <div style={{
              padding: '14px 14px 12px',
              background: urgent ? 'rgba(239,68,68,0.06)' : 'var(--tab-bg)',
              border: brutal.border, borderRadius: 16, boxShadow: brutal.shadowSm,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Clock size={14} color={urgent ? '#ef4444' : accent} />
                <span style={{
                  fontSize: 11, fontWeight: 800,
                  color: urgent ? '#ef4444' : accent,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {urgent ? 'Yakında bitiyor' : 'Kalan süre'}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 6 }}>
                {[
                  { val: countdown.days,    label: 'Gün' },
                  { val: countdown.hours,   label: 'Saat' },
                  { val: countdown.minutes, label: 'Dk' },
                  { val: countdown.seconds, label: 'Sn' },
                ].map(({ val, label }) => (
                  <div key={label} style={{
                    background: 'var(--card-bg)', border: '2px solid var(--dark-border)',
                    boxShadow: '2px 2px 0 var(--dark-border)',
                    borderRadius: 10, padding: '9px 4px', textAlign: 'center',
                  }}>
                    <p style={{
                      fontWeight: 900, fontSize: 20, margin: '0 0 2px', lineHeight: 1,
                      color: urgent ? '#ef4444' : 'var(--text-dark)',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    }}>
                      {String(val).padStart(2, '0')}
                    </p>
                    <p style={{ fontSize: 8, color: 'var(--text-muted)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '10px 0 0', textAlign: 'center', fontWeight: 500 }}>
                Son kullanım: {new Date(item.expires).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          ) : (
            <div style={{
              padding: '14px 16px', background: 'rgba(239,68,68,0.06)',
              border: '3px solid #ef4444', boxShadow: '0 4px 0 #dc2626',
              borderRadius: 16, display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <AlertCircle size={18} color="#ef4444" />
              <p style={{ fontWeight: 800, fontSize: 13, color: '#ef4444', margin: 0 }}>
                {isUsed ? 'Bu bilet zaten kullanıldı.' : 'Bu biletin süresi doldu.'}
              </p>
            </div>
          )}

          {/* Mark used */}
          {isActive && (
            !confirmUse ? (
              <button
                onClick={() => setConfirmUse(true)}
                style={{
                  width: '100%', padding: '13px', borderRadius: 14,
                  background: 'var(--card-bg)', color: 'var(--text-muted)',
                  border: brutal.border, boxShadow: brutal.shadowSm,
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                }}
              >
                <Check size={16} /> Kullanıldı olarak işaretle
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => setConfirmUse(false)}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 12,
                    background: 'var(--card-bg)', color: 'var(--text-muted)',
                    border: brutal.border, boxShadow: brutal.shadowSm,
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  İptal
                </button>
                <button
                  onClick={handleMarkUsed}
                  style={{
                    flex: 2, padding: '12px', borderRadius: 12,
                    background: '#22c55e', color: '#fff',
                    border: brutal.border, boxShadow: '0 4px 0 #16a34a',
                    fontWeight: 800, fontSize: 13, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Check size={15} strokeWidth={2.5} /> Evet, kullanıldı
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
      `}</style>
    </div>
  );
};

export default InventoryDetailModal;
