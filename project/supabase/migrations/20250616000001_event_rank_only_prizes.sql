-- Event prizes are rank-based only: top N participants by event points win.
-- pointsRequired in rewards_json is deprecated and not used for eligibility.

-- ── event_prizes view (rank slot metadata only) ──
create or replace view public.event_prizes as
select
  e.id as event_id,
  (elem->>'rank')::integer as rank,
  coalesce(elem->>'rewardName', elem->>'label', 'Ödül') as prize_title,
  elem->>'label' as prize_description,
  coalesce(elem->>'quantity', '1') as prize_value,
  elem->>'rewardImage' as prize_image
from public.events e,
     lateral jsonb_array_elements(coalesce(e.rewards_json, '[]'::jsonb)) elem
where (elem->>'rank') is not null;

comment on view public.event_prizes is 'Prize rows from events.rewards_json — winners are top-N by rank, not min points';

grant select on public.event_prizes to authenticated, anon;

-- ── Finalize: assign prizes to top ranks (no minimum points check) ──
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

  -- Top N ranks win; no minimum points threshold.
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
      coalesce(v_prize->>'quantity', '1')
    );
  end loop;

  return jsonb_build_object(
    'status', 'ended',
    'winners_created', (select count(*) from public.event_winners where event_id = p_event_id)
  );
end;
$$;

comment on function public.finalize_event(uuid) is
  'Locks event ranks and creates winners for top N participants. Prizes are rank-based only.';

-- Strip deprecated pointsRequired from stored prize JSON
update public.events
set rewards_json = (
  select coalesce(jsonb_agg(elem - 'pointsRequired'), '[]'::jsonb)
  from jsonb_array_elements(coalesce(rewards_json, '[]'::jsonb)) elem
)
where jsonb_array_length(coalesce(rewards_json, '[]'::jsonb)) > 0;
