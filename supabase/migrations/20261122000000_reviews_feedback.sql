-- lifeZoi: Reviews & Feedback.
--
-- Adds three new tables. It changes no existing table and deletes no row.
-- Applied to production by the "Database migrations" GitHub Action
-- (.github/workflows/db-migrate.yml) only after the pull request is merged to
-- main, with supabase/verify.sql before and after. The app itself does not run it.
-- It is safe to run more than once. The same statements are in supabase/schema.sql.
--
-- Who can read and write:
-- * Browser roles (anon, authenticated) have no rights on these tables, and row
--   level security is on with no policy, so a browser request gets nothing even
--   with a valid sign-in.
-- * Only the server (service role) reads and writes them, after it has checked
--   the member's sign-in (requireMember) or the administrator's (requireAdmin).
-- * Members see published reviews that the author agreed to publish, published
--   announcements, and their own suggestions with their status. Administrator
--   notes, flags, and account ids are returned only to the administrator.
-- * Deleting an account removes that person's reviews and suggestions
--   (on delete cascade from auth.users).

create table if not exists public.feedback_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  rating smallint not null,
  liked_text text not null default '',
  liked_sections text[] not null default '{}',
  improve_text text not null default '',
  improve_sections text[] not null default '{}',
  features_text text not null default '',
  recommend text,
  thoughts text not null default '',
  publish_consent boolean not null default false,
  display_name text,
  locale text not null default 'en',
  status text not null default 'pending',
  flagged boolean not null default false,
  flag_reason text,
  admin_note text not null default '',
  client_request_id text,
  content_hash text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  constraint feedback_reviews_rating check (rating between 1 and 5),
  constraint feedback_reviews_text_length check (
    char_length(liked_text) <= 1000 and char_length(improve_text) <= 1000
    and char_length(features_text) <= 1000 and char_length(thoughts) <= 2000
  ),
  constraint feedback_reviews_sections_size check (cardinality(liked_sections) <= 20 and cardinality(improve_sections) <= 20),
  constraint feedback_reviews_recommend check (recommend is null or recommend in ('yes', 'maybe', 'no')),
  constraint feedback_reviews_status check (status in ('pending', 'published', 'hidden')),
  constraint feedback_reviews_flag_reason check (
    flag_reason is null or flag_reason in ('filter', 'spam', 'abuse', 'privacy', 'fraud', 'other')
  ),
  constraint feedback_reviews_locale check (locale ~ '^[a-z]{2}$'),
  constraint feedback_reviews_note_length check (char_length(admin_note) <= 2000),
  constraint feedback_reviews_request_id check (client_request_id is null or client_request_id ~ '^[A-Za-z0-9_-]{8,64}$'),
  -- A review is public only with the author's consent, and a name is kept only with that consent.
  constraint feedback_reviews_published_needs_consent check (status <> 'published' or publish_consent),
  constraint feedback_reviews_name_needs_consent check (display_name is null or publish_consent),
  constraint feedback_reviews_name_length check (display_name is null or char_length(display_name) between 1 and 30)
);

create unique index if not exists feedback_reviews_client_request
  on public.feedback_reviews (user_id, client_request_id)
  where client_request_id is not null;

create index if not exists feedback_reviews_user_idx
  on public.feedback_reviews (user_id, created_at desc);

create index if not exists feedback_reviews_public_idx
  on public.feedback_reviews (published_at desc)
  where status = 'published';

create table if not exists public.feedback_suggestions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text not null,
  title text not null,
  details text not null default '',
  theme text not null default '',
  status text not null default 'new',
  flagged boolean not null default false,
  flag_reason text,
  admin_note text not null default '',
  source text not null default 'form',
  review_id uuid references public.feedback_reviews (id) on delete set null,
  locale text not null default 'en',
  client_request_id text,
  content_hash text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_suggestions_category check (category in (
    'feature', 'improvement', 'wellness-category', 'problem', 'assistant-question',
    'education', 'positive', 'missing', 'other'
  )),
  constraint feedback_suggestions_status check (status in (
    'new', 'under-review', 'planned', 'in-progress', 'completed', 'declined'
  )),
  constraint feedback_suggestions_flag_reason check (
    flag_reason is null or flag_reason in ('filter', 'spam', 'abuse', 'privacy', 'fraud', 'other')
  ),
  constraint feedback_suggestions_source check (source in ('form', 'review')),
  constraint feedback_suggestions_text_length check (
    char_length(title) between 1 and 120 and char_length(details) <= 2000
    and char_length(theme) <= 60 and char_length(admin_note) <= 2000
  ),
  constraint feedback_suggestions_locale check (locale ~ '^[a-z]{2}$'),
  constraint feedback_suggestions_request_id check (client_request_id is null or client_request_id ~ '^[A-Za-z0-9_-]{8,64}$')
);

create unique index if not exists feedback_suggestions_client_request
  on public.feedback_suggestions (user_id, client_request_id)
  where client_request_id is not null;

create index if not exists feedback_suggestions_user_idx
  on public.feedback_suggestions (user_id, created_at desc);

create index if not exists feedback_suggestions_status_idx
  on public.feedback_suggestions (status, created_at desc);

create table if not exists public.feedback_announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  image_path text,
  implemented_on date not null,
  category text not null default '',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_announcements_text_length check (
    char_length(title) between 1 and 120 and char_length(description) between 1 and 1200
    and char_length(category) <= 60
  ),
  -- Only an image that is already part of the site, never an outside address.
  constraint feedback_announcements_image_path check (
    image_path is null or (image_path ~ '^/[A-Za-z0-9/_.-]{1,200}$' and position('..' in image_path) = 0)
  )
);

create index if not exists feedback_announcements_published_idx
  on public.feedback_announcements (implemented_on desc)
  where published;

alter table public.feedback_reviews enable row level security;
alter table public.feedback_suggestions enable row level security;
alter table public.feedback_announcements enable row level security;

-- No policies: only the server's service role (which bypasses row level security) uses these tables.
revoke all on table public.feedback_reviews from public, anon, authenticated;
revoke all on table public.feedback_suggestions from public, anon, authenticated;
revoke all on table public.feedback_announcements from public, anon, authenticated;
