-- Loyalty claim limits and ticket validity controls.
-- Run in Supabase SQL Editor after previous migrations.

insert into public.app_settings (key, value, description, category) values
  ('points_limit_enabled', 'true'::jsonb, 'Enable maximum loyalty points claim limit', 'loyalty'),
  ('max_points_limit', '1200'::jsonb, 'Maximum current loyalty points a user can hold from claims', 'loyalty'),
  ('ticket_valid_for', '24'::jsonb, 'Default ticket validity duration', 'loyalty'),
  ('ticket_time_unit', '"hours"'::jsonb, 'Ticket validity unit: minutes, hours, or days', 'loyalty')
on conflict (key) do nothing;

create or replace function public.app_setting_bool(p_key text, p_default boolean)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
  s text;
begin
  select value into v from public.app_settings where key = p_key limit 1;
  if v is null then
    return p_default;
  end if;

  if jsonb_typeof(v) = 'boolean' then
    return (v #>> '{}')::boolean;
  end if;

  s := lower(trim(both '"' from v::text));
  if s in ('true', '1', 'yes', 'on') then return true; end if;
  if s in ('false', '0', 'no', 'off') then return false; end if;
  return p_default;
exception when others then
  return p_default;
end;
$$;

create or replace function public.loyalty_ticket_expires_at(p_reward_expires_at timestamptz default null)
returns timestamptz
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_amount integer := public.app_setting_int('ticket_valid_for', 24);
  v_unit text := 'hours';
  v_default_expires timestamptz;
begin
  select lower(trim(both '"' from value::text))
  into v_unit
  from public.app_settings
  where key = 'ticket_time_unit'
  limit 1;

  if v_unit not in ('minutes', 'hours', 'days') then
    v_unit := 'hours';
  end if;

  v_amount := greatest(coalesce(v_amount, 24), 1);

  v_default_expires := case v_unit
    when 'minutes' then now() + make_interval(mins => v_amount)
    when 'days' then now() + make_interval(days => v_amount)
    else now() + make_interval(hours => v_amount)
  end;

  if p_reward_expires_at is null then
    return v_default_expires;
  end if;

  return least(p_reward_expires_at, v_default_expires);
end;
$$;

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
declare
  v_current_points integer := 0;
  v_limit_enabled boolean := public.app_setting_bool('points_limit_enabled', true);
  v_max_points integer := public.app_setting_int('max_points_limit', 1200);
begin
  if p_user_id is null then
    raise exception 'User is required';
  end if;

  perform public.assert_user_active(p_user_id);

  if p_amount is null or p_amount = 0 then
    return;
  end if;

  select current_points
  into v_current_points
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'User not found';
  end if;

  if p_amount > 0 and v_limit_enabled and v_max_points > 0 then
    if v_current_points >= v_max_points then
      raise exception 'You have reached the maximum loyalty points limit of % points. You cannot claim more points at this time.', v_max_points;
    end if;

    if v_current_points + p_amount > v_max_points then
      raise exception 'This claim would exceed the maximum loyalty points limit of % points.', v_max_points;
    end if;
  end if;

  update public.profiles
  set
    current_points = greatest(current_points + p_amount, 0),
    total_points = case when p_amount > 0 then total_points + p_amount else total_points end,
    updated_at = now()
  where id = p_user_id;

  insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
  values (
    p_user_id,
    case when p_amount > 0 then 'earned' else 'adjusted' end,
    abs(p_amount),
    left(coalesce(p_description, 'Points update'), 500),
    p_category,
    p_reference_id
  );

  if p_amount > 0
     and p_category in ('cashier_manual', 'admin_adjustment')
     and exists (
       select 1 from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'add_event_points_internal'
     ) then
    execute 'select public.add_event_points_internal($1, $2)' using p_user_id, p_amount;
  end if;
end;
$$;

revoke all on function public.add_points(uuid, integer, text, text, text) from public;
revoke all on function public.add_points(uuid, integer, text, text, text) from anon;
revoke all on function public.add_points(uuid, integer, text, text, text) from authenticated;

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
  v_ticket_expires_at timestamptz;
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

  v_ticket_expires_at := public.loyalty_ticket_expires_at(v_reward.expires_at);

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
        v_ticket_expires_at
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
grant execute on function public.app_setting_bool(text, boolean) to authenticated;
grant execute on function public.loyalty_ticket_expires_at(timestamptz) to authenticated;
