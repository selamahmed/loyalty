-- ============================================================================
-- DiceBear Open Peeps Avatar System - Supabase Migration
-- ============================================================================
-- This migration adds avatar_seed column to the profiles table to support
-- the new DiceBear Open Peeps avatar system.
--
-- RUN THIS IN YOUR SUPABASE SQL EDITOR
-- ============================================================================

-- 1. Add avatar_seed column to profiles table (if not exists)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_seed text;

-- 2. Add comment for clarity
COMMENT ON COLUMN public.profiles.avatar_seed IS 'DiceBear Open Peeps avatar seed. Used to generate consistent avatars. Same seed always generates the same avatar.';

-- 3. Ensure RLS policy allows users to update their own avatar fields
-- The existing RLS policy should already allow this, but verify:
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- If no UPDATE policy exists for authenticated users, add one:
-- (This is typically already in place, but shown for reference)
-- CREATE POLICY "Users can update their own profile" ON public.profiles
--   FOR UPDATE
--   USING (auth.uid() = id)
--   WITH CHECK (auth.uid() = id);

-- 4. Optional: Set default avatar_seed for existing profiles without one
-- This generates a seed from the username or email
-- UPDATE public.profiles
-- SET avatar_seed = COALESCE(
--   NULLIF(username, ''),
--   SPLIT_PART(email, '@', 1),
--   id
-- )
-- WHERE avatar_seed IS NULL;

-- 5. Verify the changes
-- SELECT id, username, email, avatar_url, avatar_seed FROM public.profiles LIMIT 5;
