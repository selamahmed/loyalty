import React, { useState, useEffect } from 'react';
import { Package, Ticket, Tag, Gift, Check, Copy, Clock, X, QrCode, Star, Hash, Calendar, Layers } from 'lucide-react';
import { inventory as initialInventory } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

type InventoryItem = typeof initialInventory[0];

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const tabs = [
  { id: 'all',    label: tr.inventory.allItems, emoji: '🗂️' },
  { id: 'coupon', label: tr.inventory.coupons,  emoji: '🏷️' },
  { id: 'ticket', label: tr.inventory.tickets,  emoji: '🎫' },
  { id: 'reward', label: tr.inventory.rewards,  emoji: '🎁' },
];

const typeConfig: Record<string, { color: string; bg: string; accent: string; label: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.15)',  accent: '#3b82f6', label: 'Kupon' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)',  accent: '#f59e0b', label: 'Bilet' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)',   accent: '#22c55e', label: 'Ödül' },
};

function useCountdown(expiresStr: string) {
  const calc = () => {
    const diff = new Date(expiresStr).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    const days    = Math.floor(diff / 86400000);
    const hours   = Math.floor((diff % 86400000) / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return { days, hours, minutes, seconds, expired: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(t);
  }, [expiresStr]);
  return time;
}

/* ── Detail modal ── */
const DetailModal: React.FC<{ item: InventoryItem; onClose: () => void; onCopy: (code: string) => void; copiedCode: string | null }> = ({ item, onClose, onCopy, copiedCode }) => {
  const cfg = typeConfig[item.type] || typeConfig.reward;
  const countdown = useCountdown(item.expires);
  const [showQR, setShowQR] = useState(false);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(item.code)}&size=220x220&bgcolor=ffffff&color=000000&margin=10`;

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: '0' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        ...card,
        width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto',
        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
        borderBottom: 'none',
        animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        {/* Image header */}
        <div style={{ position: 'relative', height: 200, overflow: 'hidden', borderRadius: '17px 17px 0 0' }}>
          <img
            src={item.image}
            alt={item.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=400'; }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />

          {/* Type badge */}
          <div style={{ position: 'absolute', top: 14, left: 14, padding: '4px 12px', borderRadius: 999, background: cfg.bg, border: `2px solid ${cfg.accent}`, fontSize: 11, fontWeight: 900, color: cfg.color }}>
            {cfg.label}
          </div>

          {/* Close button */}
          <button onClick={onClose} style={{
            position: 'absolute', top: 12, right: 12, width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(0,0,0,0.5)', border: '2px solid rgba(255,255,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)',
          }}>
            <X size={16} color="white" />
          </button>

          {/* Used badge */}
          {item.used && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: 16, fontWeight: 900, color: 'white', background: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: 999, border: '2px solid rgba(255,255,255,0.3)' }}>✅ KULLANILDI</span>
            </div>
          )}

          {/* Title overlay */}
          <div style={{ position: 'absolute', bottom: 14, left: 16, right: 16 }}>
            <h2 style={{ color: 'white', fontWeight: 900, fontSize: 20, margin: 0, lineHeight: 1.2, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>{item.title}</h2>
          </div>
        </div>

        <div style={{ padding: '20px 20px 28px' }}>
          {/* Description */}
          <p style={{ color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6, margin: '0 0 18px' }}>{item.description}</p>

          {/* Info row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
            <div style={{ padding: '12px 14px', background: 'var(--tab-bg)', borderRadius: 14, border: '2px solid var(--dark-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Star size={12} color="#f59e0b" />
                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Değer</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: '#f59e0b' }}>{item.points} Puan</span>
            </div>
            <div style={{ padding: '12px 14px', background: 'var(--tab-bg)', borderRadius: 14, border: '2px solid var(--dark-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <Layers size={12} color="var(--text-muted)" />
                <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Adet</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)' }}>×{item.quantity}</span>
            </div>
          </div>

          {/* Countdown timer */}
          {!item.used && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <Clock size={13} color={countdown.expired ? '#ef4444' : 'var(--text-muted)'} />
                <span style={{ fontSize: 11, fontWeight: 900, color: countdown.expired ? '#ef4444' : 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {countdown.expired ? 'Süresi Doldu' : 'Kalan Süre'}
                </span>
              </div>
              {countdown.expired ? (
                <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', borderRadius: 14, textAlign: 'center' }}>
                  <span style={{ fontWeight: 900, color: '#ef4444', fontSize: 14 }}>Bu kuponun süresi doldu</span>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                  {[
                    { val: countdown.days,    label: 'Gün' },
                    { val: countdown.hours,   label: 'Saat' },
                    { val: countdown.minutes, label: 'Dak' },
                    { val: countdown.seconds, label: 'Sn' },
                  ].map(t => (
                    <div key={t.label} style={{ textAlign: 'center', padding: '10px 6px', background: 'var(--tab-bg)', borderRadius: 12, border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)' }}>
                      <p style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: '0 0 2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{String(t.val).padStart(2, '0')}</p>
                      <p style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t.label}</p>
                    </div>
                  ))}
                </div>
              )}
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600, textAlign: 'center' }}>
                <Calendar size={10} style={{ display: 'inline', marginRight: 4 }} />
                Son kullanım: {new Date(item.expires).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}

          {/* Code section */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Hash size={13} color="var(--text-muted)" />
              <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Kod</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, padding: '12px 14px', background: 'var(--tab-bg)', borderRadius: 12, border: '2px dashed var(--dark-border)' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '0.12em', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.code}</span>
              </div>
              <button
                onClick={() => { onCopy(item.code); playSound('success'); }}
                disabled={item.used}
                style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: copiedCode === item.code ? 'rgba(34,197,94,0.12)' : 'var(--tab-bg)',
                  border: `2.5px solid ${copiedCode === item.code ? '#22c55e' : 'var(--dark-border)'}`,
                  boxShadow: '0 3px 0 var(--dark-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: item.used ? 'not-allowed' : 'pointer',
                }}
              >
                {copiedCode === item.code ? <Check size={18} color="#22c55e" /> : <Copy size={18} color="var(--text-muted)" />}
              </button>
            </div>
          </div>

          {/* QR Code section */}
          {!item.used && (
            <div>
              <button
                onClick={() => { setShowQR(v => !v); playSound('click'); }}
                style={{
                  width: '100%', padding: '13px', borderRadius: 14, fontWeight: 900, fontSize: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: showQR ? 'var(--tab-bg)' : 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))',
                  color: showQR ? 'var(--text-dark)' : 'white',
                  border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <QrCode size={18} />
                {showQR ? 'QR Kodunu Gizle' : 'QR Kodu Oluştur'}
              </button>

              {showQR && (
                <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '20px', background: 'var(--tab-bg)', borderRadius: 16, border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', animation: 'fadeIn 0.25s ease' }}>
                  <div style={{ background: 'white', padding: 12, borderRadius: 16, border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)' }}>
                    <img
                      src={qrUrl}
                      alt={`QR Code for ${item.code}`}
                      style={{ width: 200, height: 200, display: 'block', borderRadius: 8 }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, textAlign: 'center', margin: 0 }}>
                    Bu QR kodu kasada tara ve ödülünü kullan
                  </p>
                  <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: cfg.color, padding: '4px 14px', background: cfg.bg, border: `1.5px solid ${cfg.accent}`, borderRadius: 999 }}>{item.code}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

/* ── Main page ── */
const Inventory: React.FC = () => {
  const [inventory] = useState(initialInventory);
  const [activeTab, setActiveTab]   = useState('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [selected, setSelected]     = useState<InventoryItem | null>(null);

  const filtered = activeTab === 'all' ? inventory : inventory.filter(i => i.type === activeTab);
  const active   = filtered.filter(i => !i.used);
  const used     = filtered.filter(i => i.used);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {selected && <DetailModal item={selected} onClose={() => setSelected(null)} onCopy={handleCopy} copiedCode={copiedCode} />}

      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>ENVANTER</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 18 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(180deg,#fbbf24,#d97706)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🗂️</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{tr.inventory.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Kuponların, biletlerin ve ödüllerin</p>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => { playSound('click'); setActiveTab(tab.id); }} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '9px 15px',
              borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer',
              flexShrink: 0, whiteSpace: 'nowrap', transition: 'all 0.1s',
              background: activeTab === tab.id ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
              color: activeTab === tab.id ? 'white' : 'var(--text-dark)',
              border: '3px solid var(--dark-border)',
              boxShadow: activeTab === tab.id ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
            }}>
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Active items grid */}
        {active.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Aktif</p>
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', fontSize: 11, fontWeight: 900 }}>{active.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
              {active.map((item, idx) => {
                const cfg = typeConfig[item.type] || typeConfig.reward;
                const expired = isExpired(item.expires);
                return (
                  <div
                    key={item.id}
                    onClick={() => { playSound('click'); setSelected(item); }}
                    style={{
                      ...card,
                      overflow: 'hidden', cursor: 'pointer', opacity: expired ? 0.7 : 1,
                      transition: 'transform 0.15s, box-shadow 0.15s',
                      animation: `cardPop 0.3s ease-out ${idx * 0.05}s both`,
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 0 var(--dark-border)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 6px 0px var(--dark-border)'; }}
                  >
                    {/* Image */}
                    <div style={{ position: 'relative', height: 110, overflow: 'hidden' }}>
                      <img
                        src={item.image}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).src = 'https://images.pexels.com/photos/1251175/pexels-photo-1251175.jpeg?auto=compress&cs=tinysrgb&w=300'; }}
                      />
                      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                      {/* Type tag */}
                      <div style={{ position: 'absolute', top: 7, left: 7, padding: '2px 7px', borderRadius: 999, background: cfg.bg, border: `1.5px solid ${cfg.accent}`, fontSize: 9, fontWeight: 900, color: cfg.color, backdropFilter: 'blur(4px)' }}>
                        {cfg.label}
                      </div>
                      {/* Qty badge */}
                      {item.quantity > 1 && (
                        <div style={{ position: 'absolute', top: 7, right: 7, width: 20, height: 20, borderRadius: '50%', background: '#7B6EF6', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, color: 'white' }}>×{item.quantity}</div>
                      )}
                      {/* Expired overlay */}
                      {expired && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 9, fontWeight: 900, color: 'white', background: '#ef4444', padding: '2px 8px', borderRadius: 999 }}>SÜRESI DOLDU</span>
                        </div>
                      )}
                      {/* QR hint icon */}
                      <div style={{ position: 'absolute', bottom: 7, right: 7, width: 24, height: 24, borderRadius: 7, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
                        <QrCode size={12} color="white" />
                      </div>
                    </div>

                    {/* Info */}
                    <div style={{ padding: '10px 11px 12px' }}>
                      <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: '0 0 4px', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</p>
                      {/* Countdown mini */}
                      {!expired && (
                        <MiniCountdown expires={item.expires} accentColor={cfg.color} />
                      )}
                      {/* Code */}
                      <div style={{ marginTop: 7, padding: '5px 8px', background: 'var(--tab-bg)', borderRadius: 7, border: '1.5px dashed var(--dark-border)' }}>
                        <span style={{ fontFamily: 'monospace', fontSize: 10, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '0.08em', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.code}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ ...card, border: '3px dashed var(--dark-border)', padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>📦</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 6px' }}>Henüz ürün yok</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Görevleri tamamla ve ödülleri kullan.</p>
          </div>
        )}

        {/* Used items */}
        {used.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Kullanılan</p>
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', fontSize: 11, fontWeight: 900, color: 'var(--text-muted)' }}>{used.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {used.map(item => {
                const cfg = typeConfig[item.type] || typeConfig.reward;
                return (
                  <div key={item.id} onClick={() => { playSound('click'); setSelected(item); }} style={{ ...card, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5, cursor: 'pointer', overflow: 'hidden' }}>
                    <img src={item.image} alt={item.title} style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '2px solid var(--dark-border)', filter: 'grayscale(80%)' }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</span>
                    </div>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', flexShrink: 0 }}>Kullanıldı</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ height: 16 }} />
      </div>

      <style>{`
        @keyframes cardPop {
          from { opacity: 0; transform: scale(0.93) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
};

/* Mini countdown badge on card */
const MiniCountdown: React.FC<{ expires: string; accentColor: string }> = ({ expires, accentColor }) => {
  const { days, hours, expired } = useCountdown(expires);
  if (expired) return <span style={{ fontSize: 9, color: '#ef4444', fontWeight: 900 }}>Süresi doldu</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      <Clock size={9} color={accentColor} />
      <span style={{ fontSize: 9, fontWeight: 900, color: accentColor }}>
        {days > 0 ? `${days}g ${hours}s` : `${hours}s kaldı`}
      </span>
    </div>
  );
};

export default Inventory;
