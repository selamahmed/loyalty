-- Connect Admin Inventory Management to Supabase redemptions/rewards.
-- Safe to run multiple times in Supabase SQL Editor.

create extension if not exists pgcrypto;

alter table public.redemptions enable row level security;

drop policy if exists "Admins manage all redemptions" on public.redemptions;
create policy "Admins manage all redemptions"
  on public.redemptions for all
  using (public.is_cashier_or_admin())
  with check (public.is_cashier_or_admin());

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
  v_code text := upper(trim(coalesce(p_code, '')));
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
      v_code := upper(replace(substr(gen_random_uuid()::text, 1, 13), '-', ''));
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
        if v_try >= 8 then
          raise exception 'Could not generate unique inventory code';
        end if;
    end;
  end loop;
end;
$$;

create or replace function public.admin_update_inventory_item(
  p_redemption_id uuid,
  p_type text,
  p_title text,
  p_description text default null,
  p_code text default null,
  p_used boolean default false,
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
  v_redemption public.redemptions%rowtype;
  v_type text := lower(trim(coalesce(p_type, 'reward')));
  v_code text := upper(trim(coalesce(p_code, '')));
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  perform public.assert_user_active(auth.uid());

  if not public.is_admin() then
    raise exception 'Only admins can update inventory items';
  end if;

  if p_redemption_id is null then
    raise exception 'Redemption id is required';
  end if;

  if nullif(trim(coalesce(p_title, '')), '') is null then
    raise exception 'Inventory title is required';
  end if;

  if v_code = '' then
    raise exception 'Inventory code is required';
  end if;

  if v_type not in ('coupon', 'ticket', 'reward') then
    v_type := 'reward';
  end if;

  if p_points is null or p_points < 0 or p_points > 100000 then
    raise exception 'Points must be between 0 and 100000';
  end if;

  select * into v_redemption
  from public.redemptions
  where id = p_redemption_id
  for update;

  if v_redemption.id is null then
    raise exception 'Inventory item not found';
  end if;

  update public.rewards
  set
    title = left(trim(p_title), 160),
    description = left(coalesce(p_description, ''), 1000),
    category = v_type,
    image = nullif(trim(coalesce(p_image, '')), ''),
    points = p_points,
    expires_at = p_expires_at,
    updated_at = now()
  where id = v_redemption.reward_id;

  update public.redemptions
  set
    code = v_code,
    barcode = nullif(trim(coalesce(p_barcode, '')), ''),
    used = coalesce(p_used, false),
    used_at = case
      when coalesce(p_used, false) and used_at is null then now()
      when not coalesce(p_used, false) then null
      else used_at
    end,
    expires_at = p_expires_at,
    points_spent = p_points
  where id = p_redemption_id
  returning * into v_redemption;

  return v_redemption;
end;
$$;

revoke all on function public.admin_create_inventory_item(uuid, text, text, text, text, integer, text, timestamptz, text) from public;
revoke all on function public.admin_create_inventory_item(uuid, text, text, text, text, integer, text, timestamptz, text) from anon;
grant execute on function public.admin_create_inventory_item(uuid, text, text, text, text, integer, text, timestamptz, text) to authenticated;

revoke all on function public.admin_update_inventory_item(uuid, text, text, text, text, boolean, integer, text, timestamptz, text) from public;
revoke all on function public.admin_update_inventory_item(uuid, text, text, text, text, boolean, integer, text, timestamptz, text) from anon;
grant execute on function public.admin_update_inventory_item(uuid, text, text, text, text, boolean, integer, text, timestamptz, text) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.redemptions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
