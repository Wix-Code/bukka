-- ============================================================================
-- Bukka — platform admin schema
-- Run after schema.sql, storage.sql, billing.sql.
-- ============================================================================

-- There's no signup flow for this table on purpose. To make someone an
-- admin: create their user in Supabase Auth (dashboard → Authentication →
-- Add user, or invite by email), then insert a row here with their user id:
--
--   insert into public.admins (id) values ('<their-auth-user-id>');
--
-- Note: the existing handle_new_vendor() trigger fires on every new
-- auth.users row regardless of whether they'll be an admin, so an admin
-- account will also end up with a harmless, unused vendors row. That's
-- fine — it's not reachable in any meaningful way, just cosmetic clutter.
create table if not exists public.admins (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- An admin can only ever confirm their own membership — never list or
-- browse other admins. This is deliberately the only policy on this table.
create policy "Admins can check their own membership"
  on public.admins for select
  using (auth.uid() = id);