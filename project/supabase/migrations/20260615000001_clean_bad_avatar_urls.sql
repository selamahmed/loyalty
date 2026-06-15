-- Remove old DiceBear URLs that contain unsupported query params.
UPDATE public.profiles
SET avatar_url = NULL
WHERE avatar_url LIKE '%scale=%'
   OR avatar_url LIKE '%flip=%'
   OR avatar_url LIKE '%rotate=%'
   OR avatar_url LIKE '%translateX=%'
   OR avatar_url LIKE '%translateY=%'
   OR avatar_url LIKE '%radius=%';
