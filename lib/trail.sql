-- ============================================================================
-- Bukka — free trial enforcement
-- Run after schema.sql and billing.sql.
-- ============================================================================

alter table public.vendors
  add column if not exists trial_ends_at timestamptz;

-- Existing vendors (created before this column existed) get a trial
-- computed from when they actually signed up, rather than being left null
-- (which would otherwise need special-casing as either "never expires" or
-- "already expired" — backfilling is simpler and more honest).
update public.vendors
set trial_ends_at = created_at + interval '14 days'
where trial_ends_at is null;

-- Same reasoning as the plan/plan_status columns in billing.sql: without
-- this, a vendor could just update their own trial_ends_at from the
-- browser client and extend their trial indefinitely. Only the trigger
-- below (which runs as the table owner) or the service role can set it.
revoke update (trial_ends_at) on public.vendors from authenticated;

-- ----------------------------------------------------------------------------
-- Update the signup trigger to start the clock for new vendors.
-- To switch from 14 days to 7, change ONLY the interval on the line below
-- and re-run this whole file.
-- ----------------------------------------------------------------------------
create or replace function public.handle_new_vendor()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  base_slug text;
  final_slug text;
  suffix int := 0;
begin
  base_slug := public.slugify(coalesce(new.raw_user_meta_data->>'restaurant_name', 'restaurant'));
  if base_slug = '' then
    base_slug := 'restaurant';
  end if;

  final_slug := base_slug;

  while exists (select 1 from public.vendors where slug = final_slug) loop
    suffix := suffix + 1;
    final_slug := base_slug || '-' || suffix;
  end loop;

  insert into public.vendors (id, name, slug, trial_ends_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'restaurant_name', 'My Restaurant'),
    final_slug,
    now() + interval '14 days'  -- <<< change this to '7 days' to switch
  );

  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- The actual enforcement: a vendor can only add or edit menu items while
-- either subscribed (plan_status = 'active') or still inside their trial
-- window. This is checked at the database level, so it can't be bypassed
-- by calling Supabase directly from the browser even if the dashboard UI
-- didn't disable the button.
--
-- Deliberately NOT restricted: reading the menu (customers still see it),
-- deleting dishes (harmless cleanup), and existing orders (an expired
-- trial shouldn't cut off a sale already in motion).
-- ----------------------------------------------------------------------------
drop policy if exists "Vendors can insert their own dishes" on public.menu_items;
create policy "Vendors can insert their own dishes"
  on public.menu_items for insert
  with check (
    auth.uid() = vendor_id
    and exists (
      select 1 from public.vendors v
      where v.id = auth.uid()
        and (v.plan_status = 'active' or v.trial_ends_at > now())
    )
  );

drop policy if exists "Vendors can update their own dishes" on public.menu_items;
create policy "Vendors can update their own dishes"
  on public.menu_items for update
  using (auth.uid() = vendor_id)
  with check (
    auth.uid() = vendor_id
    and exists (
      select 1 from public.vendors v
      where v.id = auth.uid()
        and (v.plan_status = 'active' or v.trial_ends_at > now())
    )
  );