-- Keep reward events active through the full displayed end date.
-- The app presents reward events as date ranges, so 2026-06-17 ends at the
-- end of 2026-06-17 in the app's business timezone, not at midnight.

create or replace function public.event_effective_end_at(p_end_date timestamptz)
returns timestamptz
language sql
stable
as $$
  select (
    date_trunc('day', p_end_date at time zone 'Europe/Istanbul')
    + interval '1 day'
    - interval '1 millisecond'
  ) at time zone 'Europe/Istanbul';
$$;

create or replace function public.sync_event_status(p_event_id uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  for r in
    select id, published, active, start_date, end_date, status
    from public.events
    where (p_event_id is null or id = p_event_id)
      and status not in ('distributed')
  loop
    if coalesce(r.published, false) = false then
      update public.events set status = 'draft' where id = r.id and status <> 'draft';
    elsif public.event_effective_end_at(r.end_date) < now() and r.status = 'active' then
      perform public.finalize_event(r.id);
    elsif coalesce(r.published, false)
      and r.start_date <= now()
      and public.event_effective_end_at(r.end_date) >= now()
      and r.status in ('draft', 'ended') then
      delete from public.event_winners
      where event_id = r.id
        and distributed = false;

      update public.events
      set status = 'active',
          active = true
      where id = r.id;
    end if;
  end loop;
end;
$$;

create or replace function public.join_event(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_event   public.events%rowtype;
  v_row     public.event_participants%rowtype;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  perform public.assert_user_active(v_user_id);

  perform public.sync_event_status(p_event_id);

  select * into v_event from public.events where id = p_event_id;
  if v_event.id is null then raise exception 'Event not found'; end if;
  if v_event.status <> 'active' then raise exception 'Event is not active'; end if;
  if public.event_effective_end_at(v_event.end_date) < now() then raise exception 'Event has ended'; end if;

  insert into public.event_participants (event_id, user_id)
  values (p_event_id, v_user_id)
  on conflict (event_id, user_id) do nothing
  returning * into v_row;

  if v_row.id is null then
    select * into v_row
    from public.event_participants
    where event_id = p_event_id and user_id = v_user_id;
  end if;

  perform public.refresh_event_ranks(p_event_id);

  select * into v_row
  from public.event_participants
  where event_id = p_event_id and user_id = v_user_id;

  return jsonb_build_object(
    'event_id', p_event_id,
    'user_id',  v_user_id,
    'points',   v_row.points,
    'rank',     v_row.rank
  );
end;
$$;

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

  if public.event_effective_end_at(v_event.end_date) > now() then
    if not public.is_admin() then
      raise exception 'Event has not ended yet';
    end if;
  end if;

  perform public.refresh_event_ranks(p_event_id);

  update public.events
  set status = 'ended', active = false
  where id = p_event_id;

  delete from public.event_winners
  where event_id = p_event_id
    and distributed = false;

  for r in
    select ep.user_id, ep.points, ep.rank, p.username
    from public.event_participants ep
    join public.profiles p on p.id = ep.user_id
    where ep.event_id = p_event_id
      and p.status <> 'suspended'
      and ep.points > 0
    order by ep.points desc, ep.updated_at asc, ep.created_at asc
    limit coalesce(v_event.win_count, 3)
  loop
    v_prize := null;
    if jsonb_typeof(coalesce(v_event.rewards_json, '[]'::jsonb)) = 'array' then
      select prize into v_prize
      from jsonb_array_elements(v_event.rewards_json) prize
      where (prize->>'rank')::integer = r.rank
      limit 1;
    end if;

    insert into public.event_winners (
      event_id, user_id, final_rank, final_points,
      prize_title, prize_description, prize_value
    )
    values (
      p_event_id,
      r.user_id,
      r.rank,
      r.points,
      coalesce(v_prize->>'rewardName', 'Rank #' || r.rank || ' prize'),
      v_prize->>'label',
      nullif(v_prize->>'rewardImage', '')
    );
  end loop;

  get diagnostics v_n = row_count;
  return jsonb_build_object('status', 'ended', 'winners', v_n);
end;
$$;

grant execute on function public.event_effective_end_at(timestamptz) to anon, authenticated;
grant execute on function public.sync_event_status(uuid) to anon, authenticated;
grant execute on function public.join_event(uuid) to authenticated;
grant execute on function public.finalize_event(uuid) to authenticated;

comment on function public.event_effective_end_at(timestamptz) is
  'Returns the inclusive end-of-day timestamp for reward event date ranges in Europe/Istanbul.';
