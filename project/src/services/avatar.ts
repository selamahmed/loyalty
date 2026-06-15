/**
 * Avatar service - handles avatar operations with Supabase
 */
import { supabase } from '../lib/supabase';
import { getDefaultAvatarSeed } from '../lib/avatar';
import {
  defaultAvatarRefForSeed,
  isAvatarAssetRef,
  pickRandomAvatarRef,
} from '../lib/avatarCatalog';
import type { Database } from '../lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

function isDiceBearUrl(value: string): boolean {
  return value.includes('dicebear.com');
}

function isExternalPhotoUrl(value: string): boolean {
  // Now we treat DiceBear as part of our core system, but external URLs are still supported if manually set in DB
  return (
    (value.startsWith('http://') || value.startsWith('https://'))
    && !isDiceBearUrl(value)
  );
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
    avatar_url: defaultAvatarRefForSeed(seed),
  };
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

    // Use name as seed if available, otherwise fallback
    const seed = userName || profile?.avatar_seed || getDefaultAvatarSeed({
      name: userName,
      email: userEmail,
      id: userId,
    });

    if (profile?.avatar_url) {
      if (!profile.avatar_seed) {
        await supabase
          .from('profiles')
          .update({ avatar_seed: seed, updated_at: new Date().toISOString() })
          .eq('id', userId);
      }
      return {
        avatar_seed: profile.avatar_seed ?? seed,
        avatar_url: profile.avatar_url,
      };
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
 * Update user avatar with a seed ref (seed:random-string)
 */
export async function updateAvatar(
  userId: string,
  avatarRef: string,
): Promise<{ avatar_seed: string; avatar_url: string } | null> {
  if (!userId || !avatarRef.trim()) return null;

  const normalizedRef = avatarRef.trim();
  // Simplified validation: either it's our seed ref or an external URL
  if (!isAvatarAssetRef(normalizedRef) && !isExternalPhotoUrl(normalizedRef)) {
    // If it doesn't have the prefix but isn't an external URL, assume it's a seed and add prefix
    return updateAvatar(userId, `seed:${normalizedRef}`);
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar_url: normalizedRef,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('avatar_seed, avatar_url')
      .single();

    if (error) throw error;

    return data
      ? { avatar_seed: data.avatar_seed ?? '', avatar_url: data.avatar_url! }
      : null;
  } catch (err) {
    console.error('[Avatar] Failed to update avatar:', err);
    throw err;
  }
}

/**
 * Pick and save a random seed-based avatar for the user
 */
export async function randomizeAvatar(
  userId: string,
): Promise<{ avatar_seed: string; avatar_url: string } | null> {
  const avatarRef = pickRandomAvatarRef();
  return updateAvatar(userId, avatarRef);
}

export async function getUserAvatar(userId: string): Promise<{ seed: string | null; url: string | null } | null> {
  if (!userId) return null;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('avatar_seed, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (error) throw error;

    return data
      ? { seed: data.avatar_seed, url: data.avatar_url }
      : null;
  } catch (err) {
    console.error('[Avatar] Failed to get avatar:', err);
    return null;
  }
}

/**
 * Regenerate avatar ref from seed
 */
export async function regenerateAvatarUrl(userId: string): Promise<string | null> {
  if (!userId) return null;

  try {
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('avatar_seed')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    const seed = profile?.avatar_seed
      ?? getDefaultAvatarSeed({ id: userId });
    const newRef = defaultAvatarRefForSeed(seed);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: newRef,
        avatar_seed: seed,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    return newRef;
  } catch (err) {
    console.error('[Avatar] Failed to regenerate avatar URL:', err);
    return null;
  }
}

