-- lifeZoi schema for a future Supabase project.
-- Applying this file does not connect the app. The current build stays in
-- development mode and does not authenticate anyone.
-- Rows are scoped to auth.uid(). Do not use the service role for user reads.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  updated_at timestamptz not null default now(),
  constraint profiles_name_length check (display_name is null or char_length(display_name) <= 40)
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  answers jsonb not null,
  completed_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id text not null,
  note text,
  saved_at timestamptz not null default now(),
  constraint scenarios_note_length check (note is null or char_length(note) <= 280)
);

create table if not exists public.habit_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id text not null,
  days_per_week integer not null check (days_per_week between 1 and 7),
  unique (user_id, habit_id)
);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  habit_id text not null,
  entry_date date not null,
  done boolean not null,
  note text,
  unique (user_id, habit_id, entry_date),
  constraint check_ins_note_length check (note is null or char_length(note) <= 280)
);

alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.scenarios enable row level security;
alter table public.habit_goals enable row level security;
alter table public.check_ins enable row level security;

create policy "profiles_own_rows" on public.profiles
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "assessments_own_rows" on public.assessments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "scenarios_own_rows" on public.scenarios
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habit_goals_own_rows" on public.habit_goals
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "check_ins_own_rows" on public.check_ins
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
