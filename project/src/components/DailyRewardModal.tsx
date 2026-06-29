import React, { useState, useEffect } from 'react';
import { X, Check, Flame, Gift, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { isStreakClaimedToday, nextStreakDay } from '../services/streaks';
import { getDailyRewardConfig, type DailyRewardConfig } from '../services/config';

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

const DAY_THEME = [
  { bg: 'var(--gradient-end)',   text: '#fff', accent: '#9122FF' },
  { bg: 'var(--neo-lime)',       text: '#000', accent: '#8ACC00' },
  { bg: 'var(--neo-sky)',        text: '#000', accent: '#2AABE8' },
  { bg: 'var(--neo-yellow)',     text: '#000', accent: '#D4B800' },
  { bg: 'var(--neo-orange)',     text: '#000', accent: '#E05520' },
  { bg: 'var(--neo-pink)',       text: '#000', accent: '#E02080' },
  { bg: 'var(--neo-yellow)',     text: '#000', accent: '#D4B800' },
];

function today() { return new Date().toISOString().slice(0, 10); }

function mapConfigRows(rows: DailyRewardConfig[]): DayReward[] {
  if (!rows.length) return DEFAULT_REWARDS;

  const mapped = rows
    .filter(row => row.day_number >= 1 && row.day_number <= 7)
    .map(row => {
      const bonus = (row.bonus_value ?? {}) as Record<string, unknown>;
      return {
        day: row.day_number,
        emoji: typeof bonus.emoji === 'string' && bonus.emoji.trim() ? bonus.emoji : '🎁',
        label: typeof bonus.label === 'string' && bonus.label.trim() ? bonus.label : `Gün ${row.day_number}`,
        points: Number(row.points ?? 0),
        isBig: Boolean(row.is_special),
      };
    });

  return DEFAULT_REWARDS.map(defaultReward => mapped.find(row => row.day === defaultReward.day) ?? defaultReward);
}

const brutal = {
  border: '3px solid var(--dark-border)',
  shadow: '6px 6px 0 var(--dark-border)',
  shadowSm: '3px 3px 0 var(--dark-border)',
  radius: 20,
  radiusLg: 28,
  font: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Space Grotesk', system-ui, sans-serif",
};

/* ─── Day Card ─── */
const DayCard: React.FC<{ reward: DayReward; status: 'past' | 'today' | 'future' }> = ({ reward, status }) => {
  const theme = DAY_THEME[(reward.day - 1) % DAY_THEME.length];
  const isToday = status === 'today';
  const isPast = status === 'past';

  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: isToday ? '9px 2px 8px' : '7px 2px 6px',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s',
        border: isToday ? '2.5px solid var(--dark-border)' : '2px solid var(--dark-border)',
        background: isToday ? theme.bg : isPast ? 'var(--tab-bg)' : 'var(--card-bg)',
        boxShadow: isToday ? '0 4px 0 var(--dark-border)' : 'none',
        transform: isToday ? 'translateY(-2px)' : 'none',
        opacity: status === 'future' ? 0.5 : 1,
      }}
    >
      {reward.isBig && isToday && (
        <div style={{
          position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--neo-yellow)', border: '1.5px solid var(--dark-border)',
          borderRadius: 99, padding: '1px 5px', whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 6, fontWeight: 800, color: '#000', letterSpacing: '0.08em' }}>MEGA</span>
        </div>
      )}

      <span style={{ fontSize: isToday ? 17 : 14, lineHeight: 1, marginBottom: 2 }}>{reward.emoji}</span>
      <span style={{
        fontSize: 7, fontWeight: 700, color: isToday ? theme.text : 'var(--text-muted)',
        letterSpacing: '0.04em', marginBottom: 1,
      }}>
        G{reward.day}
      </span>
      <span style={{
        fontSize: reward.points >= 1000 ? 7 : 8, fontWeight: 800,
        color: isToday ? theme.text : isPast ? '#16a34a' : 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>
        +{reward.points}
      </span>

      {isPast && (
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 10,
          background: 'rgba(34,197,94,0.88)',
          border: '2px solid var(--dark-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={12} color="#fff" strokeWidth={3} />
        </div>
      )}
    </div>
  );
};

/* ─── Main Modal ─── */
export const DailyRewardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { earnReward, reloadProfile } = useApp();
  const { profile } = useAuth();
  const [rewards, setRewards] = useState<DayReward[]>(DEFAULT_REWARDS);
  const [configEnabled, setConfigEnabled] = useState(true);
  const [configLoading, setConfigLoading] = useState(true);
  const [claimed, setClaimed] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimAnim, setClaimAnim] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);

  useEffect(() => {
    let cancelled = false;

    getDailyRewardConfig()
      .then(rows => {
        if (cancelled) return;
        if (rows.length > 0) {
          setRewards(mapConfigRows(rows));
          setConfigEnabled(rows.some(row => row.enabled));
        }
      })
      .catch(error => {
        console.warn('Failed to load daily reward config, using defaults', error);
      })
      .finally(() => {
        if (!cancelled) setConfigLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const streakInfo = profile ? {
    current_streak: profile.current_streak,
    longest_streak: profile.longest_streak,
    last_claim_date: profile.last_claim_date,
  } : null;

  const alreadyClaimed = isStreakClaimedToday(streakInfo);
  const currentDay = alreadyClaimed
    ? (streakInfo?.current_streak ?? 1)
    : nextStreakDay(streakInfo);
  const todayReward = rewards.find(r => r.day === currentDay) || rewards[0];
  const theme = DAY_THEME[(todayReward.day - 1) % DAY_THEME.length];
  const streakCount = streakInfo?.current_streak ?? 0;

  const getStatus = (r: DayReward): 'past' | 'today' | 'future' => {
    if (alreadyClaimed) {
      if (r.day < currentDay) return 'past';
      if (r.day === currentDay) return 'today';
      return 'future';
    }
    if (r.day < currentDay) return 'past';
    if (r.day === currentDay) return 'today';
    return 'future';
  };

  const handleClaim = () => {
    if (alreadyClaimed || claimed || claiming || !configEnabled) return;

    setClaiming(true);
    setClaimError(null);

    void earnReward('daily_login')
      .then(result => {
        if (!result) {
          setClaimError('Ödül alınamadı. Lütfen tekrar dene.');
          return;
        }

        if (result.disabled) {
          setConfigEnabled(false);
          setClaimError('Günlük ödül sistemi şu anda pasif.');
          return;
        }

        if (result.alreadyClaimed) {
          setClaimed(true);
          return;
        }

        setEarnedPoints(result.points);
        if (result.capped) {
          setClaimError(
            result.points > 0
              ? `Sadakat limitine yaklaştığın için ödül ${result.points.toLocaleString('tr-TR')} puan olarak sınırlandı.`
              : 'Sadakat puan limitine ulaştığın için bugün yeni puan eklenmedi.',
          );
        }
        setClaimAnim(true);
        setClaimed(true);
        void reloadProfile();
        setTimeout(() => setClaimAnim(false), 1000);
      })
      .catch(() => {
        setClaimError('Ödül alınamadı. Lütfen tekrar dene.');
      })
      .finally(() => {
        setClaiming(false);
      });
  };

  const isDone = alreadyClaimed || claimed;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(12px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
        fontFamily: brutal.font,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)',
          border: brutal.border,
          borderRadius: brutal.radiusLg,
          boxShadow: brutal.shadow,
          maxWidth: 400,
          width: '100%',
          overflow: 'hidden',
          animation: 'dailyIn 0.42s cubic-bezier(0.34,1.56,0.64,1)',
          position: 'relative',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          padding: '24px 22px 20px',
          background: 'linear-gradient(160deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
          borderBottom: brutal.border,
          position: 'relative',
          color: '#fff',
        }}>
          <button
            onClick={onClose}
            aria-label="Kapat"
            style={{
              position: 'absolute', top: 16, right: 16,
              width: 32, height: 32,
              border: '2.5px solid var(--dark-border)',
              borderRadius: 10,
              background: 'var(--card-bg)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '2px 2px 0 var(--dark-border)',
              transition: 'transform 0.15s',
            }}
            onMouseDown={e => { e.currentTarget.style.transform = 'translate(1px,1px)'; e.currentTarget.style.boxShadow = '1px 1px 0 var(--dark-border)'; }}
            onMouseUp={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '2px 2px 0 var(--dark-border)'; }}
          >
            <X size={14} color="var(--text-dark)" strokeWidth={2.5} />
          </button>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            background: 'var(--neo-yellow)', color: '#000',
            border: '2px solid var(--dark-border)', borderRadius: 99,
            padding: '4px 11px', fontSize: 10, fontWeight: 800,
            letterSpacing: '0.08em', marginBottom: 12,
            boxShadow: '2px 2px 0 var(--dark-border)',
          }}>
            <Sparkles size={11} strokeWidth={2.5} />
            GÜNLÜK GİRİŞ ÖDÜLÜ
          </div>

          <h2 className="font-display" style={{
            fontWeight: 900, fontSize: 28, margin: '0 0 6px',
            letterSpacing: '-0.04em', lineHeight: 1.05,
          }}>
            Seri Bonusun Hazır!
          </h2>
          <p style={{ fontSize: 13, fontWeight: 500, opacity: 0.88, margin: 0, lineHeight: 1.4 }}>
            Her gün giriş yap, puanlar biriksin.
          </p>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 14,
            background: 'var(--card-bg)', color: 'var(--text-dark)',
            border: '2.5px solid var(--dark-border)', borderRadius: 99,
            padding: '6px 14px', boxShadow: '3px 3px 0 var(--dark-border)',
          }}>
            <Flame size={14} color="var(--neo-orange)" fill="var(--neo-orange)" />
            <span style={{ fontWeight: 800, fontSize: 13 }}>{streakCount} Günlük Seri</span>
          </div>
        </div>

        {/* ── Day progress strip ── */}
        <div style={{ padding: '18px 18px 10px', background: 'var(--card-bg)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10, padding: '0 2px',
          }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              7 GÜNLÜK SERİ
            </span>
            <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dark)' }}>
              {configLoading ? 'Yükleniyor' : `Gün ${currentDay}/7`}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 4, width: '100%', alignItems: 'flex-end' }}>
            {rewards.map(r => <DayCard key={r.day} reward={r} status={getStatus(r)} />)}
          </div>

          <div style={{
            marginTop: 10, height: 8, borderRadius: 99,
            background: 'var(--tab-bg)', border: '2px solid var(--dark-border)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: 99,
              width: `${Math.min((currentDay / 7) * 100, 100)}%`,
              background: 'var(--neo-lime)',
              transition: 'width 0.4s cubic-bezier(0.34,1.56,0.64,1)',
            }} />
          </div>
        </div>

        {/* ── Today's reward ── */}
        <div style={{ padding: '0 18px 16px' }}>
          <div style={{
            borderRadius: 18, border: brutal.border,
            background: 'var(--tab-bg)',
            padding: '18px 20px', position: 'relative', overflow: 'hidden',
            boxShadow: brutal.shadowSm,
          }}>
            {todayReward.isBig && (
              <div style={{
                position: 'absolute', top: 12, right: 12,
                background: 'var(--neo-yellow)', border: '2px solid var(--dark-border)',
                borderRadius: 99, padding: '3px 10px', boxShadow: '2px 2px 0 var(--dark-border)',
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: '#000', letterSpacing: '0.06em' }}>
                  👑 MEGA ÖDÜL
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{
                width: 68, height: 68, borderRadius: 18,
                background: theme.bg,
                border: brutal.border,
                boxShadow: brutal.shadowSm,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 34, flexShrink: 0,
              }}>
                {todayReward.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px',
                }}>
                  Gün {todayReward.day} · {todayReward.label}
                </p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <p className="font-display" style={{
                    fontWeight: 900, fontSize: 36, color: 'var(--text-dark)',
                    margin: 0, letterSpacing: '-0.04em', lineHeight: 1,
                  }}>
                    +{todayReward.points.toLocaleString('tr-TR')}
                  </p>
                  <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-muted)' }}>puan</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── CTA ── */}
        <div style={{ padding: '0 18px 22px' }}>
          {!configEnabled ? (
            <div style={{
              textAlign: 'center', padding: '15px 16px',
              background: 'var(--tab-bg)',
              border: brutal.border, borderRadius: 16,
              boxShadow: brutal.shadowSm,
            }}>
              <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-dark)' }}>
                Günlük ödül sistemi şu anda pasif
              </span>
            </div>
          ) : isDone ? (
            <div style={{
              textAlign: 'center', padding: '15px 16px',
              background: 'var(--tab-bg)',
              border: brutal.border, borderRadius: 16,
              boxShadow: brutal.shadowSm,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: '#22c55e', border: '2px solid var(--dark-border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '2px 2px 0 var(--dark-border)',
                }}>
                  <Check size={15} color="#fff" strokeWidth={3} />
                </div>
                <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-dark)' }}>
                  Bugün alındı — yarın geri gelin
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="btn-primary"
              disabled={claiming}
              style={{
                width: '100%', padding: '15px 20px', borderRadius: 16,
                fontWeight: 800, fontSize: 15, letterSpacing: '0.02em',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                background: claimAnim
                  ? 'var(--neo-lime)'
                  : 'linear-gradient(180deg, var(--gradient-start) 0%, var(--gradient-end) 100%)',
                color: claimAnim ? '#000' : '#fff',
                transform: claimAnim ? 'translateY(3px)' : undefined,
                boxShadow: claimAnim ? '0 2px 0 var(--dark-border)' : undefined,
                transition: 'background 0.2s, transform 0.12s, box-shadow 0.12s',
                opacity: claiming ? 0.75 : 1,
                cursor: claiming ? 'wait' : 'pointer',
              }}
              onMouseDown={e => {
                if (!claimAnim && !claiming) {
                  e.currentTarget.style.transform = 'translateY(3px)';
                  e.currentTarget.style.boxShadow = '0 2px 0 var(--dark-border)';
                }
              }}
              onMouseUp={e => {
                if (!claimAnim && !claiming) {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }
              }}
            >
              {claiming
                ? 'Ödül kontrol ediliyor...'
                : claimAnim
                ? <><Check size={18} strokeWidth={3} /> +{earnedPoints.toLocaleString('tr-TR')} puan kazandın!</>
                : <><Gift size={18} strokeWidth={2.5} /> Ödülü Topla</>
              }
            </button>
          )}
          {claimError && (
            <p style={{
              textAlign: 'center', fontSize: 12, fontWeight: 800,
              color: '#dc2626', margin: '10px 0 0', lineHeight: 1.35,
            }}>
              {claimError}
            </p>
          )}
          <p style={{
            textAlign: 'center', fontSize: 11, fontWeight: 500,
            color: 'var(--text-muted)', marginTop: 12, marginBottom: 0, lineHeight: 1.4,
          }}>
            Her gün giriş yaparak serinizi sürdürün
          </p>
        </div>
      </div>

      <style>{`
        @keyframes dailyIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
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
  const { profile } = useAuth();
  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      const streakInfo = profile ? {
        last_claim_date: profile.last_claim_date,
        current_streak: profile.current_streak,
        longest_streak: profile.longest_streak,
      } : null;

      if (isStreakClaimedToday(streakInfo)) return;

      getDailyRewardConfig()
        .then(rows => {
          if (cancelled) return;
          const enabled = rows.length === 0 || rows.some(row => row.enabled);
          setShow(enabled);
        })
        .catch(() => {
          if (!cancelled) setShow(true);
        });
    }, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [profile?.last_claim_date]);
  return { show, setShow };
}
