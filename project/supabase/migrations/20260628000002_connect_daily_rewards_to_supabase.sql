-- Connect Daily Rewards admin/user pages to Supabase as the source of truth.
-- Safe to run multiple times in the Supabase SQL Editor.

create extension if not exists pgcrypto;

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

drop policy if exists "Super admins manage daily_reward_config" on public.daily_reward_config;
create policy "Super admins manage daily_reward_config"
  on public.daily_reward_config for all
  using (public.is_super_admin())
  with check (public.is_super_admin());

insert into public.daily_reward_config (day_number, points, bonus_type, bonus_value, is_special, enabled) values
  (1, 50,   'points', '{"emoji":"⚡","label":"Hoşgeldin"}', false, true),
  (2, 100,  'points', '{"emoji":"🎁","label":"Sadık Üye"}', false, true),
  (3, 150,  'points', '{"emoji":"💎","label":"Elmas"}', false, true),
  (4, 200,  'points', '{"emoji":"🎯","label":"Hedef"}', false, true),
  (5, 300,  'points', '{"emoji":"🔥","label":"Ateşli"}', false, true),
  (6, 400,  'points', '{"emoji":"🚀","label":"Fırtına"}', false, true),
  (7, 1000, 'points', '{"emoji":"👑","label":"MEGA ÖDÜL"}', true, true)
on conflict (day_number) do nothing;

do $$
begin
  alter publication supabase_realtime add table public.daily_reward_config;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

create or replace function public.claim_daily_streak()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id       uuid := auth.uid();
  v_today         date := (timezone('utc', now()))::date;
  v_streak        public.user_streaks%rowtype;
  v_day           integer;
  v_points        integer := 0;
  v_xp            integer := 0;
  v_bonus         jsonb := '{}'::jsonb;
  v_is_enabled    boolean := true;
  v_daily_pts     integer := 0;
  v_daily_xp      integer := 0;
  v_max_pts       integer := public.app_setting_int('max_daily_points', 1000);
  v_max_xp        integer := public.app_setting_int('max_daily_xp', 500);
  v_ratio         integer := public.app_setting_int('xp_points_ratio', 1);
  v_level_result  jsonb := '{}'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  perform public.assert_user_active(v_user_id);

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
      'capped', false
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
    v_points := 50 + (v_day - 1) * 50;
    v_is_enabled := true;
    v_bonus := jsonb_build_object('label', 'Gün ' || v_day);
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
      'capped', false
    );
  end if;

  v_points := greatest(coalesce(v_points, 0), 0);
  v_xp := floor(v_points * greatest(v_ratio, 0))::integer;

  insert into public.user_daily_earnings (user_id, earn_date, points_earned, xp_earned)
  values (v_user_id, v_today, 0, 0)
  on conflict (user_id, earn_date) do nothing;

  select points_earned, xp_earned
  into v_daily_pts, v_daily_xp
  from public.user_daily_earnings
  where user_id = v_user_id
    and earn_date = v_today
  for update;

  if v_max_pts > 0 then
    if v_daily_pts >= v_max_pts then
      v_points := 0;
    else
      v_points := least(v_points, v_max_pts - v_daily_pts);
    end if;
  end if;

  if v_max_xp > 0 then
    if v_daily_xp >= v_max_xp then
      v_xp := 0;
    else
      v_xp := least(v_xp, v_max_xp - v_daily_xp);
    end if;
  end if;

  update public.user_streaks
  set
    current_streak = v_day,
    longest_streak = greatest(longest_streak, v_day),
    last_claim_date = v_today,
    updated_at = now()
  where user_id = v_user_id;

  update public.profiles
  set streak = v_day,
      updated_at = now()
  where id = v_user_id;

  if v_points > 0 then
    perform public.add_points(
      v_user_id,
      v_points,
      'Günlük ödül — gün ' || v_day,
      'daily_login',
      'daily-login-' || v_today::text
    );
  end if;

  if v_xp > 0 then
    v_level_result := public.add_xp(v_user_id, v_xp, 'daily_login');
  end if;

  update public.user_daily_earnings
  set
    points_earned = points_earned + v_points,
    xp_earned = xp_earned + v_xp
  where user_id = v_user_id
    and earn_date = v_today;

  return jsonb_build_object(
    'already_claimed', false,
    'current_streak', v_day,
    'longest_streak', greatest(v_streak.longest_streak, v_day),
    'streak_day', v_day,
    'points', v_points,
    'xp', v_xp,
    'capped', v_points = 0 and v_xp = 0,
    'leveled_up', coalesce((v_level_result->>'leveled_up')::boolean, false),
    'level', coalesce((v_level_result->>'level')::integer, (select level from public.profiles where id = v_user_id)),
    'bonus_points', coalesce((v_level_result->>'bonus_points')::integer, 0),
    'xp_to_next', coalesce((v_level_result->>'xp_to_next')::integer, (select xp_to_next from public.profiles where id = v_user_id)),
    'label', coalesce(v_bonus->>'label', 'Gün ' || v_day),
    'emoji', v_bonus->>'emoji'
  );
end;
$$;

revoke all on function public.claim_daily_streak() from public;
revoke all on function public.claim_daily_streak() from anon;
grant execute on function public.claim_daily_streak() to authenticated;
