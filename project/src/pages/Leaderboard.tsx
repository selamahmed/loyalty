import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Sparkles, Timer, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, type LeaderboardEntry } from '../services/points';
import { getActiveEvents, type AppEvent, type RewardPrize, deriveEventStatus } from '../services/events';
import {
  getLeaderboardPrizeEvents,
  getEventLeaderboard, getEventWinners,
  getMyEventParticipation, joinEvent, syncEventStatuses,
  gapToNextRank,
  type EventLeaderboardEntry, type EventWinner, type EventParticipation,
} from '../services/eventLeaderboard';
import { supabase } from '../lib/supabase';
import NeoAvatar from '../components/NeoAvatar';
import StickerAccent from '../components/StickerAccent';
import StickerHero from '../components/StickerHero';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

/* ── Thin wrapper so the rest of the file uses the same API ── */
const Avatar: React.FC<{ url: string | null; name: string; size?: number; border?: string }> = ({ url, name, size = 40, border }) => (
  <NeoAvatar src={url} name={name} size={size} shape="circle" border={border !== undefined ? Boolean(border) : true} />
);

const TAB_LABELS: Record<string, string> = {
  weekly: 'Bu Hafta',
  monthly: 'Bu Ay',
  alltime: 'Tüm Zamanlar',
  events: '🏆 Etkinlikler',
};
const PERIOD_LABEL: Record<string, string> = { weekly: 'bu hafta', monthly: 'bu ay', alltime: 'toplam' };
type LeaderboardTab = 'weekly' | 'monthly' | 'alltime' | 'events';

const formatCountdown = (cd: { days: number; hours: number; mins: number; secs: number; ended: boolean }) => {
  if (cd.ended) return 'Etkinlik bitti';
  const parts: string[] = [];
  if (cd.days > 0) parts.push(`${cd.days} gün`);
  parts.push(`${cd.hours} saat`);
  if (cd.days === 0) parts.push(`${cd.mins} dk`);
  return parts.join(' ');
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
const PrizeCard: React.FC<{ prize: RewardPrize; currentLeader?: EventLeaderboardEntry }> = ({ prize, currentLeader }) => {
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

/* ── User event position card ── */
const EventUserPositionCard: React.FC<{
  participation: EventParticipation | null;
  ended: boolean;
  upcoming: boolean;
  countdown: ReturnType<typeof useCountdown>;
  gap: number | null;
  onJoin: () => void;
  joining: boolean;
  isLoggedIn: boolean;
}> = ({ participation, ended, upcoming, countdown, gap, onJoin, joining, isLoggedIn }) => {
  if (ended || upcoming) return null;

  if (!isLoggedIn) {
    return (
      <div style={{ ...card, padding: '14px 16px', margin: '0 20px 16px', background: 'rgba(123,110,246,0.06)', border: '3px solid var(--primary-blue)' }}>
        <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 4px' }}>Etkinliğe katılmak için giriş yap</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Etkinlik puanları yalnızca katılımcılar için sayılır.</p>
      </div>
    );
  }

  if (!participation?.joined) {
    return (
      <div style={{ ...card, padding: '16px 18px', margin: '0 20px 16px', background: 'rgba(34,197,94,0.06)', border: '3px solid #22c55e' }}>
        <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 10px' }}>Henüz katılmadın</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 12px' }}>
          Katıl ve kazandığın puanlar etkinlik sıralamasına yansısın.
        </p>
        <button type="button" onClick={onJoin} disabled={joining} className="btn-primary" style={{ width: '100%' }}>
          {joining ? 'Katılınıyor…' : 'Etkinliğe Katıl'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      ...card,
      border: '3px solid var(--primary-blue)',
      boxShadow: '0 6px 0 var(--primary-blue)',
      padding: '16px 18px',
      margin: '0 20px 16px',
      background: 'rgba(123,110,246,0.06)',
    }}>
      <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 10px' }}>Senin Etkinlik Sıralaman</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10 }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 2px', textTransform: 'uppercase' }}>Sıra</p>
          <p style={{ fontWeight: 900, fontSize: 28, color: 'var(--primary-blue)', margin: 0 }}>#{participation.rank ?? '—'}</p>
        </div>
        <div>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 2px', textTransform: 'uppercase' }}>Etkinlik Puanı</p>
          <p style={{ fontWeight: 900, fontSize: 22, color: '#f59e0b', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Star size={16} fill="#f59e0b" color="#f59e0b" />
            {(participation.points ?? 0).toLocaleString()}
          </p>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', margin: '0 0 2px', textTransform: 'uppercase' }}>Üst Sıra</p>
          <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-dark)', margin: 0 }}>
            {participation.rank === 1
              ? '🏆 Zirvedesin!'
              : gap != null
                ? `${gap.toLocaleString()} puan uzakta`
                : '—'}
          </p>
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 10px', borderRadius: 12, background: 'var(--tab-bg)', border: '1.5px solid var(--dark-border)' }}>
          <Timer size={14} color="#ef4444" />
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--text-dark)' }}>
            Bitiş: {formatCountdown(countdown)}
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Active Event Banner — event-specific points leaderboard ── */
const ActiveEventBanner: React.FC<{ event: AppEvent; showUserCard?: boolean }> = ({ event, showUserCard = false }) => {
  const { authUser } = useAuth();
  const ended = new Date(event.end_date) < new Date()
    || deriveEventStatus(event) === 'ended'
    || deriveEventStatus(event) === 'distributed';
  const upcoming = !ended && new Date(event.start_date) > new Date();
  const cd = useCountdown(event.end_date);
  const prizes = (event.rewards_json as RewardPrize[] | null) ?? [];
  const bannerColor = event.color ?? '#FFE500';
  const isDarkBanner = bannerColor === '#7B6EF6' || bannerColor === '#FF3CAC';
  const textOnBanner = isDarkBanner ? '#fff' : '#000';
  const subOnBanner  = isDarkBanner ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.65)';
  const [topPlayers, setTopPlayers] = React.useState<EventLeaderboardEntry[]>([]);
  const [finalWinners, setFinalWinners] = React.useState<EventWinner[]>([]);
  const [participation, setParticipation] = React.useState<EventParticipation | null>(null);
  const [joining, setJoining] = React.useState(false);

  const loadEventBoard = React.useCallback(async () => {
    try {
      if (ended) {
        setFinalWinners(await getEventWinners(event.id));
        setTopPlayers([]);
      } else {
        const board = await getEventLeaderboard(event.id, 50);
        setTopPlayers(board);
      }
      if (authUser?.id && showUserCard) {
        setParticipation(await getMyEventParticipation(event.id));
      }
    } catch { /* keep stale */ }
  }, [event.id, ended, authUser?.id, showUserCard]);

  const handleJoin = async () => {
    if (!authUser?.id || joining) return;
    setJoining(true);
    try {
      setParticipation(await joinEvent(event.id));
      await loadEventBoard();
    } catch { /* ignore */ } finally {
      setJoining(false);
    }
  };

  const gap = participation?.joined
    ? (participation.gap_to_next_rank ?? gapToNextRank(topPlayers, participation.points ?? 0, participation.rank))
    : null;

  React.useEffect(() => { void loadEventBoard(); }, [loadEventBoard]);

  React.useEffect(() => {
    if (ended) return;
    const channel = supabase
      .channel(`event_lb_${event.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'event_participants',
        filter: `event_id=eq.${event.id}`,
      }, () => { void loadEventBoard(); })
      .subscribe();
    const poll = setInterval(() => { void loadEventBoard(); }, 5000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [event.id, ended, loadEventBoard]);

  React.useEffect(() => {
    if (cd.ended && !ended) void syncEventStatuses().then(() => loadEventBoard());
  }, [cd.ended, ended, loadEventBoard]);

  const displayPlayers = ended ? [] : topPlayers;
  const winners = ended ? finalWinners : [];

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
          {ended ? '🎉 ETKİNLİK BİTTİ' : upcoming ? '⏳ YAKLAŞAN ETKİNLİK' : '🔴 CANLI ETKİNLİK'}
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
          {!ended && !upcoming && (
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

      {showUserCard && (
        <EventUserPositionCard
          participation={participation}
          ended={ended}
          upcoming={upcoming}
          countdown={cd}
          gap={gap}
          onJoin={() => { void handleJoin(); }}
          joining={joining}
          isLoggedIn={Boolean(authUser?.id)}
        />
      )}

      {/* ── Live leaders / Winners section ── */}
      <div style={{ padding: '16px 20px', background: 'var(--card-bg)' }}>
        {!ended && displayPlayers.length > 0 && (
          <>
            <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <TrendingUp size={15} color="#22c55e" /> Anlık Sıralama
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>— Etkinlik puanına göre</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayPlayers.map((p, i) => {
                const prize = prizes.find(pr => pr.rank === p.rank) ?? prizes[i];
                const medalIdx = (p.rank ?? i + 1) - 1;
                return (
                  <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 14, border: `2px solid ${['#f59e0b','#94a3b8','#f97316'][medalIdx] ?? 'var(--dark-border)'}`, background: medalIdx === 0 ? 'rgba(245,158,11,0.07)' : p.id === authUser?.id ? 'rgba(123,110,246,0.08)' : 'var(--tab-bg)' }}>
                    <span style={{ fontSize: 20, flexShrink: 0, minWidth: 28, textAlign: 'center' }}>{['🥇','🥈','🥉'][medalIdx] ?? `#${p.rank}`}</span>
                    <Avatar url={p.avatar_url} name={p.username} size={36} border={`2px solid ${['#f59e0b','#94a3b8','#f97316'][i] ?? 'var(--dark-border)'}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: 12, color: 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.username}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={9} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b' }}>{p.points.toLocaleString()} etkinlik puanı</span>
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

        {ended && winners.length > 0 && (
          <div>
            <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={16} color="#f59e0b" /> 🏆 Kazananlar
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {winners.map((w) => {
                const i = w.final_rank - 1;
                return (
                  <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, border: `2.5px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#f97316' : 'var(--dark-border)'}`, background: i === 0 ? 'rgba(245,158,11,0.08)' : 'var(--tab-bg)' }}>
                    <span style={{ fontSize: 22, flexShrink: 0, minWidth: 32, textAlign: 'center' }}>{['🥇','🥈','🥉'][i] ?? `#${w.final_rank}`}</span>
                    <Avatar url={w.profiles?.avatar_url ?? null} name={w.profiles?.username ?? '?'} size={36} border={`2px solid ${i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : '#f97316'}`} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', margin: 0 }}>#{w.final_rank} {w.profiles?.username ?? '—'}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={10} fill="#f59e0b" color="#f59e0b" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b' }}>{w.final_points.toLocaleString()} etkinlik puanı</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>Ödül</span>
                      <span style={{ fontSize: 11, fontWeight: 900, color: 'var(--text-dark)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.prize_title}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty — no players yet */}
        {!ended && displayPlayers.length === 0 && (
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
  const [tab, setTab] = useState<LeaderboardTab>('weekly');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
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

  const fetchMyRank = React.useCallback(async (userId: string, period: 'weekly' | 'monthly' | 'alltime') => {
    try {
      if (period === 'alltime') {
        const { data } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, level, total_points')
          .eq('id', userId)
          .single();
        if (!data) return;
        const { count } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('total_points', data.total_points);
        setMyRankEntry({ ...data, rank: (count ?? 0) + 1 });
      }
    } catch { /**/ }
  }, []);

  const loadPrizeEvents = React.useCallback(async () => {
    try {
      setActiveEvents(await getLeaderboardPrizeEvents());
    } catch {
      try {
        const evs = await getActiveEvents();
        setActiveEvents(evs.filter(e => Array.isArray(e.rewards_json) && (e.rewards_json as RewardPrize[]).length > 0));
      } catch {
        setActiveEvents([]);
      }
    }
  }, []);

  const loadLeaderboard = React.useCallback(async (period: 'weekly' | 'monthly' | 'alltime', silent = false) => {
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
  }, [fetchMyRank]);

  useEffect(() => {
    if (tab === 'events') return;
    loadLeaderboard(tab);
  }, [tab, authUser, loadLeaderboard]);

  useEffect(() => {
    if (tab !== 'events') return;
    void syncEventStatuses().then(() => loadPrizeEvents());
    const interval = setInterval(() => { void syncEventStatuses().then(() => loadPrizeEvents()); }, 30000);
    return () => clearInterval(interval);
  }, [tab, loadPrizeEvents]);

  // ── Real-time: refresh when any profile total_points changes ──
  useEffect(() => {
    const channel = supabase
      .channel('leaderboard_realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        () => {
          if (tabRef.current === 'events') return;
          loadLeaderboard(tabRef.current, true);
        },
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'points_transactions' },
        () => {
          if (tabRef.current === 'events') return;
          loadLeaderboard(tabRef.current, true);
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [loadLeaderboard]);

  // ── Polling fallback — refreshes every 15 s in case Realtime isn't enabled ──
  useEffect(() => {
    const interval = setInterval(() => {
      if (tabRef.current === 'events') return;
      loadLeaderboard(tabRef.current, true);
    }, 15000);
    return () => clearInterval(interval);
  }, [loadLeaderboard]);

  useEffect(() => {
    void loadPrizeEvents();
    const interval = setInterval(() => { void loadPrizeEvents(); }, 60000);
    return () => clearInterval(interval);
  }, [loadPrizeEvents]);

  useEffect(() => {
    if (activeEvents.length === 0) return;
    if (!selectedEventId || !activeEvents.some(e => e.id === selectedEventId)) {
      setSelectedEventId(activeEvents[0].id);
    }
  }, [activeEvents, selectedEventId]);

  const selectedEvent = activeEvents.find(e => e.id === selectedEventId) ?? activeEvents[0] ?? null;

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

        <StickerHero
          page="leaderboard"
          bg="linear-gradient(135deg,#f59e0b 0%,#d97706 100%)"
          badge="👑 LİDERLİK"
          title="Zirveye çık,"
          highlight="efsane ol!"
          accentSeed="lb-hero-accent"
        />

        {/* ── Tabs ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 6 }}>
          {(['weekly', 'monthly', 'alltime', 'events'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: '10px 4px', borderRadius: 12, fontWeight: 900, fontSize: 10,
              cursor: 'pointer', transition: 'all 0.1s', position: 'relative',
              background: tab === t ? 'linear-gradient(180deg,var(--gradient-start),var(--gradient-end))' : 'var(--card-bg)',
              color: tab === t ? 'white' : 'var(--text-dark)',
              border: '3px solid var(--dark-border)',
              boxShadow: tab === t ? '0 5px 0 var(--dark-border)' : '0 4px 0 var(--dark-border)',
              lineHeight: 1.2,
            }}>
              {TAB_LABELS[t]}
              {tab === t && <StickerAccent seed={`lb-tab-${t}`} size={14} rotate={12} style={{ position: 'absolute', top: -5, right: 2 }} />}
            </button>
          ))}
        </div>

        {/* ── Event leaderboards tab ── */}
        {tab === 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeEvents.length === 0 ? (
              <div style={{ ...card, padding: '32px 20px', textAlign: 'center' }}>
                <div style={{ fontSize: 48, marginBottom: 10 }}>🏆</div>
                <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>Aktif etkinlik yok</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
                  Ödüllü etkinlikler başladığında burada görünür.
                </p>
              </div>
            ) : (
              <>
                {activeEvents.length > 1 && (
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {activeEvents.map(ev => (
                      <button
                        key={ev.id}
                        type="button"
                        onClick={() => setSelectedEventId(ev.id)}
                        style={{
                          flexShrink: 0, padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                          fontWeight: 900, fontSize: 11, fontFamily: 'inherit',
                          background: selectedEvent?.id === ev.id ? (ev.color ?? '#7B6EF6') : 'var(--card-bg)',
                          color: selectedEvent?.id === ev.id ? '#000' : 'var(--text-dark)',
                          border: '2.5px solid var(--dark-border)',
                          boxShadow: selectedEvent?.id === ev.id ? '0 3px 0 var(--dark-border)' : '0 2px 0 var(--dark-border)',
                        }}
                      >
                        {ev.emoji ?? '🏆'} {ev.title}
                      </button>
                    ))}
                  </div>
                )}
                {selectedEvent && <ActiveEventBanner event={selectedEvent} showUserCard />}
              </>
            )}
          </div>
        )}

        {tab !== 'events' && (
        <>
        <div style={{
          ...card,
          background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(251,191,36,0.06) 100%)',
          border: '3px solid #f59e0b', boxShadow: '0 6px 0 #d97706',
          padding: 'clamp(16px,4vw,28px)', position: 'relative', overflow: 'visible',
        }}>
          <StickerAccent seed="lb-podium" variant="shape" size={32} rotate={-6} style={{ position: 'absolute', top: -10, right: 12, zIndex: 2 }} />
          <h2 style={{ textAlign: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text-dark)', margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            <Crown size={20} color="#f59e0b" /> Top 3 Şampiyonlar
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 12 }}>
            {podiumOrder.map((player, i) => {
              const isFirst = player?.rank === 1;
              const badge = player?.rank === 1 ? '👑' : player?.rank === 2 ? '🥈' : '🥉';
              const sz = isFirst ? 72 : 58;
              return (
                <div key={player?.rank ?? i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <div style={{ position: 'relative' }}>
                    {player
                      ? <Avatar url={player.avatar_url} name={player.username} size={sz} border={`${isFirst ? 4 : 3}px solid ${podiumColors[i]}`} />
                      : <div style={{ width: sz, height: sz, borderRadius: '50%', background: 'var(--tab-bg)', border: `3px solid ${podiumColors[i]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: 'var(--text-muted)' }}>—</div>
                    }
                    <div style={{ position: 'absolute', top: -8, right: -6, fontSize: isFirst ? 22 : 18 }}>{badge}</div>
                  </div>
                  <p style={{ fontWeight: 900, fontSize: isFirst ? 14 : 12, color: 'var(--text-dark)', textAlign: 'center', margin: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {player?.username ?? '—'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Star size={10} fill="#f59e0b" color="#f59e0b" />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b' }}>{player?.total_points.toLocaleString() ?? '—'}</span>
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

        {/* ── Rest of rankings (positions 4+) ── */}
        {isLoading ? (
          <div style={{ ...card, padding: 40, textAlign: 'center' }}>
            <div className="w-8 h-8 rounded-full border-4 border-violet-400 border-t-transparent animate-spin mx-auto mb-3" />
            <p style={{ color: 'var(--text-muted)', fontWeight: 700, margin: 0 }}>Yükleniyor...</p>
          </div>
        ) : rest.length === 0 && leaderboard.length === 0 ? (
          /* Empty state for period with no activity */
          <div style={{ ...card, padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📊</div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>
              {tab === 'alltime' ? 'Henüz kimse yok' : `${TAB_LABELS[tab]} aktivite yok`}
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
              {tab === 'alltime'
                ? 'İlk puanı kazanan olun 🚀'
                : `Bu ${tab === 'weekly' ? 'hafta' : 'ay'} puan kazan ve sıralamana gir! 🚀`}
            </p>
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
                  padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  {/* Rank number */}
                  <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
                    <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)' }}>#{player.rank}</span>
                  </div>
                  {/* Avatar */}
                  <Avatar url={player.avatar_url} name={player.username} size={40}
                    border={isCurrentUser ? '2.5px solid var(--primary-blue)' : '2.5px solid var(--dark-border)'} />
                  {/* Name + level */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ fontWeight: 900, fontSize: 13, color: isCurrentUser ? 'var(--primary-blue)' : 'var(--text-dark)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {player.username}
                      </p>
                      {isCurrentUser && (
                        <span style={{ fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 999, background: 'var(--primary-blue)', color: 'white', flexShrink: 0 }}>SEN</span>
                      )}
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, fontWeight: 600 }}>Seviye {player.level}</p>
                  </div>
                  {/* Points + period label */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} fill="#f59e0b" color="#f59e0b" />
                      <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>{player.total_points.toLocaleString()}</span>
                    </div>
                    {tab !== 'alltime' && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>{PERIOD_LABEL[tab]}</span>
                    )}
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
              <Avatar url={profile?.avatar_url ?? null} name={profile?.username ?? authUser.email ?? 'U'} size={44} border="3px solid var(--primary-blue)" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>
                  Senin Sıralaman
                  {!inList && <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>(İlk 50 dışında)</span>}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <TrendingUp size={12} color="#22c55e" />
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
                    {myRank.total_points.toLocaleString()} puan
                    {tab !== 'alltime' && <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 10 }}> ({PERIOD_LABEL[tab]})</span>}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>· Seviye {myRank.level}</span>
                </div>
              </div>
              <p style={{ fontWeight: 900, fontSize: 32, color: 'var(--primary-blue)', margin: 0, flexShrink: 0 }}>#{myRank.rank}</p>
            </div>
          );
        })()}

        </>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;
