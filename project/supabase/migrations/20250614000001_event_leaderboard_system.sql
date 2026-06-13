-- ============================================================
-- Event leaderboard system: event-specific points, winners, distribution
-- Tie-break: higher points first; equal points → earlier updated_at wins
-- (user who reached the score first keeps the higher rank)
-- ============================================================

-- ── Event status enum ─────────────────────────────────────────
do $$ begin
  create type public.event_status as enum ('draft', 'active', 'ended', 'distributed');
exception when duplicate_object then null;
end $$;

alter table public.events
  add column if not exists status public.event_status not null default 'draft';

-- Backfill status from existing flags
update public.events e
set status = case
  when coalesce(e.published, false) = false then 'draft'::public.event_status
  when e.end_date < now() then 'ended'::public.event_status
  when e.start_date <= now() and e.end_date >= now() and e.active then 'active'::public.event_status
  when e.start_date > now() and coalesce(e.published, false) then 'active'::public.event_status
  else 'draft'::public.event_status
end
where e.status = 'draft';

-- number_of_winners alias: win_count already exists
comment on column public.events.win_count is 'number_of_winners — top N ranks receive prizes';

-- ── event_participants ────────────────────────────────────────
create table if not exists public.event_participants (
  id         uuid primary key default gen_random_uuid(),
  event_id   uuid not null references public.events(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  points     integer not null default 0 check (points >= 0),
  rank       integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists event_participants_event_id_idx
  on public.event_participants (event_id);
create index if not exists event_participants_event_points_idx
  on public.event_participants (event_id, points desc, updated_at asc);
create index if not exists event_participants_user_id_idx
  on public.event_participants (user_id);

-- ── event_winners ─────────────────────────────────────────────
create table if not exists public.event_winners (
  id                uuid primary key default gen_random_uuid(),
  event_id          uuid not null references public.events(id) on delete cascade,
  user_id           uuid not null references public.profiles(id) on delete cascade,
  final_rank        integer not null check (final_rank >= 1),
  final_points      integer not null default 0,
  prize_title       text not null default '',
  prize_description text,
  prize_value       text,
  distributed       boolean not null default false,
  distributed_at    timestamptz,
  created_at        timestamptz not null default now(),
  unique (event_id, final_rank),
  unique (event_id, user_id)
);

create index if not exists event_winners_event_id_idx
  on public.event_winners (event_id);
create index if not exists event_winners_distributed_idx
  on public.event_winners (event_id, distributed);

-- ── updated_at trigger ────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists event_participants_updated_at on public.event_participants;
create trigger event_participants_updated_at
  before update on public.event_participants
  for each row execute function public.set_updated_at();

-- ── Sync event status from dates / publication ────────────────
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
    elsif r.end_date < now() and r.status = 'active' then
      perform public.finalize_event(r.id);
    elsif r.status = 'draft' and coalesce(r.published, false) and r.end_date >= now() then
      update public.events set status = 'active', active = true where id = r.id;
    end if;
  end loop;
end;
$$;

-- ── Recompute ranks for live leaderboard ───────────────────────
-- Tie-break: points DESC, then updated_at ASC (earlier score = higher rank)
create or replace function public.refresh_event_ranks(p_event_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  with ranked as (
    select
      ep.id,
      rank() over (
        order by ep.points desc, ep.updated_at asc, ep.created_at asc
      )::integer as new_rank
    from public.event_participants ep
    where ep.event_id = p_event_id
  )
  update public.event_participants ep
  set rank = ranked.new_rank
  from ranked
  where ep.id = ranked.id;
end;
$$;

-- ── Add event points (server-side only) ───────────────────────
create or replace function public.add_event_points_internal(
  p_user_id uuid,
  p_points  integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  r record;
begin
  if p_points is null or p_points <= 0 then return; end if;

  perform public.sync_event_status(null);

  for r in
    select ep.id, ep.event_id
    from public.event_participants ep
    join public.events e on e.id = ep.event_id
    where ep.user_id = p_user_id
      and e.status = 'active'
      and e.start_date <= now()
      and e.end_date >= now()
      and coalesce(e.rewards_json, '[]'::jsonb) <> '[]'::jsonb
  loop
    update public.event_participants
    set points = points + p_points
    where id = r.id;

    perform public.refresh_event_ranks(r.event_id);
  end loop;
end;
$$;

-- Hook into earn_reward_internal
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
    perform public.add_event_points_internal(p_user_id, v_points);
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

-- ── Join event ────────────────────────────────────────────────
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
  if v_event.end_date < now() then raise exception 'Event has ended'; end if;

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

-- ── Finalize event: lock ranks, insert winners ────────────────
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
  if v_event.end_date > now() and v_event.status = 'active' then
    raise exception 'Event has not ended yet';
  end if;

  perform public.refresh_event_ranks(p_event_id);

  update public.events
  set status = 'ended', active = false
  where id = p_event_id;

  v_n := coalesce(v_event.win_count, 3);

  delete from public.event_winners where event_id = p_event_id;

  for r in
    select
      ep.user_id,
      ep.points,
      ep.rank
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

-- ── Mark winner distributed (admin) ───────────────────────────
create or replace function public.mark_winner_distributed(p_winner_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event_id uuid;
  v_pending  integer;
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;

  update public.event_winners
  set distributed = true, distributed_at = now()
  where id = p_winner_id and distributed = false
  returning event_id into v_event_id;

  if v_event_id is null then
    raise exception 'Winner not found or already distributed';
  end if;

  select count(*) into v_pending
  from public.event_winners
  where event_id = v_event_id and distributed = false;

  if v_pending = 0 then
    update public.events set status = 'distributed' where id = v_event_id;
  end if;

  return jsonb_build_object('event_id', v_event_id, 'pending', v_pending);
end;
$$;

-- ── Get event leaderboard ─────────────────────────────────────
create or replace function public.get_event_leaderboard(
  p_event_id uuid,
  p_limit    integer default 50
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_event public.events%rowtype;
begin
  perform public.sync_event_status(p_event_id);

  select * into v_event from public.events where id = p_event_id;
  if v_event.id is null then raise exception 'Event not found'; end if;

  if v_event.status = 'active' then
    perform public.refresh_event_ranks(p_event_id);
  end if;

  return coalesce((
    select jsonb_agg(row order by row->>'rank')
    from (
      select jsonb_build_object(
        'id',          p.id,
        'username',    p.username,
        'avatar_url',  p.avatar_url,
        'level',       p.level,
        'points',      ep.points,
        'rank',        ep.rank,
        'updated_at',  ep.updated_at
      ) as row
      from public.event_participants ep
      join public.profiles p on p.id = ep.user_id
      where ep.event_id = p_event_id
        and p.status = 'active'
      order by ep.points desc, ep.updated_at asc, ep.created_at asc
      limit greatest(1, least(p_limit, 100))
    ) sub
  ), '[]'::jsonb);
end;
$$;

-- ── Get my event participation ────────────────────────────────
create or replace function public.get_my_event_participation(p_event_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row     public.event_participants%rowtype;
begin
  if v_user_id is null then return null; end if;

  perform public.sync_event_status(p_event_id);

  select * into v_row
  from public.event_participants
  where event_id = p_event_id and user_id = v_user_id;

  if v_row.id is null then
    return jsonb_build_object('joined', false);
  end if;

  if (select status from public.events where id = p_event_id) = 'active' then
    perform public.refresh_event_ranks(p_event_id);
    select * into v_row
    from public.event_participants
    where event_id = p_event_id and user_id = v_user_id;
  end if;

  return jsonb_build_object(
    'joined', true,
    'points', v_row.points,
    'rank',   v_row.rank
  );
end;
$$;

-- ── RLS ───────────────────────────────────────────────────────
alter table public.event_participants enable row level security;
alter table public.event_winners enable row level security;

drop policy if exists "Read event participants" on public.event_participants;
create policy "Read event participants"
  on public.event_participants for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (
          e.status in ('active', 'ended', 'distributed')
          or public.is_admin()
        )
    )
  );

drop policy if exists "No direct participant writes" on public.event_participants;
create policy "No direct participant writes"
  on public.event_participants for insert
  with check (false);

drop policy if exists "No direct participant updates" on public.event_participants;
create policy "No direct participant updates"
  on public.event_participants for update
  using (false);

drop policy if exists "Read event winners" on public.event_winners;
create policy "Read event winners"
  on public.event_winners for select
  using (
    exists (
      select 1 from public.events e
      where e.id = event_id
        and (e.status in ('ended', 'distributed') or public.is_admin())
    )
    or (
      user_id = auth.uid()
      and exists (select 1 from public.events e where e.id = event_id and e.status in ('active','ended','distributed'))
    )
  );

drop policy if exists "Admins manage event winners" on public.event_winners;
create policy "Admins manage event winners"
  on public.event_winners for all
  using (public.is_admin())
  with check (public.is_admin());

-- Realtime for live leaderboard
alter publication supabase_realtime add table public.event_participants;

-- Grants
grant execute on function public.join_event(uuid) to authenticated;
grant execute on function public.get_event_leaderboard(uuid, integer) to authenticated, anon;
grant execute on function public.get_my_event_participation(uuid) to authenticated;
grant execute on function public.mark_winner_distributed(uuid) to authenticated;
grant execute on function public.finalize_event(uuid) to authenticated;
grant execute on function public.sync_event_status(uuid) to authenticated;
