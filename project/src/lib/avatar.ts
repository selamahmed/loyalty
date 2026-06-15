/**
 * Simple DiceBear Open Peeps Avatar System
 * Safe version: makes sure avatars always show.
 */

export interface AvatarOptions {
  seed?: string;
  size?: number;
  skinColor?: string;
  backgroundColor?: string;
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

export const ALLOWED_SKIN_COLORS = ['deceeb', 'e0abb4', 'abe0d7', 'faead9'];

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

export const buildAvatarUrl = (options: AvatarOptions | string): string => {
  const opts: AvatarOptions =
    typeof options === 'string' ? { seed: options } : options;

  const seed = opts.seed?.trim() || 'user';

  const params = new URLSearchParams();

  params.set('seed', seed);
  params.set('size', String(DEFAULT_AVATAR_SIZE));
  params.set('backgroundColor', normalizeColorParam(opts.backgroundColor, STRONG_BG_COLORS[0]));
  params.set('skinColor', normalizeColorParam(opts.skinColor, ALLOWED_SKIN_COLORS[0]));

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
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `avatar-${timestamp}-${random}`;
};

export const isValidSeed = (seed: string | null | undefined): boolean => {
  if (!seed || typeof seed !== 'string') return false;
  return seed.trim().length > 0;
};
