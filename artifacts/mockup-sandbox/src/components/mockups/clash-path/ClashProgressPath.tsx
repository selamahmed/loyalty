import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const USER = {
  level: 12,
  xp: 3450,
  xpToNext: 4000,
  name: "StarPlayer99",
  points: 4300,
};

const TIERS = [
  {
    id: "beginner", label: "BAŞLANGIC", emoji: "🌱", from: 1, to: 4,
    bg: "from-emerald-900 via-green-800 to-teal-900",
    nodeColor: "#4ade80", nodeBorder: "#166534", glow: "#4ade8066",
    terrain: "#052e16", sky: "#064e3b", accent: "#86efac",
    stickers: ["🌿", "🍀", "🌱", "🦋"],
  },
  {
    id: "warrior", label: "SAVAŞÇI", emoji: "⚔️", from: 5, to: 8,
    bg: "from-yellow-900 via-amber-800 to-orange-900",
    nodeColor: "#facc15", nodeBorder: "#713f12", glow: "#facc1566",
    terrain: "#1c0a00", sky: "#431407", accent: "#fde68a",
    stickers: ["⚔️", "🛡️", "🗡️", "🔥"],
  },
  {
    id: "hero", label: "KAHRAMAN", emoji: "🦸", from: 9, to: 12,
    bg: "from-cyan-900 via-blue-800 to-indigo-900",
    nodeColor: "#22d3ee", nodeBorder: "#164e63", glow: "#22d3ee66",
    terrain: "#0c1a2e", sky: "#0e1a3a", accent: "#a5f3fc",
    stickers: ["🦸", "⚡", "💫", "🌊"],
  },
  {
    id: "legend", label: "EFSANE", emoji: "🔥", from: 13, to: 16,
    bg: "from-rose-900 via-red-800 to-orange-900",
    nodeColor: "#f97316", nodeBorder: "#7c2d12", glow: "#f9731666",
    terrain: "#1a0500", sky: "#3b0a00", accent: "#fed7aa",
    stickers: ["🔥", "💀", "👹", "🌋"],
  },
  {
    id: "immortal", label: "ÖLÜMSÜZ", emoji: "👑", from: 17, to: 20,
    bg: "from-purple-900 via-violet-800 to-fuchsia-900",
    nodeColor: "#d946ef", nodeBorder: "#581c87", glow: "#d946ef66",
    terrain: "#0d001a", sky: "#1a0030", accent: "#f0abfc",
    stickers: ["👑", "💎", "⭐", "🌟"],
  },
];

const LEVELS = [
  { level: 1, title: "Newcomer", xpRequired: 0, reward: "Welcome Pack", rewardPoints: 0, unlocked: true },
  { level: 2, title: "Explorer", xpRequired: 200, reward: "50 Puan", rewardPoints: 50, unlocked: true },
  { level: 3, title: "Seeker", xpRequired: 500, reward: "%10 Kupon", rewardPoints: 0, unlocked: true },
  { level: 4, title: "Adventurer", xpRequired: 900, reward: "100 Puan", rewardPoints: 100, unlocked: true },
  { level: 5, title: "Warrior", xpRequired: 1400, reward: "Özel Rozet", rewardPoints: 0, unlocked: true },
  { level: 6, title: "Champion", xpRequired: 2000, reward: "200 Puan", rewardPoints: 200, unlocked: true },
  { level: 7, title: "Hero", xpRequired: 2700, reward: "Bedava Kahve", rewardPoints: 0, unlocked: true },
  { level: 8, title: "Legend", xpRequired: 3500, reward: "300 Puan", rewardPoints: 300, unlocked: true },
  { level: 9, title: "Mythic", xpRequired: 4400, reward: "Gizem Kutusu", rewardPoints: 0, unlocked: false },
  { level: 10, title: "Divine", xpRequired: 5500, reward: "500 Puan", rewardPoints: 500, unlocked: false },
  { level: 11, title: "Cosmic", xpRequired: 6800, reward: "Özel Ürün", rewardPoints: 0, unlocked: false },
  { level: 12, title: "Stellar", xpRequired: 8200, reward: "1000 Puan", rewardPoints: 1000, unlocked: false },
  { level: 15, title: "Supreme", xpRequired: 12000, reward: "VIP Statüsü", rewardPoints: 0, unlocked: false },
  { level: 20, title: "Immortal", xpRequired: 20000, reward: "Efsane Paket", rewardPoints: 0, unlocked: false },
];

const getTier = (level: number) => TIERS.find(t => level >= t.from && level <= t.to) ?? TIERS[0];

// Zigzag path: alternating left/center/right positions
const NODE_POSITIONS = [
  { x: 180, side: "center" },
  { x: 290, side: "right" },
  { x: 180, side: "center" },
  { x: 70, side: "left" },
  { x: 180, side: "center" },
  { x: 290, side: "right" },
  { x: 180, side: "center" },
  { x: 70, side: "left" },
  { x: 180, side: "center" },
  { x: 290, side: "right" },
  { x: 180, side: "center" },
  { x: 70, side: "left" },
  { x: 180, side: "center" },
  { x: 180, side: "center" },
];

// Floating particle component
function Particle({ x, y, emoji, delay = 0 }: { x: number; y: number; emoji: string; delay?: number }) {
  return (
    <motion.div
      className="absolute pointer-events-none select-none text-xl"
      style={{ left: x, top: y }}
      animate={{ y: [-6, 6, -6], rotate: [-8, 8, -8], opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay, ease: "easeInOut" }}
    >
      {emoji}
    </motion.div>
  );
}

// Stars burst when unlocked
function StarBurst({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300"
          style={{ left: "50%", top: "50%", transformOrigin: "center" }}
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
}

// Single level node
function LevelNode({
  lvl, posX, index, isActive, isUnlocked, tier, isCurrent, onClick, selected,
}: {
  lvl: typeof LEVELS[0]; posX: number; index: number;
  isActive: boolean; isUnlocked: boolean; tier: typeof TIERS[0];
  isCurrent: boolean; onClick: () => void; selected: boolean;
}) {
  const nodeSize = isCurrent ? 72 : isUnlocked ? 60 : 52;
  const labelSide = posX > 180 ? "left" : posX < 180 ? "right" : "right";

  return (
    <div className="relative" style={{ width: nodeSize, height: nodeSize }}>
      {/* Glow ring for current */}
      {isCurrent && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: tier.glow, filter: "blur(10px)" }}
          animate={{ scale: [1, 1.4, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-4"
        style={{
          borderColor: isUnlocked || isCurrent ? tier.nodeColor : "#374151",
          background: isUnlocked
            ? `radial-gradient(circle at 35% 35%, ${tier.nodeColor}dd, ${tier.nodeBorder})`
            : isCurrent
            ? `radial-gradient(circle at 35% 35%, ${tier.nodeColor}88, ${tier.nodeBorder}aa)`
            : "radial-gradient(circle at 35% 35%, #1f2937, #111827)",
          boxShadow: isUnlocked || isCurrent
            ? `0 0 0 3px ${tier.nodeBorder}, 0 4px 12px ${tier.glow}`
            : "0 0 0 3px #1f2937, 0 2px 4px #000a",
        }}
        whileTap={{ scale: 0.92 }}
        onClick={onClick}
        animate={isCurrent ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        {/* Inner content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rounded-full">
          {isUnlocked ? (
            <span className="text-2xl">✓</span>
          ) : (
            <>
              <span className="text-xs font-black text-white/60" style={{ fontSize: 8, letterSpacing: "0.05em" }}>LV</span>
              <span className="font-black text-white" style={{ fontSize: isCurrent ? 22 : 18, lineHeight: 1 }}>
                {lvl.level}
              </span>
            </>
          )}
        </div>

        {/* Shine overlay */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)",
          }}
        />
      </motion.div>

      {/* "ŞU AN" badge */}
      {isCurrent && (
        <motion.div
          className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full text-black font-black"
          style={{
            background: tier.nodeColor,
            fontSize: 9,
            letterSpacing: "0.08em",
            border: `2px solid ${tier.nodeBorder}`,
            boxShadow: `0 2px 6px ${tier.glow}`,
          }}
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ● ŞU AN
        </motion.div>
      )}

      {/* Reward badge */}
      {lvl.rewardPoints > 0 && (
        <div
          className="absolute -bottom-2 -right-2 flex items-center gap-0.5 px-1.5 py-0.5 rounded-full font-black"
          style={{
            background: "#facc15",
            border: "2px solid #713f12",
            fontSize: 9,
            color: "#000",
            boxShadow: "0 2px 4px #0008",
          }}
        >
          ⭐ {lvl.rewardPoints}
        </div>
      )}

      {/* Side label */}
      <div
        className="absolute top-1/2 -translate-y-1/2 flex flex-col pointer-events-none"
        style={{
          [labelSide === "right" ? "left" : "right"]: nodeSize + 8,
          minWidth: 90,
          textAlign: labelSide === "right" ? "left" : "right",
        }}
      >
        <span
          className="font-black text-white"
          style={{ fontSize: 11, textShadow: "0 1px 4px #000" }}
        >
          {lvl.title}
        </span>
        <span
          className="font-bold"
          style={{ fontSize: 9, color: tier.accent, textShadow: "0 1px 3px #000" }}
        >
          {isUnlocked ? `✓ ${lvl.reward}` : `${lvl.xpRequired.toLocaleString()} XP`}
        </span>
      </div>

      <StarBurst show={selected && isUnlocked} />
    </div>
  );
}

// XP progress ring
function XpRing({ percent, color, size = 80 }: { percent: number; color: string; size?: number }) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (percent / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#ffffff22" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.22,1,0.36,1)", filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  );
}

// Decorative cloud shape
function Cloud({ x, y, scale = 1, opacity = 0.12 }: { x: number; y: number; scale?: number; opacity?: number }) {
  return (
    <div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, transform: `scale(${scale})`, opacity, transformOrigin: "top left" }}
    >
      <svg width="80" height="40" viewBox="0 0 80 40" fill="white">
        <ellipse cx="30" cy="28" rx="28" ry="14" />
        <ellipse cx="50" cy="25" rx="22" ry="12" />
        <ellipse cx="20" cy="30" rx="16" ry="10" />
        <ellipse cx="40" cy="20" rx="18" ry="14" />
      </svg>
    </div>
  );
}

// Terrain decoration (mountains, hills)
function TierBackground({ tier }: { tier: typeof TIERS[0] }) {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 360 200">
        {/* Mountains */}
        <polygon points="0,200 60,100 120,200" fill={tier.terrain} opacity="0.6" />
        <polygon points="80,200 160,80 240,200" fill={tier.terrain} opacity="0.5" />
        <polygon points="200,200 280,110 360,200" fill={tier.terrain} opacity="0.55" />
        <polygon points="300,200 360,130 360,200" fill={tier.terrain} opacity="0.4" />
        {/* Ground */}
        <rect x="0" y="180" width="360" height="20" fill={tier.terrain} opacity="0.7" />
      </svg>
      {/* Stars */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: 2 + (i % 3),
            height: 2 + (i % 3),
            left: `${(i * 37 + 11) % 100}%`,
            top: `${(i * 23 + 7) % 60}%`,
            opacity: 0.3 + (i % 4) * 0.15,
          }}
          animate={{ opacity: [0.2, 0.8, 0.2] }}
          transition={{ duration: 2 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
        />
      ))}
    </div>
  );
}

export default function ClashProgressPath() {
  const currentTier = getTier(USER.level);
  const [activeTierIdx, setActiveTierIdx] = useState(
    TIERS.findIndex(t => USER.level >= t.from && USER.level <= t.to)
  );
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [animXp, setAnimXp] = useState(0);
  const pathRef = useRef<HTMLDivElement>(null);
  const currentNodeRef = useRef<HTMLDivElement>(null);

  const activeTier = TIERS[activeTierIdx];
  const filteredLevels = LEVELS.filter(l => l.level >= activeTier.from && l.level <= activeTier.to);
  const xpPct = Math.round((USER.xp / USER.xpToNext) * 100);

  useEffect(() => {
    const t = setTimeout(() => setAnimXp(xpPct), 300);
    return () => clearTimeout(t);
  }, [xpPct]);

  useEffect(() => {
    const t = setTimeout(() => {
      currentNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 400);
    return () => clearTimeout(t);
  }, [activeTierIdx]);

  // Build path SVG between nodes
  const NODE_SPACING = 110;
  const PATH_WIDTH = 360;
  const nodeYPositions = filteredLevels.map((_, i) => (filteredLevels.length - 1 - i) * NODE_SPACING + 60);
  const totalHeight = filteredLevels.length * NODE_SPACING + 80;

  const buildSvgPath = () => {
    if (nodeYPositions.length < 2) return "";
    let d = "";
    for (let i = 0; i < nodeYPositions.length - 1; i++) {
      const xi = NODE_POSITIONS[i % NODE_POSITIONS.length].x;
      const yi = nodeYPositions[i];
      const xn = NODE_POSITIONS[(i + 1) % NODE_POSITIONS.length].x;
      const yn = nodeYPositions[i + 1];
      const mx = (xi + xn) / 2;
      const my = (yi + yn) / 2;
      if (i === 0) d += `M ${xi} ${yi} `;
      d += `Q ${xi} ${my} ${mx} ${my} Q ${xn} ${my} ${xn} ${yn} `;
    }
    return d;
  };

  return (
    <div
      className="relative overflow-hidden"
      style={{
        minHeight: "100vh",
        background: `linear-gradient(180deg, ${activeTier.sky} 0%, ${activeTier.terrain} 100%)`,
        fontFamily: "'system-ui', sans-serif",
      }}
    >
      {/* Ambient background */}
      <TierBackground tier={activeTier} />
      <Cloud x={20} y={30} scale={1.2} opacity={0.08} />
      <Cloud x={220} y={60} scale={0.8} opacity={0.06} />
      <Cloud x={-10} y={90} scale={1.5} opacity={0.05} />

      {/* Floating stickers in background */}
      {activeTier.stickers.map((s, i) => (
        <Particle
          key={s + i}
          x={[30, 300, 20, 310][i % 4]}
          y={[120, 180, 260, 90][i % 4]}
          emoji={s}
          delay={i * 0.7}
        />
      ))}

      {/* ── HERO HEADER ── */}
      <div className="relative z-10 px-4 pt-4 pb-3">
        <div
          className="relative overflow-hidden rounded-3xl p-4"
          style={{
            background: "rgba(0,0,0,0.55)",
            border: `2px solid ${activeTier.nodeColor}55`,
            boxShadow: `0 0 24px ${activeTier.glow}, 0 4px 0 #000`,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Decorative corner glows */}
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none" style={{ background: activeTier.glow, filter: "blur(30px)", transform: "translate(40%, -40%)" }} />

          <p className="text-xs font-black tracking-widest mb-1" style={{ color: activeTier.nodeColor }}>
            ⚡ SEVİYE SİSTEMİ
          </p>
          <h1 className="font-black text-white text-2xl leading-tight mb-3">İlerleme Yolu</h1>

          <div className="flex items-center gap-4">
            {/* XP Ring */}
            <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
              <XpRing percent={animXp} color={activeTier.nodeColor} size={80} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-black text-white" style={{ fontSize: 22, lineHeight: 1 }}>{USER.level}</span>
                <span className="font-black text-white/50" style={{ fontSize: 8 }}>SEVİYE</span>
              </div>
            </div>

            <div className="flex-1">
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-black mb-2"
                style={{
                  background: activeTier.nodeColor,
                  fontSize: 11,
                  letterSpacing: "0.07em",
                  boxShadow: `0 2px 8px ${activeTier.glow}`,
                }}
              >
                {currentTier.emoji} {currentTier.label}
              </div>
              <p className="font-black text-white text-lg leading-tight mb-1">{USER.name}</p>

              {/* XP bar */}
              <div className="relative">
                <div className="flex justify-between mb-1">
                  <span className="text-white font-bold" style={{ fontSize: 10 }}>{USER.xp.toLocaleString()} XP</span>
                  <span className="font-bold" style={{ fontSize: 10, color: activeTier.accent }}>{USER.xpToNext.toLocaleString()} XP</span>
                </div>
                <div
                  className="h-3 rounded-full overflow-hidden"
                  style={{ background: "rgba(255,255,255,0.1)", border: `1.5px solid ${activeTier.nodeColor}55` }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${activeTier.nodeBorder}, ${activeTier.nodeColor})`, boxShadow: `0 0 8px ${activeTier.glow}` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${animXp}%` }}
                    transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                  />
                </div>
                <p className="text-center font-bold mt-1" style={{ fontSize: 9, color: activeTier.accent }}>%{animXp} TAMAMLANDI</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { icon: "⚡", val: USER.xp.toLocaleString(), label: "TOPLAM XP" },
              { icon: "⭐", val: USER.points.toLocaleString(), label: "PUANLAR" },
              { icon: "🏆", val: LEVELS.filter(l => l.unlocked).length, label: "AÇILAN" },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-2 text-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: `1.5px solid ${activeTier.nodeColor}33`,
                }}
              >
                <div className="text-lg leading-none mb-0.5">{s.icon}</div>
                <div className="font-black text-white" style={{ fontSize: 14 }}>{s.val}</div>
                <div className="font-bold" style={{ fontSize: 7, color: activeTier.accent, letterSpacing: "0.05em" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TIER SELECTOR ── */}
      <div className="relative z-10 px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {TIERS.map((t, i) => {
            const active = i === activeTierIdx;
            const isCurrentTier = USER.level >= t.from && USER.level <= t.to;
            return (
              <motion.button
                key={t.id}
                onClick={() => setActiveTierIdx(i)}
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-2xl font-black"
                style={{
                  background: active
                    ? `linear-gradient(135deg, ${t.nodeColor}cc, ${t.nodeBorder}cc)`
                    : "rgba(255,255,255,0.08)",
                  border: active ? `2px solid ${t.nodeColor}` : "2px solid rgba(255,255,255,0.12)",
                  color: active ? "#000" : "#fff",
                  fontSize: 11,
                  boxShadow: active ? `0 0 16px ${t.glow}, 0 3px 0 ${t.nodeBorder}` : "0 2px 0 #0008",
                  letterSpacing: "0.04em",
                  position: "relative",
                }}
                whileTap={{ scale: 0.93 }}
                animate={active ? { scale: [1, 1.03, 1] } : {}}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span style={{ fontSize: 16 }}>{t.emoji}</span>
                {t.label}
                {isCurrentTier && (
                  <motion.div
                    className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full"
                    style={{ background: t.nodeColor, border: `2px solid #000` }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── WINDING PATH ── */}
      <div ref={pathRef} className="relative z-10 px-2 overflow-x-hidden" style={{ minHeight: totalHeight + 40 }}>
        {/* Path zone header */}
        <motion.div
          key={activeTier.id}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4"
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-black"
            style={{
              background: `linear-gradient(135deg, ${activeTier.nodeColor}22, ${activeTier.nodeBorder}44)`,
              border: `2px solid ${activeTier.nodeColor}66`,
              color: activeTier.nodeColor,
              fontSize: 12,
              letterSpacing: "0.08em",
              boxShadow: `0 0 12px ${activeTier.glow}`,
            }}
          >
            {activeTier.emoji} {activeTier.label} ZON — Lv.{activeTier.from}–{activeTier.to}
          </div>
        </motion.div>

        {/* SVG path under nodes */}
        <div className="relative mx-auto" style={{ width: PATH_WIDTH, height: totalHeight }}>
          <svg
            width={PATH_WIDTH}
            height={totalHeight}
            className="absolute inset-0"
            style={{ overflow: "visible" }}
          >
            {/* Dashed path trail */}
            <path
              d={buildSvgPath()}
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={12}
              strokeLinecap="round"
            />
            <path
              d={buildSvgPath()}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={20}
              strokeLinecap="round"
            />
            {/* Colored progress path */}
            <motion.path
              d={buildSvgPath()}
              fill="none"
              stroke={activeTier.nodeColor}
              strokeWidth={6}
              strokeLinecap="round"
              strokeDasharray="10 8"
              opacity={0.7}
              style={{ filter: `drop-shadow(0 0 4px ${activeTier.nodeColor})` }}
              animate={{ strokeDashoffset: [0, -18] }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          </svg>

          {/* Level nodes */}
          <AnimatePresence mode="wait">
            {filteredLevels.map((lvl, i) => {
              const posX = NODE_POSITIONS[i % NODE_POSITIONS.length].x;
              const posY = nodeYPositions[i];
              const tier = getTier(lvl.level);
              const isUnlocked = lvl.unlocked;
              const isCurrent = lvl.level === USER.level;
              const nodeSize = isCurrent ? 72 : isUnlocked ? 60 : 52;

              return (
                <motion.div
                  key={`${activeTier.id}-${lvl.level}`}
                  ref={isCurrent ? currentNodeRef : undefined}
                  className="absolute"
                  style={{
                    left: posX - nodeSize / 2,
                    top: posY - nodeSize / 2,
                    zIndex: isCurrent ? 20 : 10,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 20 }}
                >
                  <LevelNode
                    lvl={lvl}
                    posX={posX}
                    index={i}
                    isActive={true}
                    isUnlocked={isUnlocked}
                    tier={tier}
                    isCurrent={isCurrent}
                    onClick={() => setSelectedLevel(selectedLevel === lvl.level ? null : lvl.level)}
                    selected={selectedLevel === lvl.level}
                  />
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Decorative floating stickers on path */}
          {filteredLevels.length > 1 && filteredLevels.slice(0, -1).map((lvl, i) => {
            const posX = NODE_POSITIONS[i % NODE_POSITIONS.length].x;
            const nextPosX = NODE_POSITIONS[(i + 1) % NODE_POSITIONS.length].x;
            const midX = (posX + nextPosX) / 2;
            const midY = (nodeYPositions[i] + nodeYPositions[i + 1]) / 2;
            const decoration = ["⭐", "💫", "✨", "🌟", "💥"][i % 5];
            return (
              <motion.div
                key={`deco-${i}`}
                className="absolute pointer-events-none select-none"
                style={{ left: midX - 10, top: midY - 10, fontSize: 18, opacity: 0.5 }}
                animate={{ rotate: [0, 360], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 4 + i, repeat: Infinity, ease: "linear" }}
              >
                {decoration}
              </motion.div>
            );
          })}
        </div>

        {/* Max level card */}
        <motion.div
          className="mx-4 mb-8 mt-4 rounded-2xl p-4 flex items-center gap-4"
          style={{
            background: "linear-gradient(135deg, #FF3CAC33, #8B5CF633)",
            border: "2px solid #FF3CAC",
            boxShadow: "0 0 20px #FF3CAC44, 0 4px 0 #7c1a6a",
          }}
          animate={{ boxShadow: ["0 0 20px #FF3CAC44, 0 4px 0 #7c1a6a", "0 0 40px #FF3CAC88, 0 4px 0 #7c1a6a", "0 0 20px #FF3CAC44, 0 4px 0 #7c1a6a"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <motion.div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #FF3CAC, #8B5CF6)", boxShadow: "0 3px 0 #7c1a6a" }}
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            👑
          </motion.div>
          <div>
            <p className="font-black text-white" style={{ fontSize: 16 }}>Maksimum Seviye</p>
            <p className="font-bold" style={{ fontSize: 12, color: "#f0abfc" }}>Efsane ol. Tarihe geç. 👑</p>
          </div>
        </motion.div>
      </div>

      {/* ── LEVEL DETAIL POPUP ── */}
      <AnimatePresence>
        {selectedLevel !== null && (() => {
          const lvl = LEVELS.find(l => l.level === selectedLevel);
          if (!lvl) return null;
          const t = getTier(lvl.level);
          return (
            <motion.div
              key="popup"
              className="fixed inset-x-4 bottom-6 z-50 rounded-3xl p-5 overflow-hidden"
              style={{
                background: `linear-gradient(135deg, #0d0d0d, ${t.terrain})`,
                border: `2px solid ${t.nodeColor}`,
                boxShadow: `0 0 30px ${t.glow}, 0 -4px 0 ${t.nodeBorder}`,
              }}
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full pointer-events-none" style={{ background: t.glow, filter: "blur(30px)", transform: "translate(30%, -30%)" }} />

              <button
                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center font-black text-white/60"
                style={{ background: "rgba(255,255,255,0.1)", fontSize: 16 }}
                onClick={() => setSelectedLevel(null)}
              >
                ✕
              </button>

              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-black"
                  style={{ background: t.nodeColor, fontSize: 18, boxShadow: `0 3px 0 ${t.nodeBorder}` }}
                >
                  {lvl.unlocked ? "✓" : lvl.level}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 rounded-full font-black text-black"
                      style={{ background: t.nodeColor, fontSize: 10 }}
                    >
                      Lv.{lvl.level}
                    </span>
                    {lvl.level === USER.level && (
                      <span className="font-black" style={{ fontSize: 9, color: t.nodeColor }}>● ŞU AN</span>
                    )}
                  </div>
                  <p className="font-black text-white" style={{ fontSize: 18 }}>{lvl.title}</p>
                </div>
              </div>

              <div
                className="rounded-2xl p-3 mb-3"
                style={{ background: "rgba(255,255,255,0.06)", border: `1.5px solid ${t.nodeColor}33` }}
              >
                <p className="font-bold text-white/70" style={{ fontSize: 12 }}>
                  {lvl.unlocked
                    ? `🎉 Bu seviyeyi tamamladın! "${lvl.reward}" ödülünü kazandın.`
                    : `🔒 ${lvl.xpRequired.toLocaleString()} XP gerekli. ${lvl.xpRequired - USER.xp > 0 ? `${(lvl.xpRequired - USER.xp).toLocaleString()} XP kaldı.` : "Hazırsın!"}`}
                  {lvl.rewardPoints > 0 && ` +${lvl.rewardPoints} bonus puan kazanırsın!`}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="flex-1 py-2.5 rounded-2xl font-black text-center"
                  style={{
                    background: lvl.unlocked ? `linear-gradient(135deg, ${t.nodeColor}, ${t.nodeBorder})` : "rgba(255,255,255,0.08)",
                    color: lvl.unlocked ? "#000" : "#fff",
                    fontSize: 13,
                    border: lvl.unlocked ? `2px solid ${t.nodeBorder}` : "2px solid rgba(255,255,255,0.12)",
                  }}
                >
                  {lvl.unlocked ? "✓ Tamamlandı" : `🔒 ${lvl.xpRequired.toLocaleString()} XP`}
                </div>
                {lvl.rewardPoints > 0 && (
                  <div
                    className="flex items-center gap-1 px-3 py-2.5 rounded-2xl font-black"
                    style={{ background: "#facc15", color: "#000", fontSize: 13, border: "2px solid #713f12", boxShadow: "0 3px 0 #713f12" }}
                  >
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
}
