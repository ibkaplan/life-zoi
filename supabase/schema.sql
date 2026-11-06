-- lifeZoi account tables.
-- The app uses the anon key and the signed-in user's session.
-- Do not use the service role in the browser or to read these rows.
-- auth.uid() must match user_id. A verified authenticator factor also
-- requires an AAL2 session before these rows can be read or written.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  role text not null default 'member',
  session_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint profiles_name_length check (display_name is null or char_length(display_name) <= 40),
  constraint profiles_role_value check (role in ('member', 'admin')),
  constraint profiles_session_state_size check (octet_length(session_state::text) <= 24000)
);

alter table public.profiles add column if not exists role text not null default 'member';
alter table public.profiles add column if not exists session_state jsonb not null default '{}'::jsonb;
alter table public.profiles drop constraint if exists profiles_role_value;
alter table public.profiles add constraint profiles_role_value check (role in ('member', 'admin'));
alter table public.profiles drop constraint if exists profiles_session_state_size;
alter table public.profiles add constraint profiles_session_state_size check (octet_length(session_state::text) <= 24000);

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

-- True when this request may use the caller's rows.
-- A verified authenticator factor requires AAL2. Enrollment can finish at AAL1
-- because the new factor is not verified yet.
create or replace function public.auth_session_may_use_rows()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    auth.uid() is not null
    and (
      coalesce(auth.jwt() ->> 'aal', 'aal1') = 'aal2'
      or not exists (
        select 1
        from auth.mfa_factors
        where user_id = auth.uid()
          and status::text = 'verified'
      )
    );
$$;

revoke all on function public.auth_session_may_use_rows() from public;
grant execute on function public.auth_session_may_use_rows() to anon, authenticated;

-- The client cannot choose a role. The database sets it from the account email.
create or replace function public.enforce_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  account_email text;
begin
  if auth.uid() is null or new.user_id is distinct from auth.uid() then
    raise exception 'profile owner mismatch';
  end if;
  select lower(btrim(email)) into account_email
  from auth.users
  where id = new.user_id;
  if account_email = 'tatyanaserikovaru@gmail.com' then
    new.role := 'admin';
  else
    new.role := 'member';
  end if;
  if new.display_name is not null and lower(btrim(new.display_name)) = 'sample visitor' then
    raise exception 'sample data is not saved to an account';
  end if;
  if lower(btrim(coalesce(new.session_state #>> '{draft,displayName}', ''))) = 'sample visitor' then
    raise exception 'sample data is not saved to an account';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_profile_role() from public;
grant execute on function public.enforce_profile_role() to authenticated;

drop trigger if exists profiles_enforce_role on public.profiles;
create trigger profiles_enforce_role
  before insert or update on public.profiles
  for each row execute function public.enforce_profile_role();

create or replace function public.reject_sample_assessment()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if lower(btrim(coalesce(new.answers ->> 'displayName', ''))) = 'sample visitor' then
    raise exception 'sample data is not saved to an account';
  end if;
  return new;
end;
$$;

revoke all on function public.reject_sample_assessment() from public;
grant execute on function public.reject_sample_assessment() to authenticated;

drop trigger if exists assessments_reject_sample on public.assessments;
create trigger assessments_reject_sample
  before insert or update on public.assessments
  for each row execute function public.reject_sample_assessment();

create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
begin
  if actor is null or not public.auth_session_may_use_rows() then
    raise exception 'account deletion is not available for this sign-in';
  end if;
  delete from public.check_ins where user_id = actor;
  delete from public.habit_goals where user_id = actor;
  delete from public.scenarios where user_id = actor;
  delete from public.assessments where user_id = actor;
  if to_regclass('public.care_invitations') is not null then
    delete from public.care_invitations where user_id = actor;
  end if;
  delete from public.profiles where user_id = actor;
  delete from auth.users where id = actor;
end;
$$;

revoke all on function public.delete_own_account() from public;
grant execute on function public.delete_own_account() to authenticated;

drop policy if exists profiles_own_rows on public.profiles;
create policy profiles_own_rows on public.profiles
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());

drop policy if exists assessments_own_rows on public.assessments;
create policy assessments_own_rows on public.assessments
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());

drop policy if exists scenarios_own_rows on public.scenarios;
create policy scenarios_own_rows on public.scenarios
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());

drop policy if exists habit_goals_own_rows on public.habit_goals;
create policy habit_goals_own_rows on public.habit_goals
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());

drop policy if exists check_ins_own_rows on public.check_ins;
create policy check_ins_own_rows on public.check_ins
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());

-- Share the Care invitation links.
-- This definition is in the repository only. It has not been applied to
-- production by the app, and the app does not run this file. Apply it in
-- the Supabase SQL editor only when a person chooses to. Until then,
-- invitation counts stay unavailable and no invitation row is written.
-- A row stores a random token and three counts for the signed-in account.
-- It does not store a recipient name, email address, contact, or health information.
-- The token is the only invitation value placed in a shared URL.

create table if not exists public.care_invitations (
  token text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  opened_count integer not null default 0,
  registered_count integer not null default 0,
  constraint care_invitations_token_shape check (token ~ '^[A-Za-z0-9_-]{43}$'),
  constraint care_invitations_opened_count_nonnegative check (opened_count >= 0),
  constraint care_invitations_registered_count_nonnegative check (registered_count >= 0)
);

create index if not exists care_invitations_user_id_idx
  on public.care_invitations (user_id, created_at desc);

create unique index if not exists care_invitations_one_active
  on public.care_invitations (user_id)
  where revoked_at is null;

alter table public.care_invitations enable row level security;

revoke all on table public.care_invitations from public, anon, authenticated;
grant select, insert on table public.care_invitations to authenticated;

drop policy if exists care_invitations_select_own on public.care_invitations;
create policy care_invitations_select_own on public.care_invitations
  for select
  using (auth.uid() = user_id and public.auth_session_may_use_rows());

drop policy if exists care_invitations_insert_own on public.care_invitations;
create policy care_invitations_insert_own on public.care_invitations
  for insert
  with check (
    auth.uid() = user_id
    and public.auth_session_may_use_rows()
    and revoked_at is null
    and opened_count = 0
    and registered_count = 0
  );

create or replace function public.revoke_care_invitation(invite_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated integer;
begin
  if auth.uid() is null or not public.auth_session_may_use_rows() then
    return false;
  end if;
  if invite_token is null or invite_token !~ '^[A-Za-z0-9_-]{43}$' then
    return false;
  end if;
  update public.care_invitations
    set revoked_at = coalesce(revoked_at, now())
    where token = invite_token
      and user_id = auth.uid()
      and revoked_at is null;
  get diagnostics updated = row_count;
  return updated = 1;
end;
$$;

revoke all on function public.revoke_care_invitation(text) from public;
grant execute on function public.revoke_care_invitation(text) to authenticated;

-- Returns whether a welcome visit or a new sign-in was counted.
-- The result is only true or false. It does not return the account id.
create or replace function public.note_care_invitation(invite_token text, event_kind text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  updated integer;
begin
  if invite_token is null or invite_token !~ '^[A-Za-z0-9_-]{43}$' then
    return false;
  end if;
  if event_kind = 'open' then
    update public.care_invitations
      set opened_count = opened_count + 1
      where token = invite_token
        and revoked_at is null;
  elsif event_kind = 'register' then
    update public.care_invitations
      set registered_count = registered_count + 1
      where token = invite_token
        and revoked_at is null;
  else
    return false;
  end if;
  get diagnostics updated = row_count;
  return updated = 1;
end;
$$;

revoke all on function public.note_care_invitation(text, text) from public;
grant execute on function public.note_care_invitation(text, text) to anon, authenticated;
