-- MF COM — category consolidation (Option B from the homepage design review)
--
-- Your real inventory (from the WhatsApp catalog import) doesn't match the
-- original "premium gaming accessories" category split: Gaming Mice /
-- Gaming Keyboards / Gaming Headsets sit almost empty next to an
-- overloaded Mice / Keyboards / Headphones, while your actual biggest
-- specialty after mice — networking gear (routers, adapters, TP-Link) —
-- never got a real home. This merges the former into the latter, gives
-- networking a proper category, and renames the "Other" catch-all to
-- something a customer would actually understand.
--
-- Safe to re-run. Run in the Supabase SQL Editor.

-- 1. Merge the near-empty Gaming-specific accessory categories into their
--    general counterpart. (Gaming Laptops / Business Laptops are left
--    alone — that's a separate, not-yet-discussed split.)
update products set category = 'Mice' where category = 'Gaming Mice';
update products set category = 'Keyboards' where category = 'Gaming Keyboards';
update products set category = 'Headphones' where category = 'Gaming Headsets';

delete from categories where slug in ('gaming-mice', 'gaming-keyboards', 'gaming-headsets');

-- Cooling Pads was the only other item in the "Gaming" group — once the
-- three above are gone, a group with one lone item looks like a mistake,
-- not a section. Folds into Accessories instead.
update categories set "group" = 'Accessories' where slug = 'cooling-pads';

-- 2. Formalize Networking. The importer creates a brand-new category with
--    group 'Other' whenever an admin types one in during review — if that's
--    how "Networking" first got created, it inherited that group and an
--    auto-generated id. This gives it a permanent, properly-grouped home
--    regardless of whether it already exists.
insert into categories (id, name, slug, "group", position)
values ('cat-networking', 'Networking & Wi-Fi', 'networking', 'Networking', 500)
on conflict (slug) do update set name = excluded.name, "group" = excluded."group";

-- 3. Rename the literal "Other" catch-all, if one exists, to something a
--    customer would actually understand — same products, honest label,
--    rather than trying to blind-guess a real category for each item from
--    SQL alone with no visibility into what's actually in there.
update categories set name = 'Small Accessories & Gadgets', "group" = 'Accessories'
  where name = 'Other';

-- This can only act on categories that already exist in your database —
-- if the admin CSV-import review created any other ad-hoc category names
-- beyond "Networking" or "Other", a quick look at Admin > Categories after
-- running this is worth it to catch anything this migration couldn't know
-- about.
