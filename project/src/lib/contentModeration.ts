const BAD_WORD_PATTERNS = [
  /\bf+u+c+k+\b/i,
  /\bs+h+i+t+\b/i,
  /\bb+i+t+c+h+\b/i,
  /\ba+s+s+h+o+l+e+\b/i,
  /\bc+u+n+t+\b/i,
  /\bd+i+c+k+\b/i,
  /\bp+u+s+s+y+\b/i,
  /\bn+i+g+g+e+r+\b/i,
  /\bf+a+g+g+o+t+\b/i,
  /\bs+i+k/i,
  /\borospu/i,
  /\bpi[cç]/i,
  /\bamk\b/i,
  /\byarr/i,
  /\bmal\b/i,
  /\bgerizekal/i,
  /\bكسم/i,
  /\bكس\b/i,
  /\bشرموط/i,
  /\bزب\b/i,
];

function normalizeForModeration(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[@]/g, 'a')
    .replace(/[!1|]/g, 'i')
    .replace(/[$5]/g, 's')
    .replace(/[0]/g, 'o')
    .replace(/[3]/g, 'e')
    .replace(/[^a-zA-Z0-9\u0600-\u06FFğĞüÜşŞıİöÖçÇ\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findBadWordField(fields: Record<string, string | null | undefined>): string | null {
  for (const [field, value] of Object.entries(fields)) {
    const normalized = normalizeForModeration(value ?? '');
    if (!normalized) continue;
    if (BAD_WORD_PATTERNS.some(pattern => pattern.test(normalized))) return field;
  }
  return null;
}
