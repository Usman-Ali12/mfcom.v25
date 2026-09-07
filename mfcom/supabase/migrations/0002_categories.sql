-- MF COM — categories table
-- Run in the Supabase SQL Editor after 0001_products.sql.

create table if not exists categories (
  id text primary key,
  name text not null,
  slug text unique not null,
  "group" text not null,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

alter table categories enable row level security;

drop policy if exists "Public read access" on categories;
create policy "Public read access" on categories
  for select using (true);

insert into categories (id, name, slug, "group", position) values
  ('cat-laptops', 'Laptops', 'laptops', 'Computers', 0),
  ('cat-gaming-laptops', 'Gaming Laptops', 'gaming-laptops', 'Computers', 1),
  ('cat-business-laptops', 'Business Laptops', 'business-laptops', 'Computers', 2),
  ('cat-desktop-pcs', 'Desktop PCs', 'desktop-pcs', 'Computers', 3),
  ('cat-graphics-cards', 'Graphics Cards', 'graphics-cards', 'Components', 100),
  ('cat-processors', 'Processors', 'processors', 'Components', 101),
  ('cat-ram', 'RAM', 'ram', 'Components', 102),
  ('cat-ssd', 'SSD', 'ssd', 'Components', 103),
  ('cat-hdd', 'HDD', 'hdd', 'Components', 104),
  ('cat-keyboards', 'Keyboards', 'keyboards', 'Peripherals', 200),
  ('cat-mice', 'Mice', 'mice', 'Peripherals', 201),
  ('cat-headphones', 'Headphones', 'headphones', 'Peripherals', 202),
  ('cat-microphones', 'Microphones', 'microphones', 'Peripherals', 203),
  ('cat-speakers', 'Speakers', 'speakers', 'Peripherals', 204),
  ('cat-cables', 'Cables', 'cables', 'Accessories', 300),
  ('cat-chargers', 'Chargers', 'chargers', 'Accessories', 301),
  ('cat-usb-hubs', 'USB Hubs', 'usb-hubs', 'Accessories', 302),
  ('cat-laptop-stands', 'Laptop Stands', 'laptop-stands', 'Accessories', 303),
  ('cat-docking-stations', 'Docking Stations', 'docking-stations', 'Accessories', 304),
  ('cat-gaming-keyboards', 'Gaming Keyboards', 'gaming-keyboards', 'Gaming', 400),
  ('cat-gaming-mice', 'Gaming Mice', 'gaming-mice', 'Gaming', 401),
  ('cat-gaming-headsets', 'Gaming Headsets', 'gaming-headsets', 'Gaming', 402),
  ('cat-cooling-pads', 'Cooling Pads', 'cooling-pads', 'Gaming', 403)
on conflict (id) do nothing;
