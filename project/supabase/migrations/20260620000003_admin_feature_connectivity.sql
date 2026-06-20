-- Connectivity repair for admin feature pages and event leaderboard RPC.
-- Safe to run multiple times in Supabase SQL Editor.

create extension if not exists pgcrypto;

-- Event leaderboard RPC: return [] instead of throwing 400 for stale/missing ids.
create or replace function public.get_event_leaderboard(
  p_event_id uuid,
  p_limit integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
begin
  if p_event_id is null then
    return '[]'::jsonb;
  end if;

  select * into v_event from public.events where id = p_event_id;
  if v_event.id is null then
    return '[]'::jsonb;
  end if;

  perform public.sync_event_status(p_event_id);

  if v_event.status = 'active' then
    perform public.refresh_event_ranks(p_event_id);
  end if;

  return coalesce((
    select jsonb_agg(item order by (item->>'rank')::integer)
    from (
      select jsonb_build_object(
        'id', p.id,
        'username', p.username,
        'avatar_url', p.avatar_url,
        'level', p.level,
        'points', ep.points,
        'rank', coalesce(ep.rank, row_number() over (order by ep.points desc, ep.updated_at asc, ep.created_at asc)),
        'updated_at', ep.updated_at
      ) as item
      from public.event_participants ep
      join public.profiles p on p.id = ep.user_id
      where ep.event_id = p_event_id
        and coalesce(p.status::text, 'active') = 'active'
      order by ep.points desc, ep.updated_at asc, ep.created_at asc
      limit greatest(1, least(coalesce(p_limit, 50), 100))
    ) sub
  ), '[]'::jsonb);
end;
$$;

grant execute on function public.get_event_leaderboard(uuid, integer) to authenticated, anon;

-- App settings used by Admin Settings / maintenance / notification flags.
create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default 'null'::jsonb,
  description text,
  category text not null default 'general',
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "Public read app_settings" on public.app_settings;
create policy "Public read app_settings"
  on public.app_settings for select
  using (true);

drop policy if exists "Admins manage app_settings" on public.app_settings;
create policy "Admins manage app_settings"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.app_settings (key, value, description, category) values
  ('maintenance_mode', 'false', 'Maintenance mode enabled', 'system'),
  ('maintenance_message', '"Siteyi daha iyi hale getirmek icin calisiyoruz."', 'Maintenance message', 'system'),
  ('maintenance_estimated_time', '""', 'Maintenance ETA', 'system'),
  ('points_per_currency', '10', 'Cashier QR points per TRY', 'economy'),
  ('points_to_tl', '100', 'Point conversion display rate', 'economy'),
  ('max_daily_points', '1000', 'Daily point cap', 'economy'),
  ('max_daily_xp', '500', 'Daily XP cap', 'economy'),
  ('games_enabled', 'true', 'Games enabled', 'features'),
  ('qr_enabled', 'true', 'QR scanning enabled', 'features'),
  ('push_notifications', 'true', 'Notifications enabled', 'features')
on conflict (key) do nothing;

-- Daily login reward config.
create table if not exists public.daily_reward_config (
  id uuid primary key default gen_random_uuid(),
  day_number integer unique not null check (day_number between 1 and 31),
  points integer not null default 0 check (points >= 0),
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
  (1, 25, 'points', '{"emoji":"star","label":"Gun 1"}', false, true),
  (2, 35, 'points', '{"emoji":"gift","label":"Gun 2"}', false, true),
  (3, 45, 'points', '{"emoji":"gem","label":"Gun 3"}', false, true),
  (4, 60, 'points', '{"emoji":"target","label":"Gun 4"}', false, true),
  (5, 75, 'points', '{"emoji":"fire","label":"Gun 5"}', false, true),
  (6, 100, 'points', '{"emoji":"zap","label":"Gun 6"}', false, true),
  (7, 150, 'points', '{"emoji":"crown","label":"Buyuk Odul"}', true, true)
on conflict (day_number) do nothing;

-- Game management config.
create table if not exists public.games_config (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  enabled boolean not null default true,
  max_plays_per_day integer not null default 3 check (max_plays_per_day >= 0),
  max_points_per_play integer not null default 50 check (max_points_per_play >= 0),
  icon text,
  color text,
  config jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games_config enable row level security;

drop policy if exists "All users read enabled games" on public.games_config;
create policy "All users read enabled games"
  on public.games_config for select
  using (enabled = true or public.is_admin());

drop policy if exists "Admins manage games_config" on public.games_config;
create policy "Admins manage games_config"
  on public.games_config for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.games_config (name, description, enabled, max_plays_per_day, max_points_per_play, icon, color) values
  ('Snake', 'Klasik yilan oyunu', true, 3, 80, 'gamepad', '#22c55e'),
  ('Flappy', 'Refleks oyunu', true, 3, 100, 'bird', '#7B6EF6'),
  ('Memory', 'Hafiza eslestirme', true, 3, 90, 'brain', '#f59e0b')
on conflict do nothing;

-- Points economy rules.
create table if not exists public.point_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  rule_type text not null,
  value integer not null default 0 check (value >= 0),
  xp_value integer not null default 0 check (xp_value >= 0),
  max_per_day integer,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.point_rules enable row level security;

drop policy if exists "Admins manage point_rules" on public.point_rules;
create policy "Admins manage point_rules"
  on public.point_rules for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins read point_rules" on public.point_rules;
create policy "Admins read point_rules"
  on public.point_rules for select
  using (public.is_admin());

insert into public.point_rules (name, rule_type, value, xp_value, max_per_day, active) values
  ('Gunluk Giris Bonusu', 'daily_login', 25, 25, 1, true),
  ('QR Tarama', 'qr_scan', 75, 75, null, true),
  ('Mini Oyun', 'game_win', 50, 50, null, true)
on conflict do nothing;

-- Admin pages must manage customer inventory/redemptions.
drop policy if exists "Admins manage all redemptions" on public.redemptions;
create policy "Admins manage all redemptions"
  on public.redemptions for all
  using (public.is_admin() or public.is_cashier_or_admin())
  with check (public.is_admin() or public.is_cashier_or_admin());

drop policy if exists "Admins manage notifications" on public.notifications;
create policy "Admins manage notifications"
  on public.notifications for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "Admins read activity logs" on public.activity_logs;
create policy "Admins read activity logs"
  on public.activity_logs for select
  using (public.is_admin());

drop policy if exists "Admins manage qr_codes" on public.qr_codes;
create policy "Admins manage qr_codes"
  on public.qr_codes for all
  using (public.is_cashier_or_admin())
  with check (public.is_cashier_or_admin());
