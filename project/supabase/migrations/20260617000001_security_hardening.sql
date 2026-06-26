-- Security hardening for auth roles, RLS, QR claims, and reward redemption.
-- Run this in Supabase SQL Editor after the existing migrations.

create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

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
      and status = 'active'
      and role = 'super_admin'
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
      and status = 'active'
      and role in ('super_admin', 'store_admin')
  );
$$;

create or replace function public.is_cashier_or_admin()
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
      and status = 'active'
      and role in ('cashier', 'store_admin', 'super_admin')
  );
$$;

create or replace function public.assert_user_active(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = p_user_id
      and status = 'active'
  ) then
    raise exception 'Account is not active';
  end if;
end;
$$;

-- New auth users must always start as customers. Never trust raw_user_meta_data.role.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_username text;
begin
  v_username := nullif(trim(coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(coalesce(new.email, ''), '@', 1)
  )), '');

  insert into public.profiles (id, email, username, role, status)
  values (new.id, coalesce(new.email, ''), coalesce(v_username, 'User'), 'customer', 'active')
  on conflict (id) do nothing;

  if to_regclass('public.notifications') is not null then
    insert into public.notifications (user_id, type, title, message, icon, read)
    values (
      new.id,
      'system',
      'Welcome to NesveNext',
      'Your account was created successfully.',
      'star',
      false
    )
    on conflict do nothing;
  end if;

  if to_regclass('public.user_streaks') is not null then
    insert into public.user_streaks (user_id)
    values (new.id)
    on conflict do nothing;
  end if;

  if to_regclass('public.user_settings') is not null then
    insert into public.user_settings (user_id)
    values (new.id)
    on conflict do nothing;
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Block direct role/status tampering. Privileged RPCs set app.allow_profile_privileged_update.
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

create or replace function public.admin_set_user_status(
  p_user_id uuid,
  p_status public.account_status
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor public.profiles%rowtype;
  v_target public.profiles%rowtype;
begin
  if auth.uid() is null and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Not authenticated';
  end if;

  select * into v_actor from public.profiles where id = auth.uid();
  select * into v_target from public.profiles where id = p_user_id for update;

  if v_target.id is null then
    raise exception 'Target user not found';
  end if;

  if coalesce(auth.role(), '') <> 'service_role' then
    if v_actor.id is null or v_actor.status <> 'active' or v_actor.role not in ('super_admin', 'store_admin') then
      raise exception 'Forbidden';
    end if;

    if v_actor.id = p_user_id then
      raise exception 'Cannot change your own account status';
    end if;

    if v_actor.role <> 'super_admin' then
      if p_status = 'deleted' then
        raise exception 'Only super admins can delete users';
      end if;

      if v_target.role not in ('customer', 'cashier') then
        raise exception 'Store admins cannot modify admin accounts';
      end if;
    end if;
  end if;

  perform set_config('app.allow_profile_privileged_update', 'on', true);

  update public.profiles
  set status = p_status,
      updated_at = now()
  where id = p_user_id;

  perform set_config('app.allow_profile_privileged_update', '', true);
end;
$$;

grant execute on function public.admin_set_user_status(uuid, public.account_status) to authenticated;

create or replace function public.admin_set_user_role(
  p_user_id uuid,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor public.profiles%rowtype;
  v_target public.profiles%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_actor from public.profiles where id = auth.uid();
  if v_actor.id is null or v_actor.status <> 'active' or v_actor.role <> 'super_admin' then
    raise exception 'Only active super admins can change roles';
  end if;

  if p_user_id = v_actor.id then
    raise exception 'Cannot change your own role';
  end if;

  select * into v_target from public.profiles where id = p_user_id for update;
  if v_target.id is null then
    raise exception 'Target user not found';
  end if;

  perform set_config('app.allow_profile_privileged_update', 'on', true);

  update public.profiles
  set role = p_role,
      updated_at = now()
  where id = p_user_id;

  perform set_config('app.allow_profile_privileged_update', '', true);
end;
$$;

grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;

-- Low-level point primitives are internal only. Feature-specific RPCs below are granted.
create or replace function public.add_points(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_category text default null,
  p_reference_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount is null or p_amount <= 0 or p_amount > 100000 then
    raise exception 'Invalid point amount';
  end if;

  perform public.assert_user_active(p_user_id);

  update public.profiles
  set current_points = current_points + p_amount,
      total_points = total_points + p_amount,
      updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;

  insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
  values (
    p_user_id,
    'earned',
    p_amount,
    left(coalesce(p_description, 'Points earned'), 500),
    left(coalesce(p_category, 'system'), 80),
    left(p_reference_id, 120)
  );

  if p_amount > 0
     and p_category in ('cashier_manual', 'admin_adjustment')
     and exists (
       select 1
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname = 'add_event_points_internal'
     ) then
    execute 'select public.add_event_points_internal($1, $2)' using p_user_id, p_amount;
  end if;
end;
$$;

revoke all on function public.add_points(uuid, integer, text, text, text) from public;
revoke all on function public.add_points(uuid, integer, text, text, text) from anon;
revoke all on function public.add_points(uuid, integer, text, text, text) from authenticated;

create or replace function public.spend_points(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_reference_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current integer;
begin
  if p_amount is null or p_amount <= 0 or p_amount > 100000 then
    raise exception 'Invalid point amount';
  end if;

  if auth.uid() is distinct from p_user_id and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  perform public.assert_user_active(p_user_id);

  select current_points into v_current
  from public.profiles
  where id = p_user_id
  for update;

  if v_current is null then
    raise exception 'User not found';
  end if;

  if v_current < p_amount then
    raise exception 'Insufficient points';
  end if;

  update public.profiles
  set current_points = current_points - p_amount,
      updated_at = now()
  where id = p_user_id;

  insert into public.points_transactions(user_id, type, amount, description, reference_id)
  values (
    p_user_id,
    'spent',
    p_amount,
    left(coalesce(p_description, 'Points spent'), 500),
    left(p_reference_id, 120)
  );
end;
$$;

revoke all on function public.spend_points(uuid, integer, text, text) from public;
revoke all on function public.spend_points(uuid, integer, text, text) from anon;
revoke all on function public.spend_points(uuid, integer, text, text) from authenticated;

create or replace function public.admin_adjust_points(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_category text default 'admin_adjustment',
  p_reference_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor public.profiles%rowtype;
  v_target public.profiles%rowtype;
  v_type public.transaction_type;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if p_amount is null or p_amount = 0 or abs(p_amount) > 100000 then
    raise exception 'Invalid point adjustment';
  end if;

  select * into v_actor from public.profiles where id = auth.uid();
  if v_actor.id is null or v_actor.status <> 'active' or v_actor.role not in ('cashier', 'store_admin', 'super_admin') then
    raise exception 'Only active cashiers and admins can adjust points';
  end if;

  if v_actor.role = 'cashier' and p_amount < 0 then
    raise exception 'Cashiers cannot deduct points';
  end if;

  select * into v_target from public.profiles where id = p_user_id for update;
  if v_target.id is null or v_target.status <> 'active' then
    raise exception 'Target account is not active';
  end if;

  v_type := case when p_amount > 0 then 'earned'::public.transaction_type else 'adjusted'::public.transaction_type end;

  update public.profiles
  set current_points = greatest(current_points + p_amount, 0),
      total_points = case when p_amount > 0 then total_points + p_amount else total_points end,
      updated_at = now()
  where id = p_user_id;

  insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
  values (
    p_user_id,
    v_type,
    p_amount,
    left(coalesce(p_description, 'Point adjustment'), 500),
    left(coalesce(p_category, 'admin_adjustment'), 80),
    left(p_reference_id, 120)
  );

  if p_amount > 0
     and coalesce(p_category, '') in ('cashier_manual', 'admin_adjustment')
     and exists (
       select 1
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname = 'add_event_points_internal'
     ) then
    execute 'select public.add_event_points_internal($1, $2)' using p_user_id, p_amount;
  end if;
end;
$$;

grant execute on function public.admin_adjust_points(uuid, integer, text, text, text) to authenticated;

create or replace function public.purchase_reward(p_reward_id uuid)
returns public.redemptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_reward public.rewards%rowtype;
  v_redemption public.redemptions%rowtype;
  v_code text;
  v_barcode text;
  v_try integer := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_profile
  from public.profiles
  where id = v_user_id
  for update;

  if v_profile.id is null or v_profile.status <> 'active' then
    raise exception 'Account is not active';
  end if;

  select * into v_reward
  from public.rewards
  where id = p_reward_id
    and active = true
  for update;

  if v_reward.id is null then
    raise exception 'Reward not found or inactive';
  end if;

  if v_reward.expires_at is not null and v_reward.expires_at < now() then
    raise exception 'Reward expired';
  end if;

  if v_reward.points is null or v_reward.points <= 0 then
    raise exception 'Reward has invalid point cost';
  end if;

  if v_reward.stock is not null and v_reward.stock <= 0 then
    raise exception 'Reward out of stock';
  end if;

  if v_profile.current_points < v_reward.points then
    raise exception 'Insufficient points';
  end if;

  update public.profiles
  set current_points = current_points - v_reward.points,
      updated_at = now()
  where id = v_user_id;

  update public.rewards
  set stock = case when stock is null then null else greatest(stock - 1, 0) end,
      updated_at = now()
  where id = p_reward_id;

  insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
  values (
    v_user_id,
    'spent',
    v_reward.points,
    left('Reward: ' || v_reward.title, 500),
    'reward_purchase',
    p_reward_id::text
  );

  loop
    v_try := v_try + 1;
    v_code := upper(replace(substr(gen_random_uuid()::text, 1, 13), '-', ''));
    v_barcode := lpad(floor(random() * 10000000000000)::bigint::text, 13, '0');

    begin
      insert into public.redemptions (
        user_id,
        reward_id,
        points_spent,
        code,
        barcode,
        used,
        expires_at
      )
      values (
        v_user_id,
        p_reward_id,
        v_reward.points,
        v_code,
        v_barcode,
        false,
        coalesce(v_reward.expires_at, now() + interval '90 days')
      )
      returning * into v_redemption;

      return v_redemption;
    exception when unique_violation then
      if v_try >= 8 then
        raise exception 'Could not generate unique redemption code';
      end if;
    end;
  end loop;
end;
$$;

grant execute on function public.purchase_reward(uuid) to authenticated;

create or replace function public.claim_qr_scan(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_code, '')));
  v_qr public.qr_codes%rowtype;
  v_points integer := 0;
  v_xp integer := 0;
  v_ratio integer := 1;
  v_is_cashier boolean := false;
  v_level_result jsonb := '{}'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_code !~ '^[A-Z0-9_-]{4,64}$' then
    raise exception 'Invalid QR code';
  end if;

  perform public.assert_user_active(v_user_id);

  select * into v_qr
  from public.qr_codes
  where upper(trim(code)) = v_code
    and active = true
  for update;

  if v_qr.id is null then
    raise exception 'QR code not found or inactive';
  end if;

  if v_qr.expires_at is not null and v_qr.expires_at < now() then
    raise exception 'QR code expired';
  end if;

  if v_qr.max_uses is not null and v_qr.uses_count >= v_qr.max_uses then
    raise exception 'QR code already used';
  end if;

  if exists (
    select 1
    from public.qr_scans
    where user_id = v_user_id
      and qr_code_id = v_qr.id
  ) then
    raise exception 'QR already scanned by this user';
  end if;

  v_points := greatest(coalesce(v_qr.points, 0), 0);
  if v_points <= 0 or v_points > 100000 then
    raise exception 'QR code has invalid points';
  end if;

  v_is_cashier := coalesce(v_qr.max_uses, 0) = 1 and v_qr.expires_at is not null;

  insert into public.qr_scans (user_id, qr_code_id, points_earned)
  values (v_user_id, v_qr.id, v_points);

  update public.qr_codes
  set uses_count = uses_count + 1,
      active = case
        when max_uses is not null and uses_count + 1 >= max_uses then false
        else active
      end
  where id = v_qr.id;

  perform public.add_points(
    v_user_id,
    v_points,
    coalesce(v_qr.label, 'QR scan'),
    'qr_scan',
    v_qr.id::text
  );

  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'add_event_points_internal'
  ) then
    execute 'select public.add_event_points_internal($1, $2)' using v_user_id, v_points;
  end if;

  -- Cashier purchase QR codes must claim exactly qr_codes.points.
  -- Skip XP level bonuses for those QR codes so they cannot inflate wallet points.
  if not v_is_cashier
     and exists (
       select 1
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname = 'add_xp'
     )
     and exists (
       select 1
       from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public'
         and p.proname = 'app_setting_int'
     ) then
    execute 'select public.app_setting_int($1, $2)' into v_ratio using 'xp_points_ratio', 1;
    v_xp := greatest(floor(v_points * v_ratio)::integer, 0);
    if v_xp > 0 then
      execute 'select public.add_xp($1, $2, $3)' into v_level_result using v_user_id, v_xp, 'qr_scan';
    end if;
  end if;

  return jsonb_build_object(
    'points', v_points,
    'qr_points', v_points,
    'xp', v_xp,
    'capped', false,
    'leveled_up', coalesce((v_level_result->>'leveled_up')::boolean, false),
    'level', coalesce((v_level_result->>'level')::integer, (select level from public.profiles where id = v_user_id)),
    'bonus_points', case when v_is_cashier then 0 else coalesce((v_level_result->>'bonus_points')::integer, 0) end,
    'xp_to_next', coalesce((v_level_result->>'xp_to_next')::integer, (select xp_to_next from public.profiles where id = v_user_id))
  );
end;
$$;

grant execute on function public.claim_qr_scan(text) to authenticated;

create or replace function public.create_cashier_qr(
  p_code text,
  p_points integer,
  p_amount numeric,
  p_expires_at timestamptz
)
returns public.qr_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_code, '')));
  v_row public.qr_codes%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  perform public.assert_user_active(v_user_id);

  if not public.is_cashier_or_admin() then
    raise exception 'Only active cashiers and admins can create cashier QR codes';
  end if;

  if v_code !~ '^[A-Z0-9_-]{4,64}$' then
    raise exception 'Invalid QR code';
  end if;

  if p_points is null or p_points <= 0 or p_points > 100000 then
    raise exception 'QR points must be positive';
  end if;

  if p_amount is null or p_amount <= 0 or p_amount > 1000000 then
    raise exception 'QR amount must be positive';
  end if;

  if p_expires_at is null or p_expires_at <= now() then
    raise exception 'QR expiry must be in the future';
  end if;

  if p_expires_at > now() + interval '1 day' then
    raise exception 'Cashier QR expiry is too far in the future';
  end if;

  insert into public.qr_codes (
    code,
    store_id,
    points,
    label,
    active,
    max_uses,
    uses_count,
    expires_at
  )
  values (
    v_code,
    v_user_id::text,
    p_points,
    'Cashier QR - TRY ' || trim(to_char(p_amount, 'FM999999999990.00')),
    true,
    1,
    0,
    p_expires_at
  )
  returning * into v_row;

  return v_row;
exception
  when unique_violation then
    raise exception 'QR code already exists';
end;
$$;

grant execute on function public.create_cashier_qr(text, integer, numeric, timestamptz) to authenticated;

create or replace function public.lookup_redemption_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  result json;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if v_code !~ '^[A-Z0-9]{4,64}$' then
    raise exception 'Invalid redemption code';
  end if;

  perform public.assert_user_active(auth.uid());

  if not public.is_cashier_or_admin() then
    raise exception 'Only active cashiers and admins can look up redemption codes';
  end if;

  select json_build_object(
    'id', r.id,
    'user_id', r.user_id,
    'reward_id', r.reward_id,
    'code', r.code,
    'used', r.used,
    'used_at', r.used_at,
    'points_spent', r.points_spent,
    'expires_at', r.expires_at,
    'barcode', r.barcode,
    'created_at', r.created_at,
    'profiles', json_build_object('username', p.username, 'email', p.email),
    'rewards', json_build_object(
      'title', rw.title,
      'image', rw.image,
      'category', rw.category,
      'description', rw.description,
      'points', rw.points
    )
  ) into result
  from public.redemptions r
  left join public.profiles p on p.id = r.user_id
  left join public.rewards rw on rw.id = r.reward_id
  where upper(r.code) = v_code
  limit 1;

  return result;
end;
$$;

grant execute on function public.lookup_redemption_by_code(text) to authenticated;

create or replace function public.mark_redemption_used_by_code(p_code text)
returns public.redemptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(trim(coalesce(p_code, '')));
  v_row public.redemptions%rowtype;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if v_code !~ '^[A-Z0-9]{4,64}$' then
    raise exception 'Invalid redemption code';
  end if;

  perform public.assert_user_active(auth.uid());

  if not public.is_cashier_or_admin() then
    raise exception 'Only active cashiers and admins can redeem tickets';
  end if;

  select * into v_row
  from public.redemptions
  where upper(code) = v_code
  for update;

  if v_row.id is null then
    raise exception 'Redemption code not found';
  end if;

  if v_row.used then
    raise exception 'Redemption code already used';
  end if;

  if v_row.expires_at is not null and v_row.expires_at < now() then
    update public.redemptions
    set used = true,
        used_at = coalesce(used_at, now()),
        expires_at = least(coalesce(expires_at, now()), now())
    where id = v_row.id
    returning * into v_row;

    return v_row;
  end if;

  update public.redemptions
  set used = true,
      used_at = now(),
      expires_at = now()
  where id = v_row.id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.mark_redemption_used_by_code(text) to authenticated;

-- RLS policy hardening.
drop policy if exists "Users read own profile" on public.profiles;
drop policy if exists "Admins read all profiles" on public.profiles;
drop policy if exists "Cashiers read active customer profiles" on public.profiles;

create policy "Users read own profile"
  on public.profiles for select
  using (id = auth.uid());

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Cashiers read active customer profiles"
  on public.profiles for select
  using (
    public.is_cashier_or_admin()
    and status = 'active'
    and role = 'customer'
  );

drop policy if exists "Users insert own redemptions" on public.redemptions;
drop policy if exists "Active users insert redemptions" on public.redemptions;
drop policy if exists "Users update own redemptions" on public.redemptions;
drop policy if exists "No direct client redemption inserts" on public.redemptions;
drop policy if exists "No direct client redemption updates" on public.redemptions;

create policy "No direct client redemption inserts"
  on public.redemptions for insert
  with check (false);

create policy "No direct client redemption updates"
  on public.redemptions for update
  using (false)
  with check (false);

drop policy if exists "Users see own transactions" on public.points_transactions;
drop policy if exists "Service role inserts transactions" on public.points_transactions;
drop policy if exists "No direct client transaction inserts" on public.points_transactions;

create policy "Users see own transactions"
  on public.points_transactions for select
  using (
    user_id = auth.uid()
    or public.is_admin()
    or (
      public.is_cashier_or_admin()
      and category in ('qr_scan', 'cashier_manual', 'admin_adjustment')
    )
  );

create policy "No direct client transaction inserts"
  on public.points_transactions for insert
  with check (false);

drop policy if exists "Anyone reads active QR codes" on public.qr_codes;
drop policy if exists "Privileged users read QR codes" on public.qr_codes;

create policy "Privileged users read QR codes"
  on public.qr_codes for select
  using (public.is_cashier_or_admin());

drop policy if exists "Cashiers create cashier QR codes" on public.qr_codes;
create policy "Cashiers create cashier QR codes"
  on public.qr_codes for insert
  with check (
    auth.uid() is not null
    and store_id = auth.uid()::text
    and active = true
    and max_uses = 1
    and uses_count = 0
    and expires_at is not null
    and expires_at > now()
    and expires_at <= now() + interval '1 day'
    and points > 0
    and points <= 100000
    and public.is_cashier_or_admin()
  );

drop policy if exists "Users see own QR scans" on public.qr_scans;
drop policy if exists "Users insert QR scans" on public.qr_scans;
drop policy if exists "Active users insert qr_scans" on public.qr_scans;
drop policy if exists "No direct client QR scan inserts" on public.qr_scans;

create policy "Users see own QR scans"
  on public.qr_scans for select
  using (user_id = auth.uid() or public.is_cashier_or_admin());

create policy "No direct client QR scan inserts"
  on public.qr_scans for insert
  with check (false);

drop policy if exists "Users insert logs" on public.activity_logs;
drop policy if exists "Users insert own logs" on public.activity_logs;
create policy "Users insert own logs"
  on public.activity_logs for insert
  with check (
    auth.uid() is not null
    and user_id = auth.uid()
  );

drop policy if exists "Super admins manage app_settings" on public.app_settings;
create policy "Super admins manage app_settings"
  on public.app_settings for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Super admins manage daily_reward_config" on public.daily_reward_config;
create policy "Super admins manage daily_reward_config"
  on public.daily_reward_config for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

drop policy if exists "Super admins manage games_config" on public.games_config;
create policy "Super admins manage games_config"
  on public.games_config for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

do $$
begin
  if not exists (
    select 1
    from public.qr_scans
    group by user_id, qr_code_id
    having count(*) > 1
  ) then
    create unique index if not exists qr_scans_user_qr_unique_idx
      on public.qr_scans(user_id, qr_code_id);
  end if;
end $$;
