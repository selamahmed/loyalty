import type { Database } from './supabase';

type MissionCategory = Database['public']['Tables']['missions']['Row']['category'];

/** Start of the current mission period in local time. */
export function getMissionPeriodStart(category: MissionCategory): Date {
  const now = new Date();
  if (category === 'weekly') {
    const start = new Date(now);
    const day = start.getDay(); // 0 Sun … 6 Sat
    const diff = day === 0 ? -6 : 1 - day; // Monday-based week
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() + diff);
    return start;
  }

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return start;
}

export function isMissionCompletedInPeriod(
  completedAt: string | null | undefined,
  category: MissionCategory,
): boolean {
  if (!completedAt) return false;
  return new Date(completedAt) >= getMissionPeriodStart(category);
}

export function nextMissionResetLabel(category: MissionCategory): string {
  if (category === 'weekly') {
    const start = getMissionPeriodStart('weekly');
    const next = new Date(start);
    next.setDate(next.getDate() + 7);
    return next.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'short' });
  }
  const tomorrow = new Date();
  tomorrow.setHours(24, 0, 0, 0);
  return tomorrow.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
}
