import React, { useMemo, useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import InventoryDetailModal from '../components/InventoryDetailModal';
import InventoryWalletCard from '../components/InventoryWalletCard';
import StickerHero from '../components/StickerHero';

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

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(
      i => !q || [i.title, i.code, i.type].some(value => (value ?? '').toLowerCase().includes(q)),
    );
  }, [items, search]);

  const now = useMemo(() => Date.now(), [items]);
  const active = useMemo(
    () => filtered.filter(i => !i.used && new Date(i.expires).getTime() >= now),
    [filtered, now],
  );
  const expired = useMemo(
    () => filtered.filter(i => i.used || new Date(i.expires).getTime() < now),
    [filtered, now],
  );
  const allActiveCount = useMemo(
    () => items.filter(i => !i.used && new Date(i.expires).getTime() >= now).length,
    [items, now],
  );
  const allExpiredCount = items.length - allActiveCount;
  const selectedItem = items.find(i => i.id === selectedId);

  const handleSelectItem = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

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
        }}>CUZDAN</div>
      </div>

      <div
        className="page-enter p-3 sm:p-4 max-w-lg mx-auto overflow-x-hidden inventory-page"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}
      >
        <div className="inventory-header">
          <div className="inventory-header__copy">
            <p className="section-label">ENVANTER</p>
            <h1 className="section-title" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>Biletlerim</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700, margin: '4px 0 0' }}>
              Kazandigin kupon ve biletleri burada kullan.
            </p>
          </div>
          <div className="inventory-header__chips" aria-label="Envanter ozeti">
            <span>{allActiveCount} aktif</span>
            {allExpiredCount > 0 && <span>{allExpiredCount} gecmis</span>}
          </div>
        </div>

        <StickerHero
          className="inventory-hero-card"
          page="inventory"
          bg="linear-gradient(135deg,#3b82f6 0%,#1d4ed8 100%)"
          badge="ENVANTER"
          title="Biletlerin"
          highlight="burada!"
        />

        <div className="inventory-steps-card" style={{ ...card, padding: '12px 14px', borderRadius: 16, boxShadow: '0 4px 0 var(--dark-border)' }}>
          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px' }}>
            Nasil kullanilir?
          </p>
          <div className="inventory-steps-card__grid" style={{ display: 'flex', gap: 6 }}>
            {['Bilete tikla', 'Kodu goster', 'Urunu al'].map((step, i) => (
              <div key={step} className="inventory-step" style={{ flex: 1, textAlign: 'center' }}>
                <div className="inventory-step__number" style={{
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

        <div className="inventory-search" style={{ position: 'relative' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="search"
            placeholder="Bilet veya kod ara..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Bilet veya kod ara"
            style={{ ...inputStyle, paddingRight: search ? 42 : 14 }}
          />
          {search && (
            <button
              type="button"
              className="inventory-search__clear"
              onClick={() => setSearch('')}
              aria-label="Aramayi temizle"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {active.length > 0 ? (
          <div className="inventory-section">
            <div className="inventory-section__heading" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Aktif ({active.length})
              </p>
              <span>{search ? 'Filtreli' : 'Kullanmaya hazir'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {active.map(item => (
                <InventoryWalletCard key={item.id} item={item} onSelect={handleSelectItem} />
              ))}
            </div>
          </div>
        ) : (
          <div className="inventory-empty-state" style={{ ...card, padding: 40, textAlign: 'center', borderStyle: 'dashed' }}>
            <p style={{ fontSize: 36, margin: '0 0 10px' }}>Ticket</p>
            <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 4px' }}>
              {search ? 'Sonuc bulunamadi' : 'Henuz bilet yok'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, fontWeight: 600 }}>
              {search ? 'Farkli bir arama dene.' : 'Magazadan puan harca, bilet kazan!'}
            </p>
          </div>
        )}

        {expired.length > 0 && (
          <div className="inventory-section inventory-section--expired">
            <div className="inventory-section__heading inventory-section__heading--expired">
              <p style={{ fontSize: 11, fontWeight: 900, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                Suresi Dolan / Kullanilan ({expired.length})
              </p>
              <span>Arsiv</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {expired.map(item => (
                <InventoryWalletCard key={item.id} item={item} onSelect={handleSelectItem} dimmed />
              ))}
            </div>
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
