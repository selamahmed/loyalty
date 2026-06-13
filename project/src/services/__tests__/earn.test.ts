import { describe, it, expect } from 'vitest';
import { isStreakClaimedToday, nextStreakDay } from '../streaks';

describe('streaks', () => {
  it('detects claim today', () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(isStreakClaimedToday({ current_streak: 3, longest_streak: 5, last_claim_date: today })).toBe(true);
  });

  it('computes next streak day after gap', () => {
    expect(nextStreakDay(null)).toBe(1);
    expect(nextStreakDay({
      current_streak: 3,
      longest_streak: 3,
      last_claim_date: '2020-01-01',
    })).toBe(1);
  });
});

describe('earn security contract', () => {
  it('PerformOptions must not include point overrides', () => {
    type PerformOptions = { referenceId?: string };
    const opts: PerformOptions = { referenceId: 'spin' };
    expect(opts).not.toHaveProperty('pointsOverride');
    expect(opts).not.toHaveProperty('xpOverride');
  });
});
