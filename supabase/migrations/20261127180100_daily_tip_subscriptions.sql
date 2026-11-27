-- LifeZoi daily tip by email or Telegram: one row of choices per account.
--
-- Adds one new table. It changes no existing table and deletes no row.
-- Applied to production by the "Database migrations" GitHub Action
-- (.github/workflows/db-migrate.yml) after it merges to main, with
-- supabase/verify.sql before and after. The app itself does not run it.
-- It is safe to run more than once. The same statements are in supabase/schema.sql.
--
-- The row holds what the member chose: email and/or Telegram, the language,
-- the local hour, and the time zone. No email address is stored: the daily
-- send reads the account's own sign-in address with the service role, so a
-- member cannot point tips at someone else. telegram_chat_id is set only after
-- the member pressed Start in the LifeZoi bot. last_sent_on stops a second
-- tip on the same local day. Row level security limits every row to its
-- owner, the same rule as academy_state and health_readings, and deleting the
-- account deletes the row (on delete cascade). Nothing here holds health data.

create table if not exists public.daily_tip_subscriptions (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email_enabled boolean not null default false,
  telegram_enabled boolean not null default false,
  telegram_chat_id bigint,
  telegram_link_code text check (telegram_link_code ~ '^[A-Za-z0-9]{6,32}$'),
  telegram_code_expires_at timestamptz,
  locale text not null default 'en' check (locale in ('en', 'uk', 'ru', 'el')),
  send_hour smallint not null default 8 check (send_hour between 6 and 21),
  time_zone text not null default 'UTC' check (char_length(time_zone) between 1 and 64),
  last_sent_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists daily_tip_subscriptions_active
  on public.daily_tip_subscriptions (user_id)
  where email_enabled or telegram_enabled;

alter table public.daily_tip_subscriptions enable row level security;

revoke all on table public.daily_tip_subscriptions from public, anon;
grant select, insert, update, delete on table public.daily_tip_subscriptions to authenticated;

drop policy if exists daily_tip_subscriptions_own_rows on public.daily_tip_subscriptions;
create policy daily_tip_subscriptions_own_rows on public.daily_tip_subscriptions
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());
