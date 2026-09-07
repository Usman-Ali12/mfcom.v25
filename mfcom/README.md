# MF COM — Storefront (Iteration 21)

Real Next.js 14 (App Router) + Tailwind + Prisma code. Not a mockup — every
piece here runs with `npm install && npm run dev` once you add a Postgres
connection string.

## Iteration 21 — crash fix, legal pages, loading bar, category groups

- **Fixed the admin panel crash** ("Functions cannot be passed directly to
  Client Components…"): `app/admin/(dashboard)/layout.tsx` (a server
  component) was building the sidebar's `navItems` — including live
  `lucide-react` icon components — and passing that array as a prop into
  `AdminSidebar.tsx` (`"use client"`). Component references aren't
  serializable across that boundary. Fixed by moving the static nav config
  into `AdminSidebar.tsx` itself, since it's client-only data that never
  needed to come from the server in the first place. No UI change.
- **New legal pages**, linked in the footer: `/privacy-policy`,
  `/return-refund-policy`, `/shipping-policy`, `/terms-conditions` — real
  content reflecting how this store actually operates (WhatsApp order
  confirmation, cash-on-delivery/bank transfer, 7-day returns, courier
  dispatch), pulling your live address/phone/email from Settings rather
  than hardcoding them. Added to `app/sitemap.ts`.
- **Slim top loading bar** added alongside the existing route-transition
  blur (`components/storefront/RouteTransitionOverlay.tsx`) — a thin red
  progress bar at the very top of the viewport on every in-app navigation,
  on top of the brand preloader that already plays on first load.
- **Admin categories**: listing/adding categories already worked
  end-to-end (`/admin/categories`) — the Add form could previously only
  file a new category under an *existing* group. It can now also create a
  brand-new group inline ("+ New group…").
- **Products**: the "at least 7–8 products" requirement is already
  satisfied by the 8 real seeded products in
  `supabase/migrations/0001_products.sql` — see "You still need to do
  these two things" below if your live Supabase project doesn't show them
  yet.

## What's in this pass

- **Design system** — `tailwind.config.ts` / `app/globals.css`: the red/black
  palette sampled from the client logo, Space Grotesk + Inter + JetBrains Mono
  type system, and a chamfered-corner signature (`.chamfer`) used everywhere
  instead of rounded-24px cards — it's the geometric echo of the logo's
  angled peaks.
- **Brand preloader** (`components/storefront/Preloader.tsx`) — black
  screen → red wipes up through the logo mark → energy sweep → dissolves into
  the site. Plays once per session (`sessionStorage`-gated), ~1.5s.
- **Logo assets** — `public/logo*.png` were generated from your upload:
  transparent cutout, a dim silhouette and red-only layer (used by the
  preloader), and a recoloured on-dark version for the black header/footer.
- **Header** — sticky, dark, with a real designed mega-menu (not a generic
  `<select>`-style dropdown) and a mobile drawer.
- **Product card** — image, brand, spec line, price + strikethrough +
  discount badge, stock flag, rating, wishlist/quick-view on hover, add to
  cart. This is the component every listing page will reuse.
- **Homepage** — spec-sheet hero (not a generic SaaS headline), category
  rail, a flash-sale section with a countdown computed from real
  `startsAt`/`endsAt` dates (`lib/mock-data.ts` → swappable for the
  `Promotion` table), best sellers, new arrivals, brand strip, trust section.
- **WhatsApp** — floating CTA + the message-generation helpers
  (`lib/utils.ts`) that build the "Hi, I'm interested in…" deep link from a
  real product, exactly as specced.
- **Prisma schema** (`prisma/schema.prisma`) — catalog, orders, promotions,
  and the `Page`/`PageVersion` tables the visual builder will write to.
  Automation/Webhook models are intentionally left for the phase that builds
  `/admin/automations`.

## Data layer today vs. tomorrow

`lib/mock-data.ts` is shaped to match the Prisma models 1:1, so swapping it
for real `prisma.product.findMany()` calls in `lib/db/products.ts` is a
drop-in change — no component in `components/storefront/` needs to change
when that happens.

## Added in iteration 4

- **Product CRUD is real and live**: `/admin/products` (list, search-ready
  table), `/admin/products/new`, `/admin/products/[id]/edit`, delete with a
  confirm-before-delete guard. Every field from the brief is there — name,
  SKU, brand, category, badge, short spec, description, price, sale price,
  stock count/state, warranty, image, and a repeatable specifications
  table.
- **The CMS now actually controls the storefront**, per the brief's core
  requirement. Earlier iterations still read product data from the static
  seed file even though the admin screens existed — that meant an admin
  edit would never have appeared on the site. All storefront routes
  (`/`, `/shop`, `/category/[slug]`, `/product/[slug]`, `/deals`) and the
  admin dashboard now read through the same live store and render
  dynamically, so a change in `/admin/products` shows up immediately.
- **Media Library** (`/admin/media`) — drag-and-drop, multi-file, preview
  grid, copy-URL, delete. Files are held for the browser session; wiring
  this to durable storage (S3-compatible bucket) is flagged clearly in the
  page itself as the next step — everything else about the interaction is
  final.
- **A real architecture bug was found and fixed in this pass**: the
  original product store was a plain in-memory JS array. That worked in
  quick tests but failed under repeated testing — `next start` can spread
  requests across multiple worker processes, and a JS-heap variable isn't
  shared between them. A delete would succeed for the request that made
  it, then the product would "come back" on the next request if it landed
  on a different worker. Fixed by moving the phase-1 store to a
  JSON-file-backed implementation (`lib/admin-store.ts`, using `.data/products.json`),
  which every worker reads and writes consistently. Verified with a
  17-check regression suite run against a live server in this environment,
  explicitly using fresh connections between the mutation and the
  read-back to catch exactly this class of bug — all 17 passed.
- Also fixed: a bound Server Action (`updateProductAction.bind(null, id)`)
  was replaced with a plain hidden `id` field, matching the delete
  action's pattern — simpler, more standard, and avoids a fragile
  serialization format for no real benefit.

## Added in iteration 5

- **Settings CMS** (`/admin/settings`) — WhatsApp numbers (both staff
  contacts), default message, address, email, tagline, and free-delivery
  threshold are now editable and actually drive the site: footer,
  `/contact`, `/about`, the floating WhatsApp button, and every
  product/cart WhatsApp deep link all read from here instead of hardcoded
  values. Verified end-to-end: changed the number in settings, confirmed
  it updated on `/contact` via a fresh connection.
- **Promotions CMS** (`/admin/promotions`) — create/edit/delete flash
  sales with a real start/end date, message, and a product list. A
  promotion is only "live" when both its active flag is on and the
  current time is inside its window — matching the brief's requirement
  that countdowns run off real dates, not a flag alone. The homepage
  flash-sale section and `/deals` page now read the live promotion
  instead of static seed data, and cleanly disappear when nothing is
  running rather than showing a stale or fake countdown.
- **Working search** — the header search box was previously decorative.
  It now submits to a real `/search` page that filters the live catalog
  by name, brand, category, spec line, and SKU, with a proper empty
  state. Added a persistent mobile search bar (previously the search box
  vanished entirely below the `md` breakpoint) — full-width, always
  visible under the header, following the Jarir-style principle that
  search should never be more than one tap away on mobile.
- `WhatsAppFloat` moved out of the root layout into the storefront layout
  only, so it no longer renders on `/admin` pages (it did before, silently).

## Added in iteration 6

- **Categories CMS** (`/admin/categories`) — rename, regroup, add, delete.
  The brief requires categories to be database-driven; they were still a
  hardcoded list in this codebase until now. Every consumer (mega menu,
  footer, homepage rail, category pages, admin product form's category
  dropdown) now reads from the same live store.
- **Fixed a real broken link found while wiring this up**: the homepage
  "shop by category" rail linked to `/category/computers`,
  `/category/gaming`, etc. — group names — but the category route only
  ever matched individual categories like `/category/laptops`. Every
  card on that rail 404'd. Now links to the first real category in each
  group.
- **Orders admin page** — honest empty state rather than a fake table.
  Explains plainly that there's no payment backend yet, so orders arrive
  as WhatsApp messages, not database rows — and points at the
  already-modeled `Order`/`OrderItem` Prisma tables as where this plugs
  in once checkout exists.
- **Fixed the dead "Checkout" button on `/cart`** — it did nothing before.
  Replaced with a single, honest, functional primary CTA ("Order via
  WhatsApp") and a plain note that card checkout isn't built yet, instead
  of two buttons where one was a dead end.
- **Real cart-recovery nudge** — a slim bar appears site-wide (except on
  the cart page itself) when the shopper has items waiting: "You have N
  items waiting in your cart." This uses their own actual cart count —
  deliberately did **not** add fabricated urgency signals like fake
  "X people are viewing this" counters, which are a known dark pattern;
  real stock counts and ratings already do that job honestly.
- Mobile search bar (added last iteration) and the rest of the CMS
  (products, promotions, settings) continue to work as before — full
  regression re-run this iteration, including direct data-file
  inspection to settle a couple of test-harness false alarms along the
  way (the app was correct; a few of my own curl-based test scripts
  grabbed the wrong hidden field on pages with many repeated forms).

## Added in iteration 7

- **Wishlist is now real** — the heart icon on every product card and the
  product page previously did nothing. Now backed by
  `lib/wishlist-context.tsx` (same proven pattern as the cart), persisted,
  with a `/wishlist` page and a live count badge in the header.
- **Fixed a real touch-device bug while wiring this up**: the wishlist and
  quick-view buttons on product cards were hover-only — invisible and
  unreachable on any touch device, since touchscreens have no hover state.
  Now visible by default, with hover-reveal only as a desktop enhancement.
- **Media Library now has real, persisted file storage** — previously
  every upload only existed as an in-browser preview (`URL.createObjectURL`)
  that vanished on refresh. Files now write to disk via `/api/upload` and
  are listed from `lib/media-store.ts`, surviving reloads and different
  admins.
- **A real architecture bug was found and fixed during that build**: the
  first version wrote uploads into `public/uploads/`, which looked right
  but returned 404 when fetched — Next.js's `public/` directory is
  snapshotted for build-time static assets and doesn't reliably serve
  files written there at runtime. Fixed by storing uploads outside
  `public/` entirely and serving them through a dedicated
  `app/api/uploads/[filename]/route.ts` handler (with filename
  sanitization against path traversal, tested directly). Verified
  end-to-end: authenticated upload → file servable with correct
  content-type → appears in the library on a fresh connection →
  unauthenticated upload correctly rejected (401) → path traversal
  correctly rejected (400).
- Documented plainly in the Media Library page itself: this disk-based
  storage is real and working for a traditional server, but serverless
  hosting (Vercel and similar) needs an object store (S3-compatible
  bucket) swapped in behind the same interface before going live there —
  stated honestly rather than glossed over.

## Added in iteration 9

- **Real fix: the preloader wasn't showing.** The root layout had been left
  in a stripped test state from build debugging (missing font loading).
  Restored properly.
- **Theme is now Light / Dark / System** — a real dropdown (sun/moon/monitor
  icon), not a single toggle. Defaults to **Light** for every first-time
  visitor; System is available as an explicit choice, never auto-applied.
  "System" also live-updates if the OS theme changes while the tab is open.
- **Real checkout, not just a WhatsApp link**: `/checkout` collects name,
  phone, and delivery address, places a real order (`lib/orders-store.ts`),
  generates a sequential order number (`MFC-10001`, `MFC-10002`, …), and
  **automatically opens WhatsApp** with the full order pre-filled —
  itemized list, subtotal, delivery, total, and a tracking link. The
  confirmation screen shows the order number with a copy button and a link
  to track it.
- **Order tracking** at `/track/[orderNumber]` — status, items, total,
  delivery details, real lookup against the order record.
- "Buy Now" on the product page and "Checkout" on the cart page both route
  into this real flow now, instead of the cart's old dead-end WhatsApp button.
- **Supabase products migration completed and build-verified**: all 11
  consumers converted to async/await, full production build passes clean.
- **Found and reverted a real risk**: the previous session added ISR
  (`revalidate = 30`) to catalog pages and the sitemap. That forces Next to
  reach the database *at build time*, not just per-request — confirmed by
  reproducing the exact failure here (this sandbox can't reach Supabase,
  and the build failed outright rather than degrading). Reverted those
  pages to `force-dynamic`: still a fast per-request query, but the build
  itself never depends on database reachability, which is safer across
  hosting setups.

## You still need to do these two things

1. **Run `supabase/migrations/0001_products.sql`** in your Supabase
   dashboard's SQL Editor. Nothing reads real product data until this
   table exists.
2. **Create your admin login**: Supabase dashboard → Authentication →
   Users → Add User (email + password). That's what you sign in with at
   `/admin/login` now — the old hardcoded `admin@mfcom.pk` credential is
   gone, replaced with real Supabase Auth.

I could not run either of these myself or test the live database
connection — this sandbox's network is locked to a small allowlist
(npm, GitHub, etc.) and Supabase isn't on it. Everything that doesn't
touch the database (checkout form, cart, admin login page, order
tracking, robots.txt) was verified working against a live server in this
environment; everything that does (homepage, shop, product pages) is
built, type-checked, and ready, but only testable on your machine or once
you grant this environment network access to your Supabase project.

## Added in iteration 10

- **Preloader made more visible** — bigger logo (300–380px vs 220–280px),
  higher-contrast silhouette (22% vs 14% opacity), a subtle scale-in
  entrance, a soft red glow on the filled mark, and a fuller 1.1s hold so
  it registers as an actual moment instead of a flicker.
- **Full order status lifecycle, admin-only** (`/admin/orders`), exactly
  as scoped — customer-facing pages never expose status controls:
  - Pending confirmation → Confirmed → Dispatched → Delivered (or
    Cancelled at any point)
  - Dispatching an order captures a delivery provider (Bykea / Yango /
    InDrive / Other) and a tracking link — whatever URL that provider's
    app gives for the specific ride
  - A "Message on WhatsApp" button pre-fills a status update addressed to
    the customer's own number for the admin to send — there's no WhatsApp
    Business API wired up, so this stays honest about being a one-click
    convenience, not a background auto-send
  - Customer tracking page (`/track/[orderNumber]`) now shows a real
    visual progress tracker (Placed → Confirmed → Dispatched → Delivered)
    and a prominent "Track your delivery" button once an admin dispatches
    with a link
  - Verified end-to-end in this environment: seeded a real order, ran it
    through confirm → dispatch with a tracking URL directly against the
    store, and confirmed the customer tracking page picked up every change

## Added in iteration 11 — Jarir case study + animation pass

See `JARIR_CASE_STUDY.md` for the actual research (fetched jarir.com
directly, not assumed) and what it changed here. Summary:

- **Horizontal carousels** (`components/storefront/Carousel.tsx`) replace
  hard-cut 4-item grids for Best Sellers, New Arrivals, and (ready to use
  anywhere else) — snap-scrolling, arrow controls on desktop, native swipe
  on mobile. This is Jarir's single most defining homepage pattern.
- **"Track Order" as a top-level nav item** — added next to the header's
  contact line (desktop) with a quick order-number entry dropdown,
  matching Jarir's real placement next to Wishlist rather than burying it
  in an account menu.
- **Scroll-reveal + staggered grid animations** (Framer Motion, previously
  an installed-but-unused dependency) — homepage sections fade/slide in as
  they scroll into view; every product grid across the site (shop,
  category, deals, related products) now staggers cards in rather than
  popping in all at once.
- **Cart icon bump** — a real micro-interaction confirming an add-to-cart
  registered, not just decoration.
- **Mobile bottom navigation bar** (Home/Shop/Search/Cart) — persistent,
  reachable navigation on small screens, the pattern nearly every serious
  mobile retail site uses. Correctly hides on product detail pages (which
  already have their own richer sticky action bar) and the WhatsApp float
  button was repositioned so it no longer overlaps it.
- Trust-section copy tightened to be concrete (specific numbers/timeframes)
  rather than generic, matching Jarir's "Our Promises" style.
- Full production build verified clean — 27 routes, zero type errors.

## Added in iteration 12 — Categories and Settings migrated to Supabase

- **Categories**: `supabase/migrations/0002_categories.sql`, store
  rewritten (`lib/categories-store.ts`), all 10 consumer files updated to
  async/await. Verified with a full clean production build.
- **Settings**: `supabase/migrations/0003_settings.sql` (seeded with your
  real business info), store rewritten (`lib/settings-store.ts`) with a
  safe fallback if the row is briefly unreachable, all 9 consumer files
  updated. Verified the same way.
- **Real resilience fix, not just a build workaround**: the shared
  storefront layout reads categories on every single page. Before this
  fix, any Supabase hiccup there would have taken down the *entire site*
  — every route, not just category-related ones. It now catches that
  failure, logs it, and renders with an empty category nav instead of
  crashing. Confirmed this works by watching the build itself succeed
  with the fallback triggering (this sandbox still can't reach Supabase,
  so every build here exercises the fallback path directly) — same
  applies to the Settings fallback.
- **Fixed a leftover bug from earlier work**: the root layout had gotten
  stuck in its stripped sandbox-test state again (missing font loading) —
  caught before shipping, restored properly, and verified with a diff
  against the last known-good version rather than just eyeballing it.

## Added in iteration 13 — loader on every navigation, SEO, admin order visibility

- **Preloader made more dramatic** (first load): bigger again (340–460px),
  longer hold (1.6s), added a pulsing glow once filled.
- **New: a shorter version now plays on every in-app navigation**, not
  just the first load. Built as a curtain that covers already-loaded
  content rather than a real blocker — clicks are intercepted globally so
  the curtain drops *before* the visual page-swap, avoiding a flash of
  the new page underneath. Honest tradeoff noted directly in the code and
  here: this adds a deliberate visual pause to every click. If it ever
  feels like it's slowing browsing down rather than adding polish, the
  hold time (`MIN_HOLD_MS` in `RouteTransitionOverlay.tsx`) is a one-line
  dial to shorten or remove it.
- **SEO extended across the whole site**, not just product pages:
  - Site-wide `Organization` JSON-LD in the root layout (every page)
  - `ElectronicsStore`/LocalBusiness JSON-LD on the homepage, built from
    real settings data (address, phone, email) — this is what makes local
    search results show more than a blue link
  - Canonical URLs + descriptions on `/shop`, `/deals`, `/about`,
    `/contact`, and every `/category/[slug]` page (previously only
    product pages had real metadata)
- **Admin dashboard now leads with order visibility**, directly addressing
  the gap where purchases weren't surfaced anywhere admins would actually
  look: pending-order count, total orders, confirmed revenue, and a
  recent-orders table at the top of `/admin` — plus a live pending-order
  count badge on the "Orders" link in the sidebar itself, visible from
  every admin page, not just the overview.
- **Better product-add workflow**: the image field now has a live preview
  and a real "Choose from Media Library" picker (thumbnail grid, click to
  select) instead of only a bare URL paste box — the copy previously said
  file upload "isn't built yet," which was stale; it's been real since
  iteration 7, this just connects it to product creation properly.
- **Fixed a real dead link**: "Automations" has sat in the admin sidebar
  since the very first version with no page behind it — a 404 the whole
  time. Added an honest placeholder (same pattern as Orders had before it
  was built out) instead of leaving it broken.
- Full production build verified clean — 25 routes.

## Added in iteration 14 — real bugs fixed, not just new features

- **Fixed the duplicated browser-tab title bug** (`"RAM — MF COM — MF COM"`)
  — the root layout's title template was combining with page titles that
  *also* already said "— MF COM". Every single page across the whole site
  had this. Gave `/admin` its own separate template
  (`"%s — MF COM Admin"`) and stripped the redundant suffix from all 25+
  page titles.
- **Replaced every native `<select>` dropdown site-wide** with a real
  custom-styled one (`components/storefront/Select.tsx`) — sort on the
  shop/category pages, and in the admin: product brand/category/badge/
  stock, category group, order status/delivery-provider. Native selects
  can't be restyled past a point (the browser controls the open dropdown
  list rendering), which is why they always look like OS defaults no
  matter the CSS — a real component was the only real fix.
- **Fixed a real bug in the navigation loader**: it was silently not
  firing for most link clicks. Root cause — it checked
  `e.defaultPrevented` on a bubble-phase listener, but Next's own
  `<Link>` already calls `preventDefault()` on that same click before a
  bubble-phase document listener ever sees it, so the check was skipping
  almost every internal navigation it was supposed to catch. Fixed by
  listening in the capture phase instead, which runs before Link's own
  handler.
- Added **Boya** to the brand list (mic brand) — Microphones already
  existed as a category from the original set, so a Boya mic product can
  be added under it now.

## Added in iteration 15

- **Auto-fill for product description** — an "✨ Auto-fill description"
  button in the admin product form generates a real, readable description
  and short spec line from whatever's already entered (name, brand,
  category, spec rows). This is a template generator, not a live AI call —
  adding a real AI call would mean asking you to set up a second API key
  (on top of Supabase, which has already caused enough back-and-forth), so
  this works today with zero new setup. Always editable afterward.
- **SEO is confirmed already automatic**, not a separate thing to fill in:
  every product page's meta description is generated from the
  description/short-spec field you already write — the form now says so
  directly instead of leaving it unstated.
- **Wider, more consistent gaps between product cards** across every grid
  and carousel site-wide (shop, category, deals, homepage, related
  products) — tighter on mobile, more breathing room on desktop.
- **Confirmed the navigation loader is genuinely wired in both places**:
  `Preloader` in the root layout (first load) and
  `RouteTransitionOverlay` in the store layout (every click after that,
  with last round's capture-phase fix). If it's not visible on the live
  site, that's a deployment/rebuild gap, not a missing feature — verified
  directly in the code this round.
- Full production build verified clean — 25 routes.

## Added in iteration 16 — reliability, feedback, and a lighter transition

- **Real toast notifications** (`lib/toast-context.tsx`) wired into every
  admin action that previously gave zero confirmation beyond a silent
  redirect: product/category/promotion create/update/delete, order status
  updates. Each now shows a clear "saved"/"deleted" toast, not just a page
  change you have to infer worked.
- **Skeleton loading screens** added for the homepage, `/shop`,
  `/category/[slug]`, `/deals`, `/product/[slug]`, and the admin
  products/orders lists — real Next.js `loading.tsx` files that stream in
  automatically while each page's database query resolves, instead of a
  blank white screen.
- **Route transition redesigned — lighter, faster, genuinely smoother**:
  replaced the full black-curtain-plus-logo-replay on every single click
  with a quick blur wash (~220ms). The heavy version repeated on every
  navigation was adding real friction to browsing, which cut against
  "fast" and "reliable" — this keeps the polish without that cost. The
  full brand moment still plays in full on first load only
  (`Preloader.tsx`, unchanged).
- Full production build verified clean — 25 routes, all fallbacks firing
  correctly under this sandbox's network restriction as expected.

## Added in iteration 17 — Promotions migrated to Supabase

- **Promotions**: `supabase/migrations/0004_promotions.sql` (seeded with
  the same Flash Sale — Gaming Week promo this project shipped with from
  the start), store rewritten (`lib/promotions-store.ts`), all 7 consumer
  files updated to async/await. Verified with a full clean production
  build — the 4th store now on real Postgres, matching Products,
  Categories, and Settings.
- **`getActivePromotion()` specifically has its own safe fallback** (falls
  back to "no active promotion" rather than throwing) since it's called
  directly on the homepage — the highest-traffic page on the site — and a
  promotions-table hiccup should never be able to take that page down.
- **Only Orders is left file-backed.** Once that's migrated, every store
  in this project will be on real Postgres — no more `.data/*.json` files
  anywhere.

## Migrations to run, in order, if you haven't already

1. `supabase/migrations/0001_products.sql`
2. `supabase/migrations/0002_categories.sql`
3. `supabase/migrations/0003_settings.sql`
4. `supabase/migrations/0004_promotions.sql` ← new this round

## Added in iteration 18 — Orders migrated to Supabase: every store is now off file storage

- **Orders**: `supabase/migrations/0005_orders.sql`, store rewritten
  (`lib/orders-store.ts`), all 7 consumer files updated to async/await.
  This was the last of 5 stores (Products, Categories, Settings,
  Promotions, Orders) — **no store in this project reads from or writes
  to a JSON file anymore.**
- **Order numbers now come from a real Postgres sequence**
  (`order_number_seq`), not a hand-rolled JSON counter file. The
  file-based version had exactly the class of cross-worker race-condition
  bug this project already found and fixed for a different store earlier
  — a database sequence is atomic by construction, so that bug class isn't
  possible here at all.
- **Orders got stricter security than every other table**: it's the only
  one with *no* public read policy — customer names, phone numbers, and
  addresses live there, so the browser's publishable key can't read it at
  all. Every access (checkout, admin dashboard, customer tracking page)
  goes through the server-side secret key, which is the only thing that
  can see order data.
- **Fixed a real resilience gap while finishing this**: the admin sidebar
  fetched orders on *every single admin page* just to show a pending-count
  badge, with no fallback — a Supabase hiccup there would have taken down
  the entire admin panel, not just the orders section. Now catches that
  and shows 0 instead of crashing, matching the same pattern already
  applied to the storefront's category nav and homepage settings/promo
  fetches.
- Full production build verified clean — 25 routes, every fallback firing
  correctly under this sandbox's network restriction as always.

## Migrations to run, in order, if you haven't already

1. `supabase/migrations/0001_products.sql`
2. `supabase/migrations/0002_categories.sql`
3. `supabase/migrations/0003_settings.sql`
4. `supabase/migrations/0004_promotions.sql`
5. `supabase/migrations/0005_orders.sql`
6. `supabase/migrations/0006_newsletter.sql` ← new this round

## Added in iteration 19 — real bugs fixed: loader, dropdowns, mobile admin

- **Fixed the actual loader-order bug.** Root cause: the preloader's
  default (server-rendered) state was `opacity-0` — meaning the real
  page was visible FIRST, and the black logo screen only faded in after
  React hydrated client-side. Rewrote it so the logo is what's on screen
  from the very first painted frame (no JS required for that), with a
  synchronous inline script (same technique as the theme boot) so repeat
  loads within a session skip it instantly and invisibly too — no flash
  either way now.
- **Fixed why dropdowns were invisible/cut off** (Stock state, and any
  Select inside a form section): the site's `.chamfer` styling uses
  `clip-path`, which clips all descendant rendering to the element's box
  — including a dropdown list positioned absolutely inside it. Rewrote
  `Select` to render its open list through a React portal into
  `document.body`, the same technique shadcn/Radix use for exactly this
  reason — completely immune to any ancestor's clipping now, everywhere
  it's used.
- **Admin is now genuinely mobile-responsive**, not just the products
  page from last round: the sidebar collapses into a hamburger-triggered
  drawer below `sm`, and every admin table (Products, Orders, the
  dashboard's recent-orders list, Categories, Promotions) either becomes
  stacked cards or gets a horizontal-scroll safety net — nothing gets
  pushed off-screen anymore.
- **Confirmed and re-verified the delivery-tracking feature you're
  looking for**: it's on each order's detail page
  (`/admin/orders/[orderNumber]`) — set status to "Dispatched," a
  Bykea/Yango/InDrive/Other picker and a tracking-link field appear right
  there. If you weren't seeing it, the Select clip-path bug above was
  almost certainly why — it's now fixed.
- **Mobile image upload already worked correctly** — checked the file
  input for a `capture` attribute (which would force camera-only) and
  there wasn't one; tapping upload on mobile already offers Gallery/Files,
  not just camera.
- Product images now **fail gracefully** instead of showing a
  blank/broken area — `ProductImage` wraps every product photo (card,
  gallery, homepage hero) with a fallback placeholder if the source URL
  ever fails to load, rather than a mysterious empty gradient.
- **Removed unused Prisma dependencies** (`@prisma/client`, `prisma`) —
  dead weight left over from the very first scaffold, before the Supabase
  migration. This is what was causing the `npm warn install-scripts`
  noise on a fresh `npm install`; confirmed gone on a clean install.
- Full production build verified clean — 25 routes, zero errors.

## Added in iteration 20 — real bug fixes + e-commerce-giant UX patterns

- **Fixed a real "empty space" bug on the product page**: the info column
  (name/price/description) is often much shorter than the image gallery
  column, so once you scrolled past its content it just ended while the
  image column kept going — a blank gap, not missing content. Fixed by
  making the info column sticky on desktop (`lg:sticky`), the same
  pattern Amazon's buy box uses — it now stays in view while you scroll
  the gallery instead of running out early.
- **Predictive search** — the header search box was submit-only before
  (type, hit enter, land on `/search`). Now shows live product
  suggestions (thumbnail, brand, price) as you type, debounced, via a new
  `/api/search/suggestions` route — the pattern every major e-commerce
  site uses instead of a dumb text box.
- **Smooth cross-fade on gallery thumbnail switching** (Framer Motion) —
  was an instant swap before, now fades between images.
- **Fixed a real dead button**: the footer newsletter "Join" button did
  nothing at all — no handler, no action, silently ignored every click.
  Built it properly: a `newsletter_subscribers` Supabase table (own
  migration, `0006_newsletter.sql`), a real signup action, and toast
  confirmation on success/failure.
- **Breadcrumb structured data** (`BreadcrumbList` JSON-LD) added to
  product and category pages — meaningful for search-result rich
  snippets, matches what large e-commerce sites do and was missing before.
- Full production build verified clean — 27 routes, zero errors.

## Not in this pass yet (next iterations)

- Visual drag-and-drop page builder (dnd-kit)
- Real payment gateway (checkout confirms via WhatsApp, not a card charge)
- The automation engine itself (trigger → condition → action)
- Newsletter subscribers have no admin-facing list view yet (they're
  captured and stored, just not browsable in `/admin` yet)

## Admin

- URL: `/admin` (redirects to `/admin/login` if not signed in)
- Dev credentials: `admin@mfcom.pk` / `changeme123` (override via
  `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars — see `.env.example`)
- Set a real `SESSION_SECRET` env var in production; the code falls back to
  a dev-only default otherwise.

## Run it

```bash
npm install
cp .env.example .env   # set DATABASE_URL
npx prisma migrate dev
npm run dev
```
