-- MF COM — settings table (single row)
-- Run in the Supabase SQL Editor after 0002_categories.sql.

create table if not exists site_settings (
  id text primary key default 'default',
  whatsapp_number text not null,
  whatsapp_display text not null,
  whatsapp_primary_name text not null,
  whatsapp_secondary_number text not null,
  whatsapp_secondary_display text not null,
  whatsapp_secondary_name text not null,
  whatsapp_default_message text not null,
  address text not null,
  email text not null,
  tagline text not null,
  free_delivery_threshold integer not null default 15000,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

drop policy if exists "Public read access" on site_settings;
create policy "Public read access" on site_settings
  for select using (true);

insert into site_settings (
  id, whatsapp_number, whatsapp_display, whatsapp_primary_name,
  whatsapp_secondary_number, whatsapp_secondary_display, whatsapp_secondary_name,
  whatsapp_default_message, address, email, tagline, free_delivery_threshold
) values (
  'default',
  '923072991650', '0307-2991650', 'M. Faizan',
  '923213606991', '0321-3606991', 'M. Zeeshan',
  'Hi, I have a question about a product on MF COM.',
  'Shop # G-49, Gate No. 2, Ground Floor, Naz Plaza, M.A. Jinnah Road, Karachi',
  'mfcom0157@gmail.com',
  'Deals in all kinds of computer accessories — branded & China accessories, gaming accessories, and general order supply.',
  15000
)
on conflict (id) do nothing;
