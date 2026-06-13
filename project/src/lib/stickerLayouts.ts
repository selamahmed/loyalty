/** Static Neo-Brutalism sticker placements — colorful for backgrounds, shapes for accents. */

export type StickerSlotConfig = {
  id: string;
  seed: string;
  /** Large colorful Group sticker (background / hero margins) */
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
  opacity?: number;
  hideTablet?: boolean;
  hideMobile?: boolean;
};

export type StickerPresetKey =
  | 'landing-hero'
  | 'landing-features'
  | 'landing-banners'
  | 'landing-cta'
  | 'landing-divider'
  | 'dashboard'
  | 'profile'
  | 'shop'
  | 'games'
  | 'activities'
  | 'progress'
  | 'qr'
  | 'analytics'
  | 'settings'
  | 'auth';

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
  dashboard: [
    { id: 'db-1', seed: 'dash-tl', colorful: true, top: '72px', left: '8px', sizeDesktop: 72, sizeTablet: 56, hideMobile: true, rotate: -10, opacity: 0.82 },
    { id: 'db-2', seed: 'dash-tr', colorful: true, top: '88px', right: '12px', sizeDesktop: 64, sizeTablet: 48, sizeMobile: 48, rotate: 8, opacity: 0.8 },
    { id: 'db-3', seed: 'dash-bl', colorful: true, bottom: '100px', left: '6px', sizeDesktop: 56, sizeTablet: 44, hideMobile: true, rotate: 6, opacity: 0.78 },
    { id: 'db-4', seed: 'dash-br', colorful: true, bottom: '108px', right: '10px', sizeDesktop: 60, sizeTablet: 46, hideMobile: true, rotate: -8, opacity: 0.8 },
  ],
  profile: [
    { id: 'pr-1', seed: 'prof-tl', colorful: true, top: '64px', left: '4px', sizeDesktop: 80, sizeTablet: 60, hideMobile: true, rotate: -12, opacity: 0.85 },
    { id: 'pr-2', seed: 'prof-tr', colorful: true, top: '80px', right: '8px', sizeDesktop: 68, sizeTablet: 52, sizeMobile: 44, rotate: 10, opacity: 0.82 },
    { id: 'pr-3', seed: 'prof-br', colorful: true, bottom: '120px', right: '6px', sizeDesktop: 56, sizeTablet: 44, hideMobile: true, rotate: -6, opacity: 0.8 },
  ],
  shop: [
    { id: 'sh-1', seed: 'shop-tl', colorful: true, top: '72px', left: '6px', sizeDesktop: 68, sizeTablet: 52, hideMobile: true, rotate: -8, opacity: 0.82 },
    { id: 'sh-2', seed: 'shop-tr', colorful: true, top: '90px', right: '10px', sizeDesktop: 60, sizeTablet: 48, sizeMobile: 44, rotate: 12, opacity: 0.8 },
    { id: 'sh-3', seed: 'shop-bl', colorful: true, bottom: '96px', left: '8px', sizeDesktop: 52, sizeTablet: 40, hideMobile: true, rotate: 6, opacity: 0.78 },
  ],
  games: [
    { id: 'gm-1', seed: 'games-tl', colorful: true, top: '70px', left: '4px', sizeDesktop: 76, sizeTablet: 58, hideMobile: true, rotate: -10, opacity: 0.85 },
    { id: 'gm-2', seed: 'games-br', colorful: true, bottom: '104px', right: '8px', sizeDesktop: 64, sizeTablet: 50, sizeMobile: 46, rotate: 8, opacity: 0.82 },
    { id: 'gm-3', seed: 'games-tr', colorful: true, top: '100px', right: '6px', sizeDesktop: 52, sizeTablet: 40, hideMobile: true, rotate: -6, opacity: 0.8 },
  ],
  activities: [
    { id: 'ac-1', seed: 'act-tl', colorful: true, top: '68px', left: '6px', sizeDesktop: 70, sizeTablet: 54, hideMobile: true, rotate: -12, opacity: 0.82 },
    { id: 'ac-2', seed: 'act-br', colorful: true, bottom: '100px', right: '10px', sizeDesktop: 62, sizeTablet: 48, sizeMobile: 42, rotate: 10, opacity: 0.8 },
    { id: 'ac-3', seed: 'act-tr', colorful: true, top: '92px', right: '8px', sizeDesktop: 48, sizeTablet: 38, hideMobile: true, rotate: 6, opacity: 0.78 },
  ],
  progress: [
    { id: 'pg-1', seed: 'prog-tl', colorful: true, top: '74px', left: '4px', sizeDesktop: 74, sizeTablet: 56, hideMobile: true, rotate: -8, opacity: 0.84 },
    { id: 'pg-2', seed: 'prog-br', colorful: true, bottom: '110px', right: '6px', sizeDesktop: 66, sizeTablet: 50, sizeMobile: 44, rotate: 12, opacity: 0.82 },
  ],
  qr: [
    { id: 'qr-1', seed: 'qr-tl', colorful: true, top: '70px', left: '8px', sizeDesktop: 64, sizeTablet: 50, hideMobile: true, rotate: -10, opacity: 0.82 },
    { id: 'qr-2', seed: 'qr-br', colorful: true, bottom: '96px', right: '10px', sizeDesktop: 58, sizeTablet: 44, sizeMobile: 40, rotate: 8, opacity: 0.8 },
  ],
  analytics: [
    { id: 'an-1', seed: 'anal-tl', colorful: true, top: '72px', left: '6px', sizeDesktop: 68, sizeTablet: 52, hideMobile: true, rotate: -6, opacity: 0.82 },
    { id: 'an-2', seed: 'anal-tr', colorful: true, top: '88px', right: '8px', sizeDesktop: 60, sizeTablet: 46, sizeMobile: 42, rotate: 10, opacity: 0.8 },
    { id: 'an-3', seed: 'anal-bl', colorful: true, bottom: '100px', left: '10px', sizeDesktop: 52, sizeTablet: 40, hideMobile: true, rotate: -8, opacity: 0.78 },
  ],
  settings: [
    { id: 'st-1', seed: 'set-tr', colorful: true, top: '76px', right: '8px', sizeDesktop: 60, sizeTablet: 48, sizeMobile: 40, rotate: 8, opacity: 0.8 },
    { id: 'st-2', seed: 'set-bl', colorful: true, bottom: '104px', left: '6px', sizeDesktop: 56, sizeTablet: 42, hideMobile: true, rotate: -10, opacity: 0.78 },
  ],
  auth: [
    { id: 'au-1', seed: 'auth-tl', colorful: true, top: '5%', left: '4%', sizeDesktop: 88, sizeTablet: 68, hideMobile: true, rotate: -12, opacity: 0.85 },
    { id: 'au-2', seed: 'auth-br', colorful: true, bottom: '6%', right: '5%', sizeDesktop: 76, sizeTablet: 58, sizeMobile: 52, rotate: 8, opacity: 0.82 },
    { id: 'au-3', seed: 'auth-tr', colorful: true, top: '8%', right: '6%', sizeDesktop: 56, sizeTablet: 44, hideMobile: true, rotate: 6, opacity: 0.8 },
  ],
};

/** Map customer app routes to a sticker preset. */
export function stickerPresetForPath(pathname: string): StickerPresetKey {
  if (pathname === '/profile' || pathname.startsWith('/settings/edit-profile')) return 'profile';
  if (pathname === '/shop' || pathname === '/inventory') return 'shop';
  if (pathname === '/games') return 'games';
  if (pathname === '/missions' || pathname === '/achievements') return 'activities';
  if (pathname === '/progress') return 'progress';
  if (pathname === '/qr') return 'qr';
  if (pathname === '/leaderboard' || pathname === '/stats') return 'analytics';
  if (pathname.startsWith('/settings') || pathname.startsWith('/support')) return 'settings';
  if (pathname === '/history' || pathname === '/events' || pathname === '/notifications' || pathname === '/redeem') return 'dashboard';
  return 'dashboard';
}
