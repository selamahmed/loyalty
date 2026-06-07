import React, { useState } from 'react';
import { Trophy, Star, Crown, TrendingUp, Gift, Award, Sparkles, Users, Zap } from 'lucide-react';
import { leaderboard } from '../data/mockData';
import { tr } from '../lib/tr';

const Leaderboard: React.FC = () => {
  const [tab, setTab] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const podiumOrder = [top3[1], top3[0], top3[2]]; // 2nd, 1st, 3rd

  // Mock gift data
  const giftLeaderboard = [
    { rank: 1, username: 'PixelKing', avatar: 'https://i.pravatar.cc/100?img=1', giftsSent: 45, giftsReceived: 128, totalValue: 12500, streak: 15 },
    { rank: 2, username: 'NeonGamer', avatar: 'https://i.pravatar.cc/100?img=2', giftsSent: 52, giftsReceived: 95, totalValue: 9800, streak: 12 },
    { rank: 3, username: 'StarPlayer99', avatar: 'https://i.pravatar.cc/100?img=3', giftsSent: 38, giftsReceived: 87, totalValue: 7200, streak: 8 },
    { rank: 4, username: 'CosmicQueen', avatar: 'https://i.pravatar.cc/100?img=4', giftsSent: 29, giftsReceived: 64, totalValue: 5400, streak: 5 },
    { rank: 5, username: 'ThunderBlast', avatar: 'https://i.pravatar.cc/100?img=5', giftsSent: 22, giftsReceived: 45, totalValue: 3200, streak: 3 },
  ];

  const giftTypes = [
    { emoji: '🎁', name: 'Gift Box', value: 100, sent: 234 },
    { emoji: '🌹', name: 'Rose', value: 50, sent: 456 },
    { emoji: '💎', name: 'Diamond', value: 500, sent: 89 },
    { emoji: '🏆', name: 'Trophy', value: 300, sent: 123 },
    { emoji: '🌟', name: 'Star', value: 75, sent: 312 },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
        <Trophy className="text-amber-500" size={24} />
        Leaderboard
      </h1>

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
            const podiumHeight = [14, 22, 10][i];
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
                <div
                  className={`w-16 lg:w-20 rounded-t-2xl flex items-center justify-center border-2 border-black dark:border-gray-600 ${
                    isFirst ? 'bg-amber-400 h-20 lg:h-24' : i === 0 ? 'bg-gray-300 dark:bg-gray-600 h-14 lg:h-16' : 'bg-orange-300 dark:bg-orange-700 h-10 lg:h-12'
                  }`}
                >
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

      {/* Gift Leaderboard Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
          <Gift className="text-pink-500" size={24} />
          <h2 className="text-xl font-black text-gray-900 dark:text-white">Gift Champions</h2>
          <Sparkles className="text-amber-500" size={20} />
        </div>

        {/* Gift Stats */}
        <div className="grid grid-cols-3 gap-2 lg:gap-3">
          <div className="card p-3 lg:p-4 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-700 text-center">
            <Gift className="mx-auto text-pink-500 mb-1" size={20} />
            <p className="text-lg lg:text-xl font-black text-gray-900 dark:text-white">1,214</p>
            <p className="text-xs text-gray-500">Gifts Sent</p>
          </div>
          <div className="card p-3 lg:p-4 bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 border-2 border-purple-200 dark:border-purple-700 text-center">
            <Users className="mx-auto text-purple-500 mb-1" size={20} />
            <p className="text-lg lg:text-xl font-black text-gray-900 dark:text-white">487</p>
            <p className="text-xs text-gray-500">Active Givers</p>
          </div>
          <div className="card p-3 lg:p-4 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border-2 border-amber-200 dark:border-amber-700 text-center">
            <Zap className="mx-auto text-amber-500 mb-1" size={20} />
            <p className="text-lg lg:text-xl font-black text-gray-900 dark:text-white">45K</p>
            <p className="text-xs text-gray-500">Points Value</p>
          </div>
        </div>

        {/* Top Gift Givers */}
        <div className="card p-4 lg:p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Award size={18} className="text-amber-500" />
            Top Gift Givers
          </h3>
          <div className="space-y-3">
            {giftLeaderboard.map((user, i) => (
              <div key={user.rank} className={`flex items-center gap-3 p-2 lg:p-3 rounded-xl ${i === 0 ? 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-700' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <div className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-black text-xs ${i === 0 ? 'bg-amber-400 text-white' : i === 1 ? 'bg-gray-400 text-white' : i === 2 ? 'bg-orange-400 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}`}>
                  {user.rank}
                </div>
                <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-black dark:border-gray-600 flex-shrink-0">
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{user.username}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Sent: {user.giftsSent}</span>
                    <span>•</span>
                    <span>Received: {user.giftsReceived}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-sm lg:text-base text-pink-600 dark:text-pink-400">{user.totalValue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                    <Gift size={10} />
                    pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Gifts */}
        <div className="card p-4 lg:p-5 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700">
          <h3 className="font-black text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-500" />
            Popular Gifts
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {giftTypes.map(gift => (
              <div key={gift.name} className="text-center p-2 lg:p-3 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="text-2xl lg:text-3xl mb-1">{gift.emoji}</div>
                <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{gift.name}</p>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">{gift.value} pts</p>
                <p className="text-[10px] text-gray-400 mt-1">{gift.sent} sent</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
