import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import { playSound } from '../lib/sounds';

const progressLevels = [
  { level: 1, title: 'Newcomer', xpRequired: 0, reward: 'Welcome Pack', unlocked: true, rewardPoints: 0 },
  { level: 2, title: 'Explorer', xpRequired: 200, reward: '50 Bonus Points', unlocked: true, rewardPoints: 50 },
  { level: 3, title: 'Seeker', xpRequired: 500, reward: '10% Off Coupon', unlocked: true, rewardPoints: 0 },
  { level: 4, title: 'Adventurer', xpRequired: 900, reward: '100 Bonus Points', unlocked: true, rewardPoints: 100 },
  { level: 5, title: 'Warrior', xpRequired: 1400, reward: 'Exclusive Badge', unlocked: true, rewardPoints: 0 },
  { level: 6, title: 'Champion', xpRequired: 2000, reward: '200 Bonus Points', unlocked: true, rewardPoints: 200 },
  { level: 7, title: 'Hero', xpRequired: 2700, reward: 'Free Coffee Coupon', unlocked: true, rewardPoints: 0 },
  { level: 8, title: 'Legend', xpRequired: 3500, reward: '300 Bonus Points', unlocked: true, rewardPoints: 300 },
  { level: 9, title: 'Mythic', xpRequired: 4400, reward: 'Mystery Box', unlocked: false, rewardPoints: 0 },
  { level: 10, title: 'Divine', xpRequired: 5500, reward: '500 Bonus Points', unlocked: false, rewardPoints: 500 },
  { level: 11, title: 'Cosmic', xpRequired: 6800, reward: 'Exclusive Item', unlocked: false, rewardPoints: 0 },
  { level: 12, title: 'Stellar', xpRequired: 8200, reward: '1000 Bonus Points', unlocked: false, rewardPoints: 1000 },
  { level: 15, title: 'Supreme', xpRequired: 12000, reward: 'VIP Status', unlocked: false, rewardPoints: 0 },
  { level: 20, title: 'Immortal', xpRequired: 20000, reward: 'Legendary Pack', unlocked: false, rewardPoints: 0 },
];

/* ══════════════════════════════════════════════════
   PALETTE — flat only, no gradients, no neon
══════════════════════════════════════════════════ */
const LEVEL_COLOR: Record<number, string> = {
  1:'#FFE500', 2:'#FF5722', 3:'#4CAF50', 4:'#2196F3',
  5:'#FF9800', 6:'#9C27B0', 7:'#F44336', 8:'#00BCD4',
  9:'#FFEB3B', 10:'#8BC34A', 11:'#E91E63', 12:'#03A9F4',
  13:'#FF7043', 14:'#43A047', 15:'#1565C0', 16:'#AD1457',
  17:'#E65100', 18:'#558B2F', 19:'#283593', 20:'#880E4F',
};
const getLvlColor = (lv: number) =>
  LEVEL_COLOR[lv] ?? ['#FFE500','#FF5722','#4CAF50','#2196F3','#FF9800'][lv % 5];

/* ── Tiers ── */
const TIERS = [
  { from:1,  to:4,  label:'BEGINNER', emoji:'🌱', color:'#FFE500', bg:'#FFF9C4' },
  { from:5,  to:8,  label:'WARRIOR',  emoji:'⚔️', color:'#4CAF50', bg:'#DCEDC8' },
  { from:9,  to:12, label:'HERO',     emoji:'🦸', color:'#2196F3', bg:'#BBDEFB' },
  { from:13, to:16, label:'LEGEND',   emoji:'🔥', color:'#FF5722', bg:'#FFCCBC' },
  { from:17, to:99, label:'IMMORTAL', emoji:'👑', color:'#E91E63', bg:'#FCE4EC' },
];
const getTier = (lv: number) => TIERS.find(t => lv >= t.from && lv <= t.to) ?? TIERS[0];

/* ── Path geometry ── */
const NODE_X   = [155, 265, 155, 45, 155, 265, 155, 45, 155, 265, 155, 45, 155, 155];
const NODE_GAP = 128;
const PATH_W   = 330;

/* ══════════════════════════════════════════════════
   SVG ILLUSTRATIONS & STICKERS
══════════════════════════════════════════════════ */

/** Five-pointed star sticker */
const SvgStar: React.ElementType = ({ size = 28, fill = '#FFE500', cls = '' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" className={cls} style={{ display:'block', filter:'drop-shadow(2px 2px 0 #000)' }}>
    <polygon points="14,2 17.4,10.3 26.5,10.5 19.7,16 22.1,25 14,20.1 5.9,25 8.3,16 1.5,10.5 10.6,10.3"
      fill={fill} stroke="#000" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/** Bold speech bubble */
const SvgSpeech: React.FC<{ text: string; color?: string; size?: number }> = ({ text, color = '#FFE500', size = 1 }) => (
  <svg width={72 * size} height={52 * size} viewBox="0 0 72 52" style={{ filter:'drop-shadow(3px 3px 0 #000)', display:'block' }}>
    <path d="M4 4 Q4 0 8 0 L64 0 Q68 0 68 4 L68 34 Q68 38 64 38 L24 38 L14 52 L18 38 L8 38 Q4 38 4 34 Z"
      fill={color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
    <text x="36" y="24" textAnchor="middle" fontWeight="900" fontSize={11 * size} fill="#000" fontFamily="system-ui">{text}</text>
  </svg>
);

/** Lightning bolt */
const SvgBolt: React.ElementType = ({ size = 28, fill = '#FFE500' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" style={{ filter:'drop-shadow(2px 2px 0 #000)', display:'block' }}>
    <polygon points="17,2 8,16 14,16 11,26 20,12 14,12" fill={fill} stroke="#000" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/** Diamond */
const SvgDiamond: React.ElementType = ({ size = 22, fill = '#2196F3', cls = '' }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" className={cls} style={{ filter:'drop-shadow(2px 2px 0 #000)', display:'block' }}>
    <polygon points="11,1 21,11 11,21 1,11" fill={fill} stroke="#000" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

/** Arrow right */
const SvgArrow: React.FC<{ fill?: string; rotate?: number }> = ({ fill = '#FF5722', rotate = 0 }) => (
  <svg width={32} height={22} viewBox="0 0 32 22" style={{ transform:`rotate(${rotate}deg)`, filter:'drop-shadow(2px 2px 0 #000)', display:'block' }}>
    <path d="M0 9 L20 9 L20 4 L32 11 L20 18 L20 13 L0 13 Z" fill={fill} stroke="#000" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

/** Zigzag line decoration */
const SvgZigzag: React.FC<{ color?: string; w?: number }> = ({ color = '#FFE500', w = 80 }) => (
  <svg width={w} height={16} viewBox={`0 0 ${w} 16`} style={{ display:'block' }}>
    <polyline
      points={Array.from({ length: Math.floor(w / 10) }, (_, i) => `${i * 10},${i % 2 === 0 ? 14 : 2}`).join(' ')}
      fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

/** Dot cluster */
const SvgDots: React.FC<{ color?: string }> = ({ color = '#4CAF50' }) => (
  <svg width={40} height={40} viewBox="0 0 40 40" style={{ display:'block' }}>
    {[0,13,26].flatMap(x => [0,13,26].map(y => (
      <circle key={`${x}-${y}`} cx={x+7} cy={y+7} r="4" fill={color} stroke="#000" strokeWidth="1.5" />
    )))}
  </svg>
);

/** Tier mascot illustrations */
const TierMascot: React.FC<{ tier: typeof TIERS[0]; size?: number }> = ({ tier, size = 56 }) => {
  const s = size;
  if (tier.label === 'BEGINNER') return (
    <svg width={s} height={s} viewBox="0 0 56 56" style={{ display:'block', filter:'drop-shadow(2px 3px 0 #000)' }}>
      <rect x="23" y="34" width="10" height="16" rx="3" fill="#8B4513" stroke="#000" strokeWidth="2"/>
      <ellipse cx="28" cy="22" rx="14" ry="16" fill={tier.color} stroke="#000" strokeWidth="2.5"/>
      <ellipse cx="22" cy="14" rx="6" ry="8" fill={tier.color} stroke="#000" strokeWidth="2" transform="rotate(-20,22,14)"/>
      <ellipse cx="34" cy="13" rx="5" ry="7" fill={tier.color} stroke="#000" strokeWidth="2" transform="rotate(15,34,13)"/>
      <circle cx="24" cy="22" r="2.5" fill="#000"/>
      <circle cx="32" cy="22" r="2.5" fill="#000"/>
      <path d="M24 28 Q28 32 32 28" stroke="#000" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  );
  if (tier.label === 'WARRIOR') return (
    <svg width={s} height={s} viewBox="0 0 56 56" style={{ display:'block', filter:'drop-shadow(2px 3px 0 #000)' }}>
      <rect x="26" y="4" width="6" height="36" rx="3" fill={tier.color} stroke="#000" strokeWidth="2.5"/>
      <polygon points="29,2 36,12 29,10 22,12" fill={tier.color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
      <rect x="14" y="22" width="30" height="7" rx="3" fill="#9E9E9E" stroke="#000" strokeWidth="2"/>
      <rect x="20" y="38" width="18" height="14" rx="4" fill="#757575" stroke="#000" strokeWidth="2"/>
    </svg>
  );
  if (tier.label === 'HERO') return (
    <svg width={s} height={s} viewBox="0 0 56 56" style={{ display:'block', filter:'drop-shadow(2px 3px 0 #000)' }}>
      <path d="M28 4 L10 16 L10 32 Q10 46 28 52 Q46 46 46 32 L46 16 Z" fill={tier.color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M28 14 L32 24 L43 24 L34 30 L37 41 L28 35 L19 41 L22 30 L13 24 L24 24 Z" fill="#fff" stroke="#000" strokeWidth="1.5"/>
    </svg>
  );
  if (tier.label === 'LEGEND') return (
    <svg width={s} height={s} viewBox="0 0 56 56" style={{ display:'block', filter:'drop-shadow(2px 3px 0 #000)' }}>
      <ellipse cx="28" cy="42" rx="16" ry="6" fill="#FF9800" stroke="#000" strokeWidth="2"/>
      <path d="M18 42 Q14 28 20 18 Q24 10 28 8 Q26 20 30 22 Q32 14 36 10 Q40 20 36 30 Q34 36 38 42 Z" fill={tier.color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
      <path d="M22 42 Q22 32 26 26 Q27 32 28 34 Q30 28 32 24 Q34 34 34 42 Z" fill="#FFEB3B" stroke="#000" strokeWidth="1.5"/>
    </svg>
  );
  // IMMORTAL — crown
  return (
    <svg width={s} height={s} viewBox="0 0 56 56" style={{ display:'block', filter:'drop-shadow(2px 3px 0 #000)' }}>
      <rect x="10" y="34" width="36" height="14" rx="4" fill={tier.color} stroke="#000" strokeWidth="2.5"/>
      <path d="M10 34 L10 18 L19 28 L28 10 L37 28 L46 18 L46 34 Z" fill={tier.color} stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
      <circle cx="28" cy="10" r="4" fill="#FFE500" stroke="#000" strokeWidth="2"/>
      <circle cx="10" cy="18" r="3" fill="#FFE500" stroke="#000" strokeWidth="2"/>
      <circle cx="46" cy="18" r="3" fill="#FFE500" stroke="#000" strokeWidth="2"/>
      <rect x="14" y="38" width="8" height="6" rx="2" fill="#fff" opacity="0.35"/>
    </svg>
  );
};

/* ══════════════════════════════════════════════════
   XP PROGRESS BAR
══════════════════════════════════════════════════ */
const XpBar: React.FC<{ pct: number; color: string }> = ({ pct, color }) => (
  <div style={{
    height: 22, borderRadius: 8, background: 'var(--tab-bg)',
    border: '3px solid #000', boxShadow: '3px 3px 0 #000',
    overflow: 'hidden', position: 'relative',
  }}>
    <div style={{
      height: '100%', width: `${pct}%`, background: color, borderRadius: 5,
      transition: 'width 1.3s cubic-bezier(0.22,1,0.36,1)',
    }} />
    {/* Stripe overlay */}
    <div style={{
      position: 'absolute', inset: 0,
      background: 'repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.06) 6px, rgba(0,0,0,0.06) 12px)',
      borderRadius: 5,
    }} />
    <span style={{
      position: 'absolute', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 900, fontSize: 10, color: '#000', letterSpacing: '0.08em',
    }}>
      %{pct} TAMAMLANDI
    </span>
  </div>
);

/* ══════════════════════════════════════════════════
   LEVEL NODE
══════════════════════════════════════════════════ */
const LevelNode: React.FC<{
  lvl:       typeof progressLevels[0];
  posX:      number;
  isCurrent: boolean;
  isSelected:boolean;
  onClick:   () => void;
}> = ({ lvl, posX, isCurrent, isSelected, onClick }) => {
  const color    = getLvlColor(lvl.level);
  const size     = isCurrent ? 88 : lvl.unlocked ? 76 : 66;
  const shadow   = isSelected ? 2 : isCurrent ? 6 : 5;
  const labelRight = posX > 165;

  return (
    <div style={{ position:'relative', width:size, height:size }}>

      {/* Outer glow ring — current only */}
      {isCurrent && (
        <div className="ring-pulse" style={{
          position:'absolute', inset:-8, borderRadius: size*0.35+8,
          border: `3px solid ${color}`, boxShadow:`0 0 0 3px ${color}55`,
          pointerEvents:'none',
        }} />
      )}

      {/* Main node */}
      <button
        onClick={() => { playSound('click'); onClick(); }}
        className={isCurrent ? 'node-wobble' : lvl.unlocked ? 'node-float' : ''}
        style={{
          width:size, height:size,
          borderRadius: isCurrent ? 24 : 20,
          background: lvl.unlocked || isCurrent ? color : 'var(--card-bg)',
          border: `3.5px solid #000`,
          boxShadow: `${shadow}px ${shadow}px 0 #000`,
          transform: isSelected ? `translate(${shadow-1}px,${shadow-1}px)` : 'none',
          cursor:'pointer',
          display:'flex', flexDirection:'column',
          alignItems:'center', justifyContent:'center',
          padding:0, position:'relative', overflow:'hidden',
          transition:'transform 0.08s, box-shadow 0.08s',
        }}
      >
        {/* Hatch for locked */}
        {!lvl.unlocked && !isCurrent && (
          <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:0.12 }}>
            <defs>
              <pattern id={`h${lvl.level}`} width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="8" stroke="#000" strokeWidth="3.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#h${lvl.level})`}/>
          </svg>
        )}

        {/* Content */}
        {lvl.unlocked ? (
          <svg width={size*0.46} height={size*0.46} viewBox="0 0 32 32">
            <polyline points="6,17 13,24 26,8" fill="none" stroke="#000" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : isCurrent ? (
          <>
            <span style={{ fontSize:9, fontWeight:900, color:'#000', letterSpacing:'0.1em', lineHeight:1 }}>LV</span>
            <span style={{ fontSize:28, fontWeight:900, color:'#000', lineHeight:1 }}>{lvl.level}</span>
          </>
        ) : (
          <>
            <span style={{ fontSize:18, lineHeight:1 }}>🔒</span>
            <span style={{ fontSize:9, fontWeight:900, color:'var(--text-muted)', letterSpacing:'0.06em', lineHeight:1.4 }}>Lv.{lvl.level}</span>
          </>
        )}

        {/* Top-left shine */}
        <div style={{
          position:'absolute', top:5, left:7, width:'34%', height:'26%',
          borderRadius:6, background:'rgba(255,255,255,0.4)', pointerEvents:'none',
        }}/>
      </button>

      {/* ŞU AN badge */}
      {isCurrent && (
        <div className="badge-float" style={{
          position:'absolute', top:-32, left:'50%', transform:'translateX(-50%)',
          whiteSpace:'nowrap',
          background: color, border:'2.5px solid #000', boxShadow:'2px 2px 0 #000',
          borderRadius:8, padding:'3px 9px',
          fontSize:9, fontWeight:900, color:'#000', letterSpacing:'0.08em',
        }}>● ŞU AN</div>
      )}

      {/* Level pill (unlocked) */}
      {lvl.unlocked && (
        <div style={{
          position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)',
          background:'#000', color:'#fff', borderRadius:6,
          padding:'2px 8px', fontSize:9, fontWeight:900,
          letterSpacing:'0.06em', whiteSpace:'nowrap',
          border:'2px solid #000',
        }}>Lv.{lvl.level}</div>
      )}

      {/* Reward star badge */}
      {lvl.rewardPoints > 0 && (
        <div style={{
          position:'absolute', bottom:-11, right:-10,
          background:'#FFE500', border:'2.5px solid #000', boxShadow:'2px 2px 0 #000',
          borderRadius:7, padding:'2px 7px',
          fontSize:9, fontWeight:900, color:'#000', whiteSpace:'nowrap',
        }}>⭐{lvl.rewardPoints}</div>
      )}

      {/* Side label */}
      <div style={{
        position:'absolute', top:'50%', transform:'translateY(-50%)',
        [labelRight ? 'right' : 'left']: size + 14,
        textAlign: labelRight ? 'right' : 'left',
        minWidth:86, pointerEvents:'none',
      }}>
        <span style={{
          display:'block', fontWeight:900, fontSize:12,
          color:'var(--text-dark)', lineHeight:1.2,
          letterSpacing:'0.01em',
        }}>{lvl.title}</span>
        <span style={{
          display:'block', fontWeight:700, fontSize:10, marginTop:3,
          color: lvl.unlocked ? '#22c55e' : 'var(--text-muted)',
        }}>
          {lvl.unlocked ? `✓ ${lvl.reward}` : `${lvl.xpRequired.toLocaleString()} XP`}
        </span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════
   SCATTERED BACKGROUND STICKERS
══════════════════════════════════════════════════ */
const BgStickers: React.FC<{ tier: typeof TIERS[0] }> = ({ tier }) => (
  <>
    {/* Top-left star */}
    <div className="stk-spin-slow" style={{ position:'absolute', top:14, left:8, zIndex:0, opacity:0.85 }}>
      <SvgStar size={30} fill={tier.color}/>
    </div>
    {/* Top-right bolt */}
    <div className="stk-float-a" style={{ position:'absolute', top:8, right:10, zIndex:0, opacity:0.85 }}>
      <SvgBolt size={26} fill={tier.color}/>
    </div>
    {/* Mid-left diamond */}
    <div className="stk-spin-slow" style={{ position:'absolute', top:'38%', left:4, zIndex:0, opacity:0.7 }}>
      <SvgDiamond size={20} fill={tier.color}/>
    </div>
    {/* Mid-right dots */}
    <div className="stk-float-b" style={{ position:'absolute', top:'52%', right:2, zIndex:0, opacity:0.6 }}>
      <SvgDots color={tier.color}/>
    </div>
    {/* Bottom zigzag */}
    <div className="stk-float-a" style={{ position:'absolute', bottom:'18%', left:6, zIndex:0, opacity:0.7 }}>
      <SvgZigzag color={tier.color} w={70}/>
    </div>
    {/* Arrow pointing down-ish */}
    <div className="stk-float-b" style={{ position:'absolute', bottom:'30%', right:8, zIndex:0, opacity:0.75 }}>
      <SvgArrow fill={tier.color} rotate={90}/>
    </div>
  </>
);

/* ══════════════════════════════════════════════════
   TIER ZONE BANNER
══════════════════════════════════════════════════ */
const TierBanner: React.FC<{ tier: typeof TIERS[0]; unlocked:number; total:number }> = ({ tier, unlocked, total }) => (
  <div style={{
    display:'flex', alignItems:'center', gap:14,
    border:'3px solid #000', boxShadow:'5px 5px 0 #000',
    borderRadius:18, padding:'12px 16px 12px 12px',
    background: tier.bg, marginBottom:20,
    overflow:'hidden', position:'relative',
  }}>
    {/* Stripe accent bar */}
    <div style={{
      position:'absolute', left:0, top:0, bottom:0, width:8,
      background: tier.color, borderRadius:'15px 0 0 15px',
    }}/>

    <div style={{ marginLeft:4 }}>
      <TierMascot tier={tier} size={52}/>
    </div>

    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
        <span style={{
          background:tier.color, border:'2.5px solid #000',
          borderRadius:7, padding:'2px 10px',
          fontSize:10, fontWeight:900, color:'#000', letterSpacing:'0.08em',
          boxShadow:'2px 2px 0 #000',
        }}>{tier.emoji} {tier.label}</span>
        <span style={{
          background:'#000', color:'#fff',
          borderRadius:7, padding:'2px 8px',
          fontSize:9, fontWeight:900, letterSpacing:'0.06em',
        }}>Lv.{tier.from}–{tier.to === 99 ? '∞' : tier.to}</span>
      </div>
      <p style={{ fontWeight:900, fontSize:13, color:'#000', margin:0 }}>
        Seviye Ödülleri
      </p>
      <p style={{ fontSize:10, fontWeight:700, color:'#000', margin:'2px 0 0', opacity:0.6 }}>
        {unlocked}/{total} seviye tamamlandı
      </p>
    </div>

    {/* Progress fraction badge */}
    <div style={{
      background:'#000', color:'#fff',
      border:'2.5px solid #000', boxShadow:'2px 2px 0 #000',
      borderRadius:10, padding:'5px 10px', textAlign:'center',
      flexShrink:0,
    }}>
      <div style={{ fontSize:18, fontWeight:900, lineHeight:1 }}>{unlocked}</div>
      <div style={{ fontSize:8, fontWeight:900, opacity:0.6, letterSpacing:'0.06em' }}>/{total}</div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const ProgressPath: React.FC = () => {
  const { user, points } = useApp();
  const [animXp, setAnimXp]       = useState(0);
  const [activeTierIdx, setActiveTierIdx] = useState(
    () => TIERS.findIndex(t => user.level >= t.from && user.level <= t.to)
  );
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);

  const activeTier    = TIERS[activeTierIdx] ?? TIERS[0];
  const currentTier   = getTier(user.level);
  const filteredLevels = progressLevels.filter(l => l.level >= activeTier.from && l.level <= activeTier.to);
  const xpPct          = Math.round((user.xp / user.xpToNext) * 100);
  const xpRemaining    = user.xpToNext - user.xp;
  const unlockedCount  = progressLevels.filter(l => l.unlocked).length;

  const nodeYs    = filteredLevels.map((_, i) => (filteredLevels.length - 1 - i) * NODE_GAP + 68);
  const totalH    = filteredLevels.length * NODE_GAP + 100;

  useEffect(() => {
    const t = setTimeout(() => setAnimXp(xpPct), 280);
    return () => clearTimeout(t);
  }, [xpPct]);

  useEffect(() => {
    const t = setTimeout(() => {
      currentRef.current?.scrollIntoView({ behavior:'smooth', block:'center' });
    }, 500);
    return () => clearTimeout(t);
  }, [activeTierIdx]);

  /* SVG path between nodes */
  const buildPath = () => {
    if (nodeYs.length < 2) return '';
    let d = '';
    for (let i = 0; i < nodeYs.length - 1; i++) {
      const xi = NODE_X[i % NODE_X.length];
      const yi = nodeYs[i];
      const xn = NODE_X[(i+1) % NODE_X.length];
      const yn = nodeYs[i+1];
      const my = (yi + yn) / 2;
      if (i === 0) d += `M ${xi} ${yi} `;
      d += `C ${xi} ${my}, ${xn} ${my}, ${xn} ${yn} `;
    }
    return d;
  };

  const selLvl = progressLevels.find(l => l.level === selectedLevel);

  return (
    <div style={{ position:'relative', minHeight:'100vh', overflowX:'hidden' }}>

      {/* ── CSS Animations & util classes ── */}
      <style>{`
        @keyframes wobble {
          0%,100%{ transform:rotate(0deg) translateY(0px); }
          20%     { transform:rotate(-3deg) translateY(-3px); }
          40%     { transform:rotate(3deg) translateY(-5px); }
          60%     { transform:rotate(-2deg) translateY(-3px); }
          80%     { transform:rotate(2deg) translateY(-1px); }
        }
        @keyframes floatA {
          0%,100%{ transform:translateY(0px); }
          50%    { transform:translateY(-7px); }
        }
        @keyframes floatB {
          0%,100%{ transform:translateY(0px); }
          50%    { transform:translateY(-4px); }
        }
        @keyframes badgeFloat {
          0%,100%{ transform:translateX(-50%) translateY(0px); }
          50%    { transform:translateX(-50%) translateY(-5px); }
        }
        @keyframes spinSlow {
          from{ transform:rotate(0deg); }
          to  { transform:rotate(360deg); }
        }
        @keyframes ringPulse {
          0%,100%{ opacity:0.5; transform:scale(1); }
          50%    { opacity:1;   transform:scale(1.08); }
        }
        @keyframes decoSpin {
          0%  { transform:rotate(0deg)   scale(1); }
          50% { transform:rotate(180deg) scale(1.25); }
          100%{ transform:rotate(360deg) scale(1); }
        }
        @keyframes popIn {
          from{ transform:translateY(80px) scale(0.92); opacity:0; }
          to  { transform:translateY(0px)  scale(1);    opacity:1; }
        }
        @keyframes tierSlide {
          from{ transform:translateX(-14px); opacity:0; }
          to  { transform:translateX(0px);   opacity:1; }
        }
        @keyframes dashMove {
          from{ stroke-dashoffset:0; }
          to  { stroke-dashoffset:-24; }
        }

        .node-wobble { animation: wobble 2s ease-in-out infinite; }
        .node-float  { animation: floatA 3.5s ease-in-out infinite; }
        .badge-float { animation: badgeFloat 2s ease-in-out infinite; }
        .stk-spin-slow { animation: spinSlow 8s linear infinite; }
        .stk-float-a   { animation: floatA 4s ease-in-out infinite; }
        .stk-float-b   { animation: floatB 5s ease-in-out infinite; }
        .ring-pulse    { animation: ringPulse 2s ease-in-out infinite; }
        .deco-spin     { animation: decoSpin linear infinite; }
        .popup-in      { animation: popIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .tier-slide    { animation: tierSlide 0.3s ease both; }
        .dash-path     { animation: dashMove 0.6s linear infinite; }

        .tier-scroll::-webkit-scrollbar { display:none; }
        .tier-scroll { -ms-overflow-style:none; scrollbar-width:none; }
        .nb-press:active { transform:translate(2px,2px) !important; }
      `}</style>

      {/* ── Large watermark ── */}
      <div style={{
        position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0,
      }}>
        <div style={{
          position:'absolute', top:'6%', left:'50%',
          transform:'translateX(-50%) rotate(-6deg)',
          fontSize:'clamp(52px,13vw,190px)', fontWeight:900,
          color:'var(--dark-border)', opacity:0.035,
          whiteSpace:'nowrap', lineHeight:1, letterSpacing:'-0.04em',
          userSelect:'none',
        }}>SEVİYE</div>
      </div>

      <div
        className="page-enter p-3 sm:p-4 max-w-lg mx-auto"
        style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:16, paddingBottom:32 }}
      >

        {/* ════════════════════════════════
            HERO CARD
        ════════════════════════════════ */}
        <div>
          <p className="section-label">⚡ SEVİYE SİSTEMİ</p>
          <h1 className="section-title" style={{ fontSize:'clamp(24px,6vw,32px)', marginBottom:12 }}>İlerleme Yolu</h1>
        </div>

        <div style={{
          border:'3px solid #000', boxShadow:'6px 6px 0 #000',
          borderRadius:22, background:'var(--card-bg)', overflow:'hidden',
          position:'relative',
        }}>
          {/* Scattered stickers inside hero card */}
          <div style={{ position:'absolute', top:10, right:12, opacity:0.7, zIndex:0 }} className="stk-float-a">
            <SvgStar size={24} fill={currentTier.color}/>
          </div>
          <div style={{ position:'absolute', bottom:40, right:8, opacity:0.55, zIndex:0 }} className="stk-spin-slow">
            <SvgDiamond size={16} fill={currentTier.color}/>
          </div>

          {/* Tier color stripe */}
          <div style={{
            background: currentTier.color,
            borderBottom:'3px solid #000',
            padding:'11px 18px',
            display:'flex', alignItems:'center', justifyContent:'space-between',
            position:'relative', zIndex:1,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <TierMascot tier={currentTier} size={36}/>
              <div>
                <p style={{ fontSize:9, fontWeight:900, color:'#000', letterSpacing:'0.1em', margin:0 }}>SEVİYE SİSTEMİ</p>
                <p style={{ fontSize:14, fontWeight:900, color:'#000', margin:0, lineHeight:1 }}>{currentTier.label}</p>
              </div>
            </div>
            <div style={{
              background:'#000', color: currentTier.color,
              border:'2.5px solid #000',
              borderRadius:10, padding:'4px 12px',
              fontSize:13, fontWeight:900, letterSpacing:'0.06em',
              boxShadow:'3px 3px 0 rgba(0,0,0,0.3)',
            }}>LV.{user.level}</div>
          </div>

          {/* XP section */}
          <div style={{ padding:'16px 18px 14px', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:14 }}>
              {/* Level square */}
              <div style={{
                width:78, height:78, flexShrink:0,
                border:'3.5px solid #000', boxShadow:'5px 5px 0 #000',
                borderRadius:18, background: getLvlColor(user.level),
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
              }}>
                <span style={{ fontSize:8, fontWeight:900, color:'#000', letterSpacing:'0.08em' }}>SEVİYE</span>
                <span style={{ fontSize:32, fontWeight:900, color:'#000', lineHeight:1 }}>{user.level}</span>
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:900, fontSize:19, color:'var(--text-dark)', margin:'0 0 3px' }}>Şampiyon</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:'0 0 10px', fontWeight:700 }}>
                  ⚡ {xpRemaining.toLocaleString()} XP → Lv.{user.level + 1}
                </p>
                <XpBar pct={animXp} color={currentTier.color}/>
              </div>
            </div>

            {/* Speech bubble tip */}
            <div style={{ position:'absolute', right:14, top:14 }} className="stk-float-b">
              <SvgSpeech text="LEVEL UP!" color={currentTier.color} size={0.75}/>
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'3px solid #000' }}>
            {[
              { emoji:'⚡', val: user.xp.toLocaleString(),    label:'TOPLAM XP', color:'#FFE500' },
              { emoji:'⭐', val: points.toLocaleString(),      label:'PUANLAR',  color:'#4CAF50' },
              { emoji:'🏆', val: unlockedCount,                label:'AÇILAN',   color:'#2196F3' },
            ].map((s, i) => (
              <div key={s.label} style={{
                padding:'11px 6px', textAlign:'center',
                borderLeft: i > 0 ? '3px solid #000' : 'none',
                position:'relative', overflow:'hidden',
              }}>
                <div style={{
                  width:32, height:32, borderRadius:9, margin:'0 auto 5px',
                  background: s.color, border:'2.5px solid #000', boxShadow:'2px 2px 0 #000',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
                }}>{s.emoji}</div>
                <p style={{ fontWeight:900, fontSize:16, color:'var(--text-dark)', margin:'0 0 1px', lineHeight:1 }}>{s.val}</p>
                <p style={{ fontSize:8, color:'var(--text-muted)', margin:0, fontWeight:900, letterSpacing:'0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════
            TIER SELECTOR
        ════════════════════════════════ */}
        <div>
          <p style={{ fontSize:11, fontWeight:900, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.09em', margin:'0 0 8px', paddingLeft:2 }}>
            Kategori
          </p>
          <div className="tier-scroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
            {TIERS.map((t, i) => {
              const active  = i === activeTierIdx;
              const inTier  = user.level >= t.from && user.level <= t.to;
              return (
                <button
                  key={t.label}
                  className="nb-press"
                  onClick={() => { playSound('click'); setActiveTierIdx(i); setSelectedLevel(null); }}
                  style={{
                    flexShrink:0, display:'flex', alignItems:'center', gap:8,
                    padding:'9px 14px', borderRadius:13, cursor:'pointer',
                    background: active ? t.color : 'var(--card-bg)',
                    border:'3px solid #000',
                    boxShadow: active ? '4px 4px 0 #000' : '3px 3px 0 #000',
                    color:'#000', fontWeight:900, fontSize:11, letterSpacing:'0.04em',
                    position:'relative', transition:'box-shadow 0.08s, transform 0.08s',
                  }}
                >
                  <span style={{ fontSize:15 }}>{t.emoji}</span>
                  {t.label}
                  {inTier && !active && (
                    <span style={{
                      position:'absolute', top:-5, right:-5,
                      width:11, height:11, borderRadius:'50%',
                      background: t.color, border:'2px solid #000',
                    }}/>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ════════════════════════════════
            WINDING PATH
        ════════════════════════════════ */}
        <div className="tier-slide" key={activeTier.label} style={{ position:'relative' }}>

          {/* Tier banner */}
          <TierBanner
            tier={activeTier}
            unlocked={filteredLevels.filter(l => l.unlocked).length}
            total={filteredLevels.length}
          />

          {/* Background stickers */}
          <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
            <BgStickers tier={activeTier}/>
          </div>

          {/* Path container */}
          <div style={{ position:'relative', width:PATH_W, margin:'0 auto', height:totalH }}>

            {/* SVG path */}
            <svg
              width={PATH_W} height={totalH}
              style={{ position:'absolute', inset:0, overflow:'visible' }}
            >
              {/* Thick shadow */}
              <path d={buildPath()} fill="none" stroke="#000" strokeWidth={14}
                strokeLinecap="round" opacity={0.1} transform="translate(5,5)"/>
              {/* White base */}
              <path d={buildPath()} fill="none" stroke="var(--card-bg)"
                strokeWidth={10} strokeLinecap="round"/>
              {/* Border */}
              <path d={buildPath()} fill="none" stroke="#000"
                strokeWidth={10} strokeLinecap="round" strokeOpacity={0.25}/>
              {/* Colored dashes — animated */}
              <path
                className="dash-path"
                d={buildPath()} fill="none"
                stroke={activeTier.color} strokeWidth={5} strokeLinecap="round"
                strokeDasharray="12 12" opacity={0.9}
              />
            </svg>

            {/* Spinning deco between nodes */}
            {filteredLevels.slice(0,-1).map((lvl, i) => {
              const xi   = NODE_X[i % NODE_X.length];
              const xn   = NODE_X[(i+1) % NODE_X.length];
              const midX = (xi + xn) / 2;
              const midY = (nodeYs[i] + nodeYs[i+1]) / 2;
              const shapes = [
                <SvgStar key="s" size={18} fill={getLvlColor(lvl.level)}/>,
                <SvgDiamond key="d" size={16} fill={getLvlColor(lvl.level)}/>,
                <SvgBolt key="b" size={18} fill={getLvlColor(lvl.level)}/>,
                <SvgStar key="s2" size={14} fill={getLvlColor(lvl.level)}/>,
              ];
              return (
                <div
                  key={`deco-${i}`}
                  className="deco-spin"
                  style={{
                    position:'absolute',
                    left: midX - 10, top: midY - 10,
                    animationDuration:`${3.5 + (i % 4) * 0.7}s`,
                    animationDelay:`${i * 0.25}s`,
                    pointerEvents:'none',
                  }}
                >
                  {shapes[i % shapes.length]}
                </div>
              );
            })}

            {/* Level nodes */}
            {filteredLevels.map((lvl, i) => {
              const posX      = NODE_X[i % NODE_X.length];
              const posY      = nodeYs[i];
              const isCurrent = lvl.level === user.level;
              const nodeSize  = isCurrent ? 88 : lvl.unlocked ? 76 : 66;

              return (
                <div
                  key={`node-${lvl.level}`}
                  ref={isCurrent ? currentRef : undefined}
                  style={{
                    position:'absolute',
                    left: posX - nodeSize / 2,
                    top:  posY - nodeSize / 2,
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

          {/* Tip at bottom of path */}
          <div style={{ display:'flex', justifyContent:'center', marginTop:8, gap:10 }}>
            <SvgZigzag color={activeTier.color} w={60}/>
            <SvgArrow fill={activeTier.color} rotate={90}/>
            <SvgZigzag color={activeTier.color} w={60}/>
          </div>
        </div>

        {/* ════════════════════════════════
            MAX LEVEL CARD
        ════════════════════════════════ */}
        <div style={{
          display:'flex', alignItems:'center', gap:16,
          border:'3.5px solid #000', boxShadow:'6px 6px 0 #000',
          borderRadius:20, padding:'14px 18px',
          background:'#E91E63', position:'relative', overflow:'hidden',
        }}>
          {/* Corner stars */}
          <div style={{ position:'absolute', top:8, right:12 }} className="stk-spin-slow">
            <SvgStar size={22} fill="#FFE500"/>
          </div>
          <div style={{ position:'absolute', bottom:6, right:46 }} className="stk-float-b">
            <SvgDiamond size={14} fill="#fff"/>
          </div>

          <div style={{
            width:52, height:52, borderRadius:14, flexShrink:0,
            background:'#000', border:'3px solid #000',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
          }}>👑</div>
          <div>
            <p style={{ fontWeight:900, fontSize:16, color:'#000', margin:0 }}>Maksimum Seviye</p>
            <p style={{ fontSize:12, color:'#000', margin:'2px 0 0', fontWeight:700, opacity:0.75 }}>
              Efsane ol. Tarihe geç.
            </p>
          </div>
        </div>

      </div>

      {/* ════════════════════════════════
          LEVEL DETAIL POPUP
      ════════════════════════════════ */}
      {selLvl && (
        <div
          className="popup-in"
          style={{
            position:'fixed', left:10, right:10, bottom:76, zIndex:200,
            border:'3.5px solid #000', boxShadow:'7px 7px 0 #000',
            borderRadius:24, overflow:'hidden',
            background:'var(--card-bg)',
          }}
        >
          {/* Header stripe */}
          <div style={{
            background: getLvlColor(selLvl.level),
            borderBottom:'3px solid #000',
            padding:'12px 16px',
            display:'flex', alignItems:'center', gap:12,
            position:'relative',
          }}>
            {/* Decorative sticker */}
            <div style={{ position:'absolute', top:6, right:48 }} className="stk-spin-slow">
              <SvgStar size={18} fill="#fff"/>
            </div>

            {/* Icon */}
            <div style={{
              width:46, height:46, borderRadius:13, flexShrink:0,
              background:'#000', border:'2.5px solid #000',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: selLvl.unlocked ? 22 : 18, fontWeight:900,
              color: getLvlColor(selLvl.level),
            }}>
              {selLvl.unlocked ? '✓' : selLvl.level}
            </div>

            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:2 }}>
                <span style={{
                  background:'#000', color: getLvlColor(selLvl.level),
                  borderRadius:7, padding:'2px 8px',
                  fontSize:9, fontWeight:900, letterSpacing:'0.06em',
                }}>Lv.{selLvl.level}</span>
                {selLvl.level === user.level && (
                  <span style={{ fontSize:9, fontWeight:900, color:'#000', letterSpacing:'0.06em' }}>● ŞU AN</span>
                )}
                {selLvl.unlocked && (
                  <span style={{
                    background:'#000', color:'#22c55e',
                    borderRadius:7, padding:'2px 8px',
                    fontSize:9, fontWeight:900,
                  }}>✓ AÇIK</span>
                )}
              </div>
              <p style={{ fontWeight:900, fontSize:20, color:'#000', margin:0, lineHeight:1 }}>{selLvl.title}</p>
            </div>

            <button
              onClick={() => { playSound('click'); setSelectedLevel(null); }}
              style={{
                width:32, height:32, borderRadius:9, flexShrink:0,
                background:'#000', color: getLvlColor(selLvl.level),
                border:'2px solid #000', fontSize:17, fontWeight:900,
                cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
                boxShadow:'2px 2px 0 rgba(0,0,0,0.3)',
              }}
            >✕</button>
          </div>

          {/* Body */}
          <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:12 }}>

            {/* Description box */}
            <div style={{
              background:'var(--tab-bg)',
              border:'2.5px solid #000', boxShadow:'3px 3px 0 #000',
              borderRadius:14, padding:'11px 13px',
              position:'relative',
            }}>
              <div style={{ position:'absolute', top:-12, right:16 }}>
                <SvgSpeech text={selLvl.unlocked ? 'TEBRIKLER!' : 'DEVAM ET!'} color={getLvlColor(selLvl.level)} size={0.65}/>
              </div>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0, lineHeight:1.6, fontWeight:600 }}>
                {selLvl.unlocked
                  ? `🎉 Bu seviyeyi tamamladın! "${selLvl.reward}" ödülünü kazandın.`
                  : `🔒 Bu seviyeye ulaşmak için ${selLvl.xpRequired.toLocaleString()} XP gerekli.${
                      selLvl.xpRequired - user.xp > 0
                        ? ` ${(selLvl.xpRequired - user.xp).toLocaleString()} XP kaldı.`
                        : ' Neredeyse hazırsın!'
                    }`}
                {selLvl.rewardPoints > 0 && ` Ayrıca +${selLvl.rewardPoints} bonus puan kazanırsın!`}
              </p>
            </div>

            {/* XP mini-progress for locked */}
            {!selLvl.unlocked && selLvl.xpRequired > 0 && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:10, fontWeight:900, color:'var(--text-dark)' }}>{user.xp.toLocaleString()} XP</span>
                  <span style={{ fontSize:10, fontWeight:900, color:'var(--text-muted)' }}>{selLvl.xpRequired.toLocaleString()} XP</span>
                </div>
                <XpBar
                  pct={Math.min(100, Math.round((user.xp / selLvl.xpRequired) * 100))}
                  color={getLvlColor(selLvl.level)}
                />
              </div>
            )}

            {/* Action row */}
            <div style={{ display:'flex', gap:10, alignItems:'stretch' }}>
              <div style={{
                flex:1, padding:'11px 0', borderRadius:14, textAlign:'center',
                fontWeight:900, fontSize:13,
                background: selLvl.unlocked ? getLvlColor(selLvl.level) : 'var(--tab-bg)',
                color:'#000',
                border:'3px solid #000', boxShadow:'3px 3px 0 #000',
              }}>
                {selLvl.unlocked ? '✓ Tamamlandı' : `🔒 ${selLvl.xpRequired.toLocaleString()} XP`}
              </div>
              {selLvl.rewardPoints > 0 && (
                <div style={{
                  display:'flex', alignItems:'center', gap:6,
                  padding:'11px 16px', borderRadius:14,
                  background:'#FFE500', color:'#000',
                  border:'3px solid #000', boxShadow:'3px 3px 0 #000',
                  fontWeight:900, fontSize:13,
                }}>
                  ⭐ +{selLvl.rewardPoints}
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

