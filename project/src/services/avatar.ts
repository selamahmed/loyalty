/**
 * Avatar service - handles avatar operations with Supabase
 */
import { supabase } from '../lib/supabase';
import { buildAvatarUrl, getDefaultAvatarSeed } from '../lib/avatar';
import type { Database } from '../lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Initialize avatar for a user if missing
 * Called on first login/profile fetch
 */
export async function initializeAvatarIfNeeded(
  userId: string,
  userName: string | null | undefined,
  userEmail: string | null | undefined,
): Promise<{ avatar_seed: string; avatar_url: string } | null> {
  if (!userId) return null;

  try {
    // Fetch current profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('avatar_seed, avatar_url')
      .eq('id', userId)
      .maybeSingle();

    if (fetchError) throw fetchError;

    // If avatar already exists, return it
    if (profile?.avatar_seed && profile?.avatar_url) {
      return { avatar_seed: profile.avatar_seed, avatar_url: profile.avatar_url };
    }

    // Generate default seed and URL
    const seed = getDefaultAvatarSeed({
      name: userName,
      email: userEmail,
      id: userId,
    });

    const avatarUrl = buildAvatarUrl(seed);

    // Update profile with new avatar
    const { data: updated, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_seed: seed,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('avatar_seed, avatar_url')
      .single();

    if (updateError) throw updateError;

    return updated ? { avatar_seed: updated.avatar_seed, avatar_url: updated.avatar_url } : null;
  } catch (err) {
    console.error('[Avatar] Failed to initialize avatar:', err);
    return null;
  }
}

/**
 * Update user avatar with new seed
 */
export async function updateAvatar(
  userId: string,
  seed: string,
): Promise<{ avatar_seed: string; avatar_url: string } | null> {
  if (!userId || !seed.trim()) return null;

  try {
    const avatarUrl = buildAvatarUrl(seed);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        avatar_seed: seed,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select('avatar_seed, avatar_url')
      .single();

    if (error) throw error;

    return data ? { avatar_seed: data.avatar_seed, avatar_url: data.avatar_url } : null;
  } catch (err) {
    console.error('[Avatar] Failed to update avatar:', err);
    throw err;
  }
}

/**
 * Get user avatar by ID
 */
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
 * Regenerate avatar from seed (useful for migration)
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
    if (!profile?.avatar_seed) return null;

    const newUrl = buildAvatarUrl(profile.avatar_seed);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: newUrl,
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
