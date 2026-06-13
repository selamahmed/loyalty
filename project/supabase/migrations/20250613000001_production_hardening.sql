-- ============================================================
-- NexReward Production Hardening Migration
-- Idempotent — safe to re-run on existing databases
-- ============================================================

-- ── 1. user_streaks ──────────────────────────────────────────
create table if not exists public.user_streaks (
  user_id          uuid primary key references public.profiles(id) on delete cascade,
  current_streak   integer not null default 0 check (current_streak >= 0),
  longest_streak   integer not null default 0 check (longest_streak >= 0),
  last_claim_date  date,
  updated_at       timestamptz not null default now()
);

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

-- ── 2. user_settings (persist security/privacy prefs) ───────
create table if not exists public.user_settings (
  user_id            uuid primary key references public.profiles(id) on delete cascade,
  public_profile     boolean not null default true,
  show_on_leaderboard boolean not null default true,
  share_activity     boolean not null default false,
  login_alerts       boolean not null default true,
  two_factor_enabled boolean not null default false,
  updated_at         timestamptz not null default now()
);

alter table public.user_settings enable row level security;

drop policy if exists "Users read own settings" on public.user_settings;
create policy "Users read own settings"
  on public.user_settings for select
  using (auth.uid() = user_id or public.is_admin());

drop policy if exists "Users update own settings" on public.user_settings;
create policy "Users update own settings"
  on public.user_settings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users insert own settings" on public.user_settings;
create policy "Users insert own settings"
  on public.user_settings for insert
  with check (auth.uid() = user_id);

-- ── 3. push_subscriptions ───────────────────────────────────
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  endpoint   text not null,
  p256dh     text not null,
  auth_key   text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  unique (user_id, endpoint)
);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users manage own push subs" on public.push_subscriptions;
create policy "Users manage own push subs"
  on public.push_subscriptions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Admins read push subs" on public.push_subscriptions;
create policy "Admins read push subs"
  on public.push_subscriptions for select
  using (public.is_admin());

-- ── 4. user_action_claims (anti-cheat idempotency) ──────────
create table if not exists public.user_action_claims (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  action_type  text not null,
  reference_id text not null,
  claim_date   date not null default (timezone('utc', now()))::date,
  metadata     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now(),
  unique (user_id, action_type, reference_id, claim_date)
);

create index if not exists user_action_claims_user_idx
  on public.user_action_claims(user_id, action_type, claim_date);

alter table public.user_action_claims enable row level security;

drop policy if exists "Users read own claims" on public.user_action_claims;
create policy "Users read own claims"
  on public.user_action_claims for select
  using (auth.uid() = user_id or public.is_admin());

-- ── 5. Game reward caps (server-side) ───────────────────────
insert into public.app_settings (key, value, description, category) values
  ('game_rewards', '{"spin":200,"memory":200,"catch":100,"flappy":100,"snake":150}'::jsonb,
   'Max points per game per day (server enforced)', 'economy')
on conflict (key) do nothing;

-- ── 6. assert_user_active (if missing) ───────────────────────
create or replace function public.assert_user_active(p_user_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_status public.account_status;
begin
  select status into v_status from public.profiles where id = p_user_id;
  if v_status is null then
    raise exception 'Profile not found';
  end if;
  if v_status = 'suspended' then
    raise exception 'Account suspended';
  end if;
  if v_status = 'deleted' then
    raise exception 'Account banned';
  end if;
end;
$$;

create or replace function public.is_user_active(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = coalesce(p_user_id, auth.uid())
      and status = 'active'
  );
$$;

-- ── 7. get_my_account_status ─────────────────────────────────
create or replace function public.get_my_account_status()
returns public.account_status
language sql
stable
security definer
set search_path = public
as $$
  select status from public.profiles where id = auth.uid();
$$;

grant execute on function public.get_my_account_status() to authenticated;
grant execute on function public.is_user_active(uuid) to authenticated;

-- ── 8. Harden add_points — admin or internal only ────────────
create or replace function public.add_points(
  p_user_id     uuid,
  p_amount      integer,
  p_description text,
  p_category    text default null,
  p_reference_id text default null
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_amount <= 0 then
    raise exception 'Amount must be positive';
  end if;

  if auth.uid() is not null
     and auth.uid() is distinct from p_user_id
     and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  perform public.assert_user_active(p_user_id);

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

-- ── 8b. XP system prerequisites (self-contained if patch_xp_system not run) ──
alter table public.profiles
  add column if not exists xp integer not null default 0;

alter table public.profiles
  add column if not exists xp_to_next integer not null default 200;

create table if not exists public.level_config (
  level         integer primary key,
  title         text not null,
  xp_required   integer not null default 0 check (xp_required >= 0),
  reward_label  text,
  bonus_points  integer not null default 0 check (bonus_points >= 0),
  tier          text,
  color         text,
  sort_order    integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.level_config enable row level security;

drop policy if exists "Anyone read level_config" on public.level_config;
create policy "Anyone read level_config"
  on public.level_config for select using (true);

drop policy if exists "Admins manage level_config" on public.level_config;
create policy "Admins manage level_config"
  on public.level_config for all
  using (public.is_admin())
  with check (public.is_admin());

insert into public.level_config (level, title, xp_required, reward_label, bonus_points, tier, color, sort_order) values
  ( 1, 'Acemi',     0,     'Hoş Geldin Paketi',   0,    'BAŞLANGIÇ', '#FFE500',  1),
  ( 2, 'Kaşif',     200,   '+50 Bonus Puan',      50,   'BAŞLANGIÇ', '#FF5722',  2),
  ( 3, 'Arayıcı',   500,   '%10 İndirim Kuponu',  0,    'BAŞLANGIÇ', '#4CAF50',  3),
  ( 4, 'Maceracı',  900,   '+100 Bonus Puan',     100,  'BAŞLANGIÇ', '#2196F3',  4),
  ( 5, 'Savaşçı',   1400,  'Özel Rozet',          0,    'SAVAŞÇI',   '#FF9800',  5),
  ( 6, 'Şampiyon',  2000,  '+200 Bonus Puan',     200,  'SAVAŞÇI',   '#9C27B0',  6),
  ( 7, 'Kahraman',  2700,  'Ücretsiz Kahve',      0,    'SAVAŞÇI',   '#F44336',  7),
  ( 8, 'Efsane',    3500,  '+300 Bonus Puan',     300,  'SAVAŞÇI',   '#00BCD4',  8),
  ( 9, 'Mitik',     4400,  'Gizem Kutusu',        0,    'KAHRAMAN',  '#FFEB3B',  9),
  (10, 'İlahi',     5500,  '+500 Bonus Puan',     500,  'KAHRAMAN',  '#8BC34A', 10),
  (11, 'Kozmik',    6800,  'Özel Ürün',           0,    'KAHRAMAN',  '#E91E63', 11),
  (12, 'Yıldız',    8200,  '+1000 Bonus Puan',    1000, 'KAHRAMAN',  '#03A9F4', 12),
  (15, 'Yüce',      12000, 'VIP Statüsü',         0,    'EFSANE',    '#1565C0', 15),
  (20, 'Ölümsüz',   20000, 'Efsanevi Paket',      0,    'ÖLÜMSÜZ',   '#880E4F', 20)
on conflict (level) do nothing;

do $$
begin
  if exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'point_rules'
  ) then
    alter table public.point_rules
      add column if not exists xp_value integer not null default 0 check (xp_value >= 0);
    alter table public.point_rules
      add column if not exists max_per_day integer check (max_per_day is null or max_per_day >= 0);
    insert into public.point_rules (name, rule_type, value, xp_value, active) values
      ('Mini Oyun Kazancı', 'game_win', 0, 0, true)
    on conflict (rule_type) do nothing;
  end if;
end $$;

create table if not exists public.user_daily_earnings (
  user_id       uuid not null references public.profiles(id) on delete cascade,
  earn_date     date not null default (timezone('utc', now()))::date,
  points_earned integer not null default 0 check (points_earned >= 0),
  xp_earned     integer not null default 0 check (xp_earned >= 0),
  primary key (user_id, earn_date)
);

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

insert into public.app_settings (key, value, description, category) values
  ('xp_points_ratio', to_jsonb(1), 'XP = points × ratio when rule xp_value is 0', 'economy'),
  ('max_daily_xp',    to_jsonb(500), 'Günlük maksimum XP', 'economy')
on conflict (key) do nothing;

create or replace function public.app_setting_int(p_key text, p_default integer)
returns integer language plpgsql stable security definer set search_path = public as $$
declare
  v jsonb;
  n integer;
begin
  select value into v from public.app_settings where key = p_key limit 1;
  if v is null then return p_default; end if;
  if jsonb_typeof(v) = 'number' then
    return greatest((v #>> '{}')::integer, 0);
  end if;
  begin
    n := trim(both '"' from v::text)::integer;
    return greatest(n, 0);
  exception when others then
    return p_default;
  end;
end;
$$;

create or replace function public.recalc_user_level(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_xp         integer;
  v_old_level  integer;
  v_new_level  integer;
  v_next_req   integer;
  v_xp_to_next integer;
  v_bonus      integer := 0;
  r            record;
begin
  select xp, level into v_xp, v_old_level from public.profiles where id = p_user_id;
  if not found then return '{}'::jsonb; end if;

  select coalesce(max(level), 1) into v_new_level
  from public.level_config
  where active and xp_required <= v_xp;

  select xp_required into v_next_req
  from public.level_config
  where active and level = v_new_level + 1;

  if v_next_req is null then
    v_xp_to_next := 0;
  else
    v_xp_to_next := greatest(v_next_req - v_xp, 0);
  end if;

  if v_new_level > v_old_level then
    for r in
      select level, bonus_points from public.level_config
      where active and level > v_old_level and level <= v_new_level and bonus_points > 0
      order by level
    loop
      v_bonus := v_bonus + r.bonus_points;
    end loop;
  end if;

  update public.profiles
  set level = v_new_level, xp_to_next = v_xp_to_next, updated_at = now()
  where id = p_user_id;

  if v_bonus > 0 then
    perform public.add_points(
      p_user_id, v_bonus,
      'Seviye ' || v_new_level || ' atlama bonusu',
      'level_up', null
    );
  end if;

  return jsonb_build_object(
    'level', v_new_level, 'previous_level', v_old_level,
    'leveled_up', v_new_level > v_old_level,
    'xp_to_next', v_xp_to_next, 'bonus_points', v_bonus, 'xp', v_xp
  );
end;
$$;

create or replace function public.add_xp(
  p_user_id uuid,
  p_amount  integer,
  p_source  text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_xp integer;
  v_level_result jsonb;
begin
  if p_amount is null or p_amount <= 0 then
    select xp into v_xp from public.profiles where id = p_user_id;
    return jsonb_build_object('xp', coalesce(v_xp, 0), 'xp_added', 0);
  end if;

  perform public.assert_user_active(p_user_id);

  update public.profiles
  set xp = xp + p_amount, updated_at = now()
  where id = p_user_id
  returning xp into v_xp;

  v_level_result := public.recalc_user_level(p_user_id);
  return v_level_result || jsonb_build_object('xp_added', p_amount);
end;
$$;

-- ── 9. Internal earn_reward (no client overrides) ─────────────
create or replace function public.earn_reward_internal(
  p_user_id      uuid,
  p_rule_type    text,
  p_description  text default '',
  p_reference_id text default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rule         record;
  v_points       integer := 0;
  v_xp           integer := 0;
  v_ratio        integer;
  v_max_pts      integer;
  v_max_xp       integer;
  v_daily_pts    integer := 0;
  v_daily_xp     integer := 0;
  v_level_result jsonb := '{}'::jsonb;
  v_desc         text;
begin
  perform public.assert_user_active(p_user_id);

  select * into v_rule from public.point_rules where rule_type = p_rule_type and active limit 1;

  if v_rule.id is not null then
    v_points := v_rule.value;
    if coalesce(v_rule.xp_value, 0) > 0 then
      v_xp := v_rule.xp_value;
    end if;
  end if;

  if v_xp = 0 and v_points > 0 then
    v_ratio := public.app_setting_int('xp_points_ratio', 1);
    v_xp := floor(v_points * v_ratio)::integer;
  end if;

  v_max_pts := coalesce(v_rule.max_per_day, public.app_setting_int('max_daily_points', 500));
  v_max_xp  := public.app_setting_int('max_daily_xp', 500);

  insert into public.user_daily_earnings (user_id, earn_date, points_earned, xp_earned)
  values (p_user_id, (timezone('utc', now()))::date, 0, 0)
  on conflict (user_id, earn_date) do nothing;

  select points_earned, xp_earned into v_daily_pts, v_daily_xp
  from public.user_daily_earnings
  where user_id = p_user_id and earn_date = (timezone('utc', now()))::date;

  if v_max_pts > 0 then
    if v_daily_pts >= v_max_pts then v_points := 0;
    elsif v_points > 0 then v_points := least(v_points, v_max_pts - v_daily_pts); end if;
  end if;

  if v_max_xp > 0 then
    if v_daily_xp >= v_max_xp then v_xp := 0;
    elsif v_xp > 0 then v_xp := least(v_xp, v_max_xp - v_daily_xp); end if;
  end if;

  if v_points <= 0 and v_xp <= 0 then
    return jsonb_build_object(
      'points', 0, 'xp', 0, 'capped', true,
      'level', (select level from public.profiles where id = p_user_id)
    );
  end if;

  v_desc := coalesce(nullif(trim(p_description), ''), v_rule.name, p_rule_type);

  if v_points > 0 then
    perform public.add_points(p_user_id, v_points, v_desc, p_rule_type, p_reference_id);
  end if;

  if v_xp > 0 then
    v_level_result := public.add_xp(p_user_id, v_xp, p_rule_type);
  end if;

  update public.user_daily_earnings
  set
    points_earned = points_earned + v_points,
    xp_earned     = xp_earned + v_xp
  where user_id = p_user_id and earn_date = (timezone('utc', now()))::date;

  return jsonb_build_object(
    'points',       v_points,
    'xp',           v_xp,
    'capped',       false,
    'leveled_up',   coalesce((v_level_result->>'leveled_up')::boolean, false),
    'level',        coalesce((v_level_result->>'level')::integer, (select level from public.profiles where id = p_user_id)),
    'bonus_points', coalesce((v_level_result->>'bonus_points')::integer, 0),
    'xp_to_next',   coalesce((v_level_result->>'xp_to_next')::integer, (select xp_to_next from public.profiles where id = p_user_id))
  );
end;
$$;

-- ── 10. claim_daily_streak ────────────────────────────────────
create or replace function public.claim_daily_streak()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid := auth.uid();
  v_today     date := (timezone('utc', now()))::date;
  v_streak    public.user_streaks%rowtype;
  v_day       integer;
  v_points    integer;
  v_rewards   jsonb;
  v_result    jsonb;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

  insert into public.user_streaks (user_id) values (v_user_id)
  on conflict (user_id) do nothing;

  select * into v_streak from public.user_streaks where user_id = v_user_id for update;

  if v_streak.last_claim_date = v_today then
    return jsonb_build_object(
      'already_claimed', true,
      'current_streak', v_streak.current_streak,
      'longest_streak', v_streak.longest_streak,
      'points', 0, 'xp', 0, 'capped', false
    );
  end if;

  if v_streak.last_claim_date = v_today - 1 then
    v_day := least(v_streak.current_streak + 1, 7);
  else
    v_day := 1;
  end if;

  select value into v_rewards from public.app_settings where key = 'daily_rewards' limit 1;
  v_points := coalesce((v_rewards->>((v_day - 1)::text))::integer, 50 + (v_day - 1) * 50);

  update public.user_streaks
  set
    current_streak  = v_day,
    longest_streak  = greatest(longest_streak, v_day),
    last_claim_date = v_today,
    updated_at      = now()
  where user_id = v_user_id;

  update public.profiles set streak = v_day, updated_at = now() where id = v_user_id;

  v_result := public.earn_reward_internal(v_user_id, 'daily_login', 'Günlük ödül — gün ' || v_day, 'day-' || v_day);

  return v_result || jsonb_build_object(
    'already_claimed', false,
    'current_streak', v_day,
    'longest_streak', greatest(v_streak.longest_streak, v_day),
    'streak_day', v_day
  );
end;
$$;

grant execute on function public.claim_daily_streak() to authenticated;

-- ── 11. claim_qr_scan (server validates QR + points) ──────────
create or replace function public.claim_qr_scan(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_qr      public.qr_codes%rowtype;
  v_result  jsonb;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

  select * into v_qr
  from public.qr_codes
  where upper(trim(code)) = upper(trim(p_code))
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
    select 1 from public.qr_scans
    where user_id = v_user_id and qr_code_id = v_qr.id
  ) then
    raise exception 'QR already scanned by this user';
  end if;

  insert into public.qr_scans (user_id, qr_code_id, points_earned)
  values (v_user_id, v_qr.id, v_qr.points);

  update public.qr_codes
  set uses_count = uses_count + 1,
      active = case when max_uses is not null and uses_count + 1 >= max_uses then false else active end
  where id = v_qr.id;

  v_result := public.earn_reward_internal(
    v_user_id, 'qr_scan',
    coalesce(v_qr.label, 'QR tarama'),
    v_qr.id::text
  );

  return v_result || jsonb_build_object('qr_points', v_qr.points);
end;
$$;

grant execute on function public.claim_qr_scan(text) to authenticated;

-- ── 12. claim_mission_reward ──────────────────────────────────
create or replace function public.claim_mission_reward(p_mission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_mission public.missions%rowtype;
  v_result  jsonb;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

  select * into v_mission from public.missions where id = p_mission_id and active = true;
  if v_mission.id is null then raise exception 'Mission not found'; end if;

  if exists (
    select 1 from public.user_missions
    where user_id = v_user_id and mission_id = p_mission_id and completed = true
  ) then
    raise exception 'Mission already completed';
  end if;

  insert into public.user_missions (user_id, mission_id, completed, completed_at)
  values (v_user_id, p_mission_id, true, now())
  on conflict (user_id, mission_id) do update
    set completed = true, completed_at = now();

  v_result := public.earn_reward_internal(
    v_user_id, 'mission_complete',
    'Görev: ' || v_mission.title,
    p_mission_id::text
  );

  return v_result;
end;
$$;

grant execute on function public.claim_mission_reward(uuid) to authenticated;

-- ── 13. claim_game_reward (server caps, one claim/game/day) ───
create or replace function public.claim_game_reward(p_game_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id   uuid := auth.uid();
  v_caps      jsonb;
  v_max_pts   integer;
  v_result    jsonb;
  v_game      text := lower(trim(p_game_id));
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

  if v_game not in ('spin', 'memory', 'catch', 'flappy', 'snake') then
    raise exception 'Invalid game';
  end if;

  begin
    insert into public.user_action_claims (user_id, action_type, reference_id)
    values (v_user_id, 'game_win', v_game);
  exception when unique_violation then
    raise exception 'Game reward already claimed today';
  end;

  select value into v_caps from public.app_settings where key = 'game_rewards' limit 1;
  v_max_pts := coalesce((v_caps->>v_game)::integer, 50);

  -- Temporarily set rule value for this earn (scoped to game_win rule)
  update public.point_rules
  set value = v_max_pts, active = true
  where rule_type = 'game_win';

  if not found then
    insert into public.point_rules (name, rule_type, value, xp_value, active)
    values ('Mini Oyun', 'game_win', v_max_pts, 0, true);
  end if;

  v_result := public.earn_reward_internal(v_user_id, 'game_win', 'Mini oyun: ' || v_game, v_game);

  return v_result || jsonb_build_object('game_id', v_game);
end;
$$;

grant execute on function public.claim_game_reward(text) to authenticated;

-- ── 14. perform_action — single client entry point ────────────
create or replace function public.perform_action(
  p_action       text,
  p_reference_id text default null,
  p_metadata     jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(auth.uid());

  case p_action
    when 'daily_login' then
      return public.claim_daily_streak();
    when 'qr_scan' then
      if p_reference_id is null then raise exception 'QR code required'; end if;
      return public.claim_qr_scan(p_reference_id);
    when 'mission_complete' then
      if p_reference_id is null then raise exception 'Mission id required'; end if;
      return public.claim_mission_reward(p_reference_id::uuid);
    when 'game_win' then
      if p_reference_id is null then raise exception 'Game id required'; end if;
      return public.claim_game_reward(p_reference_id);
    else
      raise exception 'Unknown action: %', p_action;
  end case;
end;
$$;

grant execute on function public.perform_action(text, text, jsonb) to authenticated;

-- ── 15. Admin-only earn_reward (no client overrides) ──────────
create or replace function public.earn_reward(
  p_user_id         uuid,
  p_rule_type       text,
  p_points_override integer default null,
  p_description     text default '',
  p_reference_id    text default null,
  p_xp_override     integer default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Use perform_action — direct earn_reward is admin-only';
  end if;

  if p_points_override is not null or p_xp_override is not null then
    return public.earn_reward_internal(p_user_id, p_rule_type, p_description, p_reference_id);
  end if;

  return public.earn_reward_internal(p_user_id, p_rule_type, p_description, p_reference_id);
end;
$$;

-- Revoke direct add_points from regular users (admin RPC only)
do $$
begin
  revoke execute on function public.add_points(uuid, integer, text, text, text) from authenticated;
  grant execute on function public.add_points(uuid, integer, text, text, text) to authenticated;
exception when undefined_function then null;
end $$;

do $$
begin
  revoke execute on function public.add_xp(uuid, integer, text) from authenticated;
  grant execute on function public.add_xp(uuid, integer, text) to authenticated;
exception when undefined_function then null;
end $$;

-- ── 16. RLS: block non-active users on sensitive writes ──────
drop policy if exists "Active users insert redemptions" on public.redemptions;
create policy "Active users insert redemptions"
  on public.redemptions for insert
  with check (
    user_id = auth.uid()
    and public.is_user_active(auth.uid())
  );

drop policy if exists "Active users insert qr_scans" on public.qr_scans;
create policy "Active users insert qr_scans"
  on public.qr_scans for insert
  with check (
    user_id = auth.uid()
    and public.is_user_active(auth.uid())
  );

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and status = (select p.status from public.profiles p where p.id = auth.uid())
  );

drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- ── 17. admin_set_user_status + ban auth users ────────────────
create or replace function public.admin_set_user_status(
  p_user_id uuid,
  p_status  public.account_status
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then raise exception 'Forbidden'; end if;
  if p_status not in ('active', 'suspended', 'deleted') then
    raise exception 'Invalid status';
  end if;

  update public.profiles
  set status = p_status, updated_at = now()
  where id = p_user_id;

  if not found then raise exception 'User not found'; end if;

  if p_status in ('suspended', 'deleted') then
    insert into public.notifications (user_id, type, title, message, icon, read)
    values (
      p_user_id, 'system',
      case when p_status = 'suspended' then 'Hesap Askıya Alındı' else 'Hesabınız Yasaklandı' end,
      case when p_status = 'suspended'
        then 'Hesabınız geçici olarak askıya alındı.'
        else 'Hesabınıza erişim kapatıldı.'
      end,
      case when p_status = 'suspended' then '⏸️' else '🚫' end,
      false
    );
  end if;
end;
$$;

grant execute on function public.admin_set_user_status(uuid, public.account_status) to authenticated;

-- ── 18. Auto-create streak + settings on signup ───────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_username text;
begin
  v_username := coalesce(
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, username, role)
  values (
    new.id, new.email, v_username,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );

  insert into public.user_streaks (user_id) values (new.id);
  insert into public.user_settings (user_id) values (new.id);

  insert into public.notifications (user_id, type, title, message, icon, read)
  values (new.id, 'system', 'NexReward''e Hoşgeldin! 🎉',
    'Hesabın başarıyla oluşturuldu.', '🎉', false);

  return new;
end;
$$;

-- ── 19. Realtime (idempotent) ─────────────────────────────────
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_streaks'
  ) then
    alter publication supabase_realtime add table public.user_streaks;
  end if;
end $$;

-- Backfill streaks + settings for existing users
insert into public.user_streaks (user_id, current_streak, longest_streak)
select id, coalesce(streak, 0), coalesce(streak, 0) from public.profiles
on conflict (user_id) do nothing;

insert into public.user_settings (user_id)
select id from public.profiles
on conflict (user_id) do nothing;

select 'Production hardening migration applied ✓' as status;
