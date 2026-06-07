import React, { useState } from 'react';
import { QrCode, Plus, Trash2, X, Check, Copy, Edit2, Save, RefreshCw, Package, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { inventory as initialInventory } from '../../data/mockData';

/* ── QR Store Codes ── */
const initialQRCodes = [
  { id: '1', code: 'STORE42-BONUS',     location: 'Store #42 - Main St',   points: 75,  scans: 234, active: true },
  { id: '2', code: 'EVENT2026-SPECIAL', location: 'Summer Event Booth',     points: 150, scans: 89,  active: true },
  { id: '3', code: 'PARTNER-CAFE',      location: 'Coffee Corner',          points: 50,  scans: 412, active: true },
  { id: '4', code: 'PROMO-SALE',        location: 'Online Exclusive',       points: 100, scans: 156, active: false },
];

type InvItem = typeof initialInventory[0] & { code: string };

const typeColor: Record<string, string> = { coupon: '#3b82f6', ticket: '#f59e0b', reward: '#22c55e' };
const typeLabel: Record<string, string> = { coupon: 'Kupon', ticket: 'Bilet', reward: 'Ödül' };

/* ── QR image helper ── */
const QRImage: React.FC<{ code: string; size?: number }> = ({ code, size = 120 }) => (
  <div style={{ background: 'white', padding: 8, borderRadius: 12, border: '2px solid #e5e7eb', display: 'inline-block' }}>
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(code)}&size=${size}x${size}&margin=6`}
      alt={`QR:${code}`}
      style={{ width: size, height: size, display: 'block', borderRadius: 6 }}
    />
  </div>
);

const AdminQR: React.FC = () => {
  const [tab, setTab] = useState<'store' | 'inventory'>('inventory');

  /* ── Store QR state ── */
  const [codes, setCodes]         = useState(initialQRCodes);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm]           = useState({ location: '', points: 50, active: true });
  const [copied, setCopied]       = useState<string | null>(null);
  const [saved, setSaved]         = useState(false);
  const [previewCode, setPreviewCode] = useState<string | null>(null);

  /* ── Inventory code state ── */
  const [invItems, setInvItems]   = useState<InvItem[]>(initialInventory as InvItem[]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCode, setEditCode]   = useState('');
  const [invCopied, setInvCopied] = useState<string | null>(null);
  const [invPreview, setInvPreview] = useState<string | null>(null);

  /* ── Store QR handlers ── */
  const genCode = () => `${form.location.slice(0, 6).replace(/\s/g, '').toUpperCase()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
  const handleCreate = () => {
    setSaved(true);
    setCodes(prev => [{ id: Date.now().toString(), code: genCode(), ...form, scans: 0 }, ...prev]);
    setTimeout(() => { setSaved(false); setShowModal(false); setForm({ location: '', points: 50, active: true }); }, 800);
  };
  const handleCopy = (code: string) => { navigator.clipboard.writeText(code).catch(() => {}); setCopied(code); setTimeout(() => setCopied(null), 2000); };
  const toggleActive = (id: string) => setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  /* ── Inventory code handlers ── */
  const startEdit = (item: InvItem) => { setEditingId(item.id); setEditCode(item.code); };
  const saveEdit = (id: string) => {
    setInvItems(prev => prev.map(i => i.id === id ? { ...i, code: editCode.toUpperCase().trim() } : i));
    setEditingId(null);
  };
  const regenCode = (id: string, type: string) => {
    const prefix = type.slice(0, 4).toUpperCase();
    const newCode = `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    setInvItems(prev => prev.map(i => i.id === id ? { ...i, code: newCode } : i));
  };
  const handleInvCopy = (code: string) => { navigator.clipboard.writeText(code).catch(() => {}); setInvCopied(code); setTimeout(() => setInvCopied(null), 2000); };

  const card = 'rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151]';

  return (
    <AdminLayout>
      {/* ── Create QR modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className={`${card} max-w-sm w-full p-6`}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-black text-lg">QR Kod Oluştur</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-bold text-sm mb-1">Konum / Etiket</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="örn. Mağaza #50 - Meşe Cad." />
              </div>
              <div>
                <label className="block font-bold text-sm mb-1">Puan Ödülü</label>
                <input type="number" value={form.points} onChange={e => setForm({ ...form, points: +e.target.value })} className="input-field" min={1} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <button type="button" onClick={() => setForm({ ...form, active: !form.active })}
                  className={`w-5 h-5 rounded-md border-2 border-black dark:border-gray-500 flex items-center justify-center transition-colors ${form.active ? 'bg-green-500' : 'bg-white dark:bg-gray-700'}`}>
                  {form.active && <Check size={12} className="text-white" />}
                </button>
                <span className="font-medium text-sm">Aktif</span>
              </label>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="btn-secondary flex-1">İptal</button>
              <button onClick={handleCreate} className="btn-primary flex-1 flex items-center justify-center gap-2">
                {saved ? <><Check size={14} /> Oluşturuldu!</> : 'QR Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Preview modal ── */}
      {(previewCode || invPreview) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => { setPreviewCode(null); setInvPreview(null); }}>
          <div className={`${card} p-6 flex flex-col items-center gap-4 max-w-xs w-full`} onClick={e => e.stopPropagation()}>
            <h3 className="font-black text-base">QR Kod Önizleme</h3>
            <QRImage code={(previewCode || invPreview)!} size={200} />
            <p className="font-mono font-black text-sm tracking-widest text-center">{previewCode || invPreview}</p>
            <button onClick={() => { setPreviewCode(null); setInvPreview(null); }} className="btn-secondary w-full">Kapat</button>
          </div>
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-5 max-w-4xl mx-auto">

        {/* Page header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-black dark:border-gray-600 shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]" style={{ background: 'linear-gradient(180deg,#a78bfa,#6d28d9)' }}>🔲</div>
            <div>
              <h1 className="text-2xl font-black">QR & Kod Yöneticisi</h1>
              <p className="text-xs text-gray-500">Mağaza QR kodları ve envanter kodlarını yönet</p>
            </div>
          </div>
          {tab === 'store' && (
            <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Plus size={14} /> QR Oluştur
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-3">
          {[
            { id: 'inventory', label: '📦 Envanter Kodları', desc: 'Ürün kodlarını görüntüle & düzenle' },
            { id: 'store',     label: '🏪 Mağaza QR Kodları', desc: 'Kazanç QR kodlarını yönet' },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as 'store' | 'inventory')}
              className={`flex-1 py-3 px-4 rounded-2xl border-2 border-black dark:border-gray-600 font-black text-sm transition-all shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151] text-left ${tab === t.id ? 'bg-purple-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              <div>{t.label}</div>
              <div className="font-medium text-xs opacity-70 mt-0.5">{t.desc}</div>
            </button>
          ))}
        </div>

        {/* ══ INVENTORY CODES TAB ══ */}
        {tab === 'inventory' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Toplam Ürün',  val: invItems.length },
                { label: 'Aktif Kod',    val: invItems.filter(i => !i.used).length },
                { label: 'Kullanıldı',   val: invItems.filter(i => i.used).length },
              ].map(s => (
                <div key={s.label} className={`${card} p-4 text-center`}>
                  <p className="font-black text-2xl">{s.val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Item code rows */}
            <div className="space-y-3">
              {invItems.map(item => {
                const color = typeColor[item.type] || '#7B6EF6';
                const label = typeLabel[item.type] || item.type;
                const isEditing = editingId === item.id;
                return (
                  <div key={item.id} className={`${card} p-4`}>
                    <div className="flex items-start gap-4">
                      {/* Item image */}
                      <img src={item.image} alt={item.title} className="w-14 h-14 rounded-xl object-cover flex-shrink-0 border-2 border-black dark:border-gray-600" style={{ opacity: item.used ? 0.5 : 1 }} />

                      <div className="flex-1 min-w-0">
                        {/* Title + type */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="font-black text-sm" style={{ textDecoration: item.used ? 'line-through' : 'none', opacity: item.used ? 0.6 : 1 }}>{item.title}</p>
                          <span className="text-xs font-black px-2 py-0.5 rounded-full border" style={{ color, borderColor: color, background: `${color}18` }}>{label}</span>
                          {item.used && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500">Kullanıldı</span>}
                        </div>

                        {/* Expiry */}
                        <p className="text-xs text-gray-400 mb-2">Son kullanım: {new Date(item.expires).toLocaleDateString('tr-TR')}</p>

                        {/* Code field */}
                        {isEditing ? (
                          <div className="flex gap-2 items-center">
                            <input
                              value={editCode}
                              onChange={e => setEditCode(e.target.value.toUpperCase())}
                              onKeyDown={e => e.key === 'Enter' && saveEdit(item.id)}
                              className="input-field font-mono text-sm flex-1 py-2"
                              style={{ letterSpacing: '0.08em' }}
                              autoFocus
                            />
                            <button onClick={() => saveEdit(item.id)} className="p-2 rounded-xl bg-green-500 border-2 border-black shadow-[0_2px_0_#000] hover:shadow-none hover:translate-y-0.5 transition-all">
                              <Save size={14} className="text-white" />
                            </button>
                            <button onClick={() => setEditingId(null)} className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-black dark:border-gray-600">
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 items-center flex-wrap">
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl font-mono text-sm font-black tracking-widest flex-1 min-w-0" style={{ background: `${color}14`, border: `2px dashed ${color}` }}>
                              <span className="truncate">{item.code}</span>
                            </div>
                            {/* Actions */}
                            <div className="flex gap-1.5 flex-shrink-0">
                              {/* Copy */}
                              <button onClick={() => handleInvCopy(item.code)} title="Kopyala" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-white dark:bg-gray-700 hover:shadow-none hover:translate-y-0.5 transition-all">
                                {invCopied === item.code ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
                              </button>
                              {/* View QR */}
                              <button onClick={() => setInvPreview(item.code)} title="QR Göster" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-purple-100 dark:bg-purple-900/30 hover:shadow-none hover:translate-y-0.5 transition-all">
                                <QrCode size={13} className="text-purple-600" />
                              </button>
                              {/* Edit */}
                              {!item.used && (
                                <button onClick={() => startEdit(item)} title="Düzenle" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-amber-100 dark:bg-amber-900/30 hover:shadow-none hover:translate-y-0.5 transition-all">
                                  <Edit2 size={13} className="text-amber-600" />
                                </button>
                              )}
                              {/* Regenerate */}
                              {!item.used && (
                                <button onClick={() => regenCode(item.id, item.type)} title="Kodu Yenile" className="w-8 h-8 rounded-xl border-2 border-black dark:border-gray-600 shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 hover:shadow-none hover:translate-y-0.5 transition-all">
                                  <RefreshCw size={13} className="text-blue-600" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ STORE QR TAB ══ */}
        {tab === 'store' && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Toplam Kod',  val: codes.length.toString() },
                { label: 'Aktif',       val: codes.filter(c => c.active).length.toString() },
                { label: 'Toplam Tara', val: codes.reduce((s, c) => s + c.scans, 0).toLocaleString() },
              ].map(s => (
                <div key={s.label} className={`${card} p-4 text-center`}>
                  <p className="font-black text-2xl">{s.val}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              {codes.map(qr => (
                <div key={qr.id} className={`${card} p-4`}>
                  <div className="flex items-start gap-4">
                    {/* QR thumb */}
                    <button onClick={() => setPreviewCode(qr.code)} title="QR Önizle" className="flex-shrink-0 w-14 h-14 rounded-2xl bg-white dark:bg-gray-700 border-2 border-black dark:border-gray-600 flex items-center justify-center hover:scale-105 transition-transform overflow-hidden">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qr.code)}&size=60x60&margin=4`}
                        alt="qr"
                        style={{ width: 50, height: 50 }}
                      />
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-mono font-black text-sm tracking-wider truncate">{qr.code}</p>
                        <button onClick={() => handleCopy(qr.code)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 transition-colors">
                          {copied === qr.code ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{qr.location}</p>
                      <div className="flex items-center gap-3 text-xs flex-wrap">
                        <span className="font-bold text-amber-500">+{qr.points} puan</span>
                        <span className="text-gray-400">{qr.scans.toLocaleString()} tarama</span>
                        <button onClick={() => toggleActive(qr.id)} className={`flex items-center gap-1 font-bold transition-colors ${qr.active ? 'text-green-500' : 'text-gray-400'}`}>
                          {qr.active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {qr.active ? 'Aktif' : 'Pasif'}
                        </button>
                      </div>
                    </div>

                    <button onClick={() => setCodes(prev => prev.filter(c => c.id !== qr.id))} className="p-2 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminQR;
