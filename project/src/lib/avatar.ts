/**
 * DiceBear Open Peeps Avatar System
 * Provides utilities for generating, storing, and managing user avatars
 */

/**
 * Build a DiceBear Open Peeps avatar URL from a seed
 */
export const buildAvatarUrl = (seed: string): string => {
  const safeSeed = encodeURIComponent(seed || 'user');

  return (
    'https://api.dicebear.com/10.x/open-peeps/svg' +
    '?seed=' +
    safeSeed +
    '&size=512' +
    '&backgroundColor=ff006e,8338ec,3a86ff,06d6a0,ffbe0b,fb5607,ef4444,14b8a6' +
    '&backgroundColorFill=solid' +
    '&skinColor=faead9,ffdbb4,deceeb,e0abb4,abe0d7' +
    '&skinColorFill=solid' +
    '&maskProbability=0' +
    '&accessoriesProbability=45' +
    '&accessoriesVariant=glasses,glasses2,glasses3,glasses4,glasses5,sunglasses,sunglasses2' +
    '&expressionProbability=100' +
    '&expressionVariant=smile,smileBig,smileLOL,cute,calm,cheeky,lovingGrin1,lovingGrin2,eatingHappy' +
    '&headProbability=100' +
    '&headVariant=short1,short2,short3,short4,short5,medium1,medium2,medium3,mediumStraight,bangs,bangs2,long,longCurly,longBangs,pomp,bun,bun2' +
    '&facialHairProbability=15' +
    '&clothingColor=111827,2563eb,ec4899,06d6a0,ffbe0b,ef4444,7c3aed' +
    '&clothingColorFill=solid'
  );
};

/**
 * Get a default avatar seed based on user info
 * Priority: name → email username → user id
 */
export const getDefaultAvatarSeed = (options: {
  name?: string | null;
  email?: string | null;
  id?: string | null;
}): string => {
  if (options.name && options.name.trim()) {
    return options.name.trim();
  }
  if (options.email && options.email.trim()) {
    const emailUsername = options.email.split('@')[0];
    if (emailUsername) return emailUsername;
  }
  if (options.id && options.id.trim()) {
    return options.id.trim();
  }
  return 'user';
};

/**
 * Generate a random avatar seed using timestamp + random string
 */
export const randomAvatarSeed = (): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `avatar-${timestamp}-${random}`;
};

/**
 * Validate if a seed is safe for URL encoding
 */
export const isValidSeed = (seed: string | null | undefined): boolean => {
  if (!seed || typeof seed !== 'string') return false;
  return seed.trim().length > 0;
};
