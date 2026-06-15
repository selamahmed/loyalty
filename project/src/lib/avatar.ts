/**
 * DiceBear Open Peeps Avatar System
 * Provides utilities for generating, storing, and managing user avatars
 */

export interface AvatarOptions {
  seed?: string;
  size?: number;
  skinColor?: string; // Hex code or comma-separated hex codes (without #)
  backgroundColor?: string; // Hex code or comma-separated hex codes (without #)
  expressionVariant?: string; // e.g. calm, cheeky, etc.
  headVariant?: string; // Hair style
  clothingColor?: string; // Hex code
  scale?: number; // 0 to 200
  borderRadius?: number; // 0 to 50 (maps to 'radius' in DiceBear)
  rotate?: number; // 0 to 360
  translateX?: number; // -100 to 100
  translateY?: number; // -100 to 100
  flip?: boolean;
  accessoriesProbability?: number; // 0 to 100
  facialHairProbability?: number; // 0 to 100
  maskProbability?: number; // always 0
}

// Allowed skin colors: deceeb, e0abb4, abe0d7, faead9
export const ALLOWED_SKIN_COLORS = ['deceeb', 'e0abb4', 'abe0d7', 'faead9'];

// Solid background colors (strong colors)
export const STRONG_BG_COLORS = [
  'ff006e', // Hot pink
  '8338ec', // Purple
  '3a86ff', // Blue
  '06d6a0', // Teal
  'ffbe0b', // Yellow
  'fb5607', // Orange
  'ef4444', // Red
  '14b8a6', // Dark teal
];

// Happy, calm, cheeky faces only (no sad, angry, surprised)
export const ALLOWED_EXPRESSIONS = [
  'calm',
  'cheeky',
  'cute',
  'eatingHappy',
  'lovingGrin1',
  'lovingGrin2',
  'smile',
  'smileBig',
  'smileLOL'
];

// Normal hair options (no gray hair, no hats, no hair loss options)
export const ALLOWED_HAIRSTYLES = [
  'afro',
  'bangs',
  'bangs2',
  'bantuKnots',
  'bear',
  'bun',
  'bun2',
  'buns',
  'cornrows',
  'cornrows2',
  'dreads1',
  'dreads2',
  'flatTop',
  'flatTopLong',
  'long',
  'longAfro',
  'longBangs',
  'longCurly',
  'medium1',
  'medium2',
  'medium3',
  'mediumBangs',
  'mediumBangs2',
  'mediumBangs3',
  'mediumStraight',
  'mohawk',
  'mohawk2',
  'pomp',
  'short1',
  'short2',
  'short3',
  'short4',
  'short5',
  'twists',
  'twists2'
];

export const ALLOWED_CLOTHING_COLORS = [
  '111827', // Dark Gray
  '2563eb', // Blue
  'ec4899', // Pink
  '06d6a0', // Mint
  'ffbe0b', // Yellow
  'ef4444', // Red
  '7c3aed', // Purple
];

/**
 * Build a DiceBear Open Peeps avatar URL from a seed and optional configurations
 */
export const buildAvatarUrl = (options: AvatarOptions | string): string => {
  const opts: AvatarOptions = typeof options === 'string' ? { seed: options } : options;
  
  const seed = opts.seed || 'user';
  const safeSeed = encodeURIComponent(seed);
  
  // Set default skin colors (if not specified, use allowed skin colors)
  const skinColor = opts.skinColor || ALLOWED_SKIN_COLORS.join(',');
  
  // Set default background (if not specified, choose from strong solid colors or let DiceBear select)
  const backgroundColor = opts.backgroundColor || STRONG_BG_COLORS.join(',');

  // Set default expression (if not specified, only use allowed ones)
  const expressionVariant = opts.expressionVariant || ALLOWED_EXPRESSIONS.join(',');

  // Set default head variant (if not specified, only use allowed normal hair)
  const headVariant = opts.headVariant || ALLOWED_HAIRSTYLES.join(',');

  // Set default clothing color
  const clothingColor = opts.clothingColor || ALLOWED_CLOTHING_COLORS.join(',');

  const params = new URLSearchParams();
  params.set('seed', seed);
  
  if (opts.size) params.set('size', opts.size.toString());
  params.set('skinColor', skinColor);
  params.set('backgroundColor', backgroundColor);
  params.set('expressionVariant', expressionVariant);
  params.set('headVariant', headVariant);
  params.set('clothingColor', clothingColor);

  if (opts.scale !== undefined) params.set('scale', opts.scale.toString());
  if (opts.borderRadius !== undefined) params.set('radius', opts.borderRadius.toString());
  if (opts.rotate !== undefined) params.set('rotate', opts.rotate.toString());
  if (opts.translateX !== undefined) params.set('translateX', opts.translateX.toString());
  if (opts.translateY !== undefined) params.set('translateY', opts.translateY.toString());
  if (opts.flip !== undefined) params.set('flip', opts.flip.toString());
  
  // Accessories probability (optional)
  const accProb = opts.accessoriesProbability !== undefined ? opts.accessoriesProbability : 30;
  params.set('accessoriesProbability', accProb.toString());
  
  // Facial hair probability
  const facialHairProb = opts.facialHairProbability !== undefined ? opts.facialHairProbability : 15;
  params.set('facialHairProbability', facialHairProb.toString());

  // Mask must always be off (probability = 0)
  params.set('maskProbability', '0');

  // Solid background fill
  params.set('backgroundColorFill', 'solid');

  return `https://api.dicebear.com/10.x/open-peeps/svg?${params.toString()}`;
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
