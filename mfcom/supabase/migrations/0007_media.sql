-- MF COM — media library moves off local disk onto Supabase Storage.
-- Run in the Supabase SQL Editor after 0006_brands.sql.
--
-- Local disk (app/api/upload/route.ts writing to .data/uploads) worked for
-- npm run dev / a persistent VPS, but Vercel's filesystem is ephemeral and
-- often read-only at runtime — uploaded product images would silently
-- vanish after a redeploy, or not even save in the first place. This
-- creates a public Storage bucket for the actual image bytes and a table
-- for the same metadata media-store.ts already tracked (filename, url,
-- size, uploaded_at).

create table if not exists media_items (
  id text primary key,
  filename text not null,
  storage_path text not null,
  url text not null,
  size integer not null,
  uploaded_at timestamptz not null default now()
);

alter table media_items enable row level security;

drop policy if exists "Public read access" on media_items;
create policy "Public read access" on media_items
  for select using (true);

-- The bucket the actual image bytes live in. public = true means anyone
-- with the URL can view the image (needed — these are product photos
-- shown on the storefront) but NOT list, upload, or delete without going
-- through server code that uses the secret key (which bypasses storage
-- RLS the same way it bypasses table RLS elsewhere in this app).
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public read access on media bucket" on storage.objects;
create policy "Public read access on media bucket" on storage.objects
  for select using (bucket_id = 'media');
