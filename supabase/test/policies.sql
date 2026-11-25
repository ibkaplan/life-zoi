-- Local test only. Run after test/stub-auth.sql and schema.sql on a throwaway database.
-- Each block raises an exception if a rule does not hold. Never run this against a real project.
\set ON_ERROR_STOP 1
\o /dev/null

-- Only the allowlisted email can get a login.
do $$ begin
  insert into auth.users values ('00000000-0000-0000-0000-0000000000ff', 'stranger@example.org');
  raise exception 'FAIL: a login was created for an email that is not allowlisted';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
end $$;
insert into auth.users values ('00000000-0000-0000-0000-00000000000c', ' TatyanaSerikovaRU@gmail.com ');
do $$ begin
  update auth.users set email = 'stranger@example.org' where id = '00000000-0000-0000-0000-00000000000c';
  raise exception 'FAIL: the allowlisted login was moved to another email';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
end $$;
update auth.users set email = 'tatyanaserikovaru@gmail.com' where id = '00000000-0000-0000-0000-00000000000c';

-- The policy checks below need more than one person, so this throwaway database
-- lifts the allowlist trigger while it adds two test logins.
alter table auth.users disable trigger auth_users_allowlist;
insert into auth.users values
  ('00000000-0000-0000-0000-00000000000a', 'a@example.org'),
  ('00000000-0000-0000-0000-00000000000b', 'b@example.org');
alter table auth.users enable trigger auth_users_allowlist;
insert into auth.mfa_factors (user_id, status) values ('00000000-0000-0000-0000-00000000000b', 'verified');

create function pg_temp.as_user(sub text, aal text) returns void language sql as $$
  select set_config('request.jwt.claims', json_build_object('sub', sub, 'aal', aal)::text, false);
$$;

set role authenticated;

-- A member cannot make themselves admin.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'aal1');
insert into public.profiles (user_id, display_name, role) values ('00000000-0000-0000-0000-00000000000a', 'A', 'admin');
do $$ begin
  if (select role from public.profiles) <> 'member' then raise exception 'FAIL: client chose its own role'; end if;
end $$;
insert into public.check_ins (user_id, habit_id, entry_date, done)
  values ('00000000-0000-0000-0000-00000000000a', 'walk', '2026-11-01', true);
insert into public.companion_state (user_id, state) values ('00000000-0000-0000-0000-00000000000a', '{"version":1}');
insert into public.academy_state (user_id, state) values ('00000000-0000-0000-0000-00000000000a', '{"lessons":{}}');
insert into public.friend_challenge (user_id, started_on, done_days) values ('00000000-0000-0000-0000-00000000000a', '2026-11-20', '{1}');
insert into public.health_readings (user_id, kind, measured_at, systolic, diastolic, pulse)
  values ('00000000-0000-0000-0000-00000000000a', 'blood_pressure', '2026-11-20 08:00+00', 124, 79, 70);
insert into public.health_readings (user_id, kind, measured_at, glucose_mgdl, glucose_context, unit)
  values ('00000000-0000-0000-0000-00000000000a', 'glucose', '2026-11-20 07:30+00', 95.5, 'fasting', 'mmol/L');

-- A cannot write health readings for B, and the shape and number checks hold.
do $$ begin
  insert into public.health_readings (user_id, kind, measured_at, systolic, diastolic)
    values ('00000000-0000-0000-0000-00000000000b', 'blood_pressure', now(), 120, 80);
  raise exception 'FAIL: wrote a health reading for another user';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  insert into public.health_readings (user_id, kind, measured_at, systolic, diastolic)
    values ('00000000-0000-0000-0000-00000000000a', 'blood_pressure', now(), 80, 120);
  raise exception 'FAIL: diastolic above systolic was saved';
exception when check_violation then null;
end $$;
do $$ begin
  insert into public.health_readings (user_id, kind, measured_at, glucose_mgdl, glucose_context, unit)
    values ('00000000-0000-0000-0000-00000000000a', 'glucose', now(), 5.6, 'fasting', 'mmol/L');
  raise exception 'FAIL: a glucose value below the limit was saved';
exception when check_violation then null;
end $$;
do $$ begin
  insert into public.health_readings (user_id, kind, measured_at, unit)
    values ('00000000-0000-0000-0000-00000000000a', 'cholesterol', now(), 'mg/dL');
  raise exception 'FAIL: an empty cholesterol reading was saved';
exception when check_violation then null;
end $$;
do $$ begin
  insert into public.health_readings (user_id, kind, measured_at, systolic, diastolic, glucose_mgdl, glucose_context, unit)
    values ('00000000-0000-0000-0000-00000000000a', 'glucose', now(), 120, 80, 100, 'fasting', 'mg/dL');
  raise exception 'FAIL: a glucose reading with blood pressure columns was saved';
exception when check_violation then null;
end $$;

-- A cannot write Academy progress for B, and the size check holds.
do $$ begin
  insert into public.academy_state (user_id, state) values ('00000000-0000-0000-0000-00000000000b', '{}');
  raise exception 'FAIL: wrote academy data for another user';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  update public.academy_state set state = jsonb_build_object('x', repeat('a', 1100000)) where user_id = '00000000-0000-0000-0000-00000000000a';
  raise exception 'FAIL: oversized academy state was saved';
exception when check_violation then null;
end $$;

-- A cannot write companion data for B, and the size check holds.
do $$ begin
  insert into public.companion_state (user_id, state) values ('00000000-0000-0000-0000-00000000000b', '{}');
  raise exception 'FAIL: wrote companion data for another user';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  update public.companion_state set state = jsonb_build_object('x', repeat('a', 300000)) where user_id = '00000000-0000-0000-0000-00000000000a';
  raise exception 'FAIL: oversized companion state was saved';
exception when check_violation then null;
end $$;

-- A cannot write a row for B.
do $$ begin
  insert into public.check_ins (user_id, habit_id, entry_date, done)
    values ('00000000-0000-0000-0000-00000000000b', 'walk', '2026-11-01', true);
  raise exception 'FAIL: wrote a row for another user';
exception when insufficient_privilege then null;
end $$;

-- Sample data is refused.
do $$ begin
  insert into public.assessments (user_id, answers)
    values ('00000000-0000-0000-0000-00000000000a', '{"displayName":"Sample visitor"}');
  raise exception 'FAIL: sample data was saved';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
end $$;

-- B has a verified authenticator, so an AAL1 session cannot use rows.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'aal1');
do $$ begin
  insert into public.profiles (user_id, display_name) values ('00000000-0000-0000-0000-00000000000b', 'B');
  raise exception 'FAIL: AAL1 session wrote rows for an account with an authenticator';
exception when insufficient_privilege then null;
end $$;

select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'aal2');
insert into public.profiles (user_id, display_name) values ('00000000-0000-0000-0000-00000000000b', 'B');
do $$ begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'FAIL: B can see other profiles'; end if;
  if (select count(*) from public.check_ins) <> 0 then raise exception 'FAIL: B can see A check-ins'; end if;
  if (select count(*) from public.companion_state) <> 0 then raise exception 'FAIL: B can see A companion data'; end if;
  if (select count(*) from public.academy_state) <> 0 then raise exception 'FAIL: B can see A academy data'; end if;
  if (select count(*) from public.health_readings) <> 0 then raise exception 'FAIL: B can see A health readings'; end if;
end $$;

-- Browser roles cannot read community tables.
do $$ begin
  perform count(*) from public.community_messages;
  raise exception 'FAIL: community table is readable by the browser role';
exception when insufficient_privilege then null;
end $$;

-- The allowlisted email becomes admin through the trigger.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000c', 'aal1');
insert into public.profiles (user_id, display_name) values ('00000000-0000-0000-0000-00000000000c', 'Owner');
do $$ begin
  if (select role from public.profiles) <> 'admin' then raise exception 'FAIL: allowlisted owner is not admin'; end if;
end $$;

-- Account deletion removes that person's rows and login only.
select pg_temp.as_user('00000000-0000-0000-0000-00000000000a', 'aal1');
select public.delete_own_account();
reset role;
do $$ begin
  if exists (select 1 from auth.users where id = '00000000-0000-0000-0000-00000000000a') then
    raise exception 'FAIL: login was not deleted';
  end if;
  if exists (select 1 from public.check_ins where user_id = '00000000-0000-0000-0000-00000000000a') then
    raise exception 'FAIL: rows were left behind';
  end if;
  if exists (select 1 from public.companion_state where user_id = '00000000-0000-0000-0000-00000000000a') then
    raise exception 'FAIL: companion data was left behind';
  end if;
  if exists (select 1 from public.academy_state where user_id = '00000000-0000-0000-0000-00000000000a') then
    raise exception 'FAIL: academy data was left behind';
  end if;
  if exists (select 1 from public.health_readings where user_id = '00000000-0000-0000-0000-00000000000a') then
    raise exception 'FAIL: health readings were left behind';
  end if;
  if exists (select 1 from public.friend_challenge where user_id = '00000000-0000-0000-0000-00000000000a') then
    raise exception 'FAIL: friend challenge was left behind';
  end if;
  if (select count(*) from auth.users) <> 2 then raise exception 'FAIL: other logins were touched'; end if;
end $$;

-- Invitation-only registration.
-- The server (service role) writes invitations; here the test owner stands in for it.
insert into public.care_invitations (token, user_id)
  values ('CareLinkToken_abcdefghijklmnopqrstuvwxyz012', '00000000-0000-0000-0000-00000000000b');
insert into public.registration_invites (email, source, invited_by, expires_at)
  values ('invited@example.org', 'admin', '00000000-0000-0000-0000-00000000000c', now() + interval '7 days');
insert into public.registration_invites (email, source, invited_by, care_token, expires_at)
  values ('friend@example.org', 'share_care', '00000000-0000-0000-0000-00000000000b',
          'CareLinkToken_abcdefghijklmnopqrstuvwxyz012', now() + interval '2 days');
insert into public.registration_invites (email, source, expires_at)
  values ('late@example.org', 'admin', now() - interval '1 minute');
insert into public.registration_invites (email, source, expires_at, revoked_at)
  values ('revoked@example.org', 'admin', now() + interval '7 days', now());

-- An invited email may get a login, and the invitation is then used.
insert into auth.users values ('00000000-0000-0000-0000-0000000000d1', ' Invited@Example.org ');
do $$ begin
  if not exists (select 1 from public.registration_invites
                 where email = 'invited@example.org' and used_at is not null
                   and used_by = '00000000-0000-0000-0000-0000000000d1') then
    raise exception 'FAIL: the admin invitation was not marked used';
  end if;
end $$;

-- A used invitation cannot create a second login.
do $$ begin
  insert into auth.users values ('00000000-0000-0000-0000-0000000000d2', 'invited@example.org');
  raise exception 'FAIL: one invitation created two logins';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
end $$;

-- An expired or revoked invitation is refused.
do $$ begin
  insert into auth.users values ('00000000-0000-0000-0000-0000000000d3', 'late@example.org');
  raise exception 'FAIL: an expired invitation created a login';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
end $$;
do $$ begin
  insert into auth.users values ('00000000-0000-0000-0000-0000000000d4', 'revoked@example.org');
  raise exception 'FAIL: a revoked invitation created a login';
exception when raise_exception then
  if sqlerrm like 'FAIL%' then raise; end if;
end $$;

-- A Share the Care invitation counts one registration on its link.
insert into auth.users values ('00000000-0000-0000-0000-0000000000d5', 'friend@example.org');
do $$ begin
  if (select registered_count from public.care_invitations
      where token = 'CareLinkToken_abcdefghijklmnopqrstuvwxyz012') <> 1 then
    raise exception 'FAIL: the Share the Care registration was not counted';
  end if;
end $$;

-- Invite a Friend: each person sees only their own challenge row, and the
-- shared summary returns counts, never another person's steps or id.
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000d5', 'aal1');
insert into public.friend_challenge (user_id, started_on, done_days, share_with_friends)
  values ('00000000-0000-0000-0000-0000000000d5', '2026-11-20', '{1,2}', true);
do $$ begin
  insert into public.friend_challenge (user_id, started_on)
    values ('00000000-0000-0000-0000-0000000000b0', '2026-11-20');
  raise exception 'FAIL: wrote a challenge row for another user';
exception when insufficient_privilege or foreign_key_violation then null;
end $$;
do $$ begin
  update public.friend_challenge set done_days = '{1,8}';
  raise exception 'FAIL: a challenge day outside 1 to 7 was accepted';
exception when check_violation then null;
end $$;
do $$ declare s jsonb := public.friend_circle_summary(); begin
  if not (s ->> 'joined_through_friend')::boolean then raise exception 'FAIL: the friend was not linked to the inviter'; end if;
  if (s ->> 'friends_joined')::int <> 0 then raise exception 'FAIL: the friend was counted as an inviter'; end if;
  if (s ->> 'together_days')::int <> 2 then raise exception 'FAIL: own days were not counted (%).', s; end if;
  if s ? 'user_id' or s::text like '%0000-0000%' then raise exception 'FAIL: the summary returned an id'; end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'aal2');
insert into public.friend_challenge (user_id, started_on, done_days)
  values ('00000000-0000-0000-0000-00000000000b', '2026-11-21', '{1}');
do $$ declare s jsonb := public.friend_circle_summary(); begin
  if (select count(*) from public.friend_challenge) <> 1 then raise exception 'FAIL: B can see a friend''s challenge row'; end if;
  if (s ->> 'friends_joined')::int <> 1 then raise exception 'FAIL: the friend who joined was not counted'; end if;
  if (s ->> 'joined_through_friend')::boolean then raise exception 'FAIL: B was marked as invited'; end if;
  if (s ->> 'friends_sharing')::int <> 1 or (s ->> 'together_days')::int <> 3 then
    raise exception 'FAIL: the shared total is wrong (%).', s;
  end if;
end $$;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000d5', 'aal1');
update public.friend_challenge set share_with_friends = false;
select pg_temp.as_user('00000000-0000-0000-0000-00000000000b', 'aal2');
do $$ declare s jsonb := public.friend_circle_summary(); begin
  if (s ->> 'friends_sharing')::int <> 0 or (s ->> 'together_days')::int <> 1 then
    raise exception 'FAIL: a friend who stopped sharing was still added (%).', s;
  end if;
end $$;
reset role;
set role anon;
do $$ begin
  perform public.friend_circle_summary();
  raise exception 'FAIL: the signed-out role can call the friend summary';
exception when insufficient_privilege then null;
end $$;
reset role;

-- Browsers cannot read invitations or add a registration count.
set role anon;
do $$ begin
  perform count(*) from public.registration_invites;
  raise exception 'FAIL: invitations are readable by the signed-out role';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  perform count(*) from public.check_ins;
  raise exception 'FAIL: check-ins are readable by the signed-out role';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  if public.note_care_invitation('CareLinkToken_abcdefghijklmnopqrstuvwxyz012', 'register') then
    raise exception 'FAIL: the browser added a registration count';
  end if;
  if not public.note_care_invitation('CareLinkToken_abcdefghijklmnopqrstuvwxyz012', 'open') then
    raise exception 'FAIL: opening an active link was not counted';
  end if;
end $$;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000d1', 'aal1');
do $$ begin
  perform count(*) from public.registration_invites;
  raise exception 'FAIL: invitations are readable by a signed-in member';
exception when insufficient_privilege then null;
end $$;
-- A member cannot give their own link a higher registration limit.
do $$ begin
  insert into public.care_invitations (token, user_id, max_registrations)
    values ('CareLinkToken_zyxwvutsrqponmlkjihgfedcba987', '00000000-0000-0000-0000-0000000000d1', 50);
  raise exception 'FAIL: a member raised their own link limit';
exception when insufficient_privilege then null;
end $$;
-- Deleting the account removes that person's invitation row too.
select public.delete_own_account();
reset role;
do $$ begin
  if exists (select 1 from public.registration_invites where email = 'invited@example.org') then
    raise exception 'FAIL: the invitation row was left after account deletion';
  end if;
end $$;

-- Reviews & Feedback: browser roles cannot read or write any feedback table,
-- a review cannot be published without consent, and account deletion removes rows.
alter table auth.users disable trigger auth_users_allowlist;
insert into auth.users values ('00000000-0000-0000-0000-0000000000e1', 'reviewer@example.org');
alter table auth.users enable trigger auth_users_allowlist;
insert into public.feedback_reviews (id, user_id, rating, liked_text, publish_consent, status, admin_note)
  values ('00000000-0000-0000-0000-0000000000f1', '00000000-0000-0000-0000-0000000000e1', 2, 'Honest note', true, 'published', 'private note');
insert into public.feedback_suggestions (user_id, category, title, admin_note)
  values ('00000000-0000-0000-0000-0000000000e1', 'feature', 'Dark mode', 'private note');
insert into public.feedback_announcements (title, description, implemented_on, published)
  values ('You asked, we listened', 'Added a section', '2026-11-22', true);
do $$ begin
  insert into public.feedback_reviews (user_id, rating, publish_consent, status)
    values ('00000000-0000-0000-0000-0000000000e1', 5, false, 'published');
  raise exception 'FAIL: a review without consent was published';
exception when check_violation then null;
end $$;
do $$ begin
  insert into public.feedback_reviews (user_id, rating, publish_consent, display_name)
    values ('00000000-0000-0000-0000-0000000000e1', 5, false, 'Anna');
  raise exception 'FAIL: a name was kept without consent';
exception when check_violation then null;
end $$;
do $$ begin
  insert into public.feedback_announcements (title, description, implemented_on, image_path)
    values ('x', 'y', '2026-11-22', 'https://example.org/a.png');
  raise exception 'FAIL: an outside image address was accepted';
exception when check_violation then null;
end $$;
set role authenticated;
select pg_temp.as_user('00000000-0000-0000-0000-0000000000e1', 'aal1');
do $$ begin
  perform count(*) from public.feedback_reviews;
  raise exception 'FAIL: a signed-in member read the reviews table directly';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  perform count(*) from public.feedback_suggestions;
  raise exception 'FAIL: a signed-in member read the suggestions table directly';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  insert into public.feedback_reviews (user_id, rating, publish_consent, status)
    values ('00000000-0000-0000-0000-0000000000e1', 5, true, 'published');
  raise exception 'FAIL: a signed-in member published their own review';
exception when insufficient_privilege then null;
end $$;
do $$ begin
  update public.feedback_announcements set published = false;
  raise exception 'FAIL: a signed-in member changed an announcement';
exception when insufficient_privilege then null;
end $$;
set role anon;
select pg_temp.as_user('', '');
do $$ begin
  perform count(*) from public.feedback_announcements;
  raise exception 'FAIL: a signed-out visitor read announcements directly';
exception when insufficient_privilege then null;
end $$;
reset role;
delete from auth.users where id = '00000000-0000-0000-0000-0000000000e1';
do $$ begin
  if exists (select 1 from public.feedback_reviews where user_id = '00000000-0000-0000-0000-0000000000e1')
     or exists (select 1 from public.feedback_suggestions where user_id = '00000000-0000-0000-0000-0000000000e1') then
    raise exception 'FAIL: feedback rows were left after the account was deleted';
  end if;
end $$;

\echo All policy checks passed.
