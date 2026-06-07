import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trophy, Zap, Target, Settings, LogOut, ChevronRight, TrendingUp, Calendar, Package, Ticket, Tag, Gift, Check, Copy, Clock, CreditCard as Edit3 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { achievements, inventory } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, points, setIsLoggedIn } = useApp();
  const [showAllInventory, setShowAllInventory] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const completedAchievements = achievements.filter(a => a.completed);

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
  const activeInventory = inventory.filter(i => !i.used);
  const displayedInventory = showAllInventory ? activeInventory : activeInventory.slice(0, 3);
  const recentAchievements = completedAchievements.slice(0, 4);

  const stats = [
    { label: tr.profile.totalPoints, value: user.totalPoints.toLocaleString(), icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', emoji: '⭐' },
    { label: tr.profile.currentLevel, value: `Lv.${user.level}`, icon: TrendingUp, color: '#22c55e', bg: 'rgba(34,197,94,0.12)', emoji: '📈' },
    { label: tr.profile.achievements, value: `${user.achievements}/${user.totalAchievements}`, icon: Trophy, color: '#7B6EF6', bg: 'rgba(123,110,246,0.12)', emoji: '🏆' },
    { label: tr.profile.dayStreak, value: `${user.streak}g`, icon: Zap, color: '#f97316', bg: 'rgba(249,115,22,0.12)', emoji: '🔥' },
  ];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(60px,15vw,200px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>PROFİL</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Profile hero ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
          padding: 'clamp(16px,4vw,28px)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            {/* Avatar */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', border: '4px solid rgba(255,255,255,0.6)', boxShadow: '0 4px 0 rgba(0,0,0,0.2)' }}>
                <img src={user.avatar} alt={user.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <div style={{
                position: 'absolute', bottom: -4, right: -4, width: 28, height: 28,
                borderRadius: '50%', background: '#f59e0b', border: '2.5px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: 'black', fontWeight: 900, fontSize: 11 }}>{user.level}</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                <div>
                  <h1 style={{ color: 'white', fontWeight: 900, fontSize: 24, margin: '0 0 2px', lineHeight: 1 }}>{user.username}</h1>
                  <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: 0, fontWeight: 600 }}>{user.email}</p>
                </div>
                <button onClick={() => { playSound('click'); navigate('/settings'); }} style={{
                  width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.2)',
                  border: '2px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                }}>
                  <Edit3 size={16} color="white" />
                </button>
              </div>

              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 900, color: 'white' }}>
                  Seviye {user.level} • {tr.profile.champion}
                </span>
                <span style={{ padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.35)', fontSize: 11, fontWeight: 900, color: 'white' }}>
                  🔥 {user.streak}g serisi
                </span>
              </div>

              {/* XP bar */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'rgba(255,255,255,0.7)', marginBottom: 5, fontWeight: 700 }}>
                  <span>Lv.{user.level}</span>
                  <span>{user.xp.toLocaleString()} / {user.xpToNext.toLocaleString()} XP</span>
                  <span>Lv.{user.level + 1}</span>
                </div>
                <div style={{ height: 10, borderRadius: 999, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${xpPercent}%`, background: 'white', borderRadius: 999, transition: 'width 0.6s ease' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Join date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, color: 'rgba(255,255,255,0.7)' }}>
            <Calendar size={13} />
            <span style={{ fontSize: 12, fontWeight: 600 }}>
              {new Date(user.joinDate).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })} tarihinden beri üye
            </span>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
          {stats.map(stat => (
            <div key={stat.label} style={{ ...card, padding: '16px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 46, height: 46, borderRadius: 14, background: stat.bg,
                border: `2.5px solid ${stat.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 3px 0 ${stat.color}44`, flexShrink: 0, fontSize: 20,
              }}>{stat.emoji}</div>
              <div>
                <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--text-dark)', margin: '0 0 1px', lineHeight: 1 }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Points card ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(245,158,11,0.15) 0%,rgba(217,119,6,0.1) 100%)',
          border: '3px solid #f59e0b', boxShadow: '0 6px 0 #d97706',
          padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#d97706', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{tr.profile.availablePoints}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Star size={28} fill="#f59e0b" color="#f59e0b" />
              <span style={{ fontSize: 38, fontWeight: 900, color: '#d97706', lineHeight: 1 }}>{points.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => navigate('/redeem')} style={{
            padding: '12px 20px', borderRadius: 14, fontWeight: 900, fontSize: 14,
            background: '#f59e0b', color: 'black',
            border: '3px solid #d97706', boxShadow: '0 5px 0 #d97706',
            cursor: 'pointer', flexShrink: 0, transition: 'transform 0.1s, box-shadow 0.1s',
          }}
            onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 0 #d97706'; }}
            onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #d97706'; }}
          >{tr.profile.redeem}</button>
        </div>

        {/* ── Recent achievements ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0 }}>{tr.profile.recentAchievements}</h2>
            <button onClick={() => navigate('/achievements')} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
              {tr.profile.seeAll} <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {recentAchievements.map(ach => (
              <div key={ach.id} style={{ ...card, padding: '14px 8px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.1s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}>
                <div style={{ fontSize: 26, marginBottom: 5 }}>{ach.icon}</div>
                <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dark)', margin: 0, lineHeight: 1.2 }}>{ach.title}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Inventory ── */}
        {activeInventory.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 17, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Package size={18} color="var(--primary-blue)" /> {tr.profile.myInventory}
              </h2>
              {activeInventory.length > 3 && (
                <button onClick={() => setShowAllInventory(!showAllInventory)} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 900, color: 'var(--primary-blue)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  {showAllInventory ? 'Daha Az' : `${tr.profile.seeAll} (${activeInventory.length})`} <ChevronRight size={14} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {displayedInventory.map(item => {
                const config = typeConfig[item.type];
                const IconComp = config.icon;
                const expired = isExpired(item.expires);
                return (
                  <div key={item.id} style={{ ...card, padding: '16px 18px', opacity: expired ? 0.6 : 1 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                      <div style={{
                        width: 50, height: 50, borderRadius: 14, background: config.bg,
                        border: `2.5px solid ${config.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        boxShadow: `0 3px 0 ${config.accent}44`,
                      }}>
                        <IconComp size={22} color={config.color} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>{item.title}</p>
                          {expired ? (
                            <span style={{ padding: '2px 8px', borderRadius: 999, background: 'rgba(239,68,68,0.12)', border: '1.5px solid #ef4444', fontSize: 9, fontWeight: 900, color: '#ef4444', flexShrink: 0, textTransform: 'uppercase' }}>Son Kullanma Geçti</span>
                          ) : (
                            <span style={{ padding: '2px 8px', borderRadius: 999, background: config.bg, border: `1.5px solid ${config.accent}`, fontSize: 9, fontWeight: 900, color: config.color, flexShrink: 0, textTransform: 'capitalize' }}>{item.type}</span>
                          )}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: 12, margin: '0 0 10px' }}>{item.description}</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, padding: '8px 12px', background: 'var(--tab-bg)', borderRadius: 10, border: '2px dashed var(--dark-border)' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: 13, fontWeight: 900, color: 'var(--text-dark)', letterSpacing: '0.1em' }}>{item.code}</span>
                          </div>
                          <button onClick={() => handleCopy(item.code)} disabled={expired} style={{
                            width: 38, height: 38, borderRadius: 10, background: 'var(--tab-bg)',
                            border: '2px solid var(--dark-border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: expired ? 'not-allowed' : 'pointer', flexShrink: 0,
                          }}>
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
        <div style={{ ...card, padding: '18px 20px' }}>
          <h2 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-dark)', margin: '0 0 14px' }}>{tr.profile.activitySummary}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {[
              { label: tr.profile.qrScansThisMonth, value: '12', emoji: '📱' },
              { label: tr.profile.gamesPlayed, value: '47', emoji: '🎮' },
              { label: tr.profile.rewardsRedeemed, value: '6', emoji: '🎁' },
              { label: tr.profile.missionsCompleted, value: '23', emoji: '🎯' },
            ].map((item, i, arr) => (
              <div key={item.label} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '12px 0', borderBottom: i < arr.length - 1 ? '1.5px dashed var(--dark-border)' : 'none',
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)', fontWeight: 600 }}>
                  <span>{item.emoji}</span> {item.label}
                </span>
                <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Nav links ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { icon: Target, label: tr.profile.viewMissions, path: '/missions', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
            { icon: Trophy, label: tr.profile.viewAchievements, path: '/achievements', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
            { icon: Settings, label: tr.profile.accountSettings, path: '/settings', color: '#7B6EF6', bg: 'rgba(123,110,246,0.1)' },
          ].map(item => (
            <button key={item.path} onClick={() => { playSound('click'); navigate(item.path); }} style={{
              ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
              cursor: 'pointer', transition: 'transform 0.1s, box-shadow 0.1s', textAlign: 'left',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
            >
              <div style={{ width: 40, height: 40, borderRadius: 12, background: item.bg, border: `2px solid ${item.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <item.icon size={18} color={item.color} />
              </div>
              <span style={{ flex: 1, fontWeight: 900, fontSize: 14, color: 'var(--text-dark)' }}>{item.label}</span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </button>
          ))}

          <button onClick={() => { setIsLoggedIn(false); playSound('click'); navigate('/login'); }} style={{
            ...card, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
            cursor: 'pointer', border: '3px solid #ef4444', boxShadow: '0 6px 0 #dc2626',
            background: 'rgba(239,68,68,0.06)',
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: '#ef4444', border: '2px solid #dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={18} color="white" />
            </div>
            <span style={{ flex: 1, fontWeight: 900, fontSize: 14, color: '#ef4444' }}>{tr.profile.logout}</span>
            <ChevronRight size={16} color="#ef4444" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default Profile;
