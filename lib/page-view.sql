-- ============================================================================
-- Bukka — menu page views
-- Run after schema.sql.
-- ============================================================================

create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists page_views_vendor_id_idx on public.page_views (vendor_id);

alter table public.page_views enable row level security;

-- Visitors browsing a public menu are never logged in — same reasoning as
-- the "Anyone can place an order" policy on `orders`.
drop policy if exists "Anyone can record a page view" on public.page_views;
create policy "Anyone can record a page view"
  on public.page_views for insert
  with check (true);

drop policy if exists "Vendors can view their own page view counts" on public.page_views;
create policy "Vendors can view their own page view counts"
  on public.page_views for select
  using (auth.uid() = vendor_id);