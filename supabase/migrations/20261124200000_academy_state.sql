-- LifeZoi Training Academy: one learning record per account.
--
-- Adds one new table. It changes no existing table and deletes no row.
-- Applied to production by the "Database migrations" GitHub Action
-- (.github/workflows/db-migrate.yml) after it merges to main, with
-- supabase/verify.sql before and after. The app itself does not run it.
-- It is safe to run more than once. The same statements are in supabase/schema.sql.
--
-- The row holds the person's own Academy progress: lessons started and
-- completed, course dates, achievements, daily challenges, and the exercise
-- answers and reflections they chose to save. Until the table exists,
-- signed-in people see "Saved in this browser on this device" in the Academy,
-- and nothing is lost. It is protected by the same row level security as
-- companion_state, and deleting the account deletes it (on delete cascade).

create table if not exists public.academy_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint academy_state_size check (octet_length(state::text) <= 1048576)
);

alter table public.academy_state enable row level security;

revoke all on table public.academy_state from public, anon;
grant select, insert, update, delete on table public.academy_state to authenticated;

drop policy if exists academy_state_own_rows on public.academy_state;
create policy academy_state_own_rows on public.academy_state
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());
