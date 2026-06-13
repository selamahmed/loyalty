const badgeModules = import.meta.glob<string>('../assets/badges/*.{png,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

/** Ordered progression: Bronze → Silver (Siver) → Gold → Master */
export const LEVEL_BADGE_IDS = [
  'Bronze I.png',
  'Bronze II.png',
  'Bronze III.png',
  'Siver I.png',
  'Siver II.png',
  'Siver III.png',
  'Gold I.png',
  'Gold II.png',
  'Gold III.png',
  'Master.png',
] as const;

export type LevelBadgeId = (typeof LEVEL_BADGE_IDS)[number];

const badgeById = new Map(
  Object.entries(badgeModules).map(([path, url]) => [path.split('/').pop() ?? path, url]),
);

export type LevelBadgeInfo = {
  id: LevelBadgeId;
  url: string;
  label: string;
  tier: 'bronze' | 'silver' | 'gold' | 'master';
};

const BADGE_META: Record<LevelBadgeId, { label: string; tier: LevelBadgeInfo['tier'] }> = {
  'Bronze I.png':   { label: 'Bronze I',   tier: 'bronze' },
  'Bronze II.png':  { label: 'Bronze II',  tier: 'bronze' },
  'Bronze III.png': { label: 'Bronze III', tier: 'bronze' },
  'Siver I.png':    { label: 'Silver I',   tier: 'silver' },
  'Siver II.png':   { label: 'Silver II',  tier: 'silver' },
  'Siver III.png':  { label: 'Silver III', tier: 'silver' },
  'Gold I.png':     { label: 'Gold I',     tier: 'gold' },
  'Gold II.png':    { label: 'Gold II',    tier: 'gold' },
  'Gold III.png':   { label: 'Gold III',   tier: 'gold' },
  'Master.png':     { label: 'Master',     tier: 'master' },
};

/** Map user level (1+) to badge asset. Levels 10+ use Master. */
export function getLevelBadge(level: number): LevelBadgeInfo {
  const safe = Math.max(1, Math.floor(level));
  const idx = safe >= 10 ? LEVEL_BADGE_IDS.length - 1 : Math.min(safe - 1, LEVEL_BADGE_IDS.length - 2);
  const id = LEVEL_BADGE_IDS[idx];
  const url = badgeById.get(id) ?? '';
  const meta = BADGE_META[id];
  return { id, url, label: meta.label, tier: meta.tier };
}
