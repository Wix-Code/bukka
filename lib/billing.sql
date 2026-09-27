-- ============================================================================
-- Bukka — billing schema
-- Run after schema.sql and storage.sql.
-- ============================================================================

alter table public.vendors
  add column if not exists plan_status text not null default 'inactive'
    check (plan_status in ('inactive', 'active', 'past_due', 'cancelled')),
  add column if not exists paystack_customer_code text,
  add column if not exists paystack_subscription_code text,
  add column if not exists plan_renews_at timestamptz;

-- ----------------------------------------------------------------------------
-- Security fix: the original "Vendors can update their own row" policy from
-- schema.sql lets an authenticated vendor PATCH *any* column on their own
-- row — including `plan`. RLS is row-level, not column-level, so a policy
-- alone can't stop that. Postgres column privileges can: this revokes write
-- access to the billing-sensitive columns from ordinary logged-in users,
-- leaving them writable only by the service role (used exclusively by the
-- Paystack webhook and checkout routes below, never by the browser).
-- ----------------------------------------------------------------------------
revoke update (
  plan,
  plan_status,
  paystack_customer_code,
  paystack_subscription_code,
  plan_renews_at
) on public.vendors from authenticated;

-- ============================================================================
-- invoices
-- Populated exclusively by the Paystack webhook (via the service role
-- client), never directly by a vendor's own session — so there's no insert
-- or update policy for `authenticated` at all. A vendor can only ever read
-- their own invoices, never create or edit one.
-- ============================================================================
create table if not exists public.invoices (
  id text primary key, -- the Paystack transaction reference
  vendor_id uuid not null references public.vendors(id) on delete cascade,
  amount numeric(10, 2) not null,
  status text not null default 'paid' check (status in ('paid', 'failed')),
  paid_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists invoices_vendor_id_idx on public.invoices (vendor_id);

alter table public.invoices enable row level security;

create policy "Vendors can view their own invoices"
  on public.invoices for select
  using (auth.uid() = vendor_id);