import React, { useState, useEffect } from 'react';
import { X, Check, Calendar, Crown, Flame, Star, Gift, Zap, Diamond, Target } from 'lucide-react';
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
  { day: 1, emoji: '🌟', label: 'Hoşgeldin', points: 50,   isBig: false },
  { day: 2, emoji: '🎁', label: 'Sadık Kullanıcı', points: 100,  isBig: false },
  { day: 3, emoji: '💎', label: 'Elmas',    points: 150,  isBig: false },
  { day: 4, emoji: '🎯', label: 'Hedef',    points: 200,  isBig: false },
  { day: 5, emoji: '🔥', label: 'Ateşli',   points: 300,  isBig: false },
  { day: 6, emoji: '⚡', label: 'Fırtına',  points: 400,  isBig: false },
  { day: 7, emoji: '👑', label: 'MEGA ÖDÜL', points: 1000, isBig: true  },
];

const CONFIG_KEY   = 'nexreward_daily_config';
const STATE_KEY    = 'nexreward_daily_state';

interface DailyState {
  streakDay: number;   // 1–7, which day we're on (1 = just reset)
  lastClaimDate: string | null;  // ISO date "YYYY-MM-DD"
}

function today() { return new Date().toISOString().slice(0, 10); }

function loadConfig(): DayReward[] {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw) as DayReward[];
  } catch {}
  return DEFAULT_REWARDS;
}

function loadState(): DailyState {
  try {
    const raw = localStorage.getItem(STATE_KEY);
    if (raw) return JSON.parse(raw) as DailyState;
  } catch {}
  return { streakDay: 1, lastClaimDate: null };
}

function saveState(s: DailyState) {
  localStorage.setItem(STATE_KEY, JSON.stringify(s));
}

function computeAvailableDay(state: DailyState): { day: number; alreadyClaimed: boolean } {
  const t = today();
  if (state.lastClaimDate === t) {
    return { day: state.streakDay === 0 ? 1 : state.streakDay, alreadyClaimed: true };
  }
  const nextDay = state.streakDay >= 7 ? 1 : (state.streakDay + 1);
  return { day: state.lastClaimDate === null ? 1 : nextDay, alreadyClaimed: false };
}

/* ─────────────────────────────────────────────
   Day Card
   ──────────────────────────────────────────── */
const DayCard: React.FC<{ reward: DayReward; status: 'past' | 'today' | 'future'; small?: boolean }> = ({ reward, status, small }) => {
  const base: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    border: `3px solid #000`,
    padding: small ? '8px 4px' : '12px 6px',
    minWidth: reward.isBig ? (small ? 60 : 72) : (small ? 44 : 56),
    position: 'relative',
    transition: 'transform 0.15s',
    background: status === 'past'   ? '#d1fae5'
               : status === 'today' ? '#fef08a'
               : '#f3f4f6',
    boxShadow: status === 'today'
      ? '4px 4px 0 #000'
      : status === 'past'
        ? '3px 3px 0 #16a34a'
        : '3px 3px 0 #9ca3af',
    transform: status === 'today' ? 'scale(1.08)' : 'scale(1)',
    opacity: status === 'future' ? 0.55 : 1,
    flexShrink: 0,
  };

  return (
    <div style={base}>
      {reward.isBig && status === 'today' && (
        <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', border: '2px solid #000', borderRadius: 99, padding: '2px 8px', whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 9, fontWeight: 900, color: 'white', letterSpacing: '0.05em' }}>BÜYÜK ÖDÜL</span>
        </div>
      )}
      <span style={{ fontSize: small ? 18 : 24, lineHeight: 1, marginBottom: 4 }}>{reward.emoji}</span>
      <span style={{ fontSize: 9, fontWeight: 900, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 2 }}>Gün {reward.day}</span>
      <span style={{ fontSize: small ? 10 : 12, fontWeight: 900, color: '#111' }}>+{reward.points}</span>
      {status === 'past' && (
        <div style={{ position: 'absolute', inset: 0, borderRadius: 11, background: 'rgba(209,250,229,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={small ? 16 : 20} color="#16a34a" strokeWidth={3} />
        </div>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main Modal
   ──────────────────────────────────────────── */
interface DailyRewardModalProps {
  onClose: () => void;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({ onClose }) => {
  const { addPoints } = useApp() as any;
  const [rewards] = useState<DayReward[]>(loadConfig);
  const [state, setState] = useState<DailyState>(loadState);
  const [claimed, setClaimed] = useState(false);
  const [claimAnim, setClaimAnim] = useState(false);

  const { day: currentDay, alreadyClaimed } = computeAvailableDay(state);
  const todayReward = rewards.find(r => r.day === currentDay) || rewards[0];

  const handleClaim = () => {
    if (alreadyClaimed || claimed) return;
    const newState: DailyState = { streakDay: currentDay, lastClaimDate: today() };
    saveState(newState);
    setState(newState);
    if (typeof addPoints === 'function') addPoints(todayReward.points);
    setClaimAnim(true);
    setClaimed(true);
    setTimeout(() => setClaimAnim(false), 800);
  };

  const daysBefore = rewards.filter(r => {
    const cs = loadState();
    if (cs.lastClaimDate === today()) return r.day < cs.streakDay;
    return r.day < currentDay;
  });

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

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.65)' }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff',
          border: '4px solid #000',
          borderRadius: 24,
          boxShadow: '8px 8px 0 #000',
          maxWidth: 400,
          width: '100%',
          overflow: 'hidden',
          animation: 'dailyIn 0.3s cubic-bezier(0.34,1.56,0.64,1)',
        }}
      >
        {/* Header */}
        <div style={{ background: '#fef08a', borderBottom: '4px solid #000', padding: '20px 20px 16px', position: 'relative', textAlign: 'center' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, border: '2.5px solid #000', borderRadius: 8, background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '2px 2px 0 #000' }}>
            <X size={14} />
          </button>
          <div style={{ fontSize: 44, marginBottom: 6, lineHeight: 1 }}>🗓️</div>
          <h2 style={{ fontWeight: 900, fontSize: 22, color: '#111', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Günlük Giriş Ödülü</h2>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#374151', margin: 0 }}>Her gün giriş yap, puan kazan!</p>
          {/* Streak counter */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, background: '#fff', border: '2.5px solid #000', borderRadius: 99, padding: '5px 14px', boxShadow: '2px 2px 0 #000' }}>
            <Flame size={14} color="#ef4444" />
            <span style={{ fontWeight: 900, fontSize: 13, color: '#111' }}>{state.lastClaimDate === today() ? state.streakDay : Math.max(currentDay - 1, 0)} Günlük Seri</span>
          </div>
        </div>

        {/* Day cards */}
        <div style={{ padding: '18px 16px 4px', background: '#fff' }}>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {rewards.map(r => <DayCard key={r.day} reward={r} status={getStatus(r)} small />)}
          </div>
        </div>

        {/* Today's reward big display */}
        <div style={{ padding: '16px 20px', background: '#fff', borderTop: '3px solid #000', margin: '10px 16px 0', borderRadius: 16, border: '3px solid #000', boxShadow: '4px 4px 0 #000', textAlign: 'center', position: 'relative' }}>
          {todayReward.isBig && (
            <div style={{ position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)', background: '#ef4444', border: '2px solid #000', borderRadius: 99, padding: '3px 12px' }}>
              <span style={{ fontSize: 10, fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Mega Ödül!</span>
            </div>
          )}
          <div style={{ fontSize: 52, marginBottom: 4, lineHeight: 1 }}>{todayReward.emoji}</div>
          <p style={{ fontWeight: 900, fontSize: 14, color: '#374151', margin: '0 0 4px', textTransform: 'uppercase' }}>Bugünün Ödülü — Gün {todayReward.day}</p>
          <p style={{ fontWeight: 900, fontSize: 36, color: '#111', margin: 0, letterSpacing: '-0.03em' }}>+{todayReward.points} <span style={{ fontSize: 18, color: '#f59e0b' }}>puan</span></p>
        </div>

        {/* Claim button */}
        <div style={{ padding: '16px 20px 20px', background: '#fff' }}>
          {(alreadyClaimed || claimed) ? (
            <div style={{ textAlign: 'center', padding: '14px', background: '#d1fae5', border: '3px solid #16a34a', borderRadius: 14, boxShadow: '3px 3px 0 #16a34a' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <Check size={20} color="#16a34a" strokeWidth={3} />
                <span style={{ fontWeight: 900, fontSize: 15, color: '#16a34a' }}>Bugün Alındı! Yarın Geri Gelin 👋</span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              style={{
                width: '100%', padding: '16px', borderRadius: 14, border: '3px solid #000',
                background: claimAnim ? '#4ade80' : '#fef08a',
                fontWeight: 900, fontSize: 17, color: '#111', cursor: 'pointer',
                boxShadow: claimAnim ? '4px 4px 0 #16a34a' : '4px 4px 0 #000',
                transform: claimAnim ? 'translateY(2px) scale(1.02)' : 'none',
                transition: 'all 0.15s',
                textTransform: 'uppercase', letterSpacing: '0.05em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}
              onMouseDown={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(4px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 0 0 #000'; }}
              onMouseUp={e => { (e.currentTarget as HTMLElement).style.transform = ''; (e.currentTarget as HTMLElement).style.boxShadow = '4px 4px 0 #000'; }}
            >
              {claimAnim ? <><Check size={20} strokeWidth={3} /> Kazandın! +{todayReward.points} puan</> : <><Gift size={18} /> Ödülü Topla!</>}
            </button>
          )}
        </div>
      </div>
      <style>{`@keyframes dailyIn { from { opacity:0; transform:scale(0.85) translateY(20px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Hook — call in Home to auto-show modal
   ──────────────────────────────────────────── */
export function useDailyReward() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      const s = loadState();
      if (s.lastClaimDate !== today()) {
        setShow(true);
      }
    }, 800);
    return () => clearTimeout(t);
  }, []);

  return { show, setShow };
}
