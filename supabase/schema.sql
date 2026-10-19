-- MIRKA shop tables. Paste into Supabase → SQL Editor → Run.

create table if not exists public.products (
  id text primary key,
  slug text not null unique,
  name text not null,
  full_name text not null default '',
  price text not null,
  price_label text not null,
  category text not null,
  image_file text not null default '',
  source_image text not null default '',
  source_url text not null default '',
  image text not null,
  hidden boolean not null default false,
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_hidden_idx on public.products (hidden);
create index if not exists products_category_idx on public.products (category);

create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'nova'
    check (status in ('nova', 'u_pripremi', 'poslato', 'zavrseno', 'otkazano')),
  buyer_name text not null,
  buyer_phone text not null,
  buyer_note text not null default '',
  items jsonb not null default '[]'::jsonb,
  total integer not null default 0,
  total_label text not null default '',
  checkout jsonb not null default '{}'::jsonb,
  emailed_at timestamptz,
  email_error text
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx on public.orders (status);

create table if not exists public.messages (
  id text primary key,
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  phone text not null default '',
  message text not null,
  read boolean not null default false
);

create index if not exists messages_created_at_idx on public.messages (created_at desc);

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

alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.messages enable row level security;
alter table public.site_views enable row level security;

drop policy if exists products_public_read on public.products;
create policy products_public_read
  on public.products
  for select
  to anon, authenticated
  using (hidden = false);

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists product_images_public_read on storage.objects;
create policy product_images_public_read
  on storage.objects
  for select
  to public
  using (bucket_id = 'product-images');
