/** Unique colorful Group sticker per page (from assets/stickers/colorful/). */

export const PAGE_GROUPS = {

  achievements: 'Group 41.svg',

  missions: 'Group 42.svg',

  leaderboard: 'Group 43.svg',

  shop: 'Group 44.svg',

  qr: 'Group 45.svg',

  games: 'Group 46.svg',

  inventory: 'Group 47.svg',

  stats: 'Group 48.svg',

  history: 'Group 49.svg',

  events: 'Group 50.svg',

  notifications: 'Group 51.svg',

  support: 'Group 53.svg',

  settings: 'Group 54.svg',

  redeem: 'Group 55.svg',

  profile: 'Group 56.svg',

  login: 'Group 59.svg',

  register: 'Group 60.svg',

  progress: 'Group 61.svg',

  home: 'Group 62.svg',

} as const;



export type PageStickerKey = keyof typeof PAGE_GROUPS;



export function pageGroup(page: PageStickerKey): string {

  return PAGE_GROUPS[page];

}



/** Landing page colorful assignments */

export const LANDING_BANNER_STICKERS = [

  'Group 63.svg',

  'Group 64.svg',

  'Group 65.svg',

  'Group 66.svg',

] as const;



export const LANDING_LIFESTYLE_STICKERS = [

  'Group 67.svg',

  'Group 68.svg',

  'Group 70.svg',

  'Group 71.svg',

] as const;



export const LANDING_HERO_CENTER = 'Group 72.svg';



export const LANDING_HERO_SATELLITES = [

  'Group 73.svg',

  'Group 74.svg',

  'Group 75.svg',

  'Group 76.svg',

] as const;



export const LANDING_CTA_STICKERS = {

  large: ['Group 77.svg', 'Group 78.svg'] as const,

  accent: ['Group 79.svg', 'Group 80.svg'] as const,

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


