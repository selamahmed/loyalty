-- Safe QR preview for manual code entry.
-- This exposes only claim-display fields for a code the user already knows.
-- Actual one-use claiming still happens atomically in public.claim_qr_scan().

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
  v_amount_match text[];
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

  if coalesce(v_qr.max_uses, 0) = 1 and v_qr.expires_at is not null then
    v_amount_match := regexp_match(coalesce(v_qr.label, ''), 'TRY[[:space:]]*([0-9]+(\.[0-9]+)?)', 'i');
    if v_amount_match is not null then
      v_amount := v_amount_match[1]::numeric;
    end if;
  end if;

  return jsonb_build_object(
    'code', v_qr.code,
    'title', coalesce(v_qr.label, 'Magaza QR Kodu'),
    'points', v_qr.points,
    'location', case
      when v_qr.store_id is null or v_qr.store_id = '' then 'Magaza'
      else 'Magaza #' || v_qr.store_id
    end,
    'amount', v_amount,
    'expires_at', v_qr.expires_at,
    'issued_at', v_qr.created_at,
    'status', v_status,
    'is_cashier', coalesce(v_qr.max_uses, 0) = 1 and v_qr.expires_at is not null,
    'already_scanned', v_already_scanned
  );
end;
$$;

grant execute on function public.preview_qr_scan(text) to authenticated;
