-- ─────────────────────────────────────────────────────────────────────────
-- patch_avatars_bucket.sql
-- Run once in Supabase SQL Editor to enable avatar uploads.
-- ─────────────────────────────────────────────────────────────────────────

-- 1. Create the storage bucket (public so URLs are accessible without auth)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,               -- public bucket → no signed URLs needed
  5242880,            -- 5 MB max per file
  array['image/jpeg','image/png','image/webp','image/gif']
)
on conflict (id) do update
  set public             = true,
      file_size_limit    = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif'];

-- 2. RLS policies on storage.objects for the "avatars" bucket

-- Anyone (including anon) can read public avatars
create policy "avatars: public read"
  on storage.objects for select
  using ( bucket_id = 'avatars' );

-- Authenticated users can upload only into their own folder  (userId/*)
create policy "avatars: owner insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can overwrite / update their own file
create policy "avatars: owner update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Owners can delete their own file
create policy "avatars: owner delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
