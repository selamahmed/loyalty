-- Connect admin game management to the user mini-games page.
-- Keeps the existing games_config table and stores the playable frontend game
-- type in config.game_id so admins can rename/rebrand cards safely.

alter table public.games_config enable row level security;

drop policy if exists "All users read enabled games" on public.games_config;
create policy "All users read enabled games"
  on public.games_config for select
  using (enabled = true or public.is_admin());

drop policy if exists "Admins manage games_config" on public.games_config;
create policy "Admins manage games_config"
  on public.games_config for all
  using (public.is_admin())
  with check (public.is_admin());

update public.games_config
set config = coalesce(config, '{}'::jsonb) || jsonb_build_object(
  'game_id',
  case
    when lower(name) like '%memory%' or lower(name) like '%haf%' then 'memory'
    when lower(name) like '%catch%' or lower(name) like '%gift%' then 'catch'
    when lower(name) like '%flappy%' or lower(name) like '%bird%' then 'flappy'
    when lower(name) like '%snake%' or lower(name) like '%yilan%' or lower(name) like '%yılan%' then 'snake'
    else 'spin'
  end
)
where coalesce(config->>'game_id', '') = '';

insert into public.games_config (name, description, enabled, max_plays_per_day, max_points_per_play, icon, color, config)
values
  ('Spin Wheel', 'Spin to win bonus points', true, 3, 200, '🎰', '#7B6EF6', '{"game_id":"spin"}'),
  ('Memory Game', 'Match pairs to win', true, 3, 200, '🧩', '#22c55e', '{"game_id":"memory"}'),
  ('Catch Game', 'Catch gifts, avoid bombs', true, 3, 100, '🎁', '#ef4444', '{"game_id":"catch"}'),
  ('Flappy Bird', 'Tap to fly through pipes', true, 3, 100, '🐦', '#06b6d4', '{"game_id":"flappy"}'),
  ('Snake', 'Eat apples and grow longer', true, 3, 150, '🐍', '#22c55e', '{"game_id":"snake"}')
on conflict do nothing;
