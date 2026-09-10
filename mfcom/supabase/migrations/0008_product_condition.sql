-- MF COM — product condition (New / Used)
-- The client sells both brand-new and used items (laptops especially), and
-- customers need to see which one they're looking at before they buy.
-- Safe to re-run.

alter table products
  add column if not exists condition text not null default 'new'
    check (condition in ('new', 'used'));

-- Every product that existed before this migration is genuinely new stock —
-- backfill explicitly so the default above isn't doing double duty as both
-- "new column default" and "historical assumption" without a record of why.
update products set condition = 'new' where condition is null;

comment on column products.condition is 'new = brand-new/sealed stock, used = pre-owned/open-box — shown to customers as a badge and filterable on /shop';
