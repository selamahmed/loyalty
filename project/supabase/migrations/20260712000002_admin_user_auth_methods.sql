-- Super-admin-only view of the authentication methods linked to every account.
-- This reads auth.users/auth.identities directly, so it also covers accounts
-- created before this migration without requiring a profile backfill.

create or replace function public.get_user_auth_methods()
returns table (
  user_id uuid,
  auth_methods text[]
)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if not public.is_super_admin() then
    raise exception 'Forbidden';
  end if;

  return query
  select
    users.id,
    array(
      select distinct methods.method
      from (
        select 'email_password'::text as method
        where coalesce(users.encrypted_password, '') <> ''

        union all

        select identities.provider::text
        from auth.identities as identities
        where identities.user_id = users.id
          and identities.provider <> 'email'

        union all

        select providers.provider::text
        from jsonb_array_elements_text(
          coalesce(users.raw_app_meta_data->'providers', '[]'::jsonb)
        ) as providers(provider)
        where providers.provider <> 'email'

        union all

        select 'email'::text
        where coalesce(users.encrypted_password, '') = ''
          and exists (
            select 1
            from auth.identities as email_identity
            where email_identity.user_id = users.id
              and email_identity.provider = 'email'
          )
      ) as methods
      where methods.method is not null and methods.method <> ''
      order by methods.method
    )::text[] as auth_methods
  from auth.users as users;
end;
$$;

revoke all on function public.get_user_auth_methods() from public;
grant execute on function public.get_user_auth_methods() to authenticated;
