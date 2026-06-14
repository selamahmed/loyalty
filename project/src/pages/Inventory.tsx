import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import InventoryDetailModal from '../components/InventoryDetailModal';
import InventoryWalletCard from '../components/InventoryWalletCard';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const tabs = [
  { id: 'all', label: 'Tümü', emoji: '🗂️' },
  { id: 'coupon', label: 'Kupon', emoji: '🏷️' },
  { id: 'ticket', label: 'Bilet', emoji: '🎫' },
  { id: 'reward', label: 'Ödül', emoji: '🎁' },
];

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
      <div
        className="page-enter p-3 sm:p-4 max-w-lg mx-auto overflow-x-hidden"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p className="section-label">ENVANTER</p>
            <h1 className="section-title" style={{ fontSize: 'clamp(22px,5vw,28px)', margin: 0 }}>
              {tr.inventory.title}
            </h1>
          </div>
          <div style={{
            ...card,
            padding: '10px 14px',
            borderRadius: 14,
            boxShadow: '0 3px 0 var(--dark-border)',
            textAlign: 'center',
            flexShrink: 0,
          }}>
            <p style={{ margin: 0, fontWeight: 900, fontSize: 18, color: 'var(--primary-blue)', lineHeight: 1 }}>
              {counts.all}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Aktif
            </p>
          </div>
        </div>

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

        <div style={{ ...card, padding: 4, borderRadius: 14, boxShadow: '0 3px 0 var(--dark-border)' }}>
          <div className="inv-tabs">
            {tabs.map(tab => {
              const on = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className="inv-tab"
                  onClick={() => { playSound('click'); setActiveTab(tab.id); }}
                  style={{
                    padding: '8px 4px', borderRadius: 10, border: 'none', cursor: 'pointer',
                    background: on ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'transparent',
                    color: on ? 'white' : 'var(--text-muted)',
                    fontWeight: 900, fontSize: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    transition: 'all 0.15s',
                  }}
                >
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

        {active.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {active.map(item => (
              <InventoryWalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
            ))}
          </div>
        ) : (
          <div style={{ ...card, padding: 36, textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ fontSize: 36, margin: '0 0 10px' }}>🎫</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 4px' }}>
              {search ? 'Sonuç bulunamadı' : tr.inventory.empty}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, fontWeight: 600 }}>
              {search ? 'Farklı bir arama dene.' : 'Mağazadan puan harca, bilet kazan!'}
            </p>
          </div>
        )}

        {expired.length > 0 && (
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
              Süresi Dolan ({expired.length})
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {expired.map(item => (
                <InventoryWalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} dimmed />
              ))}
            </div>
          </div>
        )}

        {used.length > 0 && (
          <div>
            <button
              type="button"
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
                  <InventoryWalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} dimmed />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <InventoryDetailModal item={selectedItem} onClose={() => setSelectedId(null)} />
      )}

      <style>{`
        .inv-tabs { display: flex; gap: 4px; overflow-x: auto; padding: 3px;
          -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory; scrollbar-width: none; }
        .inv-tabs::-webkit-scrollbar { display: none; }
        .inv-tab { scroll-snap-align: center; flex: 1; min-width: 0; }
      `}</style>
    </div>
  );
};

export default Inventory;
