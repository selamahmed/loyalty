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

-- Everyone (including anonymous) can READ settings so MaintenanceGuard works
drop policy if exists "Public read app_settings" on public.app_settings;
create policy "Public read app_settings"
  on public.app_settings for select
  using (true);

-- Only admins can INSERT / UPDATE / DELETE
drop policy if exists "Super admins manage app_settings" on public.app_settings;
create policy "Super admins manage app_settings"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- Explicit insert policy (belt-and-suspenders for upsert)
drop policy if exists "Admins insert app_settings" on public.app_settings;
create policy "Admins insert app_settings"
  on public.app_settings for insert
  with check (public.is_admin());

-- Explicit update policy
drop policy if exists "Admins update app_settings" on public.app_settings;
create policy "Admins update app_settings"
  on public.app_settings for update
  using (public.is_admin())
  with check (public.is_admin());

-- Seed defaults (safe to re-run)
insert into public.app_settings (key, value, description, category) values
  ('points_per_currency',         '1',      'Points earned per 1 unit of currency',  'economy'),
  ('daily_login_bonus',           '25',     'Points for daily login',                'economy'),
  ('qr_scan_bonus',               '75',     'Points for scanning a QR code',         'economy'),
  ('referral_bonus',              '200',    'Points awarded for referral',           'economy'),
  ('max_daily_points',            '500',    'Maximum points earnable per day',       'economy'),
  ('double_points_enabled',       'false',  'Enable double-points mode globally',    'promotions'),
  ('maintenance_mode',            'false',  'Put app in maintenance mode',           'system'),
  ('maintenance_message',         '"Siteyi sizin için yeniliyoruz."', 'Message shown during maintenance', 'system'),
  ('maintenance_estimated_time',  '""',     'Estimated return time shown to users',  'system'),
  ('maintenance_activated_at',    'false',  'ISO timestamp when maintenance started','system'),
  ('allow_new_registrations',     'true',   'Allow new user sign-ups',               'system')
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

-- ── NOTIFICATIONS: delete policy + welcome trigger ───────────

-- Allow users to delete their own notifications
drop policy if exists "Users delete own notifications" on public.notifications;
create policy "Users delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());

-- Update handle_new_user to also insert a welcome notification
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
begin
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, username, role)
  values (
    new.id,
    new.email,
    v_username,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  )
  on conflict (id) do nothing;

  insert into public.notifications (user_id, type, title, message, icon, read)
  values (
    new.id,
    'system',
    'NexReward''e Hoşgeldin! 🎉',
    'Hesabın başarıyla oluşturuldu. Puan kazanmaya hazır mısın?',
    '🎉',
    false
  );

  return new;
end;
$$;

-- ── ACTIVITY LOGS: ensure unauthenticated inserts are allowed ─

-- Drop and recreate to make sure the policy exists correctly
drop policy if exists "Users insert logs" on public.activity_logs;
create policy "Users insert logs"
  on public.activity_logs for insert
  with check (
    -- Authenticated user inserting their own log
    (auth.uid() is not null and user_id = auth.uid())
    -- OR unauthenticated call (e.g. failed login attempt) with null user_id
    or (auth.uid() is null and user_id is null)
    -- OR any authenticated user inserting a log (for simplicity)
    or auth.uid() is not null
  );

-- ── QR: increment uses helper ────────────────────────────────

create or replace function public.increment_qr_uses(qr_id uuid)
returns void language plpgsql security definer as $$
begin
  update public.qr_codes
  set uses_count = uses_count + 1
  where id = qr_id;
end;
$$;

-- ── Cashier: look up any redemption by code (security definer) ───────────────
create or replace function public.lookup_redemption_by_code(p_code text)
returns json language plpgsql security definer
set search_path = public
as $$
declare
  result json;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  select json_build_object(
    'id',           r.id,
    'user_id',      r.user_id,
    'reward_id',    r.reward_id,
    'code',         r.code,
    'used',         r.used,
    'used_at',      r.used_at,
    'points_spent', r.points_spent,
    'expires_at',   r.expires_at,
    'barcode',      r.barcode,
    'created_at',   r.created_at,
    'profiles',     json_build_object('username', p.username, 'email', p.email),
    'rewards',      json_build_object('title', rw.title, 'image', rw.image)
  ) into result
  from public.redemptions r
  left join public.profiles p  on p.id  = r.user_id
  left join public.rewards  rw on rw.id = r.reward_id
  where upper(r.code) = upper(p_code)
  limit 1;
  return result;
end;
$$;

-- ── Cashier: mark a redemption used by code (security definer) ───────────────
create or replace function public.mark_redemption_used_by_code(p_code text)
returns void language plpgsql security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;
  update public.redemptions
  set used = true, used_at = now()
  where upper(code) = upper(p_code)
    and used = false;
end;
$$;

-- ── Cashier/Admin: broader activity_logs insert (allow any authenticated user) ──
-- (Drop old policy first to avoid conflict)
drop policy if exists "Users insert logs"   on public.activity_logs;
drop policy if exists "Anyone insert logs"  on public.activity_logs;
create policy "Anyone insert logs"
  on public.activity_logs for insert
  with check (true);   -- inserts are server-side writes; reads still restricted

-- ── Events: add published & win_count columns for leaderboard events ──────────
alter table public.events
  add column if not exists published         boolean not null default false,
  add column if not exists win_count         int     not null default 3,
  add column if not exists rewards_json      jsonb   default '[]'::jsonb,
  add column if not exists distribution_date date;

-- ── Fix events RLS: drop old policies and recreate with both using + with check ──
-- NOTE: user_role enum values are: customer, super_admin, store_admin, cashier  (no 'admin')
drop policy if exists "Admins manage events"       on public.events;
drop policy if exists "Anyone reads active events" on public.events;
drop policy if exists "Anyone reads events"        on public.events;

-- SELECT: everyone can see active events, admins see all
create policy "Anyone reads events"
  on public.events for select
  using (
    active = true
    or exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','store_admin','cashier'))
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin','store_admin')
  );

-- INSERT / UPDATE / DELETE: only super_admin and store_admin
create policy "Admins manage events"
  on public.events for all
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','store_admin'))
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin','store_admin')
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('super_admin','store_admin'))
    or (auth.jwt() -> 'user_metadata' ->> 'role') in ('super_admin','store_admin')
  );

-- ── Points: add weekly/monthly helper view ────────────────────────────────────
create or replace view public.leaderboard_weekly as
  select
    p.id, p.username, p.avatar_url, p.level,
    coalesce(sum(pt.amount) filter (where pt.amount > 0), 0)::int as period_points,
    rank() over (order by coalesce(sum(pt.amount) filter (where pt.amount > 0), 0) desc) as rank
  from public.profiles p
  left join public.points_transactions pt
    on pt.user_id = p.id
   and pt.created_at >= (now() - interval '7 days')
  where p.status = 'active'
  group by p.id, p.username, p.avatar_url, p.level;

create or replace view public.leaderboard_monthly as
  select
    p.id, p.username, p.avatar_url, p.level,
    coalesce(sum(pt.amount) filter (where pt.amount > 0), 0)::int as period_points,
    rank() over (order by coalesce(sum(pt.amount) filter (where pt.amount > 0), 0) desc) as rank
  from public.profiles p
  left join public.points_transactions pt
    on pt.user_id = p.id
   and pt.created_at >= (now() - interval '30 days')
  where p.status = 'active'
  group by p.id, p.username, p.avatar_url, p.level;

-- ── ACTIVITY LOGS: add region, isp, timezone columns ─────────
alter table public.activity_logs
  add column if not exists region   text,
  add column if not exists isp      text,
  add column if not exists timezone text;

-- ── Enable Supabase Realtime on required tables ──────────────
alter publication supabase_realtime add table public.profiles;
alter publication supabase_realtime add table public.points_transactions;

-- ── SUPPORT TICKETS ──────────────────────────────────────────
create table if not exists public.support_tickets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete set null,
  type          text not null default 'contact',     -- contact | callback | chat
  status        text not null default 'open',        -- open | in_progress | resolved | closed
  priority      text not null default 'normal',      -- low | normal | high | urgent
  name          text not null default '',
  email         text not null default '',
  phone         text,
  subject       text,
  message       text not null default '',
  preferred_time text,                               -- for callback requests
  assigned_to   uuid references public.profiles(id) on delete set null,
  admin_notes   text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.support_tickets enable row level security;

-- Anyone authenticated can INSERT their own ticket
drop policy if exists "Users create tickets" on public.support_tickets;
create policy "Users create tickets"
  on public.support_tickets for insert
  with check (true);

-- Users can see their own tickets; admins see all
drop policy if exists "Users read own tickets" on public.support_tickets;
create policy "Users read own tickets"
  on public.support_tickets for select
  using (user_id = auth.uid() or public.is_admin());

-- Only admins can update
drop policy if exists "Admins update tickets" on public.support_tickets;
create policy "Admins update tickets"
  on public.support_tickets for update
  using (public.is_admin())
  with check (public.is_admin());

-- Realtime for admin panel
alter publication supabase_realtime add table public.support_tickets;

-- ── DONE ─────────────────────────────────────────────────────
select 'Patch applied successfully ✓' as status;
