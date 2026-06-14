const modules = import.meta.glob<string>('../assets/stickers/**/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
});

export type StickerAsset = { id: string; url: string };

function basename(path: string): string {
  return path.split('/').pop() ?? path;
}

const all = Object.entries(modules)
  .map(([path, url]) => ({ id: basename(path), url, path }))
  .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

/** Colorful stickers — heroes, backgrounds, game outcomes. */
export const COLORFUL_STICKERS: StickerAsset[] = all.filter(
  s => s.path.includes('/colorful/'),
);

/** Neo-brutal shape stickers (V icons) — buttons & cards. */
export const SHAPE_V_STICKERS: StickerAsset[] = all.filter(
  s => s.path.includes('neobrutalism') && s.id.startsWith('Stickers '),
);

/** Neo-brutal figure shapes — tier mascots & accent variety. */
export const SHAPE_FIGURE_STICKERS: StickerAsset[] = all.filter(
  s => s.path.includes('neobrutalism') && s.id.startsWith('Figure '),
);

export const SHAPE_STICKERS: StickerAsset[] = [...SHAPE_V_STICKERS, ...SHAPE_FIGURE_STICKERS];

/** @deprecated Use COLORFUL_STICKERS */
export const GROUP_STICKERS = COLORFUL_STICKERS;
/** @deprecated Use SHAPE_STICKERS */
export const STICKER_ASSETS = SHAPE_STICKERS;
/** @deprecated Use SHAPE_FIGURE_STICKERS */
export const FIGURE_STICKERS = SHAPE_FIGURE_STICKERS;
/** @deprecated Use SHAPE_V_STICKERS */
export const V_STICKERS = SHAPE_V_STICKERS;

const colorfulById = new Map(
  all.filter(s => s.path.includes('/colorful/')).map(g => [g.id, g]),
);

const shapeById = new Map(
  all.filter(s => s.path.includes('neobrutalism')).map(g => [g.id, g]),
);

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pickFromPool(pool: StickerAsset[], seed: string, offset = 0): StickerAsset {
  if (pool.length === 0) return { id: '', url: '' };
  const idx = (hashSeed(seed) + offset) % pool.length;
  return pool[idx];
}

/** Lookup a colorful sticker by filename, e.g. `dead.svg` or `Group 62.svg` */
export function colorfulSticker(filename: string): StickerAsset | undefined {
  return colorfulById.get(filename);
}

/** Lookup a neo-brutal shape sticker by filename, e.g. `Stickers V19.svg` */
export function shapeSticker(filename: string): StickerAsset | undefined {
  return shapeById.get(filename);
}

/** @deprecated Alias for colorfulSticker */
export function groupSticker(filename: string): StickerAsset | undefined {
  return colorfulSticker(filename);
}

/** Deterministic colorful sticker for backgrounds / heroes. */
export function colorfulBySeed(seed: string, offset = 0): StickerAsset {
  return pickFromPool(COLORFUL_STICKERS, seed, offset);
}

/** Deterministic shape sticker for buttons, cards, tabs. */
export function shapeBySeed(seed: string, offset = 0, preferFigure = false): StickerAsset {
  const pool = preferFigure && SHAPE_FIGURE_STICKERS.length > 0
    ? SHAPE_FIGURE_STICKERS
    : SHAPE_V_STICKERS.length > 0
      ? SHAPE_V_STICKERS
      : SHAPE_STICKERS;
  return pickFromPool(pool, seed, offset);
}

/** @deprecated Use shapeBySeed */
export function stickerBySeed(seed: string, offset = 0): StickerAsset {
  return shapeBySeed(seed, offset, false);
}

/** @deprecated Use shapeBySeed(..., true) */
export function figureBySeed(seed: string, offset = 0): StickerAsset {
  return shapeBySeed(seed, offset, true);
}

export function pickStickers(seed: string, count: number, variant: 'colorful' | 'shape' = 'shape'): StickerAsset[] {
  const pool = variant === 'colorful' ? COLORFUL_STICKERS : SHAPE_STICKERS;
  const out: StickerAsset[] = [];
  const used = new Set<number>();
  let i = 0;
  while (out.length < count && i < pool.length * 2) {
    const idx = (hashSeed(seed) + i * 17) % pool.length;
    if (!used.has(idx)) {
      used.add(idx);
      out.push(pool[idx]);
    }
    i += 1;
  }
  return out;
}
