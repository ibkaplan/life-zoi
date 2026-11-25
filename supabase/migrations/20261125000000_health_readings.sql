-- LifeZoi health diary: blood pressure, blood sugar, and cholesterol readings.
--
-- Adds one new table. It changes no existing table and deletes no row.
-- Applied to production by the "Database migrations" GitHub Action
-- (.github/workflows/db-migrate.yml) after it merges to main, with
-- supabase/verify.sql before and after. The app itself does not run it.
-- It is safe to run more than once. The same statements are in supabase/schema.sql.
--
-- Each row is one reading the person typed in after measuring it elsewhere
-- (LifeZoi measures nothing). Values are stored in mg/dL and mmHg; `unit`
-- is the unit the person typed, so the diary can show it back the same way.
-- Row level security limits every row to its owner, the same rule as
-- companion_state and academy_state. Deleting the account deletes the rows
-- (on delete cascade, and delete_own_account). Until the table exists the
-- diary page says that saving is not set up yet and keeps nothing.
--
-- The number limits below only catch typing mistakes; they are not health
-- targets. They match LIMITS in src/lib/health-diary/validate.ts.

create table if not exists public.health_readings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('blood_pressure', 'glucose', 'cholesterol')),
  measured_at timestamptz not null check (measured_at >= '1990-01-01'),
  systolic smallint check (systolic between 60 and 260),
  diastolic smallint check (diastolic between 30 and 160),
  pulse smallint check (pulse between 30 and 220),
  glucose_mgdl numeric(5, 1) check (glucose_mgdl between 20 and 600),
  glucose_context text check (glucose_context in ('fasting', 'before_meal', 'after_meal', 'bedtime', 'other')),
  total_mgdl numeric(5, 1) check (total_mgdl between 50 and 500),
  ldl_mgdl numeric(5, 1) check (ldl_mgdl between 10 and 400),
  hdl_mgdl numeric(5, 1) check (hdl_mgdl between 10 and 150),
  triglycerides_mgdl numeric(5, 1) check (triglycerides_mgdl between 20 and 2000),
  unit text check (unit in ('mg/dL', 'mmol/L')),
  note text check (char_length(note) <= 300),
  created_at timestamptz not null default now(),
  constraint health_readings_shape check (
    (kind = 'blood_pressure'
      and systolic is not null and diastolic is not null and diastolic < systolic
      and glucose_mgdl is null and glucose_context is null
      and total_mgdl is null and ldl_mgdl is null and hdl_mgdl is null and triglycerides_mgdl is null)
    or (kind = 'glucose'
      and glucose_mgdl is not null and glucose_context is not null and unit is not null
      and systolic is null and diastolic is null and pulse is null
      and total_mgdl is null and ldl_mgdl is null and hdl_mgdl is null and triglycerides_mgdl is null)
    or (kind = 'cholesterol'
      and unit is not null
      and coalesce(total_mgdl, ldl_mgdl, hdl_mgdl, triglycerides_mgdl) is not null
      and systolic is null and diastolic is null and pulse is null
      and glucose_mgdl is null and glucose_context is null)
  )
);

create index if not exists health_readings_user_time on public.health_readings (user_id, measured_at desc);

alter table public.health_readings enable row level security;

revoke all on table public.health_readings from public, anon;
grant select, insert, update, delete on table public.health_readings to authenticated;

drop policy if exists health_readings_own_rows on public.health_readings;
create policy health_readings_own_rows on public.health_readings
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());
