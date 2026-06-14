import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, X, Check, Star, Search, Eye, EyeOff, Image, Tag, Upload, Download, Loader2 } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAdminRewards, createReward, updateReward, deleteReward, bulkCreateRewards } from '../../services/rewards';
import type { Reward as DBReward } from '../../services/rewards';
import { useRealtimeTable } from '../../hooks/useRealtime';
import { playSound } from '../../lib/sounds';
import { downloadRewardsCsvTemplate, parseRewardsCsv, type CsvParseResult } from '../../lib/rewardsCsv';

type Reward = DBReward & { available?: boolean; imageUrl?: string };

const categoryOptions = [
  { value: 'coffee',   label: '☕ Kahve'   },
  { value: 'pastries', label: '🥐 Pastane' },
  { value: 'food',     label: '🍔 Yemek'   },
  { value: 'drinks',   label: '🥤 İçecek'  },
  { value: 'gift-cards', label: '🎁 Hediye Kartı' },
  { value: 'coupons',  label: '🏷️ Kupon'  },
];

const card = 'rounded-2xl border-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800 shadow-[0_4px_0_#000] dark:shadow-[0_4px_0_#374151]';

interface ModalProps {
  reward?: Reward;
  onClose: () => void;
  onSave: (r: Partial<Reward>) => void;
}

const RewardModal: React.FC<ModalProps> = ({ reward, onClose, onSave }) => {
  const [form, setForm] = useState<Partial<Reward>>({
    title:       reward?.title       || '',
    points:      reward?.points      || 100,
    category:    reward?.category    || 'coffee',
    description: reward?.description || '',
    limited:     reward?.limited     || false,
    stock:       reward?.stock       || 100,
    imageUrl:    reward?.imageUrl    || reward?.image || '',
    available:   reward?.available   ?? true,
  });
  const [saved, setSaved] = useState(false);

  const f = (key: keyof typeof form, val: unknown) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = () => {
    if (!form.title?.trim()) return;
    setSaved(true);
    onSave({ ...form, image: form.imageUrl || form.image });
    setTimeout(onClose, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className={`${card} max-w-md w-full p-6 max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-black text-lg text-gray-900 dark:text-white">
              {reward ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Mağazaya ürün ekle veya düzenle</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Image URL */}
          <div>
            <label className="block font-bold text-sm mb-1.5 text-gray-700 dark:text-gray-300">
              Görsel URL
            </label>
            <div className="relative">
              <Image size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                className="input-field pl-8 text-sm"
                placeholder="https://example.com/image.jpg"
                value={form.imageUrl || ''}
                onChange={e => f('imageUrl', e.target.value)}
              />
            </div>
            {form.imageUrl && (
              <div className="mt-2 h-24 rounded-xl overflow-hidden border-2 border-black dark:border-gray-600">
                <img src={form.imageUrl} alt="preview" className="w-full h-full object-cover" onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block font-bold text-sm mb-1.5 text-gray-700 dark:text-gray-300">Ürün Adı *</label>
            <input
              className="input-field"
              placeholder="Ürün adı girin"
              value={form.title || ''}
              onChange={e => f('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-sm mb-1.5 text-gray-700 dark:text-gray-300">Açıklama</label>
            <textarea
              className="input-field resize-none text-sm"
              rows={2}
              placeholder="Ürün hakkında kısa açıklama"
              value={form.description || ''}
              onChange={e => f('description', e.target.value)}
            />
          </div>

          {/* Points & Stock */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-sm mb-1.5 text-gray-700 dark:text-gray-300">Puan Maliyeti</label>
              <input
                type="number" min={1} className="input-field"
                value={form.points || 0}
                onChange={e => f('points', +e.target.value)}
              />
            </div>
            <div>
              <label className="block font-bold text-sm mb-1.5 text-gray-700 dark:text-gray-300">Stok</label>
              <input
                type="number" min={0} className="input-field"
                value={form.stock || 0}
                onChange={e => f('stock', +e.target.value)}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block font-bold text-sm mb-1.5 text-gray-700 dark:text-gray-300">Kategori</label>
            <select className="input-field" value={form.category || 'coffee'} onChange={e => f('category', e.target.value)}>
              {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <button type="button" onClick={() => f('available', !form.available)}
                className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center transition-colors ${form.available ? 'bg-green-500' : 'bg-white dark:bg-gray-600'}`}>
                {form.available && <Check size={12} className="text-white" />}
              </button>
              <div>
                <span className="font-bold text-xs text-gray-900 dark:text-white block">Satışta</span>
                <span className="text-xs text-gray-500">{form.available ? 'Aktif' : 'Pasif'}</span>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
              <button type="button" onClick={() => f('limited', !form.limited)}
                className={`w-5 h-5 rounded-md border-2 border-black flex items-center justify-center transition-colors ${form.limited ? 'bg-[#7B6EF6]' : 'bg-white dark:bg-gray-600'}`}>
                {form.limited && <Check size={12} className="text-white" />}
              </button>
              <div>
                <span className="font-bold text-xs text-gray-900 dark:text-white block">Sınırlı</span>
                <span className="text-xs text-gray-500">{form.limited ? 'Evet' : 'Hayır'}</span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm font-bold">İptal</button>
          <button onClick={handleSave} className="btn-primary flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2">
            {saved ? <><Check size={14} /> Kaydedildi!</> : reward ? 'Değişiklikleri Kaydet' : 'Ürün Ekle'}
          </button>
        </div>
      </div>
    </div>
  );
};

const CsvImportModal: React.FC<{
  result: CsvParseResult;
  importing: boolean;
  importError: string;
  onClose: () => void;
  onImport: () => void;
}> = ({ result, importing, importError, onClose, onImport }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
    <div className={`${card} max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-black text-lg text-gray-900 dark:text-white">CSV ile Toplu Yükleme</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {result.rows.length} ürün içe aktarılacak
            {result.errors.length > 0 ? ` · ${result.errors.length} satır atlandı` : ''}
          </p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700">
          <X size={18} />
        </button>
      </div>

      {result.errors.length > 0 && (
        <div className="mb-4 rounded-xl border-2 border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 max-h-32 overflow-y-auto">
          {result.errors.slice(0, 8).map(err => (
            <p key={`${err.rowNumber}-${err.message}`} className="text-xs font-semibold text-amber-800 dark:text-amber-200">
              Satır {err.rowNumber}: {err.message}
            </p>
          ))}
          {result.errors.length > 8 && (
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">+{result.errors.length - 8} hata daha</p>
          )}
        </div>
      )}

      {result.rows.length > 0 ? (
        <div className="rounded-xl border-2 border-black dark:border-gray-600 overflow-hidden mb-4">
          <div className="max-h-56 overflow-y-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 dark:bg-gray-700 sticky top-0">
                <tr>
                  <th className="px-3 py-2 font-black">Ürün</th>
                  <th className="px-3 py-2 font-black">Puan</th>
                  <th className="px-3 py-2 font-black">Kategori</th>
                  <th className="px-3 py-2 font-black">Stok</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.slice(0, 12).map(row => (
                  <tr key={row.rowNumber} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2 font-semibold text-gray-900 dark:text-white">{row.reward.title}</td>
                    <td className="px-3 py-2">{row.reward.points}</td>
                    <td className="px-3 py-2">{row.reward.category}</td>
                    <td className="px-3 py-2">{row.reward.stock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {result.rows.length > 12 && (
            <p className="px-3 py-2 text-xs text-gray-500 border-t border-gray-200 dark:border-gray-700">
              +{result.rows.length - 12} ürün daha
            </p>
          )}
        </div>
      ) : (
        <div className={`${card} p-8 text-center mb-4`}>
          <p className="font-bold text-gray-500">İçe aktarılacak geçerli satır yok.</p>
        </div>
      )}

      {importError && (
        <div className="mb-4 rounded-xl border-2 border-red-300 bg-red-50 dark:bg-red-950/30 p-3 text-sm font-semibold text-red-700 dark:text-red-300">
          {importError}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1 py-2.5 text-sm font-bold">İptal</button>
        <button
          onClick={onImport}
          disabled={importing || result.rows.length === 0}
          className="btn-primary flex-1 py-2.5 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {importing ? <><Loader2 size={14} className="animate-spin" /> Yükleniyor…</> : <><Upload size={14} /> {result.rows.length} Ürünü Yükle</>}
        </button>
      </div>
    </div>
  </div>
);

const AdminRewards: React.FC = () => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modal, setModal]     = useState<{ reward?: Reward; show: boolean }>({ show: false });
  const [search, setSearch]   = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);
  const [catFilter, setCatFilter] = useState('all');
  const [csvResult, setCsvResult] = useState<CsvParseResult | null>(null);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvImportError, setCsvImportError] = useState('');
  const [importToast, setImportToast] = useState<string | null>(null);
  const csvInputRef = useRef<HTMLInputElement>(null);

  const loadRewards = useCallback(() => {
    setIsLoading(true);
    getAdminRewards()
      .then(data => setRewards(data.map(r => ({ ...r, available: r.active, imageUrl: r.image ?? '' }))))
      .catch(() => setRewards([]))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { loadRewards(); }, [loadRewards]);

  useRealtimeTable('rewards', loadRewards);

  const filtered = rewards.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'all' || r.category === catFilter;
    return matchSearch && matchCat;
  });

  const handleSave = async (data: Partial<Reward>) => {
    try {
      if (modal.reward?.id) {
        const updated = await updateReward(modal.reward.id, { ...data, image: data.imageUrl ?? null });
        setRewards(prev => prev.map(r => r.id === modal.reward!.id ? { ...r, ...updated } : r));
      } else {
        const created = await createReward({
          title: data.title ?? '',
          description: data.description ?? '',
          points: data.points ?? 100,
          category: data.category ?? 'other',
          image: data.imageUrl ?? null,
          featured: data.featured ?? false,
          limited: data.limited ?? false,
          stock: data.stock ?? 100,
          expires_at: data.expires_at ?? null,
          active: true,
        });
        setRewards(prev => [...prev, { ...created, available: true, imageUrl: created.image ?? '' }]);
      }
    } catch (err) {
      console.error('Failed to save reward:', err);
    }
  };

  const handleDelete = (id: string) => {
    playSound('click');
    setDeleting(id);
    deleteReward(id).then(() => {
      setRewards(prev => prev.filter(r => r.id !== id));
    }).catch(() => {}).finally(() => setDeleting(null));
  };

  const toggleAvailable = (id: string) => {
    setRewards(prev => prev.map(r => r.id === id ? { ...r, available: !r.available } : r));
  };

  const handleCsvFile = async (file: File) => {
    setCsvImportError('');
    try {
      const text = await file.text();
      const parsed = parseRewardsCsv(text);
      setCsvResult(parsed);
    } catch {
      setCsvImportError('CSV dosyası okunamadı.');
      setCsvResult({ rows: [], errors: [{ rowNumber: 0, message: 'Dosya okunamadı.' }] });
    }
  };

  const handleCsvImport = async () => {
    if (!csvResult || csvResult.rows.length === 0) return;
    setCsvImporting(true);
    setCsvImportError('');
    try {
      const created = await bulkCreateRewards(csvResult.rows.map(row => row.reward));
      playSound('success');
      setImportToast(`${created.length} ürün yüklendi!`);
      setTimeout(() => setImportToast(null), 3200);
      setCsvResult(null);
      loadRewards();
    } catch (err) {
      setCsvImportError((err as Error).message ?? 'Toplu yükleme başarısız.');
    } finally {
      setCsvImporting(false);
    }
  };

  const totalValue  = rewards.reduce((s, r) => s + r.points, 0);
  const activeCount = rewards.filter(r => r.available !== false).length;
  const avgPoints = rewards.length > 0 ? Math.round(totalValue / rewards.length) : 0;

  return (
    <AdminLayout>
      {modal.show && <RewardModal reward={modal.reward} onClose={() => setModal({ show: false })} onSave={handleSave} />}
      {csvResult && (
        <CsvImportModal
          result={csvResult}
          importing={csvImporting}
          importError={csvImportError}
          onClose={() => { setCsvResult(null); setCsvImportError(''); }}
          onImport={handleCsvImport}
        />
      )}

      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) void handleCsvFile(file);
          e.target.value = '';
        }}
      />

      {importToast && (
        <div className="fixed top-5 right-5 z-[60] px-4 py-3 rounded-xl bg-green-500 text-white font-black text-sm border-2 border-green-700 shadow-[0_4px_0_#15803d] flex items-center gap-2">
          <Check size={15} /> {importToast}
        </div>
      )}

      <div className="p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Ürün Mağazası Yönetimi</h1>
            <p className="text-sm text-gray-500 mt-0.5">Mağazadaki ürünleri yönet, fiyatlandır ve stok güncelle</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => { playSound('click'); downloadRewardsCsvTemplate(); }}
              className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Download size={14} /> Şablon İndir
            </button>
            <button
              type="button"
              onClick={() => { playSound('click'); csvInputRef.current?.click(); }}
              className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm"
            >
              <Upload size={14} /> CSV Yükle
            </button>
            <button onClick={() => { playSound('click'); setModal({ show: true }); }}
              className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
              <Plus size={14} /> Yeni Ürün
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Toplam Ürün',  value: rewards.length,  color: '#7B6EF6', emoji: '📦' },
            { label: 'Satışta',      value: activeCount,      color: '#22c55e', emoji: '✅' },
            { label: 'Ort. Puan',    value: `${avgPoints} pts`, color: '#f59e0b', emoji: '⭐' },
          ].map(s => (
            <div key={s.label} className={card + ' p-4 text-center'}>
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="font-black text-xl text-gray-900 dark:text-white" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs text-gray-500 font-medium">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Ürün ara..." value={search}
              onChange={e => setSearch(e.target.value)} className="input-field pl-9 py-2 text-sm" />
          </div>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="input-field py-2 text-sm w-full sm:w-44">
            <option value="all">Tüm Kategoriler</option>
            {categoryOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Product list */}
        <div className="space-y-2">
          {filtered.map(reward => (
            <div key={reward.id}
              className={`${card} flex overflow-hidden transition-all duration-300 ${deleting === reward.id ? 'opacity-0 scale-95' : ''}`}>
              {/* Thumbnail */}
              <div className="w-20 flex-shrink-0 overflow-hidden border-r-2 border-black dark:border-gray-600 relative">
                <img src={reward.imageUrl || reward.image || undefined} alt={reward.title} className="w-full h-full object-cover" />
                {reward.available === false && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <EyeOff size={16} className="text-white" />
                  </div>
                )}
              </div>

              <div className="flex-1 p-3 flex items-center gap-3 min-w-0">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{reward.title}</p>
                    {reward.limited && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded-md border border-red-300">Sınırlı</span>}
                    <span className={`px-1.5 py-0.5 text-xs font-bold rounded-md border ${reward.available !== false ? 'bg-green-100 text-green-600 border-green-300' : 'bg-gray-100 text-gray-500 border-gray-300'}`}>
                      {reward.available !== false ? 'Satışta' : 'Pasif'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-1 mb-1">{reward.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <Star size={11} fill="#f59e0b" className="text-amber-500" />
                      <span className="text-xs font-black text-amber-600">{reward.points.toLocaleString()} pts</span>
                    </div>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Tag size={10} /> {categoryOptions.find(c => c.value === reward.category)?.label || reward.category}
                    </span>
                    {reward.stock !== undefined && (
                      <span className={`text-xs font-bold ${reward.stock < 10 ? 'text-red-500' : 'text-gray-400'}`}>
                        Stok: {reward.stock}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => toggleAvailable(reward.id)}
                    className={`p-2 rounded-xl border-2 transition-colors ${reward.available !== false ? 'border-green-300 bg-green-50 text-green-600 hover:bg-green-100' : 'border-gray-300 bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                    title={reward.available !== false ? 'Pasife Al' : 'Aktife Al'}>
                    {reward.available !== false ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => { playSound('click'); setModal({ reward, show: true }); }}
                    className="p-2 rounded-xl border-2 border-[#7B6EF6]/30 bg-[#7B6EF6]/5 text-[#7B6EF6] hover:bg-[#7B6EF6]/10 transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </button>
                  <button onClick={() => handleDelete(reward.id)}
                    className="p-2 rounded-xl border-2 border-red-200 bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className={card + ' p-12 text-center'}>
              <div className="text-4xl mb-3">🔍</div>
              <p className="font-bold text-gray-500">Ürün bulunamadı</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminRewards;
