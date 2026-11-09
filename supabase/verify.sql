-- lifeZoi read-only setup check.
-- Paste into the Supabase SQL editor after running schema.sql.
-- It only reads catalog information. It does not read or change anyone's rows.
-- Every line should say ok = true.

with expected_tables(name) as (
  values
    ('profiles'), ('assessments'), ('scenarios'), ('habit_goals'), ('check_ins'),
    ('care_invitations'), ('companion_state'),
    ('community_profiles'), ('community_messages'), ('community_reports'),
    ('community_blocks'), ('community_mutes')
),
expected_policies(tbl, name) as (
  values
    ('profiles', 'profiles_own_rows'),
    ('assessments', 'assessments_own_rows'),
    ('scenarios', 'scenarios_own_rows'),
    ('habit_goals', 'habit_goals_own_rows'),
    ('check_ins', 'check_ins_own_rows'),
    ('care_invitations', 'care_invitations_select_own'),
    ('care_invitations', 'care_invitations_insert_own'),
    ('companion_state', 'companion_state_own_rows')
),
expected_functions(name) as (
  values
    ('auth_session_may_use_rows'), ('enforce_profile_role'), ('reject_sample_assessment'),
    ('delete_own_account'), ('revoke_care_invitation'), ('note_care_invitation'),
    ('account_email_allowed'), ('enforce_account_allowlist')
),
expected_triggers(tbl, name) as (
  values ('profiles', 'profiles_enforce_role'), ('assessments', 'assessments_reject_sample')
),
expected_columns(tbl, col) as (
  values ('profiles', 'role'), ('profiles', 'session_state')
)
select 'table exists' as check, t.name as item, c.oid is not null as ok
from expected_tables t
left join pg_class c on c.relname = t.name and c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
union all
select 'row level security on', t.name, coalesce(c.relrowsecurity, false)
from expected_tables t
left join pg_class c on c.relname = t.name and c.relnamespace = 'public'::regnamespace and c.relkind = 'r'
union all
select 'policy exists', p.tbl || '.' || p.name, exists (
  select 1 from pg_policies where schemaname = 'public' and tablename = p.tbl and policyname = p.name
)
from expected_policies p
union all
select 'function exists', f.name, exists (
  select 1 from pg_proc where proname = f.name and pronamespace = 'public'::regnamespace
)
from expected_functions f
union all
select 'trigger exists', g.tbl || '.' || g.name, exists (
  select 1 from pg_trigger tr
  join pg_class c on c.oid = tr.tgrelid
  where c.relname = g.tbl and c.relnamespace = 'public'::regnamespace and tr.tgname = g.name and not tr.tgisinternal
)
from expected_triggers g
union all
select 'trigger exists', 'auth.users.auth_users_allowlist', exists (
  select 1 from pg_trigger tr
  join pg_class c on c.oid = tr.tgrelid
  where c.relname = 'users' and c.relnamespace = 'auth'::regnamespace and tr.tgname = 'auth_users_allowlist' and not tr.tgisinternal
)
union all
select 'column exists', e.tbl || '.' || e.col, exists (
  select 1 from information_schema.columns
  where table_schema = 'public' and table_name = e.tbl and column_name = e.col
)
from expected_columns e
union all
select 'browser roles cannot read community tables', t.name,
  not has_table_privilege('anon', 'public.' || t.name, 'select')
  and not has_table_privilege('authenticated', 'public.' || t.name, 'select')
from expected_tables t
where t.name like 'community_%' and to_regclass('public.' || t.name) is not null
order by 1, 2;
