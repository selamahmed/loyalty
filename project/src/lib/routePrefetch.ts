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
