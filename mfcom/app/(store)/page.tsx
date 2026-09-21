import Link from "next/link";
import ProductImage from "@/components/storefront/ProductImage";
import { ArrowUpRight, Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import ProductCard from "@/components/storefront/ProductCard";
import CountdownTimer from "@/components/storefront/CountdownTimer";
import Carousel from "@/components/storefront/Carousel";
import Reveal from "@/components/storefront/Reveal";
import { StaggerGrid, StaggerItem } from "@/components/storefront/StaggerGrid";
import { storeInfo } from "@/lib/mock-data";
import { listCategoryGroups, listCategories } from "@/lib/categories-store";
import { listProducts } from "@/lib/admin-store";
import { getActivePromotion } from "@/lib/promotions-store";
import { getSettings } from "@/lib/settings-store";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const dynamic = "force-dynamic"; // real DB query per request — avoids requiring DB access at *build* time (ISR would), which is safer across hosting setups

export const metadata = {
  alternates: { canonical: SITE_URL },
};

export default async function HomePage() {
  const products = await listProducts();
  const activePromotion = await getActivePromotion();
  const categoryGroups = await listCategoryGroups();
  const allCategories = await listCategories();
  const settings = await getSettings();
  const bestSellers = products.filter((p) => p.badge === "Best Seller" || p.rating >= 4.5).slice(0, 6);
  const newArrivals = [...products].reverse().slice(0, 6);
  const dealProducts = activePromotion
    ? products.filter((p) => activePromotion.productSlugs.includes(p.slug))
    : [];

  // LocalBusiness schema — high-value for a physical Karachi shop: this is
  // what lets MF COM show up with address/hours/phone directly in local
  // search results, not just a blue link.
  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ElectronicsStore",
    name: SITE_NAME,
    url: SITE_URL,
    telephone: `+${settings.whatsappNumber}`,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Karachi",
      addressCountry: "PK",
    },
    openingHours: "Sa,Su,Mo,Tu,We,Th 11:00-21:30",
  };
  // One clear hero product, not four competing fragments — prefers
  // something visually striking (RGB/gaming gear reads best as a big
  // hero shot) with a badge if one exists, falling back to whatever's
  // actually in stock with a real photo.
  const heroProduct =
    products.find((p) => p.image && /rgb|gaming/i.test(`${p.name} ${p.description}`) && p.badge) ||
    products.find((p) => p.image && /rgb|gaming/i.test(`${p.name} ${p.description}`)) ||
    products.find((p) => p.image && p.badge) ||
    products.find((p) => p.image) ||
    products[0];

  // One supporting photo peeking from behind, for a bit of depth — a
  // different category than the hero product so it doesn't look like a
  // duplicate, not another 2-3 fragments competing for attention.
  const supportingProduct = products.find((p) => p.image && p.category !== heroProduct.category && p.id !== heroProduct.id);

  const inStockCount = products.filter((p) => p.stock !== "out-of-stock").length;
  const brandCount = new Set(products.map((p) => p.brand).filter(Boolean)).size;

  // One real product photo per category group, not a stock icon or plain
  // text card — picks whichever in-stock product in that group has an
  // actual image, favoring anything with a badge as a slightly better
  // representative than a random pick.
  function representativeImage(groupItems: string[]): string | null {
    const candidates = products.filter((p) => groupItems.includes(p.category) && p.image);
    if (candidates.length === 0) return null;
    return (candidates.find((p) => p.badge) || candidates[0]).image;
  }

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* ============ HERO — bold headline + real product collage, not a stock photo ============ */}
      <section className="bg-void text-paper overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="mono-label text-xs text-red mb-4">Genuine stock — Karachi</p>
            <h1 className="font-display text-display-lg lg:text-display-xl font-black leading-[0.95] mb-6 tracking-tight">
              Hardware
              <br />
              that keeps up.
            </h1>
            <p className="text-paper/60 text-base max-w-sm mb-8">
              Curated laptops, components and peripherals for people who notice the
              difference between fast and fast enough.
            </p>

            <div className="flex gap-3 mb-10">
              <Link
                href="/shop"
                className="press h-12 px-6 bg-red text-white text-sm font-medium flex items-center gap-2 chamfer hover:bg-red-dim transition-colors"
              >
                Shop now <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/deals"
                className="press h-12 px-6 border border-white/20 text-sm font-medium flex items-center chamfer hover:border-white/40 transition-colors"
              >
                View deals
              </Link>
            </div>

            {/* Real numbers only — this used to claim "2,400+ SKUs" and a
                "4.8★" average, neither of which was true of the actual
                catalog. Computed from the live product list instead. */}
            <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6 max-w-sm">
              <div>
                <p className="font-mono text-xl font-semibold">{inStockCount}+</p>
                <p className="mono-label text-[10px] text-paper/50 mt-1">In stock now</p>
              </div>
              <div>
                <p className="font-mono text-xl font-semibold">24hr</p>
                <p className="mono-label text-[10px] text-paper/50 mt-1">Dispatch</p>
              </div>
              <div>
                <p className="font-mono text-xl font-semibold">{brandCount}+</p>
                <p className="mono-label text-[10px] text-paper/50 mt-1">Brands carried</p>
              </div>
            </div>
          </div>

          {/* One dominant hero shot with a single supporting photo behind
              it for depth — not a pile of overlapping fragments. The price
              card below points at the actual hero image, not an unrelated
              product. */}
          <div className="lg:col-span-7 relative h-[320px] sm:h-[400px] lg:h-[460px]">
            {supportingProduct && (
              <div className="absolute right-[4%] top-[6%] w-[52%] sm:w-[46%] aspect-square rotate-[4deg] chamfer-lg overflow-hidden bg-white shadow-xl ring-1 ring-white/10 z-0">
                <ProductImage
                  src={supportingProduct.image}
                  alt={supportingProduct.name}
                  fill
                  sizes="(max-width: 1024px) 40vw, 22vw"
                  className="object-contain p-6 opacity-90"
                />
              </div>
            )}
            <div className="absolute left-0 top-[8%] w-[62%] sm:w-[58%] aspect-square rotate-[-3deg] chamfer-lg overflow-hidden bg-white shadow-2xl ring-1 ring-white/10 z-10">
              <ProductImage
                src={heroProduct.image}
                alt={heroProduct.name}
                fill
                priority
                sizes="(max-width: 1024px) 55vw, 32vw"
                className="object-contain p-6"
              />
            </div>
            <div className="absolute -bottom-2 left-4 sm:left-10 bg-white text-void px-5 py-4 chamfer-sm shadow-2xl max-w-[260px] z-20">
              <p className="mono-label text-[10px] text-steel mb-1">{heroProduct.brand}</p>
              <p className="text-sm font-medium mb-2 leading-snug">{heroProduct.name}</p>
              <p className="font-mono text-lg font-semibold text-red">
                Rs. {heroProduct.price.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WELCOME — real trust copy, the "who is this shop" a visitor needs before category tiles ============ */}
      <section className="bg-white dark:bg-graphite py-14 text-center border-b border-line dark:border-white/10">
        <div className="mx-auto max-w-2xl px-4">
          <h2 className="font-display text-2xl font-semibold mb-3">Welcome to MF COM</h2>
          <p className="text-steel text-sm leading-relaxed">{storeInfo.tagline}</p>
        </div>
      </section>

      {/* ============ CATEGORY RAIL — Jarir pattern: browse-categories as its own rail ============ */}
      {/* This is the one orchestrated reveal on the page — the first thing a
          visitor scrolls into after the hero. Everything below plays it
          straight (no repeated fade-up), so this moment isn't diluted by
          five more identical copies of itself further down the page. */}
      <Reveal>
        <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-baseline justify-between mb-6">
            <h2 className="font-display text-display-md font-semibold">Shop by category</h2>
          </div>
          <StaggerGrid className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            {categoryGroups.map((group) => {
              const firstInGroup = allCategories.find((c) => c.group === group.group);
              const image = representativeImage(group.items);
              return (
                <StaggerItem key={group.group}>
                  <Link
                    href={firstInGroup ? `/category/${firstInGroup.slug}` : "/shop"}
                    className="group block bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer overflow-hidden hover:border-void dark:hover:border-white/30 hover:shadow-lg transition-all"
                  >
                    <div className="relative aspect-square bg-paper dark:bg-void/40 overflow-hidden">
                      {image ? (
                        <>
                          {/* Ambient glow, not a scaling photo — the photo
                              itself never moves or scales, so it can't read
                              as "zooming in"; the tile still feels alive via
                              the light behind it. */}
                          <div
                            aria-hidden
                            className="category-tile-glow absolute inset-0 m-auto w-2/3 h-2/3 rounded-full bg-red blur-2xl"
                          />
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={image}
                            alt=""
                            className="relative w-full h-full object-contain p-8 sm:p-10"
                          />
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="mono-label text-[10px] text-steel">{group.items.length} lines</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-medium text-sm mb-1 group-hover:text-red transition-colors">
                          {group.group}
                        </p>
                        <p className="text-xs text-steel line-clamp-1">{group.items.slice(0, 2).join(", ")}…</p>
                      </div>
                      <ArrowUpRight
                        size={16}
                        className="shrink-0 text-steel opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-red transition-all"
                      />
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerGrid>
        </section>
      </Reveal>

      {/* ============ FLASH SALE — only rendered when a promotion is actually live ============ */}
      {activePromotion && dealProducts.length > 0 && (
        <section className="bg-void text-paper py-14">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
              <div>
                <p className="mono-label text-xs text-red mb-3">{activePromotion.title}</p>
                <h2 className="font-display text-display-md font-semibold mb-2">
                  {activePromotion.message}
                </h2>
              </div>
              <CountdownTimer endsAt={activePromotion.endDate} />
            </div>
            <StaggerGrid className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
              {dealProducts.map((p) => (
                <StaggerItem key={p.id}>
                  <ProductCard product={p} />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </div>
        </section>
      )}

      {/* ============ BEST SELLERS — horizontal rail (Jarir pattern) ============ */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-display-md font-semibold">Best sellers</h2>
          <Link href="/shop" className="text-sm text-red font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <Carousel>
          {bestSellers.map((p) => (
            <div key={p.id} data-carousel-item className="w-[220px] sm:w-[260px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </Carousel>
      </section>

      {/* ============ NEW ARRIVALS — horizontal rail ============ */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="font-display text-display-md font-semibold">New arrivals</h2>
          <Link href="/shop" className="text-sm text-red font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ArrowUpRight size={14} />
          </Link>
        </div>
        <Carousel>
          {newArrivals.map((p) => (
            <div key={p.id} data-carousel-item className="w-[220px] sm:w-[260px] shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </Carousel>
      </section>

      {/* ============ BRAND STRIP — real authorized partners ============ */}
      <section className="border-y border-line dark:border-white/10 bg-white dark:bg-graphite py-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <p className="mono-label text-[10px] text-steel mb-4 text-center sm:text-left">
            Authorized dealer for
          </p>
          <div className="flex flex-wrap items-center justify-between gap-6">
            {storeInfo.brandPartners.map((b) => (
              <span key={b} className="mono-label text-sm text-steel/70 hover:text-void dark:hover:text-paper transition-colors">
                {b}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ============ TRUST / SERVICE — concrete, Jarir-style specific claims ============ */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Truck, title: "Fast dispatch", copy: "Same-day dispatch on orders placed before 4pm." },
          { icon: ShieldCheck, title: "Genuine stock", copy: "Authorized dealer — full manufacturer warranty, up to 3 years on electronics." },
          { icon: RotateCcw, title: "7-day returns", copy: "Change-of-mind returns on unopened items within 7 days." },
          { icon: Headphones, title: "Real support", copy: "WhatsApp or call, 11am-9:30pm — a person answers, not a bot." },
        ].map((item) => (
          <div key={item.title} className="flex gap-4">
            <div className="w-11 h-11 shrink-0 bg-void text-red flex items-center justify-center chamfer-sm">
              <item.icon size={20} />
            </div>
            <div>
              <p className="font-medium text-sm mb-1">{item.title}</p>
              <p className="text-xs text-steel">{item.copy}</p>
            </div>
          </div>
        ))}
      </section>
    </>
  );
}
