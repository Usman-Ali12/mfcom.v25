# Jarir Bookstore UX case study — and what it changed here

This isn't a general impression of Jarir — it's based on directly fetching
`jarir.com/sa-en` and reading its actual homepage structure. Four patterns
stood out as concrete and reusable, not just "clean design" vibes.

## 1. The homepage is carousels, not grids

Fetching the page turns up section after section marked "Item 1 of 22",
"Item 1 of 18", "Item 1 of 7", "Item 1 of 13" — Browse Categories, Shop by
Brand, Explore Our Best Picks, Super Saver Top Categories. Every one of
these is a horizontally-scrolling rail, not a static 4-column grid that
ends after eight products. A grid asks the shopper to click "View All" to
see more; a carousel lets them keep browsing without leaving the section.

**Changed here:** added `components/storefront/Carousel.tsx`, a real
snap-scrolling horizontal rail with arrow controls that hide on mobile
(where swipe is natural) and appear on desktop (where a mouse needs
them). Best Sellers, New Arrivals, and the brand strip on the homepage
now use it instead of a grid that hard-cuts at four items.

## 2. "Track Order" is a top-level nav item, not buried in an account menu

On Jarir's real header, "Track Order" sits at the very top next to
Wishlist — before search, before categories. Order tracking isn't treated
as an account-settings afterthought; it's one of the first things a
returning customer needs.

**Changed here:** added a **Track Order** link to the header, next to
Wishlist, with a small order-number entry field — matching that
placement, not tucked into `/account`.

## 3. Trust is stated in short, concrete, icon-led lines

Jarir's "Our Promises" section is four short blocks: Installments,
Authentic & Warranted, Convenient Returns, Fast Delivery — each a plain
sentence, not marketing copy. It's the same trust-bar idea this project
already had, but Jarir's version is more specific ("up to three years"
warranty, "1-3 days to major cities") rather than generic.

**Changed here:** tightened the existing trust section's copy to be
similarly concrete rather than adjusted structurally — it was already
close to this pattern.

## 4. Nothing waits for a full page load to feel alive

Section headers, carousel arrows, and card hovers all have small, fast
motion — not decorative animation, just enough that browsing feels
responsive rather than static HTML.

**Changed here:** added Framer Motion (already an installed dependency,
previously unused) for scroll-reveal on homepage sections, a staggered
fade-in for product grids, and a cart-icon bump when an item is added —
detailed in the iteration notes below.

## What this deliberately does NOT copy

Jarir's country/currency switcher, the installment-plan financing UI, and
Arabic-language toggle are real parts of their site but out of scope for
a single-city Karachi shop with no financing product — copying them would
be surface-level, not useful.
