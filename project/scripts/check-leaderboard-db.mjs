/**
 * Diagnose Supabase leaderboard + event RPC readiness.
 * Usage: node scripts/check-leaderboard-db.mjs
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

function loadEnvLocal() {
  const path = '.env.local';
  if (!fs.existsSync(path)) return;
  for (const line of fs.readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnvLocal();

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url || !key) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, key);

const checks = [
  {
    name: 'events table (published + prizes)',
    run: async () => {
      const { data, error } = await sb
        .from('events')
        .select('id, title, published, active, rewards_json')
        .eq('active', true)
        .limit(5);
      if (error) return { ok: false, detail: error.message };
      const prizeEvents = (data ?? []).filter(
        e => Array.isArray(e.rewards_json) && e.rewards_json.length > 0,
      );
      return {
        ok: true,
        detail: `${data?.length ?? 0} active event(s), ${prizeEvents.length} with prize pool`,
      };
    },
  },
  {
    name: 'leaderboard_weekly view',
    run: async () => {
      const { error } = await sb.from('leaderboard_weekly').select('id', { head: true, count: 'exact' });
      return error ? { ok: false, detail: error.message } : { ok: true, detail: 'ok' };
    },
  },
  {
    name: 'get_event_leaderboard RPC',
    run: async () => {
      const { error } = await sb.rpc('get_event_leaderboard', {
        p_event_id: '00000000-0000-0000-0000-000000000000',
        p_limit: 5,
      });
      if (error?.code === 'PGRST202') return { ok: false, detail: 'RPC missing — run apply_event_leaderboard.sql' };
      return error ? { ok: true, detail: `RPC exists (${error.message})` } : { ok: true, detail: 'ok' };
    },
  },
  {
    name: 'sync_event_status RPC',
    run: async () => {
      const { error } = await sb.rpc('sync_event_status', { p_event_id: null });
      if (error?.code === 'PGRST202') return { ok: false, detail: 'RPC missing — run apply_event_leaderboard.sql' };
      return error ? { ok: false, detail: error.message } : { ok: true, detail: 'ok' };
    },
  },
  {
    name: 'join_event RPC',
    run: async () => {
      const { error } = await sb.rpc('join_event', {
        p_event_id: '00000000-0000-0000-0000-000000000000',
      });
      if (error?.code === 'PGRST202') return { ok: false, detail: 'RPC missing — run apply_event_leaderboard.sql' };
      return { ok: true, detail: error?.message?.slice(0, 80) ?? 'ok' };
    },
  },
  {
    name: 'event_participants table',
    run: async () => {
      const { error } = await sb.from('event_participants').select('id', { head: true, count: 'exact' });
      if (error?.code === '42P01') return { ok: false, detail: 'Table missing — run apply_event_leaderboard.sql' };
      return error ? { ok: false, detail: error.message } : { ok: true, detail: 'ok' };
    },
  },
];

console.log(`Supabase: ${url}\n`);

let failed = 0;
for (const c of checks) {
  const result = await c.run();
  const mark = result.ok ? '✓' : '✗';
  if (!result.ok) failed += 1;
  console.log(`${mark} ${c.name}: ${result.detail}`);
}

if (failed > 0) {
  console.log('\nFix: Supabase Dashboard → SQL Editor → run:');
  console.log('  project/supabase/apply_event_leaderboard.sql');
  console.log('\nOr: SUPABASE_DB_PASSWORD=... npm run db:apply-leaderboard');
  process.exit(1);
}

console.log('\nLeaderboard database is ready.');
