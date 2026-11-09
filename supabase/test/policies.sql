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
  if (select count(*) from auth.users) <> 2 then raise exception 'FAIL: other logins were touched'; end if;
end $$;

\echo All policy checks passed.
