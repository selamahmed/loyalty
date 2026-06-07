export const currentUser = {
  id: '1',
  username: 'StarPlayer99',
  email: 'player@example.com',
  avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=200',
  level: 12,
  xp: 3450,
  xpToNext: 4000,
  totalPoints: 12840,
  currentPoints: 4250,
  rank: 3,
  joinDate: '2024-01-15',
  streak: 7,
  achievements: 18,
  totalAchievements: 30,
};

export const rewards = [
  { id: '1', title: 'Classic Espresso', description: 'Rich, bold espresso shot with crema', points: 150, category: 'coffee', image: 'https://images.pexels.com/photos/1514063/pexels-photo-1514063.jpeg?auto=compress&cs=tinysrgb&w=300', featured: true, limited: false, stock: 200, expiresAt: null },
  { id: '2', title: 'Cappuccino', description: 'Espresso with steamed milk and velvety foam', points: 250, category: 'coffee', image: 'https://images.pexels.com/photos/3240797/pexels-photo-3240797.jpeg?auto=compress&cs=tinysrgb&w=300', featured: true, limited: false, stock: 150, expiresAt: null },
  { id: '3', title: 'Iced Latte', description: 'Chilled espresso with cold milk over ice', points: 300, category: 'coffee', image: 'https://images.pexels.com/photos/3980328/pexels-photo-3980328.jpeg?auto=compress&cs=tinysrgb&w=300', featured: true, limited: true, stock: 40, expiresAt: '2026-06-30' },
  { id: '4', title: 'Croissant', description: 'Buttery, flaky French pastry freshly baked', points: 200, category: 'pastries', image: 'https://images.pexels.com/photos/11723395/pexels-photo-11723395.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: false, stock: 100, expiresAt: null },
  { id: '5', title: 'Avocado Toast', description: 'Smashed avocado on artisan sourdough', points: 450, category: 'food', image: 'https://images.pexels.com/photos/5491303/pexels-photo-5491303.jpeg?auto=compress&cs=tinysrgb&w=300', featured: true, limited: true, stock: 25, expiresAt: '2026-07-15' },
  { id: '6', title: 'Blueberry Muffin', description: 'Moist muffin bursting with fresh blueberries', points: 180, category: 'pastries', image: 'https://images.pexels.com/photos/2067469/pexels-photo-2067469.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: false, stock: 80, expiresAt: null },
  { id: '7', title: 'Matcha Latte', description: 'Premium Japanese matcha with steamed oat milk', points: 350, category: 'coffee', image: 'https://images.pexels.com/photos/3601421/pexels-photo-3601421.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: false, stock: 60, expiresAt: null },
  { id: '8', title: 'Caesar Salad', description: 'Crisp romaine, parmesan, and house-made dressing', points: 400, category: 'food', image: 'https://images.pexels.com/photos/209701/pexels-photo-209701.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: false, stock: 50, expiresAt: null },
  { id: '9', title: 'Cinnamon Roll', description: 'Warm, gooey cinnamon pastry with cream cheese icing', points: 220, category: 'pastries', image: 'https://images.pexels.com/photos/10760730/pexels-photo-10760730.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: true, stock: 30, expiresAt: '2026-06-15' },
  { id: '10', title: 'Cold Brew', description: 'Smooth, slow-steeped cold brew coffee', points: 280, category: 'coffee', image: 'https://images.pexels.com/photos/7872846/pexels-photo-7872846.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: false, stock: 120, expiresAt: null },
  { id: '11', title: 'Grilled Panini', description: 'Toasted sandwich with turkey, cheese, and pesto', points: 500, category: 'food', image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: false, stock: 40, expiresAt: null },
  { id: '12', title: 'Fruit Smoothie', description: 'Blended smoothie with seasonal fresh fruits', points: 320, category: 'drinks', image: 'https://images.pexels.com/photos/1092750/pexels-photo-1092750.jpeg?auto=compress&cs=tinysrgb&w=300', featured: false, limited: false, stock: 70, expiresAt: null },
];

export const achievements = [
  { id: '1', title: 'First Steps', description: 'Complete your first mission', icon: '🎯', category: 'missions', completed: true, progress: 1, total: 1, points: 50, rarity: 'common' },
  { id: '2', title: 'Point Collector', description: 'Earn 1,000 total points', icon: '⭐', category: 'points', completed: true, progress: 1000, total: 1000, points: 100, rarity: 'common' },
  { id: '3', title: 'Week Warrior', description: 'Log in 7 days in a row', icon: '🔥', category: 'streak', completed: true, progress: 7, total: 7, points: 200, rarity: 'rare' },
  { id: '4', title: 'Game Master', description: 'Win 10 mini games', icon: '🎮', category: 'games', completed: true, progress: 10, total: 10, points: 150, rarity: 'rare' },
  { id: '5', title: 'QR Hunter', description: 'Scan 5 QR codes', icon: '📱', category: 'qr', completed: false, progress: 3, total: 5, points: 100, rarity: 'common' },
  { id: '6', title: 'Social Butterfly', description: 'Refer 3 friends', icon: '🦋', category: 'social', completed: false, progress: 1, total: 3, points: 300, rarity: 'epic' },
  { id: '7', title: 'Big Spender', description: 'Redeem 5,000 points total', icon: '💎', category: 'redeem', completed: false, progress: 1200, total: 5000, points: 500, rarity: 'epic' },
  { id: '8', title: 'Legend', description: 'Reach level 20', icon: '👑', category: 'level', completed: false, progress: 12, total: 20, points: 1000, rarity: 'legendary' },
  { id: '9', title: 'Quiz Whiz', description: 'Answer 50 quiz questions correctly', icon: '🧠', category: 'games', completed: true, progress: 50, total: 50, points: 200, rarity: 'rare' },
  { id: '10', title: 'Speed Runner', description: 'Complete a mission in under 1 minute', icon: '⚡', category: 'missions', completed: true, progress: 1, total: 1, points: 75, rarity: 'common' },
  { id: '11', title: 'Shopaholic', description: 'Redeem 10 rewards', icon: '🛍️', category: 'redeem', completed: false, progress: 4, total: 10, points: 250, rarity: 'rare' },
  { id: '12', title: 'Night Owl', description: 'Complete missions after midnight', icon: '🦉', category: 'missions', completed: false, progress: 0, total: 3, points: 100, rarity: 'common' },
];

export const missions = [
  { id: '1', title: 'Visit Today', description: 'Log in and check the app', icon: '📅', points: 20, completed: true, category: 'daily' },
  { id: '2', title: 'Play a Game', description: 'Play any mini game', icon: '🎮', points: 50, completed: true, category: 'daily' },
  { id: '3', title: 'Scan a QR Code', description: 'Scan any QR code in-store', icon: '📱', points: 75, completed: false, category: 'daily' },
  { id: '4', title: 'Browse Rewards', description: 'Visit the rewards shop', icon: '🛍️', points: 15, completed: false, category: 'daily' },
  { id: '5', title: 'Check Achievements', description: 'View your achievements page', icon: '🏆', points: 10, completed: false, category: 'daily' },
  { id: '6', title: 'Share Progress', description: 'Share your level on social media', icon: '📤', points: 30, completed: false, category: 'weekly' },
  { id: '7', title: 'Invite a Friend', description: 'Send an invite to a friend', icon: '👥', points: 100, completed: false, category: 'weekly' },
  { id: '8', title: 'Reach Top 10', description: 'Get into the weekly leaderboard top 10', icon: '📊', points: 200, completed: false, category: 'weekly' },
];

export const notifications = [
  { id: '1', type: 'reward', title: 'Reward Unlocked!', message: 'You can now redeem the Free Coffee reward.', time: '2 min ago', read: false, icon: '🎁' },
  { id: '2', type: 'achievement', title: 'Achievement Earned!', message: 'You earned the "Week Warrior" achievement.', time: '1 hour ago', read: false, icon: '🏆' },
  { id: '3', type: 'points', title: 'Points Added', message: 'You received 75 points for scanning a QR code.', time: '3 hours ago', read: true, icon: '⭐' },
  { id: '4', type: 'event', title: 'Summer Event Live!', message: 'The Summer Splash event has started. Earn 2x points!', time: '1 day ago', read: true, icon: '🎉' },
  { id: '5', type: 'system', title: 'App Update', message: 'New features added: Mini Games v2.0 is live!', time: '2 days ago', read: true, icon: '📢' },
  { id: '6', type: 'points', title: 'Daily Bonus', message: 'You earned 20 points for your daily visit!', time: '3 days ago', read: true, icon: '💰' },
];

export const pointsHistory = [
  { id: '1', type: 'earned', description: 'QR Code Scan - Store #42', points: 75, date: '2026-05-27', category: 'qr' },
  { id: '2', type: 'earned', description: 'Daily Login Bonus', points: 20, date: '2026-05-27', category: 'daily' },
  { id: '3', type: 'redeemed', description: 'Free Coffee Reward', points: -200, date: '2026-05-26', category: 'redeem' },
  { id: '4', type: 'earned', description: 'Quiz Game Win', points: 100, date: '2026-05-26', category: 'game' },
  { id: '5', type: 'earned', description: 'Achievement: Week Warrior', points: 200, date: '2026-05-25', category: 'achievement' },
  { id: '6', type: 'redeemed', description: '10% Discount Coupon', points: -150, date: '2026-05-24', category: 'redeem' },
  { id: '7', type: 'earned', description: 'Spin Wheel Bonus', points: 50, date: '2026-05-24', category: 'game' },
  { id: '8', type: 'earned', description: 'Friend Referral Bonus', points: 100, date: '2026-05-23', category: 'referral' },
  { id: '9', type: 'earned', description: 'QR Code Scan - Store #18', points: 75, date: '2026-05-22', category: 'qr' },
  { id: '10', type: 'redeemed', description: 'Pizza Slice Reward', points: -100, date: '2026-05-21', category: 'redeem' },
];

export const leaderboard = [
  { rank: 1, username: 'PixelKing', points: 28500, level: 25, avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '👑' },
  { rank: 2, username: 'NeonGamer', points: 24100, level: 22, avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '🥈' },
  { rank: 3, username: 'StarPlayer99', points: 12840, level: 12, avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '🥉', isCurrentUser: true },
  { rank: 4, username: 'FireBolt', points: 11200, level: 11, avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '' },
  { rank: 5, username: 'LunaRise', points: 9800, level: 10, avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '' },
  { rank: 6, username: 'TurboMax', points: 8400, level: 9, avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '' },
  { rank: 7, username: 'ZenMaster', points: 7200, level: 8, avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '' },
  { rank: 8, username: 'CometRider', points: 6100, level: 8, avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '' },
  { rank: 9, username: 'StormCloud', points: 5400, level: 7, avatar: 'https://images.pexels.com/photos/1ababab/pexels-photo-ababab.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '' },
  { rank: 10, username: 'EchoVault', points: 4900, level: 7, avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=80', badge: '' },
];

export const progressLevels = [
  { level: 1, title: 'Newcomer', xpRequired: 0, reward: 'Welcome Pack', unlocked: true, rewardPoints: 0 },
  { level: 2, title: 'Explorer', xpRequired: 200, reward: '50 Bonus Points', unlocked: true, rewardPoints: 50 },
  { level: 3, title: 'Seeker', xpRequired: 500, reward: '10% Off Coupon', unlocked: true, rewardPoints: 0 },
  { level: 4, title: 'Adventurer', xpRequired: 900, reward: '100 Bonus Points', unlocked: true, rewardPoints: 100 },
  { level: 5, title: 'Warrior', xpRequired: 1400, reward: 'Exclusive Badge', unlocked: true, rewardPoints: 0 },
  { level: 6, title: 'Champion', xpRequired: 2000, reward: '200 Bonus Points', unlocked: true, rewardPoints: 200 },
  { level: 7, title: 'Hero', xpRequired: 2700, reward: 'Free Coffee Coupon', unlocked: true, rewardPoints: 0 },
  { level: 8, title: 'Legend', xpRequired: 3500, reward: '300 Bonus Points', unlocked: true, rewardPoints: 300 },
  { level: 9, title: 'Mythic', xpRequired: 4400, reward: 'Mystery Box', unlocked: false, rewardPoints: 0 },
  { level: 10, title: 'Divine', xpRequired: 5500, reward: '500 Bonus Points', unlocked: false, rewardPoints: 500 },
  { level: 11, title: 'Cosmic', xpRequired: 6800, reward: 'Exclusive Item', unlocked: false, rewardPoints: 0 },
  { level: 12, title: 'Stellar', xpRequired: 8200, reward: '1000 Bonus Points', unlocked: false, rewardPoints: 1000 },
  { level: 15, title: 'Supreme', xpRequired: 12000, reward: 'VIP Status', unlocked: false, rewardPoints: 0 },
  { level: 20, title: 'Immortal', xpRequired: 20000, reward: 'Legendary Pack', unlocked: false, rewardPoints: 0 },
];

export const seasonalEvents = [
  {
    id: '1',
    title: 'Summer Splash',
    description: 'Earn 2x points on all activities during Summer Splash! Complete special missions and unlock exclusive summer rewards.',
    image: 'https://images.pexels.com/photos/1268855/pexels-photo-1268855.jpeg?auto=compress&cs=tinysrgb&w=400',
    startDate: '2026-06-01',
    endDate: '2026-08-31',
    active: true,
    multiplier: '2x',
    progress: 45,
    totalRewards: 5,
    unlockedRewards: 2,
    color: 'from-blue-400 to-cyan-300',
  },
  {
    id: '2',
    title: 'Spring Bloom',
    description: 'Celebrate spring with special floral-themed rewards and bonus missions.',
    image: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg?auto=compress&cs=tinysrgb&w=400',
    startDate: '2026-03-01',
    endDate: '2026-05-31',
    active: false,
    multiplier: '1.5x',
    progress: 100,
    totalRewards: 4,
    unlockedRewards: 4,
    color: 'from-pink-400 to-rose-300',
  },
  {
    id: '3',
    title: 'Winter Wonderland',
    description: 'Cozy up with winter-themed events and earn massive bonus points.',
    image: 'https://images.pexels.com/photos/688660/pexels-photo-688660.jpeg?auto=compress&cs=tinysrgb&w=400',
    startDate: '2026-12-01',
    endDate: '2026-12-31',
    active: false,
    multiplier: '3x',
    progress: 0,
    totalRewards: 8,
    unlockedRewards: 0,
    color: 'from-blue-300 to-slate-300',
  },
];

export const inventory = [
  { id: '1', type: 'coupon', title: 'Free Espresso Shot', description: 'Valid for any espresso drink', expires: '2026-07-01', code: 'ESPRESSO2024', used: false },
  { id: '2', type: 'reward', title: 'Cappuccino Voucher', description: 'One free cappuccino, any size', expires: '2026-06-30', code: 'CAPPUCCINO42', used: false },
  { id: '3', type: 'reward', title: 'Croissant Voucher', description: 'Fresh baked croissant on the house', expires: '2026-06-15', code: 'CROISSANT99', used: false },
  { id: '4', type: 'coupon', title: '15% Off Any Item', description: 'Valid for one café menu item', expires: '2026-06-20', code: 'CAFE15OFF', used: false },
  { id: '5', type: 'reward', title: 'Iced Latte Voucher', description: 'Free iced latte, medium size', expires: '2026-05-31', code: 'ICEDLATTE77', used: true },
];

export const adminUsers = [
  { id: '1', username: 'StarPlayer99', email: 'player@example.com', level: 12, points: 4250, status: 'active', joinDate: '2024-01-15', avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=60' },
  { id: '2', username: 'PixelKing', email: 'pixel@example.com', level: 25, points: 28500, status: 'active', joinDate: '2023-06-10', avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=60' },
  { id: '3', username: 'NeonGamer', email: 'neon@example.com', level: 22, points: 24100, status: 'active', joinDate: '2023-09-22', avatar: 'https://images.pexels.com/photos/1040881/pexels-photo-1040881.jpeg?auto=compress&cs=tinysrgb&w=60' },
  { id: '4', username: 'FireBolt', email: 'fire@example.com', level: 11, points: 11200, status: 'suspended', joinDate: '2024-02-28', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=60' },
  { id: '5', username: 'LunaRise', email: 'luna@example.com', level: 10, points: 9800, status: 'active', joinDate: '2024-03-15', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=60' },
];

export const statsData = {
  pointsOverTime: [
    { month: 'Jan', points: 1200 },
    { month: 'Feb', points: 1800 },
    { month: 'Mar', points: 2400 },
    { month: 'Apr', points: 2100 },
    { month: 'May', points: 3450 },
    { month: 'Jun', points: 4250 },
  ],
  activityBreakdown: [
    { name: 'QR Scans', value: 35, color: '#7B6EF6' },
    { name: 'Games', value: 25, color: '#4F8EF7' },
    { name: 'Daily Login', value: 20, color: '#22c55e' },
    { name: 'Missions', value: 15, color: '#f59e0b' },
    { name: 'Other', value: 5, color: '#ef4444' },
  ],
  rewardUsage: [
    { month: 'Jan', redeemed: 2 },
    { month: 'Feb', redeemed: 3 },
    { month: 'Mar', redeemed: 5 },
    { month: 'Apr', redeemed: 4 },
    { month: 'May', redeemed: 7 },
    { month: 'Jun', redeemed: 6 },
  ],
};
