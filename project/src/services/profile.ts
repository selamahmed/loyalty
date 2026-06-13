import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

/**
 * Upload a profile picture to Supabase Storage (bucket: "avatars").
 * Returns the public URL to store in profiles.avatar_url.
 * Overwrites any previous avatar for the same user.
 */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ext  = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
  const path = `${userId}/avatar.${ext}`;

  // upsert = overwrite existing file for the same user
  const { error: upErr } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type });

  if (upErr) throw upErr;

  const { data } = supabase.storage.from('avatars').getPublicUrl(path);
  // Bust CDN cache by appending a timestamp query param
  return `${data.publicUrl}?t=${Date.now()}`;
}

/**
 * Delete the user's uploaded avatar from storage.
 * Call this when the user resets back to the generated avatar.
 */
export async function deleteAvatar(userId: string): Promise<void> {
  // Try common extensions; errors are silently swallowed
  const exts = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
  await Promise.allSettled(
    exts.map(ext => supabase.storage.from('avatars').remove([`${userId}/avatar.${ext}`])),
  );
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function upsertProfile(profile: Database['public']['Tables']['profiles']['Insert']): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ ...profile, updated_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}
