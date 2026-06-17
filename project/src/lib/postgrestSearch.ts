const POSTGREST_SEARCH_UNSAFE_RE = /[\\%_,()*"'{}[\]:;]/g;
const SEARCH_ALLOWED_RE = /[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ@.+\-\s]/g;

export function sanitizePostgrestSearch(raw: string, maxLength = 64): string {
  return raw
    .normalize('NFKC')
    .replace(POSTGREST_SEARCH_UNSAFE_RE, ' ')
    .replace(SEARCH_ALLOWED_RE, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

export function ilikeOrFilter(fields: string[], raw: string): string | null {
  const safe = sanitizePostgrestSearch(raw);
  if (!safe) return null;
  return fields.map((field) => `${field}.ilike.%${safe}%`).join(',');
}
