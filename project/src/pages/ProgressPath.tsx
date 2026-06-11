import React, { useEffect, useRef, useState } from 'react';
import { Lock, Star, Check, Zap, Crown, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { progressLevels } from '../data/mockData';
import { playSound } from '../lib/sounds';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const tiers = [
  { from: 1,  to: 4,  color: '#FFE500', label: 'BEGINNER', emoji: '🌱' },
  { from: 5,  to: 8,  color: '#BFFF00', label: 'WARRIOR',  emoji: '⚔️' },
  { from: 9,  to: 12, color: '#00D1FF', label: 'HERO',     emoji: '🦸' },
  { from: 13, to: 16, color: '#FF6B35', label: 'LEGEND',   emoji: '🔥' },
  { from: 17, to: 99, color: '#FF3CAC', label: 'IMMORTAL', emoji: '👑' },
];

const getTier = (level: number) => tiers.find(t => level >= t.from && level <= t.to) ?? tiers[0];

const illust: Record<number, string> = {
  1: 'https://picsum.photos/seed/lvl1/80/80',
  2: 'https://picsum.photos/seed/lvl2/80/80',
  3: 'https://picsum.photos/seed/lvl3/80/80',
  4: 'https://picsum.photos/seed/lvl4/80/80',
  5: 'https://picsum.photos/seed/lvl5/80/80',
  6: 'https://picsum.photos/seed/lvl6/80/80',
  7: 'https://picsum.photos/seed/lvl7/80/80',
  8: 'https://picsum.photos/seed/lvl8/80/80',
  9: 'https://picsum.photos/seed/lvl9/80/80',
  10: 'https://picsum.photos/seed/lvl10/80/80',
  11: 'https://picsum.photos/seed/lvl11/80/80',
  12: 'https://picsum.photos/seed/lvl12/80/80',
  15: 'https://picsum.photos/seed/lvl15/80/80',
  20: 'https://picsum.photos/seed/lvl20/80/80',
};

/* ── iOS-style circular XP ring ── */
const XpRing: React.FC<{ percent: number; color: string; size?: number }> = ({ percent, color, size = 96 }) => {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;

  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--tab-bg)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.22,1,0.36,1)' }}
      />
    </svg>
  );
};

const ProgressPath: React.FC = () => {
  const { user, points } = useApp();
  const [animateXp, setAnimateXp] = useState(0);
  const [activeTierIdx, setActiveTierIdx] = useState(() => tiers.findIndex(t => user.level >= t.from && user.level <= t.to));
  const [expandedLevel, setExpandedLevel] = useState<number | null>(user.level);
  const currentRef = useRef<HTMLDivElement>(null);

  const xpPercent = Math.round((user.xp / user.xpToNext) * 100);
  const xpRemaining = user.xpToNext - user.xp;
  const unlockedCount = progressLevels.filter(l => l.unlocked).length;
  const currentTier = getTier(user.level);
  const activeTier = tiers[activeTierIdx] ?? currentTier;

  const filteredLevels = progressLevels.filter(
    l => l.level >= activeTier.from && l.level <= activeTier.to,
  );

  useEffect(() => {
    const t = setTimeout(() => setAnimateXp(xpPercent), 200);
    return () => clearTimeout(t);
  }, [xpPercent]);

  useEffect(() => {
    const t = setTimeout(() => {
      currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
    return () => clearTimeout(t);
  }, [activeTierIdx]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <style>{`
        @keyframes xpPulse {
          0%, 100% { box-shadow: 0 0 0 0 ${currentTier.color}55, 0 4px 0 var(--dark-border); }
          50% { box-shadow: 0 0 0 8px ${currentTier.color}00, 0 4px 0 var(--dark-border); }
        }
        .tier-scroll {
          display: flex; gap: 8px; overflow-x: auto; padding: 2px 2px 6px;
          -webkit-overflow-scrolling: touch; scroll-snap-type: x mandatory;
          scrollbar-width: none;
        }
        .tier-scroll::-webkit-scrollbar { display: none; }
        .tier-pill { scroll-snap-align: center; flex-shrink: 0; }
        .level-row:active { background: var(--tab-bg); }
      `}</style>

      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%) rotate(-5deg)',
          fontSize: 'clamp(55px,14vw,200px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.035, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>SEVİYE</div>
      </div>

      <div
        className="page-enter p-3 sm:p-4 max-w-lg mx-auto overflow-x-hidden"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 8 }}
      >
        {/* ── Header ── */}
        <div>
          <p className="section-label">⚡ SEVİYE SİSTEMİ</p>
          <h1 className="section-title" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>İlerleme Yolu</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '4px 0 0' }}>
            Seviye atla, ödülleri aç
          </p>
        </div>

        {/* ── Hero widget (iOS Fitness-style) ── */}
        <div style={{ ...card, overflow: 'hidden' }}>
          <div style={{
            padding: '18px 20px',
            background: `linear-gradient(135deg, ${currentTier.color}22 0%, transparent 60%)`,
            borderBottom: '2px solid var(--dark-border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ position: 'relative', width: 96, height: 96 }}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <XpRing percent={animateXp} color={currentTier.color} />
                </div>
                <div style={{
                  position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontWeight: 900, fontSize: 28, color: 'var(--text-dark)', lineHeight: 1 }}>{user.level}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>SEVİYE</span>
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  background: currentTier.color, color: '#000',
                  border: '2px solid var(--dark-border)', borderRadius: 999,
                  padding: '3px 10px', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em',
                  marginBottom: 8, boxShadow: '0 2px 0 var(--dark-border)',
                }}>
                  {currentTier.emoji} {currentTier.label}
                </div>
                <p style={{ fontWeight: 900, fontSize: 20, color: 'var(--text-dark)', margin: '0 0 4px', lineHeight: 1.1 }}>
                  Şampiyon
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, fontWeight: 600, lineHeight: 1.4 }}>
                  <Zap size={12} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 3 }} color="#f59e0b" />
                  {xpRemaining.toLocaleString()} XP → Lv.{user.level + 1}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '14px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-dark)' }}>
                {user.xp.toLocaleString()} XP
              </span>
              <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-muted)' }}>
                {user.xpToNext.toLocaleString()} XP
              </span>
            </div>
            <div style={{
              height: 12, borderRadius: 999, background: 'var(--tab-bg)',
              border: '2.5px solid var(--dark-border)', overflow: 'hidden',
              boxShadow: '0 2px 0 var(--dark-border)',
            }}>
              <div style={{
                height: '100%', borderRadius: 999, width: `${animateXp}%`,
                background: currentTier.color,
                transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </div>
            <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', margin: '8px 0 0' }}>
              %{animateXp} tamamlandı
            </p>
          </div>
        </div>

        {/* ── Stats chips ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { emoji: '⚡', value: user.xp.toLocaleString(), label: 'Toplam XP', accent: '#FFE500' },
            { emoji: '⭐', value: points.toLocaleString(), label: 'Puanlar', accent: '#BFFF00' },
            { emoji: '🏆', value: unlockedCount, label: 'Açılan', accent: '#7B6EF6' },
          ].map(s => (
            <div
              key={s.label}
              className="press-card"
              style={{
                ...card, padding: '12px 8px', textAlign: 'center', borderRadius: 16,
                boxShadow: '0 4px 0 var(--dark-border)',
              }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 10, margin: '0 auto 6px',
                background: `${s.accent}22`, border: `2px solid ${s.accent}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
              }}>{s.emoji}</div>
              <p style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 1px', lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: 9, color: 'var(--text-muted)', margin: 0, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Tier picker (iOS segmented scroll) ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 8px', paddingLeft: 2 }}>
            Kategori
          </p>
          <div className="tier-scroll">
            {tiers.map((t, i) => {
              const active = i === activeTierIdx;
              const inTier = user.level >= t.from && user.level <= t.to;
              return (
                <button
                  key={t.label}
                  className="tier-pill press-card"
                  onClick={() => { playSound('click'); setActiveTierIdx(i); }}
                  style={{
                    padding: '10px 16px', borderRadius: 14, cursor: 'pointer',
                    background: active ? t.color : 'var(--card-bg)',
                    border: `2.5px solid ${active ? 'var(--dark-border)' : 'var(--dark-border)'}`,
                    boxShadow: active ? '0 4px 0 var(--dark-border)' : '0 2px 0 var(--dark-border)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: active ? 1 : 0.85,
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{t.emoji}</span>
                  <span style={{ fontWeight: 900, fontSize: 12, color: active ? '#000' : 'var(--text-dark)', letterSpacing: '0.04em' }}>
                    {t.label}
                  </span>
                  {inTier && !active && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4, width: 8, height: 8,
                      borderRadius: '50%', background: t.color, border: '1.5px solid var(--dark-border)',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Level list (iOS grouped list) ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div>
              <p className="section-label">{activeTier.emoji} {activeTier.label}</p>
              <h2 className="section-title" style={{ fontSize: 18 }}>Seviye Ödülleri</h2>
            </div>
            <span style={{
              fontSize: 10, fontWeight: 900, padding: '4px 10px',
              background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
              borderRadius: 999, color: 'var(--text-muted)',
            }}>
              {filteredLevels.filter(l => l.unlocked).length}/{filteredLevels.length}
            </span>
          </div>

          <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
            {filteredLevels.map((lvl, i) => {
              const tier = getTier(lvl.level);
              const isCurrent = lvl.level === user.level;
              const isExpanded = expandedLevel === lvl.level;
              const prog = Math.min(100, Math.round((user.xp / Math.max(1, lvl.xpRequired)) * 100));

              return (
                <div
                  key={lvl.level}
                  ref={isCurrent ? currentRef : undefined}
                  className="level-row"
                  onClick={() => {
                    playSound('click');
                    setExpandedLevel(isExpanded ? null : lvl.level);
                  }}
                  style={{
                    display: 'flex', alignItems: 'stretch', gap: 0, cursor: 'pointer',
                    borderBottom: i < filteredLevels.length - 1 ? '2px solid var(--dark-border)' : 'none',
                    background: isCurrent ? `${tier.color}10` : 'transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 56, flexShrink: 0, position: 'relative', overflow: 'hidden',
                    borderRight: '2px solid var(--dark-border)',
                    opacity: !lvl.unlocked && !isCurrent ? 0.5 : 1,
                  }}>
                    <img
                      src={illust[lvl.level] ?? `https://picsum.photos/seed/lvlx${lvl.level}/80/80`}
                      alt=""
                      style={{
                        width: '100%', height: '100%', minHeight: 64, objectFit: 'cover', display: 'block',
                        filter: !lvl.unlocked ? 'grayscale(60%)' : 'none',
                      }}
                    />
                    {lvl.unlocked && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.35)',
                      }}>
                        <Check size={18} color="#BFFF00" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, padding: '12px 14px', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                          <span style={{
                            fontWeight: 900, fontSize: 13,
                            background: isCurrent ? tier.color : 'var(--tab-bg)',
                            color: isCurrent ? '#000' : 'var(--text-dark)',
                            border: '2px solid var(--dark-border)', borderRadius: 8,
                            padding: '1px 7px', lineHeight: 1.4,
                          }}>
                            Lv.{lvl.level}
                          </span>
                          {isCurrent && (
                            <span style={{
                              fontSize: 9, fontWeight: 900, color: tier.color,
                              letterSpacing: '0.06em',
                            }}>● ŞU AN</span>
                          )}
                          {!lvl.unlocked && (
                            <Lock size={11} color="var(--text-muted)" />
                          )}
                        </div>
                        <p style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>
                          {lvl.title}
                        </p>
                        <p style={{
                          fontSize: 11, margin: 0, fontWeight: 600,
                          color: lvl.unlocked ? '#22c55e' : 'var(--text-muted)',
                        }}>
                          {lvl.unlocked ? `✓ ${lvl.reward}` : `${lvl.xpRequired.toLocaleString()} XP gerekli`}
                        </p>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                        {lvl.rewardPoints > 0 && (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 3,
                            background: '#FFE500', border: '2px solid var(--dark-border)',
                            borderRadius: 999, padding: '2px 8px',
                            boxShadow: '0 2px 0 var(--dark-border)',
                          }}>
                            <Star size={10} fill="#000" color="#000" />
                            <span style={{ fontWeight: 900, fontSize: 11, color: '#000' }}>+{lvl.rewardPoints}</span>
                          </div>
                        )}
                        <ChevronRight
                          size={14}
                          color="var(--text-muted)"
                          style={{ transform: isExpanded ? 'rotate(90deg)' : '', transition: 'transform 0.2s' }}
                        />
                      </div>
                    </div>

                    {/* Mini progress for locked */}
                    {!lvl.unlocked && prog > 0 && (
                      <div style={{ marginTop: 8 }}>
                        <div style={{
                          height: 6, borderRadius: 999, background: 'var(--tab-bg)',
                          border: '1.5px solid var(--dark-border)', overflow: 'hidden',
                        }}>
                          <div style={{ height: '100%', width: `${prog}%`, background: tier.color, borderRadius: 999 }} />
                        </div>
                      </div>
                    )}

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div style={{
                        marginTop: 10, padding: '10px 12px', borderRadius: 12,
                        background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
                        animation: 'none',
                      }}>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5, fontWeight: 600 }}>
                          {lvl.unlocked
                            ? `Bu seviyeyi tamamladın ve "${lvl.reward}" ödülünü kazandın.`
                            : `Bu seviyeye ulaşmak için ${lvl.xpRequired.toLocaleString()} XP biriktirmen gerekiyor.`}
                          {lvl.rewardPoints > 0 && ` Ayrıca +${lvl.rewardPoints} bonus puan kazanırsın.`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {filteredLevels.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                  Bu kategoride henüz seviye yok.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Max level cap ── */}
        <div
          className="press-card"
          style={{
            ...card, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
            border: '3px solid #FF3CAC', boxShadow: '0 5px 0 #FF3CAC',
          }}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: '#FF3CAC', border: '2.5px solid var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 3px 0 var(--dark-border)',
          }}>
            <Crown size={22} color="white" fill="white" />
          </div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: 0 }}>Maksimum Seviye</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0', fontWeight: 600 }}>
              Efsane ol. Tarihe geç. 👑
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressPath;
