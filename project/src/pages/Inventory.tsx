import React, { useState } from 'react';
import { Package, Ticket, Tag, Gift, Search, Filter } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import InventoryDetailModal from '../components/InventoryDetailModal';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const typeConfig: Record<string, { color: string; bg: string; accent: string; label: string; emoji: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', accent: '#3b82f6', label: 'Kupon',  emoji: '🏷️' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b', label: 'Bilet',  emoji: '🎫' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  accent: '#22c55e', label: 'Ödül',   emoji: '🎁' },
};

const tabs = [
  { id: 'all',    label: 'Tümü',    emoji: '🗂️' },
  { id: 'coupon', label: 'Kuponlar', emoji: '🏷️' },
  { id: 'ticket', label: 'Biletler', emoji: '🎫' },
  { id: 'reward', label: 'Ödüller', emoji: '🎁' },
];

const Inventory: React.FC = () => {
  const { items } = useInventory();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUsed, setShowUsed] = useState(false);

  const filtered = items
    .filter(i => (activeTab === 'all' || i.type === activeTab))
    .filter(i => showUsed || !i.used)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

  const active = filtered.filter(i => !i.used);
  const used   = filtered.filter(i => i.used);

  const selectedItem = items.find(i => i.id === selectedId);

  const isExpired = (d: string) => new Date(d) < new Date();
  const daysLeft  = (d: string) => Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 86400000));

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>ENVANTER</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 52, height: 52, borderRadius: 16, flexShrink: 0,
              background: 'linear-gradient(180deg,#fbbf24,#d97706)',
              border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>🗂️</div>
            <div>
              <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{tr.inventory.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>{active.length} aktif ürün</p>
            </div>
          </div>
          {/* Stats pill */}
          <div style={{ ...card, padding: '8px 14px', textAlign: 'center', boxShadow: '0 4px 0 var(--dark-border)', flexShrink: 0 }}>
            <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary-blue)', margin: '0 0 1px', lineHeight: 1 }}>{active.length}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Aktif</p>
          </div>
        </div>

        {/* ── Search ── */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Ürün veya kod ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '12px 14px 12px 42px', borderRadius: 14,
              background: 'var(--tab-bg)', color: 'var(--text-dark)',
              border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
              fontWeight: 700, fontSize: 13, outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
                borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer',
                flexShrink: 0, whiteSpace: 'nowrap', transition: 'all 0.1s',
                background: activeTab === tab.id ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
                color: activeTab === tab.id ? 'white' : 'var(--text-dark)',
                border: '3px solid var(--dark-border)',
                boxShadow: activeTab === tab.id ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
              }}
            >
              <span>{tab.emoji}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* ── Active items grid ── */}
        {active.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Aktif</p>
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', fontSize: 11, fontWeight: 900 }}>{active.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 12 }}>
              {active.map(item => {
                const cfg = typeConfig[item.type] || typeConfig.reward;
                const expired  = isExpired(item.expires);
                const days     = daysLeft(item.expires);
                const urgency  = !expired && days <= 3;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    style={{
                      ...card,
                      border: urgency ? '3px solid #f59e0b' : '3px solid var(--dark-border)',
                      boxShadow: urgency ? '0 6px 0 #d97706' : '0 6px 0 var(--dark-border)',
                      padding: 0, cursor: 'pointer', textAlign: 'left', overflow: 'hidden',
                      transition: 'transform 0.12s, box-shadow 0.12s',
                      animation: 'invCardIn 0.3s ease-out both',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = urgency ? '0 9px 0 #d97706' : '0 9px 0 var(--dark-border)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = urgency ? '0 6px 0 #d97706' : '0 6px 0 var(--dark-border)'; }}
                    onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
                    onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = urgency ? '0 6px 0 #d97706' : '0 6px 0 var(--dark-border)'; }}
                  >
                    {/* Item image */}
                    <div style={{ position: 'relative', height: 110, overflow: 'hidden', borderBottom: '3px solid var(--dark-border)' }}>
                      {item.image ? (
                        <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
                          {cfg.emoji}
                        </div>
                      )}
                      {/* Type badge */}
                      <span style={{ position: 'absolute', top: 7, left: 7, padding: '3px 8px', borderRadius: 999, background: cfg.color, color: 'white', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' }}>
                        {cfg.label}
                      </span>
                      {/* Quantity badge */}
                      {(item.quantity ?? 1) > 1 && (
                        <span style={{ position: 'absolute', top: 7, right: 7, padding: '3px 8px', borderRadius: 999, background: 'rgba(0,0,0,0.65)', color: 'white', fontSize: 10, fontWeight: 900 }}>
                          ×{item.quantity}
                        </span>
                      )}
                      {/* Urgency overlay */}
                      {urgency && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: 7 }}>
                          <span style={{ background: '#f59e0b', color: 'white', padding: '2px 8px', borderRadius: 999, fontSize: 9, fontWeight: 900 }}>⚡ {days} gün kaldı!</span>
                        </div>
                      )}
                      {expired && (
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ background: '#ef4444', color: 'white', padding: '4px 10px', borderRadius: 999, fontSize: 10, fontWeight: 900 }}>Süresi Doldu</span>
                        </div>
                      )}
                    </div>
                    {/* Card body */}
                    <div style={{ padding: '10px 12px' }}>
                      <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{item.title}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: 10, color: cfg.color, fontWeight: 700, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.code}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>
                          {expired ? '❌ Doldu' : `📅 ${days}g`}
                        </span>
                        <span style={{ fontSize: 9, fontWeight: 900, color: 'var(--primary-blue)', display: 'flex', alignItems: 'center', gap: 2 }}>
                          👀 Detay
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ ...card, border: '3px dashed var(--dark-border)', padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>📦</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 6px' }}>
              {search ? 'Sonuç bulunamadı' : 'Henüz ürün yok'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
              {search ? 'Farklı bir arama dene.' : 'Görevleri tamamla ve ödülleri kullan.'}
            </p>
          </div>
        )}

        {/* ── Used items ── */}
        {used.length > 0 && (
          <div>
            <button
              onClick={() => setShowUsed(s => !s)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                {showUsed ? '▼' : '▶'} Kullanılan ({used.length})
              </p>
            </button>
            {showUsed && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {used.map(item => {
                  const cfg = typeConfig[item.type] || typeConfig.reward;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      style={{ ...card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5, cursor: 'pointer', textAlign: 'left' }}
                    >
                      {item.image && (
                        <img src={item.image} alt="" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'cover', border: '2px solid var(--dark-border)', flexShrink: 0 }} />
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-muted)', textDecoration: 'line-through', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</p>
                        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text-muted)' }}>{item.code}</span>
                      </div>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', flexShrink: 0 }}>Kullanıldı</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      {selectedItem && (
        <InventoryDetailModal item={selectedItem} onClose={() => setSelectedId(null)} />
      )}

      <style>{`
        @keyframes invCardIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Inventory;
