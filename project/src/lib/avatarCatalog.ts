/** Seed-based avatars using DiceBear API */

export const AVATAR_SEED_PREFIX = 'seed:';

export type AvatarAsset = { id: string; url: string; ref: string };

import { buildAvatarUrl } from './avatar';

/** Resolve stored avatar value to a displayable URL */
export function resolveAvatarSrc(stored?: string | null): string | null {
  if (!stored) return null;
  
  if (stored.startsWith('http://') || stored.startsWith('https://')) {
    return stored;
  }

  let seed = stored;
  if (stored.startsWith(AVATAR_SEED_PREFIX)) {
    seed = stored.slice(AVATAR_SEED_PREFIX.length);
  }
  
  return buildAvatarUrl({ seed });
}

export function isAvatarAssetRef(value?: string | null): boolean {
  return Boolean(value?.startsWith(AVATAR_SEED_PREFIX));
}

export function pickRandomAvatarRef(): string {
  const randomSeed = Math.random().toString(36).substring(2, 10);
  return `${AVATAR_SEED_PREFIX}${randomSeed}`;
}

export function defaultAvatarRefForSeed(seed: string): string {
  return `${AVATAR_SEED_PREFIX}${seed}`;
}

/** Legacy support for background colors if needed */
export const NEO_AVATAR_BG_COLORS = [
  '#FFE500',
  '#C8FF00',
  '#56C8FF',
  '#FF3E9D',
  '#FF6B35',
  '#9122FF',
] as const;

function hashString(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getAvatarBgColor(stored?: string | null): string | null {
  if (!stored) return null;
  const seed = stored.startsWith(AVATAR_SEED_PREFIX) 
    ? stored.slice(AVATAR_SEED_PREFIX.length) 
    : stored;
  return NEO_AVATAR_BG_COLORS[hashString(seed) % NEO_AVATAR_BG_COLORS.length];
}

export function demoAvatarUrl(seed: string): string {
  return resolveAvatarSrc(defaultAvatarRefForSeed(seed)) ?? '';
}

