# NexReward Production Hardening — Complete Report

## Security (Phase 1) ✅

| Before | After |
|--------|-------|
| Client sent `pointsOverride` | `perform_action(action, referenceId)` only |
| Games minted arbitrary points | `claim_game_reward` — 1 claim/game/day, server caps |
| QR trusted browser points | `claim_qr_scan` — validates DB record |
| Bans were UI-only | `assert_user_active()` + RLS + `ban-user` edge function |

### Run migration
```sql
-- Supabase SQL Editor:
-- project/supabase/migrations/20250613000001_production_hardening.sql
```

Self-contained: includes XP helpers (`add_xp`, `recalc_user_level`) — you do **not** need to run `patch_xp_system.sql` first. Safe to re-run if a prior attempt failed partway.

### Deploy edge functions
```bash
supabase functions deploy ban-user
supabase functions deploy send-push
```

## Data (Phase 2) ✅

- **Single profile source:** `AuthContext` + React Query (`useCanonicalProfile`)
- **Daily streak:** `user_streaks` table (no `localStorage`)
- **Settings:** `user_settings` table (no `localStorage` privacy)

## Database (Phase 3) ✅

Migration file is idempotent. Legacy `patch_*.sql` files kept for reference.

## Notifications (Phase 4) ✅

- `push_subscriptions` table
- `public/sw.js` service worker
- `usePushNotification` → Supabase storage
- `send-push` edge function for admin broadcast

**Env:** `VITE_VAPID_PUBLIC_KEY` on Cloudflare Pages

## Error handling (Phase 6) ✅

- `ErrorBoundary` wraps app
- Sentry via `VITE_SENTRY_DSN` (optional)
- `captureError()` replaces silent failures in earn/profile paths

## Testing & CI (Phase 7) ✅

```bash
npm run typecheck
npm test
npm run build
```

## Admin cleanup (Phase 8) ✅

- Removed `/admin/dashboard-v2` and `/admin/users-v2` routes
- Replaced picsum.photos with local assets

## Remaining risks

1. **Migration not applied** — app will error on earn until SQL is run
2. **Edge functions not deployed** — ban/push fall back to RPC-only
3. **VAPID keys** — push requires production keys
4. **Pre-existing admin type fixes** — some admin analytics types were patched for CI

## Cloudflare Pages env vars

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_SENTRY_DSN=          (optional)
VITE_VAPID_PUBLIC_KEY=    (for push)
```
