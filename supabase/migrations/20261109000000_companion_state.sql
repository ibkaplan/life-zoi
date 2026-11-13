-- LifeZoi daily companion: one row per account.
--
-- Applied to production by the "Database migrations" GitHub Action
-- (.github/workflows/db-migrate.yml) after it merges to main. The app itself
-- does not run it. Until the table exists, signed-in people see "Saved in this
-- browser on this device" for daily activities, and nothing is lost.
--
-- The row holds the person's own daily companion data: guidance mode,
-- movement and food preferences, personal goals, daily activity marks,
-- weekly check-ins, next-week plans, media favorites and positions, and
-- game history. Assessment answers stay in public.assessments.
-- It is protected by the same row level security as the other account tables.

create table if not exists public.companion_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint companion_state_size check (octet_length(state::text) <= 262144)
);

alter table public.companion_state enable row level security;

revoke all on table public.companion_state from public, anon;
grant select, insert, update, delete on table public.companion_state to authenticated;

drop policy if exists companion_state_own_rows on public.companion_state;
create policy companion_state_own_rows on public.companion_state
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());
