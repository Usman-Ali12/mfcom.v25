-- MF COM — newsletter subscribers table
-- Run in the Supabase SQL Editor after 0005_orders.sql.

create table if not exists newsletter_subscribers (
  email text primary key,
  created_at timestamptz not null default now()
);

-- Same privacy stance as `orders`: this holds contact info, so no public
-- read policy. Inserts go through the server-side secret key only.
alter table newsletter_subscribers enable row level security;
