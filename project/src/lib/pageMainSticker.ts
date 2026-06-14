import { pageGroup, type PageStickerKey } from './pageStickers';

/** NexReward brand sticker system — one curated illustration per primary page. */

export type MainStickerPageKey =
  | 'home'
  | 'dashboard'
  | 'leaderboard'
  | 'events'
  | 'shop'
  | 'profile'
  | 'settings';

export type StickerVariant = 'hero-inline' | 'hero-card';

export type PageMainStickerConfig = {
  /** Colorful SVG from the shared BRIX sticker family */
  group: string;
  /** Subtle tilt — kept within ±5° for brand consistency */
  rotate: number;
  /** Page accent for halo glow — matches product palette */
  accent: string;
  sizes: Record<StickerVariant, { desktop: number; mobile: number }>;
};

/** Shared size scale — inline banners vs tall gradient hero cards */
export const BRAND_STICKER_SIZES: Record<StickerVariant, { desktop: number; mobile: number }> = {
  'hero-inline': { desktop: 152, mobile: 104 },
  'hero-card': { desktop: 268, mobile: 164 },
};

/** Primary pages — distinct theme, unified illustration language */
export const PAGE_MAIN_STICKERS: Record<MainStickerPageKey, PageMainStickerConfig> = {
  home: {
    group: 'superstar.svg',
    rotate: -3,
    accent: 'var(--neo-yellow)',
    sizes: BRAND_STICKER_SIZES,
  },
  dashboard: {
    group: 'superstar.svg',
    rotate: -3,
    accent: 'var(--neo-yellow)',
    sizes: BRAND_STICKER_SIZES,
  },
  leaderboard: {
    group: 'SATISFYSTAR.svg',
    rotate: 4,
    accent: 'var(--neo-pink)',
    sizes: BRAND_STICKER_SIZES,
  },
  events: {
    group: 'partytime.svg',
    rotate: -2,
    accent: 'var(--neo-pink)',
    sizes: BRAND_STICKER_SIZES,
  },
  shop: {
    group: 'loveit.svg',
    rotate: 3,
    accent: '#ec4899',
    sizes: BRAND_STICKER_SIZES,
  },
  profile: {
    group: 'almostdone.svg',
    rotate: -4,
    accent: 'var(--neo-yellow)',
    sizes: BRAND_STICKER_SIZES,
  },
  settings: {
    group: 'workbusy.svg',
    rotate: 2,
    accent: 'var(--neo-sky)',
    sizes: BRAND_STICKER_SIZES,
  },
};

const FALLBACK: Omit<PageMainStickerConfig, 'group'> = {
  rotate: 3,
  accent: 'var(--gradient-start)',
  sizes: BRAND_STICKER_SIZES,
};

export function mainStickerConfig(page: PageStickerKey | MainStickerPageKey): PageMainStickerConfig {
  const curated = PAGE_MAIN_STICKERS[page as MainStickerPageKey];
  if (curated) return curated;
  return { group: pageGroup(page as PageStickerKey), ...FALLBACK };
}

export function stickerDimensions(
  page: PageStickerKey | MainStickerPageKey,
  variant: StickerVariant,
): { desktop: number; mobile: number } {
  return mainStickerConfig(page).sizes[variant];
}
