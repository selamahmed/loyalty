-- Auto-ban profiles that put adult / +18 words in username or bio.
-- Keeps RLS enabled and works with the existing profiles.status ban system.

create or replace function public.profile_has_adult_content(
  p_username text,
  p_bio text
)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
declare
  v_text text;
begin
  v_text := lower(coalesce(p_username, '') || ' ' || coalesce(p_bio, ''));

  return v_text ~* '(^|[^a-z0-9])(porn|porno|xxx|nsfw|onlyfans|escort|eskort|nude|naked|nudes|hentai|fetish|bdsm|anal|orgasm|blowjob|handjob|pussy|penis|dick|cock|cum|slut|whore|milf|rape|seks|cinsel|ciplak|amcik|amcuk|yarrak|yarak|orospu|sikerim|sikeyim|siktir|sikis|sikim|sikini|sikiyor|sikmek|siken|sikici)([^a-z0-9]|$)';
end;
$$;

create or replace function public.moderate_profile_adult_content()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.profile_has_adult_content(new.username, new.bio) then
    new.status := 'deleted';
  end if;

  return new;
end;
$$;

drop trigger if exists aaa_moderate_profile_adult_content on public.profiles;
create trigger aaa_moderate_profile_adult_content
  before insert or update on public.profiles
  for each row execute function public.moderate_profile_adult_content();

-- Keep privileged-field protection, but allow the moderation trigger to ban
-- the same profile update that contains blocked content.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_auto_content_ban boolean;
begin
  v_auto_content_ban :=
    new.status::text = 'deleted'
    and new.role is not distinct from old.role
    and public.profile_has_adult_content(new.username, new.bio);

  if (
    new.role is distinct from old.role
    or new.status is distinct from old.status
  )
  and coalesce(current_setting('app.profile_privileged_rpc', true), '') <> 'on'
  and coalesce(current_setting('app.allow_profile_privileged_update', true), '') <> 'on'
  and coalesce(auth.role(), '') <> 'service_role'
  and not v_auto_content_ban then
    raise exception 'Use privileged RPC to change role or account status';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- RLS still blocks normal users from changing role/status, except when the
-- moderation trigger changes their own status to deleted for blocked content.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role is not distinct from (select p.role from public.profiles p where p.id = auth.uid())
    and (
      status is not distinct from (select p.status from public.profiles p where p.id = auth.uid())
      or (
        status::text = 'deleted'
        and public.profile_has_adult_content(username, bio)
      )
    )
  );

-- Backfill moderation for existing profiles.
do $$
begin
  perform set_config('app.allow_profile_privileged_update', 'on', true);

  update public.profiles
  set status = 'deleted',
      updated_at = now()
  where status::text <> 'deleted'
    and public.profile_has_adult_content(username, bio);

  perform set_config('app.allow_profile_privileged_update', '', true);
exception
  when others then
    perform set_config('app.allow_profile_privileged_update', '', true);
    raise;
end;
$$;

grant execute on function public.profile_has_adult_content(text, text) to authenticated;
