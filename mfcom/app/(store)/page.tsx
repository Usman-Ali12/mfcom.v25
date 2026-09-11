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
  const featured = products[2] || products[0]; // ROG Strix RTX 4070 — highest-ticket item anchors the hero

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
      />
      {/* ============ HERO — spec-sheet layout, not a SaaS headline ============ */}
      <section className="bg-void text-paper">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 py-14 lg:py-20 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5">
            <p className="mono-label text-xs text-red mb-4">New drop — in stock now</p>
            <h1 className="font-display text-display-lg lg:text-display-xl font-semibold mb-6">
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

            {/* technical readout strip — echoes the subject's own vernacular */}
            <div className="grid grid-cols-3 gap-6 border-t border-white/10 pt-6 max-w-sm">
              <div>
                <p className="font-mono text-xl font-semibold">2,400+</p>
                <p className="mono-label text-[10px] text-paper/50 mt-1">SKUs in stock</p>
              </div>
              <div>
                <p className="font-mono text-xl font-semibold">24hr</p>
                <p className="mono-label text-[10px] text-paper/50 mt-1">Dispatch</p>
              </div>
              <div>
                <p className="font-mono text-xl font-semibold">4.8★</p>
                <p className="mono-label text-[10px] text-paper/50 mt-1">Avg. rating</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 relative">
            <div className="relative chamfer-lg overflow-hidden bg-graphite aspect-[16/10]">
              <ProductImage
                src="https://images.unsplash.com/photo-1591405351990-4726e331f141?w=1400&q=80"
                alt={featured.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-6 left-6 bg-white text-void px-5 py-4 chamfer-sm shadow-2xl max-w-[260px]">
              <p className="mono-label text-[10px] text-steel mb-1">{featured.brand}</p>
              <p className="text-sm font-medium mb-2 leading-snug">{featured.name}</p>
              <p className="font-mono text-lg font-semibold text-red">
                Rs. {featured.price.toLocaleString()}
              </p>
            </div>
          </div>
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
              return (
                <StaggerItem key={group.group}>
                  <Link
                    href={firstInGroup ? `/category/${firstInGroup.slug}` : "/shop"}
                    className="group block bg-white dark:bg-graphite border border-line dark:border-white/10 chamfer p-5 hover:border-void dark:hover:border-white/30 transition-colors"
                  >
                    <p className="mono-label text-[10px] text-red mb-2">{group.items.length} lines</p>
                    <p className="font-medium text-sm mb-1 group-hover:text-red transition-colors">
                      {group.group}
                    </p>
                    <p className="text-xs text-steel line-clamp-1">{group.items.slice(0, 2).join(", ")}…</p>
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
