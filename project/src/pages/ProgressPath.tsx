import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { progressLevels } from '../data/mockData';
import { playSound } from '../lib/sounds';

const TIERS = [
  {
    id: 'beginner', label: 'BAŞLANGIÇ', emoji: '🌱', from: 1, to: 4,
    nodeColor: '#4ade80', nodeBorder: '#166534', glow: '#4ade8066',
    terrain: '#052e16', sky: '#064e3b', accent: '#86efac',
    stickers: ['🌿', '🍀', '🌱', '🦋'],
  },
  {
    id: 'warrior', label: 'SAVAŞÇI', emoji: '⚔️', from: 5, to: 8,
    nodeColor: '#facc15', nodeBorder: '#713f12', glow: '#facc1566',
    terrain: '#1c0a00', sky: '#431407', accent: '#fde68a',
    stickers: ['⚔️', '🛡️', '🗡️', '🔥'],
  },
  {
    id: 'hero', label: 'KAHRAMAN', emoji: '🦸', from: 9, to: 12,
    nodeColor: '#22d3ee', nodeBorder: '#164e63', glow: '#22d3ee66',
    terrain: '#0c1a2e', sky: '#0e1a3a', accent: '#a5f3fc',
    stickers: ['🦸', '⚡', '💫', '🌊'],
  },
  {
    id: 'legend', label: 'EFSANE', emoji: '🔥', from: 13, to: 16,
    nodeColor: '#f97316', nodeBorder: '#7c2d12', glow: '#f9731666',
    terrain: '#1a0500', sky: '#3b0a00', accent: '#fed7aa',
    stickers: ['🔥', '💀', '👹', '🌋'],
  },
  {
    id: 'immortal', label: 'ÖLÜMSÜZ', emoji: '👑', from: 17, to: 99,
    nodeColor: '#d946ef', nodeBorder: '#581c87', glow: '#d946ef66',
    terrain: '#0d001a', sky: '#1a0030', accent: '#f0abfc',
    stickers: ['👑', '💎', '⭐', '🌟'],
  },
];

const getTier = (level: number) => TIERS.find(t => level >= t.from && level <= t.to) ?? TIERS[0];

const NODE_X_POSITIONS = [180, 290, 180, 70, 180, 290, 180, 70, 180, 290, 180, 70, 180, 180];
const NODE_SPACING = 110;

/* ── Floating particle ── */
const Particle: React.FC<{ x: number; y: number; emoji: string; delay?: number }> = ({ x, y, emoji, delay = 0 }) => (
  <motion.div
    className="absolute pointer-events-none select-none text-xl"
    style={{ left: x, top: y }}
    animate={{ y: [-6, 6, -6], rotate: [-8, 8, -8], opacity: [0.5, 0.9, 0.5] }}
    transition={{ duration: 3.5, repeat: Infinity, delay, ease: 'easeInOut' }}
  >
    {emoji}
  </motion.div>
);

/* ── Stars burst ── */
const StarBurst: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
          style={{ left: '50%', top: '50%' }}
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, Math.cos((i * Math.PI * 2) / 8) * 30],
            y: [0, Math.sin((i * Math.PI * 2) / 8) * 30],
            opacity: [1, 1, 0],
          }}
          transition={{ duration: 0.6, delay: i * 0.03 }}
        />
      ))}
    </div>
  );
};

/* ── XP Ring ── */
const XpRing: React.FC<{ percent: number; color: string; size?: number }> = ({ percent, color, size = 80 }) => {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{
          transition: 'stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)',
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      />
    </svg>
  );
};

/* ── Terrain background ── */
const TierBackground: React.FC<{ tier: typeof TIERS[0] }> = ({ tier }) => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 360 200">
      <polygon points="0,200 60,100 120,200" fill={tier.terrain} opacity="0.6" />
      <polygon points="80,200 160,80 240,200" fill={tier.terrain} opacity="0.5" />
      <polygon points="200,200 280,110 360,200" fill={tier.terrain} opacity="0.55" />
      <polygon points="300,200 360,130 360,200" fill={tier.terrain} opacity="0.4" />
      <rect x="0" y="180" width="360" height="20" fill={tier.terrain} opacity="0.7" />
    </svg>
    {[...Array(14)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full bg-white"
        style={{
          width: 2 + (i % 3),
          height: 2 + (i % 3),
          left: `${(i * 37 + 11) % 100}%`,
          top: `${(i * 23 + 7) % 55}%`,
          opacity: 0.2 + (i % 4) * 0.1,
        }}
        animate={{ opacity: [0.15, 0.7, 0.15] }}
        transition={{ duration: 2.5 + (i % 3), repeat: Infinity, delay: i * 0.35 }}
      />
    ))}
  </div>
);

/* ── Level Node ── */
const LevelNode: React.FC<{
  lvl: typeof progressLevels[0];
  posX: number;
  tier: typeof TIERS[0];
  isCurrent: boolean;
  onClick: () => void;
  selected: boolean;
}> = ({ lvl, posX, tier, isCurrent, onClick, selected }) => {
  const isUnlocked = lvl.unlocked;
  const nodeSize = isCurrent ? 72 : isUnlocked ? 60 : 52;
  const labelSide = posX > 200 ? 'left' : 'right';

  return (
    <div style={{ position: 'relative', width: nodeSize, height: nodeSize }}>
      {/* Glow aura for current */}
      {isCurrent && (
        <motion.div
          style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: tier.glow, filter: 'blur(12px)',
          }}
          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Node circle */}
      <motion.div
        onClick={() => { playSound('click'); onClick(); }}
        style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `4px solid ${isUnlocked || isCurrent ? tier.nodeColor : '#374151'}`,
          background: isUnlocked
            ? `radial-gradient(circle at 35% 35%, ${tier.nodeColor}dd, ${tier.nodeBorder})`
            : isCurrent
            ? `radial-gradient(circle at 35% 35%, ${tier.nodeColor}88, ${tier.nodeBorder}aa)`
            : 'radial-gradient(circle at 35% 35%, #1f2937, #111827)',
          boxShadow: isUnlocked || isCurrent
            ? `0 0 0 3px ${tier.nodeBorder}, 0 4px 14px ${tier.glow}`
            : '0 0 0 3px #1f2937, 0 2px 6px #000a',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        whileTap={{ scale: 0.9 }}
        animate={isCurrent ? { scale: [1, 1.06, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {isUnlocked ? (
          <span style={{ fontSize: nodeSize * 0.38, lineHeight: 1 }}>✓</span>
        ) : (
          <>
            <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.05em', lineHeight: 1 }}>LV</span>
            <span style={{ fontSize: isCurrent ? 22 : 17, fontWeight: 900, color: '#fff', lineHeight: 1 }}>{lvl.level}</span>
          </>
        )}
        {/* Shine */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.28) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />
      </motion.div>

      {/* "ŞU AN" badge */}
      {isCurrent && (
        <motion.div
          style={{
            position: 'absolute', top: -26, left: '50%', transform: 'translateX(-50%)',
            whiteSpace: 'nowrap', padding: '2px 8px', borderRadius: 999,
            background: tier.nodeColor, color: '#000',
            fontSize: 9, fontWeight: 900, letterSpacing: '0.08em',
            border: `2px solid ${tier.nodeBorder}`,
            boxShadow: `0 2px 8px ${tier.glow}`,
          }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          ● ŞU AN
        </motion.div>
      )}

      {/* Reward badge */}
      {lvl.rewardPoints > 0 && (
        <div style={{
          position: 'absolute', bottom: -6, right: -6,
          display: 'flex', alignItems: 'center', gap: 2,
          padding: '2px 6px', borderRadius: 999, fontWeight: 900,
          background: '#facc15', border: '2px solid #713f12',
          fontSize: 9, color: '#000', boxShadow: '0 2px 4px #000a',
        }}>
          ⭐ {lvl.rewardPoints}
        </div>
      )}

      {/* Label */}
      <div style={{
        position: 'absolute', top: '50%', transform: 'translateY(-50%)',
        [labelSide === 'right' ? 'left' : 'right']: nodeSize + 10,
        minWidth: 88, textAlign: labelSide === 'right' ? 'left' : 'right',
        pointerEvents: 'none',
      }}>
        <span style={{ display: 'block', fontWeight: 900, fontSize: 11, color: '#fff', textShadow: '0 1px 6px #000' }}>
          {lvl.title}
        </span>
        <span style={{ display: 'block', fontWeight: 700, fontSize: 9, color: tier.accent, textShadow: '0 1px 4px #000' }}>
          {lvl.unlocked ? `✓ ${lvl.reward}` : `${lvl.xpRequired.toLocaleString()} XP`}
        </span>
      </div>

      <StarBurst show={selected && isUnlocked} />
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════ */
const ProgressPath: React.FC = () => {
  const { user, points } = useApp();
  const [animXp, setAnimXp] = useState(0);
  const [activeTierIdx, setActiveTierIdx] = useState(
    () => TIERS.findIndex(t => user.level >= t.from && user.level <= t.to)
  );
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  const activeTier = TIERS[activeTierIdx] ?? TIERS[0];
  const currentTier = getTier(user.level);
  const filteredLevels = progressLevels.filter(l => l.level >= activeTier.from && l.level <= activeTier.to);
  const xpPct = Math.round((user.xp / user.xpToNext) * 100);
  const xpRemaining = user.xpToNext - user.xp;
  const unlockedCount = progressLevels.filter(l => l.unlocked).length;

  const nodeYPositions = filteredLevels.map((_, i) => (filteredLevels.length - 1 - i) * NODE_SPACING + 60);
  const totalHeight = filteredLevels.length * NODE_SPACING + 80;

  useEffect(() => {
    const t = setTimeout(() => setAnimXp(xpPct), 300);
    return () => clearTimeout(t);
  }, [xpPct]);

  useEffect(() => {
    const t = setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 500);
    return () => clearTimeout(t);
  }, [activeTierIdx]);

  const buildSvgPath = () => {
    if (nodeYPositions.length < 2) return '';
    let d = '';
    for (let i = 0; i < nodeYPositions.length - 1; i++) {
      const xi = NODE_X_POSITIONS[i % NODE_X_POSITIONS.length];
      const yi = nodeYPositions[i];
      const xn = NODE_X_POSITIONS[(i + 1) % NODE_X_POSITIONS.length];
      const yn = nodeYPositions[i + 1];
      const my = (yi + yn) / 2;
      if (i === 0) d += `M ${xi} ${yi} `;
      d += `Q ${xi} ${my} ${(xi + xn) / 2} ${my} Q ${xn} ${my} ${xn} ${yn} `;
    }
    return d;
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', overflowX: 'hidden', background: `linear-gradient(180deg, ${activeTier.sky} 0%, ${activeTier.terrain} 100%)` }}>

      {/* Animated bg styles */}
      <style>{`
        @keyframes floatY { 0%,100%{transform:translateY(-6px) rotate(-8deg)} 50%{transform:translateY(6px) rotate(8deg)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse-glow { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.15)} }
        .tier-scroll::-webkit-scrollbar { display:none }
        .tier-scroll { -ms-overflow-style:none; scrollbar-width:none; }
      `}</style>

      {/* Terrain */}
      <TierBackground tier={activeTier} />

      {/* Floating stickers */}
      {activeTier.stickers.map((s, i) => (
        <Particle key={s + i} x={[28, 305, 18, 315][i % 4]} y={[130, 190, 270, 95][i % 4]} emoji={s} delay={i * 0.8} />
      ))}

      {/* ── HERO HEADER ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '16px 14px 12px' }}>
        <motion.div
          key={activeTier.id + '-header'}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            position: 'relative', overflow: 'hidden',
            borderRadius: 28, padding: '16px 18px',
            background: 'rgba(0,0,0,0.58)',
            border: `2px solid ${activeTier.nodeColor}44`,
            boxShadow: `0 0 28px ${activeTier.glow}, 0 5px 0 rgba(0,0,0,0.6)`,
            backdropFilter: 'blur(14px)',
          }}
        >
          {/* Corner glow */}
          <div style={{
            position: 'absolute', top: 0, right: 0, width: 130, height: 130,
            borderRadius: '50%', background: activeTier.glow, filter: 'blur(35px)',
            transform: 'translate(40%,-40%)', pointerEvents: 'none',
          }} />

          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.12em', color: activeTier.nodeColor, margin: '0 0 4px' }}>
            ⚡ SEVİYE SİSTEMİ
          </p>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '0 0 14px', lineHeight: 1.1 }}>İlerleme Yolu</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* XP Ring */}
            <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
              <XpRing percent={animXp} color={activeTier.nodeColor} size={80} />
              <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontWeight: 900, fontSize: 24, color: '#fff', lineHeight: 1 }}>{user.level}</span>
                <span style={{ fontSize: 8, fontWeight: 900, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.06em' }}>SEVİYE</span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Tier badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 12px', borderRadius: 999, marginBottom: 8,
                background: activeTier.nodeColor, color: '#000',
                fontSize: 10, fontWeight: 900, letterSpacing: '0.07em',
                boxShadow: `0 2px 10px ${activeTier.glow}`,
              }}>
                {currentTier.emoji} {currentTier.label}
              </div>

              <p style={{ fontWeight: 900, fontSize: 18, color: '#fff', margin: '0 0 6px', lineHeight: 1 }}>{user.name || 'Şampiyon'}</p>

              {/* XP bar */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{user.xp.toLocaleString()} XP</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: activeTier.accent }}>{user.xpToNext.toLocaleString()} XP</span>
                </div>
                <div style={{
                  height: 12, borderRadius: 999, overflow: 'hidden',
                  background: 'rgba(255,255,255,0.1)',
                  border: `1.5px solid ${activeTier.nodeColor}44`,
                }}>
                  <motion.div
                    style={{
                      height: '100%', borderRadius: 999,
                      background: `linear-gradient(90deg, ${activeTier.nodeBorder}, ${activeTier.nodeColor})`,
                      boxShadow: `0 0 10px ${activeTier.glow}`,
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${animXp}%` }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p style={{ textAlign: 'center', fontSize: 9, fontWeight: 700, color: activeTier.accent, marginTop: 5 }}>
                  %{animXp} TAMAMLANDI • {xpRemaining.toLocaleString()} XP kaldı
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14 }}>
            {[
              { icon: '⚡', val: user.xp.toLocaleString(), label: 'TOPLAM XP' },
              { icon: '⭐', val: points.toLocaleString(), label: 'PUANLAR' },
              { icon: '🏆', val: unlockedCount, label: 'AÇILAN' },
            ].map(s => (
              <div key={s.label} style={{
                borderRadius: 14, padding: '8px 6px', textAlign: 'center',
                background: 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${activeTier.nodeColor}33`,
              }}>
                <div style={{ fontSize: 18, lineHeight: 1, marginBottom: 3 }}>{s.icon}</div>
                <div style={{ fontWeight: 900, fontSize: 15, color: '#fff' }}>{s.val}</div>
                <div style={{ fontSize: 7, fontWeight: 900, color: activeTier.accent, letterSpacing: '0.05em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── TIER SELECTOR ── */}
      <div style={{ position: 'relative', zIndex: 10, padding: '0 14px 14px' }}>
        <div className="tier-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {TIERS.map((t, i) => {
            const active = i === activeTierIdx;
            const isCurrentTier = user.level >= t.from && user.level <= t.to;
            return (
              <motion.button
                key={t.id}
                onClick={() => { playSound('click'); setActiveTierIdx(i); setSelectedLevel(null); }}
                whileTap={{ scale: 0.92 }}
                animate={active ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 14px', borderRadius: 18, cursor: 'pointer',
                  background: active
                    ? `linear-gradient(135deg, ${t.nodeColor}bb, ${t.nodeBorder}bb)`
                    : 'rgba(255,255,255,0.08)',
                  border: active ? `2px solid ${t.nodeColor}` : '2px solid rgba(255,255,255,0.14)',
                  color: active ? '#000' : '#fff',
                  fontWeight: 900, fontSize: 11, letterSpacing: '0.04em',
                  boxShadow: active ? `0 0 18px ${t.glow}, 0 3px 0 ${t.nodeBorder}` : '0 2px 0 rgba(0,0,0,0.5)',
                  position: 'relative',
                }}
              >
                <span style={{ fontSize: 16 }}>{t.emoji}</span>
                {t.label}
                {isCurrentTier && (
                  <motion.div
                    style={{
                      position: 'absolute', top: -5, right: -5,
                      width: 12, height: 12, borderRadius: '50%',
                      background: t.nodeColor, border: '2px solid #000',
                    }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── WINDING PATH ── */}
      <div style={{ position: 'relative', zIndex: 10, paddingBottom: 24 }}>
        {/* Zone banner */}
        <motion.div
          key={activeTier.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: 16 }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 18px', borderRadius: 999,
            background: `linear-gradient(135deg, ${activeTier.nodeColor}22, ${activeTier.nodeBorder}44)`,
            border: `2px solid ${activeTier.nodeColor}66`,
            color: activeTier.nodeColor, fontWeight: 900, fontSize: 11,
            letterSpacing: '0.08em', boxShadow: `0 0 14px ${activeTier.glow}`,
          }}>
            {activeTier.emoji} {activeTier.label} ZON — Lv.{activeTier.from}–{activeTier.to === 99 ? '∞' : activeTier.to}
          </div>
        </motion.div>

        {/* Path canvas */}
        <div style={{ position: 'relative', width: 360, margin: '0 auto', height: totalHeight }}>

          {/* SVG path */}
          <svg
            width={360} height={totalHeight}
            style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
          >
            {/* Wide soft shadow */}
            <path d={buildSvgPath()} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={22} strokeLinecap="round" />
            {/* Mid track */}
            <path d={buildSvgPath()} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={12} strokeLinecap="round" />
            {/* Animated dashed overlay */}
            <motion.path
              d={buildSvgPath()} fill="none"
              stroke={activeTier.nodeColor} strokeWidth={6} strokeLinecap="round"
              strokeDasharray="10 8" opacity={0.75}
              style={{ filter: `drop-shadow(0 0 5px ${activeTier.nodeColor})` }}
              animate={{ strokeDashoffset: [0, -18] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
          </svg>

          {/* Spinning star decorations on path midpoints */}
          <AnimatePresence mode="wait">
            {filteredLevels.slice(0, -1).map((_, i) => {
              const xi = NODE_X_POSITIONS[i % NODE_X_POSITIONS.length];
              const xn = NODE_X_POSITIONS[(i + 1) % NODE_X_POSITIONS.length];
              const midX = (xi + xn) / 2;
              const midY = (nodeYPositions[i] + nodeYPositions[i + 1]) / 2;
              const deco = ['⭐', '💫', '✨', '🌟', '💥'][i % 5];
              return (
                <motion.div
                  key={`deco-${activeTier.id}-${i}`}
                  style={{
                    position: 'absolute', left: midX - 11, top: midY - 11,
                    fontSize: 18, opacity: 0.55, pointerEvents: 'none', userSelect: 'none',
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ rotate: [0, 360], scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.7, 0.4] }}
                  transition={{ duration: 5 + i, repeat: Infinity, ease: 'linear' }}
                >
                  {deco}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Level nodes */}
          <AnimatePresence mode="wait">
            {filteredLevels.map((lvl, i) => {
              const posX = NODE_X_POSITIONS[i % NODE_X_POSITIONS.length];
              const posY = nodeYPositions[i];
              const tier = getTier(lvl.level);
              const isCurrent = lvl.level === user.level;
              const nodeSize = isCurrent ? 72 : lvl.unlocked ? 60 : 52;

              return (
                <motion.div
                  key={`${activeTier.id}-node-${lvl.level}`}
                  ref={isCurrent ? currentNodeRef : undefined}
                  style={{
                    position: 'absolute',
                    left: posX - nodeSize / 2,
                    top: posY - nodeSize / 2,
                    zIndex: isCurrent ? 20 : 10,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
                >
                  <LevelNode
                    lvl={lvl}
                    posX={posX}
                    tier={tier}
                    isCurrent={isCurrent}
                    onClick={() => setSelectedLevel(selectedLevel === lvl.level ? null : lvl.level)}
                    selected={selectedLevel === lvl.level}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Max level card */}
        <motion.div
          style={{
            margin: '24px 14px 16px',
            borderRadius: 24, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'linear-gradient(135deg, rgba(255,60,172,0.2), rgba(139,92,246,0.2))',
            border: '2px solid #FF3CAC',
            boxShadow: '0 0 24px rgba(255,60,172,0.3), 0 4px 0 #7c1a6a',
          }}
          animate={{
            boxShadow: [
              '0 0 24px rgba(255,60,172,0.3), 0 4px 0 #7c1a6a',
              '0 0 44px rgba(255,60,172,0.6), 0 4px 0 #7c1a6a',
              '0 0 24px rgba(255,60,172,0.3), 0 4px 0 #7c1a6a',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div
            style={{
              width: 56, height: 56, borderRadius: 18, flexShrink: 0,
              background: 'linear-gradient(135deg, #FF3CAC, #8B5CF6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 28, boxShadow: '0 3px 0 #7c1a6a',
            }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            👑
          </motion.div>
          <div>
            <p style={{ fontWeight: 900, fontSize: 16, color: '#fff', margin: 0 }}>Maksimum Seviye</p>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#f0abfc', margin: '3px 0 0' }}>
              Efsane ol. Tarihe geç. 👑
            </p>
          </div>
        </motion.div>
      </div>

      {/* ── LEVEL DETAIL POPUP ── */}
      <AnimatePresence>
        {selectedLevel !== null && (() => {
          const lvl = progressLevels.find(l => l.level === selectedLevel);
          if (!lvl) return null;
          const t = getTier(lvl.level);
          return (
            <motion.div
              key="popup"
              style={{
                position: 'fixed', left: 12, right: 12, bottom: 80, zIndex: 100,
                borderRadius: 28, padding: '20px 20px',
                background: `linear-gradient(155deg, #0d0d0d, ${t.terrain})`,
                border: `2px solid ${t.nodeColor}`,
                boxShadow: `0 0 32px ${t.glow}, 0 -4px 0 ${t.nodeBorder}`,
                overflow: 'hidden',
              }}
              initial={{ y: 120, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 120, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Bg glow */}
              <div style={{
                position: 'absolute', top: 0, right: 0, width: 160, height: 160,
                borderRadius: '50%', background: t.glow, filter: 'blur(35px)',
                transform: 'translate(30%,-30%)', pointerEvents: 'none',
              }} />

              {/* Close */}
              <button
                onClick={() => { playSound('click'); setSelectedLevel(null); }}
                style={{
                  position: 'absolute', top: 12, right: 12,
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)', border: 'none',
                  color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: 900,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >✕</button>

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  background: lvl.unlocked
                    ? `radial-gradient(circle at 35% 35%, ${t.nodeColor}dd, ${t.nodeBorder})`
                    : 'radial-gradient(circle at 35% 35%, #1f2937, #111827)',
                  border: `3px solid ${t.nodeColor}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: lvl.unlocked ? 22 : 20, fontWeight: 900, color: '#fff',
                  boxShadow: `0 3px 0 ${t.nodeBorder}, 0 0 14px ${t.glow}`,
                }}>
                  {lvl.unlocked ? '✓' : lvl.level}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{
                      padding: '2px 10px', borderRadius: 999,
                      background: t.nodeColor, color: '#000',
                      fontSize: 10, fontWeight: 900,
                    }}>Lv.{lvl.level}</span>
                    {lvl.level === user.level && (
                      <span style={{ fontSize: 9, fontWeight: 900, color: t.nodeColor }}>● ŞU AN</span>
                    )}
                  </div>
                  <p style={{ fontWeight: 900, fontSize: 20, color: '#fff', margin: 0, lineHeight: 1 }}>{lvl.title}</p>
                </div>
              </div>

              {/* Info */}
              <div style={{
                borderRadius: 16, padding: '12px 14px', marginBottom: 14,
                background: 'rgba(255,255,255,0.06)',
                border: `1.5px solid ${t.nodeColor}33`,
              }}>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: 0, lineHeight: 1.6, fontWeight: 600 }}>
                  {lvl.unlocked
                    ? `🎉 Bu seviyeyi tamamladın! "${lvl.reward}" ödülünü kazandın.`
                    : `🔒 Bu seviyeye ulaşmak için ${lvl.xpRequired.toLocaleString()} XP gerekli.${
                        lvl.xpRequired - user.xp > 0 ? ` ${(lvl.xpRequired - user.xp).toLocaleString()} XP kaldı.` : ' Hazırsın!'
                      }`
                  }
                  {lvl.rewardPoints > 0 && ` +${lvl.rewardPoints} bonus puan kazanırsın!`}
                </p>
              </div>

              {/* Action row */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  flex: 1, padding: '12px 0', borderRadius: 18, textAlign: 'center',
                  fontWeight: 900, fontSize: 14,
                  background: lvl.unlocked
                    ? `linear-gradient(135deg, ${t.nodeColor}, ${t.nodeBorder})`
                    : 'rgba(255,255,255,0.08)',
                  color: lvl.unlocked ? '#000' : '#fff',
                  border: lvl.unlocked ? `2px solid ${t.nodeBorder}` : '2px solid rgba(255,255,255,0.14)',
                  boxShadow: lvl.unlocked ? `0 3px 0 ${t.nodeBorder}, 0 0 14px ${t.glow}` : '0 2px 0 rgba(0,0,0,0.5)',
                }}>
                  {lvl.unlocked ? '✓ Tamamlandı' : `🔒 ${lvl.xpRequired.toLocaleString()} XP`}
                </div>
                {lvl.rewardPoints > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '12px 14px', borderRadius: 18, fontWeight: 900, fontSize: 14,
                    background: '#facc15', color: '#000',
                    border: '2px solid #713f12', boxShadow: '0 3px 0 #713f12',
                  }}>
                    ⭐ +{lvl.rewardPoints}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
};

export default ProgressPath;
