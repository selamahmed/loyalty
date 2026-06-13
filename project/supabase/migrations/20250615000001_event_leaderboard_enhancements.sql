-- Event leaderboard enhancements: gap-to-next-rank, prizes view, finalize hardening

-- ── event_prizes view (prizes stored in events.rewards_json) ──
create or replace view public.event_prizes as
select
  e.id as event_id,
  (elem->>'rank')::integer as rank,
  coalesce(elem->>'rewardName', elem->>'label', 'Ödül') as prize_title,
  elem->>'label' as prize_description,
  coalesce(elem->>'quantity', elem->>'pointsRequired', '') as prize_value,
  elem->>'rewardImage' as prize_image,
  coalesce((elem->>'pointsRequired')::integer, 0) as points_required
from public.events e,
     lateral jsonb_array_elements(coalesce(e.rewards_json, '[]'::jsonb)) elem
where (elem->>'rank') is not null;

comment on view public.event_prizes is 'Normalized prize rows from events.rewards_json';

grant select on public.event_prizes to authenticated, anon;

-- ── Extended participation: rank, points, gap to next rank ──
create or replace function public.get_my_event_participation(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_row          public.event_participants%rowtype;
  v_status       public.event_status;
  v_above_pts    integer;
  v_gap          integer;
begin
  if v_user_id is null then return null; end if;

  perform public.sync_event_status(p_event_id);

  select status into v_status from public.events where id = p_event_id;

  select * into v_row
  from public.event_participants
  where event_id = p_event_id and user_id = v_user_id;

  if v_row.id is null then
    return jsonb_build_object('joined', false);
  end if;

  if v_status = 'active' then
    perform public.refresh_event_ranks(p_event_id);
    select * into v_row
    from public.event_participants
    where event_id = p_event_id and user_id = v_user_id;
  end if;

  v_gap := null;
  if v_row.rank is not null and v_row.rank > 1 then
    select ep.points into v_above_pts
    from public.event_participants ep
    where ep.event_id = p_event_id and ep.rank = v_row.rank - 1
    limit 1;
    v_gap := greatest(1, coalesce(v_above_pts, 0) - v_row.points + 1);
  elsif v_row.rank = 1 then
    v_gap := 0;
  end if;

  return jsonb_build_object(
    'joined', true,
    'points', v_row.points,
    'rank',   v_row.rank,
    'gap_to_next_rank', v_gap
  );
end;
$$;

-- ── Finalize: auto when ended; early finalize admin-only ──
create or replace function public.finalize_event(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
  v_n     integer;
  r       record;
  v_prize jsonb;
begin
  select * into v_event from public.events where id = p_event_id for update;
  if v_event.id is null then raise exception 'Event not found'; end if;
  if v_event.status = 'distributed' then
    return jsonb_build_object('status', 'distributed', 'winners', (select count(*) from public.event_winners where event_id = p_event_id));
  end if;
  if v_event.status = 'ended' and exists (select 1 from public.event_winners where event_id = p_event_id) then
    return jsonb_build_object('status', 'ended', 'winners', (select count(*) from public.event_winners where event_id = p_event_id));
  end if;

  if v_event.end_date > now() then
    if not public.is_admin() then
      raise exception 'Event has not ended yet';
    end if;
  end if;

  perform public.refresh_event_ranks(p_event_id);

  update public.events
  set status = 'ended', active = false
  where id = p_event_id;

  v_n := coalesce(v_event.win_count, 3);

  delete from public.event_winners where event_id = p_event_id;

  for r in
    select ep.user_id, ep.points, ep.rank
    from public.event_participants ep
    where ep.event_id = p_event_id
      and ep.rank is not null
      and ep.rank <= v_n
    order by ep.rank asc
  loop
    select elem into v_prize
    from public.events e,
         lateral jsonb_array_elements(coalesce(e.rewards_json, '[]'::jsonb)) elem
    where e.id = p_event_id
      and (elem->>'rank')::integer = r.rank
    limit 1;

    insert into public.event_winners (
      event_id, user_id, final_rank, final_points,
      prize_title, prize_description, prize_value
    ) values (
      p_event_id,
      r.user_id,
      r.rank,
      r.points,
      coalesce(v_prize->>'rewardName', v_prize->>'label', 'Ödül'),
      v_prize->>'label',
      coalesce(v_prize->>'quantity', v_prize->>'pointsRequired', '')
    );
  end loop;

  return jsonb_build_object(
    'status', 'ended',
    'winners_created', (select count(*) from public.event_winners where event_id = p_event_id)
  );
end;
$$;

-- Allow public read of winners once event ended (for winners page)
drop policy if exists "Read event winners" on public.event_winners;
create policy "Read event winners"
  on public.event_winners for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and e.status in ('ended', 'distributed')
    )
    or public.is_admin()
    or user_id = auth.uid()
  );
