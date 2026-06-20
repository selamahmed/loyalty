import { supabase } from '../lib/supabase';

export type LevelConfig = {
  level: number;
  title: string;
  xp_required: number;
  reward_label: string | null;
  bonus_points: number;
  tier: string | null;
  color: string | null;
  sort_order: number;
  active: boolean;
};

/** Fallback when level_config table is not seeded yet */
export const DEFAULT_LEVELS: LevelConfig[] = [
  { level: 1,  title: 'Acemi',     xp_required: 0,     reward_label: 'Hoş Geldin Paketi',   bonus_points: 0,    tier: 'BAŞLANGIÇ', color: '#FFE500', sort_order: 1,  active: true },
  { level: 2,  title: 'Kaşif',     xp_required: 200,   reward_label: '+50 Bonus Puan',      bonus_points: 50,   tier: 'BAŞLANGIÇ', color: '#FF5722', sort_order: 2,  active: true },
  { level: 3,  title: 'Arayıcı',   xp_required: 500,   reward_label: '%10 İndirim Kuponu',  bonus_points: 0,    tier: 'BAŞLANGIÇ', color: '#4CAF50', sort_order: 3,  active: true },
  { level: 4,  title: 'Maceracı',  xp_required: 900,   reward_label: '+100 Bonus Puan',     bonus_points: 100,  tier: 'BAŞLANGIÇ', color: '#2196F3', sort_order: 4,  active: true },
  { level: 5,  title: 'Savaşçı',   xp_required: 1400,  reward_label: 'Özel Rozet',          bonus_points: 0,    tier: 'SAVAŞÇI',   color: '#FF9800', sort_order: 5,  active: true },
  { level: 6,  title: 'Şampiyon',  xp_required: 2000,  reward_label: '+200 Bonus Puan',     bonus_points: 200,  tier: 'SAVAŞÇI',   color: '#9C27B0', sort_order: 6,  active: true },
  { level: 7,  title: 'Kahraman',  xp_required: 2700,  reward_label: 'Ücretsiz Kahve',      bonus_points: 0,    tier: 'SAVAŞÇI',   color: '#F44336', sort_order: 7,  active: true },
  { level: 8,  title: 'Efsane',    xp_required: 3500,  reward_label: '+300 Bonus Puan',     bonus_points: 300,  tier: 'SAVAŞÇI',   color: '#00BCD4', sort_order: 8,  active: true },
  { level: 9,  title: 'Mitik',     xp_required: 4400,  reward_label: 'Gizem Kutusu',        bonus_points: 0,    tier: 'KAHRAMAN',  color: '#FFEB3B', sort_order: 9,  active: true },
  { level: 10, title: 'İlahi',     xp_required: 5500,  reward_label: '+500 Bonus Puan',     bonus_points: 500,  tier: 'KAHRAMAN',  color: '#8BC34A', sort_order: 10, active: true },
  { level: 11, title: 'Kozmik',    xp_required: 6800,  reward_label: 'Özel Ürün',           bonus_points: 0,    tier: 'KAHRAMAN',  color: '#E91E63', sort_order: 11, active: true },
  { level: 12, title: 'Yıldız',    xp_required: 8200,  reward_label: '+1000 Bonus Puan',    bonus_points: 1000, tier: 'KAHRAMAN',  color: '#03A9F4', sort_order: 12, active: true },
  { level: 15, title: 'Yüce',      xp_required: 12000, reward_label: 'VIP Statüsü',         bonus_points: 0,    tier: 'EFSANE',    color: '#1565C0', sort_order: 15, active: true },
  { level: 20, title: 'Ölümsüz',   xp_required: 20000, reward_label: 'Efsanevi Paket',      bonus_points: 0,    tier: 'ÖLÜMSÜZ',   color: '#880E4F', sort_order: 20, active: true },
];

export async function getLevelConfig(): Promise<LevelConfig[]> {
  const { data, error } = await supabase
    .from('level_config')
    .select('*')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('level', { ascending: true });

  if (error || !data?.length) return DEFAULT_LEVELS;
  return data as LevelConfig[];
}

export async function upsertLevelConfig(level: Partial<LevelConfig> & { level: number }): Promise<LevelConfig> {
  const { data, error } = await supabase
    .from('level_config')
    .upsert({
      ...level,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'level' })
    .select()
    .single();
  if (error) throw error;
  return data as LevelConfig;
}

export async function deleteLevelConfig(level: number): Promise<void> {
  const { error } = await supabase.from('level_config').delete().eq('level', level);
  if (error) throw error;
}

export type XpProgress = {
  inLevel: number;
  needed: number;
  pct: number;
  remaining: number;
  isMaxLevel: boolean;
  currentTitle: string;
  nextTitle: string | null;
};

const finiteNumber = (value: number | null | undefined) =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function calcXpProgress(
  totalXp: number,
  userLevel: number,
  levels: LevelConfig[],
  xpToNext?: number | null,
): XpProgress {
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  const current = sorted.find(l => l.level === userLevel) ?? sorted[0];
  const next = sorted.find(l => l.level > userLevel);
  const safeTotalXp = Math.max(0, finiteNumber(totalXp) ?? 0);
  const safeXpToNext = finiteNumber(xpToNext);
  const floor = current?.xp_required ?? 0;

  if (!next) {
    return {
      inLevel: Math.max(0, safeTotalXp - floor),
      needed: 0,
      pct: 100,
      remaining: 0,
      isMaxLevel: true,
      currentTitle: current?.title ?? 'Acemi',
      nextTitle: null,
    };
  }

  const levelSpan = Math.max(1, next.xp_required - floor);

  if (safeXpToNext !== null && safeXpToNext >= 0) {
    const remaining = safeXpToNext;
    const cumulativeInLevel = safeTotalXp - floor;

    if (cumulativeInLevel >= 0) {
      const inLevel = clamp(levelSpan - remaining, 0, levelSpan);

      return {
        inLevel,
        needed: levelSpan,
        pct: Math.min(100, Math.round((inLevel / levelSpan) * 100)),
        remaining,
        isMaxLevel: false,
        currentTitle: current?.title ?? 'Acemi',
        nextTitle: next.title,
      };
    }

    // Some deployments store profiles.xp as current-level XP, not lifetime XP.
    // In that shape, xp_to_next gives the missing half of the same progress bar.
    const needed = Math.max(1, safeTotalXp + remaining);
    const inLevel = clamp(safeTotalXp, 0, needed);

    return {
      inLevel,
      needed,
      pct: Math.min(100, Math.round((inLevel / needed) * 100)),
      remaining,
      isMaxLevel: false,
      currentTitle: current?.title ?? 'Acemi',
      nextTitle: next.title,
    };
  }

  const inLevel = Math.max(0, safeTotalXp - floor);
  const remaining = Math.max(0, next.xp_required - safeTotalXp);

  return {
    inLevel,
    needed: levelSpan,
    pct: Math.min(100, Math.round((inLevel / levelSpan) * 100)),
    remaining,
    isMaxLevel: false,
    currentTitle: current?.title ?? 'Acemi',
    nextTitle: next.title,
  };
}

export function levelFromXp(totalXp: number, levels: LevelConfig[]): number {
  const sorted = [...levels].sort((a, b) => a.level - b.level);
  let lv = 1;
  for (const l of sorted) {
    if (totalXp >= l.xp_required) lv = l.level;
  }
  return lv;
}
