/** Stored in profiles.avatar_url as `asset:filename.svg` */

export const AVATAR_ASSET_PREFIX = 'asset:';

const modules = import.meta.glob<string>('../assets/avatars/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

export type AvatarAsset = { id: string; url: string; ref: string };

export const AVATAR_ASSETS: AvatarAsset[] = Object.entries(modules)
  .map(([path, url]) => {
    const id = path.split('/').pop() ?? path;
    return { id, url, ref: `${AVATAR_ASSET_PREFIX}${id}` };
  })
  .sort((a, b) => a.id.localeCompare(b.id));

const byId = new Map(AVATAR_ASSETS.map(a => [a.id, a]));
const byRef = new Map(AVATAR_ASSETS.map(a => [a.ref, a]));

export function toAvatarAssetRef(filename: string): string {
  return `${AVATAR_ASSET_PREFIX}${filename}`;
}

export function isAvatarAssetRef(value?: string | null): boolean {
  return Boolean(value?.startsWith(AVATAR_ASSET_PREFIX));
}

/** Resolve stored avatar_url to a displayable URL */
export function resolveAvatarSrc(stored?: string | null): string | null {
  if (!stored) return null;
  if (stored.startsWith(AVATAR_ASSET_PREFIX)) {
    const id = stored.slice(AVATAR_ASSET_PREFIX.length);
    return byId.get(id)?.url ?? byRef.get(stored)?.url ?? null;
  }
  if (stored.startsWith('http://') || stored.startsWith('https://')) {
    return stored;
  }
  return null;
}

export function pickRandomAvatarRef(excludeRef?: string | null): string {
  const pool = excludeRef
    ? AVATAR_ASSETS.filter(a => a.ref !== excludeRef)
    : AVATAR_ASSETS;
  if (pool.length === 0) return AVATAR_ASSETS[0]?.ref ?? '';
  return pool[Math.floor(Math.random() * pool.length)].ref;
}

export function defaultAvatarRefForSeed(seed: string): string {
  if (AVATAR_ASSETS.length === 0) return '';
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_ASSETS[hash % AVATAR_ASSETS.length].ref;
}

/** Local bundled avatar URL for marketing/demo UI (no external requests). */
export function demoAvatarUrl(seed: string): string {
  return resolveAvatarSrc(defaultAvatarRefForSeed(seed)) ?? AVATAR_ASSETS[0]?.url ?? '';
}

/** Solid neo-brutalism tile colors behind bundled avatar art */
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

/** Deterministic solid background for a picked avatar asset */
export function getAvatarBgColor(stored?: string | null): string | null {
  if (!stored || !isAvatarAssetRef(stored)) return null;
  const id = stored.slice(AVATAR_ASSET_PREFIX.length);
  return NEO_AVATAR_BG_COLORS[hashString(id) % NEO_AVATAR_BG_COLORS.length];
}
