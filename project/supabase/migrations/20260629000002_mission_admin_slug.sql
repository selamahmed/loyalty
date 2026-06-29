-- Admin missions: behavior slug + per-mission reward points.

alter table public.missions
  add column if not exists slug text,
  add column if not exists sort_order integer not null default 0;

create index if not exists missions_active_category_idx
  on public.missions (category, sort_order)
  where active = true;

update public.missions set slug = 'daily_visit' where slug is null and title = 'Günlük Ziyaret';
update public.missions set slug = 'qr_scan' where slug is null and title = 'QR Kod Tara';
update public.missions set slug = 'shop_visit' where slug is null and title = 'Ödüllere Göz At';
update public.missions set slug = 'achievements_visit' where slug is null and title = 'Başarımları Gör';
update public.missions set slug = 'refer_friend' where slug is null and title = 'Arkadaşını Davet Et';
update public.missions set slug = 'leaderboard_top10' where slug is null and title = 'Liderlik Tablosuna Gir';

insert into public.app_settings (key, value, description, category)
values ('missions_enabled', 'true', 'Görev modülü aktif / pasif', 'features')
on conflict (key) do nothing;

create or replace function public.claim_mission_reward(p_mission_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_mission      public.missions%rowtype;
  v_period_start timestamptz;
  v_points       integer := 0;
  v_xp           integer := 0;
  v_ratio        integer := 1;
  v_max_pts      integer;
  v_max_xp       integer;
  v_daily_pts    integer := 0;
  v_daily_xp     integer := 0;
  v_level_result jsonb := '{}'::jsonb;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

  if not public.app_setting_bool('missions_enabled', true) then
    raise exception 'Missions are disabled';
  end if;

  select * into v_mission from public.missions where id = p_mission_id and active = true;
  if v_mission.id is null then raise exception 'Mission not found'; end if;

  v_period_start := public.mission_period_start(v_mission.category);

  if exists (
    select 1 from public.user_missions
    where user_id = v_user_id
      and mission_id = p_mission_id
      and completed = true
      and completed_at >= v_period_start
  ) then
    raise exception 'Mission already completed';
  end if;

  insert into public.user_missions (user_id, mission_id, completed, completed_at, reset_at)
  values (v_user_id, p_mission_id, true, now(), v_period_start)
  on conflict (user_id, mission_id) do update
    set completed = true,
        completed_at = now(),
        reset_at = excluded.reset_at;

  v_points := greatest(coalesce(v_mission.points, 0), 0);
  v_ratio := public.app_setting_int('xp_points_ratio', 1);
  v_xp := floor(v_points * v_ratio)::integer;

  v_max_pts := public.app_setting_int('max_daily_points', 500);
  v_max_xp  := public.app_setting_int('max_daily_xp', 500);

  insert into public.user_daily_earnings (user_id, earn_date, points_earned, xp_earned)
  values (v_user_id, (timezone('utc', now()))::date, 0, 0)
  on conflict (user_id, earn_date) do nothing;

  select points_earned, xp_earned into v_daily_pts, v_daily_xp
  from public.user_daily_earnings
  where user_id = v_user_id and earn_date = (timezone('utc', now()))::date;

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
      'level', (select level from public.profiles where id = v_user_id)
    );
  end if;

  if v_points > 0 then
    perform public.add_points(
      v_user_id,
      v_points,
      'Görev: ' || v_mission.title,
      'mission_complete',
      p_mission_id::text
    );
  end if;

  if v_xp > 0 then
    v_level_result := public.add_xp(v_user_id, v_xp, 'mission_complete');
  end if;

  update public.user_daily_earnings
  set points_earned = points_earned + v_points,
      xp_earned     = xp_earned + v_xp
  where user_id = v_user_id and earn_date = (timezone('utc', now()))::date;

  return jsonb_build_object(
    'points', v_points,
    'xp', v_xp,
    'capped', false,
    'level', coalesce((v_level_result->>'level')::integer, (select level from public.profiles where id = v_user_id)),
    'leveled_up', coalesce((v_level_result->>'leveled_up')::boolean, false)
  );
end;
$$;

grant execute on function public.claim_mission_reward(uuid) to authenticated;
