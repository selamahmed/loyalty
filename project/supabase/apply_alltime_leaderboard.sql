-- All-time leaderboard RPCs; remove weekly/monthly period views.
-- Run in Supabase SQL Editor or: npm run db:apply-alltime

drop view if exists public.leaderboard_monthly;
drop view if exists public.leaderboard_weekly;

create or replace function public.get_alltime_leaderboard(p_limit integer default 20)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return coalesce((
    select jsonb_agg(row order by (row->>'rank')::int)
    from (
      select jsonb_build_object(
        'id',           ranked.id,
        'username',     coalesce(ranked.username, 'Oyuncu'),
        'avatar_url',   ranked.avatar_url,
        'level',        ranked.level,
        'total_points', ranked.total_points,
        'rank',         ranked.rnk
      ) as row
      from (
        select
          p.id,
          p.username,
          p.avatar_url,
          p.level,
          p.total_points,
          rank() over (
            order by p.total_points desc, p.username asc nulls last, p.id asc
          ) as rnk
        from public.profiles p
        left join public.user_settings us on us.user_id = p.id
        where p.status = 'active'
          and p.total_points > 0
          and coalesce(us.show_on_leaderboard, true) = true
      ) ranked
      order by ranked.rnk
      limit greatest(1, least(coalesce(p_limit, 20), 100))
    ) sub
  ), '[]'::jsonb);
end;
$$;

create or replace function public.get_my_alltime_rank()
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_user_id uuid := auth.uid();
  v_row     record;
begin
  if v_user_id is null then
    return null;
  end if;

  select * into v_row
  from (
    select
      p.id,
      p.username,
      p.avatar_url,
      p.level,
      p.total_points,
      rank() over (
        order by p.total_points desc, p.username asc nulls last, p.id asc
      ) as rnk
    from public.profiles p
    left join public.user_settings us on us.user_id = p.id
    where p.status = 'active'
      and coalesce(us.show_on_leaderboard, true) = true
  ) ranked
  where ranked.id = v_user_id;

  if v_row.id is null then
    return null;
  end if;

  return jsonb_build_object(
    'id',           v_row.id,
    'username',     coalesce(v_row.username, 'Oyuncu'),
    'avatar_url',   v_row.avatar_url,
    'level',        v_row.level,
    'total_points', v_row.total_points,
    'rank',         v_row.rnk
  );
end;
$$;

grant execute on function public.get_alltime_leaderboard(integer) to anon, authenticated;
grant execute on function public.get_my_alltime_rank() to authenticated;
