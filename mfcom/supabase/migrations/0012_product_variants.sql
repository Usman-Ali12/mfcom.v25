-- MF COM — product color/style variants
-- Links separate product rows together as variants of the same item (e.g.
-- a Razer mouse in Black vs White) so the product page can show a
-- selector, each option keeping its own real price/stock/photos rather
-- than faking per-color inventory on a single row.
-- Safe to re-run.

alter table products add column if not exists variant_group_id text;
alter table products add column if not exists variant_label text;

create index if not exists products_variant_group_id_idx on products (variant_group_id);

comment on column products.variant_group_id is 'shared id linking color/style variants of the same item together — null means no variants';
comment on column products.variant_label is 'display label for this specific variant, e.g. "Black", "White"';
