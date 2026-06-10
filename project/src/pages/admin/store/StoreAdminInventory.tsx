import React, { useState } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { Package, Plus, Trash2, X, Check, Search, AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';

const ACCENT = '#22c55e';

interface InventoryItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  cost: number;
  image: string;
  lastUpdated: string;
}

const INITIAL: InventoryItem[] = [
  { id: '1', name: 'Espresso Fasulyesi', category: 'Hammadde', stock: 42, minStock: 10, unit: 'kg', cost: 180, image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=60&h=60&fit=crop', lastUpdated: '10 Haz' },
  { id: '2', name: 'Süt (Tam Yağlı)',   category: 'Gıda',     stock: 8,  minStock: 15, unit: 'lt', cost: 32,  image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=60&h=60&fit=crop', lastUpdated: '09 Haz' },
  { id: '3', name: 'Oat Milk',          category: 'Gıda',     stock: 24, minStock: 10, unit: 'lt', cost: 58,  image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=60&h=60&fit=crop', lastUpdated: '10 Haz' },
  { id: '4', name: 'Matcha Tozu',       category: 'Hammadde', stock: 3,  minStock: 5,  unit: 'kg', cost: 420, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=60&h=60&fit=crop', lastUpdated: '08 Haz' },
  { id: '5', name: 'Avokado',           category: 'Taze',     stock: 18, minStock: 10, unit: 'adet', cost: 15, image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=60&h=60&fit=crop', lastUpdated: '10 Haz' },
  { id: '6', name: 'Granola',           category: 'Kuru',     stock: 9,  minStock: 5,  unit: 'kg', cost: 95,  image: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?w=60&h=60&fit=crop', lastUpdated: '07 Haz' },
  { id: '7', name: 'Vanilya Şurubu',    category: 'Katkı',   stock: 15, minStock: 5,  unit: 'bt', cost: 75,  image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=60&h=60&fit=crop', lastUpdated: '10 Haz' },
];

const AdjustModal: React.FC<{
  item: InventoryItem;
  onClose: () => void;
  onSave: (id: string, delta: number) => void;
}> = ({ item, onClose, onSave }) => {
  const [mode, setMode] = useState<'add' | 'remove'>('add');
  const [qty, setQty] = useState('');
  const [done, setDone] = useState(false);

  const handle = () => {
    const n = Number(qty);
    if (!n || n <= 0) return;
    onSave(item.id, mode === 'add' ? n : -n);
    setDone(true);
    setTimeout(onClose, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 8px 0px var(--dark-border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
          <div>
            <p className="font-black" style={{ color: 'var(--text-dark)' }}>Stok Güncelle</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.name}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        {done ? (
          <div className="p-8 flex flex-col items-center gap-3">
            <Check size={36} style={{ color: ACCENT }} />
            <p className="font-black" style={{ color: 'var(--text-dark)' }}>Stok güncellendi!</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex gap-2">
              {(['add', 'remove'] as const).map(m => (
                <button key={m} onClick={() => setMode(m)}
                  className="flex-1 py-2.5 rounded-xl font-black text-sm flex items-center justify-center gap-1"
                  style={{
                    background: mode === m ? (m === 'add' ? ACCENT : '#ef4444') : 'var(--tab-bg)',
                    color: mode === m ? 'white' : 'var(--text-muted)',
                    border: '2px solid var(--dark-border)',
                    boxShadow: mode === m ? '0px 2px 0px var(--dark-border)' : 'none',
                  }}>
                  {m === 'add' ? <><ArrowUp size={13} /> Stok Ekle</> : <><ArrowDown size={13} /> Stok Düş</>}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-xl flex justify-between"
              style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>Mevcut Stok</span>
              <span className="font-black" style={{ color: 'var(--text-dark)' }}>{item.stock} {item.unit}</span>
            </div>
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>MİKTAR ({item.unit})</label>
              <input type="number" min={1} placeholder="0" value={qty} onChange={e => setQty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
            <button onClick={handle}
              className="w-full py-3 rounded-xl font-black text-sm text-white"
              style={{ background: mode === 'add' ? ACCENT : '#ef4444', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              {mode === 'add' ? 'Stok Ekle' : 'Stok Düş'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const StoreAdminInventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL);
  const [search, setSearch] = useState('');
  const [adjusting, setAdjusting] = useState<InventoryItem | null>(null);

  const filtered = items.filter(i => i.name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));
  const lowStock = items.filter(i => i.stock <= i.minStock).length;
  const totalValue = items.reduce((s, i) => s + i.stock * i.cost, 0);

  const handleAdjust = (id: string, delta: number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, stock: Math.max(0, i.stock + delta), lastUpdated: '10 Haz' } : i));
  };

  return (
    <StoreAdminLayout>
      {adjusting && <AdjustModal item={adjusting} onClose={() => setAdjusting(null)} onSave={handleAdjust} />}

      <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="p-5 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Package size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl">Envanter Yönetimi</p>
              <p className="text-white/70 text-sm">Stok seviyeleri ve malzeme takibi</p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Toplam Ürün',      value: items.length,                       color: '#7B6EF6', emoji: '📦' },
            { label: 'Düşük Stok',       value: lowStock,                           color: '#ef4444', emoji: '⚠️' },
            { label: 'Toplam Değer (₺)', value: `₺${totalValue.toLocaleString('tr-TR')}`, color: '#f59e0b', emoji: '💰' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {lowStock > 0 && (
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid #ef4444' }}>
            <AlertTriangle size={18} style={{ color: '#ef4444', flexShrink: 0 }} />
            <p className="font-black text-sm" style={{ color: '#ef4444' }}>
              {lowStock} ürün minimum stok seviyesinin altında! Sipariş verilmesi önerilir.
            </p>
          </div>
        )}

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Ürün veya kategori ara..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl font-bold text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '2px solid var(--dark-border)' }}>
                  {['Ürün', 'Kategori', 'Stok', 'Min. Stok', 'Birim Maliyet', 'Son Güncelleme', ''].map((h, i) => (
                    <th key={i} className={`px-4 py-3 text-left text-xs font-black uppercase tracking-widest ${i === 1 ? 'hidden sm:table-cell' : ''} ${i === 4 ? 'hidden md:table-cell' : ''} ${i === 5 ? 'hidden lg:table-cell' : ''}`}
                      style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(item => {
                  const isLow = item.stock <= item.minStock;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--dark-border)' }} className="transition-colors hover:bg-black/5">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={item.image} alt={item.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            style={{ border: '2px solid var(--dark-border)' }} />
                          <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{item.name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className="px-2 py-1 rounded-lg text-xs font-bold"
                          style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '1.5px solid var(--dark-border)' }}>
                          {item.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm" style={{ color: isLow ? '#ef4444' : 'var(--text-dark)' }}>
                            {item.stock}
                          </span>
                          {isLow && <AlertTriangle size={13} style={{ color: '#ef4444' }} />}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-muted)' }}>{item.minStock}</span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm font-bold" style={{ color: 'var(--text-dark)' }}>₺{item.cost}/{item.unit}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.lastUpdated}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => setAdjusting(item)}
                            className="px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95"
                            style={{ background: ACCENT, color: 'white', border: '2px solid var(--dark-border)', boxShadow: '0px 2px 0px var(--dark-border)' }}>
                            Güncelle
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminInventory;
