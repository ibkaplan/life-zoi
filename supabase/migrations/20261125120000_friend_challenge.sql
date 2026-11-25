-- LifeZoi Invite a Friend: the 7-day Together challenge and friend badges.
--
-- Adds one new table and one read-only function. It changes no existing table
-- and deletes no row. Applied to production by the "Database migrations"
-- GitHub Action (.github/workflows/db-migrate.yml) after it merges to main,
-- with supabase/verify.sql before and after. The app itself does not run it.
-- It is safe to run more than once. The same statements are in supabase/schema.sql.
--
-- friend_challenge holds one row per person: the day they started the 7-day
-- Together challenge, which of the seven steps they ticked, and whether they
-- chose to add their ticked days to their friends' shared total. It holds no
-- health information. Row level security keeps it to its owner, and deleting
-- the account deletes it (on delete cascade). Until the table exists, the
-- challenge is kept in the browser and the page says so.
--
-- friend_circle_summary() lets a signed-in member see only counts about the
-- friends linked to them by a Share the Care invitation: how many friends
-- joined through their link, whether they joined through a friend's link, and
-- the shared total of ticked days from friends who chose to share. It never
-- returns a name, an email address, an account id, or one friend's own steps.

create table if not exists public.friend_challenge (
  user_id uuid primary key references auth.users (id) on delete cascade,
  started_on date not null,
  done_days smallint[] not null default '{}',
  share_with_friends boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint friend_challenge_days check (
    done_days <@ array[1, 2, 3, 4, 5, 6, 7]::smallint[] and cardinality(done_days) <= 7
  )
);

alter table public.friend_challenge enable row level security;

revoke all on table public.friend_challenge from public, anon;
grant select, insert, update, delete on table public.friend_challenge to authenticated;

drop policy if exists friend_challenge_own_rows on public.friend_challenge;
create policy friend_challenge_own_rows on public.friend_challenge
  for all
  using (auth.uid() = user_id and public.auth_session_may_use_rows())
  with check (auth.uid() = user_id and public.auth_session_may_use_rows());

create or replace function public.friend_circle_summary()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  actor uuid := auth.uid();
  inviter uuid;
  invited uuid[] := '{}';
  friends uuid[];
  own_days integer := 0;
  shared_days integer := 0;
  sharing integer := 0;
begin
  if actor is null or not public.auth_session_may_use_rows() then
    return null;
  end if;
  if to_regclass('public.registration_invites') is not null then
    select c.user_id into inviter
    from public.registration_invites i
    join public.care_invitations c on c.token = i.care_token
    where i.used_by = actor
      and i.source = 'share_care'
      and c.user_id <> actor
    order by i.used_at
    limit 1;
    select coalesce(array_agg(distinct i.used_by), '{}') into invited
    from public.registration_invites i
    join public.care_invitations c on c.token = i.care_token
    where c.user_id = actor
      and i.source = 'share_care'
      and i.used_by is not null
      and i.used_by <> actor;
  end if;
  friends := invited || case when inviter is null or inviter = any (invited) then '{}'::uuid[] else array[inviter] end;
  select coalesce(cardinality(f.done_days), 0) into own_days
  from public.friend_challenge f
  where f.user_id = actor;
  select coalesce(sum(cardinality(f.done_days)), 0), count(*) into shared_days, sharing
  from public.friend_challenge f
  where f.user_id = any (friends)
    and f.share_with_friends;
  return jsonb_build_object(
    'friends_joined', cardinality(invited),
    'joined_through_friend', inviter is not null,
    'friends_sharing', sharing,
    'together_days', coalesce(own_days, 0) + shared_days
  );
end;
$$;

revoke all on function public.friend_circle_summary() from public, anon;
grant execute on function public.friend_circle_summary() to authenticated;
