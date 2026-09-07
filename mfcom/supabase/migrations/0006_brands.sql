-- MF COM — brands table
-- Run in the Supabase SQL Editor after 0005_orders.sql.
--
-- Brands were previously a hardcoded array in lib/mock-data.ts with no
-- admin management at all. This moves them to the same pattern as
-- categories (0002_categories.sql): a real table, publicly readable,
-- editable from /admin/brands, and quick-addable inline from the product
-- form the same way "+ New group…" already works for categories.

create table if not exists brands (
  id text primary key,
  name text not null,
  slug text unique not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table brands enable row level security;

drop policy if exists "Public read access" on brands;
create policy "Public read access" on brands
  for select using (true);

insert into brands (id, name, slug, position) values
  ('brand-logitech', 'Logitech', 'logitech', 0),
  ('brand-razer', 'Razer', 'razer', 1),
  ('brand-hyperx', 'HyperX', 'hyperx', 2),
  ('brand-corsair', 'Corsair', 'corsair', 3),
  ('brand-keychron', 'Keychron', 'keychron', 4),
  ('brand-asus', 'ASUS', 'asus', 5),
  ('brand-lenovo', 'Lenovo', 'lenovo', 6),
  ('brand-dell', 'Dell', 'dell', 7),
  ('brand-msi', 'MSI', 'msi', 8),
  ('brand-samsung', 'Samsung', 'samsung', 9),
  ('brand-boya', 'Boya', 'boya', 10)
on conflict (id) do nothing;
