"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Heart,
  ShoppingCart,
  Menu,
  X,
  ChevronRight,
  Laptop,
  Cpu,
  Mouse,
  Wifi,
  Cable,
  Package,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import ThemeToggle from "@/components/storefront/ThemeToggle";
import SearchBox from "@/components/storefront/SearchBox";
import TrackOrderQuickEntry from "@/components/storefront/TrackOrderQuickEntry";

// Icon per nav group, matched by name with a sane fallback — group names
// come from the live categories table (admin-editable), not a fixed enum,
// so this can't assume every possible name is covered.
const GROUP_ICONS: Record<string, typeof Laptop> = {
  Computers: Laptop,
  Components: Cpu,
  Peripherals: Mouse,
  Networking: Wifi,
  Accessories: Cable,
};

export default function Header({
  whatsappDisplay,
  categoryGroups,
  categorySlugs,
}: {
  whatsappDisplay: string;
  categoryGroups: { group: string; items: string[] }[];
  categorySlugs: Record<string, string>;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count } = useCart();
  const { count: wishlistCount } = useWishlist();

  // Real slug when we have one; the old naive-slugify-the-name approach
  // only as a last resort, so a category the map doesn't know about yet
  // still links somewhere plausible rather than breaking entirely.
  function categoryHref(name: string) {
    const slug = categorySlugs[name] || name.toLowerCase().replace(/\s+/g, "-");
    return `/category/${slug}`;
  }

  // Cart-icon bump — a small, real micro-interaction (not decoration): it
  // confirms the add actually registered, the same instinct behind Jarir's
  // responsive-feeling UI even before anything else on the page changes.
  const [cartBump, setCartBump] = useState(false);
  const prevCount = useRef(count);
  useEffect(() => {
    if (count > prevCount.current) {
      setCartBump(true);
      const t = setTimeout(() => setCartBump(false), 400);
      return () => clearTimeout(t);
    }
    prevCount.current = count;
  }, [count]);

  // Same bump for wishlist — its only home now is a small icon buried in the
  // desktop row, so the add needs to register just as clearly as cart does.
  const [wishlistBump, setWishlistBump] = useState(false);
  const prevWishlistCount = useRef(wishlistCount);
  useEffect(() => {
    if (wishlistCount > prevWishlistCount.current) {
      setWishlistBump(true);
      const t = setTimeout(() => setWishlistBump(false), 400);
      return () => clearTimeout(t);
    }
    prevWishlistCount.current = wishlistCount;
  }, [wishlistCount]);

  return (
    <>
      {/* Announcement bar — real trust claims only (no invented delivery
          promises), and the WhatsApp number actually does something
          (tel: link) rather than sitting there as decoration. */}
      <div className="hidden sm:flex items-center justify-between bg-black text-paper/70 text-xs px-4 sm:px-6 lg:px-8 h-9">
        <p className="flex items-center gap-1.5">
          <ShieldCheck size={13} className="text-red" /> Genuine stock · Manufacturer warranty on eligible items
        </p>
        <a href={`tel:${whatsappDisplay.replace(/[^0-9+]/g, "")}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
          <MessageCircle size={13} className="text-red" /> Need help? {whatsappDisplay}
        </a>
      </div>

      <header className="sticky top-0 z-50 bg-void text-paper border-b border-white/10">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          <div className="flex h-[76px] items-center gap-6">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 -ml-2"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center" aria-label="MF COM home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-on-dark.png" alt="MF COM" className="h-14 w-auto" />
            </Link>

            {/* Categories trigger (desktop) */}
            <div
              className="hidden lg:block relative"
              onMouseEnter={() => setMenuOpen(true)}
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="flex items-center gap-2 h-[76px] px-1 text-sm font-medium tracking-wide"
                aria-expanded={menuOpen}
              >
                <span className="w-4 h-[2px] bg-red inline-block" />
                CATEGORIES
              </button>

              {/* Mega menu — grouped columns with an icon per group and a
                  fixed promo panel, closer to a real specialist-retailer
                  nav than a plain text dropdown. Every link uses the
                  category's actual stored slug now (see categoryHref
                  above) — this used to naively slugify the display name
                  instead, which silently broke for any name with
                  punctuation (e.g. "Networking & Wi-Fi" linked to a URL
                  containing a literal "&" that matched nothing). */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute left-0 top-full w-[860px] bg-void border border-white/10 border-t-2 border-t-red shadow-2xl flex"
                  >
                    <div className="flex-1 grid grid-cols-3 gap-x-8 gap-y-7 p-8">
                      {categoryGroups.map((group) => {
                        const Icon = GROUP_ICONS[group.group] || Package;
                        return (
                          <div key={group.group}>
                            <p className="flex items-center gap-2 mono-label text-[11px] text-red mb-3">
                              <Icon size={14} /> {group.group}
                            </p>
                            <ul className="space-y-2.5">
                              {group.items.map((item) => (
                                <li key={item}>
                                  <Link href={categoryHref(item)} className="text-sm text-paper/85 hover:text-red transition-colors">
                                    {item}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                    {/* Fixed promo panel — always deals/support, never a
                        specific claim that could go stale. */}
                    <div className="w-[220px] shrink-0 bg-white/[0.03] border-l border-white/10 p-6 flex flex-col justify-between">
                      <div>
                        <p className="mono-label text-[10px] text-red mb-2">This week</p>
                        <p className="text-sm text-paper/85 leading-relaxed mb-4">
                          Browse current markdowns across the whole catalog.
                        </p>
                        <Link href="/deals" className="text-sm font-medium text-red hover:underline">
                          View deals →
                        </Link>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <p className="text-xs text-paper/50 mb-2">Not sure what fits your setup?</p>
                        <a
                          href={`https://wa.me/${whatsappDisplay.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-sm font-medium text-green-400 hover:text-green-300"
                        >
                          <MessageCircle size={15} /> Ask on WhatsApp
                        </a>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Search — predictive suggestions as you type */}
            <div className="hidden md:flex flex-1 max-w-md">
              <SearchBox variant="desktop" />
            </div>

            <div className="flex items-center gap-1 ml-auto">
              {/* Fully built (form + /track/[orderNumber] page) but had no
                  entry point anywhere in the UI — only reachable by typing
                  the URL directly. This is its natural home: always
                  visible, same dark utility-row styling it was already
                  built for. */}
              <TrackOrderQuickEntry />
              <ThemeToggle />
              <Link
                href="/wishlist"
                className="hidden lg:flex p-2.5 hover:text-red transition-colors relative items-center justify-center"
                aria-label="Wishlist"
              >
                <motion.div animate={wishlistBump ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.4, ease: "easeOut" }}>
                  <Heart size={20} />
                </motion.div>
                {wishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <Link href="/cart" className="p-2.5 hover:text-red transition-colors relative" aria-label="Cart">
                <motion.div animate={cartBump ? { scale: [1, 1.35, 1] } : {}} transition={{ duration: 0.4, ease: "easeOut" }}>
                  <ShoppingCart size={20} />
                </motion.div>
                {count > 0 && (
                  <span className="absolute top-1 right-1 bg-red text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile search — always visible, not hidden behind a menu (Jarir-style: search must be one tap away), with predictive suggestions */}
          <div className="md:hidden pb-3">
            <SearchBox variant="mobile" />
          </div>
        </div>
      </header>

      {/* Cart recovery nudge — only real information (their own cart count),
          shown only when relevant, dismissible by just going to the cart. */}
      {count > 0 && pathname !== "/cart" && (
        <Link
          href="/cart"
          className="block bg-red/10 dark:bg-red/15 text-red text-xs sm:text-sm text-center py-2 px-4 hover:bg-red/15 dark:hover:bg-red/20 transition-colors"
        >
          You have {count} {count === 1 ? "item" : "items"} waiting in your cart — resume checkout →
        </Link>
      )}

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden fixed inset-0 z-40 bg-void text-paper overflow-y-auto thin-scroll pt-[76px]"
          >
            <div className="p-6 space-y-8">
              <Link
                href="/wishlist"
                className="flex items-center justify-between text-base py-1"
                onClick={() => setMobileOpen(false)}
              >
                <span className="flex items-center gap-3">
                  <Heart size={18} />
                  Wishlist
                </span>
                {wishlistCount > 0 && (
                  <span className="bg-red text-[10px] leading-none w-4 h-4 rounded-full flex items-center justify-center font-semibold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              <a
                href={`https://wa.me/${whatsappDisplay.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-base text-green-400"
              >
                <MessageCircle size={18} /> Ask on WhatsApp
              </a>

              {categoryGroups.map((group) => {
                const Icon = GROUP_ICONS[group.group] || Package;
                return (
                  <div key={group.group}>
                    <p className="flex items-center gap-2 mono-label text-[11px] text-red mb-3">
                      <Icon size={14} /> {group.group}
                    </p>
                    <ul className="space-y-3">
                      {group.items.map((item) => (
                        <li key={item}>
                          <Link href={categoryHref(item)} className="text-base" onClick={() => setMobileOpen(false)}>
                            {item}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
