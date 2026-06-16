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
  v_xp           integer := 0;
  v_ratio        integer := 1;
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

  insert into public.qr_scans (user_id, qr_code_id, points_earned)
  values (v_user_id, v_qr.id, v_qr.points);

  update public.qr_codes
  set uses_count = uses_count + 1,
      active = case
        when max_uses is not null and uses_count + 1 >= max_uses then false
        else active
      end
  where id = v_qr.id;

  perform public.add_points(
    v_user_id,
    v_qr.points,
    coalesce(v_qr.label, 'QR tarama'),
    'qr_scan',
    v_qr.id::text
  );

  if exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'add_xp'
  ) and exists (
    select 1 from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'app_setting_int'
  ) then
    execute 'select public.app_setting_int($1, $2)' into v_ratio using 'xp_points_ratio', 1;
    v_xp := greatest(floor(v_qr.points * v_ratio)::integer, 0);
    if v_xp > 0 then
      execute 'select public.add_xp($1, $2, $3)' into v_level_result using v_user_id, v_xp, 'qr_scan';
    end if;
  end if;

  return jsonb_build_object(
    'points', v_qr.points,
    'qr_points', v_qr.points,
    'xp', v_xp,
    'capped', false,
    'leveled_up', coalesce((v_level_result->>'leveled_up')::boolean, false),
    'level', coalesce((v_level_result->>'level')::integer, (select level from public.profiles where id = v_user_id)),
    'bonus_points', coalesce((v_level_result->>'bonus_points')::integer, 0),
    'xp_to_next', coalesce((v_level_result->>'xp_to_next')::integer, (select xp_to_next from public.profiles where id = v_user_id))
  );
end;
$$;

grant execute on function public.claim_qr_scan(text) to authenticated;

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
