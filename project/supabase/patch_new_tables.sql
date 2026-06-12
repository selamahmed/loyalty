-- ============================================================
-- NexReward — PATCH: Run this in Supabase SQL Editor
-- Adds the 3 new config tables introduced in the latest update.
-- Safe to run multiple times (uses IF NOT EXISTS).
-- ============================================================

-- ── APP SETTINGS ────────────────────────────────────────────

create table if not exists public.app_settings (
  id          uuid primary key default gen_random_uuid(),
  key         text unique not null,
  value       jsonb not null default '{}',
  description text,
  category    text not null default 'general',
  updated_at  timestamptz not null default now()
);

alter table public.app_settings enable row level security;

drop policy if exists "Super admins manage app_settings" on public.app_settings;
create policy "Super admins manage app_settings"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Seed defaults (safe to re-run)
insert into public.app_settings (key, value, description, category) values
  ('points_per_currency',    '1',     'Points earned per 1 unit of currency',  'economy'),
  ('daily_login_bonus',      '25',    'Points for daily login',                'economy'),
  ('qr_scan_bonus',          '75',    'Points for scanning a QR code',         'economy'),
  ('referral_bonus',         '200',   'Points awarded for referral',           'economy'),
  ('max_daily_points',       '500',   'Maximum points earnable per day',       'economy'),
  ('double_points_enabled',  'false', 'Enable double-points mode globally',    'promotions'),
  ('maintenance_mode',       'false', 'Put app in maintenance mode',           'system'),
  ('allow_new_registrations','true',  'Allow new user sign-ups',               'system')
on conflict (key) do nothing;

-- ── DAILY REWARD CONFIG ──────────────────────────────────────

create table if not exists public.daily_reward_config (
  id          uuid primary key default gen_random_uuid(),
  day_number  int unique not null check (day_number between 1 and 30),
  points      int not null default 10,
  bonus_type  text not null default 'points' check (bonus_type in ('points', 'multiplier', 'item')),
  bonus_value jsonb not null default '{}',
  is_special  boolean not null default false,
  enabled     boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table public.daily_reward_config enable row level security;

drop policy if exists "Super admins manage daily_reward_config" on public.daily_reward_config;
create policy "Super admins manage daily_reward_config"
  on public.daily_reward_config for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "All users read daily_reward_config" on public.daily_reward_config;
create policy "All users read daily_reward_config"
  on public.daily_reward_config for select
  using (true);

-- ── GAMES CONFIG ─────────────────────────────────────────────

create table if not exists public.games_config (
  id                 uuid primary key default gen_random_uuid(),
  name               text not null,
  description        text,
  enabled            boolean not null default true,
  max_plays_per_day  int not null default 3,
  max_points_per_play int not null default 50,
  icon               text,
  color              text,
  config             jsonb not null default '{}',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

alter table public.games_config enable row level security;

drop policy if exists "Super admins manage games_config" on public.games_config;
create policy "Super admins manage games_config"
  on public.games_config for all
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "All users read enabled games" on public.games_config;
create policy "All users read enabled games"
  on public.games_config for select
  using (enabled = true or public.is_admin());

-- Seed game presets
insert into public.games_config (name, description, enabled, max_plays_per_day, max_points_per_play, icon, color) values
  ('Şans Çarkı',    'Çarkı çevir, puan kazan!',              true, 1, 100, '🎡', '#7B6EF6'),
  ('Puan Yarışması','Günlük quiz ve bilgi yarışması',         true, 3,  50, '🎯', '#f59e0b'),
  ('Hafıza Oyunu',  'Kartları eşleştir ve puan kazan',       true, 2,  75, '🧠', '#22c55e'),
  ('Scratch Kart',  'Kartı kazı ve sürprizi bul',            true, 1, 150, '🎟️', '#ef4444'),
  ('Mini Quiz',     'Hızlı sorular, hızlı puanlar',          true, 5,  30, '❓', '#3b82f6')
on conflict do nothing;

-- ── MISSING RPC: get_user_stats ──────────────────────────────
-- This function was not in the original schema. Add it here.

create or replace function public.get_user_stats(p_user_id uuid)
returns json language plpgsql security definer as $$
declare
  v_points_over_time json;
  v_activity_breakdown json;
  v_reward_usage json;
begin
  select json_agg(row) into v_points_over_time
  from (
    select to_char(date_trunc('month', created_at), 'Mon') as month,
           coalesce(sum(amount), 0)::int as points
    from public.points_transactions
    where user_id = p_user_id and type = 'earned'
      and created_at >= now() - interval '6 months'
    group by date_trunc('month', created_at)
    order by date_trunc('month', created_at)
  ) row;

  select json_agg(row) into v_activity_breakdown
  from (
    select coalesce(category, 'other') as name,
           count(*)::int as value
    from public.points_transactions
    where user_id = p_user_id and type = 'earned'
    group by category
    order by value desc
    limit 6
  ) row;

  select json_agg(row) into v_reward_usage
  from (
    select to_char(date_trunc('month', created_at), 'Mon') as month,
           count(*)::int as redeemed
    from public.redemptions
    where user_id = p_user_id
      and created_at >= now() - interval '6 months'
    group by date_trunc('month', created_at)
    order by date_trunc('month', created_at)
  ) row;

  return json_build_object(
    'pointsOverTime',    coalesce(v_points_over_time, '[]'::json),
    'activityBreakdown', coalesce(v_activity_breakdown, '[]'::json),
    'rewardUsage',       coalesce(v_reward_usage, '[]'::json)
  );
end;
$$;

-- ── DONE ─────────────────────────────────────────────────────
select 'Patch applied successfully ✓' as status;
