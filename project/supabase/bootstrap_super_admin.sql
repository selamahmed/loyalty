-- Emergency bootstrap for the owner account.
-- Run this in Supabase SQL Editor, not in Table Editor.
--
-- Why: Table Editor performs a direct UPDATE, so the
-- protect_profile_privileged_fields() trigger correctly blocks role changes.
-- This block sets the same privileged transaction flags used by secure RPCs,
-- updates the one owner account, then clears the flags.

do $$
declare
  v_owner_id uuid := 'e6e9d2d2-934e-42c4-87ee-58507856b321';
  v_role_type text;
begin
  select format('%I.%I', n.nspname, t.typname)
    into v_role_type
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace cn on cn.oid = c.relnamespace
  join pg_type t on t.oid = a.atttypid
  join pg_namespace n on n.oid = t.typnamespace
  where cn.nspname = 'public'
    and c.relname = 'profiles'
    and a.attname = 'role'
    and not a.attisdropped;

  if v_role_type is null then
    raise exception 'Could not find public.profiles.role';
  end if;

  if not exists (select 1 from public.profiles where id = v_owner_id) then
    raise exception 'Owner profile % was not found in public.profiles', v_owner_id;
  end if;

  perform set_config('app.profile_privileged_rpc', 'on', false);
  perform set_config('app.allow_profile_privileged_update', 'on', false);

  execute format(
    'update public.profiles set role = $1::%s, updated_at = now() where id = $2',
    v_role_type
  )
  using 'super_admin', v_owner_id;

  perform set_config('app.profile_privileged_rpc', '', false);
  perform set_config('app.allow_profile_privileged_update', '', false);
exception
  when others then
    perform set_config('app.profile_privileged_rpc', '', false);
    perform set_config('app.allow_profile_privileged_update', '', false);
    raise;
end $$;

select id, email, role
from public.profiles
where id = 'e6e9d2d2-934e-42c4-87ee-58507856b321';
