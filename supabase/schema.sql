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

-- Registration is by invitation only. A login may exist only for the owner's email
-- or for an email with a valid, unused invitation in public.registration_invites
-- (created by the server for an administrator invite or a Share the Care link).
-- This backs up the "Allow new users to sign up" switch in Supabase Auth: even if
-- that switch is turned on by mistake, or someone adds a user in the dashboard,
-- the database refuses any email without an invitation.
-- plpgsql, so this file can define it before the invitations table further down.
create or replace function public.account_email_allowed(candidate text)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  normalized text := lower(btrim(coalesce(candidate, '')));
begin
  if normalized in ('tatyanaserikovaru@gmail.com') then
    return true;
  end if;
  if normalized = '' or to_regclass('public.registration_invites') is null then
    return false;
  end if;
  return exists (
    select 1
    from public.registration_invites i
    where i.email = normalized
      and i.used_at is null
      and i.revoked_at is null
      and i.expires_at > now()
  );
end;
$$;

revoke all on function public.account_email_allowed(text) from public;

create or replace function public.enforce_account_allowlist()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Existing logins keep working. Only a new login or a changed email is checked.
  if tg_op = 'UPDATE' and new.email is not distinct from old.email then
    return new;
  end if;
  if not public.account_email_allowed(new.email) then
    raise exception 'new accounts are not open';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_account_allowlist() from public;

drop trigger if exists auth_users_allowlist on auth.users;
create trigger auth_users_allowlist
  before insert or update of email on auth.users
  for each row execute function public.enforce_account_allowlist();

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

-- Community moderation records.
-- Rejected messages, removed messages, and closed reports are kept for 30 days,
-- then deleted by the app. Published messages stay until the author removes them.
-- These tables store a chosen name and message text. They do not store an email
-- address or a health record. user_id is the account key and is not shown to members.
-- The browser roles cannot read these tables. A server-only service role may write
-- them. It is not used to read assessment or health rows.

create table if not exists public.community_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  restricted_until timestamptz,
  violations jsonb not null default '[]'::jsonb,
  provider_calls jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint community_profiles_name_length check (char_length(display_name) between 2 and 24),
  constraint community_profiles_violations_size check (octet_length(violations::text) <= 8000),
  constraint community_profiles_calls_size check (octet_length(provider_calls::text) <= 2000)
);

create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null,
  parent_id uuid references public.community_messages (id) on delete cascade,
  body text not null default '',
  redacted boolean not null default false,
  status text not null,
  category text not null default 'none',
  source text not null,
  content_hash text not null,
  client_request_id text,
  created_at timestamptz not null default now(),
  decided_at timestamptz not null default now(),
  removed_at timestamptz,
  appeal_used boolean not null default false,
  violation_counted boolean not null default false,
  constraint community_messages_status check (status in ('approved', 'pending', 'rejected')),
  constraint community_messages_body_length check (char_length(body) <= 1000),
  constraint community_messages_name_length check (char_length(author_name) between 2 and 24),
  constraint community_messages_category_length check (char_length(category) <= 40),
  constraint community_messages_source_length check (char_length(source) <= 40)
);

create table if not exists public.community_reports (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references public.community_messages (id) on delete cascade,
  reporter_id uuid not null references auth.users (id) on delete cascade,
  reason text not null,
  created_at timestamptz not null default now(),
  status text not null default 'open',
  resolved_at timestamptz,
  constraint community_reports_reason check (reason in ('harassment', 'hate', 'spam', 'other')),
  constraint community_reports_status check (status in ('open', 'dismissed'))
);

create table if not exists public.community_blocks (
  blocker_id uuid not null references auth.users (id) on delete cascade,
  blocked_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint community_blocks_not_self check (blocker_id <> blocked_id)
);

create table if not exists public.community_mutes (
  muter_id uuid not null references auth.users (id) on delete cascade,
  muted_id uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (muter_id, muted_id),
  constraint community_mutes_not_self check (muter_id <> muted_id)
);

create unique index if not exists community_messages_client_request
  on public.community_messages (author_id, client_request_id)
  where client_request_id is not null;

create index if not exists community_messages_author_idx
  on public.community_messages (author_id, created_at desc);

alter table public.community_profiles enable row level security;
alter table public.community_messages enable row level security;
alter table public.community_reports enable row level security;
alter table public.community_blocks enable row level security;
alter table public.community_mutes enable row level security;

revoke all on table public.community_profiles from public, anon, authenticated;
revoke all on table public.community_messages from public, anon, authenticated;
revoke all on table public.community_reports from public, anon, authenticated;
revoke all on table public.community_blocks from public, anon, authenticated;
revoke all on table public.community_mutes from public, anon, authenticated;

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
  delete from public.community_reports
  where reporter_id = actor
     or message_id in (select id from public.community_messages where author_id = actor);
  delete from public.community_messages where author_id = actor;
  delete from public.community_blocks where blocker_id = actor or blocked_id = actor;
  delete from public.community_mutes where muter_id = actor or muted_id = actor;
  delete from public.community_profiles where user_id = actor;
  delete from public.check_ins where user_id = actor;
  delete from public.habit_goals where user_id = actor;
  delete from public.scenarios where user_id = actor;
  delete from public.assessments where user_id = actor;
  if to_regclass('public.care_invitations') is not null then
    delete from public.care_invitations where user_id = actor;
  end if;
  if to_regclass('public.companion_state') is not null then
    delete from public.companion_state where user_id = actor;
  end if;
  if to_regclass('public.registration_invites') is not null then
    delete from public.registration_invites
    where used_by = actor
       or email = (select lower(btrim(email)) from auth.users where id = actor);
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
-- The app does not run this file. Until this part is in the database,
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

-- LifeZoi daily companion: one row per account.
--
-- Also in supabase/migrations/20261109000000_companion_state.sql, which the
-- "Database migrations" GitHub Action applies to production. Until the table
-- exists, signed-in people see "Saved in this browser on this device" for
-- daily activities, and nothing is lost.
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

-- Invitation-only registration.
--
-- Also in supabase/migrations/20261112000000_invite_registration.sql, which the
-- "Database migrations" GitHub Action applies to production. Until it is in
-- the database, the server cannot record invitations and nobody new can
-- register. Existing logins keep working.
--
-- A row is written by the server (service role) when the administrator invites
-- an email address, or when someone enters their email on an active Share the
-- Care link. The auth.users trigger above allows a new login only for an email
-- with an unused, unrevoked, unexpired row. When the login is created, the row
-- is marked used. Browsers cannot read or write this table.
-- A row holds the invited email address, who invited, and the link token if
-- any. It holds no health information. Unused rows are deleted by the app
-- 30 days after they expire, and account deletion removes the person's rows.

alter table public.care_invitations add column if not exists max_registrations integer not null default 3;
alter table public.care_invitations add column if not exists expires_at timestamptz;
alter table public.care_invitations drop constraint if exists care_invitations_max_registrations_range;
alter table public.care_invitations add constraint care_invitations_max_registrations_range
  check (max_registrations between 0 and 50);

-- A member's own new link always starts with the default limit and no expiry.
drop policy if exists care_invitations_insert_own on public.care_invitations;
create policy care_invitations_insert_own on public.care_invitations
  for insert
  with check (
    auth.uid() = user_id
    and public.auth_session_may_use_rows()
    and revoked_at is null
    and opened_count = 0
    and registered_count = 0
    and max_registrations = 3
    and expires_at is null
  );

create table if not exists public.registration_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null,
  invited_by uuid references auth.users (id) on delete set null,
  care_token text references public.care_invitations (token) on delete set null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  used_at timestamptz,
  used_by uuid references auth.users (id) on delete set null,
  revoked_at timestamptz,
  constraint registration_invites_email_shape check (
    email = lower(btrim(email)) and char_length(email) between 3 and 320 and position('@' in email) > 1
  ),
  constraint registration_invites_source check (source in ('admin', 'share_care')),
  constraint registration_invites_link_source check (
    (source = 'share_care' and care_token is not null) or source = 'admin'
  )
);

create index if not exists registration_invites_open_email_idx
  on public.registration_invites (email)
  where used_at is null and revoked_at is null;

create index if not exists registration_invites_care_token_idx
  on public.registration_invites (care_token)
  where care_token is not null;

alter table public.registration_invites enable row level security;

-- No policies: only the server's service role (which bypasses row level security) uses it.
revoke all on table public.registration_invites from public, anon, authenticated;

-- Marks the invitation used when its login is created, and counts a Share the Care registration.
create or replace function public.claim_registration_invite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_token text;
  claimed_id uuid;
begin
  if tg_op = 'UPDATE' and new.email is not distinct from old.email then
    return new;
  end if;
  select i.id, i.care_token into claimed_id, claimed_token
  from public.registration_invites i
  where i.email = lower(btrim(coalesce(new.email, '')))
    and i.used_at is null
    and i.revoked_at is null
    and i.expires_at > now()
  order by i.created_at
  limit 1;
  if claimed_id is null then
    return new;
  end if;
  update public.registration_invites
    set used_at = now(), used_by = new.id
    where id = claimed_id;
  if claimed_token is not null then
    update public.care_invitations
      set registered_count = registered_count + 1
      where token = claimed_token;
  end if;
  return new;
end;
$$;

revoke all on function public.claim_registration_invite() from public;

drop trigger if exists auth_users_claim_invite on auth.users;
create trigger auth_users_claim_invite
  after insert or update of email on auth.users
  for each row execute function public.claim_registration_invite();

-- Opening a Share the Care link is still counted from the browser. Registrations
-- are now counted by the trigger above, so the browser can no longer add one.
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
  if event_kind <> 'open' then
    return false;
  end if;
  update public.care_invitations
    set opened_count = opened_count + 1
    where token = invite_token
      and revoked_at is null
      and (expires_at is null or expires_at > now());
  get diagnostics updated = row_count;
  return updated = 1;
end;
$$;

revoke all on function public.note_care_invitation(text, text) from public;
grant execute on function public.note_care_invitation(text, text) to anon, authenticated;

-- Extra hardening. Row level security already returns nothing to a signed-out
-- request; this also removes the default table rights of the signed-out role.
revoke all on table public.profiles from anon;
revoke all on table public.assessments from anon;
revoke all on table public.scenarios from anon;
revoke all on table public.habit_goals from anon;
revoke all on table public.check_ins from anon;
