-- Make every mini-game reward and daily play limit come from games_config.
-- Spin Wheel additionally validates the landed admin-configured prize slice.

update public.games_config
set
  config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
    'prizes',
    '[
      {"value":10,"color":"#7B6EF6"},
      {"value":50,"color":"#4F8EF7"},
      {"value":5,"color":"#22c55e"},
      {"value":100,"color":"#f59e0b"},
      {"value":25,"color":"#ef4444"},
      {"value":75,"color":"#8b5cf6"},
      {"value":0,"color":"#6b7280"},
      {"value":200,"color":"#ec4899"}
    ]'::jsonb
  ),
  max_points_per_play = 200,
  updated_at = now()
where config->>'game_id' = 'spin'
  and jsonb_typeof(config->'prizes') is distinct from 'array';

drop function if exists public.claim_game_reward(text);

create or replace function public.claim_game_reward(
  p_game_id text,
  p_prize integer default null
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_config jsonb;
  v_daily_limit integer;
  v_claim_count integer;
  v_max_pts integer;
  v_result jsonb;
  v_game text := lower(trim(p_game_id));
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

  if v_game not in ('spin', 'memory', 'catch', 'flappy', 'snake') then
    raise exception 'Invalid game';
  end if;

  select config, max_plays_per_day, max_points_per_play
  into v_config, v_daily_limit, v_max_pts
  from public.games_config
  where config->>'game_id' = v_game and enabled = true
  limit 1;

  if not found then raise exception 'Game is disabled or missing'; end if;

  if v_game = 'spin' then

    if p_prize is null then raise exception 'Spin prize is required'; end if;

    if not exists (
      select 1
      from jsonb_array_elements(coalesce(v_config->'prizes', '[]'::jsonb)) as configured(prize)
      where case
        when jsonb_typeof(configured.prize) = 'number'
          then (configured.prize #>> '{}')::integer
        when jsonb_typeof(configured.prize) = 'object'
          and coalesce(configured.prize->>'value', '') ~ '^\d+$'
          then (configured.prize->>'value')::integer
        else null
      end = p_prize
    ) then
      raise exception 'Invalid Spin Wheel prize';
    end if;

    v_max_pts := greatest(p_prize, 0);
  else
    v_max_pts := greatest(coalesce(v_max_pts, 0), 0);
  end if;

  -- Serialize claims per user/game so the configured daily limit cannot be
  -- exceeded by concurrent requests.
  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text || ':' || v_game, 0));

  select count(*) into v_claim_count
  from public.user_action_claims
  where user_id = v_user_id
    and action_type = 'game_win'
    and claim_date = (timezone('utc', now()))::date
    and (reference_id = v_game or reference_id like v_game || ':%');

  if v_daily_limit <= 0 or v_claim_count >= v_daily_limit then
    raise exception 'Daily game play limit reached';
  end if;

  insert into public.user_action_claims (user_id, action_type, reference_id, metadata)
  values (
    v_user_id,
    'game_win',
    v_game || ':' || (v_claim_count + 1),
    jsonb_build_object('game_id', v_game, 'configured_prize', v_max_pts)
  );

  update public.point_rules
  set value = v_max_pts, active = true
  where rule_type = 'game_win';

  if not found then
    insert into public.point_rules (name, rule_type, value, xp_value, active)
    values ('Mini Oyun', 'game_win', v_max_pts, 0, true);
  end if;

  v_result := public.earn_reward_internal(
    v_user_id,
    'game_win',
    'Mini oyun: ' || v_game,
    v_game || ':' || (v_claim_count + 1)
  );

  return v_result || jsonb_build_object('game_id', v_game, 'configured_prize', v_max_pts);
end;
$$;

grant execute on function public.claim_game_reward(text, integer) to authenticated;

create or replace function public.perform_action(
  p_action text,
  p_reference_id text default null,
  p_metadata jsonb default '{}'::jsonb
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
      return public.claim_game_reward(
        p_reference_id,
        case
          when p_metadata ? 'prize' and coalesce(p_metadata->>'prize', '') ~ '^\d+$'
            then (p_metadata->>'prize')::integer
          else null
        end
      );
    else
      raise exception 'Unknown action: %', p_action;
  end case;
end;
$$;

grant execute on function public.perform_action(text, text, jsonb) to authenticated;
