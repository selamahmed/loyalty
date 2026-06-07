import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, QrCode, Gamepad2, Gift, Target, ArrowRight, Zap, Trophy, Flame, Crown, TrendingUp, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { rewards, missions, notifications, achievements } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const quickActions = [
  { icon: QrCode,   label: tr.home.scanQr,    path: '/qr',       bg: 'linear-gradient(160deg,#a78bfa,#6d28d9)', emoji: '📱', desc: 'Puan Kazan' },
  { icon: Gamepad2, label: tr.home.playGames,  path: '/games',    bg: 'linear-gradient(160deg,#4ade80,#16a34a)', emoji: '🎮', desc: 'Eğlen & Kazan' },
  { icon: Gift,     label: tr.home.rewards,    path: '/shop',     bg: 'linear-gradient(160deg,#fbbf24,#d97706)', emoji: '🎁', desc: 'Ödül Al' },
  { icon: Target,   label: tr.home.missions,   path: '/missions', bg: 'linear-gradient(160deg,#f87171,#dc2626)', emoji: '🎯', desc: 'Görev Yap' },
];

/* ── Inline SVG Illustrations ── */
const IllustrationStars: React.FC = () => (
  <svg width="120" height="100" viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.18, position: 'absolute', right: 10, top: 10 }}>
    <circle cx="90" cy="20" r="18" fill="white" />
    <circle cx="110" cy="50" r="10" fill="white" />
    <circle cx="70" cy="60" r="14" fill="white" />
    <polygon points="90,6 93,14 102,14 95,19 98,27 90,22 82,27 85,19 78,14 87,14" fill="rgba(255,220,0,0.9)" />
    <polygon points="110,40 112,46 118,46 113,49 115,55 110,52 105,55 107,49 102,46 108,46" fill="rgba(255,220,0,0.7)" />
    <polygon points="70,48 72,54 78,54 73,57 75,63 70,60 65,63 67,57 62,54 68,54" fill="rgba(255,220,0,0.8)" />
  </svg>
);

const IllustrationTrophy: React.FC = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="30" y="58" width="20" height="8" rx="3" fill="rgba(255,255,255,0.4)" />
    <rect x="24" y="64" width="32" height="6" rx="3" fill="rgba(255,255,255,0.5)" />
    <path d="M20 16 C20 16 16 16 16 24 C16 36 28 42 40 44 C52 42 64 36 64 24 C64 16 60 16 60 16 Z" fill="rgba(255,220,0,0.9)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
    <path d="M16 20 C10 20 8 28 14 32 C17 34 22 36 26 38" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M64 20 C70 20 72 28 66 32 C63 34 58 36 54 38" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" fill="none" />
    <path d="M32 44 L32 58" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
    <path d="M48 44 L48 58" stroke="rgba(255,255,255,0.4)" strokeWidth="4" strokeLinecap="round" />
    <text x="40" y="36" textAnchor="middle" fontSize="18" fill="white" fontWeight="bold">★</text>
  </svg>
);

const IllustrationRocket: React.FC<{ color?: string }> = ({ color = 'white' }) => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4 C20 4 28 8 28 20 L28 30 L20 34 L12 30 L12 20 C12 8 20 4 20 4Z" fill={color} fillOpacity="0.85" />
    <circle cx="20" cy="20" r="5" fill={color} fillOpacity="0.5" />
    <path d="M12 28 L8 34 L16 32 Z" fill={color} fillOpacity="0.6" />
    <path d="M28 28 L32 34 L24 32 Z" fill={color} fillOpacity="0.6" />
    <path d="M18 34 L20 40 L22 34" fill={color} fillOpacity="0.4" />
  </svg>
);

const IllustrationCoins: React.FC = () => (
  <svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="28" cy="30" r="18" fill="#f59e0b" stroke="#d97706" strokeWidth="2.5" />
    <circle cx="28" cy="30" r="13" fill="#fbbf24" />
    <text x="28" y="35" textAnchor="middle" fontSize="14" fill="#92400e" fontWeight="900">★</text>
    <circle cx="42" cy="20" r="12" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
    <circle cx="42" cy="20" r="8" fill="#fbbf24" />
    <text x="42" y="24" textAnchor="middle" fontSize="9" fill="#92400e" fontWeight="900">★</text>
    <circle cx="16" cy="22" r="10" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
    <circle cx="16" cy="22" r="6.5" fill="#fbbf24" />
    <text x="16" y="26" textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="900">★</text>
  </svg>
);

const IllustrationPath: React.FC = () => (
  <svg width="100%" height="60" viewBox="0 0 300 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
    <path d="M0 30 Q75 10 150 30 Q225 50 300 30" stroke="var(--dark-border)" strokeWidth="3" strokeDasharray="8 6" fill="none" />
    <circle cx="0" cy="30" r="8" fill="#22c55e" stroke="var(--dark-border)" strokeWidth="2.5" />
    <text x="0" y="35" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">✓</text>
    <circle cx="100" cy="20" r="8" fill="#22c55e" stroke="var(--dark-border)" strokeWidth="2.5" />
    <text x="100" y="25" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">✓</text>
    <circle cx="200" cy="40" r="8" fill="#7B6EF6" stroke="var(--dark-border)" strokeWidth="2.5" />
    <text x="200" y="45" textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">3</text>
    <circle cx="300" cy="30" r="8" fill="var(--tab-bg)" stroke="var(--dark-border)" strokeWidth="2.5" />
    <text x="300" y="35" textAnchor="middle" fontSize="8" fill="var(--text-muted)" fontWeight="bold">4</text>
  </svg>
);

const IllustrationMedal: React.FC<{ rank: number }> = ({ rank }) => {
  const colors = ['#f59e0b', '#94a3b8', '#cd7c3a'];
  const c = colors[rank - 1] || '#7B6EF6';
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="28" r="16" fill={c} opacity="0.9" />
      <circle cx="24" cy="28" r="11" fill={c} opacity="0.6" />
      <text x="24" y="33" textAnchor="middle" fontSize="13" fill="white" fontWeight="900">#{rank}</text>
      <rect x="20" y="6" width="8" height="14" rx="2" fill={c} opacity="0.7" />
      <path d="M20 10 L24 4 L28 10" fill={c} opacity="0.9" />
    </svg>
  );
};

/* ── Streak Flame Illustration ── */
const StreakFlame: React.FC<{ streak: number }> = ({ streak }) => (
  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
      <path d="M26 6 C26 6 36 14 36 24 C36 28 34 30 32 30 C34 26 30 20 26 18 C28 22 26 28 22 30 C18 30 16 26 18 22 C16 26 16 32 22 36 C14 34 10 28 10 22 C10 14 18 8 26 6Z" fill="#f97316" />
      <path d="M26 16 C26 16 32 22 32 28 C32 32 28 34 26 34 C24 34 22 32 22 28 C22 24 24 20 26 16Z" fill="#fbbf24" />
      <circle cx="26" cy="30" r="4" fill="#fff7ed" opacity="0.7" />
    </svg>
    <span style={{ position: 'absolute', bottom: -2, right: -2, background: '#ef4444', color: 'white', fontSize: 9, fontWeight: 900, borderRadius: 999, padding: '1px 5px', border: '1.5px solid var(--dark-border)' }}>{streak}</span>
  </div>
);

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user, points } = useApp();
  const [showParticles, setShowParticles] = useState(false);
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const dailyMissions = missions.filter(m => m.category === 'daily');
  const completedToday = dailyMissions.filter(m => m.completed).length;
  const featuredRewards = rewards.filter(r => r.featured).slice(0, 3);
  const unreadNotifs = notifications.filter(n => !n.read);
  const recentAchievements = achievements.filter(a => a.completed).slice(0, 3);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>

      {/* Ghost watermarks */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>DASHBOARD</div>
        <div style={{
          position: 'absolute', bottom: '12%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(40px,10vw,120px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>PUAN KAZAN</div>
      </div>

      <WinningParticles trigger={showParticles} emoji="🌟" />

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-4xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Hero Card ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
          color: 'white', position: 'relative', overflow: 'hidden',
        }}>
          <IllustrationStars />
          {/* Decorative blobs */}
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ position: 'absolute', bottom: -40, left: -30, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', top: '40%', right: '18%', width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />

          <div style={{ padding: 'clamp(16px,4vw,28px)', position: 'relative' }}>
            {/* Top row: user info + trophy */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700, marginBottom: 2 }}>{tr.home.welcomeBack} 👋</p>
                <h1 style={{ fontSize: 'clamp(22px,5vw,34px)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 6px' }}>{user.username}</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', background: 'rgba(255,255,255,0.18)', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.3)' }}>
                    <StreakFlame streak={user.streak} />
                    <span style={{ fontSize: 12, fontWeight: 900 }}>{user.streak} günlük seri!</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: 'rgba(255,255,255,0.15)', borderRadius: 999, border: '1.5px solid rgba(255,255,255,0.25)' }}>
                    <Crown size={13} color="#fbbf24" />
                    <span style={{ fontSize: 12, fontWeight: 900 }}>#{user.rank} Sıra</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <div style={{
                    width: 68, height: 68, borderRadius: '50%', overflow: 'hidden',
                    border: '3px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 4px 0 rgba(0,0,0,0.25)',
                  }}>
                    <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{
                    position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
                    padding: '2px 9px', background: 'linear-gradient(90deg,#fbbf24,#f59e0b)',
                    borderRadius: 999, fontSize: 10, fontWeight: 900,
                    border: '2px solid rgba(255,255,255,0.6)', whiteSpace: 'nowrap',
                    boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
                  }}>Lv.{user.level}</div>
                </div>
              </div>
            </div>

            {/* Points pill */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px',
              background: 'rgba(255,255,255,0.18)', borderRadius: 16,
              border: '2px solid rgba(255,255,255,0.3)', marginBottom: 16,
            }}>
              <IllustrationCoins />
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.75)', fontWeight: 700, margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{tr.home.currentBalance}</p>
                <p style={{ fontSize: 30, fontWeight: 900, margin: 0, lineHeight: 1 }}>{points.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 700, opacity: 0.8 }}>puan</span></p>
              </div>
              <button
                onClick={() => navigate('/redeem')}
                style={{
                  padding: '10px 18px', background: 'white', color: '#6d28d9',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginBottom: 6, fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Zap size={11} color="#fbbf24" /> Lv.{user.level} → Lv.{user.level + 1}</span>
                <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
              </div>
              <div style={{ height: 12, borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', overflow: 'hidden', position: 'relative' }}>
                <div style={{ height: '100%', width: `${xpPercent}%`, background: 'linear-gradient(90deg,#fbbf24,white)', borderRadius: 999, transition: 'width 0.6s ease', position: 'relative' }}>
                  <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 6, background: 'rgba(255,255,255,0.7)', borderRadius: 999 }} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 5, fontWeight: 600 }}>
                🚀 {user.xpToNext - user.xp} XP daha → Seviye {user.level + 1}!
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          <div style={{ ...card, padding: '16px 10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/leaderboard')}>
            <IllustrationMedal rank={user.rank} />
            <p style={{ fontWeight: 900, fontSize: 18, color: '#f59e0b', margin: '6px 0 0', lineHeight: 1 }}>#{user.rank}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sıralama</p>
          </div>
          <div style={{ ...card, padding: '16px 10px', textAlign: 'center', cursor: 'pointer' }} onClick={() => navigate('/achievements')}>
            <div style={{ fontSize: 28, marginBottom: 2 }}>🏅</div>
            <p style={{ fontWeight: 900, fontSize: 18, color: '#7B6EF6', margin: '2px 0 0', lineHeight: 1 }}>{user.achievements}</p>
            <div style={{ height: 4, borderRadius: 999, background: 'var(--tab-bg)', margin: '6px 4px 0', overflow: 'hidden', border: '1px solid var(--dark-border)' }}>
              <div style={{ height: '100%', width: `${(user.achievements / user.totalAchievements) * 100}%`, background: '#7B6EF6', borderRadius: 999 }} />
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Başarı</p>
          </div>
          <div style={{ ...card, padding: '16px 10px', textAlign: 'center', cursor: 'pointer' }}>
            <StreakFlame streak={user.streak} />
            <p style={{ fontWeight: 900, fontSize: 18, color: '#ef4444', margin: '6px 0 0', lineHeight: 1 }}>{user.streak}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: 9, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gün Serisi</p>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>{tr.home.quickActions}</h2>
            <span style={{
              fontSize: 10, fontWeight: 900, padding: '3px 10px',
              background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
              borderRadius: 999, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Hızlı Erişim</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
            {quickActions.map(action => (
              <button
                key={action.path}
                onClick={() => { playSound('click'); navigate(action.path); }}
                style={{
                  ...card,
                  padding: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'stretch', cursor: 'pointer',
                  background: 'var(--card-bg)', transition: 'transform 0.1s, box-shadow 0.1s',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 9px 0px var(--dark-border)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 6px 0px var(--dark-border)'; }}
                onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0px 2px 0px var(--dark-border)'; }}
                onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0px 6px 0px var(--dark-border)'; }}
              >
                {/* Gradient header with illustration */}
                <div style={{ height: 80, background: action.bg, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Decorative circles */}
                  <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.12)' }} />
                  <div style={{ position: 'absolute', bottom: -15, left: -10, width: 50, height: 50, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: 36, position: 'relative', zIndex: 1, filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>{action.emoji}</span>
                </div>
                {/* Label */}
                <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ color: 'var(--text-dark)', fontSize: 13, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{action.label}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 700, margin: '3px 0 0' }}>{action.desc}</p>
                  </div>
                  <div style={{ width: 26, height: 26, borderRadius: 8, background: 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={13} color="var(--text-muted)" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Daily Progress Path ── */}
        <div style={{ ...card, padding: '18px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 100, height: 100, borderRadius: '50%', background: 'rgba(123,110,246,0.06)' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 16, margin: 0 }}>🗺️ Günlük İlerleme</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: 11, fontWeight: 600, margin: '3px 0 0' }}>{completedToday}/{dailyMissions.length} görev tamamlandı</p>
            </div>
            <button onClick={() => navigate('/missions')} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900,
              color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {tr.home.seeAll} <ArrowRight size={13} />
            </button>
          </div>

          <IllustrationPath />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, marginTop: 14 }}>
            {dailyMissions.slice(0, 3).map((mission, idx) => (
              <div key={mission.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', borderRadius: 12,
                background: mission.completed ? 'rgba(34,197,94,0.07)' : 'var(--tab-bg)',
                border: `2px solid ${mission.completed ? '#22c55e' : 'var(--dark-border)'}`,
                transition: 'all 0.2s',
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: mission.completed ? '#22c55e' : 'var(--card-bg)',
                  border: '2px solid var(--dark-border)',
                  fontSize: 16, boxShadow: '0 2px 0 var(--dark-border)',
                }}>
                  {mission.completed ? <CheckCircle2 size={18} color="white" /> : <span>{mission.icon}</span>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize: 13, fontWeight: 700, margin: 0,
                    color: mission.completed ? 'var(--text-muted)' : 'var(--text-dark)',
                    textDecoration: mission.completed ? 'line-through' : 'none',
                  }}>{mission.title}</p>
                  <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 600 }}>{mission.description}</p>
                </div>
                <div style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: mission.completed ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)',
                  border: `1.5px solid ${mission.completed ? '#22c55e' : '#f59e0b'}`,
                  fontSize: 11, fontWeight: 900,
                  color: mission.completed ? '#16a34a' : '#d97706', flexShrink: 0,
                }}>+{mission.points}</div>
              </div>
            ))}
          </div>

          {/* Total reward */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, padding: '10px 14px', borderRadius: 12, background: 'linear-gradient(90deg,rgba(123,110,246,0.08),rgba(123,110,246,0.04))', border: '2px solid var(--dark-border)' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)' }}>Tüm görevleri tamamla →</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 900, color: '#7B6EF6' }}>
              <Star size={14} fill="#7B6EF6" color="#7B6EF6" />
              {dailyMissions.reduce((acc, m) => acc + m.points, 0)} puan
            </span>
          </div>
        </div>

        {/* ── Featured Rewards ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>🎁 {tr.home.featuredRewards}</h2>
            <button onClick={() => navigate('/shop')} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900,
              color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {tr.home.shopAll} <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(150px,1fr))', gap: 12 }}>
            {featuredRewards.map((reward, idx) => {
              const canAfford = points >= reward.points;
              return (
                <div
                  key={reward.id}
                  onClick={() => navigate('/shop')}
                  style={{ ...card, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s', animation: `homeFadeIn 0.3s ease-out ${idx * 0.07}s both` }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 9px 0 var(--dark-border)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 0 var(--dark-border)'; }}
                >
                  <div style={{ height: 110, overflow: 'hidden', borderBottom: '3px solid var(--dark-border)', position: 'relative' }}>
                    <img src={reward.image} alt={reward.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s' }} />
                    <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {reward.limited && (
                        <span style={{ background: '#ef4444', color: 'white', borderRadius: 999, padding: '2px 7px', fontSize: 8, fontWeight: 900, border: '1.5px solid rgba(0,0,0,0.2)', textTransform: 'uppercase' }}>LIMITED</span>
                      )}
                      {canAfford && (
                        <span style={{ background: '#22c55e', color: 'white', borderRadius: 999, padding: '2px 7px', fontSize: 8, fontWeight: 900, border: '1.5px solid rgba(0,0,0,0.2)' }}>✓ Alınabilir</span>
                      )}
                    </div>
                  </div>
                  <div style={{ padding: '10px 12px' }}>
                    <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 13, margin: '0 0 6px', lineHeight: 1.2 }}>{reward.title}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontWeight: 900, fontSize: 13, color: '#f59e0b' }}>{reward.points.toLocaleString()}</span>
                      </div>
                      <div style={{ width: 24, height: 24, borderRadius: 7, background: canAfford ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--tab-bg)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ArrowRight size={12} color={canAfford ? 'white' : 'var(--text-muted)'} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Achievements ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>🏆 Son Başarılar</h2>
            <button onClick={() => navigate('/achievements')} style={{
              display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900,
              color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0,
            }}>
              {tr.home.seeAll} <ArrowRight size={13} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {recentAchievements.map((ach, idx) => {
              const rarityColor = ach.rarity === 'legendary' ? '#f59e0b' : ach.rarity === 'epic' ? '#7B6EF6' : ach.rarity === 'rare' ? '#3b82f6' : '#22c55e';
              return (
                <div key={ach.id} onClick={() => navigate('/achievements')} style={{
                  ...card, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                  minWidth: 120, cursor: 'pointer', flexShrink: 0,
                  borderColor: rarityColor, boxShadow: `0 6px 0 ${rarityColor}`,
                  animation: `homeFadeIn 0.3s ease-out ${idx * 0.08}s both`,
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${rarityColor}18`, border: `2.5px solid ${rarityColor}`, fontSize: 24,
                    boxShadow: `0 3px 0 ${rarityColor}`,
                  }}>{ach.icon}</div>
                  <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 12, margin: 0, textAlign: 'center', lineHeight: 1.2 }}>{ach.title}</p>
                  <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 8px', borderRadius: 999, background: `${rarityColor}20`, color: rarityColor, border: `1.5px solid ${rarityColor}`, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{ach.rarity}</span>
                </div>
              );
            })}
            {/* Locked teaser */}
            <div onClick={() => navigate('/achievements')} style={{
              ...card, padding: '14px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
              minWidth: 120, cursor: 'pointer', flexShrink: 0, opacity: 0.5,
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--tab-bg)', border: '2.5px solid var(--dark-border)', fontSize: 24 }}>🔒</div>
              <p style={{ color: 'var(--text-muted)', fontWeight: 900, fontSize: 11, margin: 0, textAlign: 'center' }}>{user.totalAchievements - user.achievements} daha var</p>
            </div>
          </div>
        </div>

        {/* ── Earn More Banner ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%)',
          padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden', cursor: 'pointer',
        }} onClick={() => { playSound('click'); navigate('/qr'); }}>
          <div style={{ position: 'absolute', top: -25, right: -25, width: 100, height: 100, borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
          <div style={{ position: 'absolute', bottom: -20, left: '40%', width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <IllustrationRocket color="white" />
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: 700, margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Hızlı Kazan</p>
            <p style={{ color: 'white', fontWeight: 900, fontSize: 16, margin: '0 0 4px' }}>QR Kodu Tara!</p>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, fontWeight: 600, margin: 0 }}>Her taramada anında puan kazan 📱</p>
          </div>
          <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, zIndex: 1 }}>
            <div style={{ padding: '8px 14px', background: 'rgba(255,255,255,0.2)', borderRadius: 12, border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              <span style={{ fontWeight: 900, fontSize: 14, color: 'white' }}>+75</span>
            </div>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', fontWeight: 700 }}>puan/tarama</span>
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
                  cursor: 'pointer', transition: 'transform 0.1s',
                }} onClick={() => navigate('/notifications')}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59,130,246,0.1)', border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{notif.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 13, margin: '0 0 3px' }}>{notif.title}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{notif.message}</p>
                  </div>
                  <span style={{ color: 'var(--text-muted)', fontSize: 10, whiteSpace: 'nowrap', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{notif.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom Spacer ── */}
        <div style={{ height: 16 }} />
      </div>

      <style>{`
        @keyframes homeFadeIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Home;
