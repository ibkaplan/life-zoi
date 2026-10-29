-- lifeZoi Supabase schema
--
-- This file is not applied automatically. The app does not connect to Supabase
-- in this version. Applying the schema does not make the product compliant with
-- HIPAA, GDPR, or any other law.
--
-- When you do use it:
-- 1. Run this in a Supabase project you control.
-- 2. Keep the service role key on the server only. Never ship it to the browser.
-- 3. Use the anon key only with these Row Level Security policies in place.
-- 4. Add a server-side adapter. Do not treat keys in the environment as proof
--    that accounts are active. This version still stores data in the browser.

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessments (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  completed_at timestamptz not null,
  answers jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.saved_scenarios (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  scenario_id text not null,
  option_id text not null,
  note text not null default '' check (char_length(note) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.habit_goals (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  detail text not null default '' check (char_length(detail) <= 180),
  cadence text not null check (cadence in ('daily', 'most-days', 'weekly')),
  source_scenario_id text,
  archived_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.check_ins (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  goal_id uuid not null references public.habit_goals (id) on delete cascade,
  entry_date date not null,
  status text not null check (status in ('done', 'partial', 'skipped')),
  note text not null default '' check (char_length(note) <= 280),
  updated_at timestamptz not null default now(),
  unique (goal_id, entry_date)
);

alter table public.profiles enable row level security;
alter table public.assessments enable row level security;
alter table public.saved_scenarios enable row level security;
alter table public.habit_goals enable row level security;
alter table public.check_ins enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check (auth.uid() = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "profiles_delete_own" on public.profiles for delete to authenticated using (auth.uid() = user_id);

create policy "assessments_select_own" on public.assessments for select to authenticated using (auth.uid() = user_id);
create policy "assessments_insert_own" on public.assessments for insert to authenticated with check (auth.uid() = user_id);
create policy "assessments_update_own" on public.assessments for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "assessments_delete_own" on public.assessments for delete to authenticated using (auth.uid() = user_id);

create policy "scenarios_select_own" on public.saved_scenarios for select to authenticated using (auth.uid() = user_id);
create policy "scenarios_insert_own" on public.saved_scenarios for insert to authenticated with check (auth.uid() = user_id);
create policy "scenarios_update_own" on public.saved_scenarios for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "scenarios_delete_own" on public.saved_scenarios for delete to authenticated using (auth.uid() = user_id);

create policy "goals_select_own" on public.habit_goals for select to authenticated using (auth.uid() = user_id);
create policy "goals_insert_own" on public.habit_goals for insert to authenticated with check (auth.uid() = user_id);
create policy "goals_update_own" on public.habit_goals for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "goals_delete_own" on public.habit_goals for delete to authenticated using (auth.uid() = user_id);

create policy "check_ins_select_own" on public.check_ins for select to authenticated using (auth.uid() = user_id);
create policy "check_ins_insert_own" on public.check_ins for insert to authenticated with check (auth.uid() = user_id);
create policy "check_ins_update_own" on public.check_ins for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "check_ins_delete_own" on public.check_ins for delete to authenticated using (auth.uid() = user_id);

revoke all on public.profiles from anon;
revoke all on public.assessments from anon;
revoke all on public.saved_scenarios from anon;
revoke all on public.habit_goals from anon;
revoke all on public.check_ins from anon;
