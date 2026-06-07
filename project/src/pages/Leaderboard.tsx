import React, { useState, useEffect } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Sparkles, Timer, Medal } from 'lucide-react';
import { leaderboard } from '../data/mockData';
import { useRewardEvents, RewardEvent, Winner } from '../context/RewardEventsContext';

/* ── Countdown hook ── */
const useCountdown = (endDate: string) => {
  const calc = () => {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0, ended: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      mins: Math.floor((diff % 3600000) / 60000),
      secs: Math.floor((diff % 60000) / 1000),
      ended: false,
    };
  };
  const [cd, setCd] = useState(calc);
  useEffect(() => {
    const t = setInterval(() => setCd(calc()), 1000);
    return () => clearInterval(t);
  }, [endDate]);
  return cd;
};

/* ── Confetti burst ── */
const Confetti: React.FC = () => {
  const colors = ['#FFD700', '#7B6EF6', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
  const pieces = Array.from({ length: 28 }, (_, i) => ({
    id: i,
    color: colors[i % colors.length],
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 1.2}s`,
    duration: `${1.2 + Math.random() * 1}s`,
    size: `${6 + Math.random() * 8}px`,
    rotate: `${Math.random() * 360}deg`,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-confetti rounded-sm"
          style={{
            left: p.left,
            top: '-10px',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            animationDelay: p.delay,
            animationDuration: p.duration,
            transform: `rotate(${p.rotate})`,
          }}
        />
      ))}
    </div>
  );
};

/* ── Countdown Display ── */
const CountdownBlock: React.FC<{ endDate: string }> = ({ endDate }) => {
  const cd = useCountdown(endDate);
  if (cd.ended) return <span className="font-black text-red-400">Event Ended</span>;
  const units = [
    { label: 'D', val: cd.days },
    { label: 'H', val: cd.hours },
    { label: 'M', val: cd.mins },
    { label: 'S', val: cd.secs },
  ];
  return (
    <div className="flex items-center gap-1">
      {units.map(u => (
        <React.Fragment key={u.label}>
          <div className="bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 text-center min-w-[36px]">
            <p className="font-black text-white text-sm leading-none">{String(u.val).padStart(2,'0')}</p>
            <p className="text-white/60 text-[9px] font-bold uppercase">{u.label}</p>
          </div>
          {u.label !== 'S' && <span className="text-white/60 font-black text-sm">:</span>}
        </React.Fragment>
      ))}
    </div>
  );
};

/* ── Active Event Banner ── */
const ActiveEventBanner: React.FC<{ event: RewardEvent }> = ({ event }) => {
  const ended = new Date(event.endDate) < new Date();
  const { getWinners } = useRewardEvents();
  const winners: Winner[] = ended ? getWinners(event) : [];
  const [showAll, setShowAll] = useState(false);

  const medal = (rank: number) =>
    rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `🏅`;

  return (
    <div className={`relative rounded-3xl overflow-hidden border-4 border-black dark:border-gray-700 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.5)]`}>
      {ended && <Confetti />}

      {/* Banner gradient bg */}
      <div className={`relative bg-gradient-to-r ${event.banner} p-5`}>
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-black text-white mb-2 border border-white/30">
                <Trophy size={10} fill="currentColor" />
                {ended ? '🎉 EVENT ENDED — WINNERS!' : 'LIVE REWARD EVENT'}
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mb-1 drop-shadow">{event.title}</h3>
              <p className="text-white/80 text-xs sm:text-sm max-w-md line-clamp-2">{event.description}</p>
            </div>
            {!ended && (
              <div className="flex-shrink-0 bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-3 border border-white/20">
                <p className="text-white/70 text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-1"><Timer size={10} /> Ends In</p>
                <CountdownBlock endDate={event.endDate} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prize cards */}
      <div className="bg-white dark:bg-gray-800 p-4 space-y-3">
        {!ended && (
          <>
            <p className="font-black text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
              <Gift size={15} className="text-purple-500" /> Prize Pool
              <span className="text-xs font-normal text-gray-400">— Earn the most points to win!</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {event.rewards.slice(0, 3).map(r => (
                <div key={r.rank}
                  className={`relative rounded-2xl p-3 border-2 text-center transition-transform hover:scale-[1.02] cursor-default ${
                    r.rank === 1
                      ? 'border-amber-400 bg-gradient-to-b from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 shadow-[2px_2px_0px_0px_rgba(251,191,36,0.5)]'
                      : r.rank === 2
                      ? 'border-gray-300 dark:border-gray-500 bg-gradient-to-b from-gray-50 to-slate-50 dark:from-gray-800 dark:to-gray-750 shadow-[2px_2px_0px_0px_rgba(156,163,175,0.4)]'
                      : 'border-orange-300 dark:border-orange-700 bg-gradient-to-b from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/10 shadow-[2px_2px_0px_0px_rgba(251,146,60,0.4)]'
                  }`}>
                  <div className="text-4xl mb-1.5 filter drop-shadow">{r.rewardImage}</div>
                  <span className={`text-xs font-black ${r.rank === 1 ? 'text-amber-600' : r.rank === 2 ? 'text-gray-500' : 'text-orange-500'}`}>{r.label}</span>
                  <p className="font-black text-gray-900 dark:text-white text-sm mt-0.5">{r.rewardName}</p>
                  {r.quantity > 1 && <p className="text-[10px] text-gray-400 mt-0.5">×{r.quantity}</p>}
                </div>
              ))}
            </div>
            {event.rewards.length > 3 && (
              <div>
                <button onClick={() => setShowAll(v => !v)} className="text-xs font-bold text-[#7B6EF6] dark:text-[#4F8EF7] hover:underline">
                  {showAll ? '▲ Show less' : `▼ Show all ${event.rewards.length} prizes`}
                </button>
                {showAll && (
                  <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {event.rewards.slice(3).map(r => (
                      <div key={r.rank} className="rounded-xl p-2 border border-gray-200 dark:border-gray-700 flex items-center gap-2 bg-gray-50 dark:bg-gray-750">
                        <span className="text-xl">{r.rewardImage}</span>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400">{r.label}</p>
                          <p className="text-xs font-black text-gray-900 dark:text-white truncate">{r.rewardName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Winners display when ended */}
        {ended && (
          <div className="space-y-3">
            <p className="font-black text-gray-900 dark:text-white flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500" /> Final Winners
            </p>
            <div className="space-y-2">
              {winners.map(w => (
                <div key={w.rank}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
                    w.rank === 1
                      ? 'border-amber-400 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/10'
                      : w.rank === 2
                      ? 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-750'
                      : 'border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/10'
                  }`}>
                  <span className="text-2xl flex-shrink-0">{medal(w.rank)}</span>
                  <img src={w.avatar} alt={w.username} className="w-9 h-9 rounded-full border-2 border-black dark:border-gray-600 flex-shrink-0 object-cover"
                    onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${w.username}&background=7B6EF6&color=fff`; }} />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-sm text-gray-900 dark:text-white truncate">{w.username}</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="flex items-center gap-0.5 text-xs text-amber-600 dark:text-amber-400 font-bold">
                        <Star size={10} fill="currentColor" />{w.points.toLocaleString()} pts
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{w.reward.rewardImage} {w.reward.rewardName}</span>
                    </div>
                  </div>
                  {w.rank === 1 && (
                    <span className="flex-shrink-0 bg-amber-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full border border-amber-600 animate-pulse">
                      CHAMPION
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ── Main Leaderboard Page ── */
const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const { events } = useRewardEvents();

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);
  const podiumOrder = [top3[1], top3[0], top3[2]];

  const publishedEvents = events.filter(e => e.published);

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <Trophy className="text-amber-500" size={24} />
        Leaderboard
      </h1>

      {/* ── Active Reward Events ── */}
      {publishedEvents.length > 0 && (
        <div className="space-y-4">
          {publishedEvents.map(ev => (
            <ActiveEventBanner key={ev.id} event={ev} />
          ))}
        </div>
      )}

      {/* Tab */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-2xl border-2 border-black dark:border-gray-600 p-1">
        {(['weekly', 'monthly', 'alltime'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-xl font-bold text-xs capitalize transition-all ${
              tab === t ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-2 border-black dark:border-gray-500' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t === 'alltime' ? 'All Time' : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Podium */}
      <div className="card p-4 lg:p-6 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-700">
        <h2 className="text-center font-black text-gray-700 dark:text-gray-300 mb-4 lg:mb-6 flex items-center justify-center gap-2">
          <Crown size={20} className="text-amber-500" />
          Top 3 Champions
        </h2>
        <div className="flex items-end justify-center gap-2 lg:gap-4">
          {podiumOrder.map((player, i) => {
            const rankBadge = player?.rank === 1 ? '👑' : player?.rank === 2 ? '🥈' : '🥉';
            const isFirst = player?.rank === 1;
            return (
              <div key={player?.rank} className="flex flex-col items-center gap-1 lg:gap-2">
                <div className="relative">
                  <div className={`rounded-full overflow-hidden border-2 lg:border-4 ${
                    isFirst ? 'border-amber-400 w-14 h-14 lg:w-20 lg:h-20' : 'border-gray-300 dark:border-gray-600 w-12 h-12 lg:w-16 lg:h-16'
                  }`}>
                    {player?.avatar && <img src={player.avatar} alt={player.username} className="w-full h-full object-cover" />}
                  </div>
                  <div className="absolute -top-1 lg:-top-2 -right-1 lg:-right-2 text-lg lg:text-xl">{rankBadge}</div>
                </div>
                <p className={`font-black text-gray-900 dark:text-white text-center ${isFirst ? 'text-sm lg:text-base' : 'text-xs lg:text-sm'}`}>{player?.username}</p>
                <div className="flex items-center gap-1">
                  <Star size={10} className="text-amber-500" fill="currentColor" />
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{player?.points.toLocaleString()}</span>
                </div>
                <div className={`w-16 lg:w-20 rounded-t-2xl flex items-center justify-center border-2 border-black dark:border-gray-600 ${
                  isFirst ? 'bg-amber-400 h-20 lg:h-24' : i === 0 ? 'bg-gray-300 dark:bg-gray-600 h-14 lg:h-16' : 'bg-orange-300 dark:bg-orange-700 h-10 lg:h-12'
                }`}>
                  <span className="text-xl lg:text-2xl font-black text-white">#{player?.rank}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rest of rankings */}
      <div className="space-y-2">
        {rest.map(player => (
          <div
            key={player.rank}
            className={`card p-3 lg:p-4 flex items-center gap-3 lg:gap-4 transition-all ${player.isCurrentUser ? 'border-[#7B6EF6] dark:border-[#4F8EF7] bg-[#7B6EF6]/5 dark:bg-[#4F8EF7]/5' : 'hover:shadow-md'}`}
          >
            <div className="w-6 lg:w-8 text-center flex-shrink-0">
              <span className={`font-black text-base lg:text-lg ${player.rank <= 10 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>#{player.rank}</span>
            </div>
            <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-black dark:border-gray-600 flex-shrink-0">
              <img src={player.avatar} alt={player.username} className="w-full h-full object-cover"
                onError={e => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${player.username}&background=7B6EF6&color=fff`; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`font-bold text-sm text-gray-900 dark:text-white truncate ${player.isCurrentUser ? 'text-[#7B6EF6] dark:text-[#4F8EF7]' : ''}`}>
                  {player.username}
                </p>
                {player.isCurrentUser && <span className="badge bg-[#7B6EF6]/10 dark:bg-[#4F8EF7]/20 text-[#7B6EF6] dark:text-[#4F8EF7] text-xs flex-shrink-0">You</span>}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Level {player.level}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={12} className="text-amber-500" fill="currentColor" />
              <span className="font-black text-xs lg:text-sm text-amber-600 dark:text-amber-400">{player.points.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Your ranking */}
      <div className="card p-3 lg:p-4 bg-[#7B6EF6]/5 dark:bg-[#4F8EF7]/10 border-2 border-[#7B6EF6] dark:border-[#4F8EF7]">
        <div className="flex items-center gap-3">
          <Trophy size={20} className="text-[#7B6EF6] dark:text-[#4F8EF7] flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-white">Your Ranking</p>
            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">You're in the top 25%!</p>
          </div>
          <div className="ml-auto text-right flex-shrink-0">
            <p className="font-black text-xl lg:text-2xl text-[#7B6EF6] dark:text-[#4F8EF7]">#3</p>
            <div className="flex items-center gap-1 justify-end">
              <TrendingUp size={12} className="text-green-500" />
              <span className="text-xs text-green-500 font-bold">+2 this week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
