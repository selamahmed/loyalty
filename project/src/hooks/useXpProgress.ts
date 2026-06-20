import { useState, useEffect } from 'react';
import { getLevelConfig, calcXpProgress, DEFAULT_LEVELS, type LevelConfig, type XpProgress } from '../services/xp';

let cachedLevels: LevelConfig[] | null = null;

export function useLevelConfig() {
  const [levels, setLevels] = useState<LevelConfig[]>(cachedLevels ?? DEFAULT_LEVELS);

  useEffect(() => {
    getLevelConfig()
      .then(rows => {
        cachedLevels = rows;
        setLevels(rows);
      })
      .catch(() => setLevels(DEFAULT_LEVELS));
  }, []);

  return levels;
}

export function useXpProgress(
  totalXp: number,
  userLevel: number,
  xpToNext?: number | null,
): XpProgress {
  const levels = useLevelConfig();
  return calcXpProgress(totalXp, userLevel, levels, xpToNext);
}
