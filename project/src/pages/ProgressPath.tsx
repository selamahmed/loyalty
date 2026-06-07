import React from 'react';
import { Lock, Star, Zap, Trophy, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { progressLevels } from '../data/mockData';
import { tr } from '../lib/tr';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const levelGradients: Record<number, string> = {
  1:  'linear-gradient(135deg,#9ca3af,#6b7280)',
  2:  'linear-gradient(135deg,#4ade80,#16a34a)',
  5:  'linear-gradient(135deg,#60a5fa,#0ea5e9)',
  8:  'linear-gradient(135deg,#fbbf24,#f97316)',
  10: 'linear-gradient(135deg,#7B6EF6,#4F8EF7)',
  15: 'linear-gradient(135deg,#f472b6,#f43f5e)',
  20: 'linear-gradient(135deg,#facc15,#f59e0b)',
};

const getLevelGradient = (level: number) => {
  const keys = Object.keys(levelGradients).map(Number).sort((a, b) => b - a);
  const key = keys.find(k => k <= level) ?? 1;
  return levelGradients[key];
};

const ProgressPath: React.FC = () => {
  const { user, points } = useApp();
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const unlockedCount = progressLevels.filter(l => l.unlocked).length;

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>SEVİYE YOL</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#a78bfa,#6d28d9)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🗺️</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>İlerleme Yolu</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Seviyeleri geç, ödül kazan</p>
          </div>
        </div>

        {/* ── Current level hero ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,var(--gradient-start) 0%,var(--gradient-end) 100%)',
          padding: 'clamp(16px,4vw,28px)', position: 'relative', overflow: 'hidden',
          color: 'white',
        }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 16, position: 'relative' }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 700, margin: '0 0 2px' }}>Mevcut Seviye</p>
              <h2 style={{ color: 'white', fontWeight: 900, fontSize: 32, margin: '0 0 2px', lineHeight: 1 }}>Level {user.level}</h2>
              <p style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: 14, margin: 0 }}>Şampiyon</p>
            </div>
            <div style={{
              width: 70, height: 70, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 0 rgba(0,0,0,0.2)', flexShrink: 0,
            }}>
              <span style={{ fontWeight: 900, fontSize: 28, color: 'white' }}>{user.level}</span>
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: 700 }}>
              <span>{user.xp.toLocaleString()} XP</span>
              <span>{user.xpToNext.toLocaleString()} XP</span>
            </div>
            <div style={{ height: 12, borderRadius: 999, background: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.3)', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${xpPercent}%`, background: 'white', borderRadius: 999, transition: 'width 0.6s ease' }} />
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 5, fontWeight: 600 }}>
              {(user.xpToNext - user.xp).toLocaleString()} XP — Level {user.level + 1} için
            </p>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
          {[
            { emoji: '⚡', value: user.xp.toLocaleString(), label: 'Toplam XP', color: '#f59e0b' },
            { emoji: '⭐', value: points.toLocaleString(), label: 'Puanlar', color: '#7B6EF6' },
            { emoji: '🏆', value: unlockedCount, label: 'Seviye Geçildi', color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{ ...card, padding: '14px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 16, color: s.color, margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 10, color: 'var(--text-muted)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Progress path ── */}
        <div>
          <h2 style={{ fontWeight: 900, fontSize: 17, color: 'var(--text-dark)', margin: '0 0 16px' }}>Seviye Ödülleri</h2>
          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: 22, top: 0, bottom: 0, width: 2, background: 'var(--dark-border)', opacity: 0.25 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {progressLevels.map((lvl, i) => {
                const isCurrentLevel = lvl.level === user.level;
                const gradient = getLevelGradient(lvl.level);
                const prog = Math.min(100, Math.round((user.xp / lvl.xpRequired) * 100));
                return (
                  <div
                    key={lvl.level}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 14, paddingLeft: 4, opacity: lvl.unlocked ? 1 : 0.65 }}
                  >
                    {/* Node */}
                    <div style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      background: lvl.unlocked ? gradient : 'var(--tab-bg)',
                      border: isCurrentLevel ? '3px solid var(--primary-blue)' : '3px solid var(--dark-border)',
                      boxShadow: isCurrentLevel ? '0 0 0 4px rgba(123,110,246,0.25)' : '0 3px 0 var(--dark-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1,
                    }}>
                      {lvl.unlocked ? (
                        <span style={{ fontWeight: 900, fontSize: 13, color: 'white' }}>{lvl.level}</span>
                      ) : (
                        <Lock size={13} color="var(--text-muted)" />
                      )}
                    </div>

                    {/* Card */}
                    <div style={{
                      flex: 1,
                      ...card,
                      border: isCurrentLevel ? '3px solid var(--primary-blue)' : '3px solid var(--dark-border)',
                      boxShadow: isCurrentLevel ? '0 6px 0 var(--primary-blue)' : '0 6px 0 var(--dark-border)',
                      padding: '12px 16px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: lvl.unlocked ? 0 : 8 }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                            <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0 }}>Lv.{lvl.level} — {lvl.title}</p>
                            {isCurrentLevel && (
                              <span style={{ padding: '2px 7px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', fontSize: 9, fontWeight: 900, flexShrink: 0, textTransform: 'uppercase' }}>ŞU AN</span>
                            )}
                          </div>
                          {lvl.unlocked ? (
                            <p style={{ fontSize: 11, color: '#22c55e', margin: 0, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                              <Check size={11} /> Ödül: {lvl.reward}
                            </p>
                          ) : (
                            <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                              Kilit açmak için {lvl.xpRequired.toLocaleString()} XP gerekli
                            </p>
                          )}
                        </div>
                        {lvl.rewardPoints > 0 && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                            <Star size={12} fill="#f59e0b" color="#f59e0b" />
                            <span style={{ fontWeight: 900, fontSize: 13, color: '#f59e0b' }}>+{lvl.rewardPoints}</span>
                          </div>
                        )}
                      </div>
                      {!lvl.unlocked && (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginBottom: 4, fontWeight: 700 }}>
                            <span>İlerleme</span>
                            <span>{prog}%</span>
                          </div>
                          <div style={{ height: 7, borderRadius: 999, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%', borderRadius: 999, width: `${prog}%`,
                              background: gradient, transition: 'width 0.5s ease',
                            }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPath;
