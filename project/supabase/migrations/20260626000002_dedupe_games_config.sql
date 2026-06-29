-- Ensure every playable game type appears once in games_config.
-- Existing duplicate rows are removed, keeping the newest updated row for each game_id.

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

with ranked as (
  select
    id,
    row_number() over (
      partition by config->>'game_id'
      order by enabled desc, updated_at desc, created_at desc, id desc
    ) as rn
  from public.games_config
  where coalesce(config->>'game_id', '') <> ''
)
delete from public.games_config g
using ranked r
where g.id = r.id
  and r.rn > 1;

create unique index if not exists games_config_one_row_per_game_type
  on public.games_config ((config->>'game_id'))
  where coalesce(config->>'game_id', '') <> '';
