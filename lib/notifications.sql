-- ============================================================================
-- Bukka — notifications + avatar
-- Run after schema.sql (and the others, if not already applied).
-- ============================================================================

alter table public.vendors
  add column if not exists avatar_url text not null default '',
  add column if not exists notifications_last_seen_at timestamptz not null default now();

-- Both columns above are ordinary vendor-owned UI state (not billing-
-- sensitive like the columns in billing.sql), so the existing "Vendors can
-- update their own row" policy from schema.sql already covers writing to
-- them — no new policy needed here.

-- ----------------------------------------------------------------------------
-- Enable Realtime on `orders` so the dashboard can subscribe to new rows
-- as they're inserted, instead of polling. Wrapped in a DO block so this
-- is safe to re-run if `orders` is already part of the publication.
-- ----------------------------------------------------------------------------
do $$
begin
  execute 'alter publication supabase_realtime add table public.orders';
exception
  when duplicate_object then
    raise notice 'orders is already part of supabase_realtime — nothing to do.';
end $$;

