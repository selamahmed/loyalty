import React, { useState, useCallback, useEffect } from 'react';
import { MessageSquare, Phone, Mail, Clock, User, Check, X, RefreshCw, Search, ChevronDown, AlertCircle, Loader } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { supabase } from '../../lib/supabase';
import { useRealtimeTable } from '../../hooks/useRealtime';

interface SupportTicket {
  id: string;
  user_id: string | null;
  type: string;
  status: string;
  priority: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  preferred_time: string | null;
  assigned_to: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  contact:  { label: 'İletişim',      icon: '✉️',  color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  callback: { label: 'Geri Arama',    icon: '📞',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
  chat:     { label: 'Canlı Sohbet',  icon: '💬',  color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Açık',         color: '#3b82f6', bg: 'rgba(59,130,246,0.12)'  },
  in_progress: { label: 'İşlemde',      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  resolved:    { label: 'Çözüldü',      color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  closed:      { label: 'Kapatıldı',    color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low:    { label: 'Düşük',   color: '#94a3b8' },
  normal: { label: 'Normal',  color: '#3b82f6' },
  high:   { label: 'Yüksek',  color: '#f59e0b' },
  urgent: { label: 'Acil',    color: '#ef4444' },
};

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0 6px 0 var(--dark-border)',
  borderRadius: 20,
};

const AdminSupport: React.FC = () => {
  const [tickets, setTickets]         = useState<SupportTicket[]>([]);
  const [filtered, setFiltered]       = useState<SupportTicket[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [filterType, setFilterType]   = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selected, setSelected]       = useState<SupportTicket | null>(null);
  const [saving, setSaving]           = useState(false);
  const [notes, setNotes]             = useState('');
  const [newStatus, setNewStatus]     = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setTickets(data ?? []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Filter
  useEffect(() => {
    let list = tickets;
    if (filterType !== 'all')   list = list.filter(t => t.type === filterType);
    if (filterStatus !== 'all') list = list.filter(t => t.status === filterStatus);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        (t.subject?.toLowerCase() ?? '').includes(q) ||
        t.message.toLowerCase().includes(q)
      );
    }
    setFiltered(list);
  }, [tickets, search, filterType, filterStatus]);

  useRealtimeTable('support_tickets', load);

  const openDetail = (t: SupportTicket) => {
    setSelected(t);
    setNotes(t.admin_notes ?? '');
    setNewStatus(t.status);
  };

  const saveTicket = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus, admin_notes: notes, updated_at: new Date().toISOString() })
        .eq('id', selected.id);
      if (error) throw error;
      await load();
      setSelected(null);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  // Stats
  const stats = {
    total:    tickets.length,
    open:     tickets.filter(t => t.status === 'open').length,
    callback: tickets.filter(t => t.type === 'callback').length,
    urgent:   tickets.filter(t => t.priority === 'urgent' || t.priority === 'high').length,
  };

  return (
    <AdminLayout>
      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>YÖNETİM</p>
            <h1 style={{ fontWeight: 900, fontSize: 'clamp(20px,5vw,28px)', color: 'var(--text-dark)', margin: '4px 0 0' }}>Destek Talepleri</h1>
          </div>
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '10px 16px', borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer', background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', color: 'var(--text-dark)' }}>
            <RefreshCw size={14} /> Yenile
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
          {[
            { label: 'Toplam', val: stats.total,    color: '#7B6EF6', emoji: '📋' },
            { label: 'Açık',   val: stats.open,     color: '#3b82f6', emoji: '🔵' },
            { label: 'Geri Arama', val: stats.callback, color: '#f59e0b', emoji: '📞' },
            { label: 'Yüksek Ön.', val: stats.urgent, color: '#ef4444', emoji: '🔴' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '14px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 22, color: s.color, margin: '0 0 2px' }}>{s.val}</p>
              <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Ad, e-posta, konu ara..." style={{ width: '100%', padding: '10px 12px 10px 34px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          {(['all', 'contact', 'callback', 'chat'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)} style={{ padding: '10px 14px', borderRadius: 12, fontWeight: 900, fontSize: 11, cursor: 'pointer', background: filterType === t ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)', color: filterType === t ? 'white' : 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)' }}>
              {t === 'all' ? 'Tümü' : TYPE_CONFIG[t]?.label}
            </button>
          ))}
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ padding: '10px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12, cursor: 'pointer', background: 'var(--card-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', outline: 'none' }}>
            <option value="all">Tüm Durumlar</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>

        {/* Ticket list */}
        {loading ? (
          <div style={{ ...card, padding: 40, textAlign: 'center' }}>
            <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', margin: '0 auto 10px', display: 'block', color: 'var(--text-muted)' }} />
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>Yükleniyor...</p>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ ...card, padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>Talep yok</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>Filtrelerinize uygun destek talebi bulunamadı.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(t => {
              const typeCfg   = TYPE_CONFIG[t.type]   ?? TYPE_CONFIG.contact;
              const statusCfg = STATUS_CONFIG[t.status] ?? STATUS_CONFIG.open;
              const priCfg    = PRIORITY_CONFIG[t.priority] ?? PRIORITY_CONFIG.normal;
              return (
                <div key={t.id} onClick={() => openDetail(t)} style={{ ...card, padding: '14px 18px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: 14, transition: 'transform 0.1s, box-shadow 0.1s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  {/* Type icon */}
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: typeCfg.bg, border: `2px solid ${typeCfg.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    {typeCfg.icon}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)' }}>{t.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>{t.email}</span>
                      {t.phone && <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>📞 {t.phone}</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.subject ?? t.message.slice(0, 80)}
                    </p>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: statusCfg.bg, color: statusCfg.color, border: `1.5px solid ${statusCfg.color}` }}>{statusCfg.label}</span>
                      <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: typeCfg.bg, color: typeCfg.color }}>{typeCfg.label}</span>
                      {t.priority !== 'normal' && <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: `${priCfg.color}20`, color: priCfg.color }}>● {priCfg.label}</span>}
                    </div>
                  </div>
                  {/* Time */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                      {new Date(t.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' })}
                    </p>
                    <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 600 }}>
                      {new Date(t.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Detail modal */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
            <div style={{ maxWidth: 500, width: '100%', background: 'var(--card-bg)', border: '3px solid var(--dark-border)', boxShadow: '0 8px 0 var(--dark-border)', borderRadius: 22, overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto' }}>

              {/* Header */}
              <div style={{ padding: '16px 20px', borderBottom: '2.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 28 }}>{TYPE_CONFIG[selected.type]?.icon ?? '📋'}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: 0 }}>{selected.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{selected.email}</p>
                </div>
                <button onClick={() => setSelected(null)} style={{ width: 32, height: 32, borderRadius: 9, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <X size={16} color="var(--text-muted)" />
                </button>
              </div>

              <div style={{ padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    { label: 'Tür',      val: TYPE_CONFIG[selected.type]?.label ?? selected.type },
                    { label: 'Tarih',    val: new Date(selected.created_at).toLocaleString('tr-TR') },
                    selected.phone       ? { label: 'Telefon', val: selected.phone } : null,
                    selected.preferred_time ? { label: 'Tercih Saat', val: selected.preferred_time } : null,
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)' }}>
                      <p style={{ fontSize: 9, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 3px' }}>{item!.label}</p>
                      <p style={{ fontSize: 13, fontWeight: 900, color: 'var(--text-dark)', margin: 0 }}>{item!.val}</p>
                    </div>
                  ))}
                </div>

                {/* Subject */}
                {selected.subject && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 6px' }}>Konu</p>
                    <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{selected.subject}</p>
                  </div>
                )}

                {/* Message */}
                <div style={{ padding: '14px', borderRadius: 14, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                  <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Mesaj</p>
                  <p style={{ fontSize: 13, color: 'var(--text-dark)', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>{selected.message}</p>
                </div>

                {/* Status */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Durum</label>
                  <select value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, fontWeight: 900, fontSize: 13, background: 'var(--card-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', outline: 'none', cursor: 'pointer' }}>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                  </select>
                </div>

                {/* Admin notes */}
                <div>
                  <label style={{ display: 'block', fontSize: 10, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Admin Notu</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} placeholder="İç notlar, takip bilgileri..." style={{ width: '100%', padding: '10px 12px', borderRadius: 12, fontWeight: 700, fontSize: 13, background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setSelected(null)} style={{ flex: 1, padding: '12px', borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: 'pointer', background: 'var(--tab-bg)', color: 'var(--text-dark)', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)' }}>
                    İptal
                  </button>
                  <button onClick={saveTicket} disabled={saving} style={{ flex: 2, padding: '12px', borderRadius: 14, fontWeight: 900, fontSize: 13, cursor: saving ? 'not-allowed' : 'pointer', background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white', border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)', opacity: saving ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                    {saving ? <><Loader size={14} style={{ animation: 'spin 0.8s linear infinite' }} /> Kaydediliyor...</> : <><Check size={14} /> Kaydet</>}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AdminLayout>
  );
};

export default AdminSupport;
