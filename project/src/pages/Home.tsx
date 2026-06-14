import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getNotifications } from '../services/notifications';
import type { Notification } from '../services/notifications';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';
import { DailyRewardModal, useDailyReward } from '../components/DailyRewardModal';
import LevelBadge from '../components/LevelBadge';
import NeoAvatar from '../components/NeoAvatar';
import { useXpProgress } from '../hooks/useXpProgress';
import PageMainSticker from '../components/PageMainSticker';
import StickerDecorImg from '../components/StickerDecorImg';
import { colorfulSticker, shapeSticker } from '../lib/stickerCatalog';

const homePromoSticker = colorfulSticker('Group 62.svg');

const HOME_STAT_SHAPES = {
  rank: shapeSticker('Stickers V19.svg'),
  achievements: shapeSticker('Figure 11.svg'),
} as const;

/** Home quick-action stickers — curated for action meaning, not page defaults */
const HOME_QUICK_STICKERS = {
  qr: 'qrcode.svg',
  games: 'partytime.svg',
  shop: 'superstar.svg',
  inventory: 'cardboardbox.svg',
} as const;

/* ── Design tokens ── */
const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};


const quickActions = [
  { label: tr.home.scanQr,    path: '/qr',       bg: '#9122FF', sticker: HOME_QUICK_STICKERS.qr },
  { label: tr.home.playGames,  path: '/games',    bg: '#FF3E9D', sticker: HOME_QUICK_STICKERS.games },
  { label: tr.home.rewards,    path: '/shop',     bg: '#FF6B35', sticker: HOME_QUICK_STICKERS.shop },
  { label: tr.profile.myInventory, path: '/inventory', bg: '#C8FF00', sticker: HOME_QUICK_STICKERS.inventory, stickerClass: 'home-quick-action__sticker--white-outline' },
];

/* ── Section header ── */
const SectionHeader: React.FC<{
  micro: string;
  title: string;
  action?: { label: string; onClick: () => void };
}> = ({ micro, title, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
    <div>
      <p className="section-label">{micro}</p>
      <h2 className="section-title">{title}</h2>
    </div>
    {action && (
      <button
        onClick={action.onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          fontSize: 12, fontWeight: 900, color: 'var(--primary-blue)',
          background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
          lineHeight: 1,
        }}
      >
        {action.label} <ArrowRight size={13} />
      </button>
    )}
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, points } = useApp();
  const { authUser } = useAuth();
  const [showParticles, setShowParticles] = useState(false);
  const { show: showDailyReward, setShow: setShowDailyReward } = useDailyReward();
  const xpProgress = useXpProgress(user.xp, user.level);

  const [unreadNotifs, setUnreadNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if (!authUser?.id) return;
    getNotifications(authUser.id, 0, 5)
      .then(all => setUnreadNotifs(all.filter(n => !n.read).slice(0, 2)))
      .catch(() => setUnreadNotifs([]));
  }, [authUser?.id]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>

      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>DASHBOARD</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="🌟" />
      {showDailyReward && <DailyRewardModal onClose={() => setShowDailyReward(false)} />}

      <div
        className="page-enter"
        style={{ padding: 'clamp(12px,4vw,24px)', paddingBottom: 32, maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}
      >

        {/* ── Hero card ── */}
        <div className="hero-card-brand" style={{
          ...card,
          background: 'linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-end) 100%)',
          color: 'white', position: 'relative',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <PageMainSticker page="home" variant="hero-card" />

          <div className="hero-card-brand__body" style={{ padding: 'clamp(16px,5vw,28px)' }}>
            {/* Top row — avatar left, name right */}
            <div className="home-hero-user" style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <NeoAvatar
                  src={user.avatar}
                  name={user.username}
                  email={user.email}
                  size={56}
                  shape="circle"
                  border={false}
                  style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.2)', border: '3px solid rgba(255,255,255,0.5)' }}
                />
                <LevelBadge
                  level={user.level}
                  width={30}
                  className="level-badge-overlay"
                  style={{ bottom: -4, right: -8 }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h1 style={{ fontSize: 'clamp(20px,4.5vw,28px)', fontWeight: 900, lineHeight: 1.1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </h1>
              </div>
            </div>

            {/* Balance */}
            <div className="home-hero-balance">
              <div className="home-hero-balance__label">
                <span className="home-hero-balance__label-icon" aria-hidden>
                  <Star size={14} fill="#FFD500" color="#FCC707" />
                </span>
                <span>{tr.home.currentBalance}</span>
              </div>
              <div className="home-hero-balance__amount">
                <p className="home-hero-points__value">
                  <span className="home-hero-points__value-text">
                    {points.toLocaleString('tr-TR')}
                  </span>
                </p>
                <span className="home-hero-balance__unit">puan</span>
              </div>
            </div>

            {/* XP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 6, fontWeight: 700 }}>
                <span>Lv.{user.level}{xpProgress.nextTitle ? ` → ${user.level + 1}` : ''}</span>
                <span>{xpProgress.inLevel.toLocaleString()} / {xpProgress.isMaxLevel ? 'MAX' : xpProgress.needed.toLocaleString()} XP</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${xpProgress.pct}%`, background: 'white', borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 5, fontWeight: 600 }}>
                {xpProgress.isMaxLevel ? 'Maksimum seviye!' : `${xpProgress.remaining.toLocaleString()} XP sonraki seviye için`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats row — rank & achievements only (streak lives in hero) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { shape: HOME_STAT_SHAPES.rank, value: `#${user.rank}`, label: tr.home.rank, color: '#f59e0b', rotate: -10 },
            { shape: HOME_STAT_SHAPES.achievements, value: user.achievements, label: tr.home.achievements, color: '#7B6EF6', rotate: 8 },
          ].map((s) => (
            <div key={s.label} style={{ ...card, padding: '16px 10px', textAlign: 'center', position: 'relative', overflow: 'visible' }}>
              {s.shape && (
                <div className="home-stat-shape" style={{ transform: `rotate(${s.rotate}deg)` }} aria-hidden>
                  <StickerDecorImg
                    src={s.shape.url}
                    width={64}
                    height={64}
                    loading="lazy"
                    className="home-stat-shape__img"
                  />
                </div>
              )}
              <p style={{ fontWeight: 900, fontSize: 22, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 900, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Promo banner ── */}
        <div className="home-promo-banner" style={{ ...card, overflow: 'hidden', position: 'relative', minHeight: 140, background: '#9122FF' }}>
          {homePromoSticker && (
            <div className="home-promo-banner__sticker" aria-hidden>
              <StickerDecorImg
                src={homePromoSticker.url}
                width={180}
                height={180}
                loading="eager"
                className="home-promo-banner__sticker-img"
              />
            </div>
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: '24px 20px' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 10,
              background: '#C8FF00', color: '#000', borderRadius: 999,
              padding: '4px 12px', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em',
              border: '2px solid #000', boxShadow: '2px 2px 0 #000',
            }}>⚡ BUGÜN KAZAN</div>
            <p className="font-display" style={{ color: '#fff', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, margin: 0, lineHeight: 1.2, textTransform: 'uppercase', maxWidth: '55%' }}>
              Alışveriş yap,<br />puan topla!
            </p>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div>
          <SectionHeader micro="HIZLI ERİŞİM" title={tr.home.quickActions} />
          <div className="home-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {quickActions.map(action => {
              const sticker = colorfulSticker(action.sticker);
              return (
                <button
                  key={action.path}
                  onClick={() => { playSound('click'); navigate(action.path); }}
                  className="press-card home-quick-action"
                  style={{
                    ...card, padding: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                    overflow: 'hidden', textAlign: 'left',
                  }}
                >
                  <div
                    className="home-quick-action__visual"
                    style={{ background: action.bg }}
                  >
                    {sticker && (
                      <StickerDecorImg
                        src={sticker.url}
                        width={88}
                        height={88}
                        loading="lazy"
                        className={['home-quick-action__sticker', action.stickerClass].filter(Boolean).join(' ')}
                      />
                    )}
                  </div>
                  <div style={{ padding: '10px 12px 14px' }}>
                    <span className="font-display" style={{ color: 'var(--text-dark)', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>
                      {action.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notifications preview ── */}
        {unreadNotifs.length > 0 && (
          <div>
            <SectionHeader
              micro="BİLDİRİMLER"
              title={`${unreadNotifs.length} Yeni`}
              action={{ label: tr.home.seeAll, onClick: () => navigate('/notifications') }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {unreadNotifs.slice(0, 2).map(notif => (
                <div key={notif.id} style={{
                  ...card, border: '3px solid var(--primary-blue)',
                  boxShadow: '0px 6px 0px var(--dark-border)',
                  padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{notif.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 13, margin: '0 0 3px' }}>{notif.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{notif.message}</p>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10, whiteSpace: 'nowrap', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{new Date(notif.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Home;
