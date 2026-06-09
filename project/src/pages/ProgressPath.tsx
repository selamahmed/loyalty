import React, { useState, useEffect } from 'react';
import { Lock, Star, Check, Zap, Trophy, Crown, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { progressLevels } from '../data/mockData';

/* ── Tier config (solid colors only, NO gradients) ── */
const tiers = [
  { from: 1,  to: 4,  color: '#FFE500', bg: '#fffbe0', label: 'BEGINNER',  img: 'https://picsum.photos/seed/tier1p/280/140', emoji: '🌱' },
  { from: 5,  to: 8,  color: '#BFFF00', bg: '#f0ffe0', label: 'WARRIOR',   img: 'https://picsum.photos/seed/tier2p/280/140', emoji: '⚔️' },
  { from: 9,  to: 12, color: '#00D1FF', bg: '#e0f9ff', label: 'HERO',      img: 'https://picsum.photos/seed/tier3p/280/140', emoji: '🦸' },
  { from: 13, to: 16, color: '#FF6B35', bg: '#fff0eb', label: 'LEGEND',    img: 'https://picsum.photos/seed/tier4p/280/140', emoji: '🔥' },
  { from: 17, to: 99, color: '#FF3CAC', bg: '#ffe0f5', label: 'IMMORTAL',  img: 'https://picsum.photos/seed/tier5p/280/140', emoji: '👑' },
];

const getTier = (level: number) => tiers.find(t => level >= t.from && level <= t.to) ?? tiers[0];

const illust: Record<number, string> = {
  1:  'https://picsum.photos/seed/lvl1/80/80',
  2:  'https://picsum.photos/seed/lvl2/80/80',
  3:  'https://picsum.photos/seed/lvl3/80/80',
  4:  'https://picsum.photos/seed/lvl4/80/80',
  5:  'https://picsum.photos/seed/lvl5/80/80',
  6:  'https://picsum.photos/seed/lvl6/80/80',
  7:  'https://picsum.photos/seed/lvl7/80/80',
  8:  'https://picsum.photos/seed/lvl8/80/80',
  9:  'https://picsum.photos/seed/lvl9/80/80',
  10: 'https://picsum.photos/seed/lvl10/80/80',
  11: 'https://picsum.photos/seed/lvl11/80/80',
  12: 'https://picsum.photos/seed/lvl12/80/80',
  15: 'https://picsum.photos/seed/lvl15/80/80',
  20: 'https://picsum.photos/seed/lvl20/80/80',
};

/* ── Floating sticker component ── */
const FloatSticker: React.FC<{ emoji: string; style?: React.CSSProperties }> = ({ emoji, style }) => (
  <div style={{
    position: 'absolute', fontSize: 'clamp(28px,5vw,42px)', lineHeight: 1,
    animation: 'floatBob 3s ease-in-out infinite',
    userSelect: 'none', pointerEvents: 'none',
    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.25))',
    ...style,
  }}>{emoji}</div>
);

const ProgressPath: React.FC = () => {
  const { user, points } = useApp();
  const [animateXp, setAnimateXp] = useState(0);
  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const unlockedCount = progressLevels.filter(l => l.unlocked).length;
  const currentTier = getTier(user.level);

  useEffect(() => {
    const t = setTimeout(() => setAnimateXp(xpPercent), 300);
    return () => clearTimeout(t);
  }, [xpPercent]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--bg-color)' }}>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes floatBob {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50%       { transform: translateY(-14px) rotate(4deg); }
        }
        @keyframes floatBobAlt {
          0%, 100% { transform: translateY(0px) rotate(5deg); }
          50%       { transform: translateY(-10px) rotate(-5deg); }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(123,110,246,0.55), 0 6px 0 #000; }
          60%  { box-shadow: 0 0 0 14px rgba(123,110,246,0), 0 6px 0 #000; }
          100% { box-shadow: 0 0 0 0 rgba(123,110,246,0), 0 6px 0 #000; }
        }
        @keyframes stampIn {
          0%   { transform: scale(2) rotate(-20deg); opacity: 0; }
          70%  { transform: scale(0.92) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes xpFill {
          from { width: 0%; }
        }
        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.33%); }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateX(-18px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .progress-level-card { animation: cardSlideIn 0.35s ease-out both; }
        .stamp-overlay { animation: stampIn 0.45s cubic-bezier(0.2,0.8,0.3,1.2) both; }
      `}</style>

      {/* ── Ghost watermark ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%) rotate(-5deg)', fontSize: 'clamp(55px,14vw,200px)', fontWeight: 900, color: 'var(--dark-border)', opacity: 0.035, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em' }}>SEVİYE YOL</div>
      </div>

      {/* ── Floating stickers (fixed decorative) ── */}
      <FloatSticker emoji="⚡" style={{ top: '8%', right: '4%', animationDelay: '0s', zIndex: 0 }} />
      <FloatSticker emoji="🏆" style={{ top: '18%', left: '2%', animationDelay: '1.2s', animationName: 'floatBobAlt', zIndex: 0 }} />
      <FloatSticker emoji="⭐" style={{ top: '38%', right: '2%', animationDelay: '0.6s', zIndex: 0 }} />
      <FloatSticker emoji="🎮" style={{ top: '58%', left: '1%', animationDelay: '1.8s', animationName: 'floatBobAlt', zIndex: 0 }} />

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, animation: 'slideUp 0.4s ease-out both' }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: '#FFE500', border: '3px solid #000', boxShadow: '0 4px 0 #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
          }}>🗺️</div>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#000', color: '#FFE500', borderRadius: 999, padding: '2px 10px', fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', marginBottom: 4 }}>
              ⚡ SEVİYE SİSTEMİ
            </div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1, letterSpacing: '-0.03em' }}>İlerleme Yolu</h1>
          </div>
        </div>

        {/* ── Hero — current level card (NO gradient) ── */}
        <div style={{
          border: '3px solid #000', boxShadow: '0 8px 0 #000', borderRadius: 20,
          overflow: 'hidden', animation: 'slideUp 0.45s ease-out 0.05s both',
        }}>
          {/* Cover image */}
          <div style={{ position: 'relative', height: 130, overflow: 'hidden' }}>
            <img
              src={currentTier.img}
              alt="level"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', filter: 'brightness(0.45) saturate(1.2)' }}
            />
            {/* Solid color overlay strip — no gradient */}
            <div style={{ position: 'absolute', inset: 0, background: currentTier.color, opacity: 0.4 }} />

            {/* Big level badge */}
            <div style={{
              position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
              background: '#000', color: currentTier.color, borderRadius: 16,
              padding: '10px 18px', border: `3px solid ${currentTier.color}`,
              boxShadow: `0 5px 0 ${currentTier.color}`,
            }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 900, margin: '0 0 1px', letterSpacing: '0.15em', textTransform: 'uppercase' }}>Mevcut Seviye</p>
              <p style={{ fontSize: 42, fontWeight: 900, margin: 0, lineHeight: 1, color: currentTier.color }}>
                {user.level}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, margin: '2px 0 0', fontWeight: 900, letterSpacing: '0.04em' }}>Şampiyon</p>
            </div>

            {/* Tier label top-right */}
            <div style={{
              position: 'absolute', top: 12, right: 12,
              background: currentTier.color, color: '#000',
              border: '2.5px solid #000', borderRadius: 999,
              padding: '3px 12px', fontSize: 11, fontWeight: 900, letterSpacing: '0.1em',
            }}>
              {currentTier.emoji} {currentTier.label}
            </div>
          </div>

          {/* XP progress section */}
          <div style={{ padding: '16px 20px', background: 'var(--card-bg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}>
                <Zap size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} color="#f59e0b" />
                {user.xp.toLocaleString()} XP
              </span>
              <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-muted)' }}>{user.xpToNext.toLocaleString()} XP</span>
            </div>
            {/* Chunky segmented progress bar */}
            <div style={{ height: 16, borderRadius: 999, background: 'var(--tab-bg)', border: '3px solid #000', overflow: 'hidden', boxShadow: '0 3px 0 #000', position: 'relative' }}>
              <div style={{
                height: '100%', borderRadius: 999,
                width: `${animateXp}%`,
                background: currentTier.color,
                transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
                position: 'relative',
              }}>
                {/* Shimmer bar */}
                <div style={{ position: 'absolute', inset: 0, borderRadius: 999, background: 'linear-gradient(90deg, transparent 30%, rgba(255,255,255,0.35) 50%, transparent 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.8s linear infinite' }} />
              </div>
              {/* Tick marks */}
              {[25, 50, 75].map(pct => (
                <div key={pct} style={{ position: 'absolute', left: `${pct}%`, top: 0, bottom: 0, width: 2, background: 'rgba(0,0,0,0.2)', transform: 'translateX(-50%)' }} />
              ))}
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5, fontWeight: 700, textAlign: 'center' }}>
              {(user.xpToNext - user.xp).toLocaleString()} XP → Level {user.level + 1} için
            </p>
          </div>
        </div>

        {/* ── Stats row (solid colors, NO gradients) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, animation: 'slideUp 0.45s ease-out 0.1s both' }}>
          {[
            { emoji: '⚡', value: user.xp.toLocaleString(), label: 'Toplam XP',    color: '#000', bg: '#FFE500' },
            { emoji: '⭐', value: points.toLocaleString(),   label: 'Puanlar',      color: '#000', bg: '#BFFF00' },
            { emoji: '🏆', value: unlockedCount,             label: 'Seviye Geçti', color: '#fff', bg: '#000'   },
          ].map(s => (
            <div key={s.label} style={{
              border: '3px solid #000', boxShadow: '0 5px 0 #000', borderRadius: 16,
              padding: '14px 10px', textAlign: 'center', background: s.bg,
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 0 #000'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '0 5px 0 #000'; }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 18, color: s.color, margin: '0 0 2px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 9, color: s.color, margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.7 }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Scrolling tier ticker ── */}
        <div style={{ border: '3px solid #000', borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 0 #000', animation: 'slideUp 0.45s ease-out 0.15s both' }}>
          <div style={{ display: 'flex', animation: 'tickerScroll 12s linear infinite', whiteSpace: 'nowrap' }}>
            {[...tiers, ...tiers, ...tiers].map((t, i) => (
              <div key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px',
                background: t.color, borderRight: '2px solid #000',
                fontWeight: 900, fontSize: 12, color: '#000', letterSpacing: '0.08em', flexShrink: 0,
              }}>
                {t.emoji} {t.label} ◆
              </div>
            ))}
          </div>
        </div>

        {/* ── Level timeline ── */}
        <div style={{ animation: 'slideUp 0.45s ease-out 0.2s both' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.03em' }}>Seviye Ödülleri</h2>
            <span style={{ fontSize: 10, fontWeight: 900, padding: '3px 10px', background: '#000', color: '#FFE500', borderRadius: 999, letterSpacing: '0.08em' }}>
              {unlockedCount}/{progressLevels.length} AÇILDI
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            {/* Bold vertical line */}
            <div style={{
              position: 'absolute', left: 23, top: 0, bottom: 0, width: 4,
              background: '#000', borderRadius: 2, zIndex: 0,
            }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {progressLevels.map((lvl, i) => {
                const tier = getTier(lvl.level);
                const isCurrentLevel = lvl.level === user.level;
                const prog = Math.min(100, Math.round((user.xp / Math.max(1, lvl.xpRequired)) * 100));

                return (
                  <div
                    key={lvl.level}
                    className="progress-level-card"
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14, paddingLeft: 4,
                      animationDelay: `${0.22 + i * 0.05}s`,
                    }}
                  >
                    {/* ── Node circle ── */}
                    <div style={{
                      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                      background: lvl.unlocked ? tier.color : 'var(--tab-bg)',
                      border: '3px solid #000',
                      boxShadow: isCurrentLevel
                        ? '0 0 0 0 rgba(123,110,246,0.55), 0 4px 0 #000'
                        : '0 4px 0 #000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      position: 'relative', zIndex: 1,
                      animation: isCurrentLevel ? 'pulseRing 1.8s ease-in-out infinite' : 'none',
                    }}>
                      {lvl.unlocked
                        ? <span style={{ fontWeight: 900, fontSize: 14, color: '#000' }}>{lvl.level}</span>
                        : <Lock size={14} color="var(--text-muted)" />
                      }
                    </div>

                    {/* ── Main card ── */}
                    <div style={{
                      flex: 1,
                      border: `3px solid ${isCurrentLevel ? tier.color : '#000'}`,
                      boxShadow: isCurrentLevel ? `0 6px 0 ${tier.color}` : '0 6px 0 #000',
                      borderRadius: 18,
                      background: 'var(--card-bg)',
                      overflow: 'hidden',
                      opacity: !lvl.unlocked && prog === 0 && !isCurrentLevel ? 0.65 : 1,
                      transition: 'transform 0.1s',
                      filter: !lvl.unlocked && prog === 0 ? 'grayscale(40%)' : 'none',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ''; }}
                    >
                      {/* Colour top bar */}
                      <div style={{ height: 6, background: tier.color, borderBottom: '2.5px solid #000' }} />

                      <div style={{ display: 'flex', gap: 0 }}>
                        {/* Illustration thumbnail */}
                        <div style={{ width: 70, flexShrink: 0, position: 'relative', borderRight: '2.5px solid #000', overflow: 'hidden' }}>
                          <img
                            src={illust[lvl.level] ?? `https://picsum.photos/seed/lvlx${lvl.level}/80/80`}
                            alt={`Level ${lvl.level}`}
                            style={{
                              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
                              filter: !lvl.unlocked ? 'grayscale(80%) brightness(0.7)' : 'brightness(0.75) saturate(1.1)',
                            }}
                          />
                          {/* Completed stamp */}
                          {lvl.unlocked && !isCurrentLevel && (
                            <div className="stamp-overlay" style={{
                              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(0,0,0,0.45)',
                              animationDelay: `${0.35 + i * 0.06}s`,
                            }}>
                              <div style={{
                                border: '2.5px solid #BFFF00', borderRadius: 8,
                                padding: '3px 6px', color: '#BFFF00',
                                fontSize: 8, fontWeight: 900, letterSpacing: '0.06em',
                                textTransform: 'uppercase', transform: 'rotate(-12deg)',
                                textShadow: '0 1px 3px rgba(0,0,0,0.6)',
                              }}>✓ TAMAM</div>
                            </div>
                          )}
                          {/* Current level pulse overlay */}
                          {isCurrentLevel && (
                            <div style={{ position: 'absolute', inset: 0, background: `${tier.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div style={{ fontSize: 22 }}>⚡</div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ flex: 1, padding: '10px 14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 2, flexWrap: 'wrap' }}>
                                <span style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', letterSpacing: '-0.02em' }}>Lv.{lvl.level}</span>
                                <span style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-muted)' }}>— {lvl.title}</span>
                                {isCurrentLevel && (
                                  <span style={{
                                    padding: '2px 7px', borderRadius: 999,
                                    background: tier.color, color: '#000',
                                    fontSize: 9, fontWeight: 900, letterSpacing: '0.08em',
                                    border: '1.5px solid #000',
                                  }}>⚡ ŞU AN</span>
                                )}
                              </div>
                              {lvl.unlocked ? (
                                <p style={{ fontSize: 11, color: '#22c55e', margin: 0, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                                  <Check size={11} /> {lvl.reward}
                                </p>
                              ) : (
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontWeight: 600 }}>
                                  {lvl.xpRequired.toLocaleString()} XP gerekli
                                </p>
                              )}
                            </div>
                            {lvl.rewardPoints > 0 && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0,
                                background: '#FFE500', border: '2px solid #000', borderRadius: 999,
                                padding: '3px 8px', boxShadow: '0 2px 0 #000',
                              }}>
                                <Star size={11} fill="#000" color="#000" />
                                <span style={{ fontWeight: 900, fontSize: 12, color: '#000' }}>+{lvl.rewardPoints}</span>
                              </div>
                            )}
                          </div>

                          {/* Progress bar for locked levels */}
                          {!lvl.unlocked && prog > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: 'var(--text-muted)', marginBottom: 3, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                <span>İlerleme</span><span>{prog}%</span>
                              </div>
                              <div style={{ height: 8, borderRadius: 999, background: 'var(--tab-bg)', border: '2px solid #000', overflow: 'hidden', boxShadow: '0 2px 0 #000' }}>
                                <div style={{
                                  height: '100%', borderRadius: 999, width: `${prog}%`,
                                  background: tier.color, transition: 'width 0.8s ease',
                                }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* ── End cap ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 4 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: '#FF3CAC', border: '3px solid #000', boxShadow: '0 4px 0 #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1, position: 'relative',
                }}>
                  <Crown size={20} color="#fff" fill="#fff" />
                </div>
                <div style={{
                  flex: 1, border: '3px solid #FF3CAC', boxShadow: '0 5px 0 #FF3CAC',
                  borderRadius: 16, padding: '12px 16px',
                  background: 'var(--card-bg)', display: 'flex', alignItems: 'center', gap: 10,
                }}>
                  <div style={{ fontSize: 28 }}>👑</div>
                  <div>
                    <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: 0 }}>Maksimum Seviye</p>
                    <p style={{ fontSize: 11, color: '#c026d3', margin: '2px 0 0', fontWeight: 700 }}>Efsane ol. Tarihe geç.</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProgressPath;
