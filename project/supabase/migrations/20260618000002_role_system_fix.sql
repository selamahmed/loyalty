-- Role system repair.
-- Source of truth: public.profiles.role.
-- Do not disable RLS and do not trust auth user_metadata/app_metadata for roles.

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text = 'super_admin'
      and coalesce(status::text, 'active') = 'active'
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role::text in ('admin', 'store_admin', 'super_admin')
      and coalesce(status::text, 'active') = 'active'
  );
$$;

grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.is_admin() to authenticated;

-- Keep the existing security trigger, but allow the documented privileged RPC flag.
create or replace function public.protect_profile_privileged_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (
    new.role is distinct from old.role
    or new.status is distinct from old.status
  )
  and coalesce(current_setting('app.profile_privileged_rpc', true), '') <> 'on'
  and coalesce(current_setting('app.allow_profile_privileged_update', true), '') <> 'on'
  and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Use privileged RPC to change role or account status';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_privileged_fields on public.profiles;
create trigger protect_profile_privileged_fields
  before update on public.profiles
  for each row execute function public.protect_profile_privileged_fields();

-- Replace the enum-only overload with a text RPC that safely maps UI aliases.
do $$
begin
  if to_regtype('public.user_role') is not null then
    execute 'drop function if exists public.admin_set_user_role(uuid, public.user_role)';
  end if;
end $$;

drop function if exists public.admin_set_user_role(uuid, text, text);
drop function if exists public.admin_set_user_role(uuid, text);

create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text;
  v_actor_status text;
  v_target_exists boolean;
  v_requested text := lower(trim(coalesce(p_role, '')));
  v_role text;
  v_role_type text;
  v_enum_labels text[];
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select role::text, coalesce(status::text, 'active')
    into v_actor_role, v_actor_status
  from public.profiles
  where id = auth.uid();

  if v_actor_role is distinct from 'super_admin' or v_actor_status is distinct from 'active' then
    raise exception 'Only active super admins can change roles';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Cannot change your own role';
  end if;

  perform 1 from public.profiles where id = p_user_id for update;
  v_target_exists := found;

  if not v_target_exists then
    raise exception 'Target user not found';
  end if;

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
    raise exception 'profiles.role column not found';
  end if;

  select array_agg(e.enumlabel::text order by e.enumsortorder)
    into v_enum_labels
  from pg_attribute a
  join pg_class c on c.oid = a.attrelid
  join pg_namespace cn on cn.oid = c.relnamespace
  join pg_type t on t.oid = a.atttypid
  join pg_enum e on e.enumtypid = t.oid
  where cn.nspname = 'public'
    and c.relname = 'profiles'
    and a.attname = 'role'
    and not a.attisdropped;

  if v_requested in ('user', 'customer') then
    v_role := case
      when v_enum_labels is not null and 'customer' = any(v_enum_labels) then 'customer'
      when v_enum_labels is not null and 'user' = any(v_enum_labels) then 'user'
      else 'customer'
    end;
  elsif v_requested in ('admin', 'store_admin') then
    v_role := case
      when v_enum_labels is not null and 'store_admin' = any(v_enum_labels) then 'store_admin'
      when v_enum_labels is not null and 'admin' = any(v_enum_labels) then 'admin'
      else 'admin'
    end;
  elsif v_requested in ('super_admin', 'cashier') then
    v_role := v_requested;
  else
    raise exception 'Invalid role';
  end if;

  if v_enum_labels is not null and not (v_role = any(v_enum_labels)) then
    raise exception 'Role % is not available in profiles.role enum', v_role;
  end if;

  perform set_config('app.profile_privileged_rpc', 'on', true);
  perform set_config('app.allow_profile_privileged_update', 'on', true);

  execute format(
    'update public.profiles set role = $1::%s, updated_at = now() where id = $2',
    v_role_type
  )
  using v_role, p_user_id;

  perform set_config('app.profile_privileged_rpc', '', true);
  perform set_config('app.allow_profile_privileged_update', '', true);
exception
  when others then
    perform set_config('app.profile_privileged_rpc', '', true);
    perform set_config('app.allow_profile_privileged_update', '', true);
    raise;
end;
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;

-- Make sure normal users still cannot update privileged fields directly.
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role is not distinct from (select p.role from public.profiles p where p.id = auth.uid())
    and status is not distinct from (select p.status from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Admins read all profiles" on public.profiles;
create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- Bootstrap the known owner account once. This is a SQL-editor/server-side update
-- protected by the same privileged flag the trigger requires.
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
    raise exception 'profiles.role column not found';
  end if;

  if exists (select 1 from public.profiles where id = v_owner_id) then
    perform set_config('app.profile_privileged_rpc', 'on', true);
    perform set_config('app.allow_profile_privileged_update', 'on', true);

    execute format(
      'update public.profiles set role = $1::%s, updated_at = now() where id = $2',
      v_role_type
    )
    using 'super_admin', v_owner_id;

    perform set_config('app.profile_privileged_rpc', '', true);
    perform set_config('app.allow_profile_privileged_update', '', true);
  end if;
exception
  when others then
    perform set_config('app.profile_privileged_rpc', '', true);
    perform set_config('app.allow_profile_privileged_update', '', true);
    raise;
end $$;

notify pgrst, 'reload schema';
