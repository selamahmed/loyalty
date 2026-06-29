-- Connect Admin QR Manager to Supabase-owned QR generation and real tables.
-- Safe to run multiple times in Supabase SQL Editor.

create extension if not exists pgcrypto;

alter table public.qr_codes enable row level security;

drop policy if exists "Admins manage qr_codes" on public.qr_codes;
create policy "Admins manage qr_codes"
  on public.qr_codes for all
  using (public.is_cashier_or_admin())
  with check (public.is_cashier_or_admin());

drop policy if exists "Privileged users read QR codes" on public.qr_codes;
create policy "Privileged users read QR codes"
  on public.qr_codes for select
  using (public.is_cashier_or_admin());

drop policy if exists "Admins manage all redemptions" on public.redemptions;
create policy "Admins manage all redemptions"
  on public.redemptions for all
  using (public.is_cashier_or_admin())
  with check (public.is_cashier_or_admin());

create or replace function public.admin_create_store_qr(
  p_label text default null,
  p_points integer default 50,
  p_max_uses integer default null,
  p_expires_at timestamptz default null
)
returns public.qr_codes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_code text;
  v_row public.qr_codes%rowtype;
  v_attempt integer := 0;
begin
  if v_user_id is null then
    raise exception 'Not authenticated';
  end if;

  perform public.assert_user_active(v_user_id);

  if not public.is_admin() then
    raise exception 'Only admins can create store QR codes';
  end if;

  if p_points is null or p_points <= 0 or p_points > 100000 then
    raise exception 'QR points must be between 1 and 100000';
  end if;

  if p_max_uses is not null and p_max_uses <= 0 then
    raise exception 'Maximum uses must be positive';
  end if;

  if p_expires_at is not null and p_expires_at <= now() then
    raise exception 'QR expiry must be in the future';
  end if;

  loop
    v_attempt := v_attempt + 1;
    v_code := 'QR-' || upper(substr(encode(gen_random_bytes(6), 'hex'), 1, 8));

    begin
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
        coalesce(nullif(trim(p_label), ''), 'Store QR'),
        true,
        p_max_uses,
        0,
        p_expires_at
      )
      returning * into v_row;

      return v_row;
    exception
      when unique_violation then
        if v_attempt >= 10 then
          raise exception 'Could not generate a unique QR code';
        end if;
    end;
  end loop;
end;
$$;

revoke all on function public.admin_create_store_qr(text, integer, integer, timestamptz) from public;
revoke all on function public.admin_create_store_qr(text, integer, integer, timestamptz) from anon;
grant execute on function public.admin_create_store_qr(text, integer, integer, timestamptz) to authenticated;

do $$
begin
  alter publication supabase_realtime add table public.qr_codes;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.redemptions;
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
