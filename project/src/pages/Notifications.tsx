import React, { useState, useEffect } from 'react';
import { Check, Trash2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markRead as markReadService, markAllRead as markAllReadService } from '../services/notifications';
import type { Notification } from '../services/notifications';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

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
  const { authUser } = useAuth();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authUser?.id) return;
    setIsLoading(true);
    getNotifications(authUser.id)
      .then(setNotifs)
      .catch(() => setNotifs([]))
      .finally(() => setIsLoading(false));
  }, [authUser?.id]);

  const filtered = filter === 'all' ? notifs
    : filter === 'unread' ? notifs.filter(n => !n.read)
    : notifs.filter(n => n.type === filter);
  const unreadCount = notifs.filter(n => !n.read).length;

  const markRead = (id: string) => {
    playSound('click');
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    if (authUser?.id) markReadService(id, authUser.id).catch(() => {});
  };
  const markAllRead = () => {
    playSound('success');
    setNotifs(prev => prev.map(n => ({ ...n, read: true })));
    if (authUser?.id) markAllReadService(authUser.id).catch(() => {});
  };
  const deleteNotif = (id: string) => { playSound('click'); setNotifs(prev => prev.filter(n => n.id !== id)); };

  return (
    <div className="notif-page">
      {/* Ghost watermark */}
      <div className="notif-watermark">BİLDİRİMLER</div>

      <div className="notif-container">

        {/* ── Page header ── */}
        <div className="notif-header">
          <div className="notif-header-left">
            <div className="notif-bell-wrap">
              <div className={`notif-bell-icon ${unreadCount > 0 ? 'notif-bell-ring' : ''}`}>🔔</div>
              {unreadCount > 0 && (
                <div className="notif-badge">{unreadCount}</div>
              )}
            </div>
            <div>
              <h1 className="notif-title">{tr.notifications.title}</h1>
              <p className="notif-subtitle">{unreadCount} okunmamış bildirim</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button onClick={markAllRead} className="notif-mark-all-btn">
              <Check size={14} />
              <span className="notif-mark-all-text">Tümünü Okundu İşaretle</span>
            </button>
          )}
        </div>

        {/* ── Filter pills ── */}
        <div className="notif-filters">
          {Object.keys(filterLabels).map(f => (
            <button
              key={f}
              onClick={() => { playSound('click'); setFilter(f); }}
              className={`notif-filter-pill ${filter === f ? 'notif-filter-active' : ''}`}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {/* ── Notification list ── */}
        {isLoading ? (
          <div className="notif-empty">
            <div className="w-8 h-8 rounded-full border-4 border-violet-400 border-t-transparent animate-spin mx-auto mb-3" />
            <p className="notif-empty-sub">Yükleniyor...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="notif-empty">
            <p style={{ fontSize: 44, margin: '0 0 12px' }}>🔔</p>
            <p className="notif-empty-title">{tr.notifications.empty}</p>
            <p className="notif-empty-sub">Şimdilik hepsi bu kadar!</p>
          </div>
        ) : (
          <div className="notif-list text-left justify-start items-center flex-col">
            {filtered.map((notif, index) => {
              const cfg = typeConfig[notif.type] || typeConfig.system;
              const isPriority = notif.type === 'achievement' || notif.type === 'reward';
              return (
                <div
                  key={notif.id}
                  className="notif-card"
                  onClick={() => markRead(notif.id)}
                  style={{
                    border: !notif.read ? `3px solid ${cfg.border}` : '3px solid var(--dark-border)',
                    boxShadow: !notif.read ? `0 6px 0 ${cfg.border}88` : '0 6px 0 var(--dark-border)',
                    background: !notif.read ? cfg.accent : 'var(--card-bg)',
                    animationDelay: `${index * 0.05}s`,
                  }}
                >
                  {/* Icon */}
                  <div className="notif-icon" style={{ background: cfg.gradient }}>
                    {cfg.icon}
                    {isPriority && (
                      <Sparkles size={11} color="#fbbf24" style={{ position: 'absolute', top: -4, right: -4 }} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="notif-content">
                    <div className="notif-content-top">
                      <div className="notif-title-row">
                        <span className="notif-item-title" style={{ color: !notif.read ? 'var(--text-dark)' : 'var(--text-muted)' }}>
                          {notif.title}
                        </span>
                        {isPriority && (
                          <span className="notif-priority-badge">ÖNEMLİ</span>
                        )}
                      </div>
                      <p className="notif-message">{notif.message}</p>
                      <span className="notif-time">{new Date(notif.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    {/* Actions */}
                    <div className="notif-actions">
                      {!notif.read && (
                        <div className="notif-unread-dot" style={{ background: cfg.border }} />
                      )}
                      <button
                        className="notif-delete-btn"
                        onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                      >
                        <Trash2 size={13} color="var(--text-muted)" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Stats summary ── */}
        {notifs.length > 0 && (
          <div className="notif-stats">
            {[
              { val: notifs.length, label: 'Toplam', color: 'var(--text-dark)' },
              { val: unreadCount, label: 'Okunmamış', color: 'var(--primary-blue)' },
              { val: notifs.filter(n => n.read).length, label: 'Okunmuş', color: '#22c55e' },
            ].map((s, i) => (
              <div key={s.label} className="notif-stat-item" style={{ borderRight: i < 2 ? '1.5px dashed var(--dark-border)' : 'none' }}>
                <p className="notif-stat-val" style={{ color: s.color }}>{s.val}</p>
                <p className="notif-stat-label">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>

      <style>{`
        /* ── Page shell ── */
        .notif-page {
          position: relative;
          min-height: 100vh;
        }
        .notif-watermark {
          position: fixed;
          top: 6%;
          left: 50%;
          transform: translateX(-50%) rotate(-4deg);
          font-size: clamp(36px, 12vw, 180px);
          font-weight: 900;
          color: var(--dark-border);
          opacity: 0.04;
          white-space: nowrap;
          line-height: 1;
          letter-spacing: -0.04em;
          pointer-events: none;
          user-select: none;
          z-index: 0;
        }

        /* ── Container ── */
        .notif-container {
          position: relative;
          z-index: 1;
          max-width: 680px;
          margin: 0 auto;
          padding: 16px 16px 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Header ── */
        .notif-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }
        .notif-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }
        .notif-bell-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .notif-bell-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: linear-gradient(180deg, #a78bfa, #6d28d9);
          border: 3px solid var(--dark-border);
          box-shadow: 0 4px 0 var(--dark-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 22px;
        }
        .notif-bell-ring {
          animation: bellRing 2s ease-in-out infinite;
        }
        .notif-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ef4444;
          border: 2px solid var(--card-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 900;
          color: white;
        }
        .notif-title {
          color: var(--text-dark);
          font-weight: 900;
          font-size: clamp(20px, 5vw, 28px);
          margin: 0;
          line-height: 1;
        }
        .notif-subtitle {
          color: var(--text-muted);
          font-size: 12px;
          font-weight: 600;
          margin: 3px 0 0;
        }

        /* Mark all read button */
        .notif-mark-all-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 14px;
          border-radius: 12px;
          font-weight: 900;
          font-size: 12px;
          background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end));
          color: white;
          border: 2.5px solid var(--dark-border);
          box-shadow: 0 4px 0 var(--dark-border);
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .notif-mark-all-text {
          display: inline;
        }

        /* ── Filter pills ── */
        .notif-filters {
          display: flex;
          gap: 7px;
          overflow-x: auto;
          padding-bottom: 4px;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .notif-filters::-webkit-scrollbar { display: none; }
        .notif-filter-pill {
          padding: 8px 14px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          cursor: pointer;
          flex-shrink: 0;
          white-space: nowrap;
          background: var(--card-bg);
          color: var(--text-dark);
          border: 2.5px solid var(--dark-border);
          box-shadow: 0 3px 0 var(--dark-border);
          transition: all 0.1s;
        }
        .notif-filter-active {
          background: linear-gradient(180deg, var(--gradient-start), var(--gradient-end)) !important;
          color: white !important;
          box-shadow: 0 4px 0 var(--dark-border) !important;
        }

        /* ── Notification cards ── */
        .notif-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .notif-card {
          border-radius: 18px;
          padding: 14px;
          cursor: pointer;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          overflow: hidden;
          transition: transform 0.1s;
          animation: notifSlideIn 0.3s ease-out both;
        }
        .notif-card:hover {
          transform: translateY(-2px);
        }
        .notif-icon {
          width: 46px;
          height: 46px;
          border-radius: 13px;
          flex-shrink: 0;
          border: 2.5px solid var(--dark-border);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          box-shadow: 0 3px 0 var(--dark-border);
          position: relative;
        }
        .notif-content {
          flex: 1;
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
        }
        .notif-content-top {
          flex: 1;
          min-width: 0;
        }
        .notif-title-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .notif-item-title {
          font-weight: 900;
          font-size: 13px;
          line-height: 1.2;
          word-break: break-word;
        }
        .notif-priority-badge {
          padding: 1px 6px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
          background: rgba(245,158,11,0.15);
          color: #f59e0b;
          border: 1px solid #f59e0b;
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .notif-message {
          color: var(--text-muted);
          font-size: 12px;
          margin: 0 0 5px;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }
        .notif-time {
          font-size: 10px;
          color: var(--text-muted);
          font-weight: 600;
        }
        .notif-actions {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          padding-top: 2px;
        }
        .notif-unread-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .notif-delete-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--tab-bg);
          border: 1.5px solid var(--dark-border);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        /* ── Empty state ── */
        .notif-empty {
          background: var(--card-bg);
          border: 3px dashed var(--dark-border);
          border-radius: 20px;
          padding: 40px 24px;
          text-align: center;
        }
        .notif-empty-title {
          font-weight: 900;
          font-size: 17px;
          color: var(--text-dark);
          margin: 0 0 6px;
        }
        .notif-empty-sub {
          color: var(--text-muted);
          font-size: 13px;
          margin: 0;
        }

        /* ── Stats ── */
        .notif-stats {
          background: var(--card-bg);
          border: 3px solid var(--dark-border);
          box-shadow: 0 6px 0 var(--dark-border);
          border-radius: 20px;
          padding: 14px 10px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 4px;
          text-align: center;
        }
        .notif-stat-item {
          padding: 4px 4px;
        }
        .notif-stat-val {
          font-weight: 900;
          font-size: clamp(18px, 5vw, 24px);
          margin: 0 0 3px;
          line-height: 1;
        }
        .notif-stat-label {
          font-size: clamp(9px, 2.5vw, 11px);
          color: var(--text-muted);
          font-weight: 700;
          margin: 0;
        }

        /* ── Animations ── */
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes bellRing {
          0%,100% { transform: rotate(0); }
          10%,30% { transform: rotate(-15deg); }
          20%,40% { transform: rotate(15deg); }
          50% { transform: rotate(0); }
        }

        /* ── Mobile overrides (≤ 480px) ── */
        @media (max-width: 480px) {
          .notif-container {
            padding: 12px 12px 0;
            gap: 12px;
          }
          .notif-header {
            flex-direction: column;
            align-items: stretch;
          }
          .notif-header-left {
            gap: 10px;
          }
          .notif-bell-icon {
            width: 42px;
            height: 42px;
            font-size: 20px;
          }
          .notif-mark-all-btn {
            width: 100%;
            justify-content: center;
            padding: 11px 14px;
            font-size: 13px;
          }
          .notif-mark-all-text {
            display: inline;
          }
          .notif-card {
            padding: 11px 11px;
            gap: 10px;
            border-radius: 16px;
          }
          .notif-icon {
            width: 38px;
            height: 38px;
            font-size: 17px;
            border-radius: 11px;
          }
          .notif-item-title {
            font-size: 12px;
          }
          .notif-message {
            font-size: 11px;
          }
          .notif-filter-pill {
            font-size: 11px;
            padding: 7px 12px;
          }
          .notif-stats {
            padding: 12px 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Notifications;
