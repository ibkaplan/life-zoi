-- lifeZoi: invitation-only registration.
--
-- This file is in the repository only. The app does not run it, and it has not
-- been applied to production. Apply it in the Supabase SQL editor only when a
-- person chooses to. It is safe to run more than once. It drops no table and
-- deletes no row. The same statements are in supabase/schema.sql.
--
-- Run supabase/verify.sql afterwards: every line should say ok = true.

-- New logins: the owner's email, or an email with a valid invitation.
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

-- Account deletion also removes the person's invitation rows.
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
-- This definition is in the repository only. It has not been applied to
-- Share the Care links (already in schema.sql; repeated so this file works on its own).
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

-- Invitation-only registration.
--
-- This section is in the repository only. The app does not run it. Apply it in
-- the Supabase SQL editor only when a person chooses to (or run the migration
-- supabase/migrations/2026-11-12-invite-registration.sql). Until then, the
-- server cannot record invitations and nobody new can register. Existing
-- logins keep working.
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
