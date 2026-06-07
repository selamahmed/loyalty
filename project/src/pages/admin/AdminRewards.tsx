import React, { useState } from 'react';
import { Plus, CreditCard as Edit3, Trash2, X, Check, Star, Search } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { rewards as initialRewards } from '../../data/mockData';
import { playSound } from '../../lib/sounds';
import { tr } from '../../lib/tr';

type Reward = typeof initialRewards[0];

const RewardModal: React.FC<{ reward?: Reward; onClose: () => void; onSave: (r: Partial<Reward>) => void }> = ({ reward, onClose, onSave }) => {
  const [form, setForm] = useState({
    title: reward?.title || '',
    points: reward?.points || 0,
    category: reward?.category || 'gift-cards',
    description: reward?.description || '',
    limited: reward?.limited || false,
    stock: reward?.stock || 100,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    onSave(form);
    setTimeout(onClose, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="animate-bounce-in card max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-lg text-gray-900 dark:text-white">{reward ? 'Ödülü Düzenle' : 'Ödül Ekle'}</h3>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-bold text-sm mb-2">Başlık</label>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Ödül başlığı" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-sm mb-2">Puan Maliyeti</label>
              <input type="number" value={form.points} onChange={e => setForm({...form, points: +e.target.value})} className="input-field" />
            </div>
            <div>
              <label className="block font-bold text-sm mb-2">Stok</label>
              <input type="number" value={form.stock} onChange={e => setForm({...form, stock: +e.target.value})} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block font-bold text-sm mb-2">Kategori</label>
            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
              <option value="gift-cards">Hediye Kartları</option>
              <option value="food">Yiyecek & İçecek</option>
              <option value="entertainment">Eğlence</option>
              <option value="electronics">Elektronik</option>
              <option value="coupons">Kuponlar</option>
              <option value="fitness">Fitness</option>
            </select>
          </div>
          <div>
            <label className="block font-bold text-sm mb-2">Açıklama</label>
            <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={3} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <button type="button" onClick={() => setForm({...form, limited: !form.limited})}
              className={`w-5 h-5 rounded-md border-2 border-black dark:border-gray-500 flex items-center justify-center transition-colors ${form.limited ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7]' : 'bg-white dark:bg-gray-700'}`}>
              {form.limited && <Check size={12} className="text-white" />}
            </button>
            <span className="font-medium text-sm text-gray-900 dark:text-white">Sınırlı Basım</span>
          </label>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1">{tr.common.cancel}</button>
          <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
            {saved ? <><Check size={14} /> {tr.common.save}!</> : reward ? 'Değişiklikleri Kaydet' : 'Ödül Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminRewards: React.FC = () => {
  const [rewards, setRewards] = useState(initialRewards);
  const [modal, setModal] = useState<{ reward?: Reward; show: boolean }>({ show: false });
  const [search, setSearch] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = rewards.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));

  const handleSave = (data: Partial<Reward>) => {
    if (modal.reward) {
      setRewards(prev => prev.map(r => r.id === modal.reward!.id ? { ...r, ...data } : r));
    } else {
      setRewards(prev => [...prev, { ...data, id: Date.now().toString(), image: '', featured: false, expiresAt: null } as Reward]);
    }
  };

  const handleDelete = (id: string) => {
    setDeleting(id);
    setTimeout(() => {
      setRewards(prev => prev.filter(r => r.id !== id));
      setDeleting(null);
    }, 600);
  };

  return (
    <AdminLayout>
      {modal.show && <RewardModal reward={modal.reward} onClose={() => setModal({ show: false })} onSave={handleSave} />}

      <div className="p-4 lg:p-6 space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">{tr.admin.rewards}</h1>
          <button onClick={() => setModal({ show: true })} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
            <Plus size={14} /> Ödül Ekle
          </button>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Ödülleri ara..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2" />
        </div>

        <div className="grid grid-cols-1 gap-3">
          {filtered.map(reward => (
            <div
              key={reward.id}
              className={`card flex overflow-hidden transition-all duration-300 ${deleting === reward.id ? 'opacity-0 scale-95' : ''}`}
            >
              <div className="w-24 flex-shrink-0 overflow-hidden border-r-2 border-black dark:border-gray-700">
                <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 p-4 flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-gray-900 dark:text-white">{reward.title}</p>
                    {reward.limited && <span className="badge bg-red-100 dark:bg-red-900/30 text-red-500 text-xs">Limited</span>}
                    {reward.featured && <span className="badge bg-[#7B6EF6]/10 text-[#7B6EF6] text-xs">Featured</span>}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{reward.description}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1">
                      <Star size={10} className="text-amber-500" fill="currentColor" />
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{reward.points.toLocaleString()} pts</span>
                    </div>
                    <span className="text-xs text-gray-400 capitalize">{reward.category}</span>
                    {reward.stock !== undefined && <span className="text-xs text-gray-400">Stock: {reward.stock}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => { playSound('click'); setModal({ reward, show: true }); }} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#7B6EF6] transition-colors">
                    <Edit3 size={15} />
                  </button>
                  <button onClick={() => { playSound('click'); handleDelete(reward.id); }} className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRewards;
