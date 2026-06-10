import React, { useState } from 'react';
import StoreAdminLayout from './StoreAdminLayout';
import {
  Bell, Send, Users, Star, Gift, Megaphone,
  Check, X, Clock, CheckCircle, AlertCircle, Trash2
} from 'lucide-react';

const ACCENT = '#22c55e';

type NotifTarget = 'all' | 'vip' | 'active' | 'inactive';
type NotifType   = 'info' | 'promo' | 'points' | 'alert';

interface SentNotif {
  id: string;
  title: string;
  message: string;
  target: NotifTarget;
  type: NotifType;
  sentAt: string;
  recipients: number;
  opened: number;
}

const TARGET_CONFIG: Record<NotifTarget, { label: string; color: string; count: number }> = {
  all:      { label: 'Tüm Müşteriler', color: '#7B6EF6', count: 124 },
  vip:      { label: 'VIP Müşteriler', color: '#f59e0b', count: 18  },
  active:   { label: 'Aktif Müşteriler', color: ACCENT,  count: 67  },
  inactive: { label: 'Pasif Müşteriler', color: '#9ca3af', count: 39 },
};

const TYPE_CONFIG: Record<NotifType, { label: string; color: string; emoji: string }> = {
  info:   { label: 'Bilgilendirme', color: '#7B6EF6', emoji: 'ℹ️' },
  promo:  { label: 'Kampanya',      color: '#f59e0b', emoji: '🏷️' },
  points: { label: 'Puan',          color: ACCENT,    emoji: '⭐' },
  alert:  { label: 'Uyarı',         color: '#ef4444', emoji: '⚠️' },
};

const TEMPLATES = [
  { title: 'Çift Puan Haftası!', message: 'Bu hafta tüm alışverişlerde çift puan kazanın! 🎉', type: 'promo' as NotifType },
  { title: 'Yeni Ödüller Eklendi', message: 'Mağazamıza yeni ödüller eklendi, hemen inceleyin!', type: 'info' as NotifType },
  { title: 'Puanlarınız Bitiyor!', message: 'Puanlarınızın son kullanma tarihi yaklaşıyor. Hemen kullanın!', type: 'alert' as NotifType },
  { title: 'VIP\'e Hoşgeldiniz 🌟', message: 'Tebrikler! VIP seviyesine ulaştınız. Özel ayrıcalıklar sizi bekliyor.', type: 'points' as NotifType },
];

const SENT_HISTORY: SentNotif[] = [
  { id: '1', title: 'Cumartesi Kampanyası', message: 'Bugün tüm alışverişlerde %10 indirim!', target: 'all', type: 'promo', sentAt: '10 Haz 09:00', recipients: 124, opened: 89 },
  { id: '2', title: 'VIP Özel Teklif', message: 'Size özel ücretsiz espresso kuponu!', target: 'vip', type: 'points', sentAt: '09 Haz 14:30', recipients: 18, opened: 16 },
  { id: '3', title: 'Eksik Puan Hatırlatma', message: 'Ödüle 50 puan kaldı, bugün alışveriş yapın!', target: 'active', type: 'alert', sentAt: '08 Haz 11:00', recipients: 67, opened: 43 },
];

const StoreAdminNotifications: React.FC = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [target, setTarget] = useState<NotifTarget>('all');
  const [type, setType] = useState<NotifType>('info');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [history, setHistory] = useState<SentNotif[]>(SENT_HISTORY);

  const applyTemplate = (t: typeof TEMPLATES[0]) => {
    setTitle(t.title);
    setMessage(t.message);
    setType(t.type);
  };

  const handleSend = () => {
    if (!title.trim() || !message.trim()) return;
    setSending(true);
    setTimeout(() => {
      const newNotif: SentNotif = {
        id: Date.now().toString(),
        title, message, target, type,
        sentAt: new Date().toLocaleString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
        recipients: TARGET_CONFIG[target].count,
        opened: 0,
      };
      setHistory(prev => [newNotif, ...prev]);
      setSending(false);
      setSent(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSent(false), 3000);
    }, 1200);
  };

  const deleteNotif = (id: string) => setHistory(prev => prev.filter(n => n.id !== id));

  return (
    <StoreAdminLayout>
      <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto">
        {/* Header */}
        <div className="p-5 rounded-2xl text-white"
          style={{ background: `linear-gradient(135deg, #7B6EF6 0%, #4F8EF7 100%)`, border: '2.5px solid var(--dark-border)', boxShadow: '0px 5px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Bell size={24} className="text-white" />
            </div>
            <div>
              <p className="font-black text-xl">Bildirimler</p>
              <p className="text-white/70 text-sm">Müşterilerinize anlık bildirim gönderin</p>
            </div>
          </div>
        </div>

        {/* Compose */}
        <div className="p-5 rounded-2xl"
          style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 4px 0px var(--dark-border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Megaphone size={16} style={{ color: '#7B6EF6' }} />
            <p className="font-black" style={{ color: 'var(--text-dark)' }}>Yeni Bildirim Oluştur</p>
          </div>

          {/* Templates */}
          <div className="mb-4">
            <p className="text-xs font-black mb-2" style={{ color: 'var(--text-muted)' }}>HIZLI ŞABLONLAR</p>
            <div className="grid grid-cols-2 gap-2">
              {TEMPLATES.map((t, i) => (
                <button key={i} onClick={() => applyTemplate(t)}
                  className="p-2.5 rounded-xl text-left transition-all active:scale-95"
                  style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}>
                  <p className="text-xs font-black truncate" style={{ color: 'var(--text-dark)' }}>{TYPE_CONFIG[t.type].emoji} {t.title}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Target audience */}
          <div className="mb-4">
            <p className="text-xs font-black mb-2" style={{ color: 'var(--text-muted)' }}>HEDEF KİTLE</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(TARGET_CONFIG) as NotifTarget[]).map(t => (
                <button key={t} onClick={() => setTarget(t)}
                  className="p-3 rounded-xl text-left transition-all"
                  style={{
                    background: target === t ? `${TARGET_CONFIG[t].color}15` : 'var(--tab-bg)',
                    border: `2px solid ${target === t ? TARGET_CONFIG[t].color : 'var(--dark-border)'}`,
                  }}>
                  <p className="font-black text-xs" style={{ color: target === t ? TARGET_CONFIG[t].color : 'var(--text-muted)' }}>{TARGET_CONFIG[t].label}</p>
                  <p className="text-xs font-bold mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                    <Users size={10} /> {TARGET_CONFIG[t].count} kişi
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Notif type */}
          <div className="mb-4">
            <p className="text-xs font-black mb-2" style={{ color: 'var(--text-muted)' }}>BİLDİRİM TİPİ</p>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(TYPE_CONFIG) as NotifType[]).map(t => (
                <button key={t} onClick={() => setType(t)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs transition-all"
                  style={{
                    background: type === t ? `${TYPE_CONFIG[t].color}15` : 'var(--tab-bg)',
                    color: type === t ? TYPE_CONFIG[t].color : 'var(--text-muted)',
                    border: `2px solid ${type === t ? TYPE_CONFIG[t].color : 'var(--dark-border)'}`,
                  }}>
                  {TYPE_CONFIG[t].emoji} {TYPE_CONFIG[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Title & message */}
          <div className="space-y-3 mb-4">
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>BAŞLIK *</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bildirim başlığı"
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
            <div>
              <label className="text-xs font-black block mb-1" style={{ color: 'var(--text-muted)' }}>MESAJ *</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Bildirim mesajı..." rows={3}
                className="w-full px-4 py-2.5 rounded-xl font-bold text-sm outline-none resize-none"
                style={{ background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', color: 'var(--text-dark)' }} />
            </div>
          </div>

          {sent ? (
            <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: `${ACCENT}10`, border: `2px solid ${ACCENT}` }}>
              <CheckCircle size={16} style={{ color: ACCENT }} />
              <span className="font-black text-sm" style={{ color: ACCENT }}>Bildirim {TARGET_CONFIG[target].count} kişiye gönderildi!</span>
            </div>
          ) : (
            <button onClick={handleSend} disabled={!title.trim() || !message.trim() || sending}
              className="w-full py-3 rounded-xl font-black text-sm text-white transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{
                background: '#7B6EF6',
                border: '2.5px solid var(--dark-border)',
                boxShadow: '0px 3px 0px var(--dark-border)',
                opacity: (!title.trim() || !message.trim()) ? 0.6 : 1,
              }}>
              {sending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Gönderiliyor…</> : <><Send size={14} /> Gönder — {TARGET_CONFIG[target].count} Kişi</>}
            </button>
          )}
        </div>

        {/* History */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} style={{ color: 'var(--text-muted)' }} />
            <p className="font-black" style={{ color: 'var(--text-dark)' }}>Gönderim Geçmişi</p>
          </div>
          <div className="space-y-3">
            {history.map(n => {
              const tc = TYPE_CONFIG[n.type];
              const tg = TARGET_CONFIG[n.target];
              const openRate = n.recipients > 0 ? Math.round((n.opened / n.recipients) * 100) : 0;
              return (
                <div key={n.id} className="p-4 rounded-2xl"
                  style={{ background: 'var(--card-bg)', border: '2.5px solid var(--dark-border)', boxShadow: '0px 3px 0px var(--dark-border)' }}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{tc.emoji}</span>
                      <div>
                        <p className="font-black text-sm" style={{ color: 'var(--text-dark)' }}>{n.title}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{n.message}</p>
                      </div>
                    </div>
                    <button onClick={() => deleteNotif(n.id)} className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
                      style={{ color: 'var(--text-muted)' }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: `${tg.color}15`, color: tg.color, border: `1.5px solid ${tg.color}` }}>
                      <Users size={9} className="inline mr-1" />{tg.label}
                    </span>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                      {n.sentAt}
                    </span>
                    {n.opened > 0 && (
                      <span className="text-xs font-bold flex items-center gap-1" style={{ color: ACCENT }}>
                        <CheckCircle size={10} /> %{openRate} açıldı ({n.opened}/{n.recipients})
                      </span>
                    )}
                    {n.opened === 0 && (
                      <span className="text-xs font-bold flex items-center gap-1" style={{ color: ACCENT }}>
                        <CheckCircle size={10} /> {n.recipients} kişiye gönderildi
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </StoreAdminLayout>
  );
};

export default StoreAdminNotifications;
