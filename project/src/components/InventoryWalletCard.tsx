import React from 'react';
import { ChevronRight, Clock } from 'lucide-react';
import type { InventoryItem } from '../context/InventoryContext';
import { formatRedemptionCode } from '../lib/redemptionCode';
import { playSound } from '../lib/sounds';

export const inventoryTypeConfig: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Kupon', emoji: '🏷️' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Bilet', emoji: '🎫' },
  reward: { color: '#fbbf24', bg: 'rgba(251,191,36,0.14)', label: 'Ödül', emoji: '🎁' },
};

export const getDaysLeft = (expires: string) =>
  Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / 86400000));

function getTimeLeft(expires: string) {
  const expiryTime = new Date(expires).getTime();
  if (!Number.isFinite(expiryTime)) {
    return { expired: true, days: 0, hours: 0, minutes: 0, label: 'Süre yok' };
  }

  const diff = expiryTime - Date.now();
  if (diff <= 0) {
    return { expired: true, days: 0, hours: 0, minutes: 0, label: 'Süresi doldu' };
  }

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const label = days > 0
    ? `${days} gün ${hours} sa`
    : hours > 0
      ? `${hours} sa ${minutes} dk`
      : `${Math.max(1, minutes)} dk`;

  return { expired: false, days, hours, minutes, label };
}

function getTimeProgress(createdAt: string, expires: string, now: number): number {
  const expiryTime = new Date(expires).getTime();
  const createdTime = new Date(createdAt).getTime();

  if (!Number.isFinite(expiryTime)) return 0;

  const startTime = Number.isFinite(createdTime)
    ? Math.min(createdTime, expiryTime)
    : now - 30 * 86400000;

  const total = Math.max(1, expiryTime - startTime);
  const remaining = Math.max(0, expiryTime - now);
  return Math.max(0, Math.min(100, (remaining / total) * 100));
}

interface InventoryWalletCardProps {
  item: InventoryItem;
  onSelect: (id: string) => void;
  dimmed?: boolean;
  compact?: boolean;
}

const InventoryWalletCard = React.memo(function InventoryWalletCard({ item, onSelect, dimmed, compact }: InventoryWalletCardProps) {
  const cfg = inventoryTypeConfig[item.type] || inventoryTypeConfig.reward;
  const [nowTick, setNowTick] = React.useState(Date.now());
  const timeLeft = React.useMemo(() => getTimeLeft(item.expires), [item.expires, nowTick]);
  const progressPct = React.useMemo(
    () => getTimeProgress(item.createdAt, item.expires, nowTick),
    [item.createdAt, item.expires, nowTick],
  );
  const expired = item.used || timeLeft.expired;
  const days = timeLeft.days;
  const urgency = !expired && !item.used && (days <= 3 || timeLeft.hours < 24);

  React.useEffect(() => {
    if (item.used || timeLeft.expired) return undefined;
    const intervalMs = timeLeft.days > 0 ? 60000 : timeLeft.hours > 0 ? 10000 : 1000;
    const timer = window.setInterval(() => setNowTick(Date.now()), intervalMs);
    return () => window.clearInterval(timer);
  }, [item.used, timeLeft.days, timeLeft.expired]);

  return (
    <button
      type="button"
      className={`press-card inventory-wallet-card ${compact ? 'inventory-wallet-card--compact' : ''} ${dimmed ? 'inventory-wallet-card--dimmed' : ''} ${expired ? 'inventory-wallet-card--expired' : ''} ${urgency ? 'inventory-wallet-card--urgent' : ''}`}
      onClick={() => { playSound('click'); onSelect(item.id); }}
      aria-label={`${item.title}, ${item.code}`}
      style={{
        width: '100%', display: 'flex', alignItems: 'stretch', overflow: 'hidden',
        background: 'var(--card-bg)',
        border: `3px solid ${urgency ? '#f59e0b' : 'var(--dark-border)'}`,
        boxShadow: urgency ? '0 6px 0 #d97706' : '0 6px 0 var(--dark-border)',
        borderRadius: 18, cursor: 'pointer', textAlign: 'left',
        opacity: dimmed ? 0.72 : 1,
        position: 'relative',
      }}
    >
      <div className="inventory-wallet-card__stripe" style={{ width: 5, flexShrink: 0, background: cfg.color }} />

      <div className="inventory-wallet-card__media" style={{
        width: compact ? 68 : 96, flexShrink: 0, position: 'relative', overflow: 'hidden',
        borderRight: '3px solid var(--dark-border)',
      }}>
        {item.image ? (
          <img
            src={item.image}
            alt=""
            loading="lazy"
            decoding="async"
            width={compact ? 68 : 96}
            height={compact ? 76 : 108}
            style={{
              width: '100%', height: '100%', minHeight: compact ? 76 : 108,
              objectFit: 'cover', display: 'block', filter: dimmed ? 'grayscale(80%)' : 'none',
            }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%', minHeight: compact ? 76 : 108,
            background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: compact ? 24 : 28,
          }}>
            {cfg.emoji}
          </div>
        )}
        {expired && (
          <div style={{
            position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: 'white', background: '#ef4444', padding: '2px 6px', borderRadius: 4 }}>
              {item.used ? 'KULLANILDI' : 'DOLDU'}
            </span>
          </div>
        )}
      </div>

      <div className="inventory-wallet-card__body" style={{ flex: 1, padding: compact ? '9px 11px' : '12px 14px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span className="inventory-wallet-card__type" style={{
            fontSize: 8, fontWeight: 900, padding: '2px 7px', borderRadius: 999,
            background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {cfg.emoji} {cfg.label}
          </span>
          {urgency && (
            <span style={{ fontSize: 8, fontWeight: 900, color: '#f59e0b' }}>⚡ {days}g</span>
          )}
          {item.used && (
            <span style={{ fontSize: 8, fontWeight: 900, color: 'var(--text-muted)' }}>Kullanıldı</span>
          )}
        </div>
        <p className="inventory-wallet-card__title" style={{
          fontWeight: 900, fontSize: compact ? 12 : 15, color: 'var(--text-dark)', margin: '0 0 3px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: item.used ? 'line-through' : 'none',
        }}>
          {item.title}
        </p>
        <p className="inventory-wallet-card__code" style={{
          fontFamily: 'monospace', fontSize: 10, color: cfg.color, fontWeight: 700, margin: '0 0 4px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {formatRedemptionCode(item.code)}
        </p>
        <div className="inventory-wallet-card__meta-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span className="inventory-wallet-card__time" style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} />
            {item.used ? 'Tamamlandı' : expired ? 'Süresi doldu' : `${timeLeft.label} kaldı`}
          </span>
          {!item.used && !expired && (
            <span className="inventory-wallet-card__show" style={{ fontSize: 9, fontWeight: 900, color: 'var(--primary-blue)' }}>Göster →</span>
          )}
        </div>
        {!item.used && !expired && (
          <div className="inventory-wallet-card__progress" style={{
            marginTop: 7, height: 5, borderRadius: 999, background: 'var(--tab-bg)',
            border: '1px solid var(--dark-border)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 999, transition: 'width 0.4s ease',
              width: `${progressPct}%`,
              background: urgency ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : `linear-gradient(90deg,${cfg.color},${cfg.color}88)`,
            }} />
          </div>
        )}
      </div>

      <div className="inventory-wallet-card__chevron" style={{ display: 'flex', alignItems: 'center', paddingRight: 10, flexShrink: 0 }}>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
    </button>
  );
});

export default InventoryWalletCard;
