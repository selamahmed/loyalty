import React, { useState } from 'react';
import { Search, ChevronRight, ChevronDown } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import InventoryDetailModal from '../components/InventoryDetailModal';
import InventoryWalletCard from '../components/InventoryWalletCard';
import StickerHero from '../components/StickerHero';
import { playSound } from '../lib/sounds';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const Inventory: React.FC = () => {
  const { items } = useInventory();
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showUsed, setShowUsed] = useState(false);

  const filtered = items.filter(
    i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase())
  );

  const active = filtered.filter(i => !i.used && new Date(i.expires) >= new Date());
  const expired = filtered.filter(i => !i.used && new Date(i.expires) < new Date());
  const used = filtered.filter(i => i.used);
  const selectedItem = items.find(i => i.id === selectedId);

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12,
    background: 'var(--tab-bg)', color: 'var(--text-dark)',
    border: '2.5px solid var(--dark-border)', boxShadow: '0 2px 0 var(--dark-border)',
    fontWeight: 700, fontSize: 13, outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
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
        />

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
                <InventoryWalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} />
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
                <InventoryWalletCard key={item.id} item={item} onClick={() => setSelectedId(item.id)} dimmed />
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
    </div>
  );
};

export default Inventory;
