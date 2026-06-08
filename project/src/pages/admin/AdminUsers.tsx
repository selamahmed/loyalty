import React, { useState } from 'react';
import { Search, CreditCard as Edit3, Slash, Eye, Plus, X, Check, Gift, Trash2, Package, ChevronRight } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminUsers } from '../../data/mockData';
import { playSound } from '../../lib/sounds';
import { tr } from '../../lib/tr';

type UserType = typeof adminUsers[0];

interface InventoryItem {
  id: string;
  title: string;
  type: 'coupon' | 'ticket' | 'reward';
  code: string;
  expires: string;
  used: boolean;
  image: string;
}

const typeLabel: Record<string, string> = { coupon: 'Kupon', ticket: 'Bilet', reward: 'Ödül' };
const typeColor: Record<string, string> = { coupon: '#3b82f6', ticket: '#f59e0b', reward: '#22c55e' };

const generateMockInventory = (userId: string): InventoryItem[] => {
  const seed = userId.charCodeAt(userId.length - 1);
  const all: InventoryItem[] = [
    { id: `${userId}-1`, title: 'Ücretsiz Kahve',     type: 'coupon', code: 'KAFE-FREE',  expires: '2026-09-30', used: false, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&h=80&fit=crop' },
    { id: `${userId}-2`, title: '%20 İndirim Kuponu', type: 'coupon', code: 'IND-20PCT',   expires: '2026-08-15', used: false, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop' },
    { id: `${userId}-3`, title: 'Konser Bileti',      type: 'ticket', code: 'KONSER-VIP',  expires: '2026-07-20', used: seed % 2 === 0, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop' },
    { id: `${userId}-4`, title: 'Özel Çanta Ödülü',  type: 'reward', code: 'CANTA-SPL',   expires: '2026-12-31', used: false, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop' },
  ];
  return all.slice(0, (seed % 3) + 2);
};

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0 4px 0 var(--dark-border)',
  borderRadius: 20,
};

const UserModal: React.FC<{
  user: UserType;
  onClose: () => void;
  mode: 'view' | 'edit' | 'suspend' | 'points' | 'inventory';
}> = ({ user, onClose, mode }) => {
  const [status, setStatus]         = useState(user.status);
  const [saved, setSaved]           = useState(false);
  const [pointsAmount, setPointsAmount] = useState('');
  const [pointsReason, setPointsReason] = useState('manual_award');
  const [inventory, setInventory]   = useState<InventoryItem[]>(() => generateMockInventory(user.id));
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemType, setNewItemType]   = useState<'coupon' | 'ticket' | 'reward'>('coupon');
  const [newItemExpires, setNewItemExpires] = useState('');

  const handleSave = () => { setSaved(true); setTimeout(onClose, 1000); };

  const removeItem = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));
  const toggleUsed = (id: string) => setInventory(prev => prev.map(i => i.id === id ? { ...i, used: !i.used } : i));

  const addItem = () => {
    if (!newItemTitle.trim()) return;
    const prefix = newItemType.slice(0, 4).toUpperCase();
    const code   = `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    const item: InventoryItem = {
      id: Date.now().toString(), title: newItemTitle.trim(), type: newItemType,
      code, expires: newItemExpires || '2026-12-31', used: false,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop',
    };
    setInventory(prev => [item, ...prev]);
    setNewItemTitle(''); setNewItemExpires(''); setShowAddItem(false);
  };

  const modeTitle: Record<string, string> = {
    view:      'Kullanıcı Profili',
    edit:      'Kullanıcıyı Düzenle',
    suspend:   'Kullanıcıyı Askıya Al',
    points:    'Puanları Yönet',
    inventory: 'Kullanıcı Envanteri',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="card max-w-lg w-full p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-lg text-gray-900 dark:text-white">{modeTitle[mode]}</h3>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>

        <div className="flex items-center gap-4 mb-5">
          <img src={user.avatar} alt={user.username} className="w-14 h-14 rounded-full border-2 border-black dark:border-gray-600 object-cover flex-shrink-0" />
          <div>
            <p className="font-black text-xl text-gray-900 dark:text-white">{user.username}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            <span className={`badge text-xs mt-1 inline-block ${user.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>{user.status}</span>
          </div>
        </div>

        {/* ── VIEW ── */}
        {mode === 'view' && (
          <div className="space-y-3">
            {[
              { label: 'Seviye',         value: `${user.level}` },
              { label: 'Toplam Puanlar', value: user.points.toLocaleString('tr-TR') },
              { label: 'Durum',          value: user.status === 'active' ? 'Aktif' : 'Askıya Alınmış' },
              { label: 'Katılım Tarihi', value: new Date(user.joinDate).toLocaleDateString('tr-TR') },
            ].map(row => (
              <div key={row.label} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">{row.label}</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white capitalize">{row.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── EDIT ── */}
        {mode === 'edit' && (
          <div className="space-y-4">
            <div><label className="block font-bold text-sm mb-2">Kullanıcı Adı</label><input defaultValue={user.username} className="input-field" /></div>
            <div><label className="block font-bold text-sm mb-2">E-posta</label><input defaultValue={user.email} className="input-field" /></div>
            <div>
              <label className="block font-bold text-sm mb-2">Durum</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="input-field">
                <option value="active">Aktif</option>
                <option value="suspended">Askıya Alınmış</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">{tr.common.cancel}</button>
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saved ? <><Check size={14} /> Kaydedildi!</> : 'Değişiklikleri Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* ── SUSPEND ── */}
        {mode === 'suspend' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-700">
              <p className="font-bold text-red-700 dark:text-red-400">{user.username} kullanıcısını askıya al?</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Bu kullanıcının hesabına erişimini engelleyecektir.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">{tr.common.cancel}</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold border-2 border-red-700 transition-colors">
                {saved ? 'Askıya Alındı!' : 'Kullanıcıyı Askıya Al'}
              </button>
            </div>
          </div>
        )}

        {/* ── POINTS ── */}
        {mode === 'points' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-700">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200">Mevcut Puanlar: <span className="text-lg text-blue-600 dark:text-blue-300">{user.points.toLocaleString('tr-TR')}</span></p>
            </div>
            <div>
              <label className="block font-bold text-sm mb-2">Miktar</label>
              <input type="number" placeholder="Puan miktarını girin" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} className="input-field w-full" />
            </div>
            <div>
              <label className="block font-bold text-sm mb-2">Neden</label>
              <select value={pointsReason} onChange={e => setPointsReason(e.target.value)} className="input-field w-full">
                <option value="manual_award">Manuel Ödül</option>
                <option value="bonus">Bonus/Promosyon</option>
                <option value="correction">Düzeltme</option>
                <option value="compensation">Tazminat</option>
                <option value="penalty">Ceza Düşümü</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">{tr.common.cancel}</button>
              <button onClick={handleSave} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saved ? <><Check size={14} /> Uygulandı!</> : <><Gift size={14} />{parseInt(pointsAmount) < 0 ? 'Düş' : 'Ödül'} Puanları</>}
              </button>
            </div>
          </div>
        )}

        {/* ── INVENTORY ── */}
        {mode === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                {inventory.length} öğe • {inventory.filter(i => !i.used).length} aktif
              </p>
              <button onClick={() => setShowAddItem(v => !v)} style={{ padding: '7px 14px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                <Plus size={13} /> Öğe Ekle
              </button>
            </div>

            {showAddItem && (
              <div style={{ ...card, padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input type="text" placeholder="Öğe adı" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} className="input-field" />
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={newItemType} onChange={e => setNewItemType(e.target.value as 'coupon' | 'ticket' | 'reward')} className="input-field" style={{ flex: 1 }}>
                    <option value="coupon">Kupon</option>
                    <option value="ticket">Bilet</option>
                    <option value="reward">Ödül</option>
                  </select>
                  <input type="date" value={newItemExpires} onChange={e => setNewItemExpires(e.target.value)} className="input-field" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setShowAddItem(false)} style={{ flex: 1, padding: '8px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>İptal</button>
                  <button onClick={addItem} style={{ flex: 2, padding: '8px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>Ekle</button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {inventory.length === 0 && (
                <div style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>
                  <Package size={32} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
                  <p style={{ fontWeight: 700, margin: 0, fontSize: 13 }}>Envanter boş</p>
                </div>
              )}
              {inventory.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 14, border: '2px solid var(--dark-border)', background: item.used ? 'rgba(107,114,128,0.06)' : 'var(--card-bg)', opacity: item.used ? 0.65 : 1 }}>
                  <img src={item.image} alt={item.title} style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '2px solid var(--dark-border)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: item.used ? 'line-through' : 'none' }}>{item.title}</p>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 10, color: typeColor[item.type], fontWeight: 700 }}>{item.code}</span>
                      <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: `${typeColor[item.type]}20`, color: typeColor[item.type], border: `1px solid ${typeColor[item.type]}`, fontWeight: 900 }}>{typeLabel[item.type]}</span>
                      {item.used && <span style={{ fontSize: 9, padding: '1px 6px', borderRadius: 999, background: 'rgba(107,114,128,0.12)', color: '#6b7280', border: '1px solid #9ca3af', fontWeight: 900 }}>Kullanıldı</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button onClick={() => toggleUsed(item.id)} title={item.used ? 'Aktife al' : 'Kullanıldı olarak işaretle'} style={{ width: 30, height: 30, borderRadius: 8, background: item.used ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.10)', border: `1.5px solid ${item.used ? '#22c55e' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Check size={13} color={item.used ? '#16a34a' : '#9ca3af'} />
                    </button>
                    <button onClick={() => removeItem(item.id)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(239,68,68,0.10)', border: '1.5px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={onClose} className="btn-secondary w-full mt-2">Kapat</button>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminUsers: React.FC = () => {
  const [search, setSearch]           = useState('');
  const [modal, setModal]             = useState<{ user: UserType; mode: 'view' | 'edit' | 'suspend' | 'points' | 'inventory' } | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = adminUsers.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search);
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      {modal && <UserModal user={modal.user} mode={modal.mode} onClose={() => setModal(null)} />}
      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-x-hidden">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{tr.admin.users}</h1>
          <button className="btn-primary flex items-center gap-1.5 sm:gap-2 py-1.5 sm:py-2 px-3 sm:px-4 text-xs sm:text-sm">
            <Plus size={12} className="sm:w-3.5 sm:h-3.5" /> Kullanıcı Ekle
          </button>
        </div>

        <div className="flex gap-2 sm:gap-3 flex-wrap items-stretch">
          <div className="relative flex-1 min-w-0 sm:min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 sm:w-4 sm:h-4" />
            <input type="text" placeholder="Kullanıcıları ara..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-8 sm:pl-9 py-1.5 sm:py-2 w-full text-sm" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="input-field py-1.5 sm:py-2 w-auto pr-8 text-sm">
            <option value="all">Tüm Durumlar</option>
            <option value="active">Aktif</option>
            <option value="suspended">Askıya Alınmış</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black dark:border-gray-700">
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider hidden sm:table-cell">Seviye</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Puanlar</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider hidden md:table-cell">Katılım</th>
                  <th className="p-3 sm:p-4" />
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black dark:divide-gray-700">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <img src={user.avatar} alt={user.username} className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-black dark:border-gray-600 object-cover flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white truncate">{user.username}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 sm:p-4 hidden sm:table-cell"><span className="font-bold text-xs sm:text-sm">Lv.{user.level}</span></td>
                    <td className="p-3 sm:p-4"><span className="font-bold text-xs sm:text-sm text-amber-600 dark:text-amber-400">{user.points.toLocaleString('tr-TR')}</span></td>
                    <td className="p-3 sm:p-4">
                      <span className={`badge text-xs ${user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                        {user.status === 'active' ? 'Aktif' : 'Askıya Alınmış'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 text-xs text-gray-500 hidden md:table-cell">{new Date(user.joinDate).toLocaleDateString('tr-TR')}</td>
                    <td className="p-3 sm:p-4">
                      <div className="flex items-center gap-0.5 sm:gap-1">
                        <button onClick={() => { playSound('click'); setModal({ user, mode: 'view' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-500 transition-colors" title="Görüntüle">
                          <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button onClick={() => { playSound('click'); setModal({ user, mode: 'inventory' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-purple-500 transition-colors" title="Envanteri Yönet">
                          <Package size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button onClick={() => { playSound('click'); setModal({ user, mode: 'points' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-amber-500 transition-colors" title="Puanları Yönet">
                          <Gift size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button onClick={() => { playSound('click'); setModal({ user, mode: 'edit' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#7B6EF6] transition-colors" title="Düzenle">
                          <Edit3 size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button onClick={() => { playSound('click'); setModal({ user, mode: 'suspend' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-500 transition-colors" title="Askıya Al">
                          <Slash size={12} className="sm:w-3.5 sm:h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-gray-500">{tr.common.noData}</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
