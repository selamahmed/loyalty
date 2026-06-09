import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Gamepad2, Gift, ChevronRight, Zap, Target, Trophy, TrendingUp, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { rewards, missions, notifications } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';
import { DailyRewardModal, useDailyReward } from '../components/DailyRewardModal';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const quickActions = [
  { icon: QrCode,   label: tr.home.scanQr,    path: '/qr',       color: '#7B6EF6', bg: 'linear-gradient(180deg,#a78bfa,#6d28d9)', emoji: '📱' },
  { icon: Gamepad2, label: tr.home.playGames,  path: '/games',    color: '#22c55e', bg: 'linear-gradient(180deg,#4ade80,#16a34a)', emoji: '🎮' },
  { icon: Gift,     label: tr.home.rewards,    path: '/shop',     color: '#f59e0b', bg: 'linear-gradient(180deg,#fbbf24,#d97706)', emoji: '🎁' },
  { icon: Target,   label: tr.home.missions,   path: '/missions', color: '#ef4444', bg: 'linear-gradient(180deg,#f87171,#dc2626)', emoji: '🎯' },
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, points } = useApp();
  const [showParticles, setShowParticles] = useState(false);
  const { show: showDailyReward, setShow: setShowDailyReward } = useDailyReward();
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const dailyMissions = missions.filter(m => m.category === 'daily');
  const completedToday = dailyMissions.filter(m => m.completed).length;
  const featuredRewards = rewards.filter(r => r.featured).slice(0, 3);
  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>DASHBOARD</div>
        <div style={{
          position: 'absolute', bottom: '14%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(40px,10vw,130px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>PUAN KAZAN</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="🌟" />
      {showDailyReward && <DailyRewardModal onClose={() => setShowDailyReward(false)} />}

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-4xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero Card ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative circles */}
          <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />

          <div style={{ padding: 'clamp(16px,4vw,28px)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{tr.home.welcomeBack} 👋</p>
                <h1 style={{ fontSize: 'clamp(22px,5vw,34px)', fontWeight: 900, lineHeight: 1.1, margin: 0 }}>{user.username}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span style={{ fontSize: 14 }}>⚡</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.85)' }}>{user.streak} {tr.home.streak}</span>
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', overflow: 'hidden',
                  border: '3px solid rgba(255,255,255,0.6)',
                  boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                }}>
                  <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{
                  marginTop: 8, padding: '3px 10px',
                  background: 'rgba(255,255,255,0.25)', borderRadius: 999,
                  fontSize: 11, fontWeight: 900, border: '1.5px solid rgba(255,255,255,0.4)',
                }}>Lv.{user.level}</div>
              </div>
            </div>

            {/* Points pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
              background: 'rgba(255,255,255,0.18)', borderRadius: 16,
              border: '2px solid rgba(255,255,255,0.3)', marginBottom: 14,
            }}>
              <Star size={22} fill="white" color="white" />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 600, margin: 0 }}>{tr.home.currentBalance}</p>
                <p style={{ fontSize: 28, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>{points.toLocaleString()}</p>
              </div>
              <button
                onClick={() => navigate('/redeem')}
                style={{
                  padding: '8px 16px', background: 'white', color: '#6d28d9',
                  borderRadius: 12, fontWeight: 900, fontSize: 13,
                  border: '2px solid rgba(255,255,255,0.8)',
                  boxShadow: '0 3px 0 rgba(0,0,0,0.2)',
                  cursor: 'pointer', flexShrink: 0,
                }}
                onMouseEnter={() => playSound('click')}
              >{tr.home.redeem}</button>
            </div>

            {/* XP bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 5, fontWeight: 700 }}>
                <span>Lv.{user.level} → {user.level + 1}</span>
                <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
              </div>
              <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${xpPercent}%`, background: 'white', borderRadius: 999, transition: 'width 0.5s ease' }} />
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 4, fontWeight: 600 }}>{user.xpToNext - user.xp} XP sonraki seviye için</p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { emoji: '🏆', value: `#${user.rank}`, label: tr.home.rank, color: '#f59e0b' },
            { emoji: '⭐', value: user.achievements, label: tr.home.achievements, color: '#7B6EF6' },
            { emoji: '🔥', value: user.streak, label: tr.home.dayStreak, color: '#ef4444' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 20, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Illustration Banner ── */}
        <div style={{ ...card, overflow: 'hidden', position: 'relative', height: 130 }}>
          <img
            src="https://picsum.photos/seed/homehero11/900/280"
            alt="Kazanmaya başla"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.55) saturate(1.1)' }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(109,40,217,0.85) 0%, rgba(109,40,217,0.15) 75%)' }} />
          <div style={{ position: 'absolute', top: '50%', left: 18, transform: 'translateY(-50%)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, marginBottom: 6,
              background: '#FFE500', color: '#000', borderRadius: 999, padding: '2px 9px', fontSize: 9, fontWeight: 900, letterSpacing: '0.1em',
            }}>⚡ BUGÜN KAZAN</div>
            <p style={{ color: 'white', fontSize: 'clamp(15px,3vw,20px)', fontWeight: 900, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              Alışveriş yap,<br />puan topla!
            </p>
          </div>
          <div style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)', fontSize: 'clamp(44px,8vw,62px)', opacity: 0.9, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' }}>🎁</div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>{tr.home.quickActions}</h2>
            <span style={{
              fontSize: 10, fontWeight: 900, padding: '3px 10px',
              background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
              borderRadius: 999, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>4 actions</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {quickActions.map(action => (
              <button
                key={action.path}
                onClick={() => { playSound('click'); navigate(action.path); }}
                style={{
                  ...card,
                  padding: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'stretch', gap: 0, cursor: 'pointer',
                  background: 'var(--card-bg)', transition: 'transform 0.1s, box-shadow 0.1s',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 2px 0px var(--dark-border)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 6px 0px var(--dark-border)'; }}
              >
                {/* Illustration top */}
                <div style={{ position: 'relative', height: 72, overflow: 'hidden' }}>
                  <img
                    src={`https://picsum.photos/seed/${action.path.replace('/','')}_ill/280/150`}
                    alt={action.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.58) saturate(1.1)' }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 20%, var(--card-bg) 100%)` }} />
                  <div style={{
                    position: 'absolute', top: 8, left: 10,
                    width: 38, height: 38, borderRadius: 12,
                    background: action.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2.5px solid var(--dark-border)', boxShadow: '0 3px 0 var(--dark-border)',
                  }}>
                    <action.icon size={18} color="white" />
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 10px 12px' }}>
                  <span style={{ color: 'var(--text-dark)', fontSize: 12, fontWeight: 900, display: 'block', lineHeight: 1.2 }}>{action.label}</span>
                  <span style={{ fontSize: 16, marginTop: 2, display: 'block' }}>{action.emoji}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Daily Missions ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>{tr.home.dailyMissions}</h2>
            <button onClick={() => navigate('/missions')} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900,
              color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {tr.home.seeAll} <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ ...card, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ color: 'var(--text-dark)', fontSize: 13, fontWeight: 700 }}>
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

            <div style={{ height: 10, borderRadius: 999, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', overflow: 'hidden', marginBottom: 14 }}>
              <div style={{
                height: '100%', borderRadius: 999, transition: 'width 0.5s ease',
                width: `${(completedToday / dailyMissions.length) * 100}%`,
                background: 'linear-gradient(90deg, var(--gradient-start), var(--gradient-end))',
              }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dailyMissions.slice(0, 3).map(mission => (
                <div key={mission.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: mission.completed ? '#22c55e' : 'var(--tab-bg)',
                    border: '2px solid var(--dark-border)',
                    fontSize: 16, color: mission.completed ? 'white' : 'var(--text-dark)',
                    boxShadow: '0 2px 0 var(--dark-border)',
                  }}>
                    {mission.completed ? '✓' : mission.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      fontSize: 13, fontWeight: 700, margin: 0,
                      color: mission.completed ? 'var(--text-muted)' : 'var(--text-dark)',
                      textDecoration: mission.completed ? 'line-through' : 'none',
                    }}>{mission.title}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 900, color: mission.completed ? '#22c55e' : '#f59e0b', flexShrink: 0 }}>
                    +{mission.points}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Featured Rewards ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>{tr.home.featuredRewards}</h2>
            <button onClick={() => navigate('/shop')} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900,
              color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {tr.home.shopAll} <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 12 }}>
            {featuredRewards.map(reward => (
              <div
                key={reward.id}
                onClick={() => navigate('/shop')}
                style={{ ...card, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
              >
                <div style={{ height: 110, overflow: 'hidden', borderBottom: '3px solid var(--dark-border)', position: 'relative' }}>
                  <img src={reward.image} alt={reward.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {reward.limited && (
                    <div style={{
                      position: 'absolute', top: 8, left: 8,
                      background: '#ef4444', color: 'white', borderRadius: 999,
                      padding: '2px 8px', fontSize: 9, fontWeight: 900,
                      border: '1.5px solid rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em',
                    }}>LIMITED</div>
                  )}
                </div>
                <div style={{ padding: '10px 12px' }}>
                  <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 13, margin: '0 0 6px', lineHeight: 1.2 }}>{reward.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontWeight: 900, fontSize: 13, color: '#f59e0b' }}>{reward.points.toLocaleString()}</span>
                    </div>
                    <ArrowRight size={14} color="var(--text-muted)" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Notifications Preview ── */}
        {unreadNotifs.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>{tr.notifications.title}</h2>
                <span style={{
                  background: '#ef4444', color: 'white', borderRadius: 999,
                  padding: '2px 8px', fontSize: 11, fontWeight: 900,
                  border: '2px solid var(--dark-border)',
                }}>{unreadNotifs.length}</span>
              </div>
              <button onClick={() => navigate('/notifications')} style={{
                display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900,
                color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>{tr.home.seeAll} <ArrowRight size={13} /></button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {unreadNotifs.slice(0, 2).map(notif => (
                <div key={notif.id} style={{
                  ...card, border: '3px solid var(--primary-blue)',
                  padding: '14px 16px', display: 'flex', alignItems: 'flex-start', gap: 12,
                }}>
                  <span style={{ fontSize: 22 }}>{notif.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 13, margin: '0 0 2px' }}>{notif.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{notif.message}</p>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10, whiteSpace: 'nowrap', fontWeight: 700, flexShrink: 0 }}>{notif.time}</span>
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
