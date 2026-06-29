-- Daily reward claim hardening:
-- - Keep daily rewards server-authoritative.
-- - Hide/disable when admin turns every daily_reward_config row off.
-- - Cap daily reward points to the remaining max loyalty balance instead of
--   failing the whole claim when the user is close to the global limit.

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
  v_day integer;
  v_points integer := 0;
  v_original_points integer := 0;
  v_xp integer := 0;
  v_bonus jsonb := '{}'::jsonb;
  v_is_enabled boolean := true;
  v_daily_pts integer := 0;
  v_daily_xp integer := 0;
  v_max_pts integer := public.app_setting_int('max_daily_points', 1000);
  v_max_xp integer := public.app_setting_int('max_daily_xp', 500);
  v_ratio integer := public.app_setting_int('xp_points_ratio', 1);
  v_limit_enabled boolean := public.app_setting_bool('points_limit_enabled', true);
  v_max_balance integer := public.app_setting_int('max_points_limit', 1200);
  v_current_points integer := 0;
  v_remaining_balance integer := null;
  v_level_result jsonb := '{}'::jsonb;
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
      'capped', false
    );
  end if;

  v_points := greatest(coalesce(v_points, 0), 0);
  v_original_points := v_points;

  select current_points
  into v_current_points
  from public.profiles
  where id = v_user_id
  for update;

  if not found then
    raise exception 'User not found';
  end if;

  if v_limit_enabled and v_max_balance > 0 then
    v_remaining_balance := greatest(v_max_balance - v_current_points, 0);
    v_points := least(v_points, v_remaining_balance);
  end if;

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
      'Gunluk odul - gun ' || v_day,
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
    'requested_points', v_original_points,
    'xp', v_xp,
    'capped', v_points < v_original_points or (v_points = 0 and v_original_points > 0),
    'limit_remaining_before_claim', v_remaining_balance,
    'leveled_up', coalesce((v_level_result->>'leveled_up')::boolean, false),
    'level', coalesce((v_level_result->>'level')::integer, (select level from public.profiles where id = v_user_id)),
    'bonus_points', coalesce((v_level_result->>'bonus_points')::integer, 0),
    'xp_to_next', coalesce((v_level_result->>'xp_to_next')::integer, (select xp_to_next from public.profiles where id = v_user_id)),
    'label', coalesce(v_bonus->>'label', 'Gun ' || v_day),
    'emoji', v_bonus->>'emoji'
  );
end;
$$;

revoke all on function public.claim_daily_streak() from public;
revoke all on function public.claim_daily_streak() from anon;
grant execute on function public.claim_daily_streak() to authenticated;
