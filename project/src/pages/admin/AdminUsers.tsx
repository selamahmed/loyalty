import React, { useState, useCallback } from 'react';
import { Search, Slash, Eye, Plus, X, Check, Gift, Trash2, Package, Zap, CheckSquare, Square, Users, ShieldCheck, ShieldOff, CreditCard as Edit3 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { adminUsers } from '../../data/mockData';
import { playSound } from '../../lib/sounds';
import { tr } from '../../lib/tr';

type RoleType = 'customer' | 'store_admin' | 'cashier';

interface ManagedUser {
  id: string;
  username: string;
  email: string;
  level: number;
  points: number;
  status: string;
  joinDate: string;
  avatar: string;
  role: RoleType;
}

const INITIAL_USERS: ManagedUser[] = [
  { ...adminUsers[0], role: 'customer'   },
  { ...adminUsers[1], role: 'store_admin'},
  { ...adminUsers[2], role: 'cashier'    },
  { ...adminUsers[3], role: 'customer'   },
  { ...adminUsers[4], role: 'customer'   },
];

const roleLabel: Record<RoleType, string> = {
  customer:    'Müşteri',
  store_admin: 'Mağaza Yön.',
  cashier:     'Kasiyer',
};

const roleColor: Record<RoleType, string> = {
  customer:    '#6b7280',
  store_admin: '#22c55e',
  cashier:     '#3b82f6',
};

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

/* ─────────────────── Promote / Revoke modal ─────────────────── */
const PromoteModal: React.FC<{
  user: ManagedUser;
  onClose: () => void;
  onSave: (id: string, role: RoleType) => void;
}> = ({ user, onClose, onSave }) => {
  const [selected, setSelected] = useState<RoleType>(user.role === 'customer' ? 'store_admin' : 'customer');
  const [done, setDone] = useState(false);

  const isPromotion = user.role === 'customer';

  const handle = () => {
    setDone(true);
    setTimeout(() => { onSave(user.id, selected); onClose(); }, 900);
  };

  const ROLE_OPTIONS: { value: RoleType; label: string; desc: string; color: string }[] = isPromotion
    ? [
        { value: 'store_admin', label: 'Mağaza Yöneticisi', desc: 'Mağaza ürünlerini yönetebilir',             color: '#22c55e' },
        { value: 'cashier',     label: 'Kasiyer',           desc: 'QR tarama ve işlem görüntüleme yapabilir',  color: '#3b82f6' },
      ]
    : [
        { value: 'customer', label: 'Müşteri', desc: 'Yönetim yetkisi iptal edilir, normal müşteri olur', color: '#6b7280' },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-sm rounded-2xl overflow-hidden"
        style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 8px 0px var(--dark-border)' }}>

        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '2px solid var(--dark-border)' }}>
          <div>
            <p className="font-black" style={{ color: 'var(--text-dark)' }}>
              {isPromotion ? 'Yönetici Rolü Ver' : 'Yetkiyi İptal Et'}
            </p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.username}</p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>

        {done ? (
          <div className="p-10 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: isPromotion ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)', border: `2px solid ${isPromotion ? '#22c55e' : '#ef4444'}` }}>
              {isPromotion ? <ShieldCheck size={28} style={{ color: '#22c55e' }} /> : <ShieldOff size={28} style={{ color: '#ef4444' }} />}
            </div>
            <p className="font-black text-lg" style={{ color: 'var(--text-dark)' }}>
              {isPromotion ? 'Yetki verildi!' : 'Yetki iptal edildi!'}
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
              <img src={user.avatar} alt={user.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" style={{ border: '2px solid var(--dark-border)' }} />
              <div>
                <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{user.username}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Şu anki rol: <span className="font-black" style={{ color: roleColor[user.role] }}>{roleLabel[user.role]}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black block" style={{ color: 'var(--text-muted)' }}>
                {isPromotion ? 'YENİ ROL SEÇ' : 'DEĞİŞTİRİLECEK ROL'}
              </label>
              {ROLE_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setSelected(opt.value)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all"
                  style={{
                    background: selected === opt.value ? `${opt.color}12` : 'var(--tab-bg)',
                    border: `2px solid ${selected === opt.value ? opt.color : 'var(--dark-border)'}`,
                    boxShadow: selected === opt.value ? `0px 2px 0px ${opt.color}` : 'none',
                  }}>
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: selected === opt.value ? opt.color : 'var(--text-muted)' }}>
                    {selected === opt.value && <div className="w-2 h-2 rounded-full" style={{ background: opt.color }} />}
                  </div>
                  <div>
                    <p className="font-black text-sm" style={{ color: opt.color }}>{opt.label}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{opt.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {!isPromotion && (
              <div className="p-3 rounded-xl" style={{ background: 'rgba(239,68,68,0.06)', border: '2px solid #ef4444' }}>
                <p className="text-xs font-black" style={{ color: '#ef4444' }}>
                  Bu kullanıcının yönetici yetkisi kaldırılacak ve normal müşteri statüsüne düşürülecektir.
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button onClick={onClose} className="flex-1 py-3 rounded-xl font-black text-sm"
                style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>
                İptal
              </button>
              <button onClick={handle} className="flex-1 py-3 rounded-xl font-black text-sm text-white"
                style={{
                  background: isPromotion ? '#22c55e' : '#ef4444',
                  border: '2.5px solid var(--dark-border)',
                  boxShadow: '0px 3px 0px var(--dark-border)',
                }}>
                {isPromotion ? 'Yetki Ver' : 'Yetkiyi İptal Et'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────── User modal ─────────────────────────── */
const UserModal: React.FC<{
  user: ManagedUser;
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

  const handleSave = () => { setSaved(true); setTimeout(onClose, 900); };

  const removeItem  = (id: string) => setInventory(prev => prev.filter(i => i.id !== id));
  const toggleUsed  = (id: string) => setInventory(prev => prev.map(i => i.id === id ? { ...i, used: !i.used } : i));

  const addItem = () => {
    if (!newItemTitle.trim()) return;
    const prefix = newItemType.slice(0, 4).toUpperCase();
    const code   = `${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setInventory(prev => [{
      id: Date.now().toString(), title: newItemTitle.trim(), type: newItemType,
      code, expires: newItemExpires || '2026-12-31', used: false,
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop',
    }, ...prev]);
    setNewItemTitle(''); setNewItemExpires(''); setShowAddItem(false);
  };

  const modeTitle: Record<string, string> = {
    view: 'Kullanıcı Profili', edit: 'Kullanıcıyı Düzenle',
    suspend: 'Kullanıcıyı Askıya Al', points: 'Puanları Yönet', inventory: 'Kullanıcı Envanteri',
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
            <span className={`badge text-xs mt-1 inline-block ${user.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
              {user.status === 'active' ? 'Aktif' : 'Askıya Alınmış'}
            </span>
          </div>
        </div>

        {mode === 'view' && (
          <div className="space-y-3">
            {[
              { label: 'Seviye',         value: `${user.level}` },
              { label: 'Toplam Puanlar', value: user.points.toLocaleString('tr-TR') },
              { label: 'Rol',            value: roleLabel[user.role] },
              { label: 'Durum',          value: user.status === 'active' ? 'Aktif' : 'Askıya Alınmış' },
              { label: 'Katılım Tarihi', value: new Date(user.joinDate).toLocaleDateString('tr-TR') },
            ].map(row => (
              <div key={row.label} className="flex justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <span className="text-sm text-gray-600 dark:text-gray-400">{row.label}</span>
                <span className="font-bold text-sm text-gray-900 dark:text-white">{row.value}</span>
              </div>
            ))}
          </div>
        )}

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

        {mode === 'suspend' && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-red-200 dark:border-red-700">
              <p className="font-bold text-red-700 dark:text-red-400">{user.username} kullanıcısını askıya al?</p>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Bu kullanıcının hesabına erişimini engelleyecektir.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1">{tr.common.cancel}</button>
              <button onClick={handleSave} className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold border-2 border-red-700">
                {saved ? 'Askıya Alındı!' : 'Kullanıcıyı Askıya Al'}
              </button>
            </div>
          </div>
        )}

        {mode === 'points' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-700">
              <p className="text-xs font-bold text-blue-900 dark:text-blue-200">Mevcut Puanlar: <span className="text-lg text-blue-600 dark:text-blue-300">{user.points.toLocaleString('tr-TR')}</span></p>
            </div>
            <div><label className="block font-bold text-sm mb-2">Miktar</label><input type="number" placeholder="Puan miktarını girin" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} className="input-field w-full" /></div>
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

        {mode === 'inventory' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
                {inventory.length} öğe • {inventory.filter(i => !i.used).length} aktif
              </p>
              <button onClick={() => setShowAddItem(v => !v)} style={{ padding: '6px 12px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Plus size={12} /> Ekle
              </button>
            </div>
            {showAddItem && (
              <div style={{ padding: 12, borderRadius: 14, border: '2px solid var(--dark-border)', background: 'var(--tab-bg)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <input type="text" placeholder="Öğe adı" value={newItemTitle} onChange={e => setNewItemTitle(e.target.value)} className="input-field" />
                <div style={{ display: 'flex', gap: 6 }}>
                  <select value={newItemType} onChange={e => setNewItemType(e.target.value as 'coupon' | 'ticket' | 'reward')} className="input-field" style={{ flex: 1 }}>
                    <option value="coupon">Kupon</option><option value="ticket">Bilet</option><option value="reward">Ödül</option>
                  </select>
                  <input type="date" value={newItemExpires} onChange={e => setNewItemExpires(e.target.value)} className="input-field" style={{ flex: 1 }} />
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setShowAddItem(false)} style={{ flex: 1, padding: '7px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>İptal</button>
                  <button onClick={addItem} style={{ flex: 2, padding: '7px', borderRadius: 10, fontWeight: 900, fontSize: 12, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2px solid var(--dark-border)', cursor: 'pointer' }}>Ekle</button>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {inventory.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: 'var(--text-muted)' }}><Package size={28} style={{ margin: '0 auto 8px', opacity: 0.4 }} /><p style={{ fontWeight: 700, margin: 0, fontSize: 12 }}>Envanter boş</p></div>}
              {inventory.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 12, border: '2px solid var(--dark-border)', background: item.used ? 'rgba(107,114,128,0.06)' : 'var(--card-bg)', opacity: item.used ? 0.65 : 1 }}>
                  <img src={item.image} alt={item.title} style={{ width: 36, height: 36, borderRadius: 9, objectFit: 'cover', flexShrink: 0, border: '2px solid var(--dark-border)' }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textDecoration: item.used ? 'line-through' : 'none' }}>{item.title}</p>
                    <div style={{ display: 'flex', gap: 5 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 9, color: typeColor[item.type], fontWeight: 700 }}>{item.code}</span>
                      <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 999, background: `${typeColor[item.type]}20`, color: typeColor[item.type], border: `1px solid ${typeColor[item.type]}`, fontWeight: 900 }}>{typeLabel[item.type]}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    <button onClick={() => toggleUsed(item.id)} style={{ width: 26, height: 26, borderRadius: 7, background: item.used ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.10)', border: `1.5px solid ${item.used ? '#22c55e' : '#9ca3af'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Check size={11} color={item.used ? '#16a34a' : '#9ca3af'} />
                    </button>
                    <button onClick={() => removeItem(item.id)} style={{ width: 26, height: 26, borderRadius: 7, background: 'rgba(239,68,68,0.10)', border: '1.5px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Trash2 size={11} color="#ef4444" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={onClose} className="btn-secondary w-full mt-1">Kapat</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────── Bulk Points Modal ─────────────────────── */
const BulkPointsModal: React.FC<{
  users: ManagedUser[];
  onClose: () => void;
  onDone: (msg: string) => void;
}> = ({ users, onClose, onDone }) => {
  const [amount, setAmount]   = useState('');
  const [reason, setReason]   = useState('manual_award');
  const [saving, setSaving]   = useState(false);

  const apply = () => {
    const pts = parseInt(amount);
    if (!pts || isNaN(pts)) return;
    setSaving(true);
    setTimeout(() => {
      onDone(`${pts > 0 ? '+' : ''}${pts} puan ${users.length} kullanıcıya uygulandı.`);
      onClose();
    }, 700);
  };

  const pts = parseInt(amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="card max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">Toplu Puan İşlemi</h3>
            <p className="text-xs text-gray-500 mt-0.5">{users.length} kullanıcı seçili</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '10px 12px', borderRadius: 14, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', marginBottom: 16 }}>
          {users.slice(0, 5).map(u => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 8px', borderRadius: 999, background: 'var(--card-bg)', border: '2px solid var(--dark-border)' }}>
              <img src={u.avatar} alt={u.username} style={{ width: 18, height: 18, borderRadius: '50%', objectFit: 'cover' }} />
              <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)' }}>{u.username}</span>
            </div>
          ))}
          {users.length > 5 && (
            <div style={{ padding: '3px 8px', borderRadius: 999, background: 'rgba(123,110,246,0.12)', border: '2px solid #7B6EF6' }}>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#7B6EF6' }}>+{users.length - 5} daha</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="block font-black text-sm mb-2">Puan Miktarı</label>
            <p className="text-xs text-gray-500 mb-2">Pozitif değer = ödül ver · Negatif değer = puan düş</p>
            <input type="number" placeholder="örn. 100 veya -50" value={amount} onChange={e => setAmount(e.target.value)} className="input-field w-full text-lg font-black" />
            {pts !== 0 && (
              <p style={{ fontSize: 12, fontWeight: 900, marginTop: 6, color: pts > 0 ? '#16a34a' : '#dc2626' }}>
                {pts > 0 ? '✅' : '⚠️'} Her kullanıcıya <strong>{pts > 0 ? '+' : ''}{pts}</strong> puan · Toplam: <strong>{(pts * users.length).toLocaleString('tr-TR')}</strong>
              </p>
            )}
          </div>
          <div>
            <label className="block font-black text-sm mb-2">İşlem Nedeni</label>
            <select value={reason} onChange={e => setReason(e.target.value)} className="input-field w-full">
              <option value="manual_award">Manuel Ödül</option>
              <option value="bonus">Bonus/Promosyon</option>
              <option value="campaign">Kampanya</option>
              <option value="correction">Toplu Düzeltme</option>
              <option value="compensation">Tazminat</option>
              <option value="penalty">Toplu Ceza</option>
            </select>
          </div>
          {pts !== 0 && (
            <div style={{ padding: '10px 14px', borderRadius: 12, background: pts > 0 ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', border: `2px solid ${pts > 0 ? '#22c55e' : '#ef4444'}` }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: pts > 0 ? '#16a34a' : '#dc2626', margin: 0 }}>
                {pts > 0 ? 'Puan ekleme' : 'Puan düşme'} işlemi · {users.length} kullanıcı · Neden: {reason}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onClose} className="btn-secondary flex-1">İptal</button>
            <button onClick={apply} disabled={!pts || saving} style={{ opacity: (!pts || saving) ? 0.5 : 1 }} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {saving
                ? <><div style={{ width: 14, height: 14, border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />Uygulanıyor...</>
                : <><Zap size={14} />{pts > 0 ? 'Puan Ekle' : 'Puan Düş'}</>
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────── Main page ─────────────────────────── */
const AdminUsers: React.FC = () => {
  const [users, setUsers]             = useState<ManagedUser[]>(INITIAL_USERS);
  const [search, setSearch]           = useState('');
  const [modal, setModal]             = useState<{ user: ManagedUser; mode: 'view' | 'edit' | 'suspend' | 'points' | 'inventory' } | null>(null);
  const [promoteTarget, setPromoteTarget] = useState<ManagedUser | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole]   = useState('all');
  const [selected, setSelected]       = useState<Set<string>>(new Set());
  const [showBulk, setShowBulk]       = useState(false);
  const [toast, setToast]             = useState<string | null>(null);

  const filtered = users.filter(u => {
    const matchSearch = u.username.toLowerCase().includes(search.toLowerCase()) || u.email.includes(search);
    const matchStatus = filterStatus === 'all' || u.status === filterStatus;
    const matchRole   = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchStatus && matchRole;
  });

  const allSelected  = filtered.length > 0 && filtered.every(u => selected.has(u.id));
  const someSelected = filtered.some(u => selected.has(u.id));

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(u => n.delete(u.id)); return n; });
    } else {
      setSelected(prev => { const n = new Set(prev); filtered.forEach(u => n.add(u.id)); return n; });
    }
  }, [allSelected, filtered]);

  const toggleOne = useCallback((id: string) => {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  }, []);

  const clearSelection = () => setSelected(new Set());

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

  const handleRoleChange = (id: string, newRole: RoleType) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    const user = users.find(u => u.id === id);
    if (user) showToast(`${user.username} → ${roleLabel[newRole]}`);
  };

  const selectedUsers = users.filter(u => selected.has(u.id));

  return (
    <AdminLayout>
      {modal && <UserModal user={modal.user} mode={modal.mode} onClose={() => setModal(null)} />}
      {promoteTarget && (
        <PromoteModal
          user={promoteTarget}
          onClose={() => setPromoteTarget(null)}
          onSave={handleRoleChange}
        />
      )}
      {showBulk && (
        <BulkPointsModal
          users={selectedUsers}
          onClose={() => setShowBulk(false)}
          onDone={(msg) => { clearSelection(); showToast(msg); }}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 200, padding: '12px 20px', borderRadius: 16, background: 'rgba(34,197,94,0.95)', color: 'white', fontWeight: 900, fontSize: 14, border: '2px solid #16a34a', boxShadow: '0 4px 0 #15803d', display: 'flex', alignItems: 'center', gap: 8, animation: 'slideDown 0.25s ease-out' }}>
          <Check size={15} /> {toast}
        </div>
      )}

      {selected.size > 0 && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', zIndex: 100, padding: '12px 20px', borderRadius: 20, background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0 8px 0 var(--dark-border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center', animation: 'slideUp 0.25s cubic-bezier(0.34,1.56,0.64,1)', maxWidth: 'calc(100vw - 48px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={14} color="white" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)' }}>
              <strong style={{ color: '#7B6EF6' }}>{selected.size}</strong> kullanıcı seçili
            </span>
          </div>
          <div style={{ height: 24, width: 2, background: 'var(--dark-border)', borderRadius: 1 }} />
          <button onClick={() => setShowBulk(true)} style={{ padding: '8px 16px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={14} /> Toplu Puan İşlemi
          </button>
          <button onClick={clearSelection} style={{ padding: '8px 14px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer' }}>
            Seçimi Temizle
          </button>
        </div>
      )}

      <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-x-hidden" style={{ paddingBottom: selected.size > 0 ? 100 : undefined }}>
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
          <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="input-field py-1.5 sm:py-2 w-auto pr-8 text-sm">
            <option value="all">Tüm Roller</option>
            <option value="customer">Müşteri</option>
            <option value="store_admin">Mağaza Yön.</option>
            <option value="cashier">Kasiyer</option>
          </select>
        </div>

        <div className="card overflow-hidden">
          <div className="w-full overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black dark:border-gray-700">
                  <th className="p-3 sm:p-4 w-10">
                    <button onClick={toggleAll} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, cursor: 'pointer', background: 'none', border: 'none' }}>
                      {allSelected ? <CheckSquare size={16} color="#7B6EF6" /> : someSelected ? <CheckSquare size={16} color="#a78bfa" style={{ opacity: 0.5 }} /> : <Square size={16} color="var(--text-muted)" />}
                    </button>
                  </th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Kullanıcı</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider hidden sm:table-cell">Seviye</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Puanlar</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider">Rol</th>
                  <th className="text-left p-3 sm:p-4 text-xs font-black text-gray-500 uppercase tracking-wider hidden md:table-cell">Durum</th>
                  <th className="p-3 sm:p-4" />
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black dark:divide-gray-700">
                {filtered.map(user => {
                  const isSelected = selected.has(user.id);
                  const isAdmin = user.role !== 'customer';
                  return (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                      style={{ background: isSelected ? 'rgba(123,110,246,0.06)' : '' }}>
                      <td className="p-3 sm:p-4 w-10">
                        <button onClick={() => toggleOne(user.id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 20, height: 20, cursor: 'pointer', background: 'none', border: 'none' }}>
                          {isSelected ? <CheckSquare size={16} color="#7B6EF6" /> : <Square size={16} color="var(--text-muted)" />}
                        </button>
                      </td>
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
                        <span className="badge text-xs font-black px-2 py-1 rounded-full"
                          style={{ background: `${roleColor[user.role]}18`, color: roleColor[user.role], border: `1.5px solid ${roleColor[user.role]}` }}>
                          {roleLabel[user.role]}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4 hidden md:table-cell">
                        <span className={`badge text-xs ${user.status === 'active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-500'}`}>
                          {user.status === 'active' ? 'Aktif' : 'Askıya Alınmış'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="flex items-center gap-0.5 sm:gap-1">
                          <button onClick={() => { playSound('click'); setModal({ user, mode: 'view' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-blue-500 transition-colors" title="Görüntüle">
                            <Eye size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button onClick={() => { playSound('click'); setModal({ user, mode: 'points' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-amber-500 transition-colors" title="Puanları Yönet">
                            <Gift size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          <button onClick={() => { playSound('click'); setModal({ user, mode: 'edit' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-[#7B6EF6] transition-colors" title="Düzenle">
                            <Edit3 size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                          {!isAdmin ? (
                            <button onClick={() => { playSound('click'); setPromoteTarget(user); }}
                              className="p-1.5 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-gray-500 hover:text-green-500 transition-colors"
                              title="Yönetici Rolü Ver">
                              <ShieldCheck size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          ) : (
                            <button onClick={() => { playSound('click'); setPromoteTarget(user); }}
                              className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-500 hover:text-red-500 transition-colors"
                              title="Yetkiyi İptal Et">
                              <ShieldOff size={12} className="sm:w-3.5 sm:h-3.5" />
                            </button>
                          )}
                          <button onClick={() => { playSound('click'); setModal({ user, mode: 'suspend' }); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-500 transition-colors" title="Askıya Al">
                            <Slash size={12} className="sm:w-3.5 sm:h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center"><p className="text-gray-500">{tr.common.noData}</p></div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateX(-50%) translateY(16px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </AdminLayout>
  );
};

export default AdminUsers;
