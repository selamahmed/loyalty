import { supabase } from '../lib/supabase';

export type EarnAction =
  | 'daily_login'
  | 'qr_scan'
  | 'mission_complete'
  | 'game_win'
  | 'achievement'
  | 'referral';

export type EarnResult = {
  points: number;
  xp: number;
  leveledUp: boolean;
  level: number;
  bonusPoints: number;
  capped: boolean;
  xpToNext?: number;
  alreadyClaimed?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  streakDay?: number;
};

export type PerformOptions = {
  referenceId?: string;
};

function parseEarnResult(raw: unknown): EarnResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    points: Number(r.points ?? 0),
    xp: Number(r.xp ?? 0),
    leveledUp: Boolean(r.leveled_up),
    level: Number(r.level ?? 1),
    bonusPoints: Number(r.bonus_points ?? 0),
    capped: Boolean(r.capped),
    xpToNext: r.xp_to_next != null ? Number(r.xp_to_next) : undefined,
    alreadyClaimed: r.already_claimed != null ? Boolean(r.already_claimed) : undefined,
    currentStreak: r.current_streak != null ? Number(r.current_streak) : undefined,
    longestStreak: r.longest_streak != null ? Number(r.longest_streak) : undefined,
    streakDay: r.streak_day != null ? Number(r.streak_day) : undefined,
  };
}

/**
 * Server-authoritative reward path.
 * Client sends ONLY action + reference_id. Server calculates all rewards.
 */
export async function performAction(
  action: EarnAction,
  options: PerformOptions = {},
): Promise<EarnResult> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('perform_action', {
    p_action: action,
    p_reference_id: options.referenceId ?? null,
    p_metadata: {},
  });

  if (error) throw error;
  return parseEarnResult(data);
}

/** Claim QR scan — server validates code, usage, expiry, and points */
export async function claimQrScan(code: string): Promise<EarnResult> {
  const { data, error } = await supabase.rpc('claim_qr_scan', { p_code: code });
  if (error) throw error;
  return parseEarnResult(data);
}

/** Claim daily streak reward */
export async function claimDailyStreak(): Promise<EarnResult> {
  const { data, error } = await supabase.rpc('claim_daily_streak');
  if (error) throw error;
  return parseEarnResult(data);
}

/** @deprecated Use performAction — kept for gradual migration */
export async function earnReward(
  _userId: string,
  ruleType: EarnAction | string,
  options: PerformOptions = {},
): Promise<EarnResult> {
  if (ruleType === 'qr_scan' && options.referenceId) {
    return claimQrScan(options.referenceId);
  }
  if (ruleType === 'daily_login') {
    return claimDailyStreak();
  }
  return performAction(ruleType as EarnAction, options);
}
