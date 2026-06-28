import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bell, Box, ChevronRight, QrCode, Star, Trophy } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { getNotifications } from '../services/notifications';
import type { Notification } from '../services/notifications';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';
import { DailyRewardModal, useDailyReward } from '../components/DailyRewardModal';
import LevelBadge from '../components/LevelBadge';
import NeoAvatar from '../components/NeoAvatar';
import { useXpProgress } from '../hooks/useXpProgress';
import { useRealtimeTable } from '../hooks/useRealtime';
import PageMainSticker from '../components/PageMainSticker';
import StickerDecorImg from '../components/StickerDecorImg';
import { colorfulSticker } from '../lib/stickerCatalog';
import { getMyAlltimeRank } from '../services/points';
import { onLeaderboardRefresh } from '../lib/leaderboardRefresh';
import { DEFAULT_SYSTEM_SETTINGS, getLoyaltySettings, type LoyaltySettings } from '../services/config';

const homePromoSticker = colorfulSticker('Group 62.svg');

/** Home quick-action stickers — curated for action meaning, not page defaults */
const HOME_QUICK_STICKERS = {
  qr: 'qrcode.svg',
  games: 'GAMES.svg',
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
  { label: tr.home.scanQr,    path: '/qr',       bg: '#9122FF', sticker: HOME_QUICK_STICKERS.qr, hint: 'Kamerayla puan kazan' },
  { label: tr.home.playGames,  path: '/games',    bg: '#FF3E9D', sticker: HOME_QUICK_STICKERS.games, hint: 'Mini oyun bonusları' },
  { label: tr.home.rewards,    path: '/shop',     bg: '#FF6B35', sticker: HOME_QUICK_STICKERS.shop, hint: 'Puanlarını kullan' },
  { label: tr.profile.myInventory, path: '/inventory', bg: '#C8FF00', sticker: HOME_QUICK_STICKERS.inventory, stickerClass: 'home-quick-action__sticker--white-outline', hint: 'Kuponlarını takip et' },
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
  const { items: inventoryItems } = useInventory();
  const activeInventoryCount = inventoryItems.filter(
    i => !i.used && new Date(i.expires) >= new Date(),
  ).length;
  const [showParticles, setShowParticles] = useState(false);
  const { show: showDailyReward, setShow: setShowDailyReward } = useDailyReward();
  const xpProgress = useXpProgress(user.xp, user.level, user.xpToNext);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loyaltySettings, setLoyaltySettings] = useState<LoyaltySettings>(DEFAULT_SYSTEM_SETTINGS.loyalty);

  const [unreadNotifs, setUnreadNotifs] = useState<Notification[]>([]);

  const refreshLoyaltySettings = useCallback(async () => {
    try {
      setLoyaltySettings(await getLoyaltySettings());
    } catch {
      setLoyaltySettings(DEFAULT_SYSTEM_SETTINGS.loyalty);
    }
  }, []);

  const refreshMyRank = useCallback(async () => {
    if (!authUser?.id) {
      setMyRank(null);
      return;
    }

    try {
      const entry = await getMyAlltimeRank();
      setMyRank(entry?.rank ?? null);
    } catch {
      setMyRank(null);
    }
  }, [authUser?.id]);

  useEffect(() => {
    void refreshMyRank();
  }, [refreshMyRank, points, user.totalPoints]);

  useRealtimeTable('leaderboard_signals', refreshMyRank, Boolean(authUser?.id));
  useRealtimeTable('profiles', refreshMyRank, Boolean(authUser?.id));
  useRealtimeTable('points_transactions', refreshMyRank, Boolean(authUser?.id));

  useEffect(() => onLeaderboardRefresh(refreshMyRank), [refreshMyRank]);

  useEffect(() => {
    void refreshLoyaltySettings();
  }, [refreshLoyaltySettings]);

  useRealtimeTable('app_settings', refreshLoyaltySettings);

  useEffect(() => {
    if (!authUser?.id) return;
    getNotifications(authUser.id, 0, 5)
      .then(all => setUnreadNotifs(all.filter(n => !n.read).slice(0, 2)))
      .catch(() => setUnreadNotifs([]));
  }, [authUser?.id]);

  const maxPointsLimit = Math.max(1, Math.round(loyaltySettings.max_points_limit || DEFAULT_SYSTEM_SETTINGS.loyalty.max_points_limit));
  const limitEnabled = loyaltySettings.points_limit_enabled;
  const limitPct = Math.min(100, Math.round((points / maxPointsLimit) * 100));
  const reachedLimit = limitEnabled && points >= maxPointsLimit;
  const nearLimit = limitEnabled && !reachedLimit && points >= maxPointsLimit * 0.85;

  return (
    <div className="home-auth-page" style={{ position: 'relative', minHeight: '100vh' }}>

      {/* Ghost watermark */}
      <div className="home-ghost-watermark" style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>DASHBOARD</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="🌟" />
      {showDailyReward && <DailyRewardModal onClose={() => setShowDailyReward(false)} />}

      <div
        className="page-enter home-page-content home-auth-content"
        style={{ padding: 'clamp(12px,4vw,24px)', paddingBottom: 32, maxWidth: 1120, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}
      >

        {/* ── Hero card ── */}
        <div className="hero-card-brand home-hero-card" style={{
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
                <p className="home-hero-kicker">Hoş geldin</p>
                <h1 style={{ fontSize: 'clamp(20px,4.5vw,28px)', fontWeight: 900, lineHeight: 1.1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.username}
                </h1>
              </div>
              <button
                type="button"
                className="home-hero-notification-btn"
                onClick={() => navigate('/notifications')}
                aria-label="Bildirimleri aç"
              >
                <Bell size={17} />
                {unreadNotifs.length > 0 && <span>{unreadNotifs.length}</span>}
              </button>
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
            <div className="home-hero-xp">
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.65)', marginBottom: 6, fontWeight: 700 }}>
                <span>Lv.{user.level}{xpProgress.nextTitle ? ` → ${user.level + 1}` : ''}</span>
                <span>{xpProgress.inLevel.toLocaleString()} / {xpProgress.isMaxLevel ? 'MAX' : xpProgress.needed.toLocaleString()} XP</span>
              </div>
              <div className="home-hero-xp-track" style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '0', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${xpProgress.pct}%`, background: 'white', borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 5, fontWeight: 600 }}>
                {xpProgress.isMaxLevel ? 'Maksimum seviye!' : `${xpProgress.remaining.toLocaleString()} XP sonraki seviye için`}
              </p>
            </div>
          </div>
        </div>

        {limitEnabled && (
          <div
            className={`home-loyalty-limit-card ${reachedLimit ? 'home-loyalty-limit-card--blocked' : nearLimit ? 'home-loyalty-limit-card--warning' : ''}`}
            style={{
              ...card,
              padding: '16px 18px',
              background: reachedLimit
                ? 'linear-gradient(135deg,#fee2e2,#fecaca)'
                : nearLimit
                  ? 'linear-gradient(135deg,#fff7ed,#fed7aa)'
                  : 'linear-gradient(135deg,#ecfeff,#cffafe)',
              color: '#111827',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: reachedLimit ? '#dc2626' : nearLimit ? '#d97706' : '#0891b2' }}>
                  Loyalty Limit
                </p>
                <h2 style={{ margin: '3px 0 0', fontSize: 'clamp(18px,4vw,24px)', fontWeight: 900, lineHeight: 1.05 }}>
                  {points.toLocaleString('tr-TR')} / {maxPointsLimit.toLocaleString('tr-TR')} points
                </h2>
              </div>
              <span style={{ padding: '7px 10px', borderRadius: 999, border: '2px solid #111827', boxShadow: '2px 2px 0 #111827', fontSize: 12, fontWeight: 900, background: '#fff' }}>
                {limitPct}%
              </span>
            </div>
            <div style={{ height: 12, borderRadius: 999, border: '2px solid #111827', background: 'rgba(255,255,255,0.7)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${limitPct}%`,
                  background: reachedLimit ? '#ef4444' : nearLimit ? '#f59e0b' : '#06b6d4',
                  transition: 'width 0.45s cubic-bezier(0.22,1,0.36,1)',
                }}
              />
            </div>
            {(reachedLimit || nearLimit) && (
              <p style={{ margin: '10px 0 0', fontSize: 13, fontWeight: 900, color: reachedLimit ? '#991b1b' : '#92400e' }}>
                {reachedLimit
                  ? `You have reached the maximum loyalty points limit of ${maxPointsLimit.toLocaleString('tr-TR')} points. You cannot claim more points at this time.`
                  : 'You are close to reaching your maximum loyalty points limit.'}
              </p>
            )}
          </div>
        )}

        {/* ── Stats row — rank & active inventory (streak lives in hero) ── */}
        <div className="home-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
          {[
            { id: 'rank', value: myRank ? `#${myRank}` : '—', label: tr.home.rank, color: '#f59e0b', icon: Trophy },
            { id: 'inventory', value: activeInventoryCount, label: tr.profile.myInventory, color: '#7B6EF6', icon: Box },
          ].map((s) => (
            <div key={s.label} className={`home-stat-card home-stat-card--${s.id} home-stat-card--quiet`} style={{ ...card, padding: '16px 10px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <s.icon className="home-stat-card__icon" size={18} style={{ color: s.color }} />
              <div className="home-stat-card__content">
                <p className="home-stat-card__value" style={{ fontWeight: 900, fontSize: 22, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
                <p className="home-stat-card__label" style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 900, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
              </div>
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
            <button type="button" className="home-promo-banner__cta" onClick={() => navigate('/qr')}>
              QR Tara <QrCode size={14} />
            </button>
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="home-quick-section">
          <SectionHeader micro="HIZLI ERİŞİM" title={tr.home.quickActions} />
          <div className="home-quick-actions" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {quickActions.map(action => {
              const sticker = colorfulSticker(action.sticker);
              return (
                <button
                  key={action.path}
                  onClick={() => { playSound('click'); navigate(action.path); }}
                  className={`press-card home-quick-action home-quick-action--${action.path.replace('/', '') || 'home'}`}
                  style={{
                    ...card, padding: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                    overflow: 'visible', textAlign: 'left', position: 'relative', isolation: 'isolate',
                  }}
                >
                  <div
                    className="home-quick-action__visual"
                    style={{ background: action.bg }}
                  >
                    {sticker && (
                      <StickerDecorImg
                        src={sticker.url}
                        width={112}
                        height={112}
                        loading="lazy"
                        className={['home-quick-action__sticker', action.stickerClass].filter(Boolean).join(' ')}
                      />
                    )}
                  </div>
                  <div style={{ padding: '10px 12px 14px' }}>
                    <span className="home-quick-action__label">
                      <span className="font-display">{action.label}</span>
                      <ChevronRight size={14} />
                    </span>
                    <small className="home-quick-action__hint">{action.hint}</small>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Notifications preview ── */}
        {unreadNotifs.length > 0 && (
          <div className="home-notifications-section">
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
