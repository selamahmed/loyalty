import React, { useState, useEffect, useCallback } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { useRealtimeTable } from '../../../hooks/useRealtime';
import { QrCode, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check, Loader2, Search, RefreshCw, X } from 'lucide-react';
import { ilikeOrFilter } from '../../../lib/postgrestSearch';

interface QRCode {
  id: string;
  code: string;
  label: string | null;
  points: number;
  active: boolean;
  max_uses: number | null;
  uses_count: number;
  expires_at: string | null;
  created_at: string;
  store_id: string | null;
}

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 5px 0px var(--dark-border)',
  borderRadius: 20,
};

function relTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' });
}

const CreateModal: React.FC<{
  storeId: string;
  onClose: () => void;
  onDone: () => void;
}> = ({ storeId, onClose, onDone }) => {
  const [form, setForm] = useState({ label: '', points: '100', max_uses: '', expires_at: '' });
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState('');
  const [created, setCreated] = useState<QRCode | null>(null);
  const [copied, setCopied]   = useState(false);

  function generateCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let c = '';
    for (let i = 0; i < 10; i++) c += chars[Math.floor(Math.random() * chars.length)];
    return c;
  }

  const handleCreate = async () => {
    const pts = parseInt(form.points);
    if (!pts || pts <= 0) { setError('Geçerli bir puan girin'); return; }
    setSaving(true); setError('');
    try {
      const code = generateCode();
      const { data, error: err } = await supabase
        .from('qr_codes')
        .insert({
          code,
          store_id: storeId,
          label: form.label || null,
          points: pts,
          active: true,
          max_uses: form.max_uses ? parseInt(form.max_uses) : null,
          uses_count: 0,
          expires_at: form.expires_at || null,
        })
        .select()
        .single();
      if (err) throw err;
      setCreated(data as QRCode);
    } catch (e: unknown) {
      setError((e as Error).message ?? 'Oluşturulamadı');
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = () => {
    if (!created) return;
    navigator.clipboard.writeText(created.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = created
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(JSON.stringify({ type: 'store_qr', code: created.code, points: created.points, label: created.label }))}&size=240x240&margin=8`
    : '';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget && !created) onClose(); }}>
      <div style={{ ...card, width: '100%', maxWidth: 460, padding: 24, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>
            {created ? 'QR Kod Oluşturuldu ✅' : 'Yeni QR Kod'}
          </p>
          <button onClick={() => { onDone(); onClose(); }} style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={14} color="var(--text-muted)" />
          </button>
        </div>

        {!created ? (
          <>
            {[
              { label: 'ETİKET (opsiyonel)', key: 'label', type: 'text', placeholder: 'ör: Mağaza Girişi' },
              { label: 'KAZANILACAK PUAN', key: 'points', type: 'number', placeholder: '100' },
              { label: 'MAKSIMUM KULLANIM (opsiyonel, boş=sınırsız)', key: 'max_uses', type: 'number', placeholder: '' },
              { label: 'BİTİŞ TARİHİ (opsiyonel)', key: 'expires_at', type: 'date', placeholder: '' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', display: 'block', marginBottom: 5 }}>{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={(form as Record<string, string>)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none' }} />
              </div>
            ))}

            {error && <div style={{ marginBottom: 12, padding: '10px 14px', borderRadius: 10, background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', fontSize: 12, color: '#ef4444', fontWeight: 700 }}>{error}</div>}

            <button onClick={handleCreate} disabled={saving}
              style={{ width: '100%', padding: 13, borderRadius: 14, fontWeight: 900, fontSize: 14, background: 'linear-gradient(180deg,#22c55e,#16a34a)', color: 'white', border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: saving ? 0.7 : 1 }}>
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {saving ? 'Oluşturuluyor…' : 'QR Oluştur'}
            </button>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{ background: 'white', padding: 16, borderRadius: 20, border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)', display: 'inline-block', marginBottom: 16 }}>
              <img src={qrUrl} alt="QR Code" style={{ width: 220, height: 220, display: 'block', borderRadius: 10 }} />
            </div>
            <p style={{ fontFamily: 'monospace', fontSize: 18, fontWeight: 900, color: 'var(--primary-blue)', margin: '0 0 4px', letterSpacing: '0.1em' }}>{created.code}</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 16px' }}>{created.label ?? ''} · {created.points} puan</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleCopy} style={{ flex: 1, padding: 11, borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {copied ? <Check size={14} color="#22c55e" /> : <Copy size={14} />} {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
              </button>
              <button onClick={() => { onDone(); onClose(); }} style={{ flex: 1, padding: 11, borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer' }}>
                Tamam
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StoreAdminQR: React.FC = () => {
  const { authUser } = useAuth();
  const [qrCodes, setQrCodes] = useState<QRCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let q = supabase.from('qr_codes').select('*').order('created_at', { ascending: false }).limit(100);
      const searchFilter = ilikeOrFilter(['code', 'label'], search);
      if (searchFilter) q = q.or(searchFilter);
      const { data, error } = await q;
      if (error) throw error;
      setQrCodes((data ?? []) as QRCode[]);
    } catch (e) { console.error('[StoreAdminQR]', e); }
    finally { setLoading(false); }
  }, [search]);

  useEffect(() => { const t = setTimeout(() => load(), 300); return () => clearTimeout(t); }, [load]);
  useRealtimeTable('qr_codes', load);

  const toggleActive = async (r: QRCode) => {
    await supabase.from('qr_codes').update({ active: !r.active }).eq('id', r.id);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bu QR kodu silmek istiyor musunuz?')) return;
    await supabase.from('qr_codes').delete().eq('id', id);
    load();
  };

  return (
    <StoreAdminLayout>
      <div style={{ padding: 'clamp(16px,4vw,24px)', paddingBottom: 32, maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {showCreate && authUser?.id && (
          <CreateModal storeId={authUser.id} onClose={() => setShowCreate(false)} onDone={load} />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ ...card, flex: 1, padding: 'clamp(16px,3vw,22px)', background: 'linear-gradient(135deg,#22c55e,#16a34a)', marginRight: 12 }}>
            <p style={{ fontWeight: 900, fontSize: 20, color: 'white', margin: '0 0 4px' }}>QR Kodlar 📲</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: 0 }}>{qrCodes.length} kod kayıtlı</p>
          </div>
          <button onClick={() => setShowCreate(true)}
            style={{ ...card, padding: '14px 18px', background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, fontSize: 13, boxShadow: '0 4px 0 var(--dark-border)', flexShrink: 0 }}>
            <Plus size={16} /> Yeni QR
          </button>
        </div>

        {/* Search */}
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input type="text" placeholder="Kod veya etiket ara..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 12, paddingBottom: 12, borderRadius: 12, fontSize: 13, fontWeight: 600, background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', color: 'var(--text-dark)', outline: 'none', boxShadow: '0 3px 0 var(--dark-border)' }} />
          </div>
          <button onClick={() => load()} style={{ padding: '0 14px', borderRadius: 12, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <RefreshCw size={15} color="var(--text-muted)" />
          </button>
        </div>

        {/* QR list */}
        <div style={{ ...card, overflow: 'hidden', padding: 0 }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto 12px', color: 'var(--text-muted)' }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Yükleniyor…</p>
            </div>
          ) : qrCodes.length === 0 ? (
            <div style={{ padding: 48, textAlign: 'center' }}>
              <QrCode size={36} style={{ margin: '0 auto 12px', color: 'var(--text-muted)', opacity: 0.4 }} />
              <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Henüz QR kod yok</p>
              <button onClick={() => setShowCreate(true)} style={{ marginTop: 12, padding: '10px 20px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'linear-gradient(180deg,#7B6EF6,#5b4dd1)', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', cursor: 'pointer' }}>
                İlk QR'ı Oluştur
              </button>
            </div>
          ) : qrCodes.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < qrCodes.length - 1 ? '1.5px solid var(--dark-border)' : 'none', opacity: r.active ? 1 : 0.5 }}>
              <div style={{ width: 50, height: 50, borderRadius: 12, background: 'white', border: '2px solid var(--dark-border)', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(r.code)}&size=50x50&margin=2`}
                  alt={r.code}
                  style={{ width: 46, height: 46 }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'monospace', fontWeight: 900, fontSize: 13, color: 'var(--primary-blue)', margin: '0 0 2px', letterSpacing: '0.07em' }}>{r.code}</p>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                  {r.label && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{r.label}</span>}
                  <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, fontWeight: 900, background: 'rgba(245,158,11,0.12)', color: '#d97706', border: '1px solid #f59e0b' }}>⭐ {r.points} puan</span>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{r.uses_count ?? 0}{r.max_uses ? `/${r.max_uses}` : ''} kullanım</span>
                  {r.expires_at && <span style={{ fontSize: 10, color: new Date(r.expires_at) < new Date() ? '#ef4444' : 'var(--text-muted)' }}>🕐 {relTime(r.expires_at)}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <button onClick={() => toggleActive(r)} title={r.active ? 'Pasife al' : 'Aktifleştir'} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                  {r.active ? <ToggleRight size={24} color="#22c55e" /> : <ToggleLeft size={24} color="var(--text-muted)" />}
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

export default StoreAdminQR;
