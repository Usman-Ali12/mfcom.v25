-- MF COM — orders table
-- Run in the Supabase SQL Editor after 0004_promotions.sql.

-- Real Postgres sequence for order numbers instead of a hand-rolled
-- counter file — atomic across concurrent requests, no race condition
-- (the earlier file-based version had exactly this class of bug for a
-- different store before it was fixed; a sequence avoids it outright).
create sequence if not exists order_number_seq start with 10001;

create table if not exists orders (
  order_number text primary key default ('MFC-' || nextval('order_number_seq')),
  customer_name text not null,
  phone text not null,
  address text not null,
  notes text,
  items jsonb not null default '[]'::jsonb,
  subtotal integer not null,
  delivery integer not null default 0,
  total integer not null,
  status text not null default 'pending_confirmation'
    check (status in ('pending_confirmation', 'confirmed', 'dispatched', 'delivered', 'cancelled')),
  delivery_provider text
    check (delivery_provider is null or delivery_provider in ('Bykea', 'Yango', 'InDrive', 'Other')),
  tracking_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders hold real customer names/phone numbers/addresses — unlike the
-- other tables, this one gets NO public read policy at all. Every access
-- (checkout placing an order, the admin dashboard, the customer tracking
-- page) goes through the server-side secret key, which bypasses RLS by
-- design. The publishable (browser) key can't read this table at all.
alter table orders enable row level security;

create or replace function set_orders_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists orders_set_updated_at on orders;
create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_orders_updated_at();
