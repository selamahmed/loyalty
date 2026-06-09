import React, { useState, useEffect } from 'react';
import { X, Check, Flame, Gift, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

/* ─────────────────────────────────────────────
   Shared config type — also used by AdminDailyRewards
   ──────────────────────────────────────────── */
export interface DayReward {
  day: number;
  emoji: string;
  label: string;
  points: number;
  isBig: boolean;
}

export const DEFAULT_REWARDS: DayReward[] = [
  { day: 1, emoji: '⚡', label: 'Hoşgeldin',     points: 50,   isBig: false },
  { day: 2, emoji: '🎁', label: 'Sadık Üye',     points: 100,  isBig: false },
  { day: 3, emoji: '💎', label: 'Elmas',          points: 150,  isBig: false },
  { day: 4, emoji: '🎯', label: 'Hedef',          points: 200,  isBig: false },
  { day: 5, emoji: '🔥', label: 'Ateşli',         points: 300,  isBig: false },
  { day: 6, emoji: '🚀', label: 'Fırtına',        points: 400,  isBig: false },
  { day: 7, emoji: '👑', label: 'MEGA ÖDÜL',      points: 1000, isBig: true  },
];

/* ─── Day colour themes matching landing palette ─── */
const DAY_THEME = [
  { bg: '#7B6EF6', text: '#fff', dim: 'rgba(123,110,246,0.18)' },
  { bg: '#22c55e', text: '#000', dim: 'rgba(34,197,94,0.15)'   },
  { bg: '#06b6d4', text: '#000', dim: 'rgba(6,182,212,0.15)'   },
  { bg: '#f59e0b', text: '#000', dim: 'rgba(245,158,11,0.15)'  },
  { bg: '#ef4444', text: '#fff', dim: 'rgba(239,68,68,0.15)'   },
  { bg: '#ec4899', text: '#fff', dim: 'rgba(236,72,153,0.15)'  },
  { bg: '#FFE500', text: '#000', dim: 'rgba(255,229,0,0.18)'   },
];

/* ─── Landing-page SVG decorations ─── */
const DecoStar = () => (
  <svg width="90" height="90" viewBox="0 0 56 56" fill="none"
    style={{ position: 'absolute', top: -18, right: -18, opacity: 0.13, pointerEvents: 'none', transform: 'rotate(18deg)', zIndex: 0 }}>
    <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21"
      fill="#a78bfa" stroke="#000" strokeWidth="3" strokeLinejoin="round" />
  </svg>
);
const DecoBolt = () => (
  <svg width="70" height="70" viewBox="0 0 48 48" fill="none"
    style={{ position: 'absolute', bottom: -14, left: -14, opacity: 0.1, pointerEvents: 'none', transform: 'rotate(-12deg)', zIndex: 0 }}>
    <polygon points="28,2 15,26 24,26 19,46 36,22 27,22"
      fill="#FFE500" stroke="#000" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
  </svg>
);

const CONFIG_KEY = 'nexreward_daily_config';
const STATE_KEY  = 'nexreward_daily_state';

interface DailyState {
  streakDay: number;
  lastClaimDate: string | null;
}

function today() { return new Date().toISOString().slice(0, 10); }

function loadConfig(): DayReward[] {
  try { const r = localStorage.getItem(CONFIG_KEY); if (r) return JSON.parse(r); } catch {}
  return DEFAULT_REWARDS;
}
function loadState(): DailyState {
  try { const r = localStorage.getItem(STATE_KEY); if (r) return JSON.parse(r); } catch {}
  return { streakDay: 1, lastClaimDate: null };
}
function saveState(s: DailyState) { localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

function computeAvailableDay(state: DailyState): { day: number; alreadyClaimed: boolean } {
  const t = today();
  if (state.lastClaimDate === t) return { day: state.streakDay === 0 ? 1 : state.streakDay, alreadyClaimed: true };
  const next = state.streakDay >= 7 ? 1 : (state.streakDay + 1);
  return { day: state.lastClaimDate === null ? 1 : next, alreadyClaimed: false };
}

/* ─── Day Card ─── */
const DayCard: React.FC<{ reward: DayReward; status: 'past' | 'today' | 'future' }> = ({ reward, status }) => {
  const theme = DAY_THEME[(reward.day - 1) % DAY_THEME.length];

  const cardStyle: React.CSSProperties = {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    borderRadius: 14, padding: '9px 5px',
    minWidth: reward.isBig ? 62 : 48,
    maxWidth: reward.isBig ? 62 : 48,
    flexShrink: 0,
    position: 'relative',
    cursor: 'default',
    transition: 'transform 0.2s',
    border: status === 'today'
      ? `3px solid ${theme.bg}`
      : status === 'past'
        ? '3px solid #22c55e'
        : '3px solid #2a2d50',
    background: status === 'today'
      ? theme.dim
      : status === 'past'
        ? 'rgba(34,197,94,0.08)'
        : 'rgba(255,255,255,0.03)',
    boxShadow: status === 'today'
      ? `0 4px 0 ${theme.bg}, 0 0 16px ${theme.dim}`
      : status === 'past'
        ? '0 3px 0 #22c55e'
        : '0 3px 0 #1a1d3a',
    transform: status === 'today' ? 'scale(1.1) translateY(-3px)' : 'scale(1)',
    opacity: status === 'future' ? 0.38 : 1,
  };

  return (
    <div style={cardStyle}>
      {reward.isBig && status === 'today' && (
        <div style={{ position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)', background: '#FFE500', border: '2px solid #000', borderRadius: 99, padding: '2px 7px', whiteSpace: 'nowrap', boxShadow: '2px 2px 0 #000' }}>
          <span style={{ fontSize: 8, fontWeight: 900, color: '#000', letterSpacing: '0.08em', textTransform: 'uppercase' }}>MEGA</span>
        </div>
      )}
      <span style={{ fontSize: reward.isBig && status === 'today' ? 22 : 18, lineHeight: 1, marginBottom: 4 }}>{reward.emoji}</span>
      <span style={{ fontSize: 8, fontWeight: 900, color: status === 'today' ? theme.bg : status === 'past' ? '#22c55e' : '#5a5680', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>G{reward.day}</span>
      <span style={{ fontSize: 9, fontWeight: 900, color: status === 'today' ? '#f0edff' : status === 'past' ? '#4ade80' : '#3d3a60' }}>+{reward.points}</span>

      {status === 'past' && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 11, background: 'rgba(34,197,94,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={16} color="#4ade80" strokeWidth={3} />
        </div>
      )}
    </div>
  );
};

/* ─── Main Modal ─── */
export const DailyRewardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addPoints } = useApp() as any;
  const [rewards]          = useState<DayReward[]>(loadConfig);
  const [state, setState]  = useState<DailyState>(loadState);
  const [claimed, setClaimed]     = useState(false);
  const [claimAnim, setClaimAnim] = useState(false);

  const { day: currentDay, alreadyClaimed } = computeAvailableDay(state);
  const todayReward = rewards.find(r => r.day === currentDay) || rewards[0];
  const theme = DAY_THEME[(todayReward.day - 1) % DAY_THEME.length];

  const streakCount = state.lastClaimDate === today() ? state.streakDay : Math.max(currentDay - 1, 0);

  const getStatus = (r: DayReward): 'past' | 'today' | 'future' => {
    const cs = state;
    if (cs.lastClaimDate === today()) {
      if (r.day < cs.streakDay) return 'past';
      if (r.day === cs.streakDay) return 'today';
      return 'future';
    }
    if (r.day < currentDay) return 'past';
    if (r.day === currentDay) return 'today';
    return 'future';
  };

  const handleClaim = () => {
    if (alreadyClaimed || claimed) return;
    const newState: DailyState = { streakDay: currentDay, lastClaimDate: today() };
    saveState(newState);
    setState(newState);
    if (typeof addPoints === 'function') addPoints(todayReward.points);
    setClaimAnim(true);
    setClaimed(true);
    setTimeout(() => setClaimAnim(false), 1000);
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#0f1124',
          border: '3px solid #2a2d50',
          borderRadius: 24,
          boxShadow: '8px 8px 0 #000',
          maxWidth: 420,
          width: '100%',
          overflow: 'hidden',
          animation: 'dailyIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '22px 20px 18px', background: '#131629', borderBottom: '3px solid #2a2d50', position: 'relative', overflow: 'hidden' }}>
          <DecoStar />
          <DecoBolt />
          {/* Close */}
          <button onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, width: 30, height: 30, border: '2px solid #2a2d50', borderRadius: 9, background: '#0f1124', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#1e1a3a'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#0f1124'; }}>
            <X size={13} color="#8b87b8" />
          </button>

          {/* Pill tag */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(123,110,246,0.15)', color: '#a78bfa', border: '2px solid #2a2d50', borderRadius: 999, padding: '4px 12px', fontSize: 10, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 10, position: 'relative', zIndex: 1 }}>
            ✦ GÜNLÜK GİRİŞ ÖDÜLÜ
          </div>

          {/* Title */}
          <h2 style={{ fontWeight: 900, fontSize: 26, color: '#f0edff', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '-0.03em', lineHeight: 1, position: 'relative', zIndex: 1 }}>
            Seri Bonusun<br />
            <span style={{ color: theme.bg }}>Hazır!</span>
          </h2>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#8b87b8', margin: '6px 0 0', position: 'relative', zIndex: 1 }}>
            Her gün giriş yap, puanlar biriksin.
          </p>

          {/* Streak pill */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 12, background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.35)', borderRadius: 999, padding: '5px 12px', position: 'relative', zIndex: 1 }}>
            <Flame size={13} color="#f87171" />
            <span style={{ fontWeight: 900, fontSize: 12, color: '#f87171' }}>{streakCount} Günlük Seri</span>
          </div>
        </div>

        {/* ── Day cards row ── */}
        <div style={{ padding: '16px 16px 12px', background: '#0f1124' }}>
          <div style={{ display: 'flex', gap: 7, overflowX: 'auto', paddingBottom: 2, justifyContent: 'center', alignItems: 'flex-end', scrollbarWidth: 'none' }}>
            {rewards.map(r => <DayCard key={r.day} reward={r} status={getStatus(r)} />)}
          </div>
        </div>

        {/* ── Today's reward highlight ── */}
        <div style={{ margin: '0 16px', borderRadius: 18, border: `3px solid ${theme.bg}`, background: theme.dim, padding: '16px 18px', position: 'relative', overflow: 'hidden', boxShadow: `0 4px 0 #000, 0 0 24px ${theme.dim}` }}>
          {/* Corner deco */}
          <svg width="60" height="60" viewBox="0 0 56 56" fill="none"
            style={{ position: 'absolute', top: -12, right: -12, opacity: 0.22, pointerEvents: 'none', transform: 'rotate(12deg)' }}>
            <polygon points="28,3 33,21 52,21 37,33 43,51 28,40 13,51 19,33 4,21 23,21"
              fill={theme.bg} stroke="#000" strokeWidth="3" strokeLinejoin="round" />
          </svg>

          {todayReward.isBig && (
            <div style={{ position: 'absolute', top: 10, left: 10, background: '#FFE500', border: '2px solid #000', borderRadius: 99, padding: '3px 10px', boxShadow: '2px 2px 0 #000' }}>
              <span style={{ fontSize: 9, fontWeight: 900, color: '#000', textTransform: 'uppercase', letterSpacing: '0.07em' }}>👑 Mega Ödül!</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 18, background: theme.bg,
              border: '3px solid #000', boxShadow: `0 4px 0 #000`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 32, flexShrink: 0,
            }}>
              {todayReward.emoji}
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 900, color: theme.bg, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px' }}>
                Gün {todayReward.day} · {todayReward.label}
              </p>
              <p style={{ fontWeight: 900, fontSize: 34, color: '#f0edff', margin: 0, letterSpacing: '-0.04em', lineHeight: 1 }}>
                +{todayReward.points.toLocaleString('tr-TR')}
              </p>
              <p style={{ fontWeight: 700, fontSize: 12, color: '#8b87b8', margin: '2px 0 0' }}>puan</p>
            </div>
          </div>
        </div>

        {/* ── Claim button ── */}
        <div style={{ padding: '14px 16px 18px', background: '#0f1124' }}>
          {(alreadyClaimed || claimed) ? (
            <div style={{
              textAlign: 'center', padding: '14px 16px',
              background: 'rgba(34,197,94,0.1)', border: '3px solid #22c55e',
              borderRadius: 16, boxShadow: '0 4px 0 #15803d',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Check size={18} color="#4ade80" strokeWidth={3} />
                <span style={{ fontWeight: 900, fontSize: 14, color: '#4ade80' }}>Bugün Alındı! Yarın Geri Gelin 👋</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              style={{
                width: '100%', padding: '16px 20px', borderRadius: 16,
                border: '3px solid #000',
                background: claimAnim ? '#22c55e' : theme.bg,
                fontWeight: 900, fontSize: 16,
                color: claimAnim ? '#000' : theme.text,
                cursor: 'pointer',
                boxShadow: claimAnim ? '0 4px 0 #15803d' : '0 4px 0 #000',
                transform: claimAnim ? 'translateY(3px)' : 'none',
                transition: 'background 0.2s, transform 0.1s, box-shadow 0.1s',
                textTransform: 'uppercase', letterSpacing: '0.06em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseEnter={e => { if (!claimAnim) (e.currentTarget as HTMLElement).style.filter = 'brightness(1.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.filter = ''; }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 #000'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = claimAnim ? 'translateY(3px)' : ''; (e.currentTarget as HTMLElement).style.boxShadow = claimAnim ? '0 4px 0 #15803d' : '0 4px 0 #000'; }}
            >
              {claimAnim
                ? <><Check size={18} strokeWidth={3} /> +{todayReward.points} Puan Kazandın!</>
                : <><Gift size={18} /> Ödülü Topla!</>
              }
            </button>
          )}
          <p style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#5a5680', marginTop: 10, marginBottom: 0 }}>
            Her gün giriş yaparak serinizi sürdürün
          </p>
        </div>
      </div>

      <style>{`
        @keyframes dailyIn {
          from { opacity: 0; transform: scale(0.82) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
};

/* ─── Hook ─── */
export function useDailyReward() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => {
      if (loadState().lastClaimDate !== today()) setShow(true);
    }, 800);
    return () => clearTimeout(t);
  }, []);
  return { show, setShow };
}
