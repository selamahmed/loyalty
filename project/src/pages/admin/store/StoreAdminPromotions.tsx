import React, { useState } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { Tag, Plus, Trash2, X, Check, Calendar, Zap, ToggleLeft, ToggleRight, Clock } from 'lucide-react';

const ACCENT = '#22c55e';

type PromotionType = 'double_points' | 'discount' | 'free_item' | 'bonus_points';

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  usageCount: number;
  maxUses: number;
}

const TYPE_CONFIG: Record<PromotionType, { label: string; color: string; emoji: string }> = {
  double_points: { label: '2x Puan',       color: '#7B6EF6', emoji: '⚡' },
  discount:      { label: 'İndirim',        color: '#f59e0b', emoji: '🏷️' },
  free_item:     { label: 'Ücretsiz Ürün', color: '#22c55e', emoji: '🎁' },
  bonus_points:  { label: 'Bonus Puan',     color: '#06b6d4', emoji: '⭐' },
};

const INITIAL: Promotion[] = [
  { id: '1', title: 'Sabah Çift Puan', description: '08:00–11:00 arası tüm alışverişler', type: 'double_points', value: 2, startDate: '2026-06-01', endDate: '2026-06-30', active: true, usageCount: 142, maxUses: 500 },
  { id: '2', title: 'Hafta Sonu %10', description: 'Cumartesi-Pazar geçerli', type: 'discount', value: 10, startDate: '2026-06-01', endDate: '2026-06-30', active: true, usageCount: 87, maxUses: 200 },
  { id: '3', title: 'İlk Üye Bonusu', description: 'Yeni üyeye özel hoşgeldin', type: 'bonus_points', value: 200, startDate: '2026-01-01', endDate: '2026-12-31', active: true, usageCount: 34, maxUses: 999 },
  { id: '4', title: 'Haziran Sonu Ücretsiz', description: '500 puana ücretsiz espresso', type: 'free_item', value: 500, startDate: '2026-06-25', endDate: '2026-06-30', active: false, usageCount: 0, maxUses: 50 },
];

const PromoModal: React.FC<{
  promo?: Promotion;
  onClose: () => void;
  onSave: (p: Partial<Promotion>) => void;
}> = ({ promo, onClose, onSave }) => {
  const [form, setForm] = useState({
    title:       promo?.title       || '',
    description: promo?.description || '',
    type:        promo?.type        || 'double_points' as PromotionType,
    value:       promo?.value       || 2,
    startDate:   promo?.startDate   || '',
    endDate:     promo?.endDate     || '',
    maxUses:     promo?.maxUses     || 100,
    active:      promo?.active      ?? true,
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
          <p className="font-black" style={{ color: 'var(--text-dark)' }}>{promo ? 'Promosyonu Düzenle' : 'Yeni Promosyon'}</p>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: 'title', label: 'BAŞLIK *', placeholder: 'Promosyon adı' },
            { key: 'description', label: 'AÇIKLAMA', placeholder: 'Kısa açıklama' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>{label}</label>
              <input value={(form as Record<string, unknown>)[key] as string} onChange={e => f(key as 'title', e.target.value)} placeholder={placeholder}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
          ))}
          <div>
            <label className="text-xs font-black block mb-2" style={{ color: 'var(--text-muted)' }}>TİP</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TYPE_CONFIG) as PromotionType[]).map(t => (
                <button key={t} type="button" onClick={() => f('type', t)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: form.type === t ? `${TYPE_CONFIG[t].color}15` : 'var(--tab-bg)',
                    border: `2px solid ${form.type === t ? TYPE_CONFIG[t].color : 'var(--dark-border)'}`,
                  }}>
                  <p className="text-base mb-0.5">{TYPE_CONFIG[t].emoji}</p>
                  <p className="font-black text-xs" style={{ color: form.type === t ? TYPE_CONFIG[t].color : 'var(--text-muted)' }}>{TYPE_CONFIG[t].label}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>DEĞER</label>
              <input type="number" min={1} value={form.value} onChange={e => f('value', +e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>MAX KULLANIM</label>
              <input type="number" min={1} value={form.maxUses} onChange={e => f('maxUses', +e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>BAŞLANGIÇ</label>
              <input type="date" value={form.startDate} onChange={e => f('startDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>BİTİŞ</label>
              <input type="date" value={form.endDate} onChange={e => f('endDate', e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
          </div>
          <button type="button" onClick={() => f('active', !form.active)}
            className="w-full p-3 rounded-xl flex items-center justify-between transition-all"
            style={{ background: form.active ? `${ACCENT}10` : 'var(--tab-bg)', border: `2px solid ${form.active ? ACCENT : 'var(--dark-border)'}` }}>
            <div className="flex items-center gap-2">
              <Zap size={16} style={{ color: form.active ? ACCENT : 'var(--text-muted)' }} />
              <span className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>Aktif Durum</span>
            </div>
            {form.active ? <ToggleRight size={24} style={{ color: ACCENT }} /> : <ToggleLeft size={24} style={{ color: 'var(--text-muted)' }} />}
          </button>
          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-black text-sm" style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '2px solid var(--dark-border)' }}>İptal</button>
            <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2"
              style={{ background: ACCENT, border: '2px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              {saved ? <><Check size={13} /> Kaydedildi!</> : promo ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StoreAdminPromotions: React.FC = () => {
  const [promos, setPromos] = useState<Promotion[]>(INITIAL);
  const [modal, setModal] = useState<{ promo?: Promotion; show: boolean }>({ show: false });

  const toggleActive = (id: string) =>
    setPromos(prev => prev.map(p => p.id === id ? { ...p, active: !p.active } : p));
  const handleDelete = (id: string) =>
    setPromos(prev => prev.filter(p => p.id !== id));
  const handleSave = (data: Partial<Promotion>) => {
    if (modal.promo) {
      setPromos(prev => prev.map(p => p.id === modal.promo!.id ? { ...p, ...data } : p));
    } else {
      setPromos(prev => [...prev, { ...data, id: Date.now().toString(), usageCount: 0 } as Promotion]);
    }
  };

  return (
    <StoreAdminLayout>
      {modal.show && <PromoModal promo={modal.promo} onClose={() => setModal({ show: false })} onSave={handleSave} />}

      <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-dark)' }}>Promosyonlar</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Kampanya ve özel teklifleri yönetin</p>
          </div>
          <button onClick={() => setModal({ show: true })}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-black text-sm text-white transition-all active:scale-95"
            style={{ background: ACCENT, border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
            <Plus size={14} /> Yeni Promosyon
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Toplam',  value: promos.length,                          color: '#7B6EF6' },
            { label: 'Aktif',   value: promos.filter(p => p.active).length,    color: ACCENT    },
            { label: 'Pasif',   value: promos.filter(p => !p.active).length,   color: '#9ca3af' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-2xl text-center"
              style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Promo list */}
        <div className="space-y-3">
          {promos.map(promo => {
            const tc = TYPE_CONFIG[promo.type];
            const usagePct = Math.min(100, (promo.usageCount / promo.maxUses) * 100);
            return (
              <div key={promo.id} className="p-5 rounded-2xl"
                style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)', opacity: promo.active ? 1 : 0.7 }}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                      style={{ background: `${tc.color}15`, border: `2px solid ${tc.color}` }}>
                      {tc.emoji}
                    </div>
                    <div>
                      <p className="font-black" style={{ color: 'var(--text-dark)' }}>{promo.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{promo.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => toggleActive(promo.id)}
                      style={{ color: promo.active ? ACCENT : 'var(--text-muted)' }}>
                      {promo.active ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                    </button>
                    <button onClick={() => setModal({ promo, show: true })}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: 'rgba(123,110,246,0.08)', color: '#7B6EF6', border: '2px solid rgba(123,110,246,0.3)' }}>
                      <Tag size={13} />
                    </button>
                    <button onClick={() => handleDelete(promo.id)}
                      className="p-2 rounded-xl transition-colors"
                      style={{ background: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '2px solid rgba(239,68,68,0.3)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="px-2 py-1 rounded-full text-xs font-black"
                    style={{ background: `${tc.color}15`, color: tc.color, border: `1.5px solid ${tc.color}` }}>
                    {tc.label} · {promo.value}{promo.type === 'double_points' ? '×' : promo.type === 'discount' ? '%' : ' pts'}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{ background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '1.5px solid var(--dark-border)' }}>
                    <Calendar size={10} /> {promo.startDate} → {promo.endDate}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1"
                    style={{ background: promo.active ? `${ACCENT}10` : 'var(--tab-bg)', color: promo.active ? ACCENT : 'var(--text-muted)', border: `1.5px solid ${promo.active ? ACCENT : 'var(--dark-border)'}` }}>
                    {promo.active ? '🟢 Aktif' : '⚪ Pasif'}
                  </span>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Kullanım</span>
                    <span className="text-xs font-black" style={{ color: 'var(--text-dark)' }}>{promo.usageCount} / {promo.maxUses}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--tab-bg)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${usagePct}%`, background: usagePct > 80 ? '#ef4444' : tc.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminPromotions;
