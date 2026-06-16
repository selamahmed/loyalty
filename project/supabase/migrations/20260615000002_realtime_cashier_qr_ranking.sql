-- Cashier / QR realtime ranking repair.
-- Run in Supabase SQL Editor, or keep as a migration in your Supabase flow.

create or replace function public.claim_qr_scan(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id      uuid := auth.uid();
  v_qr           public.qr_codes%rowtype;
  v_points       integer := 0;
  v_xp           integer := 0;
  v_ratio        integer := 1;
  v_is_cashier   boolean := false;
  v_level_result jsonb := '{}'::jsonb;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  perform public.assert_user_active(v_user_id);

  select * into v_qr
  from public.qr_codes
  where upper(trim(code)) = upper(trim(p_code))
    and active = true
  for update;

  if v_qr.id is null then
    raise exception 'QR code not found or inactive';
  end if;

  if v_qr.expires_at is not null and v_qr.expires_at < now() then
    raise exception 'QR code expired';
  end if;

  if v_qr.max_uses is not null and v_qr.uses_count >= v_qr.max_uses then
    raise exception 'QR code already used';
  end if;

  if exists (
    select 1 from public.qr_scans
    where user_id = v_user_id and qr_code_id = v_qr.id
  ) then
    raise exception 'QR already scanned by this user';
  end if;

  v_points := greatest(coalesce(v_qr.points, 0), 0);
  if v_points <= 0 then
    raise exception 'QR code has no points';
  end if;

  v_is_cashier := coalesce(v_qr.max_uses, 0) = 1 and v_qr.expires_at is not null;

  insert into public.qr_scans (user_id, qr_code_id, points_earned)
  values (v_user_id, v_qr.id, v_points);

  update public.qr_codes
  set uses_count = uses_count + 1,
      active = case
        when max_uses is not null and uses_count + 1 >= max_uses then false
        else active
      end
  where id = v_qr.id;

  -- The customer's wallet must receive exactly the value stored on qr_codes.points.
  -- Do not call earn_reward_internal('qr_scan'), because that uses the global QR rule.
  perform public.add_points(
    v_user_id,
    v_points,
    coalesce(v_qr.label, 'QR tarama'),
    'qr_scan',
    v_qr.id::text
  );

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'add_event_points_internal'
  ) then
    execute 'select public.add_event_points_internal($1, $2)' using v_user_id, v_points;
  end if;

  -- Cashier purchase QR codes are exact-value wallet claims. Skip add_xp for those,
  -- because add_xp can trigger level bonus points and make a 2 point QR look like 102.
  if not v_is_cashier and exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'add_xp'
  ) and exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'app_setting_int'
  ) then
    execute 'select public.app_setting_int($1, $2)' into v_ratio using 'xp_points_ratio', 1;
    v_xp := greatest(floor(v_points * v_ratio)::integer, 0);
    if v_xp > 0 then
      execute 'select public.add_xp($1, $2, $3)' into v_level_result using v_user_id, v_xp, 'qr_scan';
    end if;
  end if;

  return jsonb_build_object(
    'points', v_points,
    'qr_points', v_points,
    'xp', v_xp,
    'capped', false,
    'leveled_up', coalesce((v_level_result->>'leveled_up')::boolean, false),
    'level', coalesce((v_level_result->>'level')::integer, (select level from public.profiles where id = v_user_id)),
    'bonus_points', case when v_is_cashier then 0 else coalesce((v_level_result->>'bonus_points')::integer, 0) end,
    'xp_to_next', coalesce((v_level_result->>'xp_to_next')::integer, (select xp_to_next from public.profiles where id = v_user_id))
  );
end;
$$;

grant execute on function public.claim_qr_scan(text) to authenticated;

create or replace function public.add_points(
  p_user_id uuid,
  p_amount integer,
  p_description text,
  p_category text default null,
  p_reference_id text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.assert_user_active(p_user_id);

  update public.profiles
  set
    current_points = current_points + p_amount,
    total_points = total_points + p_amount,
    updated_at = now()
  where id = p_user_id;

  insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
  values (p_user_id, 'earned', p_amount, p_description, p_category, p_reference_id);

  if p_amount > 0
     and p_category in ('cashier_manual', 'admin_adjustment')
     and exists (
       select 1 from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'add_event_points_internal'
     ) then
    execute 'select public.add_event_points_internal($1, $2)' using p_user_id, p_amount;
  end if;
end;
$$;

create or replace function public.create_cashier_qr(
  p_code text,
  p_points integer,
  p_amount numeric,
  p_expires_at timestamptz
)
returns public.qr_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code    text := upper(trim(p_code));
  v_row     public.qr_codes%rowtype;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  perform public.assert_user_active(v_user_id);

  if not exists (
    select 1
    from public.profiles
    where id = v_user_id
      and status = 'active'
      and role in ('cashier', 'store_admin', 'super_admin')
  ) then
    raise exception 'Only active cashiers and admins can create cashier QR codes';
  end if;

  if v_code = '' then
    raise exception 'QR code is required';
  end if;

  if p_points is null or p_points <= 0 then
    raise exception 'QR points must be positive';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'QR amount must be positive';
  end if;

  if p_expires_at is null or p_expires_at <= now() then
    raise exception 'QR expiry must be in the future';
  end if;

  if p_expires_at > now() + interval '1 day' then
    raise exception 'Cashier QR expiry is too far in the future';
  end if;

  insert into public.qr_codes (
    code,
    store_id,
    points,
    label,
    active,
    max_uses,
    uses_count,
    expires_at
  )
  values (
    v_code,
    v_user_id::text,
    p_points,
    'Cashier QR - TRY ' || trim(to_char(p_amount, 'FM999999999990.00')),
    true,
    1,
    0,
    p_expires_at
  )
  returning * into v_row;

  return v_row;
exception
  when unique_violation then
    raise exception 'QR code already exists';
end;
$$;

grant execute on function public.create_cashier_qr(text, integer, numeric, timestamptz) to authenticated;

create or replace function public.lookup_redemption_by_code(p_code text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  result json;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform public.assert_user_active(v_user_id);

  if not exists (
    select 1
    from public.profiles
    where id = v_user_id
      and status = 'active'
      and role in ('cashier', 'store_admin', 'super_admin')
  ) then
    raise exception 'Only active cashiers and admins can look up redemption codes';
  end if;

  select json_build_object(
    'id',           r.id,
    'user_id',      r.user_id,
    'reward_id',    r.reward_id,
    'code',         r.code,
    'used',         r.used,
    'used_at',      r.used_at,
    'points_spent', r.points_spent,
    'expires_at',   r.expires_at,
    'barcode',      r.barcode,
    'created_at',   r.created_at,
    'profiles',     json_build_object('username', p.username, 'email', p.email),
    'rewards',      json_build_object(
      'title',       rw.title,
      'image',       rw.image,
      'category',    rw.category,
      'description', rw.description,
      'points',      rw.points
    )
  ) into result
  from public.redemptions r
  left join public.profiles p on p.id = r.user_id
  left join public.rewards rw on rw.id = r.reward_id
  where upper(r.code) = upper(trim(p_code))
  limit 1;

  return result;
end;
$$;

grant execute on function public.lookup_redemption_by_code(text) to authenticated;

create or replace function public.mark_redemption_used_by_code(p_code text)
returns public.redemptions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.redemptions%rowtype;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  perform public.assert_user_active(v_user_id);

  if not exists (
    select 1
    from public.profiles
    where id = v_user_id
      and status = 'active'
      and role in ('cashier', 'store_admin', 'super_admin')
  ) then
    raise exception 'Only active cashiers and admins can redeem tickets';
  end if;

  select * into v_row
  from public.redemptions
  where upper(code) = upper(trim(p_code))
  for update;

  if v_row.id is null then
    raise exception 'Redemption code not found';
  end if;

  if v_row.used then
    raise exception 'Redemption code already used';
  end if;

  if v_row.expires_at is not null and v_row.expires_at < now() then
    update public.redemptions
    set used = true,
        used_at = coalesce(used_at, now()),
        expires_at = least(coalesce(expires_at, now()), now())
    where id = v_row.id
    returning * into v_row;

    return v_row;
  end if;

  update public.redemptions
  set used = true,
      used_at = now(),
      expires_at = now()
  where id = v_row.id
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.mark_redemption_used_by_code(text) to authenticated;

drop policy if exists "Cashiers create cashier QR codes" on public.qr_codes;
create policy "Cashiers create cashier QR codes"
  on public.qr_codes for insert
  with check (
    auth.uid() is not null
    and store_id = auth.uid()::text
    and active = true
    and max_uses = 1
    and uses_count = 0
    and expires_at is not null
    and expires_at > now()
    and expires_at <= now() + interval '1 day'
    and points > 0
    and exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and status = 'active'
        and role in ('cashier', 'store_admin', 'super_admin')
    )
  );

create table if not exists public.leaderboard_signals (
  id integer primary key default 1 check (id = 1),
  version bigint not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.leaderboard_signals (id, version)
values (1, 0)
on conflict (id) do nothing;

alter table public.leaderboard_signals enable row level security;

drop policy if exists "Anyone reads leaderboard signal" on public.leaderboard_signals;
create policy "Anyone reads leaderboard signal"
  on public.leaderboard_signals for select
  using (true);

revoke all on public.leaderboard_signals from public;
grant select on public.leaderboard_signals to anon, authenticated;

create or replace function public.bump_leaderboard_signal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leaderboard_signals
  set version = version + 1,
      updated_at = now()
  where id = 1;

  if not found then
    insert into public.leaderboard_signals (id, version) values (1, 1);
  end if;

  return coalesce(new, old);
end;
$$;

drop trigger if exists profiles_bump_leaderboard on public.profiles;
create trigger profiles_bump_leaderboard
  after update of total_points on public.profiles
  for each row
  when (old.total_points is distinct from new.total_points)
  execute function public.bump_leaderboard_signal();

drop trigger if exists points_transactions_bump_leaderboard on public.points_transactions;
create trigger points_transactions_bump_leaderboard
  after insert or update or delete on public.points_transactions
  for each row
  execute function public.bump_leaderboard_signal();

do $$
begin
  if to_regclass('public.event_participants') is not null then
    execute 'drop trigger if exists event_participants_bump_leaderboard on public.event_participants';
    execute 'create trigger event_participants_bump_leaderboard
      after insert or update of points on public.event_participants
      for each row
      execute function public.bump_leaderboard_signal()';
  end if;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.profiles;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.points_transactions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.qr_codes;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.qr_scans;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.redemptions;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.leaderboard_signals;
exception when duplicate_object then null;
end $$;

do $$
begin
  if to_regclass('public.event_participants') is not null then
    execute 'alter publication supabase_realtime add table public.event_participants';
  end if;
exception when duplicate_object then null;
end $$;
