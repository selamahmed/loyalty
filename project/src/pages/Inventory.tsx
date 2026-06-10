import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import InventoryDetailModal from '../components/InventoryDetailModal';

const typeConfig: Record<string, { color: string; bg: string; label: string; emoji: string }> = {
  coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'Kupon', emoji: '🏷️' },
  ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Bilet', emoji: '🎫' },
  reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Ödül',  emoji: '🎁' },
};

const tabs = [
  { id: 'all',    label: 'Tümü',     emoji: '🗂️' },
  { id: 'coupon', label: 'Kuponlar', emoji: '🏷️' },
  { id: 'ticket', label: 'Biletler', emoji: '🎫' },
  { id: 'reward', label: 'Ödüller',  emoji: '🎁' },
];

/* ── Ticket card ── */
interface TicketCardProps {
  item: ReturnType<typeof useInventory>['items'][number];
  onClick: () => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ item, onClick }) => {
  const cfg     = typeConfig[item.type] || typeConfig.reward;
  const expired = new Date(item.expires) < new Date();
  const days    = Math.max(0, Math.ceil((new Date(item.expires).getTime() - Date.now()) / 86400000));
  const urgency = !expired && days <= 3;

  return (
    <button
      onClick={onClick}
      style={{
        background: 'var(--card-bg)',
        border: `3px solid ${urgency ? '#f59e0b' : 'var(--dark-border)'}`,
        boxShadow: `0px 6px 0px ${urgency ? '#d97706' : 'var(--dark-border)'}`,
        borderRadius: 20,
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        overflow: 'visible',
        transition: 'transform 0.12s, box-shadow 0.12s',
        animation: 'invCardIn 0.3s ease-out both',
        position: 'relative',
        width: '100%',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = `0px 9px 0px ${urgency ? '#d97706' : 'var(--dark-border)'}`;
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = '';
        (e.currentTarget as HTMLElement).style.boxShadow = `0px 6px 0px ${urgency ? '#d97706' : 'var(--dark-border)'}`;
      }}
    >
      {/* Photo area */}
      <div style={{ position: 'relative', height: 130, overflow: 'hidden', borderTopLeftRadius: 17, borderTopRightRadius: 17, borderBottom: '2.5px dashed var(--dark-border)' }}>
        {item.image ? (
          <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44 }}>
            {cfg.emoji}
          </div>
        )}
        {/* Type badge */}
        <span style={{ position: 'absolute', top: 8, left: 8, padding: '3px 9px', borderRadius: 999, background: cfg.color, color: 'white', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {cfg.label}
        </span>
        {/* Urgency */}
        {urgency && !expired && (
          <span style={{ position: 'absolute', top: 8, right: 8, padding: '3px 9px', borderRadius: 999, background: '#f59e0b', color: 'white', fontSize: 9, fontWeight: 900 }}>
            ⚡ {days}g kaldı
          </span>
        )}
        {expired && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(239,68,68,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ background: '#ef4444', color: 'white', padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 900 }}>Süresi Doldu</span>
          </div>
        )}
      </div>

      {/* Ticket notches */}
      <div style={{ position: 'relative', height: 0, overflow: 'visible', zIndex: 2 }}>
        <div style={{ position: 'absolute', left: -11, top: -11, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-color)', border: '2.5px solid var(--dark-border)' }} />
        <div style={{ position: 'absolute', right: -11, top: -11, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg-color)', border: '2.5px solid var(--dark-border)' }} />
      </div>

      {/* Ticket info area */}
      <div style={{ padding: '14px 14px 12px' }}>
        <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.3 }}>{item.title}</p>
        <p style={{ fontFamily: 'monospace', fontSize: 10, color: cfg.color, fontWeight: 700, margin: '0 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.code}</p>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 600 }}>
            {expired ? '❌ Doldu' : `📅 ${days} gün`}
          </span>
          <span style={{ fontSize: 10, fontWeight: 900, color: 'white', background: 'var(--primary-blue)', padding: '3px 9px', borderRadius: 999 }}>
            Kodu Göster →
          </span>
        </div>
      </div>
    </button>
  );
};

/* ── Main ── */
const Inventory: React.FC = () => {
  const { items } = useInventory();
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch]       = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUsed, setShowUsed]   = useState(false);

  const filtered = items
    .filter(i => activeTab === 'all' || i.type === activeTab)
    .filter(i => showUsed || !i.used)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

  const active = filtered.filter(i => !i.used);
  const used   = filtered.filter(i => i.used);
  const selectedItem = items.find(i => i.id === selectedId);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>BİLETLERİM</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, flexShrink: 0, background: 'linear-gradient(180deg,#fbbf24,#d97706)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>🎫</div>
            <div>
              <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Biletlerim</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>{active.length} aktif bilet</p>
            </div>
          </div>
          <div style={{ background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', borderRadius: 16, padding: '8px 14px', textAlign: 'center', flexShrink: 0 }}>
            <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--primary-blue)', margin: '0 0 1px', lineHeight: 1 }}>{active.length}</p>
            <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Aktif</p>
          </div>
        </div>

        {/* How it works banner */}
        <div style={{ background: 'rgba(123,110,246,0.07)', border: '2px solid rgba(123,110,246,0.25)', borderRadius: 14, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
            Bilete tıkla → <strong style={{ color: 'var(--text-dark)' }}>kodu kasiyere göster</strong> → kasiyerden ürününü al
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Bilet veya kod ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 14, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', fontWeight: 700, fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'all 0.1s', background: activeTab === tab.id ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)', color: activeTab === tab.id ? 'white' : 'var(--text-dark)', border: '3px solid var(--dark-border)', boxShadow: activeTab === tab.id ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)' }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>

        {/* Active tickets grid */}
        {active.length > 0 ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Aktif Biletler</p>
              <span style={{ padding: '2px 8px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', fontSize: 11, fontWeight: 900 }}>{active.length}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {active.map(item => (
                <TicketCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
              ))}
            </div>
          </div>
        ) : (
          <div style={{ background: 'var(--card-bg)', border: '3px dashed var(--dark-border)', borderRadius: 20, padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 40, margin: '0 0 12px' }}>🎫</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 6px' }}>
              {search ? 'Sonuç bulunamadı' : 'Henüz bilet yok'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>
              {search ? 'Farklı bir arama dene.' : 'Mağazadan puan harca ve bilet kazan!'}
            </p>
          </div>
        )}

        {/* Used items */}
        {used.length > 0 && (
          <div>
            <button onClick={() => setShowUsed(s => !s)} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                {showUsed ? '▼' : '▶'} Kullanılan Biletler ({used.length})
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
                      style={{ background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, opacity: 0.5, cursor: 'pointer', textAlign: 'left' }}
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

      {/* Detail Modal */}
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
