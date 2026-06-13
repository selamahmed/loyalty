import { getProfile } from './profile';
import { getUserStreak } from './streaks';
import { getUserSettings } from './userSettings';

export type CanonicalProfile = {
  id: string;
  username: string | null;
  email: string | null;
  role: string | null;
  avatar_url: string | null;
  total_points: number;
  current_points: number;
  level: number;
  xp: number;
  xp_to_next: number;
  status: string | null;
  streak: number;
  phone: string | null;
  bio: string | null;
  created_at: string;
  current_streak: number;
  longest_streak: number;
  last_claim_date: string | null;
  settings: {
    public_profile: boolean;
    show_on_leaderboard: boolean;
    share_activity: boolean;
    login_alerts: boolean;
    two_factor_enabled: boolean;
  };
};

export async function fetchCanonicalProfile(userId: string): Promise<CanonicalProfile | null> {
  if (!userId) return null;

  const [profile, streak, settings] = await Promise.all([
    getProfile(userId),
    getUserStreak(userId),
    getUserSettings(userId),
  ]);

  if (!profile) return null;

  return {
    id: profile.id,
    username: profile.username,
    email: profile.email,
    role: profile.role,
    avatar_url: profile.avatar_url,
    total_points: profile.total_points ?? 0,
    current_points: profile.current_points ?? 0,
    level: profile.level ?? 1,
    xp: profile.xp ?? 0,
    xp_to_next: profile.xp_to_next ?? 200,
    status: profile.status ?? 'active',
    streak: streak?.current_streak ?? profile.streak ?? 0,
    phone: profile.phone,
    bio: profile.bio,
    created_at: profile.created_at,
    current_streak: streak?.current_streak ?? profile.streak ?? 0,
    longest_streak: streak?.longest_streak ?? profile.streak ?? 0,
    last_claim_date: streak?.last_claim_date ?? null,
    settings: {
      public_profile: settings.public_profile,
      show_on_leaderboard: settings.show_on_leaderboard,
      share_activity: settings.share_activity,
      login_alerts: settings.login_alerts,
      two_factor_enabled: settings.two_factor_enabled,
    },
  };
}
