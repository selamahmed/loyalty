-- Daily / weekly mission periods: allow re-claim after reset window.

create or replace function public.mission_period_start(p_category public.mission_category)
returns timestamptz
language sql
stable
as $$
  select case
    when p_category = 'weekly' then date_trunc('week', timezone('Europe/Istanbul', now()))
    else date_trunc('day', timezone('Europe/Istanbul', now()))
  end;
$$;

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
  v_period_start timestamptz;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

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

  v_result := public.earn_reward_internal(
    v_user_id, 'mission_complete',
    'Görev: ' || v_mission.title,
    p_mission_id::text
  );

  return v_result;
end;
$$;

grant execute on function public.mission_period_start(public.mission_category) to authenticated;
grant execute on function public.claim_mission_reward(uuid) to authenticated;
