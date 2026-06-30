-- Scale-focused indexes for high-traffic read/write paths.
-- Safe to run more than once because every index uses IF NOT EXISTS.

create index if not exists idx_profiles_active_points_rank
  on public.profiles (total_points desc, username asc)
  where status = 'active' and total_points > 0;

create index if not exists idx_profiles_role
  on public.profiles (role);

create index if not exists idx_points_transactions_user_created
  on public.points_transactions (user_id, created_at desc);

create index if not exists idx_points_transactions_type_created
  on public.points_transactions (type, created_at desc);

create index if not exists idx_qr_codes_code
  on public.qr_codes (code);

create index if not exists idx_qr_codes_active_expires
  on public.qr_codes (active, expires_at);

create index if not exists idx_qr_scans_qr_user
  on public.qr_scans (qr_code_id, user_id);

create index if not exists idx_qr_scans_user_created
  on public.qr_scans (user_id, created_at desc);

create index if not exists idx_redemptions_user_active_created
  on public.redemptions (user_id, used, created_at desc);

create index if not exists idx_redemptions_code
  on public.redemptions (code);

create index if not exists idx_event_participants_event_rank
  on public.event_participants (event_id, rank asc);

create index if not exists idx_event_participants_event_points
  on public.event_participants (event_id, points desc, updated_at asc);

create index if not exists idx_events_active_published_dates
  on public.events (active, published, start_date desc, end_date desc);

create index if not exists idx_notifications_user_created
  on public.notifications (user_id, created_at desc);
