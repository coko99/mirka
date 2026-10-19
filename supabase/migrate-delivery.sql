alter table public.orders
  add column if not exists checkout jsonb not null default '{}'::jsonb;
