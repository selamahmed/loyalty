import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Zap, Target, Settings, LogOut, ChevronRight, TrendingUp, Calendar, Package, Ticket, Tag, Gift, Check, Copy, Clock, CreditCard as Edit3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { useXpProgress } from '../hooks/useXpProgress';
import NeoAvatar from '../components/NeoAvatar';
import LevelBadge from '../components/LevelBadge';
import StickerAccent from '../components/StickerAccent';
import { getLevelBadge } from '../lib/levelBadges';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/* ── Reusable section header ── */
const SectionHeader: React.FC<{
  micro: string; title: string;
  action?: { label: string; onClick: () => void };
}> = ({ micro, title, action }) => (
  <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14 }}>
    <div>
      <p className="section-label">{micro}</p>
      <h2 className="section-title">{title}</h2>
    </div>
    {action && (
      <button onClick={action.onClick} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0' }}>
        {action.label} <ChevronRight size={13} />
      </button>
    )}
  </div>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, points } = useApp();
  const { logout } = useAuth();
  const { items: inventoryItems } = useInventory();
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const xpProgress = useXpProgress(user.xp, user.level);
  const completedAchievements: { id: string; title: string; icon: string }[] = [];

  const typeConfig: Record<string, { color: string; bg: string; accent: string; icon: LucideIcon }> = {
    coupon: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', accent: '#3b82f6', icon: Tag },
    ticket: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', accent: '#f59e0b', icon: Ticket },
    reward: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', accent: '#22c55e', icon: Gift },
  };

  const handleCopy = (code: string) => {
    playSound('success');
    navigator.clipboard.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const isExpired = (date: string) => new Date(date) < new Date();
  const activeInventory = inventoryItems.filter(i => !i.used);
  const displayedInventory = showAllInventory ? activeInventory : activeInventory.slice(0, 3);
  const recentAchievements = completedAchievements.slice(0, 4);

  const stats = [
    { label: tr.profile.totalPoints,  value: user.totalPoints.toLocaleString(), color: '#f59e0b', emoji: '⭐' },
    { label: tr.profile.currentLevel, value: getLevelBadge(user.level).label, color: '#22c55e', emoji: '📈' },
    { label: tr.profile.achievements, value: `${user.achievements}/${user.totalAchievements}`, color: '#7B6EF6', emoji: '🏆' },
    { label: tr.profile.dayStreak,    value: `${user.streak}g`,                 color: '#f97316', emoji: '🔥' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)', fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>PROFİL</div>
      </div>

      <div
        className="page-enter"
        style={{ padding: 'clamp(12px,4vw,24px)', paddingBottom: 32, maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}
      >

        {/* ── Profile hero ── */}
        <div style={{ ...card, background: 'linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-end) 100%)', position: 'relative', overflow: 'visible' }}>
          <StickerAccent seed="profile-hero-accent" variant="shape" size={42} rotate={-8} style={{ position: 'absolute', top: -10, right: 12, zIndex: 2 }} />
          <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
          <div style={{ padding: 'clamp(16px,5vw,28px)', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              {/* Avatar */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <NeoAvatar
                  src={user.avatar}
                  name={user.username}
                  email={user.email}
                  size={80}
                  shape="circle"
                  style={{ border: '4px solid rgba(255,255,255,0.55)', boxShadow: '0 4px 0 rgba(0,0,0,0.18)' }}
                />
                <LevelBadge
                  level={user.level}
                  width={38}
                  className="level-badge-overlay"
                  style={{ bottom: -4, right: -12 }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <div>
                    <h1 style={{ color: 'white', fontWeight: 900, fontSize: 24, margin: '0 0 3px', lineHeight: 1 }}>{user.username}</h1>
                    <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0, fontWeight: 600 }}>{user.email}</p>
                  </div>
                  <button
                    onClick={() => { playSound('click'); navigate('/settings'); }}
                    style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)', border: '2px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                  >
                    <Edit3 size={15} color="white" />
                  </button>
                </div>

                <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className="level-badge-pill">
                    <LevelBadge level={user.level} width={40} />
                    {getLevelBadge(user.level).label}
                  </span>
                  <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 900, color: 'white' }}>
                    🔥 {user.streak}g serisi
                  </span>
                </div>

                {/* XP bar */}
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.65)', marginBottom: 6, fontWeight: 700 }}>
                    <span>Lv.{user.level}{xpProgress.nextTitle ? ` → ${user.level + 1}` : ''}</span>
                    <span>{xpProgress.inLevel.toLocaleString()} / {xpProgress.isMaxLevel ? 'MAX' : xpProgress.needed.toLocaleString()} XP</span>
                  </div>
                  <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.25)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${xpProgress.pct}%`, background: 'white', borderRadius: 999, transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Join date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 16, color: 'rgba(255,255,255,0.6)' }}>
              <Calendar size={12} />
              <span style={{ fontSize: 11, fontWeight: 600 }}>
                {new Date(user.joinDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} tarihinden beri üye
              </span>
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="profile-stats-grid">
          {stats.map((stat, i) => (
            <div key={stat.label} className="profile-stat-card" style={{ ...card, position: 'relative', overflow: 'visible' }}>
              {i === 0 && <StickerAccent seed="profile-stat-accent" size={20} rotate={8} style={{ position: 'absolute', top: -6, right: 6, zIndex: 2 }} />}
              <div
                className="profile-stat-card__icon"
                style={{
                  background: `${stat.color}15`,
                  border: `2.5px solid ${stat.color}`,
                  boxShadow: `0 3px 0 ${stat.color}40`,
                }}
              >
                {stat.emoji}
              </div>
              <div className="profile-stat-card__body">
                <p className="profile-stat-card__value">{stat.value}</p>
                <p className="profile-stat-card__label">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Points card ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(123,110,246,0.14) 0%,rgba(167,139,250,0.07) 100%)',
          border: '3px solid #7B6EF6', boxShadow: '0 6px 0 var(--dark-border)',
          padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
          position: 'relative', overflow: 'visible',
        }}>
          <StickerAccent seed="profile-points" variant="shape" size={28} rotate={-10} style={{ position: 'absolute', top: -8, right: 10, zIndex: 2 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, fontWeight: 900, color: '#a78bfa', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{tr.profile.availablePoints}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={26} fill="#a78bfa" color="#a78bfa" />
              <span style={{ fontSize: 36, fontWeight: 900, color: 'var(--text-dark)', lineHeight: 1 }}>{points.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/shop')}
            style={{
              padding: '12px 20px', borderRadius: 14, fontWeight: 900, fontSize: 14,
              background: '#7B6EF6', color: 'white',
              border: '3px solid var(--dark-border)', boxShadow: '0 5px 0 var(--dark-border)',
              cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 var(--dark-border)'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 var(--dark-border)'; }}
          >{tr.profile.redeem}</button>
        </div>

        {/* ── Recent achievements ── */}
        <div>
          <SectionHeader
            micro="KAZANILDI"
            title={tr.profile.recentAchievements}
            action={{ label: tr.profile.seeAll, onClick: () => navigate('/achievements') }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {recentAchievements.map(ach => (
              <div
                key={ach.id}
                className="press-card"
                style={{ ...card, padding: '14px 8px', textAlign: 'center' }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{ach.icon}</div>
                <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dark)', margin: 0, lineHeight: 1.2 }}>{ach.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Inventory ── */}
        {activeInventory.length > 0 && (
          <div>
            <SectionHeader
              micro="ENVANTER"
              title={tr.profile.myInventory}
              action={activeInventory.length > 3 ? {
                label: showAllInventory ? 'Daha Az' : `${tr.profile.seeAll} (${activeInventory.length})`,
                onClick: () => setShowAllInventory(!showAllInventory),
              } : undefined}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayedInventory.map(item => {
                const config = typeConfig[item.type];
                const IconComp = config.icon;
                const expired = isExpired(item.expires);
                return (
                  <div key={item.id} style={{ ...card, padding: '16px 18px', opacity: expired ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 14, background: config.bg,
                        border: `2.5px solid ${config.accent}`, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 3px 0 ${config.accent}44`,
                      }}>
                        <IconComp size={22} color={config.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{item.title}</p>
                          {expired ? (
                            <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.1)', border: '1.5px solid #ef4444', fontSize: 9, fontWeight: 900, color: '#ef4444', flexShrink: 0, textTransform: 'uppercase' }}>Doldu</span>
                          ) : (
                            <span style={{ padding: '2px 8px', borderRadius: 999, background: config.bg, border: `1.5px solid ${config.accent}`, fontSize: 9, fontWeight: 900, color: config.color, flexShrink: 0, textTransform: 'capitalize' }}>{item.type}</span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 10px', lineHeight: 1.5 }}>{item.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, padding: '8px 12px', background: 'var(--tab-bg)', borderRadius: 10, border: '2px dashed var(--dark-border)' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '0.1em' }}>{item.code}</span>
                          </div>
                          <button
                            onClick={() => handleCopy(item.code)}
                            disabled={expired}
                            style={{
                              width: 40, height: 40, borderRadius: 10, background: 'var(--tab-bg)',
                              border: `2px solid ${copiedCode === item.code ? '#22c55e' : 'var(--dark-border)'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: expired ? 'not-allowed' : 'pointer', flexShrink: 0,
                              transition: 'all 0.15s',
                            }}
                          >
                            {copiedCode === item.code ? <Check size={16} color="#22c55e" /> : <Copy size={16} color="var(--text-muted)" />}
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8 }}>
                          <Clock size={10} color="var(--text-muted)" />
                          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{tr.profile.expires} {new Date(item.expires).toLocaleDateString('tr-TR')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Activity summary ── */}
        <div>
          <SectionHeader micro="İSTATİSTİKLER" title={tr.profile.activitySummary} />
          <div style={{ ...card, padding: '0 20px' }}>
            {[
              { label: tr.profile.qrScansThisMonth, value: '12', emoji: '📱' },
              { label: tr.profile.gamesPlayed,      value: '47', emoji: '🎮' },
              { label: tr.profile.rewardsRedeemed,  value: '6',  emoji: '🎁' },
              { label: tr.profile.missionsCompleted,value: '23', emoji: '🎯' },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 0',
                borderBottom: i < arr.length - 1 ? '1.5px dashed var(--divider-dash)' : 'none',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span style={{ fontSize: 18 }}>{item.emoji}</span> {item.label}
                </span>
                <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nav links ── */}
        <div>
          <SectionHeader micro="HESAP" title="Ayarlar & Daha Fazla" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              { icon: Target,   label: tr.profile.viewMissions,    path: '/missions',     color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
              { icon: Trophy,   label: tr.profile.viewAchievements, path: '/achievements', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
              { icon: Settings, label: tr.profile.accountSettings,  path: '/settings',    color: '#7B6EF6', bg: 'rgba(123,110,246,0.1)' },
            ].map(item => (
              <button
                key={item.path}
                onClick={() => { playSound('click'); navigate(item.path); }}
                className="press-card"
                style={{ ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', textAlign: 'left' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: item.bg, border: `2px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <item.icon size={18} color={item.color} />
                </div>
                <span style={{ flex: 1, fontWeight: 900, fontSize: 14, color: 'var(--text-dark)' }}>{item.label}</span>
                <ChevronRight size={16} color="var(--text-muted)" />
              </button>
            ))}

            <button
              onClick={() => { playSound('click'); logout().then(() => navigate('/login', { replace: true })).catch(() => navigate('/login', { replace: true })); }}
              style={{
                ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                cursor: 'pointer', border: '3px solid #ef4444', boxShadow: '0 6px 0 #dc2626',
                background: 'rgba(239,68,68,0.05)',
              }}
            >
              <div style={{ width: 42, height: 42, borderRadius: 12, background: '#ef4444', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LogOut size={18} color="white" />
              </div>
              <span style={{ flex: 1, fontWeight: 900, fontSize: 14, color: '#ef4444' }}>{tr.profile.logout}</span>
              <ChevronRight size={16} color="#ef4444" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
