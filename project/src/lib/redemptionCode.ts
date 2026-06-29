/** Strip noise and uppercase — used for lookup, QR payloads, and copy. */
export function normalizeRedemptionCode(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

/** Human-friendly display; legacy 12-char codes get grouped. */
export function formatRedemptionCode(code: string): string {
  const normalized = normalizeRedemptionCode(code);
  if (normalized.length <= 8) return normalized;
  return normalized.match(/.{1,4}/g)?.join(' ') ?? normalized;
}
