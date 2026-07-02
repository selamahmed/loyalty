/** Prefetch lazy route chunks on hover/focus — no-op if already loaded. */
const ROUTE_LOADERS: Record<string, () => Promise<unknown>> = {
  '/home': () => import('../pages/Home'),
  '/app': () => import('../pages/Home'),
  '/shop': () => import('../pages/RewardsShop'),
  '/profile': () => import('../pages/Profile'),
  '/qr': () => import('../pages/QRScanner'),
  '/games': () => import('../pages/MiniGames'),
  '/missions': () => import('../pages/Missions'),
  '/progress': () => import('../pages/ProgressPath'),
  '/achievements': () => import('../pages/Achievements'),
  '/inventory': () => import('../pages/Inventory'),
  '/notifications': () => import('../pages/Notifications'),
  '/history': () => import('../pages/History'),
  '/settings': () => import('../pages/Settings'),
  '/support': () => import('../pages/Support'),
  '/leaderboard': () => import('../pages/Leaderboard'),
  '/stats': () => import('../pages/UserStats'),
  '/events': () => import('../pages/SeasonalEvents'),
  '/admin': () => import('../pages/admin/AdminDashboard'),
  '/admin/dashboard-v2': () => import('../pages/admin/AdminDashboard2'),
  '/admin/analytics': () => import('../pages/admin/AdminAnalytics'),
  '/admin/users': () => import('../pages/admin/AdminUsers'),
  '/admin/rewards': () => import('../pages/admin/AdminRewards'),
  '/admin/reward-events': () => import('../pages/admin/AdminRewardEvents'),
  '/admin/events': () => import('../pages/admin/AdminEvents'),
  '/admin/notifications': () => import('../pages/admin/AdminNotifications'),
  '/admin/inventory': () => import('../pages/admin/AdminInventory'),
  '/admin/checkout': () => import('../pages/admin/AdminCheckout'),
  '/admin/qr': () => import('../pages/admin/AdminQR'),
  '/admin/games': () => import('../pages/admin/AdminGames'),
  '/admin/missions': () => import('../pages/admin/AdminMissions'),
  '/admin/daily-rewards': () => import('../pages/admin/AdminDailyRewards'),
  '/admin/points-economy': () => import('../pages/admin/AdminPointsEconomy'),
  '/admin/audit-logs': () => import('../pages/admin/AdminAuditLogs'),
  '/admin/support': () => import('../pages/admin/AdminSupport'),
  '/admin/settings': () => import('../pages/admin/AdminSettings'),
};

const prefetched = new Set<string>();

export function prefetchRoute(path: string): void {
  const loader = ROUTE_LOADERS[path];
  if (!loader || prefetched.has(path)) return;
  prefetched.add(path);
  void loader();
}

/** Warm common customer routes after first paint — idle-only, no network. */
export function prefetchCommonRoutes(): void {
  ['/home', '/shop', '/profile', '/qr', '/missions'].forEach(prefetchRoute);
}

/** Warm admin route chunks after the admin shell is already visible. */
export function prefetchAdminRoutes(): void {
  [
    '/admin',
    '/admin/users',
    '/admin/rewards',
    '/admin/qr',
    '/admin/inventory',
    '/admin/analytics',
    '/admin/reward-events',
    '/admin/games',
    '/admin/daily-rewards',
    '/admin/settings',
  ].forEach(prefetchRoute);

  window.setTimeout(() => {
    [
      '/admin/dashboard-v2',
      '/admin/events',
      '/admin/notifications',
      '/admin/checkout',
      '/admin/missions',
      '/admin/points-economy',
      '/admin/audit-logs',
      '/admin/support',
    ].forEach(prefetchRoute);
  }, 1800);
}
