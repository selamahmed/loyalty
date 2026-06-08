import React, { useState, useRef } from 'react';
import { Plus, Trash2, Edit2, Save, X, Copy, Check, RefreshCw, QrCode, Package, Eye, EyeOff, Search, Tag, Ticket, Gift, Image, Upload, AlertCircle } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useInventory, InventoryItem, InventoryItemType } from '../../context/InventoryContext';

const card = 'rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151]';

const typeColor: Record<string, string> = { coupon: '#3b82f6', ticket: '#f59e0b', reward: '#22c55e' };
const typeLabel: Record<string, string> = { coupon: 'Kupon', ticket: 'Bilet', reward: 'Ödül' };
const typeIcon: Record<string, React.FC<{ size?: number; color?: string }>> = { coupon: Tag, ticket: Ticket, reward: Gift };

const QRPreview: React.FC<{ code: string; size?: number }> = ({ code, size = 120 }) => (
  <div style={{ background: 'white', padding: 8, borderRadius: 12, border: '2px solid #e5e7eb', display: 'inline-block' }}>
    <img
      src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(code)}&size=${size}x${size}&margin=6`}
      alt={`QR:${code}`}
      style={{ width: size, height: size, display: 'block', borderRadius: 6 }}
    />
  </div>
);

const EMPTY_FORM: Omit<InventoryItem, 'id'> = {
  type: 'coupon',
  title: '',
  description: '',
  expires: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  code: '',
  used: false,
  quantity: 1,
  image: '',
  points: 100,
};

function genCode(type: string): string {
  const prefix = type.slice(0, 4).toUpperCase();
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

const AdminInventory: React.FC = () => {
  const { items, addItem, updateItem, deleteItem, markUsed } = useInventory();

  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState<'all' | InventoryItemType>('all');
  const [showUsed, setShowUsed]       = useState(false);
  const [showModal, setShowModal]     = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [form, setForm]               = useState<Omit<InventoryItem, 'id'>>(EMPTY_FORM);
  const [saved, setSaved]             = useState(false);
  const [copied, setCopied]           = useState<string | null>(null);
  const [qrPreviewId, setQrPreviewId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredItems = items
    .filter(i => filterType === 'all' || i.type === filterType)
    .filter(i => showUsed || !i.used)
    .filter(i => !search || i.title.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase()));

  const totalActive = items.filter(i => !i.used).length;
  const totalUsed   = items.filter(i => i.used).length;
  const totalQty    = items.reduce((s, i) => s + (i.quantity ?? 1), 0);

  const openAdd = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setForm({ type: item.type, title: item.title, description: item.description, expires: item.expires.slice(0, 10), code: item.code, used: item.used, quantity: item.quantity ?? 1, image: item.image ?? '', points: item.points ?? 0 });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title || !form.code) return;
    if (editingItem) {
      updateItem(editingItem.id, { ...form });
    } else {
      addItem(form);
    }
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowModal(false); }, 800);
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleDelete = (id: string) => {
    deleteItem(id);
    setDeleteConfirm(null);
  };

  const regenFormCode = () => setForm(f => ({ ...f, code: genCode(f.type) }));

  return (
    <AdminLayout>
      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}>
          <div className={`${card} max-w-lg w-full max-h-[90vh] overflow-y-auto`}>
            <div className="flex items-center justify-between p-5 border-b-2 border-black dark:border-gray-600">
              <h3 className="font-black text-lg text-gray-900 dark:text-white">
                {editingItem ? '✏️ Öğeyi Düzenle' : '➕ Yeni Öğe Ekle'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Type */}
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Tür</label>
                <div className="flex gap-2">
                  {(['coupon', 'ticket', 'reward'] as InventoryItemType[]).map(t => {
                    const Icon = typeIcon[t];
                    return (
                      <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))}
                        className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 font-bold text-sm transition-all"
                        style={{ borderColor: form.type === t ? typeColor[t] : '#000', background: form.type === t ? typeColor[t] + '18' : 'transparent', color: form.type === t ? typeColor[t] : undefined, boxShadow: form.type === t ? `0 3px 0 ${typeColor[t]}` : '0 3px 0 #000' }}
                      >
                        <Icon size={16} color={form.type === t ? typeColor[t] : undefined} />
                        {typeLabel[t]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Başlık *</label>
                <input type="text" placeholder="Ürün başlığı..." value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none focus:border-[#7B6EF6] dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Açıklama</label>
                <textarea placeholder="Ürün açıklaması..." value={form.description} rows={2}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none resize-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                />
              </div>

              {/* Code + Regen */}
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Kod *</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="KUPON-KODU" value={form.code}
                    onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-mono font-bold text-sm uppercase focus:outline-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                  />
                  <button onClick={regenFormCode}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 font-bold text-sm hover:bg-gray-50 transition-colors shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151] active:translate-y-[3px] active:shadow-none"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>
                {form.code && (
                  <div className="mt-3 flex justify-center">
                    <QRPreview code={form.code} size={110} />
                  </div>
                )}
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Görsel URL</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="https://..." value={form.image}
                    onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                  />
                  {form.image && (
                    <img src={form.image} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '2px solid #000', flexShrink: 0 }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  )}
                </div>
              </div>

              {/* Qty, Points, Expires */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Adet</label>
                  <input type="number" min={1} max={99} value={form.quantity}
                    onChange={e => setForm(f => ({ ...f, quantity: parseInt(e.target.value) || 1 }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Puan</label>
                  <input type="number" min={0} value={form.points}
                    onChange={e => setForm(f => ({ ...f, points: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-sm focus:outline-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Son Kull.</label>
                  <input type="date" value={form.expires.slice(0, 10)}
                    onChange={e => setForm(f => ({ ...f, expires: e.target.value }))}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700 font-bold text-xs focus:outline-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
                  />
                </div>
              </div>

              {/* Save */}
              <button onClick={handleSave} disabled={!form.title || !form.code}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black font-black text-sm text-white transition-all active:translate-y-[3px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: saved ? '#22c55e' : 'linear-gradient(180deg,#7B6EF6,#4F8EF7)', boxShadow: saved ? '0 4px 0 #16a34a' : '0 4px 0 #000' }}
              >
                {saved ? <><Check size={16} /> Kaydedildi!</> : <><Save size={16} /> {editingItem ? 'Değişiklikleri Kaydet' : 'Öğeyi Ekle'}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR Preview Modal ── */}
      {qrPreviewId && (() => {
        const item = items.find(i => i.id === qrPreviewId);
        if (!item) return null;
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={() => setQrPreviewId(null)}>
            <div className={`${card} p-6 flex flex-col items-center gap-4`} onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between w-full">
                <div>
                  <h3 className="font-black text-gray-900 dark:text-white">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.code}</p>
                </div>
                <button onClick={() => setQrPreviewId(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X size={18} />
                </button>
              </div>
              <QRPreview code={item.code} size={220} />
              <button onClick={() => handleCopy(item.code)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-black dark:border-gray-600 font-bold text-sm bg-white dark:bg-gray-700 hover:bg-gray-50 shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151] active:translate-y-[3px] active:shadow-none transition-all"
              >
                {copied === item.code ? <><Check size={14} className="text-green-500" /> Kopyalandı!</> : <><Copy size={14} /> Kodu Kopyala</>}
              </button>
            </div>
          </div>
        );
      })()}

      <div className="p-4 lg:p-6 space-y-6">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">📦 Envanter Yönetimi</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">Kupon, bilet ve ödülleri yönet</p>
          </div>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-black font-black text-sm text-white shadow-[0_4px_0_#000] active:translate-y-[4px] active:shadow-none transition-all"
            style={{ background: 'linear-gradient(180deg,#7B6EF6,#4F8EF7)' }}
          >
            <Plus size={16} /> Yeni Öğe Ekle
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { val: items.length,  label: 'Toplam', emoji: '📦', color: 'var(--primary-blue)' },
            { val: totalActive,   label: 'Aktif',  emoji: '✅', color: '#22c55e' },
            { val: totalUsed,     label: 'Kullanıldı', emoji: '☑️', color: '#6b7280' },
            { val: totalQty,      label: 'Toplam Adet', emoji: '🔢', color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className={`${card} p-3 sm:p-4 text-center`}>
              <div className="text-xl sm:text-2xl mb-1">{s.emoji}</div>
              <p className="font-black text-lg sm:text-2xl" style={{ color: s.color }}>{s.val}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Başlık veya kod ara..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-bold focus:outline-none dark:text-white shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151]"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'coupon', 'ticket', 'reward'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)}
                className="px-3 py-2 rounded-xl border-2 font-bold text-xs transition-all active:translate-y-[2px] active:shadow-none"
                style={{ borderColor: filterType === t ? (typeColor[t] || '#7B6EF6') : '#000', background: filterType === t ? (typeColor[t] || '#7B6EF6') + '18' : 'transparent', color: filterType === t ? (typeColor[t] || '#7B6EF6') : undefined, boxShadow: filterType === t ? `0 3px 0 ${typeColor[t] || '#000'}` : '0 3px 0 #000' }}
              >
                {t === 'all' ? 'Tümü' : typeLabel[t]}
              </button>
            ))}
            <button onClick={() => setShowUsed(s => !s)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-black dark:border-gray-600 font-bold text-xs transition-all shadow-[0_3px_0_#000] dark:shadow-[0_3px_0_#374151] active:translate-y-[2px] active:shadow-none"
              style={{ background: showUsed ? '#f3f4f6' : 'transparent' }}
            >
              {showUsed ? <EyeOff size={13} /> : <Eye size={13} />}
              {showUsed ? 'Kullanılanları Gizle' : 'Kullanılanları Göster'}
            </button>
          </div>
        </div>

        {/* ── Items Table ── */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className={`${card} p-12 text-center`}>
              <Package size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="font-black text-gray-500">Öğe bulunamadı</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const cfg = typeColor[item.type];
              const IconComp = typeIcon[item.type] || Package;
              const expired = new Date(item.expires) < new Date();
              const days = Math.max(0, Math.ceil((new Date(item.expires).getTime() - Date.now()) / 86400000));
              return (
                <div key={item.id} className={`${card} p-4 flex items-start gap-4`}
                  style={{ opacity: item.used ? 0.6 : 1, animation: `adminItemIn 0.3s ease-out ${idx * 0.04}s both` }}
                >
                  {/* Image */}
                  <div style={{ width: 64, height: 64, borderRadius: 14, flexShrink: 0, overflow: 'hidden', border: '2px solid #000', background: '#f3f4f6' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <IconComp size={24} color={cfg} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap mb-1">
                      <p className="font-black text-sm text-gray-900 dark:text-white">{item.title}</p>
                      <span style={{ padding: '2px 8px', borderRadius: 999, background: cfg + '18', color: cfg, border: `1.5px solid ${cfg}`, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', flexShrink: 0 }}>
                        {typeLabel[item.type]}
                      </span>
                      {item.used && <span style={{ padding: '2px 8px', borderRadius: 999, background: '#f3f4f6', color: '#6b7280', border: '1.5px solid #9ca3af', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>KULLANILDI</span>}
                      {expired && !item.used && <span style={{ padding: '2px 8px', borderRadius: 999, background: '#fef2f2', color: '#ef4444', border: '1.5px solid #ef4444', fontSize: 9, fontWeight: 900, flexShrink: 0 }}>SÜRESİ DOLDU</span>}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span className="font-mono font-bold" style={{ color: cfg }}>{item.code}</span>
                      <span>Adet: <strong className="text-gray-900 dark:text-white">{item.quantity ?? 1}</strong></span>
                      <span>{item.points} puan</span>
                      <span style={{ color: expired ? '#ef4444' : days <= 3 ? '#f59e0b' : undefined }}>
                        📅 {new Date(item.expires).toLocaleDateString('tr-TR')} {!expired && `(${days}g)`}
                      </span>
                    </div>

                    {/* Quantity bar */}
                    <div style={{ height: 4, borderRadius: 999, background: '#e5e7eb', overflow: 'hidden', maxWidth: 140 }}>
                      <div style={{ height: '100%', borderRadius: 999, width: `${Math.min(100, ((item.quantity ?? 1) / 10) * 100)}%`, background: cfg }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
                    {/* QR preview */}
                    <button onClick={() => setQrPreviewId(item.id)}
                      className="p-2 rounded-lg border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 transition-colors shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] active:translate-y-[2px] active:shadow-none"
                      title="QR Önizleme"
                    >
                      <QrCode size={14} />
                    </button>
                    {/* Copy */}
                    <button onClick={() => handleCopy(item.code)}
                      className="p-2 rounded-lg border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 transition-colors shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] active:translate-y-[2px] active:shadow-none"
                      title="Kodu Kopyala"
                    >
                      {copied === item.code ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </button>
                    {/* Edit */}
                    <button onClick={() => openEdit(item)}
                      className="p-2 rounded-lg border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-50 transition-colors shadow-[0_2px_0_#000] dark:shadow-[0_2px_0_#374151] active:translate-y-[2px] active:shadow-none"
                      title="Düzenle"
                    >
                      <Edit2 size={14} />
                    </button>
                    {/* Delete */}
                    {deleteConfirm === item.id ? (
                      <div className="flex items-center gap-1">
                        <button onClick={() => handleDelete(item.id)}
                          className="px-2 py-1.5 rounded-lg border-2 border-red-500 bg-red-500 text-white font-bold text-xs shadow-[0_2px_0_#dc2626] active:translate-y-[2px] active:shadow-none"
                        >
                          Sil
                        </button>
                        <button onClick={() => setDeleteConfirm(null)}
                          className="px-2 py-1.5 rounded-lg border-2 border-black dark:border-gray-600 font-bold text-xs shadow-[0_2px_0_#000] active:translate-y-[2px] active:shadow-none"
                        >
                          İptal
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(item.id)}
                        className="p-2 rounded-lg border-2 border-red-400 bg-white dark:bg-gray-700 text-red-400 hover:bg-red-50 transition-colors shadow-[0_2px_0_#f87171] active:translate-y-[2px] active:shadow-none"
                        title="Sil"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        @keyframes adminItemIn {
          from { opacity: 0; transform: translateX(-8px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </AdminLayout>
  );
};

export default AdminInventory;
