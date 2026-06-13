import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { playSound } from '../lib/sounds';
import { getLevelConfig, DEFAULT_LEVELS, calcXpProgress, type LevelConfig } from '../services/xp';
import LevelBadge, { LevelBadgeRow } from '../components/LevelBadge';
import DuoProgressPath from '../components/DuoProgressPath';
import { getLevelBadge } from '../lib/levelBadges';
import StickerAccent from '../components/StickerAccent';
import { TIER_FIGURE_SEEDS } from '../lib/pageStickers';

type LevelRow = { level: number; title: string; xp: number; reward: string; bonus: number };

function mapLevels(rows: LevelConfig[]): LevelRow[] {
  return rows.map(r => ({
    level: r.level,
    title: r.title,
    xp: r.xp_required,
    reward: r.reward_label ?? '',
    bonus: r.bonus_points,
  }));
}

const FALLBACK_LEVELS = mapLevels(DEFAULT_LEVELS);

const TIERS = [
  { from:  1, to:  4, label: 'BAŞLANGIÇ', emoji: '🌱', color: '#FFE500', bg: 'rgba(255,229,0,0.08)'  },
  { from:  5, to:  8, label: 'SAVAŞÇI',   emoji: '⚔️', color: '#4CAF50', bg: 'rgba(76,175,80,0.08)'  },
  { from:  9, to: 12, label: 'KAHRAMAN',  emoji: '🦸', color: '#2196F3', bg: 'rgba(33,150,243,0.08)' },
  { from: 13, to: 16, label: 'EFSANE',    emoji: '🔥', color: '#FF5722', bg: 'rgba(255,87,34,0.08)'  },
  { from: 17, to: 99, label: 'ÖLÜMSÜZ',   emoji: '👑', color: '#E91E63', bg: 'rgba(233,30,99,0.08)'  },
];

const LEVEL_COLORS: Record<number, string> = {
   1:'#FFE500',  2:'#FF5722',  3:'#4CAF50',  4:'#2196F3',
   5:'#FF9800',  6:'#9C27B0',  7:'#F44336',  8:'#00BCD4',
   9:'#FFEB3B', 10:'#8BC34A', 11:'#E91E63', 12:'#03A9F4',
  13:'#FF7043', 14:'#43A047', 15:'#1565C0', 16:'#AD1457',
  17:'#E65100', 18:'#558B2F', 19:'#283593', 20:'#880E4F',
};
const clr = (lv: number) =>
  LEVEL_COLORS[lv] ?? ['#FFE500','#FF5722','#4CAF50','#2196F3','#FF9800'][lv % 5];

const getTier  = (lv: number) => TIERS.find(t => lv >= t.from && lv <= t.to) ?? TIERS[0];
const getLvlData = (levels: LevelRow[], lv: number) => levels.find(l => l.level === lv) ?? levels[0];
const getNextLvlData = (levels: LevelRow[], lv: number) => levels.find(l => l.level > lv);

/* ══════════════════════════════════════════════════
   SVG DECORATIONS
══════════════════════════════════════════════════ */
const SvgStar: React.FC<{ size?: number; fill?: string }> = ({ size = 28, fill = '#FFE500' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" style={{ display:'block', filter:'drop-shadow(2px 2px 0 #000)' }}>
    <polygon points="14,2 17.4,10.3 26.5,10.5 19.7,16 22.1,25 14,20.1 5.9,25 8.3,16 1.5,10.5 10.6,10.3"
      fill={fill} stroke="#000" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);
const SvgBolt: React.FC<{ size?: number; fill?: string }> = ({ size = 28, fill = '#FFE500' }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" style={{ display:'block', filter:'drop-shadow(2px 2px 0 #000)' }}>
    <polygon points="17,2 8,16 14,16 11,26 20,12 14,12" fill={fill} stroke="#000" strokeWidth="2" strokeLinejoin="round"/>
  </svg>
);
const SvgDiamond: React.FC<{ size?: number; fill?: string }> = ({ size = 22, fill = '#2196F3' }) => (
  <svg width={size} height={size} viewBox="0 0 22 22" style={{ display:'block', filter:'drop-shadow(2px 2px 0 #000)' }}>
    <polygon points="11,1 21,11 11,21 1,11" fill={fill} stroke="#000" strokeWidth="2.5" strokeLinejoin="round"/>
  </svg>
);
const SvgZigzag: React.FC<{ color?: string; w?: number }> = ({ color = '#FFE500', w = 80 }) => (
  <svg width={w} height={16} viewBox={`0 0 ${w} 16`} style={{ display:'block' }}>
    <polyline
      points={Array.from({ length: Math.floor(w / 10) }, (_, i) => `${i * 10},${i % 2 === 0 ? 14 : 2}`).join(' ')}
      fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

/* ── Tier mascots (shape stickers) ── */
const TierMascot: React.FC<{ tier: typeof TIERS[0]; size?: number }> = ({ tier, size = 56 }) => (
  <StickerAccent
    seed={TIER_FIGURE_SEEDS[tier.label] ?? `tier-shape-${tier.label}`}
    variant="shape"
    figure
    size={size}
    rotate={-6}
  />
);

/* ── XP Progress bar ── */
const XpBar: React.FC<{ pct: number; color: string; label?: string }> = ({ pct, color, label }) => (
  <div style={{ height:22, borderRadius:8, background:'var(--tab-bg)', border:'3px solid #000', boxShadow:'3px 3px 0 #000', overflow:'hidden', position:'relative' }}>
    <div style={{ height:'100%', width:`${Math.max(2, pct)}%`, background:color, borderRadius:5, transition:'width 1.3s cubic-bezier(0.22,1,0.36,1)' }}/>
    <div style={{ position:'absolute', inset:0, background:'repeating-linear-gradient(45deg,transparent,transparent 6px,rgba(0,0,0,0.06) 6px,rgba(0,0,0,0.06) 12px)' }}/>
    <span style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:10, color:'#000', letterSpacing:'0.08em' }}>
      {label ?? `%${pct} TAMAMLANDI`}
    </span>
  </div>
);

/* ── Loading skeleton ── */
const Skeleton: React.FC<{ h?: number; w?: string; r?: number }> = ({ h=18, w='100%', r=8 }) => (
  <div style={{ height:h, width:w, borderRadius:r, background:'var(--tab-bg)', border:'2px solid var(--dark-border)', animation:'skeleton-pulse 1.5s ease-in-out infinite' }}/>
);

/* ══════════════════════════════════════════════════
   TIER LEVEL TRACK (neo-brutal vertical list)
══════════════════════════════════════════════════ */
type EnrichedLevel = LevelRow & { unlocked: boolean; isCurrent: boolean };

const TierLevelTrack: React.FC<{
  tier: typeof TIERS[0];
  levels: EnrichedLevel[];
  tierDone: number;
  currentRef: React.RefObject<HTMLButtonElement>;
  selectedLevel: number | null;
  onSelect: (level: number) => void;
}> = ({ tier, levels, tierDone, currentRef, selectedLevel, onSelect }) => (
  <div className="progress-tier-panel tier-slide">
    <div className="progress-tier-panel__head">
      <p className="progress-tier-panel__eyebrow">{tier.emoji} {tier.label}</p>
      <p className="progress-tier-panel__title">
        Lv.{tier.from}–{tier.to === 99 ? '∞' : tier.to}
        <span className="progress-tier-panel__count">{tierDone}/{levels.length}</span>
      </p>
    </div>

    <DuoProgressPath
      levels={levels}
      tierColor={tier.color}
      currentRef={currentRef}
      selectedLevel={selectedLevel}
      onSelect={onSelect}
    />
  </div>
);

/* ══════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════ */
const ProgressPath: React.FC = () => {
  const { profile, loading: authLoading } = useAuth();

  const [levelRows, setLevelRows] = useState<LevelRow[]>(FALLBACK_LEVELS);
  const [levelConfig, setLevelConfig] = useState<LevelConfig[]>(DEFAULT_LEVELS);

  /* Live values (updated by realtime) */
  const [liveXp,    setLiveXp]    = useState<number | null>(null);
  const [liveLevel, setLiveLevel] = useState<number | null>(null);
  const [rtBadge,   setRtBadge]   = useState(false);

  const [animXp,       setAnimXp]       = useState(0);
  const [activeTierIdx, setActiveTierIdx] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const currentRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    getLevelConfig()
      .then(rows => {
        setLevelConfig(rows);
        setLevelRows(mapLevels(rows));
      })
      .catch(() => {
        setLevelConfig(DEFAULT_LEVELS);
        setLevelRows(FALLBACK_LEVELS);
      });
  }, []);

  /* ── Computed values ── */
  const userXp    = liveXp    ?? profile?.xp           ?? 0;
  const userLevel = liveLevel ?? profile?.level        ?? 1;

  const xpProgress = calcXpProgress(userXp, userLevel, levelConfig);
  const currentLvl = getLvlData(levelRows, userLevel);
  const nextLvl    = getNextLvlData(levelRows, userLevel);
  const xpPct      = xpProgress.pct;
  const xpLeft     = xpProgress.remaining;
  const isMaxLevel = xpProgress.isMaxLevel;

  const currentTier    = getTier(userLevel);
  const activeTier     = TIERS[activeTierIdx] ?? TIERS[0];

  /* Enrich levels with computed unlocked state */
  const enriched = levelRows.map(l => ({
    ...l,
    unlocked:  l.level < userLevel,
    isCurrent: l.level === userLevel,
  }));
  const unlockedCount = enriched.filter(l => l.unlocked || l.isCurrent).length;

  const filteredLevels = enriched.filter(l => l.level >= activeTier.from && l.level <= activeTier.to);
  const tierDone = filteredLevels.filter(l => l.unlocked || l.isCurrent).length;
  const selLvl = enriched.find(l => l.level === selectedLevel);

  /* ── Realtime subscription ── */
  useEffect(() => {
    if (!profile?.id) return;
    const ch = supabase
      .channel(`progress_${profile.id}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'profiles',
        filter: `id=eq.${profile.id}`,
      }, (payload) => {
        const p = payload.new as { xp?: number; level?: number };
        if (p.xp !== undefined)    setLiveXp(p.xp);
        if (p.level !== undefined) setLiveLevel(p.level);
        setRtBadge(true);
        setTimeout(() => setRtBadge(false), 3000);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [profile?.id]);

  /* ── Set tier tab to user's current tier on load ── */
  useEffect(() => {
    const idx = TIERS.findIndex(t => userLevel >= t.from && userLevel <= t.to);
    if (idx >= 0) setActiveTierIdx(idx);
  }, [userLevel]);

  /* ── Animate XP bar ── */
  useEffect(() => {
    const t = setTimeout(() => setAnimXp(xpPct), 300);
    return () => clearTimeout(t);
  }, [xpPct]);

  /* ── Scroll to current level node ── */
  useEffect(() => {
    const t = setTimeout(() => currentRef.current?.scrollIntoView({ behavior:'smooth', block:'center' }), 500);
    return () => clearTimeout(t);
  }, [activeTierIdx]);

  /* ── Loading state ── */
  if (authLoading) return (
    <div className="p-3 sm:p-4 max-w-lg mx-auto" style={{ display:'flex', flexDirection:'column', gap:16 }}>
      <style>{`@keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
      <Skeleton h={32} w="60%" r={10}/>
      <Skeleton h={180} r={22}/>
      <Skeleton h={48}  r={16}/>
      <Skeleton h={500} r={22}/>
    </div>
  );

  return (
    <div style={{ position:'relative', minHeight:'100vh', overflowX:'hidden' }}>

      {/* ── CSS Animations ── */}
      <style>{`
        @keyframes wobble   { 0%,100%{transform:rotate(0deg) translateY(0)} 20%{transform:rotate(-3deg) translateY(-3px)} 40%{transform:rotate(3deg) translateY(-5px)} 60%{transform:rotate(-2deg) translateY(-3px)} 80%{transform:rotate(2deg) translateY(-1px)} }
        @keyframes floatA   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
        @keyframes floatB   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes badgeF   { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(-5px)} }
        @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes ringPulse{ 0%,100%{opacity:0.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.08)} }
        @keyframes dashMove { from{stroke-dashoffset:0} to{stroke-dashoffset:-24} }
        @keyframes popIn    { from{transform:translateY(80px) scale(0.92);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
        @keyframes tierSlide{ from{transform:translateX(-14px);opacity:0} to{transform:translateX(0);opacity:1} }
        @keyframes decoSpin { 0%{transform:rotate(0) scale(1)} 50%{transform:rotate(180deg) scale(1.2)} 100%{transform:rotate(360deg) scale(1)} }
        @keyframes rtPop    { 0%{transform:scale(1)} 50%{transform:scale(1.15)} 100%{transform:scale(1)} }
        @keyframes skeleton-pulse{0%,100%{opacity:1}50%{opacity:0.5}}

        .node-wobble { animation:wobble 2s ease-in-out infinite; }
        .node-float  { animation:floatA 3.5s ease-in-out infinite; }
        .badge-float { animation:badgeF 2s ease-in-out infinite; }
        .stk-spin    { animation:spinSlow 8s linear infinite; }
        .stk-fa      { animation:floatA 4s ease-in-out infinite; }
        .stk-fb      { animation:floatB 5s ease-in-out infinite; }
        .ring-pulse  { animation:ringPulse 2s ease-in-out infinite; }
        .dash-path   { animation:dashMove 0.6s linear infinite; }
        .popup-in    { animation:popIn 0.28s cubic-bezier(0.22,1,0.36,1) both; }
        .tier-slide  { animation:tierSlide 0.3s ease both; }
        .deco-spin   { animation:decoSpin linear infinite; }
        .rt-pop      { animation:rtPop 0.4s ease; }
        .tier-scroll::-webkit-scrollbar { display:none; }
        .tier-scroll { -ms-overflow-style:none; scrollbar-width:none; }
        .nb-press:active { transform:translate(2px,2px) !important; box-shadow:1px 1px 0 #000 !important; }
      `}</style>

      {/* ── Watermark ── */}
      <div style={{ position:'fixed', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }}>
        <div style={{ position:'absolute', top:'6%', left:'50%', transform:'translateX(-50%) rotate(-6deg)', fontSize:'clamp(52px,13vw,190px)', fontWeight:900, color:'var(--dark-border)', opacity:0.035, whiteSpace:'nowrap', lineHeight:1, letterSpacing:'-0.04em', userSelect:'none' }}>
          SEVİYE
        </div>
      </div>

      <div className="page-enter p-3 sm:p-4 max-w-lg mx-auto" style={{ position:'relative', zIndex:1, display:'flex', flexDirection:'column', gap:16, paddingBottom:32 }}>

        {/* Group sticker accents */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden', zIndex:0 }} aria-hidden>
          {[
            { group: 'hotskull.svg', top: 72, right: -8, size: 56, rotate: 12 },
            { group: 'sleeping.svg', top: 280, left: -10, size: 48, rotate: -8 },
            { group: 'wow.svg', bottom: 120, right: 4, size: 52, rotate: 6 },
          ].map(s => (
            <StickerAccent
              key={s.group}
              group={s.group}
              variant="colorful"
              size={s.size}
              rotate={s.rotate}
              style={{ position:'absolute', top: s.top, right: s.right, bottom: s.bottom, left: s.left, opacity: 0.88 }}
            />
          ))}
        </div>

        {/* ═══ HEADER ═══ */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
          <div>
            <p className="section-label">⚡ SEVİYE SİSTEMİ</p>
            <h1 className="section-title" style={{ fontSize:'clamp(22px,6vw,30px)', marginBottom:0 }}>İlerleme Yolu</h1>
          </div>
          {/* CANLI badge */}
          <div className={rtBadge ? 'rt-pop' : ''} style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:10, border:`2px solid ${rtBadge ? '#22c55e' : 'var(--dark-border)'}`, background: rtBadge ? 'rgba(34,197,94,0.12)' : 'var(--card-bg)', transition:'all 0.3s' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background: rtBadge ? '#22c55e' : 'var(--text-muted)', boxShadow: rtBadge ? '0 0 6px #22c55e' : 'none', transition:'all 0.3s' }}/>
            <span style={{ fontSize:10, fontWeight:900, color: rtBadge ? '#22c55e' : 'var(--text-muted)', letterSpacing:'0.06em' }}>
              {rtBadge ? 'GÜNCELLENDI' : 'CANLI'}
            </span>
          </div>
        </div>

        {/* ═══ HERO CARD ═══ */}
        <div style={{ border:'3px solid #000', boxShadow:'6px 6px 0 #000', borderRadius:22, background:'var(--card-bg)', overflow:'hidden', position:'relative', zIndex:1 }}>

          {/* Decorations */}
          <StickerAccent group="HMMM.svg" variant="colorful" size={40} rotate={8} style={{ position:'absolute', top:8, right:10, zIndex:0, opacity:0.9 }} />
          <StickerAccent seed="progress-hero-accent" variant="shape" size={32} rotate={-12} style={{ position:'absolute', bottom:36, right:6, zIndex:0, opacity:0.75 }} />

          {/* Tier stripe */}
          <div style={{ background:currentTier.color, borderBottom:'3px solid #000', padding:'11px 18px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'relative', zIndex:1 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <TierMascot tier={currentTier} size={36}/>
              <div>
                <p style={{ fontSize:9, fontWeight:900, color:'#000', letterSpacing:'0.1em', margin:0 }}>{currentTier.emoji} {currentTier.label}</p>
                <p style={{ fontSize:14, fontWeight:900, color:'#000', margin:0, lineHeight:1 }}>{currentLvl.title}</p>
              </div>
            </div>
            <LevelBadge level={userLevel} width={40} />
          </div>

          {/* XP section */}
          <div style={{ padding:'16px 18px 14px', position:'relative', zIndex:1 }}>
            <LevelBadgeRow level={userLevel} width={68} subtitle={currentLvl.title} />
            <div style={{ marginTop: 12 }}>
                <p style={{ fontSize:11, color:'var(--text-muted)', margin:'0 0 10px', fontWeight:700 }}>
                  {isMaxLevel
                    ? '👑 Maksimum seviyeye ulaştın!'
                    : `⚡ ${xpLeft.toLocaleString()} XP sonraki rozete`}
                </p>
                <XpBar
                  pct={isMaxLevel ? 100 : animXp}
                  color={currentTier.color}
                  label={isMaxLevel ? 'MAX SEVİYE' : undefined}
                />
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:'3px solid #000' }}>
            {[
              { emoji:'⚡', val: userXp.toLocaleString(),   label:'TOPLAM XP',  color:'#FFE500' },
              { emoji:'🏆', val: `${unlockedCount}/${levelRows.length}`, label:'AÇILAN',  color:'#2196F3' },
              { emoji:'🎯', val: currentTier.label,              label:'RÜTBE',      color:currentTier.color },
            ].map((s, i) => (
              <div key={s.label} style={{ padding:'11px 6px', textAlign:'center', borderLeft: i > 0 ? '3px solid #000' : 'none', position:'relative', overflow:'hidden' }}>
                <div style={{ width:32, height:32, borderRadius:9, margin:'0 auto 5px', background:s.color, border:'2.5px solid #000', boxShadow:'2px 2px 0 #000', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15 }}>
                  {s.emoji}
                </div>
                <p style={{ fontWeight:900, fontSize:s.label === 'RÜTBE' ? 11 : 15, color:'var(--text-dark)', margin:'0 0 1px', lineHeight:1 }}>{s.val}</p>
                <p style={{ fontSize:8, color:'var(--text-muted)', margin:0, fontWeight:900, letterSpacing:'0.06em' }}>{s.label}</p>
              </div>
            ))}
          </div>

          {/* XP progress detail bar */}
          {!isMaxLevel && (
            <div style={{ padding:'12px 18px', borderTop:'3px solid #000', background:'var(--tab-bg)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                <span style={{ fontSize:10, fontWeight:900, color:'var(--text-dark)' }}>
                  {xpProgress.inLevel.toLocaleString()} / {xpProgress.needed.toLocaleString()} XP (Lv.{userLevel})
                </span>
                <span style={{ fontSize:10, fontWeight:900, color:currentTier.color }}>
                  Lv.{userLevel} → Lv.{nextLvl!.level}
                </span>
              </div>
              <div style={{ height:10, borderRadius:6, background:'var(--card-bg)', border:'2px solid #000', overflow:'hidden', position:'relative' }}>
                <div style={{ height:'100%', width:`${isMaxLevel ? 100 : animXp}%`, background:currentTier.color, transition:'width 1.3s cubic-bezier(0.22,1,0.36,1)' }}/>
              </div>
            </div>
          )}
        </div>

        {/* ═══ TIER SELECTOR ═══ */}
        <div>
          <p style={{ fontSize:11, fontWeight:900, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.09em', margin:'0 0 8px', paddingLeft:2 }}>
            Rütbe Kategorisi
          </p>
          <div className="tier-scroll" style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4 }}>
            {TIERS.map((t, i) => {
              const active = i === activeTierIdx;
              const inTier = userLevel >= t.from && userLevel <= t.to;
              return (
                <button key={t.label} className="nb-press"
                  onClick={() => { playSound('click'); setActiveTierIdx(i); setSelectedLevel(null); }}
                  style={{ flexShrink:0, display:'flex', alignItems:'center', gap:8, padding:'9px 14px', borderRadius:13, cursor:'pointer', background: active ? t.color : 'var(--card-bg)', border:'3px solid #000', boxShadow: active ? '4px 4px 0 #000' : '3px 3px 0 #000', color:'#000', fontWeight:900, fontSize:11, letterSpacing:'0.04em', position:'relative', transition:'box-shadow 0.08s,transform 0.08s', overflow:'visible' }}>
                  <span style={{ fontSize:15 }}>{t.emoji}</span>
                  {t.label}
                  {active && <StickerAccent seed={`progress-tier-${t.label}`} size={18} rotate={10} style={{ position:'absolute', top:-6, right:-4 }} />}
                  {inTier && (
                    <span style={{ position:'absolute', top:-5, right:-5, width:11, height:11, borderRadius:'50%', background: active ? '#000' : t.color, border:'2px solid #000' }}/>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ═══ TIER LEVEL TRACK ═══ */}
        <TierLevelTrack
          key={activeTier.label}
          tier={activeTier}
          levels={filteredLevels}
          tierDone={tierDone}
          currentRef={currentRef}
          selectedLevel={selectedLevel}
          onSelect={(level) => setSelectedLevel(selectedLevel === level ? null : level)}
        />

        {/* ═══ MAX LEVEL CARD ═══ */}
        <div style={{ display:'flex', alignItems:'center', gap:16, border:'3.5px solid #000', boxShadow:'6px 6px 0 #000', borderRadius:20, padding:'14px 18px', background:'#E91E63', position:'relative', overflow:'visible' }}>
          <StickerAccent group="highalert.svg" variant="colorful" size={44} rotate={6} style={{ position:'absolute', top:-10, right:10, zIndex:2 }} />
          <div style={{ width:52, height:52, borderRadius:14, flexShrink:0, background:'#000', border:'3px solid #000', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            <StickerAccent seed="progress-max-tier" variant="shape" figure size={40} rotate={0} />
          </div>
          <div>
            <p style={{ fontWeight:900, fontSize:16, color:'#000', margin:0 }}>Maksimum Seviye</p>
            <p style={{ fontSize:12, color:'#000', margin:'2px 0 0', fontWeight:700, opacity:0.75 }}>Efsane ol. Tarihe geç.</p>
          </div>
        </div>

      </div>

      {/* ═══ LEVEL DETAIL POPUP ═══ */}
      {selLvl && (
        <div className="popup-in" style={{ position:'fixed', left:10, right:10, bottom:76, zIndex:200, border:'3.5px solid #000', boxShadow:'7px 7px 0 #000', borderRadius:24, overflow:'hidden', background:'var(--card-bg)' }}>

          <div style={{ background:clr(selLvl.level), borderBottom:'3px solid #000', padding:'14px 16px', display:'flex', alignItems:'center', gap:14, position:'relative' }}>
            <div className="stk-spin" style={{ position:'absolute', top:6, right:48 }}><SvgStar size={18} fill="#fff"/></div>
            <LevelBadge level={selLvl.level} width={44} dimmed={!selLvl.unlocked && !selLvl.isCurrent} />
            <div style={{ flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
                <span style={{ fontSize:12, fontWeight:900, color:'#000' }}>{getLevelBadge(selLvl.level).label}</span>
                {selLvl.isCurrent && <span style={{ fontSize:9, fontWeight:900, color:'#9122FF' }}>● ŞU AN</span>}
                {selLvl.unlocked && <span style={{ fontSize:9, fontWeight:900, color:'#22c55e' }}>✓ AÇIK</span>}
              </div>
              <p style={{ fontWeight:900, fontSize:20, color:'#000', margin:0, lineHeight:1 }}>{selLvl.title}</p>
            </div>
            <button onClick={() => { playSound('click'); setSelectedLevel(null); }}
              style={{ width:32, height:32, borderRadius:9, flexShrink:0, background:'#000', color:clr(selLvl.level), border:'2px solid #000', fontSize:17, fontWeight:900, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'2px 2px 0 rgba(0,0,0,0.3)' }}>
              ✕
            </button>
          </div>

          <div style={{ padding:'14px 16px', display:'flex', flexDirection:'column', gap:12 }}>
            <div style={{ background:'var(--tab-bg)', border:'2.5px solid #000', boxShadow:'3px 3px 0 #000', borderRadius:14, padding:'11px 13px' }}>
              <p style={{ fontSize:13, color:'var(--text-muted)', margin:0, lineHeight:1.6, fontWeight:600 }}>
                {selLvl.unlocked || selLvl.isCurrent
                  ? `🎉 Bu seviyeyi tamamladın! "${selLvl.reward}" ödülünü kazandın.`
                  : `🔒 Bu seviyeye ulaşmak için ${selLvl.xp.toLocaleString()} XP gerekli. ${Math.max(0, selLvl.xp - userXp).toLocaleString()} XP kaldı.`}
                {selLvl.bonus > 0 && ` Ayrıca +${selLvl.bonus} bonus puan kazanırsın!`}
              </p>
            </div>

            {!selLvl.unlocked && !selLvl.isCurrent && selLvl.xp > 0 && (
              <div>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:5 }}>
                  <span style={{ fontSize:10, fontWeight:900, color:'var(--text-dark)' }}>{userXp.toLocaleString()} XP</span>
                  <span style={{ fontSize:10, fontWeight:900, color:'var(--text-muted)' }}>{selLvl.xp.toLocaleString()} XP</span>
                </div>
                <XpBar pct={Math.min(100, Math.round((userXp / selLvl.xp) * 100))} color={clr(selLvl.level)}/>
              </div>
            )}

            <div style={{ display:'flex', gap:10, alignItems:'stretch' }}>
              <div style={{ flex:1, padding:'11px 0', borderRadius:14, textAlign:'center', fontWeight:900, fontSize:13, background: selLvl.unlocked || selLvl.isCurrent ? clr(selLvl.level) : 'var(--tab-bg)', color:'#000', border:'3px solid #000', boxShadow:'3px 3px 0 #000' }}>
                {selLvl.unlocked || selLvl.isCurrent ? '✓ Tamamlandı' : `🔒 ${selLvl.xp.toLocaleString()} XP`}
              </div>
              {selLvl.bonus > 0 && (
                <div style={{ display:'flex', alignItems:'center', gap:6, padding:'11px 16px', borderRadius:14, background:'#FFE500', color:'#000', border:'3px solid #000', boxShadow:'3px 3px 0 #000', fontWeight:900, fontSize:13 }}>
                  ⭐ +{selLvl.bonus}
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
