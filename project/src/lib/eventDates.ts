function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function eventStartTime(value?: string | null): number {
  return parseDate(value)?.getTime() ?? 0;
}

/**
 * Admin-created reward events are presented as date ranges in the UI.
 * Treat the displayed end date as inclusive through the local end of that day.
 */
export function eventEndTime(value?: string | null): number {
  const date = parseDate(value);
  if (!date) return 0;

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  return endOfDay.getTime();
}

export function eventHasEnded(value?: string | null, now = Date.now()): boolean {
  const end = eventEndTime(value);
  return Boolean(end && now > end);
}
