import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Gamepad2, Gift, Target, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { getFeaturedRewards } from '../services/rewards';
import { getMissionsWithStatus } from '../services/missions';
import { getNotifications } from '../services/notifications';
import type { Reward } from '../services/rewards';
import type { MissionWithStatus } from '../services/missions';
import type { Notification } from '../services/notifications';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';
import { DailyRewardModal, useDailyReward } from '../components/DailyRewardModal';
import LevelBadge from '../components/LevelBadge';
import NeoAvatar from '../components/NeoAvatar';
import { useXpProgress } from '../hooks/useXpProgress';
import StickerAccent from '../components/StickerAccent';
import { pageGroup } from '../lib/pageStickers';

/* ── Design tokens ── */
const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const STAT_STICKERS = ['home-stat-rank', 'home-stat-badge', 'home-stat-streak'] as const;
const REWARD_STICKERS = ['home-reward-a', 'home-reward-b', 'home-reward-c'] as const;
const QUICK_ACTION_SHAPES = ['home-qa-qr', 'home-qa-games', 'home-qa-shop', 'home-qa-missions'] as const;

const quickActions = [
  { icon: QrCode,   label: tr.home.scanQr,   path: '/qr',       bg: '#9122FF', emoji: '📱' },
  { icon: Gamepad2, label: tr.home.playGames, path: '/games',    bg: '#FF3E9D', emoji: '🎮' },
  { icon: Gift,     label: tr.home.rewards,   path: '/shop',     bg: '#FF6B35', emoji: '🎁' },
  { icon: Target,   label: tr.home.missions,  path: '/missions', bg: '#56C8FF', emoji: '🎯' },
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

  const [dailyMissions, setDailyMissions] = useState<MissionWithStatus[]>([]);
  const [featuredRewards, setFeaturedRewards] = useState<Reward[]>([]);
  const [unreadNotifs, setUnreadNotifs] = useState<Notification[]>([]);

  useEffect(() => {
    if (!authUser?.id) return;
    getFeaturedRewards().then(setFeaturedRewards).catch(() => setFeaturedRewards([]));
    getMissionsWithStatus(authUser.id)
      .then(all => setDailyMissions(all.filter(m => m.category === 'daily')))
      .catch(() => setDailyMissions([]));
    getNotifications(authUser.id, 0, 5)
      .then(all => setUnreadNotifs(all.filter(n => !n.read).slice(0, 2)))
      .catch(() => setUnreadNotifs([]));
  }, [authUser?.id]);

  const completedToday = dailyMissions.filter(m => m.completed).length;

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
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-end) 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 110, height: 110, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />

          <div style={{ padding: 'clamp(16px,5vw,28px)', position: 'relative' }}>
            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 700, margin: '0 0 4px', letterSpacing: '0.04em' }}>
                  {tr.home.welcomeBack} 👋
                </p>
                <h1 style={{ fontSize: 'clamp(22px,5vw,32px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 8px' }}>
                  {user.username}
                </h1>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'rgba(255,255,255,0.18)', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.3)' }}>
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{user.streak} {tr.home.streak}</span>
                </div>
              </div>
              <div style={{ position: 'relative', flexShrink: 0, textAlign: 'center' }}>
                <NeoAvatar
                  src={user.avatar}
                  name={user.username}
                  email={user.email}
                  size={64}
                  shape="circle"
                  border={false}
                  style={{ boxShadow: '0 4px 0 rgba(0,0,0,0.2)', border: '3px solid rgba(255,255,255,0.5)' }}
                />
                <LevelBadge
                  level={user.level}
                  width={34}
                  className="level-badge-overlay"
                  style={{ bottom: -6, right: -10 }}
                />
              </div>
            </div>

            {/* Points pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px',
              background: 'rgba(255,255,255,0.16)', borderRadius: 16,
              border: '2px solid rgba(255,255,255,0.25)', marginBottom: 18,
            }}>
              <Star size={24} fill="white" color="white" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 700, margin: '0 0 2px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{tr.home.currentBalance}</p>
                <p style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1 }}>{points.toLocaleString()}</p>
              </div>
              <button
                onClick={() => navigate('/shop')}
                style={{
                  position: 'relative',
                  padding: '9px 18px', background: 'white', color: '#6d28d9',
                  borderRadius: 12, fontWeight: 900, fontSize: 13,
                  border: '2px solid rgba(255,255,255,0.7)',
                  boxShadow: '0 3px 0 rgba(0,0,0,0.15)',
                  cursor: 'pointer', flexShrink: 0,
                  transition: 'transform 0.1s',
                }}
              >
                {tr.home.redeem}
                <StickerAccent seed="home-redeem-btn" size={22} rotate={10} style={{ position: 'absolute', top: -8, right: -6 }} />
              </button>
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

        {/* ── Stats row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
          {[
            { emoji: '🏆', value: `#${user.rank}`, label: tr.home.rank, color: '#f59e0b' },
            { emoji: '⭐', value: user.achievements, label: tr.home.achievements, color: '#7B6EF6' },
            { emoji: '🔥', value: user.streak, label: tr.home.dayStreak, color: '#ef4444' },
          ].map((s, i) => (
            <div key={s.label} style={{ ...card, padding: '16px 10px', textAlign: 'center', position: 'relative', overflow: 'visible' }}>
              <StickerAccent seed={STAT_STICKERS[i]} variant="shape" size={26} rotate={-8 + i * 6} style={{ position: 'absolute', top: -6, right: -4 }} />
              <div style={{ fontSize: 24, marginBottom: 6 }}>{s.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 22, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 900, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Promo banner ── */}
        <div style={{ ...card, overflow: 'hidden', position: 'relative', minHeight: 140, background: '#9122FF' }}>
          <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', zIndex: 0, opacity: 0.95 }}>
            <StickerAccent group={pageGroup('home')} variant="colorful" size={150} rotate={-4} />
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: 12, zIndex: 0, opacity: 0.8 }}>
            <StickerAccent group="yeeeaaahh.svg" variant="colorful" size={48} rotate={8} />
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
            {quickActions.map((action, idx) => (
                <button
                  key={action.path}
                  onClick={() => { playSound('click'); navigate(action.path); }}
                  className="press-card"
                  style={{
                    ...card, padding: 0, cursor: 'pointer',
                    display: 'flex', flexDirection: 'column', alignItems: 'stretch',
                    overflow: 'hidden', textAlign: 'left',
                  }}
                >
                  <div style={{
                    position: 'relative', height: 90, overflow: 'hidden',
                    background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <StickerAccent seed={QUICK_ACTION_SHAPES[idx]} variant="shape" size={56} rotate={-6 + idx * 4} />
                    <div style={{
                      position: 'absolute', top: 10, left: 12,
                      width: 38, height: 38, borderRadius: 12,
                      background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2.5px solid #000', boxShadow: '2px 2px 0 #000',
                    }}>
                      <action.icon size={18} color={action.bg} />
                    </div>
                    <StickerAccent seed={`home-action-${idx}`} variant="shape" size={28} rotate={8 - idx * 3} style={{ position: 'absolute', bottom: 6, right: 6 }} />
                  </div>
                  <div style={{ padding: '10px 12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className="font-display" style={{ color: 'var(--text-dark)', fontSize: 12, fontWeight: 900, textTransform: 'uppercase' }}>{action.label}</span>
                    <span style={{ fontSize: 18 }}>{action.emoji}</span>
                  </div>
                </button>
            ))}
          </div>
        </div>

        {/* ── Daily missions ── */}
        <div>
          <SectionHeader
            micro="GÜNLÜK"
            title={tr.home.dailyMissions}
            action={{ label: tr.home.seeAll, onClick: () => navigate('/missions') }}
          />
          <div style={{ ...card, padding: '20px 20px', position: 'relative', overflow: 'visible' }}>
            <StickerAccent seed="home-missions" size={30} rotate={-10} style={{ position: 'absolute', top: -8, right: 12 }} />
            {/* Progress header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-dark)' }}>
                {completedToday}/{dailyMissions.length} {tr.home.completed}
              </span>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 10px', borderRadius: 999,
                background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                fontSize: 11, fontWeight: 900, color: 'var(--text-dark)',
              }}>
                ⭐ {dailyMissions.reduce((acc, m) => acc + m.points, 0)} pts
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ height: 10, borderRadius: 999, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', overflow: 'hidden', marginBottom: 16 }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${(completedToday / dailyMissions.length) * 100}%`,
                background: 'linear-gradient(90deg,var(--gradient-start),var(--gradient-end))',
                transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </div>

            {/* Mission list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {dailyMissions.slice(0, 3).map(mission => (
                <div key={mission.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 12, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: mission.completed ? '#22c55e' : 'var(--tab-bg)',
                    border: '2.5px solid var(--dark-border)',
                    boxShadow: '0 3px 0 var(--dark-border)',
                    fontSize: 17,
                    transition: 'all 0.2s',
                  }}>
                    {mission.completed ? '✓' : mission.icon}
                  </div>
                  <p style={{
                    flex: 1, fontSize: 13, fontWeight: 700, margin: 0,
                    color: mission.completed ? 'var(--text-muted)' : 'var(--text-dark)',
                    textDecoration: mission.completed ? 'line-through' : 'none',
                  }}>{mission.title}</p>
                  <span style={{ fontSize: 12, fontWeight: 900, color: mission.completed ? '#22c55e' : '#f59e0b', flexShrink: 0 }}>
                    +{mission.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Featured rewards ── */}
        <div>
          <SectionHeader
            micro="MAĞAZA"
            title={tr.home.featuredRewards}
            action={{ label: tr.home.shopAll, onClick: () => navigate('/shop') }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(155px,1fr))', gap: 12 }}>
            {featuredRewards.map((reward, idx) => (
              <div
                key={reward.id}
                onClick={() => navigate('/shop')}
                className="press-card"
                style={{ ...card, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
              >
                <StickerAccent seed={REWARD_STICKERS[idx % REWARD_STICKERS.length]} size={24} rotate={12 - idx * 4}
                  style={{ position: 'absolute', top: 6, right: 6, zIndex: 2 }} />
                <div style={{ height: 110, overflow: 'hidden', borderBottom: '3px solid var(--dark-border)', position: 'relative' }}>
                  <img src={reward.image ?? undefined} alt={reward.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {reward.limited && (
                    <div style={{
                      position: 'absolute', top: 8, left: 8,
                      background: '#ef4444', color: 'white', borderRadius: 999,
                      padding: '2px 8px', fontSize: 9, fontWeight: 900,
                      border: '1.5px solid rgba(0,0,0,0.2)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>LIMITED</div>
                  )}
                </div>
                <div style={{ padding: '10px 12px 14px' }}>
                  <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 13, margin: '0 0 8px', lineHeight: 1.2 }}>{reward.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontWeight: 900, fontSize: 13, color: '#f59e0b' }}>{reward.points.toLocaleString()}</span>
                    </div>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8,
                      background: 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))',
                      border: '2px solid var(--dark-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <ArrowRight size={12} color="white" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
