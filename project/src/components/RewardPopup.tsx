import React, { useEffect } from 'react';
import { X, Star, Trophy, Zap, Gift } from 'lucide-react';
import { RewardPopupData } from '../context/AppContext';

interface RewardPopupProps {
  data: RewardPopupData;
  onDismiss: () => void;
}

const popupConfig = {
  levelup: { bg: 'from-amber-400 to-orange-500', icon: Zap, emoji: '⚡', title: 'Level Up!' },
  reward: { bg: 'from-green-400 to-emerald-500', icon: Gift, emoji: '🎁', title: 'Reward Unlocked!' },
  achievement: { bg: 'from-blue-400 to-cyan-500', icon: Trophy, emoji: '🏆', title: 'Achievement Earned!' },
  redeem: { bg: 'from-[#7B6EF6] to-[#4F8EF7]', icon: Star, emoji: '✨', title: 'Redeemed!' },
};

const RewardPopup: React.FC<RewardPopupProps> = ({ data, onDismiss }) => {
  const config = popupConfig[data.type];
  const IconComp = config.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: 'rgba(11, 12, 16, 0.8)' }}>
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece absolute w-3 h-3 rounded-sm"
            style={{
              left: `${Math.random() * 100}%`,
              top: '-20px',
              background: ['#4d90ff', '#357ae8', '#22c55e', '#f59e0b', '#ef4444'][i % 5],
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="animate-bounce-in card max-w-sm w-full p-8 text-center relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 p-2 rounded-xl transition-all"
          style={{ backgroundColor: 'var(--tab-bg)', border: '2px solid var(--dark-border)' }}
        >
          <X size={18} />
        </button>

        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 animate-float"
          style={{
            background: `linear-gradient(180deg, ${config.bg} 0%, ${config.bg}dd 100%)`,
            border: '3px solid var(--dark-border)',
            boxShadow: '0px 5px 0px var(--dark-border)',
          }}
        >
          <span className="text-4xl">{config.emoji}</span>
        </div>

        <h2 style={{ color: 'var(--text-dark)' }} className="text-2xl font-black mb-2">{data.title}</h2>
        <p style={{ color: 'var(--text-muted)' }} className="mb-6">{data.subtitle}</p>

        {data.points && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star size={20} style={{ color: '#f59e0b' }} fill="currentColor" />
            <span className="text-2xl font-black" style={{ color: '#f59e0b' }}>+{data.points}</span>
            <span style={{ color: 'var(--text-muted)' }}>points</span>
          </div>
        )}

        <button onClick={onDismiss} className="btn-primary w-full">
          Awesome!
        </button>
      </div>
    </div>
  );
};

export default RewardPopup;
