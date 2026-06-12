import React, { useState, useEffect, useCallback } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { supabase } from '../../../lib/supabase';
import { useRealtimeTable } from '../../../hooks/useRealtime';
import { Plus, Pencil, Trash2, Check, X, Star, Search, Loader2, ToggleLeft, ToggleRight, ShoppingBag } from 'lucide-react';

interface Reward {
  id: string;
  title: string;
  description: string | null;
  points: number;
  category: string | null;
  image: string | null;
  active: boolean;
  limited: boolean;
  limited_quantity: number | null;
  created_at: string;
}

const CATEGORIES = ['Yiyecek & İçecek', 'Giyim', 'Elektronik', 'Sağlık & Güzellik', 'Eğlence', 'Diğer'];

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

const EMPTY: Partial<Reward> = { title: '', description: '', points: 100, category: 'Diğer', image: '', active: true, limited: false, limited_quantity: null };

const StoreAdminRewards: React.FC = () => {
  const [rewards, setRewards]   = useState<Reward[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [editing, setEditing]   = useState<Partial<Reward> | null>(null);
  const [saving, setSaving]     = useState(false);
  const [saveError, setSaveError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('rewards').select('*').order('created_at', { ascending: false });
      if (search.trim()) q = q.ilike('title', `%${search}%`);
      const { data, error } = await q;
      if (error) throw error;
      setRewards((data ?? []) as Reward[]);
    } catch (e) { console.error('[StoreAdminRewards]', e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(() => load(), 300); return () => clearTimeout(t); }, [load]);
  useRealtimeTable('rewards', load);

  const handleSave = async () => {
    if (!editing?.title || !editing.points) { setSaveError('Başlık ve puan zorunlu'); return; }
    setSaving(true); setSaveError('');
    try {
      const { id, ...rest } = editing as Reward;
      if (id) {
        const { error } = await supabase.from('rewards').update(rest).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('rewards').insert(rest);
        if (error) throw error;
      }
      setEditing(null);
      load();
    } catch (e: unknown) {
      setSaveError((e as Error).message ?? 'Kayıt başarısız');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (r: Reward) => {
    await supabase.from('rewards').update({ active: !r.active }).eq('id', r.id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu ödülü silmek istediğinize emin misiniz?')) return;
    await supabase.from('rewards').delete().eq('id', id);
    load();
  };

  return (
    <StoreAdminLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Edit modal */}
        {editing !== null && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
            onClick={e => { if (e.target === e.currentTarget) setEditing(null); }}>
            <div style={{ ...card, width: '100%', maxWidth: 480, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>{(editing as Reward).id ? 'Ödülü Düzenle' : 'Yeni Ödül'}</p>
                <button onClick={() => setEditing(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <X size={14} color="var(--text-muted)" />
                </button>
              </div>

              {[
                { label: 'BAŞLIK', key: 'title', type: 'text', placeholder: 'Ödül adı' },
                { label: 'PUAN MALİYETİ', key: 'points', type: 'number', placeholder: '500' },
                { label: 'AÇIKLAMA', key: 'description', type: 'text', placeholder: 'Opsiyonel açıklama' },
                { label: 'GÖRSEL URL', key: 'image', type: 'text', placeholder: 'https://...' },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} placeholder={f.placeholder}
                    value={(editing as Record<string, string | number | boolean>)[f.key] as string ?? ''}
                    onChange={e => setEditing(p => ({ ...p, [f.key]: f.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none' }} />
                </div>
              ))}

              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>KATEGORİ</label>
                <select value={editing.category ?? 'Diğer'} onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none' }}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                {(['active', 'limited'] as const).map(k => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input type="checkbox" checked={!!editing[k]} onChange={e => setEditing(p => ({ ...p, [k]: e.target.checked }))} style={{ display: 'none' }} />
                    {editing[k] ? <ToggleRight size={22} color="#22c55e" /> : <ToggleLeft size={22} color="var(--text-muted)" />}
                    <span style={{ fontSize: 12, fontWeight: 900, color: 'var(--text-dark)' }}>{k === 'active' ? 'Aktif' : 'Sınırlı Stok'}</span>
                  </label>
                ))}
              </div>

              {saveError && <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', fontSize: 12, color: '#ef4444', fontWeight: 700 }}>{saveError}</div>}

              <button onClick={handleSave} disabled={saving}
                style={{ width: '100%', padding: 13, borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                {saving ? 'Kaydediliyor…' : 'Kaydet'}
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ ...card, flex: 1, padding: 'clamp(16px,3vw,22px)', background: 'linear-gradient(135deg,#f59e0b,#d97706)', marginRight: 12 }}>
            <p style={{ fontWeight: 900, fontSize: 20, color: 'white', margin: '0 0 4px' }}>Ödüller 🎁</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{rewards.length} ödül kayıtlı</p>
          </div>
          <button onClick={() => setEditing(EMPTY)}
            style={{ ...card, padding: '14px 18px', background: 'linear-gradient(180deg,#22c55e,#16a34a)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 13, boxShadow: '0 4px 0 var(--dark-border)', flexShrink: 0 }}>
            <Plus size={16} /> Yeni Ödül
          </button>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Ödül ara..." value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none', boxShadow: '0 3px 0 var(--dark-border)' }} />
        </div>

        {/* Reward list */}
        <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Yükleniyor…</p>
            </div>
          ) : rewards.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <ShoppingBag size={36} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Ödül bulunamadı</p>
            </div>
          ) : rewards.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < rewards.length - 1 ? '1.5px solid var(--dark-border)' : 'none', opacity: r.active ? 1 : 0.5 }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, overflow: 'hidden', flexShrink: 0, border: '2px solid var(--dark-border)', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {r.image ? <img src={r.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ShoppingBag size={20} color="var(--text-muted)" />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.title}</p>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'var(--tab-bg)', color: 'var(--text-muted)', border: '1px solid var(--dark-border)' }}>{r.category ?? 'Genel'}</span>
                  {r.limited && <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid #ef4444' }}>Sınırlı</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', border: '1.5px solid #f59e0b' }}>
                  <Star size={11} fill="#f59e0b" color="#f59e0b" />
                  <span style={{ fontWeight: 900, fontSize: 12, color: '#d97706' }}>{r.points}</span>
                </div>
                <button onClick={() => toggleActive(r)} title={r.active ? 'Pasife al' : 'Aktifleştir'} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {r.active ? <ToggleRight size={22} color="#22c55e" /> : <ToggleLeft size={22} color="var(--text-muted)" />}
                </button>
                <button onClick={() => setEditing(r)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(123,110,246,0.1)', border: '1.5px solid rgba(123,110,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Pencil size={13} color="#7B6EF6" />
                </button>
                <button onClick={() => handleDelete(r.id)} style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(239,68,68,0.08)', border: '1.5px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Trash2 size={13} color="#ef4444" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminRewards;
