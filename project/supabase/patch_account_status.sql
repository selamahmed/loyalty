-- ============================================================
-- Account suspend / ban — admin RLS + RPC + earn guards
-- Run in Supabase SQL Editor
-- ============================================================

-- Admins can update any profile (status, role, points, etc.)
drop policy if exists "Admins update profiles" on public.profiles;
create policy "Admins update profiles"
  on public.profiles for update
  using (public.is_admin())
  with check (public.is_admin());

-- RPC: admin sets user account status (bypasses client RLS edge cases)
create or replace function public.admin_set_user_status(
  p_user_id uuid,
  p_status  public.account_status
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  if p_status not in ('active', 'suspended', 'deleted') then
    raise exception 'Invalid status: %', p_status;
  end if;

  update public.profiles
  set
    status     = p_status,
    updated_at = now()
  where id = p_user_id;

  if not found then
    raise exception 'User not found';
  end if;
end;
$$;

grant execute on function public.admin_set_user_status(uuid, public.account_status) to authenticated;

-- Reliable status read for the logged-in user (security definer)
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

-- Users cannot change their own role or account status
drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and status = (select p.status from public.profiles p where p.id = auth.uid())
  );

-- Block earning for non-active accounts
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

-- Patch add_points to respect account status
create or replace function public.add_points(
  p_user_id    uuid,
  p_amount     integer,
  p_description text,
  p_category   text default null,
  p_reference_id text default null
) returns void language plpgsql security definer set search_path = public as $$
begin
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

-- Patch earn_reward if it exists (from patch_xp_system.sql)
do $$
begin
  if exists (
    select 1 from pg_proc
    where proname = 'earn_reward' and pronamespace = 'public'::regnamespace
  ) then
    execute $fn$
      create or replace function public.earn_reward(
        p_user_id         uuid,
        p_rule_type       text,
        p_points_override integer default null,
        p_description     text default '',
        p_reference_id    text default null,
        p_xp_override     integer default null
      ) returns jsonb language plpgsql security definer set search_path = public as $body$
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

        perform public.assert_user_active(p_user_id);

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
      $body$;
    $fn$;
  end if;
end $$;

-- Enable realtime on profiles (skip if already added by patch_new_tables.sql)
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;

select 'Account status patch applied ✓' as status;
