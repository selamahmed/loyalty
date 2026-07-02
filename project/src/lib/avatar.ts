/**
 * Simple DiceBear Open Peeps Avatar System
 * Safe version: makes sure avatars always show.
 */

export interface AvatarOptions {
  seed?: string;
  size?: number;
  skinColor?: string;
  backgroundColor?: string;
  accessories?: AvatarAccessory;
  accessoriesProbability?: number;
  headVariant?: AvatarHeadVariant;
  expressionVariant?: AvatarExpressionVariant;
  facialHairVariant?: AvatarFacialHairVariant;
  facialHairProbability?: number;
  clothingColor?: string;
  scale?: number;
  rotate?: number;
  translateX?: number;
  translateY?: number;
  flip?: AvatarFlip;
}

const DICEBEAR_OPEN_PEEPS_URL = 'https://api.dicebear.com/10.x/open-peeps/svg';
const DEFAULT_AVATAR_SIZE = 512;

const normalizeColorParam = (value: string | undefined, fallback: string): string => {
  const firstColor = value
    ?.split(',')
    .map((color) => color.trim().replace(/^#/, '').toLowerCase())
    .find((color) => /^[0-9a-f]{6}$/.test(color));

  return firstColor || fallback;
};

export const ALLOWED_ACCESSORIES = [
  'blank',
  'glasses',
  'glasses2',
  'glasses3',
  'glasses4',
  'glasses5',
  'sunglasses',
  'sunglasses2',
] as const;

export type AvatarAccessory = (typeof ALLOWED_ACCESSORIES)[number];

export const normalizeAvatarAccessory = (value: string | undefined): AvatarAccessory | undefined => {
  return ALLOWED_ACCESSORIES.find((accessory) => accessory === value);
};

export const ALLOWED_HEAD_VARIANTS = [
  'short1',
  'short2',
  'short3',
  'short4',
  'short5',
  'medium1',
  'medium2',
  'medium3',
  'mediumStraight',
  'long',
  'longCurly',
  'longBangs',
  'afro',
  'bun',
  'buns',
  'flatTop',
  'pomp',
  'hatBeanie',
  'hatHip',
] as const;

export type AvatarHeadVariant = (typeof ALLOWED_HEAD_VARIANTS)[number];

export const normalizeAvatarHeadVariant = (value: string | undefined): AvatarHeadVariant | undefined => {
  return ALLOWED_HEAD_VARIANTS.find((variant) => variant === value);
};

export const ALLOWED_EXPRESSION_VARIANTS = [
  'calm',
  'cheeky',
  'cute',
  'driven',
  'eatingHappy',
  'explaining',
  'lovingGrin1',
  'lovingGrin2',
  'smile',
  'smileBig',
  'smileLOL',
  'smileTeethGap',
] as const;

export type AvatarExpressionVariant = (typeof ALLOWED_EXPRESSION_VARIANTS)[number];

export const normalizeAvatarExpressionVariant = (value: string | undefined): AvatarExpressionVariant | undefined => {
  return ALLOWED_EXPRESSION_VARIANTS.find((variant) => variant === value);
};

export const ALLOWED_FACIAL_HAIR_VARIANTS = [
  'blank',
  'chin',
  'goatee1',
  'goatee2',
  'moustache1',
  'moustache2',
  'moustache3',
] as const;

export type AvatarFacialHairVariant = (typeof ALLOWED_FACIAL_HAIR_VARIANTS)[number];

export const normalizeAvatarFacialHairVariant = (value: string | undefined): AvatarFacialHairVariant | undefined => {
  if (!value || value === 'none') return 'blank';
  return ALLOWED_FACIAL_HAIR_VARIANTS.find((variant) => variant === value);
};

export const ALLOWED_FLIPS = ['none', 'horizontal'] as const;
export type AvatarFlip = (typeof ALLOWED_FLIPS)[number];

export const normalizeAvatarFlip = (value: string | undefined): AvatarFlip | undefined => {
  return ALLOWED_FLIPS.find((variant) => variant === value);
};

const normalizeProbability = (value: number | undefined): number | undefined => {
  if (value === undefined || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const normalizeNumber = (
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
): number => {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.max(min, Math.min(max, value));
};

export const ALLOWED_SKIN_COLORS = ['deceeb', 'e0abb4', 'abe0d7', 'faead9', 'bcb1f2'];

export const STRONG_BG_COLORS = [
  'ff006e',
  '8338ec',
  '3a86ff',
  '06d6a0',
  'ffbe0b',
  'fb5607',
  'ef4444',
  '14b8a6',
];

export const ALLOWED_EXPRESSIONS = [
  'calm',
  'cheeky',
  'cute',
  'smile',
  'smileBig',
];

export const ALLOWED_HAIRSTYLES = [
  'short1',
  'short2',
  'short3',
  'short4',
  'short5',
  'medium1',
  'medium2',
  'medium3',
  'long',
  'longCurly',
  'afro',
  'bun',
  'buns',
];

export const ALLOWED_CLOTHING_COLORS = [
  '111827',
  '2563eb',
  'ec4899',
  '06d6a0',
  'ffbe0b',
  'ef4444',
  '7c3aed',
];

const FRIENDLY_AVATAR_SEEDS = [
  'nesve-happy-ali',
  'nesve-happy-deniz',
  'nesve-happy-lina',
  'nesve-happy-mira',
  'nesve-happy-selin',
  'nesve-happy-tuna',
  'nesve-happy-yasmin',
  'nesve-happy-zara',
  'nesve-soft-ahmed',
  'nesve-soft-star',
  'nesve-soft-smile',
  'nesve-soft-friend',
];

export const buildAvatarUrl = (options: AvatarOptions | string): string => {
  const opts: AvatarOptions =
    typeof options === 'string' ? { seed: options } : options;

  const seed = opts.seed?.trim() || 'user';

  const params = new URLSearchParams();

  params.set('seed', seed);
  params.set('size', String(DEFAULT_AVATAR_SIZE));
  params.set('backgroundColor', normalizeColorParam(opts.backgroundColor, STRONG_BG_COLORS[0]));
  params.set('skinColor', normalizeColorParam(opts.skinColor, ALLOWED_SKIN_COLORS[0]));
  params.set('scale', String(normalizeNumber(opts.scale, 1, 0.6, 1.6)));
  params.set('rotate', String(Math.round(normalizeNumber(opts.rotate, 0, -20, 20))));
  params.set('translateX', String(Math.round(normalizeNumber(opts.translateX, 0, -40, 40))));
  params.set('translateY', String(Math.round(normalizeNumber(opts.translateY, 0, -40, 40))));

  const flip = normalizeAvatarFlip(opts.flip);
  if (flip && flip !== 'none') params.set('flip', flip);

  const headVariant = normalizeAvatarHeadVariant(opts.headVariant);
  if (headVariant) params.set('headVariant', headVariant);

  const expressionVariant = normalizeAvatarExpressionVariant(opts.expressionVariant);
  if (expressionVariant) params.set('expressionVariant', expressionVariant);

  const clothingColor = normalizeColorParam(opts.clothingColor, '');
  if (clothingColor) params.set('clothingColor', clothingColor);

  const accessories = normalizeAvatarAccessory(opts.accessories);
  const accessoriesProbability = normalizeProbability(opts.accessoriesProbability);

  if (accessories && accessories !== 'blank') {
    params.set('accessoriesVariant', accessories);
    params.set('accessoriesProbability', String(accessoriesProbability ?? 100));
  }

  const facialHair = normalizeAvatarFacialHairVariant(opts.facialHairVariant);
  const facialHairProbability = normalizeProbability(opts.facialHairProbability);
  if (facialHair && facialHair !== 'blank') {
    params.set('facialHairVariant', facialHair);
    params.set('facialHairProbability', String(facialHairProbability ?? 100));
  }

  return `${DICEBEAR_OPEN_PEEPS_URL}?${params.toString()}`;
};

export const getDefaultAvatarSeed = (options: {
  name?: string | null;
  email?: string | null;
  id?: string | null;
}): string => {
  if (options.name && options.name.trim()) {
    return options.name.trim();
  }

  if (options.email && options.email.trim()) {
    const emailUsername = options.email.split('@')[0];
    if (emailUsername) return emailUsername;
  }

  if (options.id && options.id.trim()) {
    return options.id.trim();
  }

  return 'user';
};

export const randomAvatarSeed = (): string => {
  return FRIENDLY_AVATAR_SEEDS[Math.floor(Math.random() * FRIENDLY_AVATAR_SEEDS.length)];
};

export const isValidSeed = (seed: string | null | undefined): boolean => {
  if (!seed || typeof seed !== 'string') return false;
  return seed.trim().length > 0;
};
