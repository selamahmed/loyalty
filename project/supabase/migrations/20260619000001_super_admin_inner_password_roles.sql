-- Super-admin role management with an inner password for revokes.
--
-- Direct edits in Supabase Table Editor are intentionally blocked by
-- protect_profile_privileged_fields(). Use these RPCs or the admin UI.

create extension if not exists pgcrypto;

create table if not exists public.super_admin_inner_passwords (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  password_hash text not null,
  updated_at timestamptz not null default now()
);

alter table public.super_admin_inner_passwords enable row level security;
revoke all on public.super_admin_inner_passwords from public;
revoke all on public.super_admin_inner_passwords from anon;
revoke all on public.super_admin_inner_passwords from authenticated;

drop policy if exists "No direct inner password access" on public.super_admin_inner_passwords;
create policy "No direct inner password access"
  on public.super_admin_inner_passwords for all
  using (false)
  with check (false);

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

grant execute on function public.is_super_admin() to authenticated;

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

create or replace function public.super_admin_set_inner_password(p_password text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Only active super admins can set an inner password';
  end if;

  if p_password is null or length(p_password) < 8 or length(p_password) > 128 then
    raise exception 'Inner password must be between 8 and 128 characters';
  end if;

  insert into public.super_admin_inner_passwords (user_id, password_hash, updated_at)
  values (auth.uid(), crypt(p_password, gen_salt('bf', 12)), now())
  on conflict (user_id) do update
    set password_hash = excluded.password_hash,
        updated_at = now();
end;
$$;

revoke all on function public.super_admin_set_inner_password(text) from public;
grant execute on function public.super_admin_set_inner_password(text) to authenticated;

do $$
begin
  if to_regtype('public.user_role') is not null then
    execute 'drop function if exists public.admin_set_user_role(uuid, public.user_role)';
  end if;
end $$;

drop function if exists public.admin_set_user_role(uuid, text);
drop function if exists public.admin_set_user_role(uuid, text, text);

create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role text,
  p_inner_password text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_role text;
  v_actor_status text;
  v_target_role text;
  v_requested text := lower(trim(coalesce(p_role, '')));
  v_role text;
  v_role_type text;
  v_enum_labels text[];
  v_password_hash text;
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

  select role::text
    into v_target_role
  from public.profiles
  where id = p_user_id
  for update;

  if v_target_role is null then
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

  -- Revoking elevated access requires the super-admin inner password.
  if v_role in ('customer', 'user') and v_target_role in ('admin', 'store_admin', 'super_admin', 'cashier') then
    select password_hash
      into v_password_hash
    from public.super_admin_inner_passwords
    where user_id = auth.uid();

    if v_password_hash is null then
      raise exception 'Inner password is not configured';
    end if;

    if p_inner_password is null or crypt(p_inner_password, v_password_hash) <> v_password_hash then
      raise exception 'Invalid inner password';
    end if;
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

revoke all on function public.admin_set_user_role(uuid, text, text) from public;
grant execute on function public.admin_set_user_role(uuid, text, text) to authenticated;

-- Compatibility wrapper for promote actions that do not need inner password.
create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role text
)
returns void
language sql
security definer
set search_path = public
as $$
  select public.admin_set_user_role(p_user_id, p_role, null);
$$;

revoke all on function public.admin_set_user_role(uuid, text) from public;
grant execute on function public.admin_set_user_role(uuid, text) to authenticated;

-- One-time owner bootstrap through the same privileged trigger flag.
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
