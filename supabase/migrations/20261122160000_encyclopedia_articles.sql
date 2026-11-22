-- LifeZoi Health Encyclopedia: editorial records.
--
-- Applied to production by the "Database migrations" GitHub Action
-- (.github/workflows/db-migrate.yml) after it merges to main. The app itself
-- does not run it. Until the table exists, the encyclopedia shows only its
-- built-in articles and the editor page says storage is not set up.
--
-- One row per article an editor has saved: a new article, or an edited copy of
-- a built-in one with the same slug. Status moves draft -> in_review ->
-- published, or to archived. Only published rows are shown to members, and the
-- server refuses to publish without a source and a named reviewer.
--
-- Only the server's service role reads or writes this table (the admin and
-- reader API routes). Row level security is on with no policies for the
-- browser roles, so the anon and authenticated keys cannot touch it.
-- The rows are editorial content, not anyone's health information.
-- Additive only: no existing table or row is changed.

create table if not exists public.encyclopedia_articles (
  slug text primary key,
  category text not null,
  status text not null default 'draft',
  article jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null,
  constraint encyclopedia_articles_slug check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 80),
  constraint encyclopedia_articles_status check (status in ('draft', 'in_review', 'published', 'archived')),
  constraint encyclopedia_articles_size check (octet_length(article::text) <= 262144)
);

create index if not exists encyclopedia_articles_status_idx on public.encyclopedia_articles (status);

alter table public.encyclopedia_articles enable row level security;

revoke all on table public.encyclopedia_articles from public, anon, authenticated;
