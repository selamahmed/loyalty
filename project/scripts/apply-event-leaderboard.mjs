/**
 * Apply event leaderboard migration to remote Supabase Postgres.
 *
 * Recommended: Supabase Dashboard → SQL Editor → apply_event_leaderboard.sql
 * (You already did this if `npm run db:check-leaderboard` passes.)
 *
 * CLI option — copy the full URI from Dashboard → Project Settings → Database:
 *   SUPABASE_DB_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres" npm run db:apply-leaderboard
 *
 * Or password only (tries direct + pooler hosts):
 *   SUPABASE_DB_PASSWORD=your-real-password npm run db:apply-leaderboard
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim();
  }
}

loadEnvLocal();

const url = process.env.VITE_SUPABASE_URL ?? '';
const password = process.env.SUPABASE_DB_PASSWORD;
const refMatch = url.match(/https:\/\/([^.]+)\.supabase\.co/);
const projectRef = process.env.SUPABASE_PROJECT_REF ?? refMatch?.[1];

const PLACEHOLDER = /^(your-db-password|password|changeme)$/i;

if (process.env.SUPABASE_DB_URL) {
  // full URI from dashboard — preferred
} else if (!projectRef || !password || PLACEHOLDER.test(password)) {
  console.error('Use your real database password, not a placeholder.');
  console.error('\nOption A (easiest): Supabase Dashboard → SQL Editor → run apply_event_leaderboard.sql');
  console.error('Option B: set SUPABASE_DB_URL to the full connection string from Project Settings → Database');
  console.error('Option C: set SUPABASE_DB_PASSWORD to your real DB password');
  process.exit(1);
}

const sqlPath = path.join(__dirname, '..', 'supabase', 'apply_event_leaderboard.sql');
const sql = fs.readFileSync(sqlPath, 'utf8');

function buildConnectionCandidates() {
  if (process.env.SUPABASE_DB_URL) {
    return [process.env.SUPABASE_DB_URL];
  }

  const enc = encodeURIComponent(password);
  const region = process.env.SUPABASE_DB_REGION ?? 'eu-central-1';
  const hosts = [
    `postgresql://postgres.${projectRef}:${enc}@aws-0-${region}.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres.${projectRef}:${enc}@aws-0-${region}.pooler.supabase.com:6543/postgres`,
    `postgresql://postgres:${enc}@db.${projectRef}.supabase.co:5432/postgres`,
  ];
  return hosts;
}

let lastError = null;

for (const connectionString of buildConnectionCandidates()) {
  const hostLabel = connectionString.replace(/:[^:@/]+@/, ':***@');
  const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    console.log(`Connecting (${hostLabel}) …`);
    await client.connect();
    console.log('Applying event leaderboard migration …');
    await client.query(sql);
    console.log('Done. Run: npm run db:check-leaderboard');
    await client.end();
    process.exit(0);
  } catch (err) {
    lastError = err;
    await client.end().catch(() => {});
  }
}

console.error('Migration failed:', lastError?.message ?? 'unknown error');
console.error('\nYour DB may already be set up. Run: npm run db:check-leaderboard');
console.error('If checks fail, use Supabase Dashboard → SQL Editor → apply_event_leaderboard.sql');
process.exit(1);
