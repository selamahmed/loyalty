import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Sparkles, Timer, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, type LeaderboardEntry } from '../services/points';
import { getActiveEvents, type AppEvent, type RewardPrize } from '../services/events';
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

/* ── Prize card per rank ── */
const PrizeCard: React.FC<{ prize: RewardPrize; currentLeader?: LeaderboardEntry }> = ({ prize, currentLeader }) => {
  const rankStyles: Record<number, { border: string; bg: string; badge: string; glow: string }> = {
    1: { border: '#f59e0b', bg: 'rgba(245,158,11,0.10)', badge: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
    2: { border: '#94a3b8', bg: 'rgba(148,163,184,0.08)', badge: '#94a3b8', glow: 'rgba(148,163,184,0.15)' },
    3: { border: '#f97316', bg: 'rgba(249,115,22,0.08)', badge: '#f97316', glow: 'rgba(249,115,22,0.15)' },
  };
  const s = rankStyles[prize.rank] ?? { border: 'var(--dark-border)', bg: 'var(--tab-bg)', badge: '#7B6EF6', glow: 'transparent' };
  const medals = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅'];
  return (
    <div style={{
      borderRadius: 16, border: `2.5px solid ${s.border}`,
      background: s.bg, padding: '14px 12px', textAlign: 'center',
      boxShadow: `0 4px 0 ${s.border}88, 0 0 20px ${s.glow}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
    }}>
      {/* Rank medal */}
      <div style={{ fontSize: 32 }}>{medals[prize.rank - 1]}</div>
      {/* Reward icon */}
      <div style={{ fontSize: 28, lineHeight: 1 }}>{prize.rewardImage}</div>
      {/* Reward name */}
      <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: 0, lineHeight: 1.3, textAlign: 'center' }}>{prize.rewardName || '—'}</p>
      {/* Min points */}
      {prize.pointsRequired > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 999, background: `${s.badge}20`, border: `1.5px solid ${s.badge}50` }}>
          <Star size={8} fill={s.badge} color={s.badge} />
          <span style={{ fontSize: 9, fontWeight: 900, color: s.badge }}>{prize.pointsRequired.toLocaleString()} min pt</span>
        </div>
      )}
      {/* Qty */}
      {prize.quantity > 1 && (
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>x{prize.quantity}</span>
      )}
      {/* Current leader for this rank */}
      {currentLeader && (
        <div style={{ marginTop: 4, width: '100%', background: 'var(--card-bg)', borderRadius: 10, padding: '5px 6px', border: '1.5px solid var(--dark-border)' }}>
          <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 2px', textAlign: 'center' }}>Şu an lider</p>
          <p style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center' }}>{currentLeader.username}</p>
        </div>
      )}
    </div>
  );
};

/* ── Active Event Banner (data from Supabase events table) ── */
const ActiveEventBanner: React.FC<{ event: AppEvent; topPlayers: LeaderboardEntry[] }> = ({ event, topPlayers }) => {
  const ended = new Date(event.end_date) < new Date();
  const cd = useCountdown(event.end_date);
  const prizes = (event.rewards_json as RewardPrize[] | null) ?? [];
  const bannerColor = event.color ?? '#FFE500';
  const isDarkBanner = bannerColor === '#7B6EF6' || bannerColor === '#FF3CAC';
  const textOnBanner = isDarkBanner ? '#fff' : '#000';
  const subOnBanner  = isDarkBanner ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)';

  return (
    <div style={{ ...card, overflow: 'hidden' }}>

      {/* ── Banner header ── */}
      <div style={{
        background: ended ? '#BFFF00' : bannerColor,
        borderBottom: '3px solid #000',
        padding: '20px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Ghost emoji watermark */}
        <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%) rotate(10deg)', fontSize: 110, opacity: 0.1, fontWeight: 900, pointerEvents: 'none', lineHeight: 1, userSelect: 'none' }}>
          {event.emoji ?? '🏆'}
        </div>

        {/* Status pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10,
          background: '#000', color: ended ? '#BFFF00' : '#FFE500',
          borderRadius: 999, padding: '3px 12px', fontSize: 10, fontWeight: 900,
          letterSpacing: '0.12em', textTransform: 'uppercase' as const,
        }}>
          <Trophy size={9} fill="currentColor" color={ended ? '#BFFF00' : '#FFE500'} />
          {ended ? '🎉 ETKİNLİK BİTTİ' : '🔴 CANLI ETKİNLİK'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div>
            <h3 style={{ color: textOnBanner, fontWeight: 900, fontSize: 22, margin: '0 0 4px', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{event.title}</h3>
            <p style={{ color: subOnBanner, fontSize: 13, margin: 0, maxWidth: 300, fontWeight: 600 }}>{event.description}</p>
            <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
              {event.multiplier && (
                <span style={{ padding: '2px 10px', borderRadius: 999, background: '#000', color: '#FFE500', fontSize: 11, fontWeight: 900 }}>
                  ⚡ {event.multiplier}x Çarpan
                </span>
              )}
              {(event.win_count ?? prizes.length) > 0 && (
                <span style={{ padding: '2px 10px', borderRadius: 999, background: 'rgba(0,0,0,0.3)', color: textOnBanner, fontSize: 11, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={9} /> {event.win_count ?? prizes.length} Kazanan
                </span>
              )}
            </div>
          </div>
          {/* Countdown */}
          {!ended && (
            <div style={{ background: '#000', borderRadius: 12, padding: '8px 10px', flexShrink: 0 }}>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 9, fontWeight: 900, textTransform: 'uppercase' as const, letterSpacing: '0.1em', margin: '0 0 5px', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Timer size={9} /> BİTİŞ
              </p>
              <div style={{ display: 'flex', gap: 4 }}>
                {[{ v: cd.days, l: 'G' }, { v: cd.hours, l: 'S' }, { v: cd.mins, l: 'D' }, { v: cd.secs, l: 'SN' }].map(u => (
                  <div key={u.l} style={{ background: '#FFE500', borderRadius: 8, padding: '4px 6px', textAlign: 'center', minWidth: 28 }}>
                    <p style={{ color: '#000', fontWeight: 900, fontSize: 14, margin: 0, lineHeight: 1 }}>{String(u.v).padStart(2, '0')}</p>
                    <p style={{ color: 'rgba(0,0,0,0.6)', fontSize: 7, fontWeight: 800, margin: 0 }}>{u.l}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Prize Pool Section ── */}
      {prizes.length > 0 && (
        <div style={{ padding: '18px 20px', borderBottom: '3px solid var(--dark-border)', background: 'var(--card-bg)' }}>
          <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Gift size={16} color="#f59e0b" fill="rgba(245,158,11,0.2)" /> Ödül Havuzu
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', background: 'var(--tab-bg)', padding: '2px 8px', borderRadius: 999, border: '1.5px solid var(--dark-border)' }}>
              {prizes.length} ödül
            </span>
          </p>
          {/* Top 3 prize cards — full width */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginBottom: prizes.length > 3 ? 10 : 0 }}>
            {prizes.slice(0, 3).map(prize => (
              <PrizeCard
                key={prize.rank}
                prize={prize}
                currentLeader={topPlayers[prize.rank - 1]}
              />
            ))}
          </div>
          {/* Ranks 4+ in a compact row */}
          {prizes.length > 3 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {prizes.slice(3).map(prize => (
                <div key={prize.rank} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 10px', borderRadius: 12, border: '1.5px solid var(--dark-border)', background: 'var(--tab-bg)', flex: '1 1 140px' }}>
                  <span style={{ fontSize: 16 }}>🏅</span>
                  <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-muted)' }}>#{prize.rank}</span>
                  <span style={{ fontSize: 18 }}>{prize.rewardImage}</span>
                  <p style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prize.rewardName}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Live leaders / Winners section ── */}
      <div style={{ padding: '16px 20px', background: 'var(--card-bg)' }}>
        {!ended && topPlayers.length > 0 && (
          <>
            <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={15} color="#22c55e" /> Anlık Sıralama
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>— Sıralamanı yükselt, ödülü kap!</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {topPlayers.slice(0, event.win_count ?? 3).map((p, i) => {
                const prize = prizes[i];
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, border: `2px solid ${['#f59e0b','#94a3b8','#f97316'][i] ?? 'var(--dark-border)'}`, background: i === 0 ? 'rgba(245,158,11,0.07)' : 'var(--tab-bg)' }}>
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{['🥇','🥈','🥉','🏅'][i] ?? '🏅'}</span>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--dark-border)', flexShrink: 0 }}>
                      {p.avatar_url ? <img src={p.avatar_url} alt={p.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', background: 'var(--tab-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>👤</div>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={9} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>{p.total_points.toLocaleString()}</span>
                      </div>
                    </div>
                    {/* What this rank wins */}
                    {prize && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 9px', borderRadius: 10, background: 'var(--card-bg)', border: '1.5px solid var(--dark-border)', flexShrink: 0 }}>
                        <span style={{ fontSize: 16 }}>{prize.rewardImage}</span>
                        <span style={{ fontSize: 10, fontWeight: 900, color: 'var(--text-dark)', maxWidth: 70, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prize.rewardName}</span>
                      </div>
                    )}
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
              {topPlayers.slice(0, event.win_count ?? 3).map((w, i) => {
                const prize = prizes[i];
                return (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: `2.5px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#f97316'}`, background: i === 0 ? 'rgba(245,158,11,0.08)' : 'var(--tab-bg)' }}>
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
                    {prize && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1.5px solid #f59e0b40', flexShrink: 0 }}>
                        <span style={{ fontSize: 18 }}>{prize.rewardImage}</span>
                        <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prize.rewardName}</span>
                      </div>
                    )}
                    {i === 0 && <span style={{ fontSize: 9, fontWeight: 900, padding: '3px 8px', borderRadius: 999, background: '#f59e0b', color: 'black', border: '1.5px solid #d97706', flexShrink: 0 }}>ŞAMPİYON</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty — no players yet */}
        {!ended && topPlayers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 4px' }}>Henüz kimse yok!</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Puan kazanmaya başla ve ilk sıraya gir 🚀</p>
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
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const tabRef = React.useRef(tab);
  const authUserRef = React.useRef(authUser);
  tabRef.current = tab;
  authUserRef.current = authUser;

  const loadLeaderboard = React.useCallback(async (period: typeof tab, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getLeaderboard(50, period);
      setLeaderboard(data);
      setLastUpdate(new Date());
      const uid = authUserRef.current?.id;
      if (uid && !data.find(p => p.id === uid)) {
        fetchMyRank(uid, period);
      } else {
        setMyRankEntry(null);
      }
    } catch {
      /* keep stale data */
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, []);

  // Load leaderboard for selected period
  useEffect(() => {
    loadLeaderboard(tab);
  }, [tab, authUser, loadLeaderboard]);

  // ── Real-time: refresh when any profile total_points changes ──
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => { loadLeaderboard(tabRef.current, true); },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'points_transactions' },
        () => { loadLeaderboard(tabRef.current, true); },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadLeaderboard]);

  // ── Polling fallback — refreshes every 15 s in case Realtime isn't enabled ──
  useEffect(() => {
    const interval = setInterval(() => {
      loadLeaderboard(tabRef.current, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  const fetchMyRank = React.useCallback(async (userId: string, period: 'weekly' | 'monthly' | 'alltime') => {
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
  }, []);

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
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Leaderboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Zirveye çık, efsane ol</p>
          </div>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'live-pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: '#22c55e', letterSpacing: '0.05em' }}>CANLI</span>
          </div>
        </div>
        {lastUpdate && (
          <p style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, margin: '-12px 0 0', paddingLeft: 4 }}>
            Son güncelleme: {lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
        )}
        <style>{`
          @keyframes live-pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
            50% { opacity: 0.5; box-shadow: 0 0 12px #22c55e; }
          }
        `}</style>

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
