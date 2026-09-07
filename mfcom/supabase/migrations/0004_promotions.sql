-- MF COM — promotions table
-- Run in the Supabase SQL Editor after 0003_settings.sql.

create table if not exists promotions (
  id text primary key,
  name text not null,
  title text not null,
  message text not null,
  start_date timestamptz not null,
  end_date timestamptz not null,
  product_slugs jsonb not null default '[]'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table promotions enable row level security;

drop policy if exists "Public read access" on promotions;
create policy "Public read access" on promotions
  for select using (true);

insert into promotions (id, name, title, message, start_date, end_date, product_slugs, active)
values (
  'promo-seed',
  'Flash Sale — Gaming Week',
  'Flash Sale — Gaming Week',
  'Up to 15% off gaming peripherals, while stock lasts.',
  '2026-08-20T00:00:00+05:00',
  '2026-08-31T23:59:59+05:00',
  '["logitech-g-pro-x-keyboard", "razer-deathadder-v3", "asus-rog-strix-rtx-4070", "lenovo-legion-5-pro"]'::jsonb,
  true
)
on conflict (id) do nothing;
