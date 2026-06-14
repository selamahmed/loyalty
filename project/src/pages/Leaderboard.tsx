import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Timer, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getLeaderboard, type LeaderboardEntry } from '../services/points';
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

/* ── Shared weekly-style podium + rows ── */
const ChampionPodiumCard: React.FC<{ topThree: RankDisplayPlayer[] }> = ({ topThree }) => {
  const podiumOrder: (RankDisplayPlayer | undefined)[] = [topThree[1], topThree[0], topThree[2]];

  return (
    <div style={{
      ...card,
      background: 'linear-gradient(135deg,rgba(245,158,11,0.12) 0%,rgba(251,191,36,0.06) 100%)',
      border: '3px solid #f59e0b',
      boxShadow: '0 6px 0 #d97706',
      padding: 'clamp(16px,4vw,28px)',
      position: 'relative',
      overflow: 'visible',
    }}>
      <h2 style={{
        textAlign: 'center', fontWeight: 900, fontSize: 16, color: 'var(--text-dark)',
        margin: '0 0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
      }}>
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
                  ? <Avatar url={player.avatar_url} name={player.username} size={sz} border={`${isFirst ? 4 : 3}px solid ${PODIUM_COLORS[i]}`} />
                  : <div style={{
                    width: sz, height: sz, borderRadius: '50%', background: 'var(--tab-bg)',
                    border: `3px solid ${PODIUM_COLORS[i]}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontSize: 22, color: 'var(--text-muted)',
                  }}>—</div>
                }
                <div style={{ position: 'absolute', top: -8, right: -6, fontSize: isFirst ? 22 : 18 }}>{badge}</div>
              </div>
              <p style={{
                fontWeight: 900, fontSize: isFirst ? 14 : 12, color: 'var(--text-dark)',
                textAlign: 'center', margin: 0, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {player?.username ?? '—'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Star size={10} fill="#f59e0b" color="#f59e0b" />
                <span style={{ fontSize: 11, fontWeight: 900, color: '#f59e0b' }}>
                  {player ? player.points.toLocaleString('tr-TR') : '—'}
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
                  #{player?.rank ?? i + 1}
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
            (İlk 50 dışında)
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

const TAB_LABELS: Record<string, string> = {
  weekly: 'Bu Hafta',
  monthly: 'Bu Ay',
  alltime: 'Tüm Zamanlar',
  events: '🏆 Etkinlikler',
};
const PERIOD_LABEL: Record<string, string> = { weekly: 'bu hafta', monthly: 'bu ay', alltime: 'toplam' };
type LeaderboardTab = 'weekly' | 'monthly' | 'alltime' | 'events';

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

const RANK_THEME: Record<number, { medal: string; accent: string }> = {
  1: { medal: '🥇', accent: '#f59e0b' },
  2: { medal: '🥈', accent: '#94a3b8' },
  3: { medal: '🥉', accent: '#f97316' },
};

/* ── Compact prize chip (horizontal scroll) ── */
const EventPrizeChip: React.FC<{ prize: RewardPrize; leader?: EventLeaderboardEntry }> = ({ prize, leader }) => (
  <div className={`event-lb__prize event-lb__prize--r${Math.min(prize.rank, 3)}`}>
    <div className="event-lb__prize-rank">{RANK_THEME[prize.rank]?.medal ?? `#${prize.rank}`}</div>
    <div className="event-lb__prize-icon">{prize.rewardImage}</div>
    <p className="event-lb__prize-name">{prize.rewardName || '—'}</p>
    {leader && <div className="event-lb__prize-leader">{leader.username}</div>}
  </div>
);

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

  const inEventList = Boolean(authUser?.id && topPlayers.some(p => p.id === authUser.id));

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
          <div className="event-lb__prizes-scroll">
            {prizes.map(prize => (
              <EventPrizeChip
                key={prize.rank}
                prize={prize}
                leader={topPlayers.find(p => p.rank === prize.rank)}
              />
            ))}
          </div>
        </div>
      )}

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

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!ended && displayPlayers.length > 0 && (
          <>
            <ChampionPodiumCard topThree={displayPlayers.slice(0, 3).map(toEventRankPlayer)} />
            {displayPlayers.slice(3).map(p => (
              <LeaderboardRankRow
                key={p.id}
                player={toEventRankPlayer(p)}
                isCurrentUser={p.id === authUser?.id}
                subtitle={prizeSubtitle(p.rank)}
                pointsLabel="etkinlik"
              />
            ))}
          </>
        )}

        {ended && sortedWinners.length > 0 && (
          <>
            <ChampionPodiumCard topThree={sortedWinners.slice(0, 3).map(w => ({
              id: w.user_id,
              rank: w.final_rank,
              username: w.profiles?.username ?? '—',
              avatar_url: w.profiles?.avatar_url ?? null,
              level: 0,
              points: w.final_points,
            }))} />
            {sortedWinners.slice(3).map(w => (
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

      {showUserCard && participation?.joined && participation.rank != null && authUser && (
        <MyRankingCard
          rank={participation.rank}
          points={participation.points ?? 0}
          level={topPlayers.find(p => p.id === authUser.id)?.level ?? profile?.level ?? 1}
          username={profile?.username ?? authUser.email ?? 'Sen'}
          avatarUrl={profile?.avatar_url ?? null}
          pointsLabel="etkinlik"
          outsideTop50={!inEventList && participation.rank > 50}
        />
      )}
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
  const [eventsDbReady, setEventsDbReady] = useState(true);
  const [eventsDbMissing, setEventsDbMissing] = useState<string[]>([]);
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

  const liveEventCount = activeEvents.filter(e => {
    const ended = new Date(e.end_date) < new Date() || deriveEventStatus(e) === 'ended' || deriveEventStatus(e) === 'distributed';
    const upcoming = !ended && new Date(e.start_date) > new Date();
    return !ended && !upcoming;
  }).length;

  const openEvent = (eventId: string) => {
    setSelectedEventId(eventId);
    setTab('events');
  };

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

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
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ color: 'var(--text-dark)', fontWeight: 900, fontSize: 'clamp(22px,5vw,30px)', margin: 0, lineHeight: 1 }}>Leaderboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 600, margin: '3px 0 0' }}>Zirveye çık, efsane ol</p>
            {lastUpdate && (
              <p style={{ color: 'var(--text-muted)', fontSize: 10, fontWeight: 600, margin: '4px 0 0', opacity: 0.85 }}>
                Son güncelleme {lastUpdate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </p>
            )}
          </div>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 999, background: 'rgba(34,197,94,0.1)', border: '1.5px solid rgba(34,197,94,0.3)', flexShrink: 0 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e', animation: 'live-pulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: 10, fontWeight: 900, color: '#22c55e', letterSpacing: '0.05em' }}>CANLI</span>
          </div>
        </div>

        <style>{`
          @keyframes live-pulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 6px #22c55e; }
            50% { opacity: 0.5; box-shadow: 0 0 12px #22c55e; }
          }
        `}</style>

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
              {t === 'events' && activeEvents.length > 0 && (
                <span style={{
                  position: 'absolute', top: -6, right: -4,
                  minWidth: 16, height: 16, padding: '0 4px',
                  borderRadius: 999, background: liveEventCount > 0 ? '#ef4444' : '#7B6EF6',
                  color: '#fff', fontSize: 9, fontWeight: 900,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--dark-border)',
                }}>
                  {liveEventCount > 0 ? liveEventCount : activeEvents.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Prize events strip (all tabs) ── */}
        {activeEvents.length > 0 && tab !== 'events' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <p style={{ margin: 0, fontWeight: 900, fontSize: 13, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Trophy size={15} color="#f59e0b" /> Ödül Etkinlikleri
              </p>
              <button
                type="button"
                onClick={() => setTab('events')}
                style={{
                  padding: '6px 10px', borderRadius: 999, border: '2px solid var(--dark-border)',
                  background: 'var(--card-bg)', fontSize: 10, fontWeight: 900, cursor: 'pointer',
                  boxShadow: '0 2px 0 var(--dark-border)',
                }}
              >
                Tümünü gör
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
              {activeEvents.map(ev => {
                const ended = new Date(ev.end_date) < new Date() || deriveEventStatus(ev) === 'ended' || deriveEventStatus(ev) === 'distributed';
                const upcoming = !ended && new Date(ev.start_date) > new Date();
                const statusLabel = ended ? 'Bitti' : upcoming ? 'Yaklaşan' : 'Canlı';
                const statusColor = ended ? '#94a3b8' : upcoming ? '#3b82f6' : '#ef4444';
                return (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => openEvent(ev.id)}
                    style={{
                      flexShrink: 0, minWidth: 220, maxWidth: 280, textAlign: 'left',
                      padding: '12px 14px', borderRadius: 16, cursor: 'pointer',
                      background: ev.color ?? 'var(--card-bg)',
                      border: '3px solid var(--dark-border)',
                      boxShadow: '0 4px 0 var(--dark-border)',
                    }}
                  >
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      padding: '2px 8px', borderRadius: 999, background: '#000',
                      color: statusColor, fontSize: 9, fontWeight: 900, letterSpacing: '0.08em',
                      marginBottom: 6,
                    }}>
                      {statusLabel}
                    </span>
                    <p style={{ margin: 0, fontWeight: 900, fontSize: 13, color: '#000', lineHeight: 1.25 }}>
                      {ev.emoji ?? '🏆'} {ev.title}
                    </p>
                    <p style={{ margin: '4px 0 0', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.65)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {(ev.rewards_json as RewardPrize[] | null)?.length ?? 0} ödül · Sıralamaya katıl
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

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
        <ChampionPodiumCard topThree={top3.map(toRankPlayer)} />

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
            {rest.map(player => (
              <LeaderboardRankRow
                key={player.rank}
                player={toRankPlayer(player)}
                isCurrentUser={player.id === authUser?.id}
                pointsLabel={tab !== 'alltime' ? PERIOD_LABEL[tab] : undefined}
              />
            ))}
          </div>
        )}

        {/* ── Your ranking ── */}
        {authUser && (() => {
          const inList = leaderboard.find(p => p.id === authUser.id);
          const myRank = inList ?? myRankEntry;
          if (!myRank) return null;
          return (
            <MyRankingCard
              rank={myRank.rank}
              points={myRank.total_points}
              level={myRank.level}
              username={profile?.username ?? authUser.email ?? 'Sen'}
              avatarUrl={profile?.avatar_url ?? null}
              pointsLabel={tab !== 'alltime' ? PERIOD_LABEL[tab] : undefined}
              outsideTop50={!inList}
            />
          );
        })()}

        </>
        )}

      </div>
    </div>
  );
};

export default Leaderboard;
