import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Sparkles, Timer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, type LeaderboardEntry } from '../services/points';
import { getActiveEvents, type AppEvent } from '../services/events';
import { supabase } from '../lib/supabase';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/* ── Countdown hook ── */
const useCountdown = (endDate: string) => {
  const calc = () => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, ended: true };
    return { days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), mins: Math.floor((diff%3600000)/60000), secs: Math.floor((diff%60000)/1000), ended: false };
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => { const t = setInterval(() => setCd(calc()), 1000); return () => clearInterval(t); }, [endDate]);
  return cd;
};

/* ── Active Event Banner (data from Supabase events table) ── */
const ActiveEventBanner: React.FC<{ event: AppEvent; topPlayers: LeaderboardEntry[] }> = ({ event, topPlayers }) => {
  const ended = new Date(event.end_date) < new Date();
  const cd = useCountdown(event.end_date);
  const rewards: { rank: number; emoji: string; bg: string }[] = [
    { rank: 1, emoji: '🥇', bg: '#FFE500' },
    { rank: 2, emoji: '🥈', bg: '#e2e8f0' },
    { rank: 3, emoji: '🥉', bg: '#FF6B35' },
  ];

  return (
    <div style={{ ...card, overflow: 'hidden' }}>
      <div style={{
        background: ended ? '#BFFF00' : (event.color ?? '#FFE500'),
        borderBottom: '3px solid #000',
        padding: '20px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%) rotate(10deg)', fontSize: 110, opacity: 0.1, fontWeight: 900, pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>
          {event.emoji ?? '🏆'}
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10,
          background: '#000', color: ended ? '#BFFF00' : '#FFE500',
          borderRadius: 999, padding: '3px 12px', fontSize: 10, fontWeight: 900,
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <Trophy size={9} fill="currentColor" color={ended ? '#BFFF00' : '#FFE500'} />
          {ended ? '🎉 ETKİNLİK BİTTİ' : '🔴 CANLI ETKİNLİK'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h3 style={{ color: '#000', fontWeight: 900, fontSize: 22, margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{event.title}</h3>
            <p style={{ color: 'rgba(0,0,0,0.65)', fontSize: 13, margin: 0, maxWidth: 340, fontWeight: 600 }}>{event.description}</p>
            {event.multiplier && (
              <span style={{ display: 'inline-block', marginTop: 6, padding: '2px 10px', borderRadius: 999, background: '#000', color: '#FFE500', fontSize: 11, fontWeight: 900 }}>
                ⚡ {event.multiplier}x Puan Çarpanı
              </span>
            )}
          </div>
          {!ended && (
            <div style={{ background: '#000', borderRadius: 12, padding: '8px 12px', flexShrink: 0 }}>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Timer size={9} /> BİTİŞ
              </p>
              <div style={{ display: 'flex', gap: 5 }}>
                {[{ v: cd.days, l: 'G' }, { v: cd.hours, l: 'S' }, { v: cd.mins, l: 'D' }, { v: cd.secs, l: 'SN' }].map(u => (
                  <div key={u.l} style={{ background: '#FFE500', borderRadius: 8, padding: '4px 6px', textAlign: 'center', minWidth: 30 }}>
                    <p style={{ color: '#000', fontWeight: 900, fontSize: 14, margin: 0, lineHeight: 1 }}>{String(u.v).padStart(2, '0')}</p>
                    <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 8, fontWeight: 800, margin: 0 }}>{u.l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '16px 20px', background: 'var(--card-bg)' }}>
        {!ended && topPlayers.length > 0 && (
          <>
            <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Gift size={15} color="#7B6EF6" /> Anlık Liderler
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)' }}>— En fazla puan kazanan kazanır!</span>
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {rewards.map(r => {
                const p = topPlayers[r.rank - 1];
                if (!p) return null;
                return (
                  <div key={r.rank} style={{ padding: '10px 8px', borderRadius: 14, textAlign: 'center', border: '3px solid #000', boxShadow: '0 4px 0 #000', background: r.bg }}>
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{r.emoji}</div>
                    <p style={{ fontWeight: 900, fontSize: 11, color: '#000', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</p>
                    <p style={{ fontWeight: 700, fontSize: 10, color: 'rgba(0,0,0,0.6)', margin: 0 }}>{p.total_points.toLocaleString()} pts</p>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {ended && topPlayers.length > 0 && (
          <div>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#f59e0b" /> Kazananlar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topPlayers.slice(0, event.win_count ?? 3).map((w, i) => (
                <div key={w.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14,
                  border: `2.5px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#f97316'}`,
                  background: i === 0 ? 'rgba(245,158,11,0.08)' : 'var(--tab-bg)',
                }}>
                  <span style={{ fontSize: 22, flexShrink: 0 }}>{['🥇','🥈','🥉'][i] ?? '🏅'}</span>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--dark-border)', flexShrink: 0 }}>
                    {w.avatar_url ? <img src={w.avatar_url} alt={w.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0 }}>{w.username}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={10} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{w.total_points.toLocaleString()} pts</span>
                    </div>
                  </div>
                  {i === 0 && <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 999, background: '#f59e0b', color: 'black', border: '1.5px solid #d97706', flexShrink: 0 }}>ŞAMPİYON</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Leaderboard ── */
const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const { authUser, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRankEntry, setMyRankEntry] = useState<LeaderboardEntry | null>(null);
  const [activeEvents, setActiveEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load leaderboard for selected period
  useEffect(() => {
    setIsLoading(true);
    getLeaderboard(50, tab)
      .then(data => {
        setLeaderboard(data);
        // If current user is not in top 50, fetch their position separately
        if (authUser && !data.find(p => p.id === authUser.id)) {
          fetchMyRank(authUser.id, tab);
        } else {
          setMyRankEntry(null);
        }
      })
      .catch(() => setLeaderboard([]))
      .finally(() => setIsLoading(false));
  }, [tab, authUser]);

  const fetchMyRank = async (userId: string, period: 'weekly' | 'monthly' | 'alltime') => {
    try {
      if (period === 'alltime') {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level, total_points')
          .eq('id', userId)
          .single();
        if (!data) return;
        // Count how many users have more points
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('total_points', data.total_points);
        setMyRankEntry({ ...data, rank: (count ?? 0) + 1 });
      }
      // For weekly/monthly — just note position if not in top 50
    } catch { /**/ }
  };

  // Load active events from Supabase
  useEffect(() => {
    getActiveEvents()
      .then(evs => setActiveEvents(evs.filter(e => (e as AppEvent & { published?: boolean }).published !== false)))
      .catch(() => setActiveEvents([]));
  }, []);

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]];

  const podiumColors = ['#94a3b8','#f59e0b','#f97316'];
  const podiumHeights = [80, 110, 60];

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Ghost watermark */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0, userSelect: 'none' }}>
        <div style={{
          position: 'absolute', top: '6%', left: '50%', transform: 'translateX(-50%) rotate(-4deg)',
          fontSize: 'clamp(50px,14vw,180px)', fontWeight: 900, color: 'var(--dark-border)',
          opacity: 0.04, whiteSpace: 'nowrap', lineHeight: 1, letterSpacing: '-0.04em',
        }}>LİDERLİK</div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Page header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 16, flexShrink: 0,
            background: 'linear-gradient(180deg,#fbbf24,#d97706)',
            border: '3px solid var(--dark-border)', boxShadow: '0 4px 0 var(--dark-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
          }}>👑</div>
          <div>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Leaderboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Zirveye çık, efsane ol</p>
          </div>
        </div>

        {/* ── Active events (Supabase) ── */}
        {activeEvents.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeEvents.map(ev => <ActiveEventBanner key={ev.id} event={ev} topPlayers={leaderboard.slice(0, 3)} />)}
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', gap: 8 }}>
          {(['weekly', 'monthly', 'alltime'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '11px 6px', borderRadius: 12, fontWeight: 900, fontSize: 12,
              cursor: 'pointer', transition: 'all 0.1s',
              background: tab === t ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
              color: tab === t ? 'white' : 'var(--text-dark)',
              border: '3px solid var(--dark-border)',
              boxShadow: tab === t ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
            }}>{t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}</button>
          ))}
        </div>

        {/* ── Podium ── */}
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(251,191,36,0.06) 100%)',
          border: '3px solid #f59e0b', boxShadow: '0 6px 0 #d97706',
          padding: 'clamp(16px,4vw,28px)',
        }}>
          <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Crown size={20} color="#f59e0b" /> Top 3 Şampiyonlar
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
            {podiumOrder.map((player, i) => {
              const isFirst = player?.rank === 1;
              const badge = player?.rank === 1 ? '👑' : player?.rank === 2 ? '🥈' : '🥉';
              return (
                <div key={player?.rank} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                    <div style={{ position: 'relative' }}>
                    <div style={{
                      width: isFirst ? 72 : 58, height: isFirst ? 72 : 58,
                      borderRadius: '50%', overflow: 'hidden',
                      border: `${isFirst ? 4 : 3}px solid ${podiumColors[i]}`,
                      boxShadow: `0 4px 0 ${podiumColors[i]}88`,
                    }}>
                      {player?.avatar_url
                        ? <img src={player.avatar_url} alt={player.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>👤</div>
                      }
                    </div>
                    <div style={{ position: 'absolute', top: -8, right: -6, fontSize: isFirst ? 22 : 18 }}>{badge}</div>
                  </div>
                  <p style={{ fontWeight: 900, fontSize: isFirst ? 14 : 12, color: 'var(--text-dark)', textAlign: 'center', margin: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player?.username}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={10} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b' }}>{player?.total_points.toLocaleString()}</span>
                  </div>
                  {/* Podium block */}
                  <div style={{
                    width: isFirst ? 80 : 64, height: podiumHeights[i],
                    borderRadius: '12px 12px 0 0',
                    background: podiumColors[i], border: '3px solid var(--dark-border)',
                    boxShadow: '0 -4px 0 var(--dark-border) inset',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{ fontSize: isFirst ? 24 : 20, fontWeight: 900, color: 'white' }}>#{player?.rank}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Rest of rankings ── */}
        {isLoading ? (
          <div style={{ ...card, padding: 40, textAlign: 'center' }}>
            <div className="w-8 h-8 rounded-full border-4 border-violet-400 border-t-transparent animate-spin mx-auto mb-3" />
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>Yükleniyor...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rest.map(player => {
              const isCurrentUser = player.id === authUser?.id;
              return (
                <div key={player.rank} style={{
                  ...card,
                  border: isCurrentUser ? '3px solid var(--primary-blue)' : '3px solid var(--dark-border)',
                  boxShadow: isCurrentUser ? '0 6px 0 var(--primary-blue)' : '0 6px 0 var(--dark-border)',
                  background: isCurrentUser ? 'rgba(123,110,246,0.07)' : 'var(--card-bg)',
                  padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-dark)' }}>#{player.rank}</span>
                  </div>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', border: '2.5px solid var(--dark-border)', flexShrink: 0 }}>
                    {player.avatar_url
                      ? <img src={player.avatar_url} alt={player.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    }
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontWeight: 900, fontSize: 13, color: isCurrentUser ? 'var(--primary-blue)' : 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{player.username}</p>
                      {isCurrentUser && (
                        <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', flexShrink: 0 }}>SEN</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, fontWeight: 600 }}>Seviye {player.level}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
                    <Star size={12} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontWeight: 900, fontSize: 13, color: '#f59e0b' }}>{player.total_points.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Your ranking ── */}
        {authUser && (() => {
          const inList = leaderboard.find(p => p.id === authUser.id);
          const myRank = inList ?? myRankEntry;
          if (!myRank) return null;
          return (
            <div style={{
              ...card,
              border: '3px solid var(--primary-blue)', boxShadow: '0 6px 0 var(--primary-blue)',
              padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
              background: 'rgba(123,110,246,0.06)',
            }}>
              <Trophy size={24} color="var(--primary-blue)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>
                  Senin Sıralaman
                  {!inList && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>(İlk 50 dışında)</span>}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={12} color="#22c55e" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>{myRank.total_points.toLocaleString()} puan</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>· Seviye {myRank.level}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>· {profile?.username ?? ''}</span>
                </div>
              </div>
              <p style={{ fontWeight: 900, fontSize: 32, color: 'var(--primary-blue)', margin: 0 }}>#{myRank.rank}</p>
            </div>
          );
        })()}

      </div>
    </div>
  );
};

export default Leaderboard;
