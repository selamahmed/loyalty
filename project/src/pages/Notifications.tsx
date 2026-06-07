import React, { useState } from 'react';
import { Bell, Check, Trash2, Gift, Trophy, Star, Megaphone, Activity, Sparkles } from 'lucide-react';
import { notifications as initialNotifs } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const typeConfig: Record<string, { gradient: string; icon: string; border: string; accent: string }> = {
  reward:      { gradient: 'linear-gradient(135deg,#22c55e,#16a34a)', icon: '🎁', border: '#22c55e', accent: 'rgba(34,197,94,0.1)' },
  achievement: { gradient: 'linear-gradient(135deg,#f59e0b,#d97706)', icon: '🏆', border: '#f59e0b', accent: 'rgba(245,158,11,0.1)' },
  points:      { gradient: 'linear-gradient(135deg,#7B6EF6,#4F8EF7)', icon: '⭐', border: '#7B6EF6', accent: 'rgba(123,110,246,0.1)' },
  event:       { gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', icon: '🎉', border: '#3b82f6', accent: 'rgba(59,130,246,0.1)' },
  system:      { gradient: 'linear-gradient(135deg,#9ca3af,#6b7280)', icon: '⚙️', border: '#6b7280', accent: 'rgba(107,114,128,0.08)' },
};

const filterLabels: Record<string, string> = {
  all: 'Tümü', unread: 'Okunmamış', reward: 'Ödüller', achievement: 'Başarılar', points: 'Puanlar', event: 'Etkinlikler', system: 'Sistem',
};

const Notifications: React.FC = () => {
  const [notifs, setNotifs] = useState(initialNotifs);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? notifs
    : filter === 'unread' ? notifs.filter(n => !n.read)
    : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id: string) => { playSound('click'); setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); };
  const markAllRead = () => { playSound('success'); setNotifs(prev => prev.map(n => ({ ...n, read: true }))); };
  const deleteNotif = (id: string) => { playSound('click'); setNotifs(prev => prev.filter(n => n.id !== id)); };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>BİLDİRİMLER</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16,
                background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
                border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                animation: unreadCount > 0 ? 'bellRing 2s ease-in-out infinite' : 'none',
              }}>🔔</div>
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: -6, right: -6, width: 22, height: 22,
                  borderRadius: '50%', background: '#ef4444', border: '2px solid var(--card-bg)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 900, color: 'white',
                }}>{unreadCount}</div>
              )}
            </div>
            <div>
              <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>{tr.notifications.title}</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>{unreadCount} okunmamış bildirim</p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 12, fontWeight: 900, fontSize: 12,
              background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))', color: 'white',
              border: '2.5px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)', cursor: 'pointer', flexShrink: 0,
            }}>
              <Check size={13} /> Tümünü Okundu İşaretle
            </button>
          )}
        </div>

        {/* ── Filter pills ── */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {Object.keys(filterLabels).map(f => (
            <button key={f} onClick={() => { playSound('click'); setFilter(f); }} style={{
              padding: '8px 14px', borderRadius: 999, fontWeight: 900, fontSize: 11,
              cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'all 0.1s',
              background: filter === f ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
              color: filter === f ? 'white' : 'var(--text-dark)',
              border: '2.5px solid var(--dark-border)',
              boxShadow: filter === f ? '0 4px 0 var(--dark-border)' : '0 3px 0 var(--dark-border)',
            }}>{filterLabels[f]}</button>
          ))}
        </div>

        {/* ── Notification list ── */}
        {filtered.length === 0 ? (
          <div style={{ ...card, border: '3px dashed var(--dark-border)', padding: 48, textAlign: 'center' }}>
            <p style={{ fontSize: 48, margin: '0 0 12px' }}>🔔</p>
            <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 6px' }}>{tr.notifications.empty}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, margin: 0 }}>Şimdilik hepsi bu kadar!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map((notif, index) => {
              const cfg = typeConfig[notif.type] || typeConfig.system;
              const isPriority = notif.type === 'achievement' || notif.type === 'reward';
              return (
                <div
                  key={notif.id}
                  onClick={() => markRead(notif.id)}
                  style={{
                    ...card,
                    border: !notif.read ? `3px solid ${cfg.border}` : '3px solid var(--dark-border)',
                    boxShadow: !notif.read ? `0 6px 0 ${cfg.border}88` : '0 6px 0 var(--dark-border)',
                    background: !notif.read ? cfg.accent : 'var(--card-bg)',
                    padding: '14px 16px', cursor: 'pointer',
                    animation: `notifSlideIn 0.3s ease-out ${index * 0.05}s both`,
                    display: 'flex', alignItems: 'flex-start', gap: 14, position: 'relative', overflow: 'hidden',
                    transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                >
                  {/* Icon */}
                  <div style={{
                    width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                    background: cfg.gradient, border: '2.5px solid var(--dark-border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
                    boxShadow: '0 3px 0 var(--dark-border)', position: 'relative',
                  }}>
                    {cfg.icon}
                    {isPriority && (
                      <Sparkles size={12} color="#fbbf24" style={{ position: 'absolute', top: -4, right: -4 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                          <p style={{
                            fontWeight: 900, fontSize: 14, margin: 0, lineHeight: 1.2,
                            color: !notif.read ? 'var(--text-dark)' : 'var(--text-muted)',
                          }}>{notif.title}</p>
                          {isPriority && (
                            <span style={{ padding: '1px 6px', borderRadius: 999, fontSize: 8, fontWeight: 900, background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid #f59e0b', textTransform: 'uppercase', flexShrink: 0 }}>ÖNEMLİ</span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 5px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notif.message}</p>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{notif.time}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                        {!notif.read && (
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.border, flexShrink: 0 }} />
                        )}
                        <button
                          onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                          style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                          <Trash2 size={13} color="var(--text-muted)" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Stats summary ── */}
        {notifs.length > 0 && (
          <div style={{ ...card, padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, textAlign: 'center' }}>
            {[
              { val: notifs.length, label: 'Toplam', color: 'var(--text-dark)' },
              { val: unreadCount, label: 'Okunmamış', color: 'var(--primary-blue)' },
              { val: notifs.filter(n => n.read).length, label: 'Okunmuş', color: '#22c55e' },
            ].map(s => (
              <div key={s.label} style={{ borderRight: '1.5px dashed var(--dark-border)', padding: '4px' }}>
                <p style={{ fontWeight: 900, fontSize: 24, color: s.color, margin: '0 0 3px', lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bellRing {
          0%,100% { transform: rotate(0); }
          10%,30% { transform: rotate(-15deg); }
          20%,40% { transform: rotate(15deg); }
          50% { transform: rotate(0); }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
