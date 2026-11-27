-- LifeZoi 7-day email challenge: who asked for the seven daily emails.
--
-- Adds one new table. It changes no existing table and deletes no row.
-- Applied to production by the "Database migrations" GitHub Action
-- (.github/workflows/db-migrate.yml) after it merges to main, with
-- supabase/verify.sql before and after. The app itself does not run it.
-- It is safe to run more than once. The same statements are in supabase/schema.sql.
--
-- One row per address: the address, language, time zone, the consent and its
-- wording version, the confirmation and stop tokens, and how many of the seven
-- emails were sent. No health data. The app deletes the row when the person
-- stops, after the seventh email, and 14 days after an unconfirmed sign-up.
-- A member's row also goes when the account is deleted (on delete cascade).
--
-- Browser roles have no grant: only the server, with the service role, reads
-- or writes it (src/lib/email-challenge/repository.ts).

create table if not exists public.challenge_signups (
  id uuid primary key,
  email text not null unique check (char_length(email) between 3 and 254 and email = lower(email) and position('@' in email) > 1),
  user_id uuid unique references auth.users (id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'uk', 'ru', 'el')),
  time_zone text not null default 'UTC' check (char_length(time_zone) between 1 and 64),
  consent_version text not null check (char_length(consent_version) between 1 and 20),
  consented_at timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'active')),
  confirm_token uuid not null unique,
  confirm_sent_at timestamptz,
  confirmed_at timestamptz,
  unsubscribe_token uuid not null unique,
  last_sent_day smallint not null default 0 check (last_sent_day between 0 and 7),
  last_sent_on date,
  created_at timestamptz not null default now(),
  constraint challenge_signups_active_confirmed check (status <> 'active' or confirmed_at is not null)
);

create index if not exists challenge_signups_status_idx on public.challenge_signups (status, created_at);

alter table public.challenge_signups enable row level security;

-- No policies: only the server's service role (which bypasses row level security) uses this table.
revoke all on table public.challenge_signups from public, anon, authenticated;
