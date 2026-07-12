import { supabase } from '../lib/supabase';
import { notifyLeaderboardRefresh } from '../lib/leaderboardRefresh';

export type EarnAction =
  | 'daily_login'
  | 'qr_scan'
  | 'mission_complete'
  | 'game_win'
  | 'achievement'
  | 'referral';

export type EarnResult = {
  points: number;
  qrPoints?: number;
  requestedPoints?: number;
  acceptedPoints?: number;
  rejectedPoints?: number;
  maxPointsLimit?: number;
  pointsAfterClaim?: number;
  xp: number;
  leveledUp: boolean;
  level: number;
  bonusPoints: number;
  capped: boolean;
  xpToNext?: number;
  alreadyClaimed?: boolean;
  disabled?: boolean;
  currentStreak?: number;
  longestStreak?: number;
  streakDay?: number;
};

export type QRClaimPreview = {
  code: string;
  title: string;
  points: number;
  location: string;
  amount: number | null;
  expiresAt: string | null;
  issuedAt: string | null;
  status: 'pending' | 'used' | 'expired' | 'inactive';
  isCashier: boolean;
  alreadyScanned: boolean;
};

export type PerformOptions = {
  referenceId?: string;
  metadata?: Record<string, unknown>;
};

function parseEarnResult(raw: unknown): EarnResult {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    points: Number(r.points ?? 0),
    qrPoints: r.qr_points != null ? Number(r.qr_points) : undefined,
    requestedPoints: r.requested_points != null ? Number(r.requested_points) : undefined,
    acceptedPoints: r.accepted_points != null ? Number(r.accepted_points) : undefined,
    rejectedPoints: r.rejected_points != null ? Number(r.rejected_points) : undefined,
    maxPointsLimit: r.max_points_limit != null ? Number(r.max_points_limit) : undefined,
    pointsAfterClaim: r.points_after_claim != null ? Number(r.points_after_claim) : undefined,
    xp: Number(r.xp ?? 0),
    leveledUp: Boolean(r.leveled_up),
    level: Number(r.level ?? 1),
    bonusPoints: Number(r.bonus_points ?? 0),
    capped: Boolean(r.capped),
    xpToNext: r.xp_to_next != null ? Number(r.xp_to_next) : undefined,
    alreadyClaimed: r.already_claimed != null ? Boolean(r.already_claimed) : undefined,
    disabled: r.disabled != null ? Boolean(r.disabled) : undefined,
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
    p_metadata: options.metadata ?? {},
  });

  if (error) throw normalizeClaimError(error);
  const result = parseEarnResult(data);
  if (result.points > 0 || result.bonusPoints > 0) {
    notifyLeaderboardRefresh();
  }
  return result;
}

/** Claim QR scan — server validates code, usage, expiry, and points */
export async function claimQrScan(code: string): Promise<EarnResult> {
  const { data, error } = await supabase.rpc('claim_qr_scan', { p_code: code });
  if (error) throw normalizeClaimError(error);
  const result = parseEarnResult(data);
  if (result.points > 0 || result.bonusPoints > 0) {
    notifyLeaderboardRefresh();
  }
  return result;
}

/** Preview QR code info without claiming it. Claim still happens only through claim_qr_scan. */
export async function previewQrScan(code: string): Promise<QRClaimPreview | null> {
  const { data, error } = await supabase.rpc('preview_qr_scan', { p_code: code });
  if (error) throw normalizeClaimError(error);
  if (!data) return null;

  const r = data as Record<string, unknown>;
  return {
    code: String(r.code ?? ''),
    title: String(r.title ?? 'Mağaza QR Kodu'),
    points: Number(r.points ?? 0),
    location: String(r.location ?? 'Mağaza'),
    amount: r.amount == null ? null : Number(r.amount),
    expiresAt: r.expires_at == null ? null : String(r.expires_at),
    issuedAt: r.issued_at == null ? null : String(r.issued_at),
    status: String(r.status ?? 'inactive') as QRClaimPreview['status'],
    isCashier: Boolean(r.is_cashier),
    alreadyScanned: Boolean(r.already_scanned),
  };
}

function normalizeClaimError(error: unknown): Error {
  const source = error as { message?: string; details?: string; hint?: string };
  const text = [source?.message, source?.details, source?.hint].filter(Boolean).join(' ');
  const lower = text.toLowerCase();

  if (lower.includes('maximum loyalty points limit') || lower.includes('exceed the maximum')) {
    return new Error(text || 'You have reached the maximum loyalty points limit. You cannot claim more points at this time.');
  }
  if (lower.includes('qr code expired') || lower.includes('ticket has expired')) {
    return new Error('This ticket has expired and can no longer be used.');
  }
  if (lower.includes('already scanned') || lower.includes('already used')) {
    return new Error('This code has already been used.');
  }

  return error instanceof Error ? error : new Error(text || 'Claim failed.');
}

/** Claim daily streak reward */
export async function claimDailyStreak(): Promise<EarnResult> {
  const { data, error } = await supabase.rpc('claim_daily_streak');
  if (error) throw normalizeClaimError(error);
  const result = parseEarnResult(data);
  if (result.points > 0 || result.bonusPoints > 0) {
    notifyLeaderboardRefresh();
  }
  return result;
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
