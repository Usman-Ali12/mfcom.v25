-- MF COM — category cleanup, round 2
--
-- The last migration (0009) only fixed a category literally *named*
-- "Other" — it missed categories *grouped under* "Other" as their group
-- field, which is what's actually showing up as an "Other" tile on the
-- homepage (e.g. "Gaming pads" / "Gaming Pad" landed there). It also
-- didn't know about a category with a blank name, which was rendering as
-- an empty ghost tile with nothing on it.
--
-- Safe to re-run.

-- 1. Anything still grouped under "Other" moves to Accessories — same fix
--    as 0009 intended, this time matching on the actual column that
--    controls the homepage tile.
update categories set "group" = 'Accessories' where "group" = 'Other';

-- 2. "Gaming pads" and "Gaming Pad" are the same thing, created as two
--    separate categories (capitalization/pluralization drift from being
--    typed in by hand during CSV review). Move any products off the
--    second spelling onto the first, then remove the duplicate row.
update products set category = 'Gaming pads'
  where category = 'Gaming Pad' and exists (select 1 from categories where name = 'Gaming pads');
delete from categories where name = 'Gaming Pad' and exists (select 1 from categories where name = 'Gaming pads');

-- 3. A category with a blank/whitespace-only name renders as an empty
--    tile with nothing on it — rename rather than delete, so anything
--    already assigned to it doesn't get silently orphaned.
update categories set name = 'Uncategorized', "group" = 'Accessories'
  where trim(coalesce(name, '')) = '';
