# NexReward — Loyalty & Rewards Platform

A production-ready loyalty and rewards platform built with React, TypeScript, Vite, and Supabase. Deployed on Cloudflare Pages.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 5 |
| Routing | React Router 7 (HashRouter) |
| Backend / Auth | Supabase (PostgreSQL + Auth) |
| Styling | TailwindCSS + inline neo-brutalism styles |
| Charts | Recharts |
| Icons | Lucide React |
| QR / Barcode | @zxing/browser, jsqr, qrcode |
| Deployment | Cloudflare Pages |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

> Never use the service role key in the frontend. Only the publishable (anon) key is safe.

### 3. Set Up the Database

1. Go to your Supabase Dashboard → SQL Editor → New Query
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

This creates all tables, indexes, RPCs, triggers, and Row Level Security policies.

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start local dev server on port 5173 |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run typecheck` | TypeScript type check (no emit) |

---

## Deploying to Cloudflare Pages

### Build Settings

| Setting | Value |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | `18` (or higher) |

### Environment Variables

Set these in Cloudflare Pages → Settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

### SPA Routing

The `public/_redirects` file is already included:

```
/* /index.html 200
```

This ensures that page refreshes on any route (e.g. `/#/dashboard`) work correctly.

The app uses **HashRouter**, so all routes include `#` in the URL — no additional Cloudflare configuration is needed for routing.

---

## Supabase Manual Steps (After Schema Run)

1. **Set Site URL** — Authentication → URL Configuration → Site URL = your production domain (e.g. `https://nexreward.pages.dev`)
2. **Add Redirect URLs** — Authentication → URL Configuration → add your domain to Redirect URLs (needed for Google OAuth and password reset emails)
3. **Enable Google OAuth** (optional) — Authentication → Providers → Google → enable and add your Google OAuth credentials
4. **Create first super admin** — After signing up with your admin email, go to Table Editor → `profiles` → find your row → change `role` to `super_admin`

---

## Project Structure

```
src/
├── components/         # Shared UI components (guards, modals, layout)
├── context/            # React Context providers (Auth, App, Inventory, Admin)
├── hooks/              # Custom hooks (push notifications, QR scanner)
├── lib/                # Supabase client, translations (tr.ts), sound utils
├── pages/              # Route-level page components
│   ├── admin/          # Super admin and store admin pages
│   └── ...             # Customer-facing pages
├── services/           # Supabase data access layer
│   ├── profile.ts
│   ├── rewards.ts
│   ├── redemptions.ts
│   ├── points.ts
│   ├── missions.ts
│   ├── achievements.ts
│   ├── notifications.ts
│   ├── events.ts
│   ├── activityLogs.ts
│   └── admin.ts
└── App.tsx             # Root component + routes
supabase/
└── schema.sql          # Complete production database schema
public/
└── _redirects          # Cloudflare Pages SPA routing rule
```

---

## Database Tables

| Table | Description |
|---|---|
| `profiles` | User profiles (extends Supabase auth.users) |
| `rewards` | Redeemable rewards catalog |
| `redemptions` | User reward redemptions with QR/barcode codes |
| `points_transactions` | Full points history (earned / spent / adjusted) |
| `achievements` | Achievement definitions |
| `user_achievements` | Per-user achievement progress |
| `missions` | Daily / weekly / special missions |
| `user_missions` | Per-user mission completion state |
| `notifications` | In-app notifications per user |
| `events` | Seasonal events and campaigns |
| `activity_logs` | Audit log of all user actions |
| `qr_codes` | QR codes for cashier/store use |
| `qr_scans` | Log of QR code scans per user |

All tables have Row Level Security (RLS) enabled. Users can only access their own data.

---

## User Roles

| Role | Access |
|---|---|
| `customer` | Personal dashboard, rewards shop, missions, achievements |
| `cashier` | QR scanner, checkout/redemption validation |
| `store_admin` | Store-level users, rewards, analytics |
| `super_admin` | Full platform management, all users, all data |

Roles are stored in the `profiles.role` column and enforced by Supabase RLS policies.

---

## Security

- No service role key is used anywhere in the frontend
- All sensitive data access is protected by Supabase RLS
- Auth sessions are managed by Supabase Auth with auto-refresh
- `VITE_SUPABASE_PUBLISHABLE_KEY` is the only key exposed to the browser

---

## Features

- **Authentication** — Email/password signup & login, Google OAuth, forgot/reset password
- **Points System** — Earn and spend points via atomic Supabase RPCs
- **Rewards Shop** — Browse and redeem rewards with real-time point deduction
- **Missions** — Daily, weekly, and special missions with completion tracking
- **Achievements** — Unlockable achievements with progress tracking
- **Leaderboard** — Real-time ranking by total points
- **Inventory** — Personal redeemed items with QR and barcode codes
- **QR Scanner** — Camera-based QR scanning to earn points
- **Notifications** — In-app notification system with unread badge
- **Seasonal Events** — Time-limited events with point multipliers
- **Mini Games** — Engagement mini-games
- **Progress Path** — Visual level progression
- **Admin Dashboard** — KPIs, user management, reward management
- **Audit Logs** — Full activity log with risk levels
- **Cashier Interface** — Validate and mark redemptions as used

---

## License

Private project. All rights reserved.

---

**Last Updated**: June 12, 2026
**Build Status**: Production Ready
**Deployment**: Cloudflare Pages
