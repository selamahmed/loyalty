import React, { useState } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { Plus, Trash2, X, Check, Star, Search, Eye, EyeOff, Tag, Gift } from 'lucide-react';

const ACCENT = '#22c55e';

interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  stock: number;
  category: string;
  image: string;
  available: boolean;
  limited: boolean;
}

const initialRewards: Reward[] = [
  { id: '1', title: 'Espresso', description: 'Taze çekilmiş espresso', points: 150, stock: 48, category: 'coffee', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=80&h=80&fit=crop', available: true, limited: false },
  { id: '2', title: 'Cappuccino', description: 'Kremsi cappuccino', points: 250, stock: 12, category: 'coffee', image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&h=80&fit=crop', available: true, limited: true },
  { id: '3', title: 'Avocado Toast', description: 'Günlük taze avokado', points: 450, stock: 6, category: 'food', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=80&h=80&fit=crop', available: true, limited: true },
  { id: '4', title: 'Matcha Latte', description: 'Japon matcha ile', points: 350, stock: 30, category: 'drinks', image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=80&h=80&fit=crop', available: true, limited: false },
  { id: '5', title: '%10 İndirim', description: 'Tüm ürünlerde geçerli', points: 200, stock: 100, category: 'coupons', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop', available: false, limited: false },
];

const CATEGORIES = [
  { value: 'coffee',   label: '☕ Kahve'       },
  { value: 'food',     label: '🍔 Yemek'       },
  { value: 'drinks',   label: '🥤 İçecek'      },
  { value: 'coupons',  label: '🏷️ Kupon'      },
  { value: 'pastries', label: '🥐 Pastane'     },
];

const RewardModal: React.FC<{
  reward?: Reward;
  onClose: () => void;
  onSave: (r: Partial<Reward>) => void;
}> = ({ reward, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:       reward?.title       || '',
    description: reward?.description || '',
    points:      reward?.points      || 100,
    stock:       reward?.stock       || 50,
    category:    reward?.category    || 'coffee',
    image:       reward?.image       || '',
    available:   reward?.available   ?? true,
    limited:     reward?.limited     || false,
  });
  const [saved, setSaved] = useState(false);
  const f = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    setSaved(true);
    onSave(form);
    setTimeout(onClose, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-md rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 8px 0px var(--dark-border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
          <div>
            <p className="font-black" style={{ color: 'var(--text-dark)' }}>{reward ? 'Ödülü Düzenle' : 'Yeni Ödül Ekle'}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Mağaza ödül kataloğu</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {form.image && (
            <div className="h-24 rounded-xl overflow-hidden" style={{ border: '2px solid var(--dark-border)' }}>
              <img src={form.image} alt="preview" className="w-full h-full object-cover" />
            </div>
          )}
          <div>
            <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>GÖRSEL URL</label>
            <input value={form.image} onChange={e => f('image', e.target.value)} placeholder="https://..." className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
          </div>
          <div>
            <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>ÖDÜL ADI *</label>
            <input value={form.title} onChange={e => f('title', e.target.value)} placeholder="Ödül adı" className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
          </div>
          <div>
            <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>AÇIKLAMA</label>
            <textarea value={form.description} onChange={e => f('description', e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none resize-none" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>PUAN MALİYETİ</label>
              <input type="number" min={1} value={form.points} onChange={e => f('points', +e.target.value)} className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>STOK</label>
              <input type="number" min={0} value={form.stock} onChange={e => f('stock', +e.target.value)} className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>KATEGORİ</label>
            <select value={form.category} onChange={e => f('category', e.target.value)} className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}>
              {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(['available', 'limited'] as const).map(key => (
              <button key={key} type="button" onClick={() => f(key, !form[key])}
                className="p-3 rounded-xl flex items-center gap-2 transition-all"
                style={{ background: form[key] ? `${ACCENT}10` : 'var(--tab-bg)', border: `2px solid ${form[key] ? ACCENT : 'var(--dark-border)'}` }}>
                <div className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ background: form[key] ? ACCENT : 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                  {form[key] && <Check size={11} className="text-white" />}
                </div>
                <div className="text-left">
                  <p className="font-black text-xs" style={{ color: 'var(--text-dark)' }}>{key === 'available' ? 'Satışta' : 'Sınırlı'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{form[key] ? 'Evet' : 'Hayır'}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-black text-sm" style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>İptal</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2"
              style={{ background: ACCENT, border: '2px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              {saved ? <><Check size={13} /> Kaydedildi!</> : reward ? 'Güncelle' : 'Ekle'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StoreAdminRewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>(initialRewards);
  const [modal, setModal] = useState<{ reward?: Reward; show: boolean }>({ show: false });
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('all');

  const filtered = rewards.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'all' || r.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleSave = (data: Partial<Reward>) => {
    if (modal.reward) {
      setRewards(prev => prev.map(r => r.id === modal.reward!.id ? { ...r, ...data } : r));
    } else {
      setRewards(prev => [...prev, { ...data, id: Date.now().toString() } as Reward]);
    }
  };

  const toggleAvailable = (id: string) =>
    setRewards(prev => prev.map(r => r.id === id ? { ...r, available: !r.available } : r));

  const handleDelete = (id: string) =>
    setRewards(prev => prev.filter(r => r.id !== id));

  return (
    <StoreAdminLayout>
      {modal.show && <RewardModal reward={modal.reward} onClose={() => setModal({ show: false })} onSave={handleSave} />}

      <div className="p-4 sm:p-6 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-dark)' }}>Ödül Kataloğu</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Mağazanızdaki ödülleri yönetin</p>
          </div>
          <button onClick={() => setModal({ show: true })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm text-white transition-all active:scale-95"
            style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
            <Plus size={14} /> Yeni Ödül
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Toplam Ödül', value: rewards.length,                                  color: '#7B6EF6', emoji: '🎁' },
            { label: 'Satışta',     value: rewards.filter(r => r.available).length,          color: ACCENT,   emoji: '✅' },
            { label: 'Sınırlı',     value: rewards.filter(r => r.limited).length,            color: '#f59e0b', emoji: '⚡' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="font-black text-xl" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Ödül ara..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl font-bold text-sm outline-none"
              style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="py-2.5 px-3 rounded-xl font-bold text-sm outline-none"
            style={{ background: 'var(--card-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }}>
            <option value="all">Tüm Kategoriler</option>
            {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        {/* List */}
        <div className="space-y-2">
          {filtered.map(reward => (
            <div key={reward.id} className="flex overflow-hidden rounded-2xl transition-all"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <div className="w-20 flex-shrink-0 overflow-hidden relative" style={{ borderRight: '2px solid var(--dark-border)' }}>
                <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                {!reward.available && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <EyeOff size={14} className="text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-bold text-sm truncate" style={{ color: 'var(--text-dark)' }}>{reward.title}</p>
                    {reward.limited && <span className="px-1.5 py-0.5 text-xs font-bold rounded-md" style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>Sınırlı</span>}
                    <span className="px-1.5 py-0.5 text-xs font-bold rounded-md"
                      style={{ background: reward.available ? `${ACCENT}15` : 'var(--tab-bg)', color: reward.available ? ACCENT : 'var(--text-muted)', border: `1px solid ${reward.available ? ACCENT : 'var(--dark-border)'}` }}>
                      {reward.available ? 'Satışta' : 'Pasif'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-xs font-black" style={{ color: '#f59e0b' }}>
                      <Star size={10} fill="currentColor" /> {reward.points.toLocaleString()} pts
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <Tag size={10} /> {CATEGORIES.find(c => c.value === reward.category)?.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: reward.stock < 10 ? '#ef4444' : 'var(--text-muted)' }}>
                      Stok: {reward.stock}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleAvailable(reward.id)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: reward.available ? `${ACCENT}10` : 'var(--tab-bg)', color: reward.available ? ACCENT : 'var(--text-muted)', border: `2px solid ${reward.available ? ACCENT : 'var(--dark-border)'}` }}>
                    {reward.available ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => setModal({ reward, show: true })}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(123,110,246,0.08)', color: '#7B6EF6', border: '2px solid rgba(123,110,246,0.3)' }}>
                    <Gift size={14} />
                  </button>
                  <button onClick={() => handleDelete(reward.id)}
                    className="p-2 rounded-xl transition-colors"
                    style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '2px solid rgba(239,68,68,0.3)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-12 text-center rounded-2xl"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)' }}>
              <div className="text-4xl mb-3">🎁</div>
              <p className="font-bold" style={{ color: 'var(--text-muted)' }}>Ödül bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminRewards;
