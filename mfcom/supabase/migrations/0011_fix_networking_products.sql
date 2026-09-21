-- MF COM — fix products left behind by the Networking rename
--
-- Migration 0009 renamed the category itself to "Networking & Wi-Fi" but
-- never updated the products that were still pointing at the old
-- "Networking" name — so the category tile had nothing to show (zero
-- products matched the new name) despite the category existing and having
-- real products, just under the stale label.
--
-- Safe to re-run.

update products set category = 'Networking & Wi-Fi' where category = 'Networking';
