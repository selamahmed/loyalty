import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, CreditCard as Edit3, Trash2, X, Check, Calendar,
  Zap, Flame, Clock, Loader2, AlertCircle, Power,
} from 'lucide-react';
import AdminLayout from './AdminLayout';
import { getAllEvents, createEvent, updateEvent, deleteEvent } from '../../services/events';
import type { AppEvent } from '../../services/events';
import { useRealtimeTable } from '../../hooks/useRealtime';
import { eventEndTime, eventStartTime } from '../../lib/eventDates';

/* ─── Styles ──────────────────────────────────────────────── */
const nbCard: React.CSSProperties = {
  border: '3px solid #000',
  boxShadow: '0 6px 0 #000',
  borderRadius: 18,
  background: 'var(--card-bg)',
  overflow: 'hidden',
};

const multiplierColor: Record<string, string> = {
  '1x': '#e2e8f0', '1.5x': '#BFFF00', '2x': '#FFE500', '3x': '#FF6B35',
};

/* ─── Helpers ─────────────────────────────────────────────── */
const fmtDate = (iso?: string | null) => iso ? iso.split('T')[0] : '—';

function eventStatus(ev: AppEvent): 'live' | 'upcoming' | 'ended' {
  const now = Date.now();
  const s   = eventStartTime(ev.start_date);
  const e   = eventEndTime(ev.end_date);
  if (now > e) return 'ended';
  if (now < s) return 'upcoming';
  return 'live';
}

const STATUS_ACCENT: Record<string, { bg: string; icon: string; label: string }> = {
  live:     { bg: '#FFE500', icon: '🔴', label: 'CANLI'    },
  upcoming: { bg: '#00D1FF', icon: '⏳', label: 'YAKLAŞAN' },
  ended:    { bg: '#e2e8f0', icon: '✅', label: 'BİTTİ'    },
};

/* ─── Types ───────────────────────────────────────────────── */
interface FormState {
  title: string; description: string;
  startDate: string; endDate: string;
  multiplier: string; active: boolean;
}

const blankForm = (): FormState => ({
  title: '', description: '', startDate: '', endDate: '', multiplier: '2x', active: false,
});

const eventToForm = (ev: AppEvent): FormState => ({
  title:       ev.title,
  description: ev.description ?? '',
  startDate:   fmtDate(ev.start_date),
  endDate:     fmtDate(ev.end_date),
  multiplier:  ev.multiplier ?? '1x',
  active:      ev.active,
});

/* ══════════════════════════════════════════════════════════ */
const AdminEvents: React.FC = () => {
  const [events,      setEvents]      = useState<AppEvent[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [showModal,   setShowModal]   = useState(false);
  const [editingEv,   setEditingEv]   = useState<AppEvent | null>(null);
  const [form,        setForm]        = useState<FormState>(blankForm());
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [formError,   setFormError]   = useState('');
  const [deleteId,    setDeleteId]    = useState<string | null>(null);
  const [togglingId,  setTogglingId]  = useState<string | null>(null);
  const [toast,       setToast]       = useState('');

  /* Load */
  const load = useCallback(async () => {
    try {
      setEvents(await getAllEvents());
    } catch { /**/ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);
  useRealtimeTable('events', load);

  /* Toast helper */
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  /* Open modal */
  const openNew = () => { setEditingEv(null); setForm(blankForm()); setFormError(''); setShowModal(true); };
  const openEdit = (ev: AppEvent) => { setEditingEv(ev); setForm(eventToForm(ev)); setFormError(''); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setFormError(''); };

  /* Save */
  const handleSave = async () => {
    if (!form.title.trim()) { setFormError('Etkinlik adı zorunludur'); return; }
    if (!form.startDate || !form.endDate) { setFormError('Başlangıç ve bitiş tarihleri zorunludur'); return; }
    setSaving(true); setFormError('');
    try {
      const payload = {
        title:       form.title.trim(),
        description: form.description,
        start_date:  form.startDate,
        end_date:    form.endDate,
        multiplier:  form.multiplier,
        active:      form.active,
      };
      if (editingEv) {
        const u = await updateEvent(editingEv.id, payload);
        setEvents(prev => prev.map(e => e.id === editingEv.id ? u : e));
        showToast('Etkinlik güncellendi ✅');
      } else {
        const c = await createEvent({ ...payload, image: null, color: null, emoji: null });
        setEvents(prev => [c, ...prev]);
        showToast('Etkinlik oluşturuldu ✅');
      }
      setSaved(true);
      setTimeout(() => { setSaved(false); closeModal(); }, 700);
    } catch (err: unknown) {
      setFormError((err as Error).message ?? 'Kaydedilemedi');
    } finally { setSaving(false); }
  };

  /* Delete */
  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id);
      setEvents(prev => prev.filter(e => e.id !== id));
      setDeleteId(null);
      showToast('Etkinlik silindi');
    } catch { showToast('Silinemedi — tekrar deneyin'); }
  };

  /* Toggle active */
  const handleToggle = async (ev: AppEvent) => {
    setTogglingId(ev.id);
    try {
      const updated = await updateEvent(ev.id, { active: !ev.active });
      setEvents(prev => prev.map(e => e.id === ev.id ? updated : e));
    } catch { showToast('Güncellenemedi'); }
    finally { setTogglingId(null); }
  };

  /* ════════════════════════════════════════════════════════ */
  return (
    <AdminLayout>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: 16, right: 16, zIndex: 200,
          background: '#000', color: '#FFE500', fontWeight: 900, fontSize: 13,
          padding: '10px 18px', borderRadius: 12, border: '2px solid #FFE500',
          boxShadow: '0 4px 0 #FFE500',
        }}>
          {toast}
        </div>
      )}

      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.82)' }}>
          <div style={{ ...nbCard, maxWidth: 460, width: '100%', padding: 28 }}>
            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFE500', color: '#000', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 6 }}>
                  🎉 {editingEv ? 'ETKİNLİK DÜZENLE' : 'YENİ ETKİNLİK'}
                </div>
                <h3 style={{ fontWeight: 900, fontSize: 20, margin: 0, color: 'var(--text-dark)' }}>
                  {editingEv ? 'Etkinliği Düzenle' : 'Etkinlik Oluştur'}
                </h3>
              </div>
              <button onClick={closeModal} style={{ width: 36, height: 36, borderRadius: 10, border: '2.5px solid #000', boxShadow: '0 3px 0 #000', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            {/* Error */}
            {formError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fee2e2', border: '2px solid #f87171', borderRadius: 10, padding: '8px 12px', marginBottom: 14, fontSize: 12, fontWeight: 700, color: '#b91c1c' }}>
                <AlertCircle size={14} /> {formError}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Etkinlik Adı *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input-field" placeholder="örn. Yaz Splash 2026" />
              </div>
              {/* Description */}
              <div>
                <label style={labelStyle}>Açıklama</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="input-field resize-none" rows={3} placeholder="Katılımcılara ne gösterilsin?" />
              </div>
              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Başlangıç *</label>
                  <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label style={labelStyle}>Bitiş *</label>
                  <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} className="input-field" />
                </div>
              </div>
              {/* Multiplier */}
              <div>
                <label style={labelStyle}>Puan Çarpanı</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['1x', '1.5x', '2x', '3x'].map(m => (
                    <button key={m} type="button" onClick={() => setForm(f => ({ ...f, multiplier: m }))} style={{
                      flex: 1, padding: '8px 4px', fontWeight: 900, fontSize: 13, borderRadius: 10, cursor: 'pointer',
                      border: '2.5px solid #000',
                      boxShadow: form.multiplier === m ? '0 4px 0 #000' : '0 2px 0 #000',
                      background: form.multiplier === m ? (multiplierColor[m] ?? '#FFE500') : 'var(--card-bg)',
                      transform: form.multiplier === m ? 'translateY(-2px)' : '',
                      transition: 'all 0.12s',
                    }}>{m}</button>
                  ))}
                </div>
              </div>
              {/* Active toggle */}
              <button type="button" onClick={() => setForm(f => ({ ...f, active: !f.active }))} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                border: '2.5px solid #000', boxShadow: '0 3px 0 #000',
                background: form.active ? '#FFE500' : 'var(--card-bg)', fontWeight: 900, fontSize: 13,
                transition: 'background 0.15s',
              }}>
                <div style={{ width: 22, height: 22, borderRadius: 6, border: '2.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: form.active ? '#000' : 'var(--tab-bg)', flexShrink: 0 }}>
                  {form.active && <Check size={13} color="#FFE500" />}
                </div>
                {form.active ? '✅ Aktif Etkinlik' : 'Aktif Et'}
              </button>
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={closeModal} style={{ flex: 1, padding: '11px 0', fontWeight: 900, fontSize: 13, borderRadius: 12, cursor: 'pointer', border: '2.5px solid #000', boxShadow: '0 4px 0 #000', background: 'var(--card-bg)', color: 'var(--text-dark)' }}>
                İptal
              </button>
              <button onClick={handleSave} disabled={saving} style={{
                flex: 1, padding: '11px 0', fontWeight: 900, fontSize: 13, borderRadius: 12, cursor: saving ? 'wait' : 'pointer',
                border: '2.5px solid #000', boxShadow: '0 4px 0 #000',
                background: saved ? '#BFFF00' : '#FFE500', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                opacity: saving ? 0.7 : 1, transition: 'background 0.15s',
              }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <><Check size={14} /> Kaydedildi!</> : editingEv ? 'Kaydet' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirm modal ── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.75)' }}>
          <div style={{ ...nbCard, maxWidth: 340, width: '100%', padding: 24 }}>
            <p style={{ fontWeight: 900, fontSize: 16, margin: '0 0 6px', color: 'var(--text-dark)' }}>Etkinliği sil?</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px', fontWeight: 600 }}>Bu işlem geri alınamaz.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ flex: 1, padding: '10px 0', fontWeight: 900, fontSize: 13, borderRadius: 12, cursor: 'pointer', border: '2.5px solid #000', boxShadow: '0 4px 0 #000', background: 'var(--card-bg)', color: 'var(--text-dark)' }}>
                İptal
              </button>
              <button onClick={() => handleDelete(deleteId)} style={{ flex: 1, padding: '10px 0', fontWeight: 900, fontSize: 13, borderRadius: 12, cursor: 'pointer', border: '2.5px solid #000', boxShadow: '0 4px 0 #c00', background: '#FF6B6B', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Trash2 size={14} /> Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main page ── */}
      <div style={{ padding: 'clamp(12px,3vw,24px)', maxWidth: 840, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFE500', color: '#000', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 6 }}>
              🎉 ETKİNLİK YÖNETİMİ
            </div>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', margin: 0, color: 'var(--text-dark)', letterSpacing: '-0.03em' }}>Etkinlikler</h1>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
              {events.length} etkinlik · Supabase gerçek zamanlı
            </p>
          </div>
          <NbButton onClick={openNew}>
            <Plus size={15} /> Yeni Etkinlik
          </NbButton>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ ...nbCard, padding: 48, textAlign: 'center' }}>
            <Loader2 size={32} style={{ margin: '0 auto 12px', color: '#FFE500', display: 'block' }} className="animate-spin" />
            <p style={{ fontWeight: 900, color: 'var(--text-muted)' }}>Yükleniyor...</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && events.length === 0 && (
          <div style={{ ...nbCard, padding: 56, textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <p style={{ fontWeight: 900, fontSize: 18, margin: '0 0 6px', color: 'var(--text-dark)' }}>Henüz etkinlik yok</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '0 0 24px', fontWeight: 600 }}>İlk puan çarpanlı etkinliği oluşturun</p>
            <NbButton onClick={openNew}><Plus size={15} /> Etkinlik Oluştur</NbButton>
          </div>
        )}

        {/* Event cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map((ev, i) => {
            const status  = eventStatus(ev);
            const accent  = STATUS_ACCENT[status];
            const mult    = ev.multiplier ?? '1x';
            const multBg  = multiplierColor[mult] ?? '#FFE500';
            const isToggling = togglingId === ev.id;

            return (
              <div key={ev.id} style={{
                ...nbCard,
                transform: i % 3 === 0 ? 'rotate(-0.4deg)' : i % 3 === 1 ? 'rotate(0.3deg)' : 'rotate(-0.2deg)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'rotate(0deg) translateY(-3px)'; el.style.boxShadow = '0 10px 0 #000'; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = i % 3 === 0 ? 'rotate(-0.4deg)' : i % 3 === 1 ? 'rotate(0.3deg)' : 'rotate(-0.2deg)'; el.style.boxShadow = '0 6px 0 #000'; }}
              >
                {/* Top accent stripe */}
                <div style={{ height: 8, background: accent.bg, borderBottom: '3px solid #000' }} />

                <div style={{ display: 'flex', gap: 0 }}>
                  {/* Thumbnail */}
                  <div style={{ width: 120, flexShrink: 0, position: 'relative', borderRight: '3px solid #000', overflow: 'hidden', minHeight: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {ev.image ? (
                      <img src={ev.image} alt={ev.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(15%) contrast(1.05)' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', minHeight: 120, background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🎉</div>
                    )}
                    {/* Multiplier badge */}
                    <div style={{ position: 'absolute', top: 8, left: 8, background: multBg, color: '#000', fontWeight: 900, fontSize: 12, padding: '3px 8px', borderRadius: 8, border: '2px solid #000', boxShadow: '0 2px 0 #000', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Zap size={9} /> {mult}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Status badge */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 6, background: accent.bg, color: '#000', borderRadius: 999, padding: '2px 9px', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', border: '1.5px solid #000' }}>
                          {accent.icon} {accent.label}
                        </div>
                        <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{ev.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '5px 0 8px', fontWeight: 600, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                          {ev.description || <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Açıklama yok</span>}
                        </p>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                        {/* Active toggle */}
                        <button
                          onClick={() => handleToggle(ev)}
                          disabled={isToggling}
                          title={ev.active ? 'Devre dışı bırak' : 'Aktifleştir'}
                          style={{ width: 34, height: 34, borderRadius: 10, border: '2.5px solid #000', boxShadow: '0 3px 0 #000', background: ev.active ? '#BFFF00' : 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isToggling ? 'wait' : 'pointer', flexShrink: 0 }}
                        >
                          {isToggling ? <Loader2 size={13} className="animate-spin" /> : <Power size={13} color={ev.active ? '#000' : undefined} />}
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEdit(ev)} title="Düzenle" style={{ width: 34, height: 34, borderRadius: 10, border: '2.5px solid #000', boxShadow: '0 3px 0 #000', background: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          <Edit3 size={13} />
                        </button>
                        {/* Delete */}
                        <button onClick={() => setDeleteId(ev.id)} title="Sil" style={{ width: 34, height: 34, borderRadius: 10, border: '2.5px solid #000', boxShadow: '0 3px 0 #c00', background: '#FF6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          <Trash2 size={13} color="#fff" />
                        </button>
                      </div>
                    </div>

                    {/* Date & meta row */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                        <Calendar size={11} /> {fmtDate(ev.start_date)} → {fmtDate(ev.end_date)}
                      </span>
                      {ev.multiplier && ev.multiplier !== '1x' && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                          <Flame size={11} /> {ev.multiplier} çarpan
                        </span>
                      )}
                      {ev.active && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 900, color: '#16a34a', background: '#dcfce7', borderRadius: 999, padding: '1px 7px', border: '1.5px solid #16a34a' }}>
                          <Clock size={9} /> Aktif
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

/* ─── Small helpers ──────────────────────────────────────── */

const labelStyle: React.CSSProperties = {
  display: 'block', fontWeight: 900, fontSize: 11, marginBottom: 6,
  color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.06em',
};

const NbButton: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px',
      fontWeight: 900, fontSize: 13, border: '3px solid #000', boxShadow: '0 5px 0 #000',
      borderRadius: 14, background: '#FFE500', color: '#000', cursor: 'pointer', flexShrink: 0,
      transition: 'transform 0.1s, box-shadow 0.1s',
    }}
    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; }}
    onMouseDown={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(3px)'; el.style.boxShadow = '0 2px 0 #000'; }}
    onMouseUp={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '0 5px 0 #000'; }}
  >
    {children}
  </button>
);

export default AdminEvents;
