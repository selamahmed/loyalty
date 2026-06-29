-- Repair QR point claims:
-- - Cast points_transactions.type to the transaction_type enum.
-- - Keep QR claims exact-value and one-use safe.
-- - Keep loyalty max-points validation server-side.

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
declare
  v_current_points integer := 0;
  v_limit_enabled boolean := true;
  v_max_points integer := 1200;
  v_type public.transaction_type;
begin
  if p_user_id is null then
    raise exception 'User is required';
  end if;

  if to_regprocedure('public.assert_user_active(uuid)') is not null then
    perform public.assert_user_active(p_user_id);
  end if;

  if p_amount is null or p_amount = 0 then
    return;
  end if;

  if to_regprocedure('public.app_setting_bool(text, boolean)') is not null then
    v_limit_enabled := public.app_setting_bool('points_limit_enabled', true);
  end if;

  if to_regprocedure('public.app_setting_int(text, integer)') is not null then
    v_max_points := public.app_setting_int('max_points_limit', 1200);
  end if;

  select current_points
  into v_current_points
  from public.profiles
  where id = p_user_id
  for update;

  if not found then
    raise exception 'User not found';
  end if;

  if p_amount > 0 and v_limit_enabled and v_max_points > 0 then
    if v_current_points >= v_max_points then
      raise exception 'You have reached the maximum loyalty points limit of % points. You cannot claim more points at this time.', v_max_points;
    end if;

    if v_current_points + p_amount > v_max_points then
      raise exception 'This claim would exceed the maximum loyalty points limit of % points.', v_max_points;
    end if;
  end if;

  v_type := case
    when p_amount > 0 then 'earned'::public.transaction_type
    else 'adjusted'::public.transaction_type
  end;

  update public.profiles
  set current_points = greatest(current_points + p_amount, 0),
      total_points = case when p_amount > 0 then total_points + p_amount else total_points end,
      updated_at = now()
  where id = p_user_id;

  insert into public.points_transactions(user_id, type, amount, description, category, reference_id)
  values (
    p_user_id,
    v_type,
    abs(p_amount),
    left(coalesce(p_description, 'Points update'), 500),
    p_category,
    p_reference_id
  );

  if p_amount > 0
     and p_category in ('cashier_manual', 'admin_adjustment')
     and to_regprocedure('public.add_event_points_internal(uuid, integer)') is not null then
    perform public.add_event_points_internal(p_user_id, p_amount);
  end if;
end;
$$;

revoke all on function public.add_points(uuid, integer, text, text, text) from public;
revoke all on function public.add_points(uuid, integer, text, text, text) from anon;
grant execute on function public.add_points(uuid, integer, text, text, text) to authenticated;

delete from public.qr_scans a
using public.qr_scans b
where a.ctid < b.ctid
  and a.user_id = b.user_id
  and a.qr_code_id = b.qr_code_id;

create unique index if not exists qr_scans_user_qr_uidx
  on public.qr_scans(user_id, qr_code_id);

create or replace function public.claim_qr_scan(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_qr public.qr_codes%rowtype;
  v_points integer := 0;
  v_xp integer := 0;
  v_ratio integer := 1;
  v_is_cashier boolean := false;
  v_level_result jsonb := '{}'::jsonb;
  v_claim_code text := upper(trim(coalesce(p_code, '')));
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  if length(v_claim_code) < 4 then
    raise exception 'Invalid QR code';
  end if;

  if to_regprocedure('public.assert_user_active(uuid)') is not null then
    perform public.assert_user_active(v_user_id);
  end if;

  select * into v_qr
  from public.qr_codes
  where upper(trim(code)) = v_claim_code
  for update;

  if not found or v_qr.id is null then
    raise exception 'QR code not found or inactive';
  end if;

  if not coalesce(v_qr.active, false) then
    raise exception 'QR code not found or inactive';
  end if;

  if v_qr.expires_at is not null and v_qr.expires_at <= now() then
    update public.qr_codes
    set active = false
    where id = v_qr.id
      and coalesce(max_uses, 0) = 1;
    raise exception 'QR code expired';
  end if;

  if v_qr.max_uses is not null and v_qr.uses_count >= v_qr.max_uses then
    update public.qr_codes
    set active = false
    where id = v_qr.id;
    raise exception 'QR code already used';
  end if;

  if exists (
    select 1
    from public.qr_scans
    where user_id = v_user_id
      and qr_code_id = v_qr.id
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

  perform public.add_points(
    v_user_id,
    v_points,
    coalesce(v_qr.label, 'QR tarama'),
    'qr_scan',
    v_qr.id::text
  );

  if to_regprocedure('public.add_event_points_internal(uuid, integer)') is not null then
    perform public.add_event_points_internal(v_user_id, v_points);
  end if;

  -- Cashier purchase QR codes must credit exactly qr_codes.points. Do not add
  -- XP/level bonus points for those, otherwise a small cashier QR can look huge.
  if not v_is_cashier
     and to_regprocedure('public.add_xp(uuid, integer, text)') is not null
     and to_regprocedure('public.app_setting_int(text, integer)') is not null then
    v_ratio := public.app_setting_int('xp_points_ratio', 1);
    v_xp := greatest(floor(v_points * greatest(v_ratio, 0))::integer, 0);
    if v_xp > 0 then
      begin
        select public.add_xp(v_user_id, v_xp, 'qr_scan') into v_level_result;
      exception when others then
        v_level_result := '{}'::jsonb;
        v_xp := 0;
      end;
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

revoke all on function public.claim_qr_scan(text) from public;
revoke all on function public.claim_qr_scan(text) from anon;
grant execute on function public.claim_qr_scan(text) to authenticated;

notify pgrst, 'reload schema';
