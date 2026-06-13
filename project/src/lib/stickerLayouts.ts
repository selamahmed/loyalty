/** Static Neo-Brutalism sticker placements — large ambient backgrounds + shape accents. */

export type StickerSlotConfig = {
  id: string;
  seed: string;
  /** Large colorful sticker (background / hero margins) */
  colorful?: boolean;
  /** Shape figure sub-pool (within neobrutalism shapes) */
  figure?: boolean;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  sizeDesktop: number;
  sizeTablet?: number;
  sizeMobile?: number;
  rotate?: number;
  /** Decorative opacity — keep between 0.05–0.15 for page backdrops */
  opacity?: number;
  /** Soft blur in px (applied via CSS filter) */
  blur?: number;
  /** Large centered depth sticker — lazy-loaded */
  centerpiece?: boolean;
  defer?: boolean;
  hideTablet?: boolean;
  hideMobile?: boolean;
};

export type StickerPresetKey =
  | 'landing-hero'
  | 'landing-features'
  | 'landing-banners'
  | 'landing-cta'
  | 'landing-divider'
  | 'home'
  | 'profile'
  | 'shop'
  | 'inventory'
  | 'games'
  | 'activities'
  | 'progress'
  | 'qr'
  | 'leaderboard'
  | 'events'
  | 'stats'
  | 'notifications'
  | 'history'
  | 'settings'
  | 'support'
  | 'redeem'
  | 'auth';

type AmbientSeeds = {
  tl: string;
  tr: string;
  bl: string;
  br: string;
  center: string;
  midL?: string;
  midR?: string;
};

/** Standard premium page ambiance: 4 oversized corner anchors + centerpiece + optional mid accents. */
function ambientPage(
  prefix: string,
  seeds: AmbientSeeds,
  opts: { centerColorful?: boolean; centerFigure?: boolean } = {},
): StickerSlotConfig[] {
  const centerColorful = opts.centerColorful ?? false;
  const centerFigure = opts.centerFigure ?? !centerColorful;

  const corners: StickerSlotConfig[] = [
    { id: `${prefix}-tl`, seed: seeds.tl, colorful: true, top: '-7%', left: '-16%', sizeDesktop: 260, sizeTablet: 200, sizeMobile: 140, rotate: -14, opacity: 0.11, blur: 0.5 },
    { id: `${prefix}-tr`, seed: seeds.tr, colorful: true, top: '-5%', right: '-18%', sizeDesktop: 240, sizeTablet: 185, sizeMobile: 130, rotate: 11, opacity: 0.1, blur: 0.5, hideMobile: false },
    { id: `${prefix}-bl`, seed: seeds.bl, colorful: true, bottom: '-9%', left: '-14%', sizeDesktop: 220, sizeTablet: 170, sizeMobile: 120, rotate: 8, opacity: 0.09, blur: 0.5, hideTablet: false },
    { id: `${prefix}-br`, seed: seeds.br, colorful: true, bottom: '-7%', right: '-16%', sizeDesktop: 250, sizeTablet: 190, sizeMobile: 135, rotate: -9, opacity: 0.12, blur: 0.5 },
  ];

  const mid: StickerSlotConfig[] = [];
  if (seeds.midL) {
    mid.push({
      id: `${prefix}-ml`, seed: seeds.midL, figure: true, top: '38%', left: '-10%', sizeDesktop: 160, sizeTablet: 120, sizeMobile: 88, rotate: -18, opacity: 0.08, blur: 1, defer: true, hideMobile: true,
    });
  }
  if (seeds.midR) {
    mid.push({
      id: `${prefix}-mr`, seed: seeds.midR, colorful: true, top: '52%', right: '-8%', sizeDesktop: 150, sizeTablet: 115, sizeMobile: 82, rotate: 16, opacity: 0.07, blur: 1, defer: true, hideMobile: true,
    });
  }

  const center: StickerSlotConfig = {
    id: `${prefix}-center`,
    seed: seeds.center,
    colorful: centerColorful,
    figure: centerFigure,
    centerpiece: true,
    sizeDesktop: 500,
    sizeTablet: 380,
    sizeMobile: 260,
    rotate: -6,
    opacity: 0.06,
    blur: 1.5,
    defer: true,
  };

  return [...corners, ...mid, center];
}

export const STICKER_PRESETS: Record<StickerPresetKey, StickerSlotConfig[]> = {
  'landing-hero': [
    { id: 'lh-1', seed: 'landing-corner-tl', colorful: true, top: '4%', left: '2%', sizeDesktop: 120, sizeTablet: 88, sizeMobile: 64, rotate: -12, opacity: 0.9 },
    { id: 'lh-2', seed: 'landing-corner-tr', colorful: true, top: '6%', right: '3%', sizeDesktop: 96, sizeTablet: 72, hideMobile: true, rotate: 8, opacity: 0.88 },
    { id: 'lh-3', seed: 'landing-corner-bl', colorful: true, bottom: '8%', left: '4%', sizeDesktop: 88, sizeTablet: 68, hideMobile: true, rotate: 6, opacity: 0.85 },
    { id: 'lh-4', seed: 'landing-corner-br', colorful: true, bottom: '10%', right: '2%', sizeDesktop: 110, sizeTablet: 80, sizeMobile: 56, rotate: -6, opacity: 0.9 },
  ],
  'landing-features': [
    { id: 'lf-1', seed: 'landing-feat-left', colorful: true, top: '12%', left: '1%', sizeDesktop: 72, sizeTablet: 56, hideMobile: true, rotate: -10, opacity: 0.82 },
    { id: 'lf-2', seed: 'landing-feat-right', colorful: true, top: '18%', right: '1%', sizeDesktop: 68, sizeTablet: 52, hideMobile: true, rotate: 14, opacity: 0.8 },
  ],
  'landing-cta': [
    { id: 'lc-1', seed: 'landing-cta-l', colorful: true, top: '-8%', left: '-5%', sizeDesktop: 88, sizeTablet: 64, sizeMobile: 52, rotate: -14, opacity: 0.92 },
    { id: 'lc-2', seed: 'landing-cta-r', colorful: true, bottom: '-10%', right: '-4%', sizeDesktop: 80, sizeTablet: 58, sizeMobile: 48, rotate: 10, opacity: 0.9 },
    { id: 'lc-3', seed: 'landing-cta-tl', colorful: true, top: '4%', right: '2%', sizeDesktop: 56, sizeTablet: 44, hideMobile: true, rotate: 8, opacity: 0.85 },
  ],
  'landing-banners': [
    { id: 'lb-1', seed: 'landing-banner-l', colorful: true, top: '8%', left: '-3%', sizeDesktop: 64, sizeTablet: 48, hideMobile: true, rotate: -10, opacity: 0.88 },
    { id: 'lb-2', seed: 'landing-banner-r', colorful: true, bottom: '6%', right: '-2%', sizeDesktop: 60, sizeTablet: 46, hideMobile: true, rotate: 12, opacity: 0.86 },
  ],
  'landing-divider': [
    { id: 'ld-1', seed: 'landing-div-a', sizeDesktop: 48, sizeTablet: 40, sizeMobile: 36, rotate: -8, opacity: 0.9 },
    { id: 'ld-2', seed: 'landing-div-b', figure: true, sizeDesktop: 44, sizeTablet: 36, sizeMobile: 32, rotate: 12, opacity: 0.88 },
    { id: 'ld-3', seed: 'landing-div-c', sizeDesktop: 40, sizeTablet: 34, hideMobile: true, rotate: -6, opacity: 0.86 },
  ],

  home: ambientPage('home', {
    tl: 'home-ambient-tl', tr: 'home-ambient-tr', bl: 'home-ambient-bl', br: 'home-ambient-br',
    center: 'home-ambient-center', midL: 'home-ambient-mid-l', midR: 'home-ambient-mid-r',
  }, { centerFigure: true }),

  profile: ambientPage('prof', {
    tl: 'prof-ambient-tl', tr: 'prof-ambient-tr', bl: 'prof-ambient-bl', br: 'prof-ambient-br',
    center: 'prof-ambient-center', midL: 'prof-ambient-mid-l', midR: 'prof-ambient-mid-r',
  }, { centerColorful: true }),

  shop: ambientPage('shop', {
    tl: 'shop-ambient-tl', tr: 'shop-ambient-tr', bl: 'shop-ambient-bl', br: 'shop-ambient-br',
    center: 'shop-ambient-center', midL: 'shop-ambient-mid-l', midR: 'shop-ambient-mid-r',
  }, { centerFigure: true }),

  inventory: ambientPage('inv', {
    tl: 'inv-ambient-tl', tr: 'inv-ambient-tr', bl: 'inv-ambient-bl', br: 'inv-ambient-br',
    center: 'inv-ambient-center', midL: 'inv-ambient-mid-l', midR: 'inv-ambient-mid-r',
  }, { centerColorful: true }),

  games: ambientPage('games', {
    tl: 'games-ambient-tl', tr: 'games-ambient-tr', bl: 'games-ambient-bl', br: 'games-ambient-br',
    center: 'games-ambient-center', midL: 'games-ambient-mid-l', midR: 'games-ambient-mid-r',
  }, { centerFigure: true }),

  activities: ambientPage('act', {
    tl: 'act-ambient-tl', tr: 'act-ambient-tr', bl: 'act-ambient-bl', br: 'act-ambient-br',
    center: 'act-ambient-center', midL: 'act-ambient-mid-l', midR: 'act-ambient-mid-r',
  }, { centerColorful: true }),

  progress: ambientPage('prog', {
    tl: 'prog-ambient-tl', tr: 'prog-ambient-tr', bl: 'prog-ambient-bl', br: 'prog-ambient-br',
    center: 'prog-ambient-center', midL: 'prog-ambient-mid-l', midR: 'prog-ambient-mid-r',
  }, { centerFigure: true }),

  qr: ambientPage('qr', {
    tl: 'qr-ambient-tl', tr: 'qr-ambient-tr', bl: 'qr-ambient-bl', br: 'qr-ambient-br',
    center: 'qr-ambient-center', midL: 'qr-ambient-mid-l', midR: 'qr-ambient-mid-r',
  }, { centerColorful: true }),

  leaderboard: ambientPage('lb', {
    tl: 'lb-ambient-tl', tr: 'lb-ambient-tr', bl: 'lb-ambient-bl', br: 'lb-ambient-br',
    center: 'lb-ambient-center', midL: 'lb-ambient-mid-l', midR: 'lb-ambient-mid-r',
  }, { centerFigure: true }),

  events: ambientPage('ev', {
    tl: 'ev-ambient-tl', tr: 'ev-ambient-tr', bl: 'ev-ambient-bl', br: 'ev-ambient-br',
    center: 'ev-ambient-center', midL: 'ev-ambient-mid-l', midR: 'ev-ambient-mid-r',
  }, { centerColorful: true }),

  stats: ambientPage('stats', {
    tl: 'stats-ambient-tl', tr: 'stats-ambient-tr', bl: 'stats-ambient-bl', br: 'stats-ambient-br',
    center: 'stats-ambient-center', midL: 'stats-ambient-mid-l', midR: 'stats-ambient-mid-r',
  }, { centerFigure: true }),

  notifications: ambientPage('notif', {
    tl: 'notif-ambient-tl', tr: 'notif-ambient-tr', bl: 'notif-ambient-bl', br: 'notif-ambient-br',
    center: 'notif-ambient-center', midL: 'notif-ambient-mid-l', midR: 'notif-ambient-mid-r',
  }, { centerColorful: true }),

  history: ambientPage('hist', {
    tl: 'hist-ambient-tl', tr: 'hist-ambient-tr', bl: 'hist-ambient-bl', br: 'hist-ambient-br',
    center: 'hist-ambient-center', midL: 'hist-ambient-mid-l', midR: 'hist-ambient-mid-r',
  }, { centerFigure: true }),

  settings: ambientPage('set', {
    tl: 'set-ambient-tl', tr: 'set-ambient-tr', bl: 'set-ambient-bl', br: 'set-ambient-br',
    center: 'set-ambient-center', midL: 'set-ambient-mid-l', midR: 'set-ambient-mid-r',
  }, { centerFigure: true }),

  support: ambientPage('sup', {
    tl: 'sup-ambient-tl', tr: 'sup-ambient-tr', bl: 'sup-ambient-bl', br: 'sup-ambient-br',
    center: 'sup-ambient-center', midL: 'sup-ambient-mid-l', midR: 'sup-ambient-mid-r',
  }, { centerColorful: true }),

  redeem: ambientPage('redeem', {
    tl: 'redeem-ambient-tl', tr: 'redeem-ambient-tr', bl: 'redeem-ambient-bl', br: 'redeem-ambient-br',
    center: 'redeem-ambient-center', midL: 'redeem-ambient-mid-l', midR: 'redeem-ambient-mid-r',
  }, { centerFigure: true }),

  auth: [
    { id: 'au-1', seed: 'auth-tl', colorful: true, top: '-6%', left: '-12%', sizeDesktop: 220, sizeTablet: 170, hideMobile: true, rotate: -12, opacity: 0.12, blur: 0.5 },
    { id: 'au-2', seed: 'auth-br', colorful: true, bottom: '-8%', right: '-14%', sizeDesktop: 200, sizeTablet: 155, sizeMobile: 130, rotate: 8, opacity: 0.1, blur: 0.5 },
    { id: 'au-3', seed: 'auth-tr', figure: true, top: '-4%', right: '-10%', sizeDesktop: 160, sizeTablet: 120, hideMobile: true, rotate: 6, opacity: 0.08, blur: 1 },
    { id: 'au-c', seed: 'auth-center', figure: true, centerpiece: true, sizeDesktop: 420, sizeTablet: 320, sizeMobile: 220, rotate: -8, opacity: 0.06, blur: 1.5, defer: true },
  ],
};

/** Map customer app routes to a sticker preset. */
export function stickerPresetForPath(pathname: string): StickerPresetKey {
  if (pathname === '/home' || pathname === '/app') return 'home';
  if (pathname === '/profile' || pathname.startsWith('/settings/edit-profile')) return 'profile';
  if (pathname === '/shop') return 'shop';
  if (pathname === '/inventory') return 'inventory';
  if (pathname === '/games') return 'games';
  if (pathname === '/missions' || pathname === '/achievements') return 'activities';
  if (pathname === '/progress') return 'progress';
  if (pathname === '/qr') return 'qr';
  if (pathname === '/leaderboard') return 'leaderboard';
  if (pathname === '/events') return 'events';
  if (pathname === '/stats') return 'stats';
  if (pathname === '/notifications') return 'notifications';
  if (pathname === '/history') return 'history';
  if (pathname.startsWith('/support')) return 'support';
  if (pathname.startsWith('/settings') || pathname.startsWith('/settings/')) return 'settings';
  if (pathname.includes('redeem')) return 'redeem';
  return 'home';
}
