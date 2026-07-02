/**
 * Avatar service — DiceBear Open Peeps + Supabase profiles
 */
import { supabase } from '../lib/supabase';
import {
  buildAvatarUrl,
  getDefaultAvatarSeed,
  normalizeAvatarAccessory,
  normalizeAvatarExpressionVariant,
  normalizeAvatarFacialHairVariant,
  normalizeAvatarFlip,
  normalizeAvatarHeadVariant,
} from '../lib/avatar';
import {
  AVATAR_SEED_PREFIX,
  defaultAvatarRefForSeed,
  isAvatarAssetRef,
  pickRandomAvatarRef,
  resolveAvatarSrc,
} from '../lib/avatarCatalog';

function isDiceBearUrl(value: string): boolean {
  return value.includes('dicebear.com');
}

function isExternalPhotoUrl(value: string): boolean {
  return (
    (value.startsWith('http://') || value.startsWith('https://'))
    && !isDiceBearUrl(value)
  );
}

function seedFromRef(ref: string): string {
  if (ref.startsWith(AVATAR_SEED_PREFIX)) {
    return ref.slice(AVATAR_SEED_PREFIX.length);
  }
  return ref;
}

function seedFromDiceBearUrl(url: string, fallbackSeed: string): string {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('seed')?.trim() || fallbackSeed;
  } catch {
    return fallbackSeed;
  }
}

function cleanAvatarUrlForSave(seed: string, avatarUrl?: string): string {
  if (!avatarUrl || !isDiceBearUrl(avatarUrl)) {
    return buildAvatarUrl({ seed, size: 512 });
  }

  try {
    const parsed = new URL(avatarUrl);
    const backgroundColor = parsed.searchParams.get('backgroundColor')?.trim() || undefined;
    const skinColor = parsed.searchParams.get('skinColor')?.trim() || undefined;
    const clothingColor = parsed.searchParams.get('clothingColor')?.trim() || undefined;
    const headVariant = normalizeAvatarHeadVariant(parsed.searchParams.get('headVariant')?.trim() || undefined);
    const expressionVariant = normalizeAvatarExpressionVariant(parsed.searchParams.get('expressionVariant')?.trim() || undefined);
    const facialHairVariant = normalizeAvatarFacialHairVariant(parsed.searchParams.get('facialHairVariant')?.trim() || undefined);
    const flip = normalizeAvatarFlip(parsed.searchParams.get('flip')?.trim() || undefined);
    const accessories = normalizeAvatarAccessory(
      (
        parsed.searchParams.get('accessoriesVariant')
        || parsed.searchParams.get('accessories')
        || parsed.searchParams.get('accessoriesType')
      )?.trim() || undefined,
    );
    const incomingProbability = Number(parsed.searchParams.get('accessoriesProbability'));
    const accessoriesProbability = Number.isFinite(incomingProbability) ? incomingProbability : undefined;
    const incomingFacialHairProbability = Number(parsed.searchParams.get('facialHairProbability'));
    const facialHairProbability = Number.isFinite(incomingFacialHairProbability)
      ? incomingFacialHairProbability
      : undefined;
    const scale = Number(parsed.searchParams.get('scale'));
    const rotate = Number(parsed.searchParams.get('rotate'));
    const translateX = Number(parsed.searchParams.get('translateX'));
    const translateY = Number(parsed.searchParams.get('translateY'));

    return buildAvatarUrl({
      seed,
      size: 512,
      backgroundColor,
      skinColor,
      clothingColor,
      headVariant,
      expressionVariant,
      accessories,
      accessoriesProbability,
      facialHairVariant,
      facialHairProbability,
      scale: Number.isFinite(scale) ? scale : undefined,
      rotate: Number.isFinite(rotate) ? rotate : undefined,
      translateX: Number.isFinite(translateX) ? translateX : undefined,
      translateY: Number.isFinite(translateY) ? translateY : undefined,
      flip,
    });
  } catch {
    return buildAvatarUrl({ seed, size: 512 });
  }
}

function defaultAvatarForUser(
  userName: string | null | undefined,
  userEmail: string | null | undefined,
  userId: string,
): { avatar_seed: string; avatar_url: string } {
  const seed = getDefaultAvatarSeed({
    name: userName,
    email: userEmail,
    id: userId,
  });
  return {
    avatar_seed: seed,
    avatar_url: buildAvatarUrl({ seed, size: 512 }),
  };
}

function normalizeAvatarUrl(storedUrl: string | null | undefined, seed: string): string {
  if (storedUrl && isDiceBearUrl(storedUrl)) {
    return resolveAvatarSrc(storedUrl, seed);
  }
  if (storedUrl && isExternalPhotoUrl(storedUrl)) {
    return storedUrl;
  }
  if (storedUrl && isAvatarAssetRef(storedUrl)) {
    return buildAvatarUrl({ seed: seedFromRef(storedUrl), size: 512 });
  }
  return buildAvatarUrl({ seed, size: 512 });
}

/**
 * Initialize avatar for a user if missing
 */
export async function initializeAvatarIfNeeded(
  userId: string,
  userName: string | null | undefined,
  userEmail: string | null | undefined,
): Promise<{ avatar_seed: string; avatar_url: string } | null> {
  if (!userId) return null;

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('avatar_seed, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const seed = profile?.avatar_seed
      || getDefaultAvatarSeed({ name: userName, email: userEmail, id: userId });

    if (profile?.avatar_url) {
      const normalizedUrl = normalizeAvatarUrl(profile.avatar_url, seed);
      const needsSeed = !profile.avatar_seed;
      const needsUrlUpgrade = profile.avatar_url !== normalizedUrl;

      if (needsSeed || needsUrlUpgrade) {
        await supabase
          .from('profiles')
          .update({
            avatar_seed: seed,
            avatar_url: normalizedUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', userId);
      }

      return { avatar_seed: seed, avatar_url: normalizedUrl };
    }

    const defaults = defaultAvatarForUser(userName, userEmail, userId);

    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_seed: defaults.avatar_seed,
        avatar_url: defaults.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('avatar_seed, avatar_url')
      .single();

    if (updateError) throw updateError;

    return updated
      ? { avatar_seed: updated.avatar_seed!, avatar_url: updated.avatar_url! }
      : null;
  } catch (err) {
    console.error('[Avatar] Failed to initialize avatar:', err);
    return null;
  }
}

/**
 * Save DiceBear avatar seed + generated URL to Supabase
 */
export async function saveUserAvatar(
  userId: string,
  seed: string,
  avatarUrl?: string,
): Promise<{ avatar_seed: string; avatar_url: string }> {
  if (!userId) throw new Error('Kullanıcı oturumu bulunamadı.');

  const trimmedSeed = seed.trim();

  if (!trimmedSeed) {
    throw new Error('Avatar seed boş olamaz.');
  }

  const cleanAvatarUrl = cleanAvatarUrlForSave(trimmedSeed, avatarUrl);

  const { data, error } = await supabase
    .from('profiles')
    .update({
      avatar_seed: trimmedSeed,
      avatar_url: cleanAvatarUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select('avatar_seed, avatar_url')
    .single();

  if (error) throw error;

  if (!data?.avatar_url) {
    throw new Error('Avatar kaydedilemedi.');
  }

  return {
    avatar_seed: data.avatar_seed ?? trimmedSeed,
    avatar_url: data.avatar_url,
  };
}

/**
 * Update user avatar with a seed ref (seed:random-string) or external URL
 */
export async function updateAvatar(
  userId: string,
  avatarRef: string,
): Promise<{ avatar_seed: string; avatar_url: string } | null> {
  if (!userId || !avatarRef.trim()) return null;

  const normalizedRef = avatarRef.trim();
  if (!isAvatarAssetRef(normalizedRef) && !isExternalPhotoUrl(normalizedRef) && !isDiceBearUrl(normalizedRef)) {
    return updateAvatar(userId, defaultAvatarRefForSeed(normalizedRef));
  }

  const seed = isAvatarAssetRef(normalizedRef)
    ? seedFromRef(normalizedRef)
    : isDiceBearUrl(normalizedRef)
      ? seedFromDiceBearUrl(normalizedRef, getDefaultAvatarSeed({ id: userId }))
      : getDefaultAvatarSeed({ id: userId });

  const url = buildAvatarUrl({ seed, size: 512 });

  return saveUserAvatar(userId, seed, url);
}

export async function randomizeAvatar(
  userId: string,
): Promise<{ avatar_seed: string; avatar_url: string } | null> {
  const avatarRef = pickRandomAvatarRef();
  return updateAvatar(userId, avatarRef);
}

export async function getUserAvatar(
  userId: string,
): Promise<{ seed: string | null; url: string | null } | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_seed, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    if (!data) return null;

    const seed = data.avatar_seed;
    const url = resolveAvatarSrc(data.avatar_url, data.avatar_seed);
    return { seed, url };
  } catch (err) {
    console.error('[Avatar] Failed to get avatar:', err);
    return null;
  }
}

export async function regenerateAvatarUrl(userId: string): Promise<string | null> {
  if (!userId) return null;

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('avatar_seed')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const seed = profile?.avatar_seed ?? getDefaultAvatarSeed({ id: userId });
    const newUrl = buildAvatarUrl({ seed, size: 512 });

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: newUrl,
        avatar_seed: seed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return newUrl;
  } catch (err) {
    console.error('[Avatar] Failed to regenerate avatar URL:', err);
    return null;
  }
}
