import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X, Copy, Check, RefreshCw, QrCode, Package, Search, Tag, Ticket, Gift, ArrowLeft, User, ChevronRight } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllUsers } from '../../services/admin';

type UserType = { id: string; username: string; email: string; level: number; current_points: number; status: string; created_at: string; avatar_url: string | null; role: string };

const card = 'rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151]';

const typeColor: Record<string, string> = { coupon: '#3b82f6', ticket: '#f59e0b', reward: '#22c55e' };
const typeLabel: Record<string, string> = { coupon: 'Kupon', ticket: 'Bilet', reward: 'Ödül' };
const typeIcon: Record<string, React.ElementType> = { coupon: Tag, ticket: Ticket, reward: Gift };

export interface InvItem {
  id: string;
  type: 'coupon' | 'ticket' | 'reward';
  title: string;
  description: string;
  code: string;
  expires: string;
  quantity: number;
  points: number;
  image: string;
  barcode: string;
  used: boolean;
}

type InvItemForm = Omit<InvItem, 'id'>;

const EMPTY_FORM: InvItemForm = {
  type: 'coupon', title: '', description: '',
  expires: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  code: '', used: false, quantity: 1, image: '', points: 100, barcode: '',
};

function genCode(type: string) {
  return `${type.slice(0, 4).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function seedInventory(userId: string): InvItem[] {
  const seed = userId.charCodeAt(userId.length - 1);
  const pool: InvItem[] = [
    { id: `${userId}-a`, type: 'coupon', title: 'Ücretsiz Kahve', description: 'Bir adet boyutsuz sıcak içecek', code: `KAFE-${userId.slice(-4).toUpperCase()}`, expires: '2026-09-30', quantity: 1, points: 120, image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=80&h=80&fit=crop', barcode: '', used: false },
    { id: `${userId}-b`, type: 'coupon', title: '%20 İndirim', description: 'Tüm ürünlerde geçerli', code: `IND-${userId.slice(-4).toUpperCase()}`, expires: '2026-08-15', quantity: 2, points: 200, image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=80&h=80&fit=crop', barcode: '', used: false },
    { id: `${userId}-c`, type: 'ticket', title: 'Konser Bileti', description: 'Özel etkinlik girişi', code: `KONS-${userId.slice(-4).toUpperCase()}`, expires: '2026-07-20', quantity: 1, points: 500, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&h=80&fit=crop', barcode: '', used: seed % 2 === 0 },
    { id: `${userId}-d`, type: 'reward', title: 'Özel Çanta', description: 'Limited edition hediye çantası', code: `HDYE-${userId.slice(-4).toUpperCase()}`, expires: '2026-12-31', quantity: 1, points: 800, image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop', barcode: '', used: false },
    { id: `${userId}-e`, type: 'coupon', title: 'Ücretsiz Kargo', description: 'Bir sonraki sipariş için', code: `KARG-${userId.slice(-4).toUpperCase()}`, expires: '2026-10-01', quantity: 3, points: 80, image: '', barcode: '', used: false },
  ];
  return pool.slice(0, (seed % 3) + 3);
}

const QRPreview: React.FC<{ code: string; size?: number }> = ({ code, size = 120 }) => (
  <div style={{ background: 'white', padding: 8, borderRadius: 12, border: '2px solid #e5e7eb', display: 'inline-block' }}>
    <img src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(code)}&size=${size}x${size}&margin=6`} alt={`QR:${code}`} style={{ width: size, height: size, display: 'block', borderRadius: 6 }} />
  </div>
);

/* ─── User selection screen ─── */
const UserPickerScreen: React.FC<{ onSelect: (u: UserType) => void }> = ({ onSelect }) => {
  const [search, setSearch] = useState('');
  const [allUsers, setAllUsers] = useState<UserType[]>([]);

  useEffect(() => {
    getAllUsers(0, 50, search || undefined).then(profiles => {
      setAllUsers(profiles.map(p => ({
        id: p.id,
        username: p.username ?? p.email.split('@')[0],
        email: p.email,
        level: p.level,
        current_points: p.current_points,
        status: p.status,
        created_at: p.created_at,
        avatar_url: p.avatar_url,
        role: p.role,
      })));
    }).catch(() => setAllUsers([]));
  }, [search]);

  const filtered = allUsers;

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-3xl mx-auto">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: 16, background: 'linear-gradient(180deg,#a78bfa,#6d28d9)', border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Package size={22} color="white" />
        </div>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: 22, color: 'var(--text-dark)', margin: 0 }}>Envanter Yönetimi</h1>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Envanterini yönetmek için bir kullanıcı seçin</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Kullanıcı ara (ad veya e-posta)..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 14, border: '2.5px solid var(--dark-border)', background: 'var(--card-bg)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', outline: 'none', boxSizing: 'border-box', boxShadow: '0 3px 0 var(--dark-border)' }}
        />
      </div>

      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{filtered.length} kullanıcı</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(user => (
          <button
            key={user.id}
            onClick={() => onSelect(user)}
            style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 16, border: '2.5px solid var(--dark-border)', background: 'var(--card-bg)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.1s, box-shadow 0.1s, background 0.1s', width: '100%' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--tab-bg)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--card-bg)'; (e.currentTarget as HTMLElement).style.transform = ''; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0px 0 var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 var(--dark-border)'; }}
          >
            <img src={user.avatar_url ?? ""} alt={user.username} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--dark-border)', flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.username}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: '#f59e0b', margin: 0 }}>{user.current_points.toLocaleString('tr-TR')} puan</p>
                <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0 }}>Lv. {user.level}</p>
              </div>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(123,110,246,0.12)', border: '2px solid #7B6EF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={14} color="#7B6EF6" />
              </div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', borderRadius: 16, border: '2px dashed var(--dark-border)' }}>
            <User size={36} style={{ margin: '0 auto 10px', opacity: 0.3 }} />
            <p style={{ fontWeight: 900, color: 'var(--text-muted)', margin: 0 }}>Kullanıcı bulunamadı</p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ─── Inventory management screen ─── */
const InventoryScreen: React.FC<{
  user: UserType;
  items: InvItem[];
  onBack: () => void;
  onAdd: (item: InvItemForm) => void;
  onUpdate: (id: string, item: InvItemForm) => void;
  onDelete: (id: string) => void;
  onToggleUsed: (id: string) => void;
}> = ({ user, items, onBack, onAdd, onUpdate, onDelete, onToggleUsed }) => {
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState<'all' | 'coupon' | 'ticket' | 'reward'>('all');
  const [showUsed, setShowUsed]       = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [editingItem, setEditingItem] = useState<InvItem | null>(null);
  const [form, setForm]               = useState<InvItemForm>(EMPTY_FORM);
  const [saved, setSaved]             = useState(false);
  const [copied, setCopied]           = useState<string | null>(null);
  const [qrId, setQrId]               = useState<string | null>(null);
  const [delConfirm, setDelConfirm]   = useState<string | null>(null);

  const filtered = items
    .filter(i => filterType === 'all' || i.type === filterType)
    .filter(i => showUsed || !i.used)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => { setEditingItem(null); setForm({ ...EMPTY_FORM, code: genCode('coupon') }); setShowModal(true); };
  const openEdit = (item: InvItem) => { setEditingItem(item); setForm({ type: item.type, title: item.title, description: item.description, expires: item.expires.slice(0, 10), code: item.code, used: item.used, quantity: item.quantity, image: item.image, points: item.points, barcode: item.barcode }); setShowModal(true); };

  const handleSave = () => {
    if (!form.title || !form.code) return;
    if (editingItem) { onUpdate(editingItem.id, form); } else { onAdd(form); }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowModal(false); }, 700);
  };

  const handleCopy = (code: string) => { navigator.clipboard.writeText(code).catch(() => {}); setCopied(code); setTimeout(() => setCopied(null), 2000); };

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className={`${card} max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between p-5 border-b-2 border-black dark:border-gray-600">
              <h3 className="font-black text-lg text-gray-900 dark:text-white">{editingItem ? 'Öğeyi Düzenle' : 'Yeni Öğe Ekle'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Tür</label>
                <div className="flex gap-2">
                  {(['coupon', 'ticket', 'reward'] as const).map(t => {
                    const Icon = typeIcon[t];
                    return (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t, code: genCode(t) }))} className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 font-bold text-sm transition-all"
                        style={{ borderColor: form.type === t ? typeColor[t] : '#000', background: form.type === t ? typeColor[t] + '18' : 'transparent', color: form.type === t ? typeColor[t] : undefined, boxShadow: form.type === t ? `0 3px 0 ${typeColor[t]}` : '0 3px 0 #000' }}>
                        <Icon size={16} color={form.type === t ? typeColor[t] : undefined} />
                        {typeLabel[t]}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Başlık *</label><input type="text" placeholder="Ürün başlığı..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000]" /></div>
              <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Açıklama</label><textarea placeholder="Ürün açıklaması..." value={form.description} rows={2} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none resize-none dark:text-white shadow-[0_3px_0_#000]" /></div>
              <div>
                <label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Kod *</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="KOD-XXXX" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} className="flex-1 px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono font-bold text-sm uppercase focus:outline-none dark:text-white shadow-[0_3px_0_#000]" />
                  <button onClick={() => setForm(f => ({ ...f, code: genCode(f.type) }))} className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 font-bold text-sm hover:bg-gray-50 shadow-[0_3px_0_#000] active:translate-y-[3px] active:shadow-none"><RefreshCw size={14} /></button>
                </div>
                {form.code && <div className="mt-3 flex justify-center"><QRPreview code={form.code} size={100} /></div>}
              </div>
              <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Görsel URL</label><input type="text" placeholder="https://..." value={form.image} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000]" /></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Adet</label><input type="number" min={1} max={99} value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000]" /></div>
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Puan</label><input type="number" min={0} value={form.points} onChange={e => setForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000]" /></div>
                <div><label className="block text-xs font-black text-gray-500 uppercase tracking-wider mb-2">Son Kull.</label><input type="date" value={form.expires.slice(0, 10)} onChange={e => setForm(f => ({ ...f, expires: e.target.value }))} className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-xs focus:outline-none dark:text-white shadow-[0_3px_0_#000]" /></div>
              </div>
              <button onClick={handleSave} disabled={!form.title || !form.code} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black font-black text-sm text-white transition-all active:translate-y-[3px] active:shadow-none disabled:opacity-50"
                style={{ background: saved ? '#22c55e' : 'linear-gradient(180deg,#7B6EF6,#4F8EF7)', boxShadow: saved ? '0 4px 0 #16a34a' : '0 4px 0 #000' }}>
                {saved ? <><Check size={16} /> Kaydedildi!</> : <><Save size={16} /> {editingItem ? 'Kaydet' : 'Ekle'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {qrId && (() => {
        const item = items.find(i => i.id === qrId);
        if (!item) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setQrId(null)}>
            <div className={`${card} p-6 flex flex-col items-center gap-4`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between w-full">
                <div><h3 className="font-black text-gray-900 dark:text-white">{item.title}</h3><p className="text-xs text-gray-500">{item.code}</p></div>
                <button onClick={() => setQrId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
              </div>
              <QRPreview code={item.code} size={200} />
              <button onClick={() => handleCopy(item.code)} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-gray-600 font-bold text-sm bg-white dark:bg-gray-700 shadow-[0_3px_0_#000] active:translate-y-[2px] active:shadow-none">
                {copied === item.code ? <><Check size={14} className="text-green-500" /> Kopyalandı!</> : <><Copy size={14} /> Kodu Kopyala</>}
              </button>
            </div>
          </div>
        );
      })()}

      <div className="p-4 lg:p-6 space-y-5">
        {/* Back header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 12, border: '2.5px solid var(--dark-border)', background: 'var(--card-bg)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer', fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 0 var(--dark-border)'; }}>
            <ArrowLeft size={15} /> Kullanıcılar
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <img src={user.avatar_url ?? ""} alt={user.username} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2.5px solid var(--dark-border)', flexShrink: 0 }} />
            <div>
              <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>{user.username}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{user.email} · Lv.{user.level} · {user.current_points.toLocaleString('tr-TR')} puan</p>
            </div>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black font-black text-sm text-white shadow-[0_4px_0_#000] active:translate-y-[4px] active:shadow-none"
            style={{ background: 'linear-gradient(180deg,#7B6EF6,#4F8EF7)' }}>
            <Plus size={15} /> Öğe Ekle
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { val: items.length,                    label: 'Toplam',    emoji: '📦', color: '#7B6EF6' },
            { val: items.filter(i => !i.used).length, label: 'Aktif',   emoji: '✅', color: '#22c55e' },
            { val: items.filter(i => i.used).length,  label: 'Kullanıldı', emoji: '☑️', color: '#6b7280' },
          ].map(s => (
            <div key={s.label} className={`${card} p-3 text-center`}>
              <div className="text-xl mb-1">{s.emoji}</div>
              <p className="font-black text-xl" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs text-gray-500 font-bold">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[160px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Başlık veya kod ara..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-bold focus:outline-none dark:text-white shadow-[0_3px_0_#000]" />
          </div>
          {(['all', 'coupon', 'ticket', 'reward'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)} className="px-3 py-2 rounded-xl border-2 font-bold text-xs transition-all active:translate-y-[2px] active:shadow-none"
              style={{ borderColor: filterType === t ? (typeColor[t] || '#7B6EF6') : '#000', background: filterType === t ? (typeColor[t] || '#7B6EF6') + '18' : 'transparent', color: filterType === t ? (typeColor[t] || '#7B6EF6') : undefined, boxShadow: filterType === t ? `0 3px 0 ${typeColor[t] || '#000'}` : '0 3px 0 #000' }}>
              {t === 'all' ? 'Tümü' : typeLabel[t]}
            </button>
          ))}
          <button onClick={() => setShowUsed(s => !s)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-black dark:border-gray-600 font-bold text-xs shadow-[0_3px_0_#000] active:translate-y-[2px] active:shadow-none"
            style={{ background: showUsed ? '#f3f4f6' : 'transparent' }}>
            {showUsed ? 'Kullanılanları Gizle' : 'Kullanılanları Göster'}
          </button>
        </div>

        {/* Items */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className={`${card} p-12 text-center`}><Package size={36} className="text-gray-300 mx-auto mb-3" /><p className="font-black text-gray-500">Öğe bulunamadı</p></div>
          ) : filtered.map((item, idx) => {
            const cfg = typeColor[item.type];
            const IconComp = typeIcon[item.type] || Package;
            const expired = new Date(item.expires) < new Date();
            const days = Math.max(0, Math.ceil((new Date(item.expires).getTime() - Date.now()) / 86400000));
            return (
              <div key={item.id} className={`${card} p-4 flex items-start gap-4`} style={{ opacity: item.used ? 0.6 : 1, animation: `itemIn 0.3s ease-out ${idx * 0.04}s both` }}>
                <div style={{ width: 56, height: 56, borderRadius: 12, flexShrink: 0, overflow: 'hidden', border: '2px solid #000', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.image ? <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} /> : <IconComp size={22} color={cfg} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <p className="font-black text-sm text-gray-900 dark:text-white" style={{ textDecoration: item.used ? 'line-through' : 'none' }}>{item.title}</p>
                    <span style={{ padding: '2px 7px', borderRadius: 999, background: cfg + '18', color: cfg, border: `1.5px solid ${cfg}`, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', flexShrink: 0 }}>{typeLabel[item.type]}</span>
                    {item.used && <span style={{ padding: '2px 7px', borderRadius: 999, background: '#f3f4f6', color: '#6b7280', border: '1.5px solid #9ca3af', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>KULLANILDI</span>}
                    {expired && !item.used && <span style={{ padding: '2px 7px', borderRadius: 999, background: '#fef2f2', color: '#ef4444', border: '1.5px solid #ef4444', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>SÜRESİ DOLDU</span>}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-1">
                    <span className="font-mono font-bold" style={{ color: cfg }}>{item.code}</span>
                    <span>Adet: <strong className="text-gray-900 dark:text-white">{item.quantity}</strong></span>
                    <span>{item.points} puan</span>
                    <span style={{ color: expired ? '#ef4444' : days <= 3 ? '#f59e0b' : undefined }}>📅 {new Date(item.expires).toLocaleDateString('tr-TR')}{!expired && ` (${days}g)`}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => setQrId(item.id)} className="p-2 rounded-lg border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 shadow-[0_2px_0_#000] active:translate-y-[2px] active:shadow-none" title="QR"><QrCode size={13} /></button>
                  <button onClick={() => handleCopy(item.code)} className="p-2 rounded-lg border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 shadow-[0_2px_0_#000] active:translate-y-[2px] active:shadow-none" title="Kopyala">{copied === item.code ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}</button>
                  <button onClick={() => onToggleUsed(item.id)} className="p-2 rounded-lg border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 shadow-[0_2px_0_#000] active:translate-y-[2px] active:shadow-none" title={item.used ? 'Aktife Al' : 'Kullanıldı İşaretle'}><Check size={13} style={{ color: item.used ? '#22c55e' : '#9ca3af' }} /></button>
                  <button onClick={() => openEdit(item)} className="p-2 rounded-lg border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 shadow-[0_2px_0_#000] active:translate-y-[2px] active:shadow-none" title="Düzenle"><Edit2 size={13} /></button>
                  {delConfirm === item.id ? (
                    <div className="flex items-center gap-1">
                      <button onClick={() => { onDelete(item.id); setDelConfirm(null); }} className="px-2 py-1.5 rounded-lg border-2 border-red-500 bg-red-500 text-white font-bold text-xs shadow-[0_2px_0_#dc2626] active:translate-y-[2px] active:shadow-none">Evet</button>
                      <button onClick={() => setDelConfirm(null)} className="px-2 py-1.5 rounded-lg border-2 border-black bg-white text-xs font-bold shadow-[0_2px_0_#000] active:translate-y-[2px] active:shadow-none">Hayır</button>
                    </div>
                  ) : (
                    <button onClick={() => setDelConfirm(item.id)} className="p-2 rounded-lg border-2 border-red-300 bg-white dark:bg-gray-700 shadow-[0_2px_0_#fca5a5] active:translate-y-[2px] active:shadow-none" title="Sil"><Trash2 size={13} className="text-red-400" /></button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`@keyframes itemIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }`}</style>
    </>
  );
};

/* ─── Main AdminInventory ─── */
const AdminInventory: React.FC = () => {
  const [selectedUser, setSelectedUser]           = useState<UserType | null>(null);
  const [userInventories, setUserInventories]     = useState<Record<string, InvItem[]>>({});

  const getOrSeed = useCallback((userId: string) => {
    if (!userInventories[userId]) {
      const seed = seedInventory(userId);
      setUserInventories(prev => ({ ...prev, [userId]: seed }));
      return seed;
    }
    return userInventories[userId];
  }, [userInventories]);

  const handleSelectUser = (user: UserType) => {
    getOrSeed(user.id);
    setSelectedUser(user);
  };

  const handleAdd = (form: InvItemForm) => {
    if (!selectedUser) return;
    const newItem: InvItem = { ...form, id: `${selectedUser.id}-${Date.now()}` };
    setUserInventories(prev => ({ ...prev, [selectedUser.id]: [newItem, ...(prev[selectedUser.id] || [])] }));
  };

  const handleUpdate = (id: string, form: InvItemForm) => {
    if (!selectedUser) return;
    setUserInventories(prev => ({ ...prev, [selectedUser.id]: (prev[selectedUser.id] || []).map(i => i.id === id ? { ...i, ...form } : i) }));
  };

  const handleDelete = (id: string) => {
    if (!selectedUser) return;
    setUserInventories(prev => ({ ...prev, [selectedUser.id]: (prev[selectedUser.id] || []).filter(i => i.id !== id) }));
  };

  const handleToggleUsed = (id: string) => {
    if (!selectedUser) return;
    setUserInventories(prev => ({ ...prev, [selectedUser.id]: (prev[selectedUser.id] || []).map(i => i.id === id ? { ...i, used: !i.used } : i) }));
  };

  const items = selectedUser ? (userInventories[selectedUser.id] || getOrSeed(selectedUser.id)) : [];

  return (
    <AdminLayout>
      {selectedUser ? (
        <InventoryScreen
          user={selectedUser}
          items={items}
          onBack={() => setSelectedUser(null)}
          onAdd={handleAdd}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onToggleUsed={handleToggleUsed}
        />
      ) : (
        <UserPickerScreen onSelect={handleSelectUser} />
      )}
    </AdminLayout>
  );
};

export default AdminInventory;
