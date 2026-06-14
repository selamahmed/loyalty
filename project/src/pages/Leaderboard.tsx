import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Timer, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, getMyAlltimeRank, LEADERBOARD_TOP_LIMIT, type LeaderboardEntry } from '../services/points';
import { getActiveEvents, type AppEvent, type RewardPrize, deriveEventStatus } from '../services/events';
import {
  getLeaderboardPrizeEvents,
  getEventLeaderboard, getEventWinners,
  getMyEventParticipation, joinEvent, syncEventStatuses,
  checkLeaderboardDb,
  type EventLeaderboardEntry, type EventWinner, type EventParticipation,
} from '../services/eventLeaderboard';
import { supabase } from '../lib/supabase';
import NeoAvatar from '../components/NeoAvatar';
import StickerHero from '../components/StickerHero';
import StickerDecorImg from '../components/StickerDecorImg';
import { colorfulSticker } from '../lib/stickerCatalog';
import { useRealtimeTable } from '../hooks/useRealtime';
import { onLeaderboardRefresh } from '../lib/leaderboardRefresh';

const card = {
  background: 'var(--card-bg)',
  border: '3px solid var(--dark-border)',
  boxShadow: '0px 6px 0px var(--dark-border)',
  borderRadius: 20,
};

const PODIUM_COLORS = ['#94a3b8', '#f59e0b', '#f97316'];
const PODIUM_HEIGHTS = [80, 110, 60];

type RankDisplayPlayer = {
  id: string;
  rank: number;
  username: string;
  avatar_url: string | null;
  level: number;
  points: number;
};

const toRankPlayer = (entry: LeaderboardEntry): RankDisplayPlayer => ({
  id: entry.id,
  rank: entry.rank,
  username: entry.username,
  avatar_url: entry.avatar_url,
  level: entry.level,
  points: entry.total_points,
});

const toEventRankPlayer = (entry: EventLeaderboardEntry): RankDisplayPlayer => ({
  id: entry.id,
  rank: entry.rank,
  username: entry.username,
  avatar_url: entry.avatar_url,
  level: entry.level,
  points: entry.points,
});

/* ── Podium layout ── */
const PODIUM_LAYOUT: Record<number, number[]> = {
  1: [1],
  2: [2, 1],
  3: [2, 1, 3],
};

const podiumVisualIndex = (slotRank: number): number => {
  if (slotRank === 1) return 1;
  if (slotRank === 2) return 0;
  return 2;
};

const ChampionPodiumCard: React.FC<{ topThree: RankDisplayPlayer[]; loading?: boolean }> = ({ topThree, loading }) => {
  const sorted = [...topThree].sort((a, b) => a.rank - b.rank);
  const layout = PODIUM_LAYOUT[Math.min(sorted.length, 3)] ?? [];
  const shellClass = 'lb-podium';

  if (loading) {
    return (
      <div className={shellClass} style={{
        ...card,
        background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(251,191,36,0.06) 100%)',
        border: '3px solid #f59e0b',
        boxShadow: '0 6px 0 #d97706',
        padding: 'clamp(16px,4vw,28px)',
      }}>
        <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 13 }}>
          Sıralama yükleniyor…
        </div>
      </div>
    );
  }

  if (topThree.length === 0) {
    return (
      <div className={shellClass} style={{
        ...card,
        background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(251,191,36,0.06) 100%)',
        border: '3px solid #f59e0b',
        boxShadow: '0 6px 0 #d97706',
        padding: 'clamp(16px,4vw,28px)',
        textAlign: 'center',
      }}>
        <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>Henüz sıralama yok</p>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Puan kazanarak zirveye çık.</p>
      </div>
    );
  }

  return (
    <div className={shellClass} style={{
      ...card,
      background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(251,191,36,0.06) 100%)',
      border: '3px solid #f59e0b',
      boxShadow: '0 6px 0 #d97706',
      padding: 'clamp(16px,4vw,28px)',
      position: 'relative',
    }}>
      <h2 style={{
        textAlign: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text-dark)',
        margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
        <Crown size={20} color="#f59e0b" /> Top 3 Şampiyonlar
      </h2>
      <div className="lb-podium__stage">
        {layout.map(slotRank => {
          const player = sorted.find(p => p.rank === slotRank);
          if (!player) return null;
          const i = podiumVisualIndex(slotRank);
          const isFirst = player.rank === 1;
          const badge = player.rank === 1 ? '👑' : player.rank === 2 ? '🥈' : '🥉';
          const sz = isFirst ? 72 : 58;
          return (
            <div key={player.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div style={{ position: 'relative' }}>
                <Avatar url={player.avatar_url} name={player.username} size={sz} border={`${isFirst ? 4 : 3}px solid ${PODIUM_COLORS[i]}`} />
                <div style={{ position: 'absolute', top: -8, right: -6, fontSize: isFirst ? 22 : 18 }}>{badge}</div>
              </div>
              <p style={{
                fontWeight: 900, fontSize: isFirst ? 14 : 12, color: 'var(--text-dark)',
                textAlign: 'center', margin: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {player.username}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={10} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b' }}>
                  {player.points.toLocaleString('tr-TR')}
                </span>
              </div>
              <div style={{
                width: isFirst ? 80 : 64, height: PODIUM_HEIGHTS[i],
                borderRadius: '12px 12px 0 0',
                background: PODIUM_COLORS[i], border: '3px solid var(--dark-border)',
                boxShadow: '0 -4px 0 var(--dark-border) inset',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: isFirst ? 24 : 20, fontWeight: 900, color: 'white' }}>
                  #{player.rank}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LeaderboardRankRow: React.FC<{
  player: RankDisplayPlayer;
  isCurrentUser: boolean;
  subtitle?: string;
  pointsLabel?: string;
}> = ({ player, isCurrentUser, subtitle, pointsLabel }) => (
  <div style={{
    ...card,
    border: isCurrentUser ? '3px solid var(--primary-blue)' : '3px solid var(--dark-border)',
    boxShadow: isCurrentUser ? '0 6px 0 var(--primary-blue)' : '0 6px 0 var(--dark-border)',
    background: isCurrentUser ? 'rgba(123,110,246,0.07)' : 'var(--card-bg)',
    padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12,
  }}>
    <div style={{ width: 32, textAlign: 'center', flexShrink: 0 }}>
      <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)' }}>#{player.rank}</span>
    </div>
    <Avatar
      url={player.avatar_url}
      name={player.username}
      size={40}
      border={isCurrentUser ? '2.5px solid var(--primary-blue)' : '2.5px solid var(--dark-border)'}
    />
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <p style={{
          fontWeight: 900, fontSize: 13,
          color: isCurrentUser ? 'var(--primary-blue)' : 'var(--text-dark)',
          margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {player.username}
        </p>
        {isCurrentUser && (
          <span style={{
            fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 999,
            background: 'var(--primary-blue)', color: 'white', flexShrink: 0,
          }}>SEN</span>
        )}
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: 11, margin: 0, fontWeight: 600 }}>
        {subtitle ?? `Seviye ${player.level}`}
      </p>
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Star size={12} fill="#f59e0b" color="#f59e0b" />
        <span style={{ fontWeight: 900, fontSize: 14, color: '#f59e0b' }}>
          {player.points.toLocaleString('tr-TR')}
        </span>
      </div>
      {pointsLabel && (
        <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)' }}>{pointsLabel}</span>
      )}
    </div>
  </div>
);

const MyRankingCard: React.FC<{
  rank: number;
  points: number;
  level: number;
  username: string;
  avatarUrl: string | null;
  pointsLabel?: string;
  outsideTop50?: boolean;
  title?: string;
}> = ({ rank, points, level, username, avatarUrl, pointsLabel, outsideTop50, title = 'Senin Sıralaman' }) => (
  <div style={{
    ...card,
    border: '3px solid var(--primary-blue)',
    boxShadow: '0 6px 0 var(--primary-blue)',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'rgba(123,110,246,0.06)',
  }}>
    <Avatar url={avatarUrl} name={username} size={44} border="3px solid var(--primary-blue)" />
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontWeight: 900, fontSize: 14, color: 'var(--text-dark)', margin: '0 0 2px' }}>
        {title}
        {outsideTop50 && (
          <span style={{ marginLeft: 8, fontSize: 10, color: 'var(--text-muted)', fontWeight: 700 }}>
            (İlk 20 dışında)
          </span>
        )}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <TrendingUp size={12} color="#22c55e" />
        <span style={{ fontSize: 12, fontWeight: 700, color: '#22c55e' }}>
          {points.toLocaleString('tr-TR')} puan
          {pointsLabel && (
            <span style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: 10 }}> ({pointsLabel})</span>
          )}
        </span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>· Seviye {level}</span>
      </div>
    </div>
    <p style={{ fontWeight: 900, fontSize: 32, color: 'var(--primary-blue)', margin: 0, flexShrink: 0 }}>#{rank}</p>
  </div>
);

/* ── Thin wrapper so the rest of the file uses the same API ── */
const Avatar: React.FC<{ url: string | null; name: string; size?: number; border?: string }> = ({ url, name, size = 40, border }) => (
  <NeoAvatar src={url} name={name} size={size} shape="circle" border={border !== undefined ? Boolean(border) : true} />
);

type LeaderboardTab = 'alltime' | 'events';

type EventChipKind = 'live' | 'upcoming' | 'ended';

const LB_CHIP_STICKERS = {
  alltime: 'superstar.svg',
  live: 'hotflame.svg',
  upcoming: 'partytime.svg',
  ended: 'chill.svg',
} as const;

const eventStatusMeta = (ev: AppEvent) => {
  const ended = new Date(ev.end_date) < new Date()
    || deriveEventStatus(ev) === 'ended'
    || deriveEventStatus(ev) === 'distributed';
  const upcoming = !ended && new Date(ev.start_date) > new Date();
  const kind: EventChipKind = ended ? 'ended' : upcoming ? 'upcoming' : 'live';
  return {
    ended,
    upcoming,
    kind,
    label: ended ? 'Bitti' : upcoming ? 'Yaklaşan' : 'Canlı',
  };
};

const ChipSticker: React.FC<{ kind: keyof typeof LB_CHIP_STICKERS }> = ({ kind }) => {
  const asset = colorfulSticker(LB_CHIP_STICKERS[kind]);
  if (!asset?.url) return null;
  return (
    <StickerDecorImg
      src={asset.url}
      width={72}
      height={72}
      loading="lazy"
      className="lb-event-chip__sticker"
    />
  );
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

const PRIZE_RANK_THEME: Record<number, { medal: string; accent: string; bg: string; shadow: string }> = {
  1: { medal: '🥇', accent: '#f59e0b', bg: '#fef9c3', shadow: '#d97706' },
  2: { medal: '🥈', accent: '#94a3b8', bg: '#f1f5f9', shadow: '#64748b' },
  3: { medal: '🥉', accent: '#f97316', bg: '#ffedd5', shadow: '#ea580c' },
};

type PrizeLeader = { username: string; avatar_url: string | null };

const EventPrizeChip: React.FC<{ prize: RewardPrize; leader?: PrizeLeader; featured?: boolean }> = ({
  prize,
  leader,
  featured = false,
}) => {
  const rank = Math.min(Math.max(prize.rank, 1), 3);
  const theme = PRIZE_RANK_THEME[rank];
  const imageIsUrl = /^https?:\/\//i.test(prize.rewardImage ?? '');

  return (
    <div
      className={`event-lb__prize event-lb__prize--r${rank}${featured ? ' event-lb__prize--featured' : ''}`}
      style={{ '--prize-accent': theme.accent, '--prize-bg': theme.bg, '--prize-shadow': theme.shadow } as React.CSSProperties}
    >
      <div className="event-lb__prize-head">
        <span className="event-lb__prize-medal" aria-hidden>{theme.medal}</span>
        <span className="event-lb__prize-rank-label">{prize.label || `${rank}. sıra`}</span>
      </div>

      <div className="event-lb__prize-reward">
        <div className="event-lb__prize-visual">
          {imageIsUrl ? (
            <img src={prize.rewardImage} alt="" className="event-lb__prize-img" />
          ) : (
            <span className="event-lb__prize-icon" aria-hidden>{prize.rewardImage || '🎁'}</span>
          )}
        </div>
        <p className="event-lb__prize-name">{prize.rewardName || '—'}</p>
      </div>

      <div className="event-lb__prize-foot">
        <p className="event-lb__prize-foot-label">{leader ? 'Lider' : 'Henüz lider yok'}</p>
        {leader ? (
          <div className="event-lb__prize-leader">
            <Avatar url={leader.avatar_url} name={leader.username} size={22} border="" />
            <span className="event-lb__prize-leader-name">{leader.username}</span>
          </div>
        ) : (
          <p className="event-lb__prize-leader-empty">—</p>
        )}
      </div>
    </div>
  );
};

/* ── Join / login prompts for event tab ── */
const EventUserPositionCard: React.FC<{
  participation: EventParticipation | null;
  ended: boolean;
  upcoming: boolean;
  onJoin: () => void;
  joining: boolean;
  isLoggedIn: boolean;
}> = ({ participation, ended, upcoming, onJoin, joining, isLoggedIn }) => {
  if (ended || upcoming || participation?.joined) return null;

  if (!isLoggedIn) {
    return (
      <div className="event-lb__you">
        <p style={{ fontWeight: 900, fontSize: 13, margin: '0 0 4px', color: 'var(--text-dark)' }}>Etkinliğe katılmak için giriş yap</p>
        <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>Etkinlik puanları yalnızca katılımcılar için sayılır.</p>
      </div>
    );
  }

  return (
    <div className="event-lb__you event-lb__you--join">
      <p style={{ fontWeight: 900, fontSize: 14, margin: '0 0 6px', color: 'var(--text-dark)' }}>Henüz katılmadın</p>
      <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: '0 0 12px' }}>
        Katıl — kazandığın puanlar bu sıralamaya yansır.
      </p>
      <button type="button" onClick={onJoin} disabled={joining} className="btn-primary" style={{ width: '100%' }}>
        {joining ? 'Katılınıyor…' : 'Etkinliğe Katıl'}
      </button>
    </div>
  );
};

/* ── Active Event Banner — event-specific points leaderboard ── */
const ActiveEventBanner: React.FC<{ event: AppEvent; showUserCard?: boolean }> = ({ event, showUserCard = false }) => {
  const { authUser, profile } = useAuth();
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

  React.useEffect(() => { void loadEventBoard(); }, [loadEventBoard]);

  const refreshEventBoard = React.useCallback(() => {
    void loadEventBoard();
  }, [loadEventBoard]);

  useRealtimeTable('leaderboard_signals', refreshEventBoard, !ended);
  useRealtimeTable('event_participants', refreshEventBoard, !ended);

  React.useEffect(() => onLeaderboardRefresh(refreshEventBoard), [refreshEventBoard]);

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
  const sortedWinners = [...(ended ? finalWinners : [])].sort((a, b) => a.final_rank - b.final_rank);
  const statusClass = ended ? 'event-lb__status--ended' : upcoming ? 'event-lb__status--upcoming' : '';

  const prizeSubtitle = (rank: number) => {
    const prize = prizes.find(pr => pr.rank === rank);
    return prize ? `${prize.rewardImage} ${prize.rewardName}` : undefined;
  };

  const leaderForPrizeRank = (rank: number): PrizeLeader | undefined => {
    if (ended) {
      const winner = sortedWinners.find(w => w.final_rank === rank);
      if (!winner) return undefined;
      return {
        username: winner.profiles?.username ?? '—',
        avatar_url: winner.profiles?.avatar_url ?? null,
      };
    }
    const player = topPlayers.find(p => p.rank === rank);
    if (!player) return undefined;
    return { username: player.username, avatar_url: player.avatar_url };
  };

  const sortedPrizes = [...prizes].sort((a, b) => a.rank - b.rank);
  const prizePodiumOrder = sortedPrizes.length === 3
    ? [2, 1, 3].map(rank => sortedPrizes.find(p => p.rank === rank)).filter((p): p is RewardPrize => Boolean(p))
    : sortedPrizes;

  const inEventList = Boolean(authUser?.id && topPlayers.some(p => p.id === authUser.id));
  const eventTop3 = displayPlayers.slice(0, 3);
  const eventRest = displayPlayers.slice(3);
  const winnerTop3 = sortedWinners.slice(0, 3);
  const winnerRest = sortedWinners.slice(3);
  const showEventMyRank = Boolean(
    showUserCard
    && participation?.joined
    && participation.rank != null
    && authUser
    && !inEventList,
  );

  return (
    <div className="event-lb">

      <div className="event-lb__banner" style={{ background: ended ? '#BFFF00' : bannerColor, color: textOnBanner }}>
        <div className="event-lb__banner-deco" aria-hidden>{event.emoji ?? '🏆'}</div>

        <span className={`event-lb__status ${statusClass}`}>
          <Trophy size={10} />
          {ended ? 'Etkinlik bitti' : upcoming ? 'Yaklaşan' : 'Canlı'}
        </span>

        <div className="event-lb__banner-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <h3 className="event-lb__title" style={{ color: textOnBanner }}>{event.title}</h3>
            {event.description && (
              <p className="event-lb__desc" style={{ color: subOnBanner }}>{event.description}</p>
            )}
            <div className="event-lb__meta">
              {event.multiplier && (
                <span className="event-lb__meta-pill" style={{ background: '#000', color: '#FFE500' }}>
                  ⚡ {event.multiplier}x
                </span>
              )}
              {(event.win_count ?? prizes.length) > 0 && (
                <span className="event-lb__meta-pill" style={{ color: textOnBanner }}>
                  <Users size={10} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
                  {event.win_count ?? prizes.length} ödül
                </span>
              )}
            </div>
          </div>

          {!ended && !upcoming && (
            <div className="event-lb__countdown">
              <p className="event-lb__countdown-label"><Timer size={10} /> Bitiş</p>
              <div className="event-lb__countdown-units">
                {[{ v: cd.days, l: 'G' }, { v: cd.hours, l: 'S' }, { v: cd.mins, l: 'D' }].map(u => (
                  <div key={u.l} className="event-lb__countdown-unit">
                    <strong>{String(u.v).padStart(2, '0')}</strong>
                    <span>{u.l}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {prizes.length > 0 && (
        <div className="event-lb__prizes">
          <div className="event-lb__prizes-head">
            <h4><Gift size={14} color="#f59e0b" /> Ödül havuzu</h4>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)' }}>{prizes.length} ödül</span>
          </div>
          <div className="event-lb__prizes-grid">
            {prizePodiumOrder.map(prize => (
              <EventPrizeChip
                key={prize.rank}
                prize={prize}
                leader={leaderForPrizeRank(prize.rank)}
                featured={prize.rank === 1}
              />
            ))}
          </div>
        </div>
      )}

      <div className="event-lb__body">
        {showUserCard && (
          <EventUserPositionCard
            participation={participation}
            ended={ended}
            upcoming={upcoming}
            onJoin={() => { void handleJoin(); }}
            joining={joining}
            isLoggedIn={Boolean(authUser?.id)}
          />
        )}

        {showEventMyRank && (
          <MyRankingCard
            rank={participation!.rank!}
            points={participation!.points ?? 0}
            level={topPlayers.find(p => p.id === authUser!.id)?.level ?? profile?.level ?? 1}
            username={profile?.username ?? authUser!.email ?? 'Sen'}
            avatarUrl={profile?.avatar_url ?? null}
            pointsLabel="etkinlik"
            outsideTop50={participation!.rank! > 50}
          />
        )}

        {!ended && displayPlayers.length > 0 && (
          <>
            <div className="event-lb__standings-head">
              <h4>Canlı sıralama</h4>
              <span className="event-lb__live-dot" aria-hidden />
            </div>
            <div className="event-lb__standings">
              <ChampionPodiumCard topThree={eventTop3.map(toEventRankPlayer)} />
              {eventRest.length > 0 && (
                <>
                  <p className="lb-section-label">Sıra 4+</p>
                  <div className="event-lb__list">
                    {eventRest.map(p => (
                      <LeaderboardRankRow
                        key={p.id}
                        player={toEventRankPlayer(p)}
                        isCurrentUser={p.id === authUser?.id}
                        subtitle={prizeSubtitle(p.rank)}
                        pointsLabel="etkinlik"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {ended && sortedWinners.length > 0 && (
          <>
            <div className="event-lb__standings-head">
              <h4>Final sıralaması</h4>
            </div>
            <div className="event-lb__standings">
              <ChampionPodiumCard topThree={winnerTop3.map(w => ({
                id: w.user_id,
                rank: w.final_rank,
                username: w.profiles?.username ?? '—',
                avatar_url: w.profiles?.avatar_url ?? null,
                level: 0,
                points: w.final_points,
              }))} />
              {winnerRest.length > 0 && (
                <>
                  <p className="lb-section-label">Sıra 4+</p>
                  <div className="event-lb__list">
                    {winnerRest.map(w => (
                      <LeaderboardRankRow
                        key={w.id}
                        player={{
                          id: w.user_id,
                          rank: w.final_rank,
                          username: w.profiles?.username ?? '—',
                          avatar_url: w.profiles?.avatar_url ?? null,
                          level: 0,
                          points: w.final_points,
                        }}
                        isCurrentUser={w.user_id === authUser?.id}
                        subtitle={w.prize_title}
                        pointsLabel="final"
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {!ended && displayPlayers.length === 0 && (
          <div style={{ ...card, padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🚀</div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>Henüz sıralama yok</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
              Katıl, puan kazan ve zirveye çık.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Leaderboard ── */
const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<LeaderboardTab>('alltime');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const { authUser, profile } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRankEntry, setMyRankEntry] = useState<LeaderboardEntry | null>(null);
  const [activeEvents, setActiveEvents] = useState<AppEvent[]>([]);
  const [eventsDbReady, setEventsDbReady] = useState(true);
  const [eventsDbMissing, setEventsDbMissing] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tabRef = React.useRef(tab);
  const authUserRef = React.useRef(authUser);
  tabRef.current = tab;
  authUserRef.current = authUser;

  const fetchMyRank = React.useCallback(async () => {
    try {
      setMyRankEntry(await getMyAlltimeRank());
    } catch {
      setMyRankEntry(null);
    }
  }, []);

  const loadLeaderboard = React.useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getLeaderboard(LEADERBOARD_TOP_LIMIT);
      setLeaderboard(data);
      const uid = authUserRef.current?.id;
      if (uid && !data.find(p => p.id === uid)) {
        await fetchMyRank();
      } else {
        setMyRankEntry(null);
      }
    } catch (err) {
      console.warn('[Leaderboard] load failed:', err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  }, [fetchMyRank]);

  const refreshAlltime = React.useCallback(() => {
    void loadLeaderboard(true);
  }, [loadLeaderboard]);

  useEffect(() => {
    if (tab === 'events') return;
    loadLeaderboard();
  }, [tab, authUser, loadLeaderboard]);

  useRealtimeTable('leaderboard_signals', refreshAlltime);
  useRealtimeTable('profiles', refreshAlltime);
  useRealtimeTable('points_transactions', refreshAlltime);

  useEffect(() => onLeaderboardRefresh(refreshAlltime), [refreshAlltime]);

  // Polling fallback when Realtime or leaderboard_signals migration is not deployed yet
  useEffect(() => {
    const interval = setInterval(refreshAlltime, 5000);
    return () => clearInterval(interval);
  }, [refreshAlltime]);

  const loadPrizeEvents = React.useCallback(async () => {
    try {
      await syncEventStatuses().catch(() => {});
      setActiveEvents(await getLeaderboardPrizeEvents());
    } catch {
      try {
        await syncEventStatuses().catch(() => {});
        const evs = await getActiveEvents();
        setActiveEvents(evs.filter(e => Array.isArray(e.rewards_json) && (e.rewards_json as RewardPrize[]).length > 0));
      } catch {
        setActiveEvents([]);
      }
    }
  }, []);

  useEffect(() => {
    if (tab !== 'events') return;
    void syncEventStatuses().then(() => loadPrizeEvents());
    const interval = setInterval(() => { void syncEventStatuses().then(() => loadPrizeEvents()); }, 30000);
    return () => clearInterval(interval);
  }, [tab, loadPrizeEvents]);

  useEffect(() => {
    void checkLeaderboardDb().then(({ ready, missing }) => {
      setEventsDbReady(ready);
      setEventsDbMissing(missing);
    });
  }, []);

  useEffect(() => {
    void loadPrizeEvents();
    const interval = setInterval(() => { void loadPrizeEvents(); }, 60000);
    const channel = supabase
      .channel('leaderboard_prize_events')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        void loadPrizeEvents();
      })
      .subscribe();
    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, [loadPrizeEvents]);

  useEffect(() => {
    if (activeEvents.length === 0) return;
    if (!selectedEventId || !activeEvents.some(e => e.id === selectedEventId)) {
      setSelectedEventId(activeEvents[0].id);
    }
  }, [activeEvents, selectedEventId]);

  const selectedEvent = activeEvents.find(e => e.id === selectedEventId) ?? activeEvents[0] ?? null;

  const openEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setTab('events');
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const inLeaderboardList = Boolean(authUser && leaderboard.some(p => p.id === authUser.id));
  const myRank = inLeaderboardList
    ? leaderboard.find(p => p.id === authUser!.id)!
    : myRankEntry;

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-5 max-w-2xl mx-auto overflow-x-hidden lb-page">

        <StickerHero
          page="leaderboard"
          bg="linear-gradient(135deg,#FF3E9D 0%,#9122FF 100%)"
          badge="👑 LİDERLİK"
          title="Zirveye çık,"
          highlight="efsane ol!"
          titleColor="#ffffff"
          highlightColor="#C8FF00"
        />

        {!eventsDbReady && (tab === 'events' || activeEvents.length > 0) && (
          <div style={{
            ...card,
            padding: '14px 16px',
            border: '3px solid #f59e0b',
            boxShadow: '0 4px 0 #d97706',
            background: 'rgba(245,158,11,0.08)',
          }}>
            <p style={{ margin: '0 0 6px', fontWeight: 900, fontSize: 13, color: 'var(--text-dark)' }}>
              Etkinlik sıralaması veritabanı kurulumu gerekli
            </p>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Supabase SQL Editor&apos;da <code style={{ fontSize: 11 }}>supabase/apply_event_leaderboard.sql</code> dosyasını çalıştırın.
              {eventsDbMissing.length > 0 && ` Eksik: ${eventsDbMissing.join(', ')}.`}
            </p>
          </div>
        )}

        {activeEvents.length > 0 && (
          <section className="lb-events-strip" aria-label="Sıralama seçimi">
            <p className="lb-section-label lb-events-strip__label">
              <Trophy size={13} color="#f59e0b" /> Sıralama türü
            </p>
            <div className="lb-events-strip__scroll">
              <button
                type="button"
                className={`lb-event-chip lb-event-chip--alltime${tab === 'alltime' ? ' lb-event-chip--active' : ''}`}
                onClick={() => setTab('alltime')}
              >
                <div className="lb-event-chip__body">
                  <span className="lb-event-chip__status lb-event-chip__status--alltime">Genel</span>
                  <p className="lb-event-chip__title">Tüm Zamanlar</p>
                  <p className="lb-event-chip__meta">Top {LEADERBOARD_TOP_LIMIT} · toplam puan sıralaması</p>
                </div>
                <div className="lb-event-chip__visual" aria-hidden>
                  <ChipSticker kind="alltime" />
                </div>
              </button>
              {activeEvents.map(ev => {
                const { label, kind } = eventStatusMeta(ev);
                const prizeCount = (ev.rewards_json as RewardPrize[] | null)?.length ?? 0;
                const isSelected = tab === 'events' && selectedEventId === ev.id;
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => openEvent(ev.id)}
                    className={`lb-event-chip lb-event-chip--${kind}${isSelected ? ' lb-event-chip--active' : ''}`}
                    style={{ '--chip-accent': ev.color ?? undefined } as React.CSSProperties}
                  >
                    <div className="lb-event-chip__body">
                      <span className={`lb-event-chip__status lb-event-chip__status--${kind}`}>
                        {label}
                      </span>
                      <p className="lb-event-chip__title">{ev.title}</p>
                      <p className="lb-event-chip__meta">
                        {prizeCount} ödül · Etkinlik puanına göre sıralama
                      </p>
                    </div>
                    <div className="lb-event-chip__visual" aria-hidden>
                      <ChipSticker kind={kind} />
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {tab === 'events' && selectedEvent && (
          <ActiveEventBanner event={selectedEvent} showUserCard />
        )}

        {tab === 'events' && activeEvents.length === 0 && (
          <div style={{ ...card, padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>🏆</div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>Aktif etkinlik yok</p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
              Ödüllü etkinlikler başladığında burada görünür.
            </p>
          </div>
        )}

        {tab !== 'events' && (
        <div className="lb-rankings-block">
        {authUser && myRank && !inLeaderboardList && (
          <MyRankingCard
            rank={myRank.rank}
            points={myRank.total_points}
            level={myRank.level}
            username={profile?.username ?? authUser.email ?? 'Sen'}
            avatarUrl={profile?.avatar_url ?? null}
            outsideTop50={!inLeaderboardList && myRank.rank > LEADERBOARD_TOP_LIMIT}
          />
        )}

        <ChampionPodiumCard topThree={top3.map(toRankPlayer)} loading={isLoading} />

        {!isLoading && rest.length === 0 && leaderboard.length === 0 ? (
          <div style={{ ...card, padding: '32px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📊</div>
            <p style={{ fontWeight: 900, fontSize: 15, color: 'var(--text-dark)', margin: '0 0 6px' }}>
              Henüz kimse yok
            </p>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, margin: 0 }}>
              İlk puanı kazanan olun 🚀
            </p>
          </div>
        ) : (
          <>
          {!isLoading && rest.length > 0 && (
            <p className="lb-section-label">
              Sıra 4–{Math.min(LEADERBOARD_TOP_LIMIT, leaderboard.length)}
            </p>
          )}
          <div className="event-lb__list">
            {rest.map(player => (
              <LeaderboardRankRow
                key={player.id}
                player={toRankPlayer(player)}
                isCurrentUser={player.id === authUser?.id}
              />
            ))}
          </div>
          </>
        )}
        </div>
        )}

    </div>
  );
};

export default Leaderboard;
