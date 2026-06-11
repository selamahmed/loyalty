import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { progressLevels } from '../data/mockData';
import { playSound } from '../lib/sounds';

/* ─── Per-level flat colors ─── */
const LEVEL_COLOR: Record<number, string> = {
  1:  '#FFE500',
  2:  '#FF5722',
  3:  '#4CAF50',
  4:  '#2196F3',
  5:  '#FF9800',
  6:  '#9C27B0',
  7:  '#F44336',
  8:  '#00BCD4',
  9:  '#FFEB3B',
  10: '#8BC34A',
  11: '#E91E63',
  12: '#03A9F4',
  13: '#FF5722',
  14: '#43A047',
  15: '#1565C0',
  16: '#AD1457',
  17: '#E65100',
  18: '#558B2F',
  19: '#1A237E',
  20: '#880E4F',
};
const getLevelColor = (level: number) =>
  LEVEL_COLOR[level] ?? ['#FFE500','#FF5722','#4CAF50','#2196F3','#FF9800'][level % 5];

/* ─── Tier zones ─── */
const TIERS = [
  { from: 1,  to: 4,  label: 'BEGINNER', emoji: '🌱', color: '#FFE500' },
  { from: 5,  to: 8,  label: 'WARRIOR',  emoji: '⚔️', color: '#4CAF50' },
  { from: 9,  to: 12, label: 'HERO',     emoji: '🦸', color: '#2196F3' },
  { from: 13, to: 16, label: 'LEGEND',   emoji: '🔥', color: '#FF5722' },
  { from: 17, to: 99, label: 'IMMORTAL', emoji: '👑', color: '#E91E63' },
];
const getTier = (level: number) => TIERS.find(t => level >= t.from && level <= t.to) ?? TIERS[0];

/* ─── Node zigzag x-positions ─── */
const NODE_X = [150, 255, 150, 45, 150, 255, 150, 45, 150, 255, 150, 45, 150, 150];
const NODE_SPACING = 120;
const PATH_W = 320;

/* ─── Decorative stickers between nodes ─── */
const DECOS = ['★', '♦', '●', '▲', '★', '♦', '●', '▲', '★', '♦', '●', '▲', '★'];

/* ─── XP progress bar ─── */
const XpBar: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <div style={{
    height: 18, borderRadius: 6, background: 'var(--tab-bg)',
    border: '3px solid #000', boxShadow: '3px 3px 0 #000',
    overflow: 'hidden', position: 'relative',
  }}>
    <div style={{
      height: '100%', width: `${pct}%`, background: color,
      borderRadius: 3,
      transition: 'width 1.2s cubic-bezier(0.22,1,0.36,1)',
    }} />
    <span style={{
      position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontWeight: 900, fontSize: 10, color: '#000',
      mixBlendMode: 'multiply', letterSpacing: '0.06em',
    }}>
      %{pct} TAMAMLANDI
    </span>
  </div>
);

/* ─── Level node card ─── */
const LevelNode: React.FC<{
  lvl: typeof progressLevels[0];
  posX: number;
  isCurrent: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ lvl, posX, isCurrent, isSelected, onClick }) => {
  const color = getLevelColor(lvl.level);
  const size = isCurrent ? 82 : lvl.unlocked ? 72 : 64;
  const labelRight = posX > 160;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {/* Node card */}
      <button
        onClick={() => { playSound('click'); onClick(); }}
        className={isCurrent ? 'node-bounce' : lvl.unlocked ? 'node-idle' : ''}
        style={{
          width: size, height: size,
          borderRadius: isCurrent ? 20 : 16,
          background: lvl.unlocked || isCurrent ? color : 'var(--tab-bg)',
          border: `3px solid #000`,
          boxShadow: isSelected
            ? `2px 2px 0 #000`
            : isCurrent
            ? `5px 5px 0 #000`
            : `4px 4px 0 #000`,
          transform: isSelected ? 'translate(2px,2px)' : 'none',
          cursor: 'pointer',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: 0,
          position: 'relative',
          overflow: 'hidden',
          transition: 'transform 0.1s, box-shadow 0.1s',
        }}
      >
        {/* Hatch pattern for locked */}
        {!lvl.unlocked && !isCurrent && (
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
            <defs>
              <pattern id={`hatch-${lvl.level}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="3" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#hatch-${lvl.level})`} />
          </svg>
        )}

        {/* Check for unlocked */}
        {lvl.unlocked && (
          <span style={{ fontSize: size * 0.38, lineHeight: 1, position: 'relative', zIndex: 1 }}>✓</span>
        )}

        {/* Level number */}
        {!lvl.unlocked && (
          <>
            {isCurrent ? (
              <>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#000', letterSpacing: '0.06em', lineHeight: 1 }}>LV</span>
                <span style={{ fontSize: 26, fontWeight: 900, color: '#000', lineHeight: 1 }}>{lvl.level}</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: 7, fontWeight: 900, color: 'var(--text-muted)', letterSpacing: '0.06em', lineHeight: 1 }}>LV</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--text-muted)', lineHeight: 1 }}>🔒</span>
              </>
            )}
          </>
        )}

        {/* Shine corner */}
        <div style={{
          position: 'absolute', top: 4, left: 6, width: '35%', height: '28%',
          borderRadius: 6, background: 'rgba(255,255,255,0.35)',
          pointerEvents: 'none',
        }} />
      </button>

      {/* "ŞU AN" tab */}
      {isCurrent && (
        <div
          className="tag-bounce"
          style={{
            position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            background: color, border: '2.5px solid #000',
            boxShadow: '2px 2px 0 #000',
            borderRadius: 6, padding: '2px 8px',
            fontSize: 9, fontWeight: 900, color: '#000', letterSpacing: '0.08em',
          }}
        >
          ● ŞU AN
        </div>
      )}

      {/* Level number badge (unlocked) */}
      {lvl.unlocked && (
        <div style={{
          position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)',
          background: '#000', color: '#fff',
          borderRadius: 5, padding: '1px 7px',
          fontSize: 9, fontWeight: 900, letterSpacing: '0.06em',
          border: '2px solid #000',
          whiteSpace: 'nowrap',
        }}>
          Lv.{lvl.level}
        </div>
      )}

      {/* Reward badge */}
      {lvl.rewardPoints > 0 && (
        <div style={{
          position: 'absolute', bottom: -10, right: -8,
          background: '#FFE500', border: '2.5px solid #000',
          boxShadow: '2px 2px 0 #000',
          borderRadius: 6, padding: '1px 6px',
          fontSize: 9, fontWeight: 900, color: '#000',
          whiteSpace: 'nowrap',
        }}>
          ⭐{lvl.rewardPoints}
        </div>
      )}

      {/* Side label */}
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [labelRight ? 'right' : 'left']: size + 12,
        textAlign: labelRight ? 'right' : 'left',
        minWidth: 80, pointerEvents: 'none',
      }}>
        <span style={{
          display: 'block', fontWeight: 900, fontSize: 11,
          color: 'var(--text-dark)', lineHeight: 1.2,
          textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
        }}>{lvl.title}</span>
        <span style={{
          display: 'block', fontWeight: 700, fontSize: 9,
          color: lvl.unlocked ? '#22c55e' : 'var(--text-muted)', marginTop: 2,
        }}>
          {lvl.unlocked ? `✓ ${lvl.reward}` : `${lvl.xpRequired.toLocaleString()} XP`}
        </span>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════ */
const ProgressPath: React.FC = () => {
  const { user, points } = useApp();
  const [animXp, setAnimXp] = useState(0);
  const [activeTierIdx, setActiveTierIdx] = useState(
    () => TIERS.findIndex(t => user.level >= t.from && user.level <= t.to)
  );
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  const activeTier = TIERS[activeTierIdx] ?? TIERS[0];
  const currentTier = getTier(user.level);
  const filteredLevels = progressLevels.filter(l => l.level >= activeTier.from && l.level <= activeTier.to);
  const xpPct = Math.round((user.xp / user.xpToNext) * 100);
  const xpRemaining = user.xpToNext - user.xp;
  const unlockedCount = progressLevels.filter(l => l.unlocked).length;

  const nodeYs = filteredLevels.map((_, i) => (filteredLevels.length - 1 - i) * NODE_SPACING + 60);
  const totalHeight = filteredLevels.length * NODE_SPACING + 80;

  useEffect(() => {
    const t = setTimeout(() => setAnimXp(xpPct), 250);
    return () => clearTimeout(t);
  }, [xpPct]);

  useEffect(() => {
    const t = setTimeout(() => {
      currentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 450);
    return () => clearTimeout(t);
  }, [activeTierIdx]);

  /* Build SVG path between nodes */
  const buildPath = () => {
    if (nodeYs.length < 2) return '';
    let d = '';
    for (let i = 0; i < nodeYs.length - 1; i++) {
      const xi = NODE_X[i % NODE_X.length];
      const yi = nodeYs[i];
      const xn = NODE_X[(i + 1) % NODE_X.length];
      const yn = nodeYs[i + 1];
      const my = (yi + yn) / 2;
      if (i === 0) d += `M ${xi} ${yi} `;
      d += `C ${xi} ${my}, ${xn} ${my}, ${xn} ${yn} `;
    }
    return d;
  };

  const selectedLvl = progressLevels.find(l => l.level === selectedLevel);

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes nodeBounce {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes nodeIdle {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-3px); }
        }
        @keyframes tagBounce {
          0%, 100% { transform: translateX(-50%) translateY(0px); }
          50%       { transform: translateX(-50%) translateY(-4px); }
        }
        @keyframes decoSpin {
          from { transform: rotate(0deg) scale(1); }
          50%  { transform: rotate(180deg) scale(1.2); }
          to   { transform: rotate(360deg) scale(1); }
        }
        @keyframes slidIn {
          from { transform: translateY(60px); opacity: 0; }
          to   { transform: translateY(0px);  opacity: 1; }
        }
        @keyframes tierFadeIn {
          from { transform: translateX(-12px); opacity: 0; }
          to   { transform: translateX(0px);   opacity: 1; }
        }
        .node-bounce { animation: nodeBounce 1.4s ease-in-out infinite; }
        .node-idle   { animation: nodeIdle 3s ease-in-out infinite; }
        .tag-bounce  { animation: tagBounce 1.4s ease-in-out infinite; }
        .deco-spin   { animation: decoSpin 4s linear infinite; }
        .popup-in    { animation: slidIn 0.25s cubic-bezier(0.22,1,0.36,1) both; }
        .tier-in     { animation: tierFadeIn 0.3s ease both; }
        .tier-scroll::-webkit-scrollbar { display: none; }
        .tier-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .nb-btn:active { transform: translate(2px,2px); box-shadow: 2px 2px 0 #000 !important; }
      `}</style>

      {/* ── BG watermark ── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '8%', left: '50%', transform: 'translateX(-50%) rotate(-6deg)',
          fontSize: 'clamp(50px,13vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>SEVİYE</div>
      </div>

      <div
        className="page-enter p-3 sm:p-4 max-w-lg mx-auto overflow-x-hidden"
        style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 24 }}
      >

        {/* ── HEADER ── */}
        <div>
          <p className="section-label">⚡ SEVİYE SİSTEMİ</p>
          <h1 className="section-title" style={{ fontSize: 'clamp(24px,6vw,32px)' }}>İlerleme Yolu</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '4px 0 0' }}>
            Seviye atla, ödülleri aç
          </p>
        </div>

        {/* ── HERO CARD ── */}
        <div style={{
          border: '3px solid #000',
          boxShadow: '5px 5px 0 #000',
          borderRadius: 20,
          background: 'var(--card-bg)',
          overflow: 'hidden',
        }}>
          {/* Top stripe */}
          <div style={{
            background: currentTier.color,
            borderBottom: '3px solid #000',
            padding: '10px 18px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{currentTier.emoji}</span>
              <span style={{ fontWeight: 900, fontSize: 13, color: '#000', letterSpacing: '0.07em' }}>
                {currentTier.label}
              </span>
            </div>
            <div style={{
              background: '#000', color: currentTier.color,
              borderRadius: 8, padding: '2px 10px',
              fontSize: 12, fontWeight: 900, letterSpacing: '0.06em',
            }}>
              LV.{user.level}
            </div>
          </div>

          {/* XP section */}
          <div style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {/* Level badge */}
              <div style={{
                width: 72, height: 72, flexShrink: 0,
                border: '3px solid #000', boxShadow: '4px 4px 0 #000',
                borderRadius: 16, background: getLevelColor(user.level),
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 8, fontWeight: 900, color: '#000', letterSpacing: '0.06em' }}>SEVİYE</span>
                <span style={{ fontSize: 30, fontWeight: 900, color: '#000', lineHeight: 1 }}>{user.level}</span>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 18, color: 'var(--text-dark)', margin: '0 0 2px' }}>Şampiyon</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 10px', fontWeight: 600 }}>
                  ⚡ {xpRemaining.toLocaleString()} XP → Lv.{user.level + 1}
                </p>
                <XpBar pct={animXp} color={currentTier.color} />
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            borderTop: '3px solid #000',
          }}>
            {[
              { emoji: '⚡', val: user.xp.toLocaleString(), label: 'TOPLAM XP', color: '#FFE500' },
              { emoji: '⭐', val: points.toLocaleString(), label: 'PUANLAR',   color: '#4CAF50' },
              { emoji: '🏆', val: unlockedCount,            label: 'AÇILAN',   color: '#2196F3' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding: '10px 6px', textAlign: 'center',
                borderLeft: i > 0 ? '3px solid #000' : 'none',
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8, margin: '0 auto 5px',
                  background: s.color, border: '2px solid #000',
                  boxShadow: '2px 2px 0 #000',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14,
                }}>{s.emoji}</div>
                <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 1px', lineHeight: 1 }}>{s.val}</p>
                <p style={{ fontSize: 8, color: 'var(--text-muted)', margin: 0, fontWeight: 900, letterSpacing: '0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── TIER SELECTOR ── */}
        <div>
          <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.09em', margin: '0 0 8px', paddingLeft: 2 }}>
            Kategori
          </p>
          <div className="tier-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {TIERS.map((t, i) => {
              const active = i === activeTierIdx;
              const inTier = user.level >= t.from && user.level <= t.to;
              return (
                <button
                  key={t.id ?? t.label}
                  className="nb-btn"
                  onClick={() => { playSound('click'); setActiveTierIdx(i); setSelectedLevel(null); }}
                  style={{
                    flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
                    padding: '8px 14px', borderRadius: 12, cursor: 'pointer',
                    background: active ? t.color : 'var(--card-bg)',
                    border: '3px solid #000',
                    boxShadow: active ? '4px 4px 0 #000' : '3px 3px 0 #000',
                    color: '#000',
                    fontWeight: 900, fontSize: 11, letterSpacing: '0.04em',
                    position: 'relative',
                  }}
                >
                  <span style={{ fontSize: 15 }}>{t.emoji}</span>
                  {t.label}
                  {inTier && !active && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 10, height: 10, borderRadius: '50%',
                      background: t.color, border: '2px solid #000',
                    }} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── WINDING PATH ── */}
        <div className="tier-in" key={activeTier.label}>
          {/* Zone banner */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 16,
          }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '7px 16px', borderRadius: 12,
              background: activeTier.color, border: '3px solid #000',
              boxShadow: '4px 4px 0 #000',
              fontWeight: 900, fontSize: 12, color: '#000', letterSpacing: '0.06em',
            }}>
              {activeTier.emoji} {activeTier.label} ZON
            </div>
            <div style={{
              padding: '5px 12px', borderRadius: 10,
              background: 'var(--card-bg)', border: '3px solid #000',
              boxShadow: '3px 3px 0 #000',
              fontSize: 10, fontWeight: 900, color: 'var(--text-dark)',
            }}>
              {filteredLevels.filter(l => l.unlocked).length}/{filteredLevels.length} ✓
            </div>
          </div>

          {/* Path + nodes */}
          <div style={{ position: 'relative', width: PATH_W, margin: '0 auto', height: totalHeight }}>

            {/* SVG path */}
            <svg
              width={PATH_W} height={totalHeight}
              style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            >
              {/* Shadow path */}
              <path d={buildPath()} fill="none" stroke="#000" strokeWidth={10} strokeLinecap="round" opacity={0.12} transform="translate(4,4)" />
              {/* Main path */}
              <path d={buildPath()} fill="none" stroke="var(--dark-border)" strokeWidth={6} strokeLinecap="round" />
              {/* Dashed overlay */}
              <path
                d={buildPath()} fill="none"
                stroke={activeTier.color} strokeWidth={3} strokeLinecap="round"
                strokeDasharray="10 10"
              />
            </svg>

            {/* Spinning deco stars between nodes */}
            {filteredLevels.slice(0, -1).map((_, i) => {
              const xi = NODE_X[i % NODE_X.length];
              const xn = NODE_X[(i + 1) % NODE_X.length];
              const midX = (xi + xn) / 2;
              const midY = (nodeYs[i] + nodeYs[i + 1]) / 2;
              const deco = DECOS[i % DECOS.length];
              const decoColor = getLevelColor(filteredLevels[i].level);
              return (
                <div
                  key={`deco-${i}`}
                  className="deco-spin"
                  style={{
                    position: 'absolute', left: midX - 10, top: midY - 10,
                    width: 20, height: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, color: decoColor,
                    filter: 'drop-shadow(1px 1px 0 #000)',
                    animationDelay: `${i * 0.35}s`,
                    pointerEvents: 'none', userSelect: 'none',
                  }}
                >
                  {deco}
                </div>
              );
            })}

            {/* Level nodes */}
            {filteredLevels.map((lvl, i) => {
              const posX = NODE_X[i % NODE_X.length];
              const posY = nodeYs[i];
              const isCurrent = lvl.level === user.level;
              const nodeSize = isCurrent ? 82 : lvl.unlocked ? 72 : 64;

              return (
                <div
                  key={`node-${lvl.level}`}
                  ref={isCurrent ? currentRef : undefined}
                  style={{
                    position: 'absolute',
                    left: posX - nodeSize / 2,
                    top: posY - nodeSize / 2,
                    zIndex: isCurrent ? 20 : 10,
                  }}
                >
                  <LevelNode
                    lvl={lvl}
                    posX={posX}
                    isCurrent={isCurrent}
                    isSelected={selectedLevel === lvl.level}
                    onClick={() => setSelectedLevel(selectedLevel === lvl.level ? null : lvl.level)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── MAX LEVEL CARD ── */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          border: '3px solid #000', boxShadow: '5px 5px 0 #000',
          borderRadius: 18, padding: '14px 18px',
          background: '#E91E63',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, flexShrink: 0,
            background: '#000', border: '3px solid #000',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24,
          }}>👑</div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 15, color: '#000', margin: 0 }}>Maksimum Seviye</p>
            <p style={{ fontSize: 12, color: '#000', margin: '2px 0 0', fontWeight: 700, opacity: 0.7 }}>
              Efsane ol. Tarihe geç.
            </p>
          </div>
        </div>
      </div>

      {/* ── LEVEL DETAIL POPUP ── */}
      {selectedLvl && (
        <div
          className="popup-in"
          style={{
            position: 'fixed', left: 12, right: 12, bottom: 80, zIndex: 100,
            border: '3px solid #000', boxShadow: '6px 6px 0 #000',
            borderRadius: 22, overflow: 'hidden',
            background: 'var(--card-bg)',
          }}
        >
          {/* Color header stripe */}
          <div style={{
            background: getLevelColor(selectedLvl.level),
            borderBottom: '3px solid #000',
            padding: '10px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, background: '#000',
                border: '2px solid #000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: selectedLvl.unlocked ? 18 : 16, fontWeight: 900, color: getLevelColor(selectedLvl.level),
              }}>
                {selectedLvl.unlocked ? '✓' : selectedLvl.level}
              </div>
              <div>
                <span style={{ fontSize: 9, fontWeight: 900, color: '#000', letterSpacing: '0.06em' }}>
                  LV.{selectedLvl.level} • {selectedLvl.unlocked ? 'TAMAMLANDI' : 'KİLİTLİ'}
                </span>
                <p style={{ fontWeight: 900, fontSize: 18, color: '#000', margin: 0, lineHeight: 1 }}>
                  {selectedLvl.title}
                </p>
              </div>
            </div>
            <button
              onClick={() => { playSound('click'); setSelectedLevel(null); }}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: '#000', color: getLevelColor(selectedLvl.level),
                border: '2px solid #000', fontSize: 16, fontWeight: 900,
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
              {selectedLvl.unlocked
                ? `🎉 Bu seviyeyi tamamladın ve "${selectedLvl.reward}" ödülünü kazandın.`
                : `🔒 Bu seviyeye ulaşmak için ${selectedLvl.xpRequired.toLocaleString()} XP gerekli.${
                    selectedLvl.xpRequired - user.xp > 0
                      ? ` ${(selectedLvl.xpRequired - user.xp).toLocaleString()} XP kaldı.`
                      : ' Neredeyse hazırsın!'
                  }`
              }
              {selectedLvl.rewardPoints > 0 && ` Ayrıca +${selectedLvl.rewardPoints} bonus puan!`}
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <div style={{
                flex: 1, padding: '10px 0', borderRadius: 12, textAlign: 'center',
                fontWeight: 900, fontSize: 13,
                background: selectedLvl.unlocked ? getLevelColor(selectedLvl.level) : 'var(--tab-bg)',
                color: '#000',
                border: '3px solid #000', boxShadow: '3px 3px 0 #000',
              }}>
                {selectedLvl.unlocked ? '✓ Tamamlandı' : `🔒 ${selectedLvl.xpRequired.toLocaleString()} XP`}
              </div>
              {selectedLvl.rewardPoints > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '10px 14px', borderRadius: 12,
                  background: '#FFE500', color: '#000',
                  border: '3px solid #000', boxShadow: '3px 3px 0 #000',
                  fontWeight: 900, fontSize: 13,
                }}>
                  ⭐ +{selectedLvl.rewardPoints}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgressPath;
