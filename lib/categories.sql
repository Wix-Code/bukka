-- ============================================================================
-- Bukka — categories
-- Platform-wide dish categories, managed from the admin dashboard.
-- Run after schema.sql and admin.sql (the write policies depend on the
-- admins table).
-- ============================================================================

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) > 0),
  created_at timestamptz not null default now()
);

-- "Rice" and "rice " shouldn't both exist.
create unique index if not exists categories_name_unique_idx
  on public.categories (lower(btrim(name)));

alter table public.categories enable row level security;

-- Everyone can read categories: vendors need them in the dish form and
-- customers will use them to filter a public menu.
drop policy if exists "Categories are publicly viewable" on public.categories;
create policy "Categories are publicly viewable"
  on public.categories for select
  using (true);

-- Only platform admins can change them. Admins can read their own row in
-- the admins table (see admin.sql), so this membership check works under
-- RLS without needing the service role.
drop policy if exists "Admins can insert categories" on public.categories;
create policy "Admins can insert categories"
  on public.categories for insert
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "Admins can update categories" on public.categories;
create policy "Admins can update categories"
  on public.categories for update
  using (exists (select 1 from public.admins a where a.id = auth.uid()))
  with check (exists (select 1 from public.admins a where a.id = auth.uid()));

drop policy if exists "Admins can delete categories" on public.categories;
create policy "Admins can delete categories"
  on public.categories for delete
  using (exists (select 1 from public.admins a where a.id = auth.uid()));

-- Optional starter set. Uncomment to seed; safe to re-run.
-- insert into public.categories (name) values
--   ('Rice'), ('Soups & Stews'), ('Swallow'), ('Grills & Suya'),
--   ('Snacks'), ('Drinks'), ('Desserts')
-- on conflict do nothing;