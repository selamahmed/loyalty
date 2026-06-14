import React, { useState, useEffect, useCallback } from 'react';
import { Check, Trash2, Sparkles, Bell } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markRead as markReadService, markAllRead as markAllReadService } from '../services/notifications';
import type { Notification } from '../services/notifications';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import StickerAccent from '../components/StickerAccent';
import StickerHero from '../components/StickerHero';

/* ── Type config ── */
const TYPE: Record<string, { gradient: string; icon: string; border: string; accent: string; shadow: string }> = {
  reward:      { gradient: 'linear-gradient(145deg,#22c55e,#15803d)', icon: '🎁', border: '#22c55e', accent: 'rgba(34,197,94,0.08)',  shadow: 'rgba(34,197,94,0.35)'  },
  achievement: { gradient: 'linear-gradient(145deg,#f59e0b,#b45309)', icon: '🏆', border: '#f59e0b', accent: 'rgba(245,158,11,0.08)', shadow: 'rgba(245,158,11,0.35)' },
  points:      { gradient: 'linear-gradient(145deg,#a78bfa,#6d28d9)', icon: '⭐', border: '#a78bfa', accent: 'rgba(167,139,250,0.08)', shadow: 'rgba(167,139,250,0.35)' },
  event:       { gradient: 'linear-gradient(145deg,#60a5fa,#2563eb)', icon: '🎉', border: '#60a5fa', accent: 'rgba(96,165,250,0.08)',  shadow: 'rgba(96,165,250,0.35)'  },
  system:      { gradient: 'linear-gradient(145deg,#94a3b8,#475569)', icon: '⚙️', border: '#94a3b8', accent: 'rgba(148,163,184,0.06)', shadow: 'rgba(148,163,184,0.25)' },
};

const FILTER_LABELS: Record<string, string> = {
  all: 'Tümü',
  unread: 'Okunmamış',
};

/* ── Date grouping ── */
function getGroup(dateStr: string): string {
  const d   = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7)  return 'Bu Hafta';
  return 'Daha Önce';
}

function fmtTime(dateStr: string): string {
  const d   = new Date(dateStr);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays < 1)  return d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  if (diffDays < 7)  return d.toLocaleDateString('tr-TR', { weekday: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' }) + ' ' + d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}

const GROUP_ORDER = ['Bugün', 'Dün', 'Bu Hafta', 'Daha Önce'];

const Notifications: React.FC = () => {
  const { authUser } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  /* ── Load ── */
  const load = useCallback(() => {
    if (!authUser?.id) return;
    setIsLoading(true);
    getNotifications(authUser.id)
      .then(setNotifs)
      .catch(() => setNotifs([]))
      .finally(() => setIsLoading(false));
  }, [authUser?.id]);

  useEffect(() => { load(); }, [load]);

  /* ── Realtime ── */
  useEffect(() => {
    if (!authUser?.id) return;
    const ch = supabase
      .channel(`notifs-${authUser.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${authUser.id}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [authUser?.id, load]);

  /* ── Filtering ── */
  const filtered = filter === 'unread'
    ? notifs.filter(n => !n.read)
    : notifs;

  const unreadCount = notifs.filter(n => !n.read).length;

  /* ── Actions ── */
  const markRead = (id: string) => {
    playSound('click');
    setNotifs(p => p.map(n => n.id === id ? { ...n, read: true } : n));
    if (authUser?.id) markReadService(id, authUser.id).catch(() => {});
  };
  const markAllRead = () => {
    playSound('success');
    setNotifs(p => p.map(n => ({ ...n, read: true })));
    if (authUser?.id) markAllReadService(authUser.id).catch(() => {});
  };
  const deleteNotif = (id: string) => {
    playSound('click');
    setNotifs(p => p.filter(n => n.id !== id));
    if (authUser?.id) supabase.from('notifications').delete().eq('id', id).eq('user_id', authUser.id).then(() => {});
  };

  /* ── Group by date ── */
  const groups: Record<string, Notification[]> = {};
  filtered.forEach(n => {
    const g = getGroup(n.created_at);
    if (!groups[g]) groups[g] = [];
    groups[g].push(n);
  });

  return (
    <div className="np-page">
      <div className="np-watermark">BİLDİRİMLER</div>

      <div className="np-wrap">

        {/* ── Header ── */}
        <div className="np-header">
          <div className="np-header-left">
            <div className="np-bell-wrap">
              <div className={`np-bell ${unreadCount > 0 ? 'np-bell-ring' : ''}`}>🔔</div>
              {unreadCount > 0 && <span className="np-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
            </div>
            <div>
              <h1 className="np-h1">{tr.notifications.title}</h1>
              <p className="np-sub">
                {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="np-mark-all-btn">
              <Check size={13} />
              <span>Tümünü Okundu İşaretle</span>
            </button>
          )}
        </div>

        <StickerHero
          page="notifications"
          bg="linear-gradient(135deg,#a78bfa 0%,#6d28d9 100%)"
          badge="🔔 BİLDİRİM"
          title={unreadCount > 0 ? `${unreadCount} yeni bildirim` : 'Hepsi okundu'}
          highlight="Güncel kal!"
          height={120}
        />

        {/* ── Filter pills ── */}
        <div className="np-filter-bar">
          {Object.keys(FILTER_LABELS).map(f => (
            <button
              key={f}
              onClick={() => { playSound('click'); setFilter(f); }}
              className={`np-pill ${filter === f ? 'np-pill-active' : ''}`}
              style={{ position: 'relative' }}
            >
              {FILTER_LABELS[f]}
              {filter === f && <StickerAccent seed={`notif-filter-${f}`} size={14} rotate={10} style={{ position: 'absolute', top: -4, right: -2 }} />}
              {f === 'unread' && unreadCount > 0 && (
                <span className="np-pill-count">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {isLoading ? (
          <div className="np-empty">
            <div className="np-spinner" />
            <p className="np-empty-title">Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="np-empty">
            <div className="np-empty-icon">🔕</div>
            <p className="np-empty-title">{filter === 'unread' ? 'Okunmamış bildirim yok' : tr.notifications.empty}</p>
            <p className="np-empty-sub">Şimdilik hepsi bu kadar!</p>
          </div>
        ) : (
          <div className="np-groups">
            {GROUP_ORDER.filter(g => groups[g]).map(group => (
              <div key={group} className="np-group">
                <div className="np-group-label">
                  <span className="np-group-dot" />
                  <span>{group}</span>
                </div>
                <div className="np-list">
                  {groups[group].map((notif, i) => {
                    const cfg = TYPE[notif.type] ?? TYPE.system;
                    const isPriority = notif.type === 'achievement' || notif.type === 'reward';
                    return (
                      <div
                        key={notif.id}
                        className={`np-card ${notif.read ? 'np-card-read' : 'np-card-unread'}`}
                        style={{
                          borderColor:     notif.read ? 'var(--dark-border)' : cfg.border,
                          boxShadow:       notif.read ? '0 5px 0 var(--dark-border)' : `0 5px 0 ${cfg.shadow}`,
                          background:      notif.read ? 'var(--card-bg)' : cfg.accent,
                          animationDelay:  `${i * 0.04}s`,
                        }}
                        onClick={() => markRead(notif.id)}
                      >
                        {/* Left accent stripe */}
                        {!notif.read && (
                          <div className="np-stripe" style={{ background: cfg.gradient }} />
                        )}

                        {/* Icon */}
                        <div className="np-icon" style={{ background: cfg.gradient }}>
                          <span className="np-icon-emoji">{cfg.icon}</span>
                          {isPriority && (
                            <Sparkles size={10} color="#fbbf24" className="np-icon-star" />
                          )}
                        </div>

                        {/* Body */}
                        <div className="np-body">
                          <div className="np-row-top">
                            <span className="np-card-title">{notif.title}</span>
                            <div className="np-row-right">
                              {isPriority && <span className="np-priority">ÖNEMLİ</span>}
                              <span className="np-time">{fmtTime(notif.created_at)}</span>
                            </div>
                          </div>
                          <p className="np-msg">{notif.message}</p>
                        </div>

                        {/* Actions */}
                        <div className="np-actions">
                          {!notif.read && <span className="np-dot" style={{ background: cfg.border }} />}
                          <button
                            className="np-del"
                            onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                            title="Sil"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Stats strip ── */}
        {notifs.length > 0 && (
          <div className="np-stats">
            {[
              { v: notifs.length,                    l: 'Toplam',    c: 'var(--text-dark)' },
              { v: unreadCount,                      l: 'Okunmamış', c: '#a78bfa' },
              { v: notifs.filter(n => n.read).length,l: 'Okunmuş',   c: '#22c55e' },
            ].map((s, i) => (
              <div key={s.l} className="np-stat" style={{ borderRight: i < 2 ? '1.5px dashed var(--dark-border)' : 'none' }}>
                <p className="np-stat-val" style={{ color: s.c }}>{s.v}</p>
                <p className="np-stat-lbl">{s.l}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 32 }} />
      </div>

      {/* ────────────── Styles ────────────── */}
      <style>{`
        /* Page */
        .np-page { position: relative; min-height: 100vh; }
        .np-watermark {
          position: fixed; top: 6%; left: 50%;
          transform: translateX(-50%) rotate(-4deg);
          font-size: clamp(36px,12vw,180px); font-weight: 900;
          color: var(--dark-border); opacity: 0.04;
          white-space: nowrap; line-height: 1; letter-spacing: -0.04em;
          pointer-events: none; user-select: none; z-index: 0;
        }
        .np-wrap {
          position: relative; z-index: 1;
          max-width: 680px; margin: 0 auto;
          padding: 16px 16px 0;
          display: flex; flex-direction: column; gap: 14px;
        }

        /* Header */
        .np-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .np-header-left { display: flex; align-items: center; gap: 12px; }
        .np-bell-wrap { position: relative; flex-shrink: 0; }
        .np-bell {
          width: 50px; height: 50px; border-radius: 16px;
          background: linear-gradient(145deg,#a78bfa,#6d28d9);
          border: 3px solid var(--dark-border);
          box-shadow: 0 4px 0 var(--dark-border);
          display: flex; align-items: center; justify-content: center; font-size: 22px;
        }
        .np-bell-ring { animation: bellRing 2.5s ease-in-out infinite; }
        .np-badge {
          position: absolute; top: -7px; right: -7px;
          min-width: 20px; height: 20px; padding: 0 4px;
          border-radius: 999px; background: #ef4444;
          border: 2.5px solid var(--card-bg);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: 900; color: white;
        }
        .np-h1 { color: var(--text-dark); font-weight: 900; font-size: clamp(20px,5vw,28px); margin: 0; line-height: 1; }
        .np-sub { color: var(--text-muted); font-size: 12px; font-weight: 600; margin: 3px 0 0; }
        .np-mark-all-btn {
          display: flex; align-items: center; gap: 6px;
          padding: 10px 16px; border-radius: 12px; font-weight: 900; font-size: 12px;
          background: linear-gradient(180deg,var(--gradient-start),var(--gradient-end));
          color: white; border: 2.5px solid var(--dark-border);
          box-shadow: 0 4px 0 var(--dark-border); cursor: pointer;
          flex-shrink: 0; white-space: nowrap;
          transition: transform 0.1s, box-shadow 0.1s;
        }
        .np-mark-all-btn:hover { transform: translateY(-2px); }
        .np-mark-all-btn:active { transform: translateY(1px); box-shadow: 0 2px 0 var(--dark-border); }

        /* Filter pills */
        .np-filter-bar {
          display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
        }
        .np-pill {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          padding: 8px 14px; border-radius: 999px;
          font-weight: 900; font-size: 12px; cursor: pointer;
          background: var(--card-bg); color: var(--text-dark);
          border: 2.5px solid var(--dark-border); box-shadow: 0 3px 0 var(--dark-border);
          transition: all 0.1s;
        }
        .np-pill-active {
          background: linear-gradient(180deg,var(--gradient-start),var(--gradient-end)) !important;
          color: white !important; border-color: var(--dark-border) !important;
          box-shadow: 0 4px 0 var(--dark-border) !important;
        }
        .np-pill-count {
          min-width: 16px; height: 16px; padding: 0 4px;
          border-radius: 999px; background: #ef4444;
          font-size: 9px; color: white; font-weight: 900;
          display: flex; align-items: center; justify-content: center;
        }

        /* Date groups */
        .np-groups { display: flex; flex-direction: column; gap: 16px; }
        .np-group { display: flex; flex-direction: column; gap: 8px; }
        .np-group-label {
          display: flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 900; color: var(--text-muted);
          text-transform: uppercase; letter-spacing: 0.07em;
        }
        .np-group-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--text-muted); flex-shrink: 0;
        }
        .np-list { display: flex; flex-direction: column; gap: 8px; }

        /* ── NOTIFICATION CARD (fixed height) ── */
        .np-card {
          position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 12px;
          /* Fixed uniform height */
          height: 84px;
          padding: 0 14px 0 0;
          border-radius: 18px; border: 3px solid;
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s;
          animation: npSlide 0.28s ease-out both;
        }
        .np-card:hover { transform: translateY(-2px); }
        .np-card:active { transform: translateY(1px); }

        /* Left accent stripe (unread only) */
        .np-stripe {
          position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; border-radius: 18px 0 0 18px;
        }

        /* Icon (fixed square) */
        .np-icon {
          flex-shrink: 0;
          width: 46px; height: 46px; border-radius: 14px;
          border: 2.5px solid var(--dark-border);
          box-shadow: 0 3px 0 var(--dark-border);
          display: flex; align-items: center; justify-content: center;
          position: relative; margin-left: 10px;
        }
        .np-icon-emoji { font-size: 20px; line-height: 1; }
        .np-icon-star { position: absolute; top: -5px; right: -5px; }

        /* Body: fills remaining space, clipped to card height */
        .np-body {
          flex: 1; min-width: 0;
          display: flex; flex-direction: column; justify-content: center;
          gap: 3px; overflow: hidden;
        }
        .np-row-top {
          display: flex; align-items: center; justify-content: space-between; gap: 6px;
        }
        .np-card-title {
          font-weight: 900; font-size: 13px; color: var(--text-dark);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          flex: 1; min-width: 0;
        }
        .np-card-read .np-card-title { color: var(--text-muted); }
        .np-row-right { display: flex; align-items: center; gap: 5px; flex-shrink: 0; }
        .np-priority {
          font-size: 8px; font-weight: 900; padding: 2px 6px; border-radius: 999px;
          background: rgba(245,158,11,0.15); color: #f59e0b;
          border: 1px solid #f59e0b; white-space: nowrap;
        }
        .np-time {
          font-size: 10px; font-weight: 700; color: var(--text-muted); white-space: nowrap;
        }
        .np-msg {
          font-size: 12px; color: var(--text-muted); margin: 0; line-height: 1.4; font-weight: 600;
          /* Exactly 2 lines */
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; height: calc(12px * 1.4 * 2);
        }

        /* Actions sidebar */
        .np-actions {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 6px; flex-shrink: 0;
        }
        .np-dot { width: 8px; height: 8px; border-radius: 50%; }
        .np-del {
          width: 30px; height: 30px; border-radius: 9px;
          background: var(--tab-bg); border: 1.5px solid var(--dark-border);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--text-muted);
          transition: background 0.15s, color 0.15s;
        }
        .np-del:hover { background: rgba(239,68,68,0.12); color: #ef4444; border-color: #ef4444; }

        /* Empty */
        .np-empty {
          background: var(--card-bg); border: 3px dashed var(--dark-border);
          border-radius: 20px; padding: 44px 24px; text-align: center;
        }
        .np-empty-icon { font-size: 48px; margin-bottom: 14px; }
        .np-empty-title { font-weight: 900; font-size: 17px; color: var(--text-dark); margin: 0 0 6px; }
        .np-empty-sub { color: var(--text-muted); font-size: 13px; margin: 0; }
        .np-spinner {
          width: 32px; height: 32px; border-radius: 50%;
          border: 3px solid var(--dark-border); border-top-color: #a78bfa;
          animation: spin 0.7s linear infinite; margin: 0 auto 14px;
        }

        /* Stats */
        .np-stats {
          background: var(--card-bg); border: 3px solid var(--dark-border);
          box-shadow: 0 6px 0 var(--dark-border); border-radius: 20px;
          padding: 14px 10px; display: grid; grid-template-columns: repeat(3,1fr);
          gap: 4px; text-align: center;
        }
        .np-stat { padding: 4px; }
        .np-stat-val { font-weight: 900; font-size: clamp(20px,5vw,26px); margin: 0 0 3px; line-height: 1; }
        .np-stat-lbl { font-size: clamp(9px,2.5vw,11px); color: var(--text-muted); font-weight: 700; margin: 0; }

        /* Animations */
        @keyframes npSlide {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bellRing {
          0%,100%    { transform: rotate(0); }
          10%,30%    { transform: rotate(-14deg); }
          20%,40%    { transform: rotate(14deg); }
          50%        { transform: rotate(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile */
        @media (max-width: 480px) {
          .np-wrap { padding: 12px 12px 0; gap: 12px; }
          .np-header { flex-direction: column; align-items: stretch; }
          .np-mark-all-btn { width: 100%; justify-content: center; }
          .np-card { height: 78px; gap: 10px; padding-right: 10px; border-radius: 15px; }
          .np-icon { width: 40px; height: 40px; border-radius: 12px; margin-left: 8px; }
          .np-icon-emoji { font-size: 18px; }
          .np-card-title { font-size: 12px; }
          .np-msg { font-size: 11px; height: calc(11px * 1.4 * 2); }
          .np-pill { font-size: 11px; padding: 7px 11px; }
          .np-time { font-size: 9px; }
          .np-del { width: 27px; height: 27px; }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
