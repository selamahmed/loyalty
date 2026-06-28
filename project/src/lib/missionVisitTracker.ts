function visitKey(slug: string, userId: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `nr_mission_visit_${slug}_${userId}_${day}`;
}

export function markMissionPageVisit(slug: string, userId: string): void {
  try {
    localStorage.setItem(visitKey(slug, userId), '1');
  } catch {
    /* ignore quota / private mode */
  }
}

export function hasMissionPageVisit(slug: string, userId: string): boolean {
  try {
    return localStorage.getItem(visitKey(slug, userId)) === '1';
  } catch {
    return false;
  }
}
