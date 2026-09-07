-- MF COM — products table
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT throughout.

create table if not exists products (
  id text primary key,
  slug text unique not null,
  sku text unique not null,
  name text not null,
  brand text not null,
  category text not null,
  short_spec text,
  description text not null,
  price integer not null,
  previous_price integer,
  currency text not null default 'PKR',
  stock text not null default 'in-stock'
    check (stock in ('in-stock', 'low-stock', 'out-of-stock')),
  stock_count integer not null default 0,
  rating numeric not null default 4.5,
  review_count integer not null default 0,
  image text not null,
  gallery jsonb not null default '[]'::jsonb,
  specifications jsonb not null default '[]'::jsonb,
  warranty text,
  badge text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row Level Security: public read access (the storefront uses the
-- publishable key), writes only via the server-side secret key (admin
-- actions), which bypasses RLS entirely — so no write policy is needed.
alter table products enable row level security;

drop policy if exists "Public read access" on products;
create policy "Public read access" on products
  for select using (true);

-- Keep updated_at current on every row change.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists products_set_updated_at on products;
create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- Seed data — the same 8 products this project shipped with before the
-- database migration, so the storefront looks identical on first run.
insert into products
  (id, slug, sku, name, brand, category, short_spec, description, price,
   previous_price, currency, stock, stock_count, rating, review_count,
   image, gallery, specifications, warranty, badge)
values
('p1', 'logitech-g-pro-x-keyboard', 'LOG-P1', 'G Pro X Mechanical Keyboard', 'Logitech', 'Gaming Keyboards', 'Hot-swappable · GX Blue clicky · Tenkeyless', 'Tournament-grade tenkeyless keyboard built for esports. Swap switches without a soldering iron, and drop the detachable cable at any angle for your setup.', 34900, 41900, 'PKR', 'in-stock', 34, 4.7, 212, 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&q=80', '["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=1200&q=80","https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80","https://images.unsplash.com/photo-1595044426077-d36d9236d54a?w=1200&q=80"]'::jsonb, '[{"label":"Switch type","value":"GX Blue Clicky (hot-swappable)"},{"label":"Layout","value":"Tenkeyless (TKL)"},{"label":"Connectivity","value":"USB-C, detachable"},{"label":"Keycaps","value":"Double-shot PBT"},{"label":"Polling rate","value":"1000Hz"}]'::jsonb, '2-year manufacturer warranty', 'Deal'),
('p2', 'razer-deathadder-v3', 'RAZ-P2', 'DeathAdder V3 Wireless Mouse', 'Razer', 'Gaming Mice', '59g · 30K DPI sensor · 90hr battery', 'The DeathAdder shape refined for competitive play — sub-60g with a flagship optical sensor and battery life that outlasts a weekend LAN.', 19900, null, 'PKR', 'in-stock', 51, 4.8, 501, 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=800&q=80', '["https://images.unsplash.com/photo-1527814050087-3793815479db?w=1200&q=80","https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=1200&q=80","https://images.unsplash.com/photo-1615663245622-6df7d7db51e9?w=1200&q=80"]'::jsonb, '[{"label":"Sensor","value":"Focus Pro 30K optical"},{"label":"Weight","value":"59g"},{"label":"Battery life","value":"Up to 90 hours"},{"label":"Connectivity","value":"2.4GHz wireless + Bluetooth"},{"label":"Switches","value":"Razer Optical Gen-3"}]'::jsonb, '2-year manufacturer warranty', 'Best Seller'),
('p3', 'asus-rog-strix-rtx-4070', 'ASU-P3', 'ROG Strix RTX 4070 12GB', 'ASUS', 'Graphics Cards', '12GB GDDR6X · Triple fan · OC edition', 'Triple-fan cooling and a factory overclock built into the ROG Strix shroud — enough headroom for 1440p ultra without the card ever getting loud.', 289900, 314900, 'PKR', 'low-stock', 4, 4.9, 88, 'https://images.unsplash.com/photo-1591405351990-4726e331f141?w=800&q=80', '["https://images.unsplash.com/photo-1591405351990-4726e331f141?w=1200&q=80","https://images.unsplash.com/photo-1591489378430-ef2f4c626b46?w=1200&q=80","https://images.unsplash.com/photo-1587202372634-32705e3bf49c?w=1200&q=80"]'::jsonb, '[{"label":"Memory","value":"12GB GDDR6X"},{"label":"Cooling","value":"Triple axial-tech fans"},{"label":"Boost clock","value":"2610 MHz (OC mode)"},{"label":"Power connector","value":"1x 16-pin"},{"label":"Outputs","value":"3x DisplayPort 1.4a, 2x HDMI 2.1"}]'::jsonb, '3-year manufacturer warranty', 'Deal'),
('p4', 'hyperx-cloud-iii-wireless', 'HYP-P4', 'Cloud III Wireless Headset', 'HyperX', 'Gaming Headsets', '120hr battery · DTS Headphone:X · 53mm driver', 'Five days of battery on a single charge and a memory foam fit that stays comfortable through a full raid night.', 24900, null, 'PKR', 'in-stock', 22, 4.6, 164, 'https://images.unsplash.com/photo-1599669454699-248893623440?w=800&q=80', '["https://images.unsplash.com/photo-1599669454699-248893623440?w=1200&q=80","https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=80","https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=1200&q=80"]'::jsonb, '[{"label":"Driver","value":"53mm angled"},{"label":"Battery life","value":"Up to 120 hours"},{"label":"Surround sound","value":"DTS Headphone:X"},{"label":"Connectivity","value":"2.4GHz USB wireless"},{"label":"Microphone","value":"Detachable noise-cancelling"}]'::jsonb, '2-year manufacturer warranty', null),
('p5', 'keychron-k8-pro', 'KEY-P5', 'K8 Pro Wireless Mechanical Keyboard', 'Keychron', 'Keyboards', 'QMK/VIA · Hot-swap · Mac & Win layout', 'A daily-driver mechanical keyboard that''s equally at home on macOS and Windows, fully remappable through QMK/VIA with no software install required.', 22900, null, 'PKR', 'in-stock', 40, 4.5, 97, 'https://images.unsplash.com/photo-1595225476474-460b7a8c822c?w=800&q=80', '["https://images.unsplash.com/photo-1595225476474-460b7a8c822c?w=1200&q=80","https://images.unsplash.com/photo-1618384887925-045d3e6c8d5f?w=1200&q=80","https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80"]'::jsonb, '[{"label":"Layout","value":"TKL, 87-key"},{"label":"Firmware","value":"QMK/VIA"},{"label":"Connectivity","value":"Bluetooth 5.1, 2.4GHz, USB-C wired"},{"label":"Switches","value":"Gateron hot-swappable"},{"label":"Battery","value":"4000mAh"}]'::jsonb, '1-year manufacturer warranty', 'New'),
('p6', 'lenovo-legion-5-pro', 'LEN-P6', 'Legion 5 Pro — Ryzen 7 / RTX 4060', 'Lenovo', 'Gaming Laptops', '16" QHD 165Hz · 16GB RAM · 512GB SSD', 'A 16-inch QHD 165Hz panel paired with Ryzen 7 and an RTX 4060 — enough to run current titles at high settings without hitting thermal throttle in a 90-minute session.', 419900, 459900, 'PKR', 'in-stock', 9, 4.7, 63, 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&q=80', '["https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=1200&q=80","https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1200&q=80","https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=80"]'::jsonb, '[{"label":"Processor","value":"AMD Ryzen 7 7745HX"},{"label":"Graphics","value":"RTX 4060 8GB"},{"label":"Display","value":"16\" QHD+ 165Hz"},{"label":"RAM","value":"16GB DDR5"},{"label":"Storage","value":"512GB NVMe SSD"}]'::jsonb, '1-year manufacturer warranty', 'Deal'),
('p7', 'corsair-vengeance-32gb', 'COR-P7', 'Vengeance RGB 32GB DDR5-6000', 'Corsair', 'RAM', '2x16GB · CL36 · RGB', 'DDR5-6000 with tight CL36 timings and a ten-zone RGB bar per stick — the straightforward upgrade for anyone still running 16GB.', 27900, null, 'PKR', 'in-stock', 60, 4.6, 143, 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=800&q=80', '["https://images.unsplash.com/photo-1562976540-1502c2145186?w=1200&q=80","https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&q=80","https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1200&q=80"]'::jsonb, '[{"label":"Capacity","value":"32GB (2x16GB)"},{"label":"Speed","value":"DDR5-6000"},{"label":"Timings","value":"CL36-36-36-76"},{"label":"Voltage","value":"1.35V"}]'::jsonb, 'Lifetime manufacturer warranty', null),
('p8', 'samsung-990-pro-2tb', 'SAM-P8', '990 Pro 2TB NVMe SSD', 'Samsung', 'SSD', 'PCIe 4.0 · 7450MB/s read', 'Samsung''s flagship PCIe 4.0 drive — 7450MB/s sequential read with a nickel-coated controller for sustained performance under load.', 32900, null, 'PKR', 'in-stock', 47, 4.9, 310, 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&q=80', '["https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&q=80","https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=1200&q=80","https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=80"]'::jsonb, '[{"label":"Capacity","value":"2TB"},{"label":"Interface","value":"PCIe 4.0 x4, NVMe 2.0"},{"label":"Sequential read","value":"7,450 MB/s"},{"label":"Sequential write","value":"6,900 MB/s"},{"label":"Form factor","value":"M.2 2280"}]'::jsonb, '5-year manufacturer warranty', 'Best Seller')
on conflict (id) do nothing;
