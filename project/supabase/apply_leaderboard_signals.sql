-- Run in Supabase SQL Editor (or npm run db:apply-leaderboard-signals)
-- Enables live leaderboard refresh for all users when anyone earns points.

create table if not exists public.leaderboard_signals (
  id         integer primary key default 1 check (id = 1),
  version    bigint not null default 0,
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

  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists profiles_bump_leaderboard on public.profiles;
create trigger profiles_bump_leaderboard
  after update of total_points on public.profiles
  for each row
  when (OLD.total_points is distinct from NEW.total_points)
  execute function public.bump_leaderboard_signal();

drop trigger if exists event_participants_bump_leaderboard on public.event_participants;
create trigger event_participants_bump_leaderboard
  after insert or update of points on public.event_participants
  for each row
  execute function public.bump_leaderboard_signal();

do $$
begin
  alter publication supabase_realtime add table public.leaderboard_signals;
exception
  when duplicate_object then null;
end $$;
