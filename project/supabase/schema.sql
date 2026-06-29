-- ============================================================
-- NexReward / Loyalty Platform — Production Schema
-- Run in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUMS
-- ============================================================

do $$ begin
  create type user_role as enum ('customer', 'super_admin', 'store_admin', 'cashier');
exception when duplicate_object then null; end $$;

do $$ begin
  create type account_status as enum ('active', 'suspended', 'deleted');
exception when duplicate_object then null; end $$;

do $$ begin
  create type transaction_type as enum ('earned', 'spent', 'adjusted', 'expired');
exception when duplicate_object then null; end $$;

do $$ begin
  create type mission_category as enum ('daily', 'weekly', 'special');
exception when duplicate_object then null; end $$;

do $$ begin
  create type achievement_rarity as enum ('common', 'rare', 'epic', 'legendary');
exception when duplicate_object then null; end $$;

do $$ begin
  create type risk_level as enum ('low', 'medium', 'high');
exception when duplicate_object then null; end $$;

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================

create table if not exists public.profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  username        text,
  email           text not null,
  avatar_url      text,
  role            user_role not null default 'customer',
  level           integer not null default 1,
  xp              integer not null default 0,
  xp_to_next      integer not null default 200,
  total_points    integer not null default 0,
  current_points  integer not null default 0,
  streak          integer not null default 0,
  phone           text,
  bio             text,
  status          account_status not null default 'active',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists profiles_status_idx on public.profiles(status);
create index if not exists profiles_total_points_idx on public.profiles(total_points desc);

-- Auto-create profile + welcome notification on signup
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
    'customer'
  );

  -- Welcome notification
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- REWARDS
-- ============================================================

create table if not exists public.rewards (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text not null default '',
  points      integer not null,
  category    text not null,
  image       text,
  featured    boolean not null default false,
  limited     boolean not null default false,
  stock       integer not null default 100,
  expires_at  timestamptz,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists rewards_active_idx on public.rewards(active);
create index if not exists rewards_category_idx on public.rewards(category);
create index if not exists rewards_featured_idx on public.rewards(featured) where featured = true;

-- ============================================================
-- REDEMPTIONS
-- ============================================================

create table if not exists public.redemptions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  reward_id   uuid not null references public.rewards(id) on delete cascade,
  points_spent integer not null,
  code        text not null unique,
  barcode     text,
  used        boolean not null default false,
  used_at     timestamptz,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists redemptions_user_idx on public.redemptions(user_id);
create index if not exists redemptions_code_idx on public.redemptions(code);
create index if not exists redemptions_used_idx on public.redemptions(used);

-- ============================================================
-- POINTS TRANSACTIONS
-- ============================================================

create table if not exists public.points_transactions (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  type         transaction_type not null,
  amount       integer not null,
  description  text not null,
  category     text,
  reference_id text,
  created_at   timestamptz not null default now()
);

create index if not exists pts_user_idx on public.points_transactions(user_id);
create index if not exists pts_type_idx on public.points_transactions(type);
create index if not exists pts_created_idx on public.points_transactions(created_at desc);

-- RPC: add_points (atomically adds points to profile and logs transaction)
create or replace function public.add_points(
  p_user_id    uuid,
  p_amount     integer,
  p_description text,
  p_category   text default null,
  p_reference_id text default null
) returns void language plpgsql security definer as $$
begin
  update public.profiles
  set
    current_points = current_points + p_amount,
    total_points   = total_points + p_amount,
    updated_at     = now()
  where id = p_user_id;

  insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
  values (p_user_id, 'earned', p_amount, p_description, p_category, p_reference_id);
end;
$$;

-- RPC: spend_points (atomically deducts points from profile and logs transaction)
create or replace function public.spend_points(
  p_user_id    uuid,
  p_amount     integer,
  p_description text,
  p_reference_id text default null
) returns void language plpgsql security definer as $$
declare
  v_current integer;
begin
  select current_points into v_current from public.profiles where id = p_user_id;
  if v_current < p_amount then
    raise exception 'Insufficient points: % available, % required', v_current, p_amount;
  end if;

  update public.profiles
  set
    current_points = current_points - p_amount,
    updated_at     = now()
  where id = p_user_id;

  insert into public.points_transactions(user_id, type, amount, description, reference_id)
  values (p_user_id, 'spent', p_amount, p_description, p_reference_id);
end;
$$;

-- ============================================================
-- ACHIEVEMENTS
-- ============================================================

create table if not exists public.achievements (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text not null,
  icon        text not null default '🏆',
  category    text not null,
  points      integer not null default 0,
  rarity      achievement_rarity not null default 'common',
  total       integer not null default 1,
  created_at  timestamptz not null default now()
);

create table if not exists public.user_achievements (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  progress       integer not null default 0,
  completed      boolean not null default false,
  completed_at   timestamptz,
  created_at     timestamptz not null default now(),
  unique (user_id, achievement_id)
);

create index if not exists user_ach_user_idx on public.user_achievements(user_id);

-- ============================================================
-- MISSIONS
-- ============================================================

create table if not exists public.missions (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text not null,
  icon        text not null default '🎯',
  points      integer not null,
  category    mission_category not null default 'daily',
  slug        text,
  sort_order  integer not null default 0,
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.user_missions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  mission_id  uuid not null references public.missions(id) on delete cascade,
  completed   boolean not null default false,
  completed_at timestamptz,
  reset_at    timestamptz,
  created_at  timestamptz not null default now(),
  unique (user_id, mission_id)
);

create index if not exists user_missions_user_idx on public.user_missions(user_id);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

create table if not exists public.notifications (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  type        text not null,
  title       text not null,
  message     text not null,
  read        boolean not null default false,
  icon        text,
  created_at  timestamptz not null default now()
);

create index if not exists notif_user_idx on public.notifications(user_id);
create index if not exists notif_read_idx on public.notifications(read) where read = false;
create index if not exists notif_created_idx on public.notifications(created_at desc);

-- ============================================================
-- EVENTS (seasonal / campaigns)
-- ============================================================

create table if not exists public.events (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  description text not null,
  image       text,
  start_date  timestamptz not null,
  end_date    timestamptz not null,
  active      boolean not null default true,
  multiplier  text,
  color       text,
  emoji       text,
  created_at  timestamptz not null default now()
);

create index if not exists events_active_idx on public.events(active) where active = true;

-- ============================================================
-- ACTIVITY LOGS
-- ============================================================

create table if not exists public.activity_logs (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid references public.profiles(id) on delete set null,
  username    text not null,
  email       text not null,
  role        text not null,
  action      text not null,
  action_type text not null,
  details     jsonb,
  ip_address  text,
  device_type text,
  device_name text,
  browser     text,
  os          text,
  country     text,
  city        text,
  region      text,
  isp         text,
  timezone    text,
  amount      integer,
  risk_level  risk_level default 'low',
  created_at  timestamptz not null default now()
);

create index if not exists logs_user_idx on public.activity_logs(user_id);
create index if not exists logs_action_type_idx on public.activity_logs(action_type);
create index if not exists logs_risk_idx on public.activity_logs(risk_level);
create index if not exists logs_created_idx on public.activity_logs(created_at desc);

-- RPC: get_log_stats
create or replace function public.get_log_stats()
returns json language plpgsql security definer as $$
declare
  v_total bigint;
  v_today bigint;
  v_unique bigint;
  v_high bigint;
begin
  select count(*) into v_total from public.activity_logs;
  select count(*) into v_today from public.activity_logs where created_at > now() - interval '24 hours';
  select count(distinct user_id) into v_unique from public.activity_logs where user_id is not null;
  select count(*) into v_high from public.activity_logs where risk_level = 'high';
  return json_build_object('total', v_total, 'today', v_today, 'uniqueUsers', v_unique, 'highRisk', v_high);
end;
$$;

-- RPC: get_user_stats (aggregates a user's points history + activity for UserStats page)
create or replace function public.get_user_stats(p_user_id uuid)
returns json language plpgsql security definer as $$
declare
  v_points_over_time json;
  v_activity_breakdown json;
  v_reward_usage json;
begin
  -- Points earned per month (last 6 months)
  select json_agg(row)
  into v_points_over_time
  from (
    select to_char(date_trunc('month', created_at), 'Mon') as month,
           coalesce(sum(amount), 0)::int as points
    from public.points_transactions
    where user_id = p_user_id
      and type = 'earned'
      and created_at >= now() - interval '6 months'
    group by date_trunc('month', created_at)
    order by date_trunc('month', created_at)
  ) row;

  -- Activity breakdown by category
  select json_agg(row)
  into v_activity_breakdown
  from (
    select coalesce(category, 'other') as name,
           count(*)::int as value
    from public.points_transactions
    where user_id = p_user_id
      and type = 'earned'
    group by category
    order by value desc
    limit 6
  ) row;

  -- Redemptions per month (last 6 months)
  select json_agg(row)
  into v_reward_usage
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
    'pointsOverTime',      coalesce(v_points_over_time, '[]'::json),
    'activityBreakdown',   coalesce(v_activity_breakdown, '[]'::json),
    'rewardUsage',         coalesce(v_reward_usage, '[]'::json)
  );
end;
$$;

-- ============================================================
-- QR CODES
-- ============================================================

create table if not exists public.qr_codes (
  id          uuid primary key default uuid_generate_v4(),
  code        text not null unique,
  store_id    text,
  points      integer not null,
  label       text,
  active      boolean not null default true,
  max_uses    integer,
  uses_count  integer not null default 0,
  expires_at  timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists public.qr_scans (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  qr_code_id    uuid not null references public.qr_codes(id) on delete cascade,
  points_earned integer not null,
  created_at    timestamptz not null default now()
);

create index if not exists qr_codes_code_idx on public.qr_codes(code);
create index if not exists qr_scans_user_idx on public.qr_scans(user_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.rewards enable row level security;
alter table public.redemptions enable row level security;
alter table public.points_transactions enable row level security;
alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.missions enable row level security;
alter table public.user_missions enable row level security;
alter table public.notifications enable row level security;
alter table public.events enable row level security;
alter table public.activity_logs enable row level security;
alter table public.qr_codes enable row level security;
alter table public.qr_scans enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql security definer as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid()
    and role in ('super_admin', 'store_admin')
  );
$$;

-- ── PROFILES policies ──
create policy "Users read own profile"
  on public.profiles for select
  using (id = auth.uid() or public.is_admin());

create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "Admins read all profiles"
  on public.profiles for select
  using (public.is_admin());

-- ── REWARDS policies ──
create policy "Anyone reads active rewards"
  on public.rewards for select
  using (active = true or public.is_admin());

create policy "Admins manage rewards"
  on public.rewards for all
  using (public.is_admin());

-- ── REDEMPTIONS policies ──
create policy "Users see own redemptions"
  on public.redemptions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Users insert own redemptions"
  on public.redemptions for insert
  with check (user_id = auth.uid());

create policy "Users update own redemptions"
  on public.redemptions for update
  using (user_id = auth.uid() or public.is_admin());

create policy "Admins manage all redemptions"
  on public.redemptions for all
  using (public.is_admin());

-- ── POINTS TRANSACTIONS policies ──
create policy "Users see own transactions"
  on public.points_transactions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Service role inserts transactions"
  on public.points_transactions for insert
  with check (user_id = auth.uid() or public.is_admin());

-- ── ACHIEVEMENTS policies ──
create policy "Anyone reads achievements"
  on public.achievements for select
  using (true);

create policy "Admins manage achievements"
  on public.achievements for all
  using (public.is_admin());

-- ── USER ACHIEVEMENTS policies ──
create policy "Users see own achievement progress"
  on public.user_achievements for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Users insert own achievement progress"
  on public.user_achievements for insert
  with check (user_id = auth.uid());

create policy "Users update own achievement progress"
  on public.user_achievements for update
  using (user_id = auth.uid());

-- ── MISSIONS policies ──
create policy "Anyone reads active missions"
  on public.missions for select
  using (active = true or public.is_admin());

create policy "Admins manage missions"
  on public.missions for all
  using (public.is_admin());

-- ── USER MISSIONS policies ──
create policy "Users see own mission progress"
  on public.user_missions for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Users upsert own mission progress"
  on public.user_missions for insert
  with check (user_id = auth.uid());

create policy "Users update own mission progress"
  on public.user_missions for update
  using (user_id = auth.uid());

-- ── NOTIFICATIONS policies ──
create policy "Users see own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

create policy "Users delete own notifications"
  on public.notifications for delete
  using (user_id = auth.uid());

create policy "Admins manage notifications"
  on public.notifications for all
  using (public.is_admin());

-- ── EVENTS policies ──
create policy "Anyone reads active events"
  on public.events for select
  using (active = true or public.is_admin());

create policy "Admins manage events"
  on public.events for all
  using (public.is_admin());

-- ── ACTIVITY LOGS policies ──
create policy "Admins read all logs"
  on public.activity_logs for select
  using (public.is_admin());

create policy "Users insert logs"
  on public.activity_logs for insert
  with check (
    (auth.uid() is not null and user_id = auth.uid())
    or (auth.uid() is null and user_id is null)
    or auth.uid() is not null
  );

-- ── QR CODES policies ──
create policy "Anyone reads active QR codes"
  on public.qr_codes for select
  using (active = true or public.is_admin());

create policy "Admins manage QR codes"
  on public.qr_codes for all
  using (public.is_admin());

-- ── QR SCANS policies ──
create policy "Users see own QR scans"
  on public.qr_scans for select
  using (user_id = auth.uid() or public.is_admin());

create policy "Users insert QR scans"
  on public.qr_scans for insert
  with check (user_id = auth.uid());

-- ============================================================
-- SEED: Default missions (optional — run after schema)
-- ============================================================

insert into public.missions (title, description, icon, points, category, slug, sort_order) values
  ('Günlük Ziyaret', 'Uygulamayı aç ve giriş yap', '📅', 20, 'daily', 'daily_visit', 0),
  ('QR Kod Tara', 'Herhangi bir QR kodu tara', '📱', 75, 'daily', 'qr_scan', 1),
  ('Ödüllere Göz At', 'Ödüller mağazasını ziyaret et', '🛍️', 15, 'daily', 'shop_visit', 2),
  ('Başarımları Gör', 'Başarımlar sayfasına git', '🏆', 10, 'daily', 'achievements_visit', 3),
  ('Arkadaşını Davet Et', 'Bir arkadaşını uygulamaya davet et', '👥', 100, 'weekly', 'refer_friend', 0),
  ('Liderlik Tablosuna Gir', 'Haftalık liderlik tablosunda üst 10''a gir', '📊', 200, 'weekly', 'leaderboard_top10', 1)
on conflict do nothing;

-- ============================================================
-- APP SETTINGS (key-value config for super admin)
-- ============================================================

create table if not exists public.app_settings (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  value jsonb not null default '{}',
  description text,
  category text not null default 'general',
  updated_at timestamptz not null default now()
);

alter table public.app_settings enable row level security;

-- Everyone (including anonymous) can READ settings so MaintenanceGuard works
create policy "Public read app_settings"
  on public.app_settings for select
  using (true);

-- Only admins can write
create policy "Super admins manage app_settings"
  on public.app_settings for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.app_settings (key, value, description, category) values
  ('points_per_currency', '1', 'Points earned per 1 unit of currency', 'economy'),
  ('daily_login_bonus', '25', 'Points for daily login', 'economy'),
  ('qr_scan_bonus', '75', 'Points for scanning a QR code', 'economy'),
  ('referral_bonus', '200', 'Points awarded for referral', 'economy'),
  ('max_daily_points', '500', 'Maximum points earnable per day', 'economy'),
  ('double_points_enabled', 'false', 'Enable double-points mode globally', 'promotions'),
  ('maintenance_mode', 'false', 'Put app in maintenance mode', 'system'),
  ('allow_new_registrations', 'true', 'Allow new user sign-ups', 'system')
on conflict (key) do nothing;

-- ============================================================
-- DAILY REWARD CONFIG
-- ============================================================

create table if not exists public.daily_reward_config (
  id uuid primary key default gen_random_uuid(),
  day_number int unique not null check (day_number between 1 and 30),
  points int not null default 10,
  bonus_type text not null default 'points' check (bonus_type in ('points', 'multiplier', 'item')),
  bonus_value jsonb not null default '{}',
  is_special boolean not null default false,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.daily_reward_config enable row level security;

create policy "Super admins manage daily_reward_config"
  on public.daily_reward_config for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "All users read daily_reward_config"
  on public.daily_reward_config for select
  using (true);

-- ============================================================
-- GAMES CONFIG
-- ============================================================

create table if not exists public.games_config (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  enabled boolean not null default true,
  max_plays_per_day int not null default 3,
  max_points_per_play int not null default 50,
  icon text,
  color text,
  config jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.games_config enable row level security;

create policy "Super admins manage games_config"
  on public.games_config for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "All users read enabled games"
  on public.games_config for select
  using (enabled = true or public.is_admin());

insert into public.games_config (name, description, enabled, max_plays_per_day, max_points_per_play, icon, color) values
  ('Şans Çarkı', 'Çarkı çevir, puan kazan!', true, 1, 100, '🎡', '#7B6EF6'),
  ('Puan Yarışması', 'Günlük quiz ve bilgi yarışması', true, 3, 50, '🎯', '#f59e0b'),
  ('Hafıza Oyunu', 'Kartları eşleştir ve puan kazan', true, 2, 75, '🧠', '#22c55e'),
  ('Scratch Kart', 'Kartı kazı ve sürprizi bul', true, 1, 150, '🎟️', '#ef4444'),
  ('Mini Quiz', 'Hızlı sorular, hızlı puanlar', true, 5, 30, '❓', '#3b82f6')
on conflict do nothing;

-- ============================================================
-- END OF SCHEMA
-- ============================================================
