/** Colorful sticker per page (assets/stickers/colorful/). */

export const PAGE_GROUPS = {
  achievements: 'lol.svg',
  missions: 'Group 42.svg',
  leaderboard: 'goodidea.svg',
  shop: 'loveit.svg',
  qr: 'qrcode.svg',
  games: 'finisheddone.svg',
  inventory: 'TICKETS.svg',
  stats: 'awesome.svg',
  history: 'Group 49.svg',
  events: 'hotflame.svg',
  notifications: 'done.svg',
  support: 'feedback.svg',
  settings: 'workbusy.svg',
  redeem: 'chill.svg',
  profile: 'almostdone.svg',
  login: 'SATISFYSTAR.svg',
  register: 'PEACSIGN.svg',
  progress: 'HMMM.svg',
  home: 'Group 62.svg',
} as const;

export type PageStickerKey = keyof typeof PAGE_GROUPS;

export function pageGroup(page: PageStickerKey): string {
  return PAGE_GROUPS[page];
}

/** Mini-game outcome stickers */
export const GAME_WIN_STICKER = 'yeeeaaahh.svg';
export const GAME_LOSE_STICKER = 'dead.svg';

/** Landing page colorful assignments */
export const LANDING_BANNER_STICKERS = [
  'OK.svg',
  'loveit.svg',
  'fresh.svg',
  'offmissle.svg',
] as const;

export const LANDING_LIFESTYLE_STICKERS = [
  'hateit with heart.svg',
  'wowwithheart.svg',
  'onefingerrise.svg',
  'partytime.svg',
] as const;

export const LANDING_HERO_CENTER = 'omg.svg';

export const LANDING_HERO_SATELLITES = [
  'hotskull.svg',
  'sleeping.svg',
  'wow.svg',
  'yeeeaaahh.svg',
] as const;

export const LANDING_CTA_STICKERS = {
  large: ['highalert.svg', 'dislike.svg'] as const,
  accent: ['greatidea.svg', 'superstar.svg'] as const,
};

/** Small neobrutalism shape accents on landing hero headline lines */
export const LANDING_HERO_HEADLINE_SHAPES = [
  'landing-hero-line-shop',
  'landing-hero-line-mid',
  'landing-hero-line-points',
] as const;

/** Shape sticker seeds for progress tier mascots */
export const TIER_FIGURE_SEEDS: Record<string, string> = {
  BAŞLANGIÇ: 'tier-shape-start',
  SAVAŞÇI: 'tier-shape-warrior',
  KAHRAMAN: 'tier-shape-hero',
  EFSANE: 'tier-shape-legend',
  ÖLÜMSÜZ: 'tier-shape-immortal',
};
