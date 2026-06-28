-- Short, cashier-friendly ticket codes (6 chars) + shared generator.
-- Safe to run in Supabase SQL Editor.

create extension if not exists pgcrypto;

create or replace function public.generate_redemption_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * 32)::int, 1);
  end loop;
  return result;
end;
$$;

grant execute on function public.generate_redemption_code() to authenticated;

-- Keep purchase_reward logic from loyalty_claim_limits; only swap code generation.
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
    v_code := public.generate_redemption_code();
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
      if v_try >= 12 then
        raise exception 'Could not generate unique redemption code';
      end if;
    end;
  end loop;
end;
$$;

grant execute on function public.purchase_reward(uuid) to authenticated;

-- Admin-created inventory items use the same short codes when none supplied.
create or replace function public.admin_create_inventory_item(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_description text default null,
  p_code text default null,
  p_points integer default 0,
  p_image text default null,
  p_expires_at timestamptz default null,
  p_barcode text default null
)
returns public.redemptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(regexp_replace(trim(coalesce(p_code, '')), '[^A-Z0-9]', '', 'g'));
  v_type text := lower(trim(coalesce(p_type, 'reward')));
  v_reward_id uuid;
  v_row public.redemptions%rowtype;
  v_try integer := 0;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  perform public.assert_user_active(auth.uid());

  if not public.is_admin() then
    raise exception 'Only admins can create inventory items';
  end if;

  if p_user_id is null or not exists (select 1 from public.profiles where id = p_user_id) then
    raise exception 'Target user not found';
  end if;

  if nullif(trim(coalesce(p_title, '')), '') is null then
    raise exception 'Inventory title is required';
  end if;

  if v_type not in ('coupon', 'ticket', 'reward') then
    v_type := 'reward';
  end if;

  if p_points is null or p_points < 0 or p_points > 100000 then
    raise exception 'Points must be between 0 and 100000';
  end if;

  insert into public.rewards (
    title,
    description,
    points,
    category,
    image,
    featured,
    limited,
    stock,
    expires_at,
    active
  )
  values (
    left(trim(p_title), 160),
    left(coalesce(p_description, ''), 1000),
    p_points,
    v_type,
    nullif(trim(coalesce(p_image, '')), ''),
    false,
    false,
    1,
    p_expires_at,
    false
  )
  returning id into v_reward_id;

  loop
    v_try := v_try + 1;
    if v_code = '' or v_try > 1 then
      v_code := public.generate_redemption_code();
    end if;

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
        p_user_id,
        v_reward_id,
        p_points,
        v_code,
        nullif(trim(coalesce(p_barcode, '')), ''),
        false,
        coalesce(p_expires_at, now() + interval '90 days')
      )
      returning * into v_row;

      return v_row;
    exception
      when unique_violation then
        if v_try >= 12 then
          raise exception 'Could not generate unique inventory code';
        end if;
    end;
  end loop;
end;
$$;

grant execute on function public.admin_create_inventory_item(uuid, text, text, text, text, integer, text, timestamptz, text) to authenticated;
