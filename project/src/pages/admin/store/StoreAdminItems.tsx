import React, { useState } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { ShoppingBag, Plus, Trash2, X, Check, Search, Edit2, Package } from 'lucide-react';

const ACCENT = '#22c55e';

interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: string;
  points: number;
  stock: number;
  image: string;
  active: boolean;
}

const CATEGORIES = ['Kahve', 'Pastane', 'Yiyecek', 'İçecek', 'Diğer'];

const INITIAL_ITEMS: StoreItem[] = [
  { id: '1', name: 'Classic Espresso',  description: 'Rich, bold espresso shot with crema',           category: 'Kahve',   points: 150, stock: 200, image: 'https://images.pexels.com/photos/1514063/pexels-photo-1514063.jpeg?auto=compress&cs=tinysrgb&w=300', active: true  },
  { id: '2', name: 'Cappuccino',        description: 'Espresso with steamed milk and velvety foam',    category: 'Kahve',   points: 250, stock: 150, image: 'https://images.pexels.com/photos/3240797/pexels-photo-3240797.jpeg?auto=compress&cs=tinysrgb&w=300', active: true  },
  { id: '3', name: 'Iced Latte',        description: 'Chilled espresso with cold milk over ice',       category: 'Kahve',   points: 300, stock: 40,  image: 'https://images.pexels.com/photos/3980328/pexels-photo-3980328.jpeg?auto=compress&cs=tinysrgb&w=300', active: true  },
  { id: '4', name: 'Croissant',         description: 'Buttery, flaky French pastry freshly baked',    category: 'Pastane', points: 200, stock: 100, image: 'https://images.pexels.com/photos/11723395/pexels-photo-11723395.jpeg?auto=compress&cs=tinysrgb&w=300', active: true  },
  { id: '5', name: 'Avocado Toast',     description: 'Smashed avocado on artisan sourdough',          category: 'Yiyecek', points: 450, stock: 25,  image: 'https://images.pexels.com/photos/5491303/pexels-photo-5491303.jpeg?auto=compress&cs=tinysrgb&w=300', active: true  },
  { id: '6', name: 'Matcha Latte',      description: 'Premium Japanese matcha with steamed oat milk', category: 'Kahve',   points: 350, stock: 60,  image: 'https://images.pexels.com/photos/3601421/pexels-photo-3601421.jpeg?auto=compress&cs=tinysrgb&w=300', active: false },
  { id: '7', name: 'Fruit Smoothie',    description: 'Blended smoothie with seasonal fresh fruits',   category: 'İçecek',  points: 320, stock: 70,  image: 'https://images.pexels.com/photos/1092750/pexels-photo-1092750.jpeg?auto=compress&cs=tinysrgb&w=300', active: true  },
];

const EMPTY_FORM = (): Omit<StoreItem, 'id'> => ({
  name: '', description: '', category: CATEGORIES[0], points: 0, stock: 0, image: '', active: true,
});

interface ItemFormProps {
  initial?: StoreItem;
  onSave: (data: Omit<StoreItem, 'id'>) => void;
  onClose: () => void;
  title: string;
}

const ItemForm: React.FC<ItemFormProps> = ({ initial, onSave, onClose, title }) => {
  const [form, setForm] = useState<Omit<StoreItem, 'id'>>(
    initial ? { name: initial.name, description: initial.description, category: initial.category, points: initial.points, stock: initial.stock, image: initial.image, active: initial.active }
            : EMPTY_FORM()
  );
  const [saved, setSaved] = useState(false);

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(prev => ({ ...prev, [k]: v }));

  const handle = () => {
    if (!form.name.trim()) return;
    setSaved(true);
    setTimeout(() => { onSave(form); onClose(); }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 8px 0px var(--dark-border)', maxHeight: '90vh', overflowY: 'auto' }}>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
          <p className="font-black" style={{ color: 'var(--text-dark)' }}>{title}</p>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {saved ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: `${ACCENT}20`, border: `2px solid ${ACCENT}` }}>
              <Check size={28} style={{ color: ACCENT }} />
            </div>
            <p className="font-black text-lg" style={{ color: 'var(--text-dark)' }}>Kaydedildi!</p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>ÜRÜN ADI *</label>
              <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ürün adını girin"
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>

            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>AÇIKLAMA</label>
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Ürün açıklaması..."
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none resize-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>KATEGORİ</label>
                <select value={form.category} onChange={e => set('category', e.target.value)}
                  className="w-full px-3 py-3 rounded-xl font-bold text-sm outline-none"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>DURUM</label>
                <select value={form.active ? 'active' : 'inactive'} onChange={e => set('active', e.target.value === 'active')}
                  className="w-full px-3 py-3 rounded-xl font-bold text-sm outline-none"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>PUAN FİYATI</label>
                <input type="number" min={0} value={form.points} onChange={e => set('points', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
              </div>
              <div>
                <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>STOK</label>
                <input type="number" min={0} value={form.stock} onChange={e => set('stock', Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
              </div>
            </div>

            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>GÖRSEL URL</label>
              <input value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://..."
                className="w-full px-4 py-3 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
              {form.image && (
                <img src={form.image} alt="preview" className="mt-2 w-full h-32 object-cover rounded-xl"
                  style={{ border: '2px solid var(--dark-border)' }} onError={e => (e.currentTarget.style.display = 'none')} />
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={onClose}
                className="flex-1 py-3 rounded-xl font-black text-sm"
                style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
                İptal
              </button>
              <button onClick={handle} disabled={!form.name.trim()}
                className="flex-1 py-3 rounded-xl font-black text-sm text-white transition-opacity"
                style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', opacity: form.name.trim() ? 1 : 0.5 }}>
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DeleteConfirm: React.FC<{ item: StoreItem; onConfirm: () => void; onClose: () => void }> = ({ item, onConfirm, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
    <div className="w-full max-w-sm rounded-2xl overflow-hidden"
      style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 8px 0px var(--dark-border)' }}>
      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '2px solid #ef4444' }}>
            <Trash2 size={18} style={{ color: '#ef4444' }} />
          </div>
          <div>
            <p className="font-black" style={{ color: 'var(--text-dark)' }}>Ürünü Sil</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Bu işlem geri alınamaz</p>
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '2px solid #ef4444' }}>
          <p className="font-black text-sm" style={{ color: '#ef4444' }}>"{item.name}" ürününü silmek istediğinizden emin misiniz?</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-sm"
            style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
            İptal
          </button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl font-black text-sm text-white"
            style={{ background: '#ef4444', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  </div>
);

const StoreAdminItems: React.FC = () => {
  const [items, setItems] = useState<StoreItem[]>(INITIAL_ITEMS);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<StoreItem | null>(null);
  const [deleting, setDeleting] = useState<StoreItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = items.filter(i =>
    i.name.toLowerCase().includes(search.toLowerCase()) ||
    i.category.toLowerCase().includes(search.toLowerCase())
  );

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const handleAdd = (data: Omit<StoreItem, 'id'>) => {
    const newItem: StoreItem = { ...data, id: Date.now().toString() };
    setItems(prev => [newItem, ...prev]);
    showToast(`"${data.name}" eklendi!`);
  };

  const handleEdit = (data: Omit<StoreItem, 'id'>) => {
    if (!editing) return;
    setItems(prev => prev.map(i => i.id === editing.id ? { ...data, id: i.id } : i));
    showToast(`"${data.name}" güncellendi!`);
    setEditing(null);
  };

  const handleDelete = () => {
    if (!deleting) return;
    setItems(prev => prev.filter(i => i.id !== deleting.id));
    showToast(`"${deleting.name}" silindi!`);
    setDeleting(null);
  };

  const activeCount = items.filter(i => i.active).length;

  return (
    <StoreAdminLayout>
      {addOpen    && <ItemForm title="Yeni Ürün Ekle"    onSave={handleAdd}  onClose={() => setAddOpen(false)} />}
      {editing    && <ItemForm title="Ürünü Düzenle"     initial={editing}   onSave={handleEdit} onClose={() => setEditing(null)} />}
      {deleting   && <DeleteConfirm item={deleting} onConfirm={handleDelete} onClose={() => setDeleting(null)} />}

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 200, padding: '12px 18px', borderRadius: 14, background: ACCENT, color: 'white', fontWeight: 900, fontSize: 14, border: '2px solid #16a34a', boxShadow: '0 4px 0 #15803d', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Check size={15} /> {toast}
        </div>
      )}

      <div className="p-4 sm:p-6 space-y-5 max-w-5xl mx-auto">
        <div className="p-5 rounded-2xl text-white"
          style={{ background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <div>
                <p className="font-black text-xl">Mağaza Ürünleri</p>
                <p className="text-white/70 text-sm">{items.length} ürün · {activeCount} aktif</p>
              </div>
            </div>
            <button onClick={() => setAddOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-black text-sm"
              style={{ background: 'white', color: '#16a34a', border: '2px solid rgba(0,0,0,0.15)', boxShadow: '0px 3px 0px rgba(0,0,0,0.15)' }}>
              <Plus size={16} /> Ürün Ekle
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Toplam Ürün', value: items.length, color: '#7B6EF6', emoji: '📦' },
            { label: 'Aktif',       value: activeCount,   color: ACCENT,     emoji: '✅' },
            { label: 'Pasif',       value: items.length - activeCount, color: '#ef4444', emoji: '⏸️' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <div className="text-xl mb-1">{s.emoji}</div>
              <p className="font-black text-xl" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Ürün veya kategori ara..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl font-bold text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 rounded-2xl"
            style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)' }}>
            <Package size={36} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
            <p className="font-black" style={{ color: 'var(--text-muted)' }}>Ürün bulunamadı</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map(item => (
              <div key={item.id} className="rounded-2xl overflow-hidden flex"
                style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', opacity: item.active ? 1 : 0.65 }}>
                <div className="w-24 flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center" style={{ background: 'var(--tab-bg)' }}>
                      <Package size={24} style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                    </div>
                  )}
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-black text-sm leading-tight" style={{ color: 'var(--text-dark)' }}>{item.name}</p>
                      <span className="text-xs font-black px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: item.active ? `${ACCENT}18` : 'rgba(107,114,128,0.12)', color: item.active ? ACCENT : 'var(--text-muted)' }}>
                        {item.active ? 'Aktif' : 'Pasif'}
                      </span>
                    </div>
                    <p className="text-xs mb-2 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.description}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '1.5px solid var(--dark-border)' }}>
                        {item.category}
                      </span>
                      <span className="text-xs font-black" style={{ color: '#f59e0b' }}>⭐ {item.points} puan</span>
                      <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Stok: {item.stock}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => setEditing(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95"
                      style={{ background: '#3b82f618', color: '#3b82f6', border: '2px solid #3b82f6' }}>
                      <Edit2 size={11} /> Düzenle
                    </button>
                    <button onClick={() => setDeleting(item)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '2px solid #ef4444' }}>
                      <Trash2 size={11} /> Sil
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminItems;
