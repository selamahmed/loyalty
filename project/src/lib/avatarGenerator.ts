/** Initials fallback for avatars */

export function getInitials(name?: string | null, email?: string | null): string {
  const source = (name?.trim() || email?.split('@')[0] || 'U').trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

import { NEO_AVATAR_BG_COLORS } from './avatarCatalog';

const BG_COLORS = [...NEO_AVATAR_BG_COLORS];

export function getInitialsBg(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return BG_COLORS[hash % BG_COLORS.length];
}
