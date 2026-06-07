import React, { useState } from 'react';
import { Search, Star, Flame, Gift, Coffee, Tag, X, Check, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { rewards } from '../data/mockData';
import { playSound } from '../lib/sounds';
import { tr } from '../lib/tr';
import { WinningParticles } from '../components/WinningParticles';

const categories = [
  { id: 'all', label: tr.shop.all || 'All', icon: Gift },
  { id: 'coffee', label: tr.shop.coffee || 'Coffee', icon: Coffee },
  { id: 'pastries', label: tr.shop.pastries || 'Pastries', icon: Tag },
  { id: 'food', label: tr.shop.food || 'Food', icon: Coffee },
  { id: 'drinks', label: tr.shop.drinks || 'Drinks', icon: Coffee },
];

interface RedeemModalProps {
  reward: typeof rewards[0];
  onConfirm: () => void;
  onClose: () => void;
  canAfford: boolean;
}

const RedeemModal: React.FC<RedeemModalProps> = ({ reward, onConfirm, onClose, canAfford }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
    <div className="animate-bounce-in card max-w-sm w-full p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-black text-lg text-gray-900 dark:text-white">{tr.shop.confirmRedemption}</h3>
        <button onClick={onClose} className="p-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors active:scale-90">
          <X size={18} />
        </button>
      </div>
      <div className="h-40 rounded-2xl overflow-hidden border-2 border-black dark:border-gray-700 mb-4 shadow-md hover:shadow-lg transition-shadow">
        <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
      </div>
      <h4 className="font-black text-gray-900 dark:text-white text-lg">{reward.title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">{reward.description}</p>

      {/* Progress bar showing points */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{tr.shop.pointsRequired}</span>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400">{reward.points}/{reward.points}</span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: '100%' }} />
        </div>
      </div>

      <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 mb-4 hover:shadow-md transition-shadow">
        <span className="font-medium text-amber-700 dark:text-amber-400">{tr.shop.cost}</span>
        <div className="flex items-center gap-1">
          <Star size={16} className="text-amber-500" fill="currentColor" />
          <span className="font-black text-amber-600 dark:text-amber-400">{reward.points.toLocaleString()} pts</span>
        </div>
      </div>
      {!canAfford && (
        <p className="text-center text-sm text-red-500 font-medium mb-3">{tr.shop.notEnoughPoints || "You don't have enough points for this reward."}</p>
      )}
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-secondary flex-1 transition-all active:scale-95 hover:shadow-md">{tr.shop.cancel || "Cancel"}</button>
        <button onClick={onConfirm} disabled={!canAfford} className="btn-primary flex-1 disabled:opacity-50 transition-all active:scale-95 hover:shadow-md">
          {tr.shop.redeem}
        </button>
      </div>
    </div>
  </div>
);

const RewardsShop: React.FC = () => {
  const { points, spendPoints, showRewardPopup } = useApp();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedReward, setSelectedReward] = useState<typeof rewards[0] | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  const filtered = rewards.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === 'all' || r.category === category;
    return matchSearch && matchCat;
  });

  const limitedRewards = filtered.filter(r => r.limited);
  const regularRewards = filtered.filter(r => !r.limited);
  const featuredRewards = filtered.slice(0, 3);

  const handleRedeem = () => {
    if (!selectedReward) return;
    playSound('click');
    const ok = spendPoints(selectedReward.points);
    setSelectedReward(null);
    if (ok) {
      setSuccess(selectedReward.title);
      setShowParticles(true);
      playSound('reward');
      showRewardPopup({
        type: 'redeem',
        title: 'Reward Redeemed!',
        subtitle: `Enjoy your ${selectedReward.title}. Check your inventory for the code.`,
      });
      setTimeout(() => setSuccess(null), 3000);
      setTimeout(() => setShowParticles(false), 2000);
    } else {
      playSound('error');
    }
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-x-hidden">
      <WinningParticles trigger={showParticles} emoji="🎉" />

      {selectedReward && (
        <RedeemModal
          reward={selectedReward}
          onConfirm={handleRedeem}
          onClose={() => setSelectedReward(null)}
          canAfford={points >= selectedReward.points}
        />
      )}

      {success && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 sm:px-6 py-3 bg-green-500 text-white rounded-xl sm:rounded-2xl border-2 border-green-700 font-bold flex items-center gap-2 shadow-xl animate-bounce-in">
          <Check size={14} className="sm:w-4 sm:h-4" /> Redeemed: {success}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">{tr.shop.title}</h1>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-amber-50 dark:bg-amber-900/20 rounded-xl sm:rounded-2xl border-2 border-amber-200 dark:border-amber-700 hover:shadow-md transition-shadow">
          <Star size={12} className="sm:w-3.5 sm:h-3.5 text-amber-500" fill="currentColor" />
          <span className="font-black text-sm sm:text-base text-amber-600 dark:text-amber-400">{points.toLocaleString()}</span>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 sm:w-[18px] sm:h-[18px]" />
        <input
          type="text"
          placeholder={tr.shop.searchRewards}
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10 sm:pl-11 text-sm sm:text-base transition-all focus:shadow-md"
        />
      </div>

      {/* Categories with badges */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 sm:-mx-4 px-3 sm:px-4 lg:mx-0 lg:px-0">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => { playSound('click'); setCategory(cat.id); }}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-sm whitespace-nowrap transition-all flex-shrink-0 hover:shadow-md active:scale-95 ${
              category === cat.id
                ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-black dark:border-gray-600 shadow-md'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-black dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <cat.icon size={12} className="sm:w-3.5 sm:h-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Featured Rewards Showcase */}
      {featuredRewards.length > 0 && category === 'all' && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-700 p-4 sm:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={18} className="text-amber-500" fill="currentColor" />
            <h2 className="font-black text-base sm:text-lg text-gray-900 dark:text-white">{tr.shop.featured || 'Featured Rewards'}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {featuredRewards.map(reward => (
              <div
                key={reward.id}
                className="card p-3 sm:p-4 hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer transform active:scale-95"
                onClick={() => { playSound('click'); setSelectedReward(reward); }}
              >
                <div className="h-20 sm:h-24 rounded-xl overflow-hidden border-2 border-black dark:border-gray-700 mb-2 hover:scale-105 transition-transform">
                  <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                </div>
                <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1">{reward.title}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-0.5">
                    <Star size={12} className="text-amber-500" fill="currentColor" />
                    <span className="font-black text-xs text-amber-600 dark:text-amber-400">{reward.points}</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                    points >= reward.points
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}>
                    {points >= reward.points ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Limited time */}
      {limitedRewards.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
            <Flame size={14} className="sm:w-[18px] sm:h-[18px] text-red-500 animate-pulse" />
            <h2 className="font-black text-base sm:text-lg text-gray-900 dark:text-white">{tr.shop.limitedTime}</h2>
            <span className="badge bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs ml-1 font-bold">HOT</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {limitedRewards.map(reward => (
              <div
                key={reward.id}
                className="card w-full min-w-0 relative overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all active:scale-95 cursor-pointer transform"
                onClick={() => { playSound('click'); setSelectedReward(reward); }}
              >
                <div className="absolute top-2 sm:top-3 left-2 sm:left-3 z-10">
                  <span className="badge bg-red-500 text-white border-red-700 text-xs font-bold animate-pulse">{tr.shop.limited}</span>
                </div>
                <div className="h-24 sm:h-28 lg:h-36 overflow-hidden border-b-2 border-black dark:border-gray-700 hover:scale-110 transition-transform">
                  <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-2 sm:p-3">
                  <p className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white line-clamp-1">{reward.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">{reward.description}</p>
                  <div className="flex items-center justify-between mt-2 sm:mt-3">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Star size={10} className="sm:w-3 sm:h-3 text-amber-500" fill="currentColor" />
                      <span className="font-black text-xs sm:text-sm text-amber-600 dark:text-amber-400">{reward.points.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); playSound('click'); setSelectedReward(reward); }}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold text-xs border-2 transition-all active:scale-90 hover:shadow-md ${
                        points >= reward.points
                          ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-black dark:border-gray-600 hover:opacity-90'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {points >= reward.points ? tr.shop.redeem : tr.shop.needMore}
                    </button>
                  </div>
                  {reward.stock !== undefined && reward.stock <= 20 && (
                    <p className="text-xs text-red-500 mt-1 font-bold animate-pulse">{tr.shop.onlyLeft || `Only ${reward.stock} left!`}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All rewards */}
      <div>
        <h2 className="font-black text-base sm:text-lg text-gray-900 dark:text-white mb-2 sm:mb-3">
          {category === 'all' ? tr.shop.allRewards : categories.find(c => c.id === category)?.label}
          <span className="ml-2 text-xs sm:text-sm font-medium text-gray-500">({regularRewards.length})</span>
        </h2>
        {regularRewards.length === 0 ? (
          <div className="card p-8 sm:p-12 text-center hover:shadow-md transition-shadow">
            <Gift size={36} className="sm:w-12 sm:h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="font-bold text-gray-500">{tr.shop.noRewardsFound}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {regularRewards.map(reward => (
              <div
                key={reward.id}
                className="card flex overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 transform cursor-pointer"
                onClick={() => { playSound('click'); setSelectedReward(reward); }}
              >
                <div className="w-24 sm:w-28 flex-shrink-0 border-r-2 border-black dark:border-gray-700 overflow-hidden hover:scale-110 transition-transform">
                  <img src={reward.image} alt={reward.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 p-3 sm:p-4 flex flex-col">
                  <p className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">{reward.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">{reward.description}</p>
                  <div className="flex items-center justify-between mt-auto pt-2 sm:pt-3">
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <Star size={12} className="text-amber-500" fill="currentColor" />
                      <span className="font-black text-xs sm:text-sm text-amber-600 dark:text-amber-400">{reward.points.toLocaleString()}</span>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); playSound('click'); setSelectedReward(reward); }}
                      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl font-bold text-xs border-2 transition-all active:scale-90 hover:shadow-md ${
                        points >= reward.points
                          ? 'bg-[#7B6EF6] dark:bg-[#4F8EF7] text-white border-black dark:border-gray-600 hover:opacity-90'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-400 border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {points >= reward.points ? tr.shop.redeem : tr.shop.needMore}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RewardsShop;
