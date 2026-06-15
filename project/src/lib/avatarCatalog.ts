/** Seed-based avatars using DiceBear API */

import { buildAvatarUrl } from './avatar';

export const AVATAR_SEED_PREFIX = 'seed:';

export type AvatarAsset = {
  id: string;
  url: string;
  ref: string;
};

function cleanDiceBearUrl(url: string, fallbackSeed: string): string {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes('dicebear.com')) {
      return url;
    }

    const seed = parsed.searchParams.get('seed')?.trim() || fallbackSeed || 'user';
    const sizeParam = Number(parsed.searchParams.get('size'));
    const size = Number.isFinite(sizeParam) && sizeParam > 0 ? sizeParam : 512;
    const backgroundColor = parsed.searchParams.get('backgroundColor')?.trim() || undefined;
    const skinColor = parsed.searchParams.get('skinColor')?.trim() || undefined;

    return buildAvatarUrl({
      seed,
      size,
      backgroundColor,
      skinColor,
    });
  } catch {
    return buildAvatarUrl({ seed: fallbackSeed || 'user', size: 512 });
  }
}

/**
 * Resolve stored avatar value to a displayable URL.
 */
export function resolveAvatarSrc(
  stored?: string | null,
  avatarSeed?: string | null
): string {
  const cleanStored = stored?.trim() || '';
  const cleanSeed = avatarSeed?.trim() || 'user';

  if (cleanStored.startsWith('http://') || cleanStored.startsWith('https://')) {
    return cleanDiceBearUrl(cleanStored, cleanSeed);
  }

  if (cleanStored.startsWith(AVATAR_SEED_PREFIX)) {
    const seed = cleanStored.slice(AVATAR_SEED_PREFIX.length).trim();
    return buildAvatarUrl({ seed: seed || cleanSeed, size: 512 });
  }

  if (cleanStored) {
    return buildAvatarUrl({ seed: cleanStored, size: 512 });
  }

  return buildAvatarUrl({ seed: cleanSeed, size: 512 });
}

export function isAvatarAssetRef(value?: string | null): boolean {
  return Boolean(value?.startsWith(AVATAR_SEED_PREFIX));
}

export function pickRandomAvatarRef(): string {
  const randomSeed = Math.random().toString(36).substring(2, 10);
  return `${AVATAR_SEED_PREFIX}${randomSeed}`;
}

export function defaultAvatarRefForSeed(seed: string): string {
  return `${AVATAR_SEED_PREFIX}${seed || 'user'}`;
}

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
  return resolveAvatarSrc(defaultAvatarRefForSeed(seed));
}
