import React, { useState } from 'react';
import { Plus, CreditCard as Edit3, Trash2, X, Check, Calendar, Zap, Flame, Clock, Star } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { seasonalEvents } from '../../data/mockData';
import { tr } from '../../lib/tr';

const nbCard = {
  border: '3px solid #000',
  boxShadow: '0 6px 0 #000',
  borderRadius: 18,
  background: '#fff',
  overflow: 'hidden' as const,
};

const getEventAccent = (ev: { active: boolean; progress: number }) => {
  if (ev.active)          return { bg: '#FFE500', badge: '#000',   badgeText: '#FFE500', label: 'AKTİF',     icon: '🔴' };
  if (ev.progress >= 100) return { bg: '#BFFF00', badge: '#000',   badgeText: '#BFFF00', label: 'TAMAMLANDI', icon: '✅' };
  if (ev.progress === 0)  return { bg: '#00D1FF', badge: '#000',   badgeText: '#00D1FF', label: 'YAKINDA',   icon: '🕐' };
  return                         { bg: '#FF6B35', badge: '#000',   badgeText: '#FF6B35', label: 'DEVAM EDİYOR', icon: '⚡' };
};

const multiplierColor: Record<string, string> = {
  '1x': '#e2e8f0', '1.5x': '#BFFF00', '2x': '#FFE500', '3x': '#FF6B35',
};

const AdminEvents: React.FC = () => {
  const [events, setEvents] = useState(seasonalEvents.map(e => ({ ...e })));
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<typeof seasonalEvents[0] | null>(null);
  const [form, setForm] = useState({ title: '', description: '', startDate: '', endDate: '', multiplier: '2x', active: false });
  const [saved, setSaved] = useState(false);

  const openNew = () => {
    setEditingEvent(null);
    setForm({ title: '', description: '', startDate: '', endDate: '', multiplier: '2x', active: false });
    setShowModal(true);
  };

  const openEdit = (ev: typeof seasonalEvents[0]) => {
    setEditingEvent(ev);
    setForm({ title: ev.title, description: ev.description, startDate: ev.startDate, endDate: ev.endDate, multiplier: ev.multiplier, active: ev.active });
    setShowModal(true);
  };

  const handleSave = () => {
    setSaved(true);
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...e, ...form } : e));
    } else {
      setEvents(prev => [...prev, { ...form, id: Date.now().toString(), image: 'https://picsum.photos/seed/newev/400/200', progress: 0, totalRewards: 0, unlockedRewards: 0, color: 'from-blue-400 to-cyan-300' }]);
    }
    setTimeout(() => { setSaved(false); setShowModal(false); }, 800);
  };

  return (
    <AdminLayout>
      {/* ── Modal ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ ...nbCard, maxWidth: 440, width: '100%', padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFE500', color: '#000', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 6 }}>
                  🎉 {editingEvent ? 'ETKİNLİK DÜZENLE' : 'YENİ ETKİNLİK'}
                </div>
                <h3 style={{ fontWeight: 900, fontSize: 20, margin: 0, color: 'var(--text-dark)' }}>{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              </div>
              <button onClick={() => setShowModal(false)} style={{ width: 36, height: 36, borderRadius: 10, border: '2.5px solid #000', boxShadow: '0 3px 0 #000', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 900, fontSize: 12, marginBottom: 6, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Event Title</label>
                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="e.g. Summer Splash" />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 900, fontSize: 12, marginBottom: 6, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Description</label>
                <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" rows={3} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 900, fontSize: 12, marginBottom: 6, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 900, fontSize: 12, marginBottom: 6, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} className="input-field" />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 900, fontSize: 12, marginBottom: 6, color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Points Multiplier</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['1x', '1.5x', '2x', '3x'].map(m => (
                    <button key={m} type="button" onClick={() => setForm({...form, multiplier: m})} style={{
                      flex: 1, padding: '8px 4px', fontWeight: 900, fontSize: 13, borderRadius: 10, cursor: 'pointer',
                      border: '2.5px solid #000', boxShadow: form.multiplier === m ? '0 4px 0 #000' : '0 2px 0 #000',
                      background: form.multiplier === m ? multiplierColor[m] : '#fff',
                      transform: form.multiplier === m ? 'translateY(-2px)' : '',
                    }}>{m}</button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={() => setForm({...form, active: !form.active})} style={{
                display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 12, cursor: 'pointer',
                border: '2.5px solid #000', boxShadow: '0 3px 0 #000',
                background: form.active ? '#FFE500' : '#fff', fontWeight: 900, fontSize: 13,
              }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6, border: '2.5px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: form.active ? '#000' : '#fff',
                }}>
                  {form.active && <Check size={13} color="#FFE500" />}
                </div>
                Active Event
              </button>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowModal(false)} style={{
                flex: 1, padding: '11px 0', fontWeight: 900, fontSize: 13, borderRadius: 12, cursor: 'pointer',
                border: '2.5px solid #000', boxShadow: '0 4px 0 #000', background: '#fff', color: '#000',
              }}>İptal</button>
              <button onClick={handleSave} style={{
                flex: 1, padding: '11px 0', fontWeight: 900, fontSize: 13, borderRadius: 12, cursor: 'pointer',
                border: '2.5px solid #000', boxShadow: '0 4px 0 #000',
                background: saved ? '#BFFF00' : '#FFE500', color: '#000',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
                {saved ? <><Check size={14} /> Kaydedildi!</> : editingEvent ? 'Kaydet' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ padding: 'clamp(12px,3vw,24px)', maxWidth: 840, margin: '0 auto' }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFE500', color: '#000', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 6 }}>
              🎉 ETKİNLİK YÖNETİMİ
            </div>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px,4vw,28px)', margin: 0, color: 'var(--text-dark)', letterSpacing: '-0.03em' }}>Events</h1>
          </div>
          <button onClick={openNew} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontWeight: 900, fontSize: 13,
            border: '3px solid #000', boxShadow: '0 5px 0 #000', borderRadius: 14,
            background: '#FFE500', color: '#000', cursor: 'pointer', flexShrink: 0,
            transition: 'transform 0.1s, box-shadow 0.1s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 #000'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #000'; }}
          >
            <Plus size={15} /> Create Event
          </button>
        </div>

        {/* ── Event cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map((ev, i) => {
            const accent = getEventAccent(ev);
            return (
              <div key={ev.id} style={{
                ...nbCard,
                transform: i % 3 === 0 ? 'rotate(-0.4deg)' : i % 3 === 1 ? 'rotate(0.3deg)' : 'rotate(-0.2deg)',
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'rotate(0deg) translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 10px 0 #000'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = i % 3 === 0 ? 'rotate(-0.4deg)' : i % 3 === 1 ? 'rotate(0.3deg)' : 'rotate(-0.2deg)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 #000'; }}
              >
                {/* ── Colour accent header bar ── */}
                <div style={{ height: 8, background: accent.bg, borderBottom: '3px solid #000' }} />

                <div style={{ display: 'flex', gap: 0 }}>
                  {/* ── Cover photo ── */}
                  <div style={{ width: 120, flexShrink: 0, position: 'relative', borderRight: '3px solid #000', overflow: 'hidden' }}>
                    <img
                      src={ev.image}
                      alt={ev.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'grayscale(15%) contrast(1.05)' }}
                    />
                    {/* Multiplier stamp */}
                    <div style={{
                      position: 'absolute', top: 8, left: 8,
                      background: multiplierColor[ev.multiplier] || '#FFE500', color: '#000',
                      fontWeight: 900, fontSize: 13, padding: '3px 8px', borderRadius: 8,
                      border: '2px solid #000', boxShadow: '0 2px 0 #000',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Zap size={10} />{ev.multiplier}
                    </div>
                  </div>

                  {/* ── Content ── */}
                  <div style={{ flex: 1, padding: '14px 16px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* Status tag */}
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 6, background: accent.bg, color: '#000', borderRadius: 999, padding: '2px 9px', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', border: '1.5px solid #000' }}>
                          {accent.icon} {accent.label}
                        </div>
                        <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{ev.title}</p>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '5px 0 8px', fontWeight: 600, lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>{ev.description}</p>
                      </div>

                      {/* Action buttons */}
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        <button onClick={() => openEdit(ev)} style={{
                          width: 34, height: 34, borderRadius: 10, border: '2.5px solid #000', boxShadow: '0 3px 0 #000',
                          background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                          <Edit3 size={14} />
                        </button>
                        <button onClick={() => setEvents(prev => prev.filter(e => e.id !== ev.id))} style={{
                          width: 34, height: 34, borderRadius: 10, border: '2.5px solid #000', boxShadow: '0 3px 0 #000',
                          background: '#FF6B6B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        }}>
                          <Trash2 size={14} color="#fff" />
                        </button>
                      </div>
                    </div>

                    {/* Date row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>
                        <Calendar size={11} />{ev.startDate} → {ev.endDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 900, color: 'var(--text-dark)' }}>
                        <Star size={10} fill="#f59e0b" color="#f59e0b" />
                        {ev.unlockedRewards}/{ev.totalRewards} ödül
                      </span>
                    </div>

                    {/* Progress bar — neo-brutalism */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        <span>İlerleme</span>
                        <span style={{ color: ev.progress >= 100 ? '#22c55e' : 'var(--text-dark)' }}>{ev.progress}%</span>
                      </div>
                      <div style={{ height: 10, borderRadius: 999, background: 'var(--tab-bg)', border: '2px solid #000', overflow: 'hidden', boxShadow: '0 2px 0 #000' }}>
                        <div style={{
                          height: '100%', borderRadius: 999,
                          width: `${ev.progress}%`,
                          background: accent.bg,
                          transition: 'width 0.6s ease',
                        }} />
                      </div>
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

export default AdminEvents;
