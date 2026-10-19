-- Brojanje pregleda sajta. Paste into Supabase → SQL Editor → Run.

create table if not exists public.site_views (
  id text primary key,
  created_at timestamptz not null default now(),
  day date not null,
  page text not null,
  slug text not null default '',
  visitor text not null,
  unique_day boolean not null default false
);

create index if not exists site_views_day_idx on public.site_views (day desc);
create index if not exists site_views_page_idx on public.site_views (page);
create index if not exists site_views_slug_idx on public.site_views (slug);

alter table public.site_views enable row level security;
