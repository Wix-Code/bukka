-- ============================================================================
-- Bukka — storage setup for uploaded images (dish photos, cover photos)
-- Run this after schema.sql, in the Supabase SQL Editor.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('menu-images', 'menu-images', true)
on conflict (id) do nothing;

-- Anyone can view images — this is what lets the public menu page and
-- customer browsers load dish/cover photos.
create policy "Menu images are publicly viewable"
  on storage.objects for select
  using (bucket_id = 'menu-images');

-- Uploads are only allowed into a folder matching the vendor's own user id,
-- e.g. `{vendor_id}/dishes/...` or `{vendor_id}/cover/...`. This is enforced
-- by storage.foldername(), which splits the object path into segments.
create policy "Vendors can upload into their own folder"
  on storage.objects for insert
  with check (
    bucket_id = 'menu-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Vendors can replace their own images"
  on storage.objects for update
  using (
    bucket_id = 'menu-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Vendors can delete their own images"
  on storage.objects for delete
  using (
    bucket_id = 'menu-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );