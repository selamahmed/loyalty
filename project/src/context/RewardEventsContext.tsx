import React, { createContext, useContext, useState } from 'react';

export type RankReward = {
  rank: number;
  label: string;
  rewardName: string;
  rewardImage: string;
  quantity: number;
  pointsRequired: number;
};

export type RewardEvent = {
  id: string;
  title: string;
  description: string;
  banner: string;
  startDate: string;
  endDate: string;
  distributionDate: string;
  active: boolean;
  published: boolean;
  winnerCount: number;
  rewards: RankReward[];
  createdAt: string;
};

export type Winner = {
  rank: number;
  username: string;
  avatar: string;
  points: number;
  reward: RankReward;
};

const RANK_LABELS: Record<number, string> = {
  1: '🥇 1st Place',
  2: '🥈 2nd Place',
  3: '🥉 3rd Place',
};
const getRankLabel = (rank: number) =>
  RANK_LABELS[rank] ?? `🏅 ${rank}${rank === 4 ? 'th' : rank === 5 ? 'th' : 'th'} Place`;

const mockWinners = (event: RewardEvent): Winner[] =>
  event.rewards.map((r, i) => ({
    rank: r.rank,
    username: ['StarPlayer99', 'PixelKing', 'NeonGamer', 'CosmicQueen', 'ThunderBlast'][i] ?? `Player${i + 1}`,
    avatar: `https://i.pravatar.cc/100?img=${i + 1}`,
    points: Math.max(5000 - i * 800, 800),
    reward: r,
  }));

const now = new Date();
const pad = (n: number) => String(n).padStart(2, '0');
const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const future = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return fmt(d);
};

const past = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() - days);
  return fmt(d);
};

const INITIAL_EVENTS: RewardEvent[] = [
  {
    id: '1',
    title: 'Summer Champions Cup',
    description: 'Compete for the top spot this summer and win incredible prizes! Earn the most points before the season ends.',
    banner: '#FF6B35',
    startDate: past(5),
    endDate: future(10),
    distributionDate: future(11),
    active: true,
    published: true,
    winnerCount: 3,
    rewards: [
      { rank: 1, label: getRankLabel(1), rewardName: 'iPhone 17 Pro Max', rewardImage: '📱', quantity: 1, pointsRequired: 5000 },
      { rank: 2, label: getRankLabel(2), rewardName: 'AirPods Pro', rewardImage: '🎧', quantity: 1, pointsRequired: 3000 },
      { rank: 3, label: getRankLabel(3), rewardName: 'Gaming Mouse', rewardImage: '🖱️', quantity: 1, pointsRequired: 1500 },
    ],
    createdAt: past(6),
  },
  {
    id: '2',
    title: 'Winter Warrior Sprint',
    description: 'A fast-paced 7-day sprint for elite players. Top performers earn exclusive seasonal rewards.',
    banner: '#00D1FF',
    startDate: future(15),
    endDate: future(22),
    distributionDate: future(23),
    active: false,
    published: false,
    winnerCount: 5,
    rewards: [
      { rank: 1, label: getRankLabel(1), rewardName: 'PlayStation 5', rewardImage: '🎮', quantity: 1, pointsRequired: 8000 },
      { rank: 2, label: getRankLabel(2), rewardName: 'Nintendo Switch', rewardImage: '🕹️', quantity: 1, pointsRequired: 5000 },
      { rank: 3, label: getRankLabel(3), rewardName: 'Steam Gift Card $50', rewardImage: '💳', quantity: 1, pointsRequired: 3000 },
      { rank: 4, label: getRankLabel(4), rewardName: 'Gaming Headset', rewardImage: '🎧', quantity: 2, pointsRequired: 2000 },
      { rank: 5, label: getRankLabel(5), rewardName: 'LED Strip Lights', rewardImage: '💡', quantity: 3, pointsRequired: 1000 },
    ],
    createdAt: past(1),
  },
];

interface RewardEventsCtx {
  events: RewardEvent[];
  addEvent: (e: RewardEvent) => void;
  updateEvent: (e: RewardEvent) => void;
  deleteEvent: (id: string) => void;
  toggleActive: (id: string) => void;
  togglePublished: (id: string) => void;
  getWinners: (event: RewardEvent) => Winner[];
  isEventEnded: (event: RewardEvent) => boolean;
  getCountdown: (event: RewardEvent) => string;
}

const Ctx = createContext<RewardEventsCtx | null>(null);

export const RewardEventsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<RewardEvent[]>(INITIAL_EVENTS);

  const addEvent = (e: RewardEvent) => setEvents(prev => [e, ...prev]);
  const updateEvent = (e: RewardEvent) => setEvents(prev => prev.map(x => x.id === e.id ? e : x));
  const deleteEvent = (id: string) => setEvents(prev => prev.filter(x => x.id !== id));
  const toggleActive = (id: string) => setEvents(prev => prev.map(x => x.id === id ? { ...x, active: !x.active } : x));
  const togglePublished = (id: string) => setEvents(prev => prev.map(x => x.id === id ? { ...x, published: !x.published } : x));

  const isEventEnded = (event: RewardEvent) => new Date(event.endDate) < new Date();

  const getCountdown = (event: RewardEvent): string => {
    const end = new Date(event.endDate).getTime();
    const diff = end - Date.now();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);
    if (days > 0) return `${days}d ${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const getWinners = (event: RewardEvent) => mockWinners(event);

  return (
    <Ctx.Provider value={{ events, addEvent, updateEvent, deleteEvent, toggleActive, togglePublished, getWinners, isEventEnded, getCountdown }}>
      {children}
    </Ctx.Provider>
  );
};

export const useRewardEvents = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useRewardEvents must be used within RewardEventsProvider');
  return ctx;
};

export { getRankLabel };
