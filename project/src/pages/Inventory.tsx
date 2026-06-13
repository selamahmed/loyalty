import React, { useState } from 'react';
import { Search, ChevronRight, ChevronDown, Clock } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import InventoryDetailModal from '../components/InventoryDetailModal';
import StickerAccent from '../components/StickerAccent';
import StickerHero from '../components/StickerHero';
import { playSound } from '../lib/sounds';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const typeConfig: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Kupon', emoji: '🏷️' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Bilet', emoji: '🎫' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Ödül', emoji: '🎁' },
};

const tabs = [
  { id: 'all', label: 'Tümü', emoji: '🗂️' },
  { id: 'coupon', label: 'Kupon', emoji: '🏷️' },
  { id: 'ticket', label: 'Bilet', emoji: '🎫' },
  { id: 'reward', label: 'Ödül', emoji: '🎁' },
];

type InvItem = ReturnType<typeof useInventory>['items'][number];

const WalletCard: React.FC<{ item: InvItem; onClick: () => void; dimmed?: boolean }> = ({ item, onClick, dimmed }) => {
  const cfg = typeConfig[item.type] || typeConfig.reward;
  const expired = new Date(item.expires) < new Date();
  const days = Math.max(0, Math.ceil((new Date(item.expires).getTime() - Date.now()) / 86400000));
  const urgency = !expired && !item.used && days <= 3;

  return (
    <button
      className="press-card"
      onClick={() => { playSound('click'); onClick(); }}
      style={{
        width: '100%', display: 'flex', alignItems: 'stretch', overflow: 'hidden',
        background: 'var(--card-bg)',
        border: `2.5px solid ${urgency ? '#f59e0b' : 'var(--dark-border)'}`,
        boxShadow: urgency ? '0 4px 0 #d97706' : '0 4px 0 var(--dark-border)',
        borderRadius: 16, cursor: 'pointer', textAlign: 'left',
        opacity: dimmed ? 0.55 : 1,
        position: 'relative',
      }}
    >
      {/* Color strip */}
      <div style={{ width: 5, flexShrink: 0, background: cfg.color }} />

      {/* Thumbnail */}
      <div style={{
        width: 72, flexShrink: 0, position: 'relative', overflow: 'hidden',
        borderRight: '2px solid var(--dark-border)',
      }}>
        {item.image ? (
          <img src={item.image} alt="" style={{ width: '100%', height: '100%', minHeight: 80, objectFit: 'cover', display: 'block', filter: dimmed ? 'grayscale(80%)' : 'none' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', minHeight: 80, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>
            {cfg.emoji}
          </div>
        )}
        {expired && !item.used && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 8, fontWeight: 900, color: 'white', background: '#ef4444', padding: '2px 6px', borderRadius: 4 }}>DOLDU</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, padding: '10px 12px', minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{
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
        <p style={{
          fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 3px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          textDecoration: item.used ? 'line-through' : 'none',
        }}>
          {item.title}
        </p>
        <p style={{
          fontFamily: 'monospace', fontSize: 10, color: cfg.color, fontWeight: 700, margin: '0 0 4px',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {item.code}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
            <Clock size={10} />
            {item.used ? 'Tamamlandı' : expired ? 'Süresi doldu' : `${days} gün kaldı`}
          </span>
          {!item.used && !expired && (
            <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--primary-blue)' }}>Göster →</span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', paddingRight: 10, flexShrink: 0 }}>
        <ChevronRight size={16} color="var(--text-muted)" />
      </div>
    </button>
  );
};

const Inventory: React.FC = () => {
  const { items } = useInventory();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUsed, setShowUsed] = useState(false);

  const filtered = items
    .filter(i => activeTab === 'all' || i.type === activeTab)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

  const active = filtered.filter(i => !i.used && new Date(i.expires) >= new Date());
  const expired = filtered.filter(i => !i.used && new Date(i.expires) < new Date());
  const used = filtered.filter(i => i.used);
  const selectedItem = items.find(i => i.id === selectedId);

  const counts = {
    all: items.filter(i => !i.used).length,
    coupon: items.filter(i => i.type === 'coupon' && !i.used).length,
    ticket: items.filter(i => i.type === 'ticket' && !i.used).length,
    reward: items.filter(i => i.type === 'reward' && !i.used).length,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12,
    background: 'var(--tab-bg)', color: 'var(--text-dark)',
    border: '2.5px solid var(--dark-border)', boxShadow: '0 2px 0 var(--dark-border)',
    fontWeight: 700, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{`
        .inv-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 3px;
          -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .inv-tabs::-webkit-scrollbar { display: none; }
        .inv-tab { scroll-snap-align: center; flex: 1; min-width: 0; }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>CÜZDAN</div>
      </div>

      <div
        className="page-enter p-3 sm:p-4 max-w-lg mx-auto overflow-x-hidden"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        {/* Header */}
        <div>
          <p className="section-label">🎫 ENVANTER</p>
          <h1 className="section-title" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>Biletlerim</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '4px 0 0' }}>
            Kazandığın kupon ve biletleri burada kullan
          </p>
        </div>

        <StickerHero
          page="inventory"
          bg="linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)"
          badge="🎫 ENVANTER"
          title="Biletlerin"
          highlight="burada!"
          accentSeed="inv-hero-accent"
        />

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[
            { label: 'Aktif', value: counts.all, color: '#7B6EF6', emoji: '✨' },
            { label: 'Kupon', value: counts.coupon, color: '#3b82f6', emoji: '🏷️' },
            { label: 'Bilet', value: counts.ticket, color: '#f59e0b', emoji: '🎫' },
            { label: 'Ödül', value: counts.reward, color: '#22c55e', emoji: '🎁' },
          ].map(s => (
            <div key={s.label} style={{
              ...card, padding: '10px 6px', textAlign: 'center', borderRadius: 14,
              boxShadow: '0 3px 0 var(--dark-border)',
            }}>
              <div style={{ fontSize: 16, marginBottom: 2 }}>{s.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 16, color: s.color, margin: '0 0 1px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 8, fontWeight: 800, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* How to use */}
        <div style={{ ...card, padding: '12px 14px', borderRadius: 16, boxShadow: '0 4px 0 var(--dark-border)' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            Nasıl kullanılır?
          </p>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Bilete tıkla', 'Kodu göster', 'Ürünü al'].map((step, i) => (
              <div key={step} style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 7, margin: '0 auto 4px',
                  background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 900, color: 'var(--primary-blue)',
                }}>{i + 1}</div>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-dark)', margin: 0, lineHeight: 1.3 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="search"
            placeholder="Bilet veya kod ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={inputStyle}
          />
        </div>

        {/* iOS segmented tabs */}
        <div style={{ ...card, padding: 4, borderRadius: 14, boxShadow: '0 3px 0 var(--dark-border)' }}>
          <div className="inv-tabs">
            {tabs.map(tab => {
              const on = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  className="inv-tab"
                  onClick={() => { playSound('click'); setActiveTab(tab.id); }}
                  style={{
                    padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: on ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'transparent',
                    color: on ? 'white' : 'var(--text-muted)',
                    fontWeight: 900, fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    transition: 'all 0.15s', position: 'relative',
                  }}
                >
                  {on && <StickerAccent seed={`inv-tab-${tab.id}`} size={14} rotate={10} style={{ position: 'absolute', top: -4, right: 2 }} />}
                  <span style={{ fontSize: 14 }}>{tab.emoji}</span>
                  <span>{tab.label}</span>
                  {counts[tab.id as keyof typeof counts] > 0 && (
                    <span style={{
                      fontSize: 8, padding: '1px 5px', borderRadius: 999,
                      background: on ? 'rgba(255,255,255,0.25)' : 'var(--tab-bg)',
                      color: on ? 'white' : 'var(--text-muted)',
                    }}>
                      {counts[tab.id as keyof typeof counts]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Active wallet list */}
        {active.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Aktif ({active.length})
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {active.map(item => (
                <WalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ ...card, padding: 40, textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ fontSize: 36, margin: '0 0 10px' }}>🎫</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 4px' }}>
              {search ? 'Sonuç bulunamadı' : 'Henüz bilet yok'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, fontWeight: 600 }}>
              {search ? 'Farklı bir arama dene.' : 'Mağazadan puan harca, bilet kazan!'}
            </p>
          </div>
        )}

        {/* Expired */}
        {expired.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
              Süresi Dolan ({expired.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {expired.map(item => (
                <WalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} dimmed />
              ))}
            </div>
          </div>
        )}

        {/* Used */}
        {used.length > 0 && (
          <div>
            <button
              onClick={() => { playSound('click'); setShowUsed(s => !s); }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 12px', borderRadius: 12, cursor: 'pointer',
                background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                marginBottom: showUsed ? 8 : 0,
              }}
            >
              <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Kullanılan ({used.length})
              </span>
              <ChevronDown size={16} color="var(--text-muted)" style={{ transform: showUsed ? 'rotate(180deg)' : '', transition: 'transform 0.2s' }} />
            </button>
            {showUsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {used.map(item => (
                  <WalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} dimmed />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <InventoryDetailModal item={selectedItem} onClose={() => setSelectedId(null)} />
      )}
    </div>
  );
};

export default Inventory;
