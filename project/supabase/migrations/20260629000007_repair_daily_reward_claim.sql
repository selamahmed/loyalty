-- Repair daily reward claiming so the live database has every dependency the
-- RPC needs and the claim path cannot fail because an older helper function is
-- missing or stricter than the daily reward flow.

create extension if not exists pgcrypto;

create table if not exists public.app_settings (
  key text primary key,
  value jsonb not null,
  description text,
  category text not null default 'system',
  updated_at timestamptz not null default now()
);

insert into public.app_settings (key, value, description, category) values
  ('points_limit_enabled', 'true'::jsonb, 'Enable maximum loyalty points claim limit', 'loyalty'),
  ('max_points_limit', '1200'::jsonb, 'Maximum current loyalty points a user can hold from claims', 'loyalty'),
  ('max_daily_points', '1000'::jsonb, 'Maximum daily points from daily reward claims', 'economy'),
  ('max_daily_xp', '500'::jsonb, 'Maximum daily XP from daily reward claims', 'economy'),
  ('xp_points_ratio', '1'::jsonb, 'XP earned per point for daily reward claims', 'economy')
on conflict (key) do nothing;

create or replace function public.app_setting_int(p_key text, p_default integer)
returns integer
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

  if jsonb_typeof(v) = 'number' then
    return greatest((v #>> '{}')::integer, 0);
  end if;

  s := trim(both '"' from v::text);
  if s ~ '^[0-9]+$' then
    return greatest(s::integer, 0);
  end if;

  return p_default;
exception when others then
  return p_default;
end;
$$;

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

create table if not exists public.user_streaks (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_claim_date date,
  updated_at timestamptz not null default now()
);

alter table public.user_streaks
  add column if not exists current_streak integer not null default 0,
  add column if not exists longest_streak integer not null default 0,
  add column if not exists last_claim_date date,
  add column if not exists updated_at timestamptz not null default now();

alter table public.user_streaks enable row level security;

drop policy if exists "Users read own streak" on public.user_streaks;
create policy "Users read own streak"
  on public.user_streaks for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Admins manage streaks" on public.user_streaks;
create policy "Admins manage streaks"
  on public.user_streaks for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.user_daily_earnings (
  user_id uuid not null references public.profiles(id) on delete cascade,
  earn_date date not null default (timezone('utc', now()))::date,
  points_earned integer not null default 0 check (points_earned >= 0),
  xp_earned integer not null default 0 check (xp_earned >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_daily_earnings
  add column if not exists earn_date date,
  add column if not exists points_earned integer not null default 0,
  add column if not exists xp_earned integer not null default 0,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

update public.user_daily_earnings
set earn_date = (timezone('utc', now()))::date
where earn_date is null;

delete from public.user_daily_earnings
where user_id is null;

delete from public.user_daily_earnings a
using public.user_daily_earnings b
where a.ctid < b.ctid
  and a.user_id = b.user_id
  and a.earn_date = b.earn_date;

alter table public.user_daily_earnings
  alter column user_id set not null,
  alter column earn_date set not null,
  alter column points_earned set default 0,
  alter column xp_earned set default 0;

create unique index if not exists user_daily_earnings_user_date_uidx
  on public.user_daily_earnings(user_id, earn_date);

alter table public.user_daily_earnings enable row level security;

drop policy if exists "Users read own daily earnings" on public.user_daily_earnings;
create policy "Users read own daily earnings"
  on public.user_daily_earnings for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "System writes daily earnings" on public.user_daily_earnings;
create policy "System writes daily earnings"
  on public.user_daily_earnings for all
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists public.daily_reward_config (
  id uuid primary key default gen_random_uuid(),
  day_number integer unique not null check (day_number between 1 and 31),
  points integer not null default 0 check (points >= 0 and points <= 100000),
  bonus_type text not null default 'points',
  bonus_value jsonb not null default '{}'::jsonb,
  is_special boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_reward_config enable row level security;

drop policy if exists "All users read daily_reward_config" on public.daily_reward_config;
create policy "All users read daily_reward_config"
  on public.daily_reward_config for select
  using (true);

drop policy if exists "Admins manage daily_reward_config" on public.daily_reward_config;
create policy "Admins manage daily_reward_config"
  on public.daily_reward_config for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.daily_reward_config (day_number, points, bonus_type, bonus_value, is_special, enabled) values
  (1, 50,   'points', '{"emoji":"*","label":"Gun 1"}', false, true),
  (2, 100,  'points', '{"emoji":"gift","label":"Gun 2"}', false, true),
  (3, 150,  'points', '{"emoji":"gem","label":"Gun 3"}', false, true),
  (4, 200,  'points', '{"emoji":"target","label":"Gun 4"}', false, true),
  (5, 300,  'points', '{"emoji":"fire","label":"Gun 5"}', false, true),
  (6, 400,  'points', '{"emoji":"rocket","label":"Gun 6"}', false, true),
  (7, 1000, 'points', '{"emoji":"crown","label":"Mega Odul"}', true, true)
on conflict (day_number) do nothing;

create or replace function public.claim_daily_streak()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_today date := (timezone('utc', now()))::date;
  v_streak public.user_streaks%rowtype;
  v_day integer := 1;
  v_points integer := 0;
  v_requested_points integer := 0;
  v_xp integer := 0;
  v_bonus jsonb := '{}'::jsonb;
  v_is_enabled boolean := true;
  v_daily_pts integer := 0;
  v_daily_xp integer := 0;
  v_max_daily_pts integer := public.app_setting_int('max_daily_points', 1000);
  v_max_daily_xp integer := public.app_setting_int('max_daily_xp', 500);
  v_ratio integer := public.app_setting_int('xp_points_ratio', 1);
  v_limit_enabled boolean := public.app_setting_bool('points_limit_enabled', true);
  v_max_balance integer := public.app_setting_int('max_points_limit', 1200);
  v_current_points integer := 0;
  v_remaining_balance integer := null;
  v_level_result jsonb := '{}'::jsonb;
  v_profile_level integer := 1;
  v_profile_xp_to_next integer := 200;
  v_status text := 'active';
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  select current_points, coalesce(level, 1), coalesce(xp_to_next, 200)
  into v_current_points, v_profile_level, v_profile_xp_to_next
  from public.profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'User not found';
  end if;

  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'profiles'
      and column_name = 'status'
  ) then
    execute 'select coalesce(status::text, ''active'') from public.profiles where id = $1'
      into v_status
      using v_user_id;

    if v_status <> 'active' then
      raise exception 'Account is not active';
    end if;
  end if;

  insert into public.user_streaks (user_id)
  values (v_user_id)
  on conflict (user_id) do nothing;

  select * into v_streak
  from public.user_streaks
  where user_id = v_user_id
  for update;

  if v_streak.last_claim_date = v_today then
    return jsonb_build_object(
      'already_claimed', true,
      'current_streak', v_streak.current_streak,
      'longest_streak', v_streak.longest_streak,
      'points', 0,
      'xp', 0,
      'capped', false,
      'level', v_profile_level,
      'xp_to_next', v_profile_xp_to_next
    );
  end if;

  select points_earned, xp_earned
  into v_daily_pts, v_daily_xp
  from public.user_daily_earnings
  where user_id = v_user_id
    and earn_date = v_today
  for update;

  if found and (v_daily_pts > 0 or v_daily_xp > 0) then
    update public.user_streaks
    set last_claim_date = v_today,
        updated_at = now()
    where user_id = v_user_id;

    return jsonb_build_object(
      'already_claimed', true,
      'current_streak', v_streak.current_streak,
      'longest_streak', v_streak.longest_streak,
      'points', 0,
      'xp', 0,
      'capped', false,
      'level', v_profile_level,
      'xp_to_next', v_profile_xp_to_next
    );
  end if;

  if v_streak.last_claim_date = v_today - 1 then
    v_day := least(v_streak.current_streak + 1, 7);
  else
    v_day := 1;
  end if;

  select points, enabled, bonus_value
  into v_points, v_is_enabled, v_bonus
  from public.daily_reward_config
  where day_number = v_day
  limit 1;

  if not found then
    v_points := 50 + ((v_day - 1) * 50);
    v_is_enabled := true;
    v_bonus := jsonb_build_object('label', 'Gun ' || v_day);
  end if;

  if not v_is_enabled then
    return jsonb_build_object(
      'disabled', true,
      'already_claimed', false,
      'current_streak', v_streak.current_streak,
      'longest_streak', v_streak.longest_streak,
      'streak_day', v_day,
      'points', 0,
      'xp', 0,
      'capped', false,
      'level', v_profile_level,
      'xp_to_next', v_profile_xp_to_next
    );
  end if;

  v_points := greatest(coalesce(v_points, 0), 0);
  v_requested_points := v_points;

  if v_limit_enabled and v_max_balance > 0 then
    v_remaining_balance := greatest(v_max_balance - v_current_points, 0);
    v_points := least(v_points, v_remaining_balance);
  end if;

  if v_max_daily_pts > 0 then
    v_points := least(v_points, greatest(v_max_daily_pts - coalesce(v_daily_pts, 0), 0));
  end if;

  v_xp := floor(v_points * greatest(v_ratio, 0))::integer;

  if v_max_daily_xp > 0 then
    v_xp := least(v_xp, greatest(v_max_daily_xp - coalesce(v_daily_xp, 0), 0));
  end if;

  insert into public.user_daily_earnings (user_id, earn_date, points_earned, xp_earned, updated_at)
  values (v_user_id, v_today, v_points, v_xp, now())
  on conflict (user_id, earn_date) do update
  set points_earned = public.user_daily_earnings.points_earned + excluded.points_earned,
      xp_earned = public.user_daily_earnings.xp_earned + excluded.xp_earned,
      updated_at = now();

  update public.user_streaks
  set current_streak = v_day,
      longest_streak = greatest(longest_streak, v_day),
      last_claim_date = v_today,
      updated_at = now()
  where user_id = v_user_id;

  update public.profiles
  set current_points = greatest(current_points + v_points, 0),
      total_points = case when v_points > 0 then total_points + v_points else total_points end,
      streak = v_day,
      updated_at = now()
  where id = v_user_id;

  if v_points > 0 and to_regclass('public.points_transactions') is not null then
    begin
      insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
      values (
        v_user_id,
        'earned',
        v_points,
        'Gunluk odul - gun ' || v_day,
        'daily_login',
        'daily-login-' || v_today::text
      );
    exception when others then
      null;
    end;
  end if;

  if v_xp > 0 and to_regprocedure('public.add_xp(uuid, integer, text)') is not null then
    begin
      select public.add_xp(v_user_id, v_xp, 'daily_login') into v_level_result;
    exception when others then
      v_level_result := '{}'::jsonb;
    end;
  end if;

  select coalesce(level, 1), coalesce(xp_to_next, 200)
  into v_profile_level, v_profile_xp_to_next
  from public.profiles
  where id = v_user_id;

  return jsonb_build_object(
    'already_claimed', false,
    'current_streak', v_day,
    'longest_streak', greatest(v_streak.longest_streak, v_day),
    'streak_day', v_day,
    'points', v_points,
    'requested_points', v_requested_points,
    'xp', v_xp,
    'capped', v_points < v_requested_points or (v_points = 0 and v_requested_points > 0),
    'limit_remaining_before_claim', v_remaining_balance,
    'leveled_up', coalesce((v_level_result->>'leveled_up')::boolean, false),
    'level', coalesce((v_level_result->>'level')::integer, v_profile_level),
    'bonus_points', coalesce((v_level_result->>'bonus_points')::integer, 0),
    'xp_to_next', coalesce((v_level_result->>'xp_to_next')::integer, v_profile_xp_to_next),
    'label', coalesce(v_bonus->>'label', 'Gun ' || v_day),
    'emoji', v_bonus->>'emoji'
  );
end;
$$;

revoke all on function public.app_setting_int(text, integer) from public;
revoke all on function public.app_setting_bool(text, boolean) from public;
revoke all on function public.claim_daily_streak() from public;
revoke all on function public.claim_daily_streak() from anon;

grant execute on function public.app_setting_int(text, integer) to authenticated;
grant execute on function public.app_setting_bool(text, boolean) to authenticated;
grant execute on function public.claim_daily_streak() to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.daily_reward_config;
exception when others then
  null;
end $$;

notify pgrst, 'reload schema';
