-- ============================================================
-- XP & Level Progression System
-- Run in Supabase SQL Editor after schema.sql + patch_new_tables.sql
-- ============================================================

-- ── Level configuration (admin-controlled progression path) ──
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

-- ── Extend point_rules with XP fields ──
alter table public.point_rules
  add column if not exists xp_value integer not null default 0 check (xp_value >= 0);

alter table public.point_rules
  add column if not exists max_per_day integer check (max_per_day is null or max_per_day >= 0);

update public.point_rules set xp_value = 25  where rule_type = 'daily_login'      and xp_value = 0;
update public.point_rules set xp_value = 50  where rule_type = 'qr_scan'          and xp_value = 0;
update public.point_rules set xp_value = 40  where rule_type = 'mission_complete' and xp_value = 0;
update public.point_rules set xp_value = 75  where rule_type = 'achievement'      and xp_value = 0;
update public.point_rules set xp_value = 150 where rule_type = 'referral'         and xp_value = 0;

insert into public.point_rules (name, rule_type, value, xp_value, active) values
  ('Mini Oyun Kazancı', 'game_win', 0, 0, true)
on conflict (rule_type) do nothing;

-- ── Daily earning caps tracker ──
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

-- ── Global XP settings ──
insert into public.app_settings (key, value, description, category) values
  ('xp_points_ratio', to_jsonb(1), 'Rule xp_value=0 iken: XP = puan × oran', 'economy'),
  ('max_daily_xp',    to_jsonb(500), 'Günlük maksimum XP', 'economy')
on conflict (key) do nothing;

-- ── Helpers ──
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

-- Recalculate level + xp_to_next from cumulative XP
create or replace function public.recalc_user_level(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_xp        integer;
  v_old_level integer;
  v_new_level integer;
  v_next_req  integer;
  v_xp_to_next integer;
  v_bonus     integer := 0;
  r           record;
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
  set
    level      = v_new_level,
    xp_to_next = v_xp_to_next,
    updated_at = now()
  where id = p_user_id;

  if v_bonus > 0 then
    perform public.add_points(
      p_user_id, v_bonus,
      'Seviye ' || v_new_level || ' atlama bonusu',
      'level_up', null
    );
  end if;

  return jsonb_build_object(
    'level',          v_new_level,
    'previous_level', v_old_level,
    'leveled_up',     v_new_level > v_old_level,
    'xp_to_next',     v_xp_to_next,
    'bonus_points',   v_bonus,
    'xp',             v_xp
  );
end;
$$;

-- Add XP and level up if needed
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

  update public.profiles
  set xp = xp + p_amount, updated_at = now()
  where id = p_user_id
  returning xp into v_xp;

  v_level_result := public.recalc_user_level(p_user_id);
  return v_level_result || jsonb_build_object('xp_added', p_amount);
end;
$$;

-- Unified earn: points + XP with admin rules and daily caps
create or replace function public.earn_reward(
  p_user_id         uuid,
  p_rule_type       text,
  p_points_override integer default null,
  p_description     text default '',
  p_reference_id    text default null,
  p_xp_override     integer default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_rule       record;
  v_points     integer := 0;
  v_xp         integer := 0;
  v_ratio      integer;
  v_max_pts    integer;
  v_max_xp     integer;
  v_daily_pts  integer := 0;
  v_daily_xp   integer := 0;
  v_level_result jsonb := '{}'::jsonb;
  v_desc       text;
begin
  if auth.uid() is distinct from p_user_id and not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  select * into v_rule from public.point_rules where rule_type = p_rule_type and active limit 1;

  if p_points_override is not null then
    v_points := greatest(p_points_override, 0);
  elsif v_rule.id is not null then
    v_points := v_rule.value;
  end if;

  if p_xp_override is not null then
    v_xp := greatest(p_xp_override, 0);
  elsif v_rule.id is not null and coalesce(v_rule.xp_value, 0) > 0 then
    v_xp := v_rule.xp_value;
  elsif v_points > 0 then
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

grant execute on function public.add_xp(uuid, integer, text) to authenticated;
grant execute on function public.earn_reward(uuid, text, integer, text, text, integer) to authenticated;

-- Realtime for admin + progress path
alter publication supabase_realtime add table public.level_config;

-- Sync existing users' xp_to_next
do $$
declare r record;
begin
  for r in select id from public.profiles loop
    perform public.recalc_user_level(r.id);
  end loop;
end $$;

select 'XP system patch applied ✓' as status;
