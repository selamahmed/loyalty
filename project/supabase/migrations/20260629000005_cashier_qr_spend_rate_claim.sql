-- Cashier purchase QR claims: points = harcama tutarı × points_per_currency (not static qr_scan_bonus).

create or replace function public.app_setting_num(p_key text, p_default numeric)
returns numeric
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v jsonb;
  n numeric;
begin
  select value into v from public.app_settings where key = p_key limit 1;
  if v is null then
    return p_default;
  end if;
  if jsonb_typeof(v) = 'number' then
    return greatest((v #>> '{}')::numeric, 0);
  end if;
  begin
    n := trim(both '"' from v::text)::numeric;
    return greatest(n, 0);
  exception when others then
    return p_default;
  end;
end;
$$;

grant execute on function public.app_setting_num(text, numeric) to authenticated;

create or replace function public.cashier_qr_amount_from_label(p_label text)
returns numeric
language sql
immutable
as $$
  select case
    when regexp_match(coalesce(p_label, ''), 'TRY[[:space:]]*([0-9]+(\.[0-9]+)?)', 'i') is null then null
    else (regexp_match(coalesce(p_label, ''), 'TRY[[:space:]]*([0-9]+(\.[0-9]+)?)', 'i'))[1]::numeric
  end;
$$;

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
  v_amount       numeric := null;
  v_rate         numeric := 10;
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

  v_is_cashier := coalesce(v_qr.max_uses, 0) = 1 and v_qr.expires_at is not null;

  if v_is_cashier then
    v_amount := public.cashier_qr_amount_from_label(v_qr.label);
    v_rate := public.app_setting_num('points_per_currency', 10);
    if v_amount is not null and v_amount > 0 and v_rate > 0 then
      v_points := greatest(round(v_amount * v_rate)::integer, 1);
    else
      v_points := greatest(coalesce(v_qr.points, 0), 0);
    end if;
  else
    v_points := greatest(coalesce(v_qr.points, 0), 0);
  end if;

  if v_points <= 0 then
    raise exception 'QR code has no points';
  end if;

  insert into public.qr_scans (user_id, qr_code_id, points_earned)
  values (v_user_id, v_qr.id, v_points);

  update public.qr_codes
  set uses_count = uses_count + 1,
      active = case
        when max_uses is not null and uses_count + 1 >= max_uses then false
        else active
      end
  where id = v_qr.id;

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
    'amount', v_amount,
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

create or replace function public.preview_qr_scan(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text := upper(trim(coalesce(p_code, '')));
  v_qr public.qr_codes%rowtype;
  v_amount numeric := null;
  v_points integer := 0;
  v_rate numeric := 10;
  v_is_cashier boolean := false;
  v_already_scanned boolean := false;
  v_status text := 'pending';
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if v_code !~ '^[A-Z0-9_-]{4,64}$' then
    raise exception 'Invalid QR code';
  end if;

  perform public.assert_user_active(v_user_id);

  select * into v_qr
  from public.qr_codes
  where upper(trim(code)) = v_code
  limit 1;

  if v_qr.id is null then
    return null;
  end if;

  select exists (
    select 1
    from public.qr_scans
    where user_id = v_user_id
      and qr_code_id = v_qr.id
  ) into v_already_scanned;

  if v_qr.expires_at is not null and v_qr.expires_at < now() then
    v_status := 'expired';
  elsif v_already_scanned or (v_qr.max_uses is not null and v_qr.uses_count >= v_qr.max_uses) then
    v_status := 'used';
  elsif not v_qr.active then
    v_status := 'inactive';
  else
    v_status := 'pending';
  end if;

  v_is_cashier := coalesce(v_qr.max_uses, 0) = 1 and v_qr.expires_at is not null;

  if v_is_cashier then
    v_amount := public.cashier_qr_amount_from_label(v_qr.label);
    v_rate := public.app_setting_num('points_per_currency', 10);
    if v_amount is not null and v_amount > 0 and v_rate > 0 then
      v_points := greatest(round(v_amount * v_rate)::integer, 1);
    else
      v_points := greatest(coalesce(v_qr.points, 0), 0);
    end if;
  else
    v_points := greatest(coalesce(v_qr.points, 0), 0);
  end if;

  return jsonb_build_object(
    'code', v_qr.code,
    'title', coalesce(v_qr.label, 'Magaza QR Kodu'),
    'points', v_points,
    'location', case
      when v_qr.store_id is null or v_qr.store_id = '' then 'Magaza'
      else 'Magaza #' || v_qr.store_id
    end,
    'amount', v_amount,
    'expires_at', v_qr.expires_at,
    'issued_at', v_qr.created_at,
    'status', v_status,
    'is_cashier', v_is_cashier,
    'already_scanned', v_already_scanned
  );
end;
$$;

grant execute on function public.preview_qr_scan(text) to authenticated;
